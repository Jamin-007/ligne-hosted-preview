import { env } from "cloudflare:workers";

type D1 = D1Database;

const RATE = 0.92;
const FEE = 0.5;
const REQUIRED_CONFIRMATIONS = 2;

function db(): D1 {
  if (!env.DB) throw new Error("D1_UNAVAILABLE");
  return env.DB;
}

export async function ensureSchema() {
  const database = db();
  await database.batch([
    database.prepare(`CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, amount_in TEXT NOT NULL,
      rate TEXT NOT NULL, fee TEXT NOT NULL, amount_out TEXT NOT NULL,
      expires_at TEXT NOT NULL, created_at TEXT NOT NULL
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS conversions (
      id TEXT PRIMARY KEY, quote_id TEXT NOT NULL, user_id TEXT NOT NULL,
      wallet_address TEXT NOT NULL, transaction_hash TEXT, state TEXT NOT NULL,
      confirmations INTEGER NOT NULL DEFAULT 0, required_confirmations INTEGER NOT NULL,
      safety_json TEXT NOT NULL, ledger_transaction_id TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY, transaction_id TEXT NOT NULL, conversion_id TEXT NOT NULL,
      account TEXT NOT NULL, side TEXT NOT NULL, amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL, created_at TEXT NOT NULL
    )`),
    database.prepare("CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON conversions(user_id)"),
    database.prepare("CREATE INDEX IF NOT EXISTS idx_ledger_account ON ledger_entries(account)"),
  ]);
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "cache-control": "no-store" } });
}

export function fail(code: string, message: string, status = 400) {
  return json({ error: { code, message } }, status);
}

export async function payload(request: Request) {
  try { return await request.json() as Record<string, unknown>; }
  catch { return null; }
}

export async function createQuote(request: Request) {
  const body = await payload(request);
  const userId = typeof body?.user_id === "string" ? body.user_id.trim() : "";
  const amount = typeof body?.amount_in === "string" ? Number(body.amount_in) : NaN;
  if (!userId || !Number.isFinite(amount) || amount <= FEE / RATE) {
    return fail("INVALID_REQUEST", "user_id et amount_in positif sont requis.");
  }
  await ensureSchema();
  const now = new Date();
  const quote = {
    quote_id: id("q"), user_id: userId, asset_in: "USDC", asset_out: "EUR",
    amount_in: amount.toFixed(2), rate: RATE.toFixed(4), fee: FEE.toFixed(2),
    amount_out: (amount * RATE - FEE).toFixed(2),
    expires_at: new Date(now.getTime() + 10 * 60_000).toISOString(),
    created_at: now.toISOString(), mode: "SIMULATED",
  };
  await db().prepare(`INSERT INTO quotes
    (id,user_id,amount_in,rate,fee,amount_out,expires_at,created_at)
    VALUES (?,?,?,?,?,?,?,?)`).bind(
      quote.quote_id, quote.user_id, quote.amount_in, quote.rate, quote.fee,
      quote.amount_out, quote.expires_at, quote.created_at,
    ).run();
  return json({ data: quote }, 201);
}

const checks = [
  "SUPPORTED_CHAIN", "SUPPORTED_TOKEN", "EXPECTED_TOKEN_CONTRACT",
  "EXPECTED_RECIPIENT", "EXPECTED_AMOUNT", "QUOTE_NOT_EXPIRED", "SIMULATION_SUCCESS",
];

export async function createConversion(request: Request) {
  const body = await payload(request);
  const quoteId = typeof body?.quote_id === "string" ? body.quote_id : "";
  const userId = typeof body?.user_id === "string" ? body.user_id.trim() : "";
  const wallet = typeof body?.wallet_address === "string" ? body.wallet_address : "";
  if (!quoteId || !userId || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return fail("INVALID_REQUEST", "quote_id, user_id et wallet_address EVM sont requis.");
  }
  await ensureSchema();
  const quote = await db().prepare("SELECT * FROM quotes WHERE id = ?").bind(quoteId).first<Record<string, string>>();
  if (!quote) return fail("QUOTE_NOT_FOUND", "Quote introuvable.", 404);
  if (quote.user_id !== userId) return fail("CONVERSION_CONFLICT", "Ce quote appartient à un autre utilisateur.", 409);
  if (Date.parse(quote.expires_at) < Date.now()) return fail("QUOTE_EXPIRED", "Le quote a expiré.", 409);
  const now = new Date().toISOString();
  const conversionId = id("cv");
  const safety = { decision: "ALLOW", rules: checks.map(rule => ({ rule, passed: true })) };
  await db().prepare(`INSERT INTO conversions
    (id,quote_id,user_id,wallet_address,state,confirmations,required_confirmations,safety_json,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(
      conversionId, quoteId, userId, wallet, "AWAITING_DEPOSIT", 0,
      REQUIRED_CONFIRMATIONS, JSON.stringify(safety), now, now,
    ).run();
  return json({ data: await presentConversion(conversionId) }, 201);
}

export async function registerTransaction(conversionId: string, request: Request) {
  const body = await payload(request);
  const hash = typeof body?.transaction_hash === "string" ? body.transaction_hash : "";
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) return fail("INVALID_REQUEST", "transaction_hash EVM invalide.");
  await ensureSchema();
  const row = await conversionRow(conversionId);
  if (!row) return fail("CONVERSION_NOT_FOUND", "Conversion introuvable.", 404);
  if (row.state !== "AWAITING_DEPOSIT") return fail("CONVERSION_CONFLICT", "État incompatible.", 409);
  await db().prepare("UPDATE conversions SET transaction_hash=?, updated_at=? WHERE id=?")
    .bind(hash, new Date().toISOString(), conversionId).run();
  return json({ data: await presentConversion(conversionId) }, 202);
}

export async function processConversion(conversionId: string) {
  await ensureSchema();
  const row = await conversionRow(conversionId);
  if (!row) return fail("CONVERSION_NOT_FOUND", "Conversion introuvable.", 404);
  if (!row.transaction_hash || row.state === "SETTLED") return json({ data: await presentConversion(conversionId) });
  let state = row.state;
  let confirmations = Number(row.confirmations);
  if (state === "AWAITING_DEPOSIT") state = "DETECTED";
  else if (confirmations < REQUIRED_CONFIRMATIONS) {
    confirmations += 1;
    state = confirmations >= REQUIRED_CONFIRMATIONS ? "CONFIRMED" : "CONFIRMING";
  }
  let ledgerId: string | null = row.ledger_transaction_id ?? null;
  if (state === "CONFIRMED") {
    state = "SETTLED";
    ledgerId = id("led");
    const quote = await db().prepare("SELECT * FROM quotes WHERE id=?").bind(row.quote_id).first<Record<string, string>>();
    const gross = Math.round(Number(quote?.amount_in ?? 0) * RATE * 100);
    const userAmount = Math.round(Number(quote?.amount_out ?? 0) * 100);
    const fee = gross - userAmount;
    const now = new Date().toISOString();
    await db().batch([
      db().prepare("INSERT INTO ledger_entries VALUES (?,?,?,?,?,?,?,?)").bind(id("le"), ledgerId, conversionId, "fx_clearing:eur", "DEBIT", gross, "EUR", now),
      db().prepare("INSERT INTO ledger_entries VALUES (?,?,?,?,?,?,?,?)").bind(id("le"), ledgerId, conversionId, `user:${row.user_id}:eur`, "CREDIT", userAmount, "EUR", now),
      db().prepare("INSERT INTO ledger_entries VALUES (?,?,?,?,?,?,?,?)").bind(id("le"), ledgerId, conversionId, "fee_revenue:eur", "CREDIT", fee, "EUR", now),
    ]);
  }
  await db().prepare("UPDATE conversions SET state=?, confirmations=?, ledger_transaction_id=?, updated_at=? WHERE id=?")
    .bind(state, confirmations, ledgerId, new Date().toISOString(), conversionId).run();
  return json({ data: await presentConversion(conversionId) });
}

type ConversionRow = Record<string, string | number | null>;
async function conversionRow(id: string) {
  return db().prepare("SELECT * FROM conversions WHERE id=?").bind(id).first<ConversionRow>();
}

export async function presentConversion(id: string) {
  const row = await conversionRow(id);
  if (!row) return null;
  const quote = await db().prepare("SELECT * FROM quotes WHERE id=?").bind(row.quote_id).first<Record<string, string>>();
  return {
    conversion_id: row.id, user_id: row.user_id, quote_id: row.quote_id,
    state: row.state, transaction_hash: row.transaction_hash,
    confirmations: Number(row.confirmations), required_confirmations: Number(row.required_confirmations),
    amount_in: `${quote?.amount_in ?? "0.00"} USDC`, amount_out: `${quote?.amount_out ?? "0.00"} EUR`,
    transaction_request: null, safety: JSON.parse(String(row.safety_json)),
    ledger_transaction_id: row.ledger_transaction_id, failure_reason: null,
    created_at: row.created_at, updated_at: row.updated_at, mode: "SIMULATED",
  };
}

export async function getConversion(id: string) {
  await ensureSchema();
  const conversion = await presentConversion(id);
  return conversion ? json({ data: conversion }) : fail("CONVERSION_NOT_FOUND", "Conversion introuvable.", 404);
}

export async function getBalance(userId: string) {
  await ensureSchema();
  const row = await db().prepare(`SELECT COALESCE(SUM(CASE WHEN side='CREDIT' THEN amount_cents ELSE -amount_cents END),0) balance
    FROM ledger_entries WHERE account=?`).bind(`user:${userId}:eur`).first<{ balance: number }>();
  return json({ data: { user_id: userId, currency: "EUR", balance: ((row?.balance ?? 0) / 100).toFixed(2), mode: "SIMULATED" } });
}

export async function getOperations() {
  await ensureSchema();
  const conversions = await db().prepare("SELECT id FROM conversions ORDER BY created_at DESC LIMIT 20").all<{ id: string }>();
  const ledger = await db().prepare("SELECT * FROM ledger_entries ORDER BY created_at DESC LIMIT 60").all();
  const totals = await db().prepare("SELECT side, COALESCE(SUM(amount_cents),0) total FROM ledger_entries GROUP BY side").all<{ side: string; total: number }>();
  const sums = Object.fromEntries(totals.results.map(item => [item.side, Number(item.total)]));
  const rendered = await Promise.all(conversions.results.map(item => presentConversion(item.id)));
  return json({ data: {
    mode: "SIMULATED", live_chain_enabled: false,
    rpc_providers: [{ name: "sepolia-rpc", status: "PENDING_CONFIGURATION" }],
    conversions: rendered, ledger: ledger.results,
    reconciliation: { balanced: (sums.DEBIT ?? 0) === (sums.CREDIT ?? 0), debit_cents: sums.DEBIT ?? 0, credit_cents: sums.CREDIT ?? 0 },
  }});
}

export function health() {
  return json({ status: "ok", service: "crypto-eur-demo-api", mode: "SIMULATED", live_chain_enabled: false, timestamp: new Date().toISOString() });
}
