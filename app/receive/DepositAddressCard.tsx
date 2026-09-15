"use client";

import { useEffect, useState } from "react";
import { AlertIcon, CheckIcon, CopyIcon, NetworkIcon } from "../Icons";

type DepositAddress = {
  address: string;
  assets: ["ETH", "USDC"];
  chain: "ethereum";
  chain_id: 1;
  mode: "MAINNET";
};

type State =
  | { status: "loading" }
  | { status: "ready"; deposit: DepositAddress }
  | { status: "error"; message: string };

export function DepositAddressCard() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/v1/deposit-address", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json() as {
          data?: DepositAddress;
          error?: { message?: string };
        };
        if (!response.ok || !body.data) {
          throw new Error(
            body.error?.message ?? "L’adresse de dépôt est indisponible.",
          );
        }
        setState({ status: "ready", deposit: body.data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error
            ? error.message
            : "L’adresse de dépôt est indisponible.",
        });
      });

    return () => controller.abort();
  }, []);

  async function copyAddress() {
    if (state.status !== "ready") return;
    await navigator.clipboard.writeText(state.deposit.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_600);
  }

  return (
    <section className="deposit-card" aria-labelledby="deposit-card-title">
      <div className="deposit-card-topline">
        <span>Adresse de collecte</span>
        <strong><NetworkIcon /> Ethereum Mainnet</strong>
      </div>

      <div className="deposit-card-body">
        <p className="micro-label">Actifs acceptés</p>
        <h2 id="deposit-card-title">ETH <span>+ USDC</span></h2>

        {state.status === "loading" && (
          <p className="deposit-loading" aria-live="polite">
            Chargement de l’adresse sécurisée…
          </p>
        )}

        {state.status === "error" && (
          <div className="deposit-unavailable" role="alert">
            <strong>Configuration requise</strong>
            <p>{state.message}</p>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <button
              className="deposit-address"
              type="button"
              onClick={() => void copyAddress()}
              aria-label="Copier l’adresse de réception Ethereum Mainnet"
            >
              <code>{state.deposit.address}</code>
              <span>{copied ? <><CheckIcon /> Adresse copiée</> : <><CopyIcon /> Copier</>}</span>
            </button>
            <dl className="deposit-facts">
              <div><dt>Réseau</dt><dd>Ethereum Mainnet</dd></div>
              <div><dt>Chain ID</dt><dd>{state.deposit.chain_id}</dd></div>
              <div><dt>Actifs</dt><dd>{state.deposit.assets.join(" · ")}</dd></div>
            </dl>
          </>
        )}

        <div className="deposit-warning">
          <AlertIcon />
          <div><strong>Valeur réelle : vérifiez le réseau.</strong>
          <p>
            Cette adresse accepte ETH et USDC uniquement sur Ethereum Mainnet.
            Un envoi sur un autre réseau peut entraîner une perte de fonds.
          </p></div>
        </div>
      </div>
    </section>
  );
}
