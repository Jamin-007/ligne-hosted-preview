import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import worker from "../dist/server/index.js";

const clientRoot = resolve(import.meta.dirname, "..", "dist", "client");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

async function fetchAsset(request) {
  const url = new URL(request.url);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const relativePath = pathname.replace(/^\/+/, "");
  const filePath = resolve(clientRoot, relativePath);
  if (filePath !== clientRoot && !filePath.startsWith(`${clientRoot}${sep}`)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const body = await readFile(filePath);
    return new Response(body, {
      headers: {
        "content-type": contentTypes.get(extname(filePath).toLowerCase()) ?? "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

function json(value, status = 200, cacheControl = "no-store") {
  return Response.json(value, {
    status,
    headers: { "cache-control": cacheControl },
  });
}

function evmAddress(value) {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value)
    ? `0x${value.slice(2).toLowerCase()}`
    : null;
}

function parseUnits(value, decimals) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) throw new Error("INVALID_AMOUNT");
  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) throw new Error("INVALID_AMOUNT");
  const amount = BigInt(`${whole}${fraction.padEnd(decimals, "0")}`);
  if (amount <= 0n) throw new Error("INVALID_AMOUNT");
  return amount;
}

async function nativeApi(request) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/api/v1/health") {
    return json({
      status: "ok",
      service: "ligne-hosted-preview",
      assets: ["ETH", "USDC"],
      timestamp: new Date().toISOString(),
    });
  }

  if (request.method === "GET" && url.pathname === "/api/v1/wallet-config") {
    const projectId = process.env.REOWN_PROJECT_ID?.trim();
    return projectId
      ? json({ projectId }, 200, "public, max-age=300")
      : json({ error: { code: "WALLET_CONFIG_UNAVAILABLE", message: "WalletConnect indisponible." } }, 503);
  }

  if (request.method === "GET" && url.pathname === "/api/v1/deposit-address") {
    const address = evmAddress(process.env.MAINNET_RECEIVER_ADDRESS?.trim());
    return address
      ? json({ data: { address, assets: ["ETH", "USDC"], chain: "ethereum", chain_id: 1, mode: "MAINNET" } }, 200, "public, max-age=300")
      : json({ error: { message: "Configuration de réception indisponible." } }, 503);
  }

  if (request.method === "POST" && url.pathname === "/api/v1/transfer-requests") {
    try {
      const receiver = evmAddress(process.env.MAINNET_RECEIVER_ADDRESS?.trim());
      if (!receiver) return json({ error: { message: "Configuration de réception indisponible." } }, 503);
      const body = await request.json();
      const account = evmAddress(body?.account);
      if (!account) return json({ error: { message: "Wallet émetteur invalide." } }, 400);
      if (body?.asset !== "ETH" && body?.asset !== "USDC") {
        return json({ error: { message: "Actif non pris en charge." } }, 400);
      }
      if (typeof body?.amount !== "string") return json({ error: { message: "Montant requis." } }, 400);

      const decimals = body.asset === "ETH" ? 18 : 6;
      const amountRaw = parseUnits(body.amount, decimals);
      const value = `0x${amountRaw.toString(16)}`;
      const transaction = body.asset === "ETH"
        ? { from: account, to: receiver, value, data: "0x" }
        : {
            from: account,
            to: usdcAddress,
            value: "0x0",
            data: `0xa9059cbb${receiver.slice(2).padStart(64, "0")}${amountRaw.toString(16).padStart(64, "0")}`,
          };

      return json({ data: {
        request_id: `req_${crypto.randomUUID()}`,
        network: "Ethereum Mainnet",
        chain_id: 1,
        asset: body.asset,
        amount: body.amount.trim().replace(",", "."),
        transaction,
      } });
    } catch {
      return json({ error: { message: "Saisissez un montant positif valide." } }, 400);
    }
  }

  return null;
}

const executionContext = {
  passThroughOnException() {},
  waitUntil(promise) {
    void Promise.resolve(promise).catch((error) => console.error("Background task failed", error));
  },
};

const server = createServer(async (incoming, outgoing) => {
  try {
    const protocol = incoming.headers["x-forwarded-proto"] ?? "http";
    const host = incoming.headers.host ?? `127.0.0.1:${port}`;
    const init = {
      method: incoming.method,
      headers: incoming.headers,
    };
    if (incoming.method !== "GET" && incoming.method !== "HEAD") {
      init.body = Readable.toWeb(incoming);
      init.duplex = "half";
    }

    const request = new Request(`${protocol}://${host}${incoming.url ?? "/"}`, init);
    let response = await nativeApi(request);
    if (!response && (request.method === "GET" || request.method === "HEAD")) {
      const assetResponse = await fetchAsset(request);
      if (assetResponse.status !== 404) response = assetResponse;
    }
    response ??= await worker.fetch(
      request,
      { ...process.env, ASSETS: { fetch: fetchAsset } },
      executionContext,
    );

    outgoing.statusCode = response.status;
    response.headers.forEach((value, key) => outgoing.setHeader(key, value));
    if (!response.body || incoming.method === "HEAD") {
      outgoing.end();
      return;
    }
    Readable.fromWeb(response.body).pipe(outgoing);
  } catch (error) {
    console.error("Request failed", error);
    if (!outgoing.headersSent) outgoing.statusCode = 500;
    outgoing.end("Internal Server Error");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Ligne listening on 0.0.0.0:${port}`);
});
