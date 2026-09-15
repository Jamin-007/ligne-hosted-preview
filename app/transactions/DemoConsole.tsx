"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, ExternalLinkIcon } from "../Icons";

type Result = {
  state?: string;
  conversionId?: string;
  balance?: string;
  error?: string;
};

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? "Erreur API");
  return body.data;
}

export function DemoConsole() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>({});
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setWalletAddress(sessionStorage.getItem("ligne.wallet.address") ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function runDemo() {
    setLoading(true);
    setResult({ state: "QUOTE" });
    try {
      const userId = walletAddress ? `wallet-${walletAddress.toLowerCase()}` : `demo-${Date.now()}`;
      const quote = await api("/api/v1/quotes", {
        method: "POST", body: JSON.stringify({ user_id: userId, amount_in: "100" }),
      });
      setResult({ state: "SAFETY_ENGINE" });
      const conversion = await api("/api/v1/conversions", {
        method: "POST",
        body: JSON.stringify({
          quote_id: quote.quote_id, user_id: userId,
          wallet_address: walletAddress || "0x1111111111111111111111111111111111111111",
        }),
      });
      setResult({ state: "DEPOSIT_DETECTED", conversionId: conversion.conversion_id });
      await api(`/api/v1/conversions/${conversion.conversion_id}/transaction`, {
        method: "POST", body: JSON.stringify({ transaction_hash: `0x${"a".repeat(64)}` }),
      });
      await api(`/api/v1/conversions/${conversion.conversion_id}/process`, { method: "POST" });
      setResult({ state: "CONFIRMING · 1/2", conversionId: conversion.conversion_id });
      await api(`/api/v1/conversions/${conversion.conversion_id}/process`, { method: "POST" });
      setResult({ state: "CONFIRMING · 2/2", conversionId: conversion.conversion_id });
      const settled = await api(`/api/v1/conversions/${conversion.conversion_id}/process`, { method: "POST" });
      const balance = await api(`/api/v1/users/${userId}/eur-balance`);
      setResult({ state: settled.state, conversionId: conversion.conversion_id, balance: balance.balance });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Erreur API" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="backend-demo" aria-labelledby="backend-demo-title">
      <div>
        <p className="trust-card-kicker">Backend hébergé · mode simulé</p>
        <h2 id="backend-demo-title">Tester le pipeline serveur</h2>
        <p>Ce test appelle réellement l’API hébergée, enregistre la conversion, applique les règles, simule deux confirmations et écrit le crédit dans le ledger.</p>
      </div>
      <div className="backend-actions">
        <p className="wallet-source">
          {walletAddress ? `Wallet connecté : ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Mode démo sans wallet connecté"}
        </p>
        <button type="button" onClick={runDemo} disabled={loading}>
          {loading ? "Traitement en cours…" : <>Lancer une conversion test de 100 USDC <ArrowRightIcon /></>}
        </button>
        <p className={result.error ? "api-result error" : "api-result"} aria-live="polite">
          {result.error ?? (result.state ? `État : ${result.state}` : "API prête")}
        </p>
        {result.balance && <p className="settled-balance"><strong>{result.balance} EUR</strong><span>crédit ledger simulé</span></p>}
        {result.conversionId && <code>{result.conversionId}</code>}
        <a href="/api/v1/health" target="_blank" rel="noreferrer">Ouvrir le statut de l’API <ExternalLinkIcon /></a>
      </div>
    </section>
  );
}
