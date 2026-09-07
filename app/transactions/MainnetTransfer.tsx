"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon, ExternalLinkIcon, LockIcon, WalletIcon } from "../Icons";
import { useLanguage, type TranslationKey } from "../LanguageProvider";
import {
  ETHEREUM_MAINNET_CHAIN_HEX,
  parseTransferAmount,
  type MainnetTransactionRequest,
  type TransferAsset,
} from "@/lib/mainnet-transfer";
import { isValidBitcoinMainnetAddress, parseBitcoinAmount } from "@/lib/bitcoin-payment";

type WalletProvider = {
  accounts: string[];
  connect(): Promise<void>;
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
};

type BitcoinWalletProvider = {
  getAccountAddresses(): Promise<Array<{
    address: string;
    purpose?: "payment" | "ordinal" | "stx";
  }>>;
  sendTransfer(params: { amount: string; recipient: string }): Promise<string>;
};

type BitcoinAccountState = {
  address?: string;
  allAccounts?: Array<{
    address: string;
    namespace?: string;
    type?: "payment" | "ordinal" | "stx";
  }>;
  isConnected: boolean;
  status?: "connecting" | "connected" | "disconnected" | "reconnecting";
};

type BitcoinAppKit = {
  getAddress(namespace: "bip122"): string | undefined;
  getAccount(namespace: "bip122"): BitcoinAccountState | undefined;
  getProvider<T>(namespace: "bip122"): T | undefined;
  open(options: { namespace: "bip122"; view: "Connect" }): Promise<unknown>;
  subscribeAccount(
    callback: (state: BitcoinAccountState) => void,
    namespace: "bip122",
  ): () => void;
  subscribeProviders(callback: () => void): () => void;
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

type PreparedBitcoinPayment = {
  amount: string;
  amountSats: string;
  recipientAddress: string;
  requestId: string;
};

type SelectableAsset = TransferAsset | "BTC";

const ASSET_OPTIONS: Array<{
  symbol: SelectableAsset;
  icon: string;
}> = [
  { symbol: "BTC", icon: "/wallet-assets/btc.svg" },
  { symbol: "ETH", icon: "/wallet-assets/eth.svg" },
  { symbol: "USDT", icon: "/wallet-assets/usdt.svg" },
  { symbol: "USDC", icon: "/wallet-assets/usdc.svg" },
];

const CASHBACK_PERCENT = 5n;

let bitcoinAppKitPromise: Promise<BitcoinAppKit> | undefined;

async function getBitcoinAppKit(projectId: string) {
  if (!bitcoinAppKitPromise) {
    bitcoinAppKitPromise = Promise.all([
      import("@reown/appkit"),
      import("@reown/appkit-adapter-bitcoin"),
      import("@reown/appkit/networks"),
    ]).then(([{ createAppKit }, { BitcoinAdapter }, { bitcoin }]) => createAppKit({
      adapters: [new BitcoinAdapter({ projectId })],
      networks: [bitcoin],
      defaultNetwork: bitcoin,
      defaultAccountTypes: { bip122: "payment" },
      projectId,
      metadata: {
        name: "Ligne",
        description: "Transfert BTC non dépositaire sur Bitcoin Mainnet.",
        url: window.location.origin,
        icons: [],
      },
      features: { analytics: false, email: false, socials: [] },
    }) as unknown as BitcoinAppKit).catch((error) => {
      bitcoinAppKitPromise = undefined;
      throw error;
    });
  }
  return bitcoinAppKitPromise;
}

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
  if (/bitcoin_receiver_unavailable|invalid_bitcoin_receiver_address/.test(message)) {
    return t("error.bitcoinConfig");
  }
  if (/invalid_bitcoin_account|bitcoin_wallet_unavailable/.test(message)) {
    return t("error.bitcoinWallet");
  }
  if (/failed to fetch|networkerror|wallet_config_unavailable/.test(message)) {
    return t("error.service");
  }
  return t("error.transaction");
}

export function MainnetTransfer() {
  const { t } = useLanguage();
  const providerRef = useRef<WalletProvider | null>(null);
  const bitcoinAppKitRef = useRef<BitcoinAppKit | null>(null);
  const bitcoinUnsubscribeRef = useRef<(() => void) | null>(null);
  const [account, setAccount] = useState<`0x${string}`>();
  const [bitcoinAccount, setBitcoinAccount] = useState<string>();
  const [asset, setAsset] = useState<SelectableAsset>("USDT");
  const [amount, setAmount] = useState("");
  const [prepared, setPrepared] = useState<PreparedTransfer>();
  const [bitcoinPayment, setBitcoinPayment] = useState<PreparedBitcoinPayment>();
  const [bitcoinTxId, setBitcoinTxId] = useState<string>();
  const [hash, setHash] = useState<`0x${string}`>();
  const [receipt, setReceipt] = useState<Receipt>();
  const [status, setStatus] = useState<"idle" | "connecting" | "preparing" | "signing">("idle");
  const [error, setError] = useState("");

  const amountIsValid = useMemo(() => {
    try {
      if (asset === "BTC") {
        parseBitcoinAmount(amount);
        return true;
      }
      parseTransferAmount(asset, amount);
      return true;
    } catch {
      return false;
    }
  }, [asset, amount]);
  const cashbackAmount = useMemo(() => calculateCashback(amount), [amount]);

  function resetTransfer() {
    setPrepared(undefined);
    setBitcoinPayment(undefined);
    setBitcoinTxId(undefined);
    setHash(undefined);
    setReceipt(undefined);
    setError("");
  }

  async function syncBitcoinAccount(
    modal: BitcoinAppKit,
    state = modal.getAccount("bip122"),
  ) {
    const stateAddress = state?.address
      ?? state?.allAccounts?.find((item) => item.type === "payment")?.address
      ?? state?.allAccounts?.find((item) => item.namespace === "bip122")?.address
      ?? modal.getAddress("bip122");

    if (stateAddress && await isValidBitcoinMainnetAddress(stateAddress)) {
      setBitcoinAccount(stateAddress);
      sessionStorage.setItem("ligne.bitcoin.address", stateAddress);
      return true;
    }

    const provider = modal.getProvider<BitcoinWalletProvider>("bip122");
    if (provider?.getAccountAddresses) {
      try {
        const accounts = await provider.getAccountAddresses();
        const paymentAccount = accounts.find((item) => item.purpose === "payment")
          ?? accounts[0];
        if (paymentAccount && await isValidBitcoinMainnetAddress(paymentAccount.address)) {
          setBitcoinAccount(paymentAccount.address);
          sessionStorage.setItem("ligne.bitcoin.address", paymentAccount.address);
          return true;
        }
      } catch {
        // Certains connecteurs ne proposent que l'adresse active via AppKit.
      }
    }

    if (state?.status === "disconnected") {
      setBitcoinAccount(undefined);
      sessionStorage.removeItem("ligne.bitcoin.address");
    }
    return false;
  }

  async function prepareBitcoinPayment() {
    const bitcoinProvider = bitcoinAppKitRef.current?.getProvider<BitcoinWalletProvider>("bip122");
    if (asset !== "BTC" || !bitcoinAccount || !bitcoinProvider) {
      setError(t("error.bitcoinWallet"));
      return;
    }
    setStatus("preparing");
    setError("");
    try {
      const response = await fetch("/api/v1/bitcoin/transfer-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ account: bitcoinAccount, amount }),
      });
      const body = await response.json() as {
        data?: {
          amount: string;
          amount_sats: string;
          recipient_address: string;
          request_id: string;
        };
        error?: { code?: string };
      };
      if (!response.ok || !body.data) {
        throw new Error(body.error?.code ?? "BITCOIN_REQUEST_FAILED");
      }
      setBitcoinPayment({
        amount: body.data.amount,
        amountSats: body.data.amount_sats,
        recipientAddress: body.data.recipient_address,
        requestId: body.data.request_id,
      });
      setStatus("signing");
      const transactionId = await bitcoinProvider.sendTransfer({
        amount: body.data.amount_sats,
        recipient: body.data.recipient_address,
      });
      if (!transactionId) throw new Error("BITCOIN_TRANSACTION_FAILED");
      setBitcoinTxId(transactionId);
    } catch (caught) {
      console.error("[Ligne Bitcoin] Échec de la préparation", caught);
      setError(messageFor(caught, t));
    } finally {
      setStatus("idle");
    }
  }

  async function connectBitcoin() {
    setStatus("connecting");
    setError("");
    try {
      const configResponse = await fetch("/api/v1/wallet-config", { cache: "no-store" });
      if (!configResponse.ok) throw new Error("WALLET_CONFIG_UNAVAILABLE");
      const config = await configResponse.json() as { projectId?: string };
      if (!config.projectId) throw new Error("WALLET_CONFIG_UNAVAILABLE");

      const modal = await getBitcoinAppKit(config.projectId);
      bitcoinAppKitRef.current = modal;
      bitcoinUnsubscribeRef.current?.();
      const unsubscribeAccount = modal.subscribeAccount((next) => {
        void syncBitcoinAccount(modal, next);
      }, "bip122");
      const unsubscribeProviders = modal.subscribeProviders(() => {
        void syncBitcoinAccount(modal);
      });
      bitcoinUnsubscribeRef.current = () => {
        unsubscribeAccount();
        unsubscribeProviders();
      };

      const current = modal.getAccount("bip122");
      if (await syncBitcoinAccount(modal, current)) {
        return;
      }
      await modal.open({ view: "Connect", namespace: "bip122" });
      await syncBitcoinAccount(modal);
    } catch (caught) {
      console.error("[Ligne Bitcoin] Connexion wallet échouée", caught);
      setError(messageFor(caught, t));
    } finally {
      setStatus("idle");
    }
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
          description: "Transfert non dépositaire ETH, USDT et USDC sur Ethereum Mainnet.",
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
    if (!provider || !account || asset === "BTC") return;
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

  useEffect(() => () => bitcoinUnsubscribeRef.current?.(), []);

  return (
    <section className="real-transfer" aria-labelledby="real-transfer-title">
      <div className="real-transfer-heading">
        <div>
          <p className="trust-card-kicker"><LockIcon /> {t("transfer.nonCustodial")}</p>
          <h2 id="real-transfer-title">{t("transfer.title")}</h2>
        </div>
        <p>{t("transfer.explainer")}</p>
      </div>

      <div className="transfer-asset-selector">
        <p className="micro-label">{t("transfer.assetSent")}</p>
        <div className="asset-switch" role="group" aria-label={t("transfer.assetSent")}>
          {ASSET_OPTIONS.map((option) => (
            <button
              key={option.symbol}
              className={asset === option.symbol ? `active asset-${option.symbol.toLowerCase()}` : `asset-${option.symbol.toLowerCase()}`}
              type="button"
              aria-pressed={asset === option.symbol}
              onClick={() => { setAsset(option.symbol); setAmount(""); resetTransfer(); }}
            >
              <Image src={option.icon} alt="" width={30} height={30} />
              <strong>{option.symbol}</strong>
            </button>
          ))}
        </div>
      </div>

      {asset === "BTC" && !bitcoinAccount ? (
        <div className="mainnet-connect bitcoin-connect">
          <div><strong>{t("transfer.sender")}</strong><span>{t("transfer.notConnected")}</span></div>
          <button className="connect-wallet-cta" type="button" onClick={() => void connectBitcoin()} disabled={status === "connecting"}>
            <WalletIcon /> {status === "connecting" ? t("transfer.openingWallet") : <>{t("transfer.connectBitcoin")} <ArrowRightIcon /></>}
          </button>
          {error && <p className="transfer-error" role="alert">{error}</p>}
        </div>
      ) : asset === "BTC" ? (
        <div className="transfer-grid bitcoin-transfer-grid">
          <div className="transfer-form">
            <div className="connected-sender"><span>{t("transfer.sender")}</span><strong>{bitcoinAccount ? short(bitcoinAccount) : ""}</strong></div>
            <div className="bitcoin-transfer-intro">
              <Image src="/wallet-assets/btc.svg" alt="" width={54} height={54} />
              <div>
                <span>{t("transfer.bitcoinReadyBadge")}</span>
                <strong>{t("transfer.bitcoinReadyTitle")}</strong>
                <p>{t("transfer.bitcoinReadyText")}</p>
              </div>
            </div>
            <fieldset disabled={Boolean(bitcoinTxId)}>
              <label htmlFor="bitcoin-transfer-amount">{t("transfer.amount")}</label>
              <div className="mainnet-amount">
                <input
                  id="bitcoin-transfer-amount"
                  inputMode="decimal"
                  value={amount}
                  placeholder="0.001"
                  onChange={(event) => { setAmount(event.target.value); resetTransfer(); }}
                />
                <strong>BTC</strong>
              </div>
              <div className="transfer-cashback" aria-live="polite">
                <span>{t("transfer.cashback")} <b>5 %</b></span>
                <strong>{cashbackAmount ? `+${cashbackAmount} BTC` : "— BTC"}</strong>
              </div>
            </fieldset>
            {!bitcoinTxId && (
              <button
                className="prepare-transfer bitcoin-prepare"
                type="button"
                disabled={!amountIsValid || status !== "idle"}
                onClick={() => void prepareBitcoinPayment()}
              >
                {status === "preparing"
                  ? t("transfer.bitcoinPreparing")
                  : status === "signing"
                    ? t("transfer.confirmWallet")
                    : bitcoinPayment
                      ? <>{t("transfer.retry")} <ArrowRightIcon /></>
                      : <>{t("transfer.bitcoinPrepare")} <ArrowRightIcon /></>}
              </button>
            )}
            {error && <p className="transfer-error" role="alert">{error}</p>}
          </div>
          <aside className="transfer-review">
            <p className="micro-label">{t("transfer.receipt")}</p>
            <dl>
              <div><dt>{t("transfer.network")}</dt><dd>{t("transfer.bitcoinNetwork")}</dd></div>
              <div><dt>{t("transfer.asset")}</dt><dd>BTC</dd></div>
              <div><dt>{t("transfer.amount")}</dt><dd>{(bitcoinPayment?.amount ?? amount) || "—"} BTC</dd></div>
              <div><dt>{t("transfer.destination")}</dt><dd>{bitcoinPayment ? short(bitcoinPayment.recipientAddress) : t("transfer.inWallet")}</dd></div>
              {bitcoinPayment && <div><dt>{t("transfer.satoshis")}</dt><dd>{bitcoinPayment.amountSats}</dd></div>}
              {bitcoinPayment && <div><dt>{t("transfer.request")}</dt><dd><code>{bitcoinPayment.requestId}</code></dd></div>}
              <div><dt>{t("transfer.networkFees")}</dt><dd>{t("transfer.feesInWallet")}</dd></div>
            </dl>
            {bitcoinTxId && (
              <div className="transfer-result bitcoin-result success" role="status">
                <strong>{t("transfer.bitcoinSent")}</strong>
                <code>{bitcoinTxId}</code>
                <a href={`https://mempool.space/tx/${bitcoinTxId}`} target="_blank" rel="noreferrer">{t("transfer.bitcoinExplorer")} <ExternalLinkIcon /></a>
                <button type="button" onClick={() => { setAmount(""); resetTransfer(); }}>{t("transfer.new")}</button>
              </div>
            )}
          </aside>
        </div>
      ) : !account ? (
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
              <div><dt>{t("transfer.network")}</dt><dd>{t("transfer.ethereumNetwork")} · 1</dd></div>
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
