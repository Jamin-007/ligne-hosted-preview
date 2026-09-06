"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon, ExternalLinkIcon, LockIcon, WalletIcon } from "../Icons";
import { useLanguage, type TranslationKey } from "../LanguageProvider";
import {
  ETHEREUM_MAINNET_CHAIN_HEX,
  parseTransferAmount,
  type MainnetTransactionRequest,
  type TransferAsset,
} from "@/lib/mainnet-transfer";

type WalletProvider = {
  accounts: string[];
  connect(): Promise<void>;
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
};

type Receipt = {
  blockNumber: string;
  status: "0x0" | "0x1";
  transactionHash: `0x${string}`;
};

type PreparedTransfer = {
  request: MainnetTransactionRequest;
  requestId: string;
};

const CASHBACK_PERCENT = 5n;

function short(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function calculateCashback(amount: string) {
  const normalized = amount.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return "";
  const [whole, fraction = ""] = normalized.split(".");
  const raw = BigInt(`${whole}${fraction}`);
  if (raw <= 0n) return "";

  const cashbackRaw = raw * CASHBACK_PERCENT;
  const cashbackDecimals = fraction.length + 2;
  const padded = cashbackRaw.toString().padStart(cashbackDecimals + 1, "0");
  const integer = padded.slice(0, -cashbackDecimals) || "0";
  const decimals = padded.slice(-cashbackDecimals).replace(/0+$/, "");
  return decimals ? `${integer}.${decimals}` : integer;
}

function messageFor(error: unknown, t: (key: TranslationKey) => string) {
  const code = typeof error === "object" && error && "code" in error
    ? Number((error as { code: unknown }).code)
    : undefined;
  const nested = typeof error === "object" && error
    ? error as {
        message?: unknown;
        shortMessage?: unknown;
        details?: unknown;
        cause?: { message?: unknown };
        data?: { message?: unknown };
      }
    : {};
  const message = [
    nested.message,
    nested.shortMessage,
    nested.details,
    nested.cause?.message,
    nested.data?.message,
  ].filter((value): value is string => typeof value === "string").join(" ").toLowerCase();
  if (code === 4001 || code === 5000 || /reject|refus|denied|declined/.test(message)) {
    return t("error.rejected");
  }
  if (/insufficient|exceeds balance|funds|solde/.test(message)) {
    return t("error.insufficient");
  }
  if (message.includes("invalid_amount")) return t("error.invalidAmount");
  if (/failed to fetch|networkerror|wallet_config_unavailable/.test(message)) {
    return t("error.service");
  }
  return t("error.transaction");
}

export function MainnetTransfer() {
  const { t } = useLanguage();
  const providerRef = useRef<WalletProvider | null>(null);
  const [account, setAccount] = useState<`0x${string}`>();
  const [asset, setAsset] = useState<TransferAsset>("ETH");
  const [amount, setAmount] = useState("");
  const [prepared, setPrepared] = useState<PreparedTransfer>();
  const [hash, setHash] = useState<`0x${string}`>();
  const [receipt, setReceipt] = useState<Receipt>();
  const [status, setStatus] = useState<"idle" | "connecting" | "preparing" | "signing">("idle");
  const [error, setError] = useState("");

  const amountIsValid = useMemo(() => {
    try {
      parseTransferAmount(asset, amount);
      return true;
    } catch {
      return false;
    }
  }, [asset, amount]);
  const cashbackAmount = useMemo(() => calculateCashback(amount), [amount]);

  function resetTransfer() {
    setPrepared(undefined);
    setHash(undefined);
    setReceipt(undefined);
    setError("");
  }

  async function connect() {
    setStatus("connecting");
    setError("");
    try {
      const configResponse = await fetch("/api/v1/wallet-config", { cache: "no-store" });
      if (!configResponse.ok) throw new Error("WALLET_CONFIG_UNAVAILABLE");
      const config = await configResponse.json() as { projectId?: string };
      if (!config.projectId) throw new Error("WALLET_CONFIG_UNAVAILABLE");

      const { default: EthereumProvider } = await import("@walletconnect/ethereum-provider");
      const provider = await EthereumProvider.init({
        projectId: config.projectId,
        chains: [1],
        optionalChains: [1],
        showQrModal: true,
        methods: ["eth_sendTransaction", "personal_sign"],
        optionalMethods: [
          "eth_getBalance",
          "eth_getTransactionReceipt",
          "wallet_switchEthereumChain",
        ],
        events: ["chainChanged", "accountsChanged"],
        metadata: {
          name: "Ligne",
          description: "Transfert non dépositaire ETH et USDC sur Ethereum Mainnet.",
          url: window.location.origin,
          icons: [],
        },
      });
      await provider.connect();
      const address = provider.accounts[0];
      if (!address) throw new Error("NO_ACCOUNT");
      providerRef.current = provider as WalletProvider;
      setAccount(address.toLowerCase() as `0x${string}`);
      sessionStorage.setItem("ligne.wallet.address", address.toLowerCase());
    } catch (caught) {
      console.error("[Ligne WalletConnect] Connexion échouée", caught);
      setError(messageFor(caught, t));
    } finally {
      setStatus("idle");
    }
  }

  async function submitAndSign() {
    const provider = providerRef.current;
    if (!provider || !account) return;
    setError("");
    try {
      const chainId = await provider.request<string>({ method: "eth_chainId" });
      if (chainId !== ETHEREUM_MAINNET_CHAIN_HEX) {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ETHEREUM_MAINNET_CHAIN_HEX }],
        });
      }

      let nextPrepared = prepared;
      if (!nextPrepared) {
        setStatus("preparing");
        const response = await fetch("/api/v1/transfer-requests", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ account, asset, amount }),
        });
        const body = await response.json() as {
          data?: { request_id: string; transaction: MainnetTransactionRequest };
          error?: { message?: string };
        };
        if (!response.ok || !body.data) {
          throw new Error(body.error?.message ?? "REQUEST_PREPARATION_FAILED");
        }
        nextPrepared = { request: body.data.transaction, requestId: body.data.request_id };
        setPrepared(nextPrepared);
      }

      setStatus("signing");
      const transactionHash = await provider.request<`0x${string}`>({
        method: "eth_sendTransaction",
        params: [nextPrepared.request],
      });
      setHash(transactionHash);
    } catch (caught) {
      console.error("[Ligne Mainnet] Échec de la préparation ou de la signature", caught);
      setError(messageFor(caught, t));
    } finally {
      setStatus("idle");
    }
  }

  useEffect(() => {
    if (!hash || !providerRef.current || receipt) return;
    let stopped = false;
    const poll = async () => {
      try {
        const next = await providerRef.current?.request<Receipt | null>({
          method: "eth_getTransactionReceipt",
          params: [hash],
        });
        if (!stopped && next) setReceipt(next);
      } catch {
        // Le lien Etherscan reste disponible si le wallet interrompt le polling.
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 6_000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [hash, receipt]);

  return (
    <section className="real-transfer" aria-labelledby="real-transfer-title">
      <div className="real-transfer-heading">
        <div>
          <p className="trust-card-kicker"><LockIcon /> {t("transfer.nonCustodial")}</p>
          <h2 id="real-transfer-title">{t("transfer.title")}</h2>
        </div>
        <p>{t("transfer.explainer")}</p>
      </div>

      {!account ? (
        <div className="mainnet-connect">
          <div><strong>{t("transfer.sender")}</strong><span>{t("transfer.notConnected")}</span></div>
          <button className="connect-wallet-cta" type="button" onClick={() => void connect()} disabled={status === "connecting"}>
            <WalletIcon /> {status === "connecting" ? t("transfer.openingWallet") : <>{t("transfer.connect")} <ArrowRightIcon /></>}
          </button>
          {error && <p className="transfer-error" role="alert">{error}</p>}
        </div>
      ) : (
        <div className="transfer-grid">
          <div className="transfer-form">
            <div className="connected-sender"><span>{t("transfer.sender")}</span><strong>{short(account)}</strong></div>
            <fieldset disabled={Boolean(hash)}>
              <legend>{t("transfer.assetSent")}</legend>
              <div className="asset-switch">
                {(["ETH", "USDC"] as const).map((option) => (
                  <button
                    key={option}
                    className={asset === option ? "active" : ""}
                    type="button"
                    onClick={() => { setAsset(option); resetTransfer(); }}
                  >{option}</button>
                ))}
              </div>
              <label htmlFor="transfer-amount">{t("transfer.amount")}</label>
              <div className="mainnet-amount">
                <input
                  id="transfer-amount"
                  inputMode="decimal"
                  value={amount}
                  placeholder={asset === "ETH" ? "0.01" : "10.00"}
                  onChange={(event) => { setAmount(event.target.value); resetTransfer(); }}
                />
                <strong>{asset}</strong>
              </div>
              <div className="transfer-cashback" aria-live="polite">
                <span>{t("transfer.cashback")} <b>5 %</b></span>
                <strong>{cashbackAmount ? `+${cashbackAmount} ${asset}` : `— ${asset}`}</strong>
              </div>
            </fieldset>

            {!hash && (
              <button className="prepare-transfer" type="button" disabled={!amountIsValid || status !== "idle"} onClick={() => void submitAndSign()}>
                {status === "preparing"
                  ? t("transfer.preparing")
                  : status === "signing"
                    ? t("transfer.confirmWallet")
                    : prepared
                      ? <>{t("transfer.retry")} <ArrowRightIcon /></>
                      : <>{t("transfer.submit")} <ArrowRightIcon /></>}
              </button>
            )}
            {error && <p className="transfer-error" role="alert">{error}</p>}
          </div>

          <aside className="transfer-review">
            <p className="micro-label">{t("transfer.receipt")}</p>
            <dl>
              <div><dt>{t("transfer.network")}</dt><dd>Ethereum Mainnet · 1</dd></div>
              <div><dt>{t("transfer.asset")}</dt><dd>{asset}</dd></div>
              <div><dt>{t("transfer.amount")}</dt><dd>{amount || "—"} {asset}</dd></div>
              <div><dt>{t("transfer.destination")}</dt><dd>{t("transfer.inWallet")}</dd></div>
              {prepared && <div><dt>{t("transfer.request")}</dt><dd><code>{prepared.requestId}</code></dd></div>}
              <div><dt>{t("transfer.networkFees")}</dt><dd>{t("transfer.feesInWallet")}</dd></div>
            </dl>

            {hash && (
              <div className={`transfer-result ${receipt?.status === "0x1" ? "success" : receipt?.status === "0x0" ? "failed" : "pending"}`}>
                <strong>{receipt?.status === "0x1" ? t("transfer.confirmed") : receipt?.status === "0x0" ? t("transfer.failed") : t("transfer.sent")}</strong>
                <code>{hash}</code>
                <a href={`https://etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer">{t("transfer.etherscan")} <ExternalLinkIcon /></a>
                <button type="button" onClick={() => { setAmount(""); resetTransfer(); }}>{t("transfer.new")}</button>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
