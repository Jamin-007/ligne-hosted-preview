"use client";

import { useRef, useState } from "react";
import { ArrowRightIcon, ArrowUpRightIcon, WalletIcon } from "./Icons";
import { useLanguage } from "./LanguageProvider";

type WalletProvider = {
  accounts: string[];
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
};

type BalanceState =
  | { status: "idle" | "loading" }
  | { status: "success"; value: string }
  | { status: "error" };

function short(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatEtherBalance(hexValue: string) {
  const wei = BigInt(hexValue);
  const ether = 10n ** 18n;
  const whole = wei / ether;
  const fraction = (wei % ether)
    .toString()
    .padStart(18, "0")
    .slice(0, 6)
    .replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export function WalletConnectCard() {
  const { t } = useLanguage();
  const providerRef = useRef<WalletProvider | null>(null);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [balance, setBalance] = useState<BalanceState>({ status: "idle" });
  const [message, setMessage] = useState("");

  async function connect() {
    setStatus("connecting");
    setMessage("");
    try {
      const configResponse = await fetch("/api/v1/wallet-config", { cache: "no-store" });
      if (!configResponse.ok) throw new Error("CONFIG_UNAVAILABLE");
      const config = await configResponse.json() as { projectId?: string };
      if (!config.projectId) throw new Error("CONFIG_PROJECT_ID_MISSING");

      const { default: EthereumProvider } = await import("@walletconnect/ethereum-provider");
      const provider = await EthereumProvider.init({
        projectId: config.projectId,
        optionalChains: [1],
        showQrModal: true,
        optionalMethods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
        optionalEvents: ["chainChanged", "accountsChanged"],
        customStoragePrefix: "ligne-trust-v2",
        metadata: {
          name: "Ligne",
          url: window.location.origin,
          icons: [],
        },
      });
      providerRef.current = provider as WalletProvider;
      await provider.connect();
      const account = provider.accounts[0];
      if (!account) throw new Error("NO_ACCOUNT");
      const normalized = account.toLowerCase();
      setAddress(normalized);
      sessionStorage.setItem("ligne.wallet.address", normalized);
      setStatus("connected");
      setBalance({ status: "loading" });

      try {
        const balanceHex = await provider.request<string>({
          method: "eth_getBalance",
          params: [normalized, "latest"],
        });
        setBalance({ status: "success", value: formatEtherBalance(balanceHex) });
      } catch {
        setBalance({ status: "error" });
      }
    } catch (error) {
      setStatus("error");
      setBalance({ status: "idle" });
      setMessage(
        error instanceof Error && error.message.includes("CONFIG")
          ? t("wallet.notConfigured")
          : t("wallet.cancelled"),
      );
    }
  }

  async function disconnect() {
    try { await providerRef.current?.disconnect(); } catch { /* session déjà fermée */ }
    providerRef.current = null;
    sessionStorage.removeItem("ligne.wallet.address");
    setAddress("");
    setStatus("idle");
    setBalance({ status: "idle" });
    setMessage("");
  }

  return (
      <aside className={`wallet-card ${status === "connected" ? "is-connected" : ""}`} aria-label="WalletConnect Ethereum Mainnet">
      <div className="card-top">
        <strong>{t("wallet.label")}</strong>
        <span><i /> {status === "connected" ? t("wallet.connected") : t("wallet.secure")}</span>
      </div>
      <div className="wallet-body">
        <div className="wallet-icon walletconnect-mark" aria-hidden="true"><WalletIcon /></div>
        <p className="card-kicker">WalletConnect · Mainnet</p>
        {status === "connected" ? (
          <>
            <h2>{short(address)}</h2>
            <p className={`mainnet-balance ${balance.status === "error" ? "has-error" : ""}`} aria-live="polite">
              <strong>
                {balance.status === "success"
                  ? `${balance.value} ETH`
                  : balance.status === "error"
                    ? t("wallet.balanceUnavailable")
                    : t("wallet.loading")}
              </strong>
              <span>{balance.status === "success" ? t("wallet.mainnetBalance") : "Ethereum Mainnet"}</span>
            </p>
            <p>{t("wallet.recognized")}</p>
            <div className="wallet-card-actions">
              <a href="/transactions">{t("wallet.testConversion")} <ArrowRightIcon /></a>
              <button type="button" onClick={() => void disconnect()}>{t("wallet.disconnect")}</button>
            </div>
          </>
        ) : (
          <>
            <h2>{t("wallet.connectTitle")}</h2>
            <p>{t("wallet.scan")}</p>
            <button className="wallet-connect-button walletconnect-button" type="button" onClick={() => void connect()} disabled={status === "connecting"}>
              {status === "connecting" ? t("wallet.opening") : t("wallet.open")}<ArrowUpRightIcon />
            </button>
            {message && <p className="wallet-error" role="alert">{message}</p>}
          </>
        )}
      </div>
    </aside>
  );
}
