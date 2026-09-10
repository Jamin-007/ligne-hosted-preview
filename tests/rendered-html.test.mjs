import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const TEST_RECEIVER_ADDRESS = "0x2222222222222222222222222222222222222222";
const TEST_BITCOIN_ADDRESS = "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu";

async function requestWorker(pathname, init = {}, envOverrides = {}) {
  process.env.MAINNET_RECEIVER_ADDRESS = TEST_RECEIVER_ADDRESS;
  process.env.BITCOIN_RECEIVER_ADDRESS = envOverrides.BITCOIN_RECEIVER_ADDRESS
    ?? TEST_BITCOIN_ADDRESS;
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, init),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
      MAINNET_RECEIVER_ADDRESS: TEST_RECEIVER_ADDRESS,
      BITCOIN_RECEIVER_ADDRESS: TEST_BITCOIN_ADDRESS,
      ...envOverrides,
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

async function render(pathname) {
  return requestWorker(pathname, { headers: { accept: "text/html" } });
}

test("renders the Ligne Mainnet homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /enfin local/);
  assert.match(html, /XAF, NGN, GHS, ZAR/);
  assert.match(html, /MTN Mobile Money/);
  assert.match(html, /Trust Wallet/);
  assert.match(html, /Kenya/);
  assert.doesNotMatch(html, new RegExp(TEST_RECEIVER_ADDRESS, "i"));
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview/);
});

test("renders the conversion preview", async () => {
  const response = await render("/transactions");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Bitcoin \+ Ethereum Mainnet/);
  assert.match(html, /BTC · ETH/);
  assert.doesNotMatch(html, /USDT|USDC/);
  assert.match(html, /Réseaux séparés/);
  assert.match(html, /Où souhaitez-vous recevoir votre argent/);
  assert.match(html, /Choisissez un pays pour continuer/);
  assert.doesNotMatch(html, /Connecter avec WalletConnect/);
  assert.doesNotMatch(html, /Tester le pipeline serveur/);
});

test("serves a Render-compatible health check", async () => {
  const response = await requestWorker("/api/v1/health");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.deepEqual(body.assets, ["BTC", "ETH", "USDT", "USDC"]);
});

test("uses reliable document navigation for internal calls to action", async () => {
  const files = [
    "../app/AppChrome.tsx",
    "../app/page.tsx",
    "../app/transactions/page.tsx",
  ];
  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /next\/link|<Link\b/);
  }

  const home = await render("/");
  const html = await home.text();
  assert.match(html, /href="\/transactions"/);
});

test("loads the receiving address from runtime configuration", async () => {
  const route = await readFile(
    new URL("../app/api/v1/deposit-address/route.ts", import.meta.url),
    "utf8",
  );
  const transfer = await readFile(
    new URL("../lib/mainnet-transfer.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /env[\s\S]*MAINNET_RECEIVER_ADDRESS/);
  assert.match(route, /chain_id:\s*1/);
  assert.doesNotMatch(transfer, /MAINNET_RECEIVER_ADDRESS\s*=\s*getAddress/);
  assert.match(transfer, /0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/);
  assert.match(transfer, /0xdAC17F958D2ee523a2206206994597C13D831ec7/);
  assert.doesNotMatch(route, /PRIVATE_KEY|SEED_PHRASE/);
  assert.doesNotMatch(transfer, /PRIVATE_KEY|SEED_PHRASE/);
});

test("keeps token preparation server-side while the frontend exposes BTC and ETH", async () => {
  const transfer = await readFile(
    new URL("../lib/mainnet-transfer.ts", import.meta.url),
    "utf8",
  );
  const client = await readFile(
    new URL("../app/transactions/MainnetTransfer.tsx", import.meta.url),
    "utf8",
  );
  const translations = await readFile(
    new URL("../app/LanguageProvider.tsx", import.meta.url),
    "utf8",
  );
  assert.match(transfer, /parseEther/);
  assert.match(transfer, /parseUnits\(normalized, 6\)/);
  assert.match(transfer, /"ETH" \| "USDC" \| "USDT"/);
  assert.match(transfer, /MAINNET_USDT_ADDRESS/);
  assert.match(transfer, /functionName: "transfer"/);
  assert.match(client, /async function submitAndSign/);
  assert.doesNotMatch(client, /method: "eth_estimateGas"/);
  assert.match(client, /method: "eth_sendTransaction"/);
  assert.match(client, /method: "eth_getTransactionReceipt"/);
  assert.match(client, /api\/v1\/transfer-requests/);
  assert.match(client, /t\("transfer\.submit"\)/);
  assert.match(client, /t\("transfer\.confirmWallet"\)/);
  assert.match(client, /CASHBACK_PERCENT = 5n/);
  assert.match(client, /t\("transfer\.cashback"\)/);
  assert.match(client, /calculateCashback\(amount\)/);
  assert.match(client, /symbol: "BTC"/);
  assert.match(client, /symbol: "ETH"/);
  assert.doesNotMatch(client, /symbol: "USDT"|symbol: "USDC"/);
  assert.doesNotMatch(client, /<small>/);
  assert.match(client, /api\/v1\/bitcoin\/transfer-requests/);
  assert.match(client, /async function connectBitcoin/);
  assert.match(client, /@reown\/appkit-adapter-bitcoin/);
  assert.match(client, /getProvider<BitcoinWalletProvider>\("bip122"\)/);
  assert.match(client, /getAccountAddresses\(\)/);
  assert.match(client, /item\.type === "payment"/);
  assert.match(client, /syncBitcoinAccount\(modal/);
  assert.match(client, /subscribeProviders/);
  assert.match(client, /bitcoinWalletConnected/);
  assert.match(client, /error\.bitcoinAccountUnavailable/);
  assert.match(client, /asset === "BTC" && !bitcoinWalletConnected/);
  assert.match(client, /bitcoinProvider!\.sendTransfer/);
  assert.doesNotMatch(client, /connectTrustForBitcoin|connection_account|trust_wallet_url/);
  assert.doesNotMatch(client, /setConfirmed|transfer-confirmation/);
  assert.match(translations, /"transfer\.submit": "Vérifier dans mon wallet"/);
  assert.match(translations, /"transfer\.confirmWallet": "Confirmez dans votre wallet/);
  assert.match(translations, /"transfer\.cashback": "Cashback estimé"/);
  const server = await readFile(
    new URL("../app/api/v1/transfer-requests/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(server, /buildMainnetTransaction/);
  assert.match(server, /request_id/);
});

test("builds an Ethereum Mainnet USDT request and keeps BTC out of the EVM endpoint", async () => {
  const usdt = await requestWorker("/api/v1/transfer-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      account: "0x1111111111111111111111111111111111111111",
      asset: "USDT",
      amount: "12.34",
    }),
  });
  assert.equal(usdt.status, 200);
  const usdtBody = await usdt.json();
  assert.equal(usdtBody.data.asset, "USDT");
  assert.equal(usdtBody.data.transaction.to.toLowerCase(), "0xdac17f958d2ee523a2206206994597c13d831ec7");
  assert.match(usdtBody.data.transaction.data, /^0xa9059cbb/);

  const btc = await requestWorker("/api/v1/transfer-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      account: "0x1111111111111111111111111111111111111111",
      asset: "BTC",
      amount: "0.01",
    }),
  });
  assert.equal(btc.status, 400);
});

test("does not expose the Bitcoin receiver through a public address endpoint", async () => {
  const route = await readFile(
    new URL("../app/api/v1/deposit-address/route.ts", import.meta.url),
    "utf8",
  );
  const client = await readFile(
    new URL("../app/transactions/MainnetTransfer.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(route, /BITCOIN_RECEIVER_ADDRESS/);
  assert.doesNotMatch(client, /bitcoin\/deposit-address|deposit-address\?asset=BTC/);
  assert.doesNotMatch(client, /copyBitcoinAddress|bitcoin-deposit-address/);
});

test("prepares a native Bitcoin payment with an exact satoshi amount", async () => {
  const response = await requestWorker("/api/v1/bitcoin/transfer-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ account: TEST_BITCOIN_ADDRESS, amount: "0.00012345" }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.data.asset, "BTC");
  assert.equal(body.data.amount, "0.00012345");
  assert.equal(body.data.amount_sats, "12345");
  assert.equal(body.data.recipient_address, TEST_BITCOIN_ADDRESS);
  assert.match(body.data.request_id, /^btc_/);
});

test("rejects unsafe BTC precision and an invalid configured Bitcoin address", async () => {
  const invalidAccount = await requestWorker("/api/v1/bitcoin/transfer-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ account: "0x-not-a-bitcoin-wallet", amount: "0.01" }),
  });
  assert.equal(invalidAccount.status, 400);
  assert.equal((await invalidAccount.json()).error.code, "INVALID_BITCOIN_ACCOUNT");

  const overPrecise = await requestWorker("/api/v1/bitcoin/transfer-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ account: TEST_BITCOIN_ADDRESS, amount: "0.000000001" }),
  });
  assert.equal(overPrecise.status, 400);
  assert.equal((await overPrecise.json()).error.code, "INVALID_AMOUNT");

  const invalidReceiver = await requestWorker(
    "/api/v1/bitcoin/transfer-requests",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ account: TEST_BITCOIN_ADDRESS, amount: "0.01" }),
    },
    { BITCOIN_RECEIVER_ADDRESS: "bc1-not-a-valid-address" },
  );
  assert.equal(invalidReceiver.status, 503);
  assert.equal((await invalidReceiver.json()).error.code, "INVALID_BITCOIN_RECEIVER_ADDRESS");
});

test("prepares transactions from server-only receiver configuration", async () => {
  const server = await readFile(
    new URL("../app/api/v1/transfer-requests/route.ts", import.meta.url),
    "utf8",
  );
  const transfer = await readFile(
    new URL("../lib/mainnet-transfer.ts", import.meta.url),
    "utf8",
  );

  assert.match(server, /env[\s\S]*MAINNET_RECEIVER_ADDRESS/);
  assert.match(server, /buildMainnetTransaction\(account, asset, body\.amount, receiverAddress\)/);
  assert.match(transfer, /receiver = getAddress\(receiverAddress\)/);
  assert.match(transfer, /to: receiver/);
  assert.match(transfer, /args: \[receiver, amountRaw\]/);
  assert.doesNotMatch(server, new RegExp(TEST_RECEIVER_ADDRESS, "i"));
});

test("uses the Trust Wallet compatible optional namespace", async () => {
  const source = await readFile(new URL("../app/WalletConnectCard.tsx", import.meta.url), "utf8");
  assert.match(source, /optionalChains:\s*\[1\]/);
  assert.match(source, /personal_sign/);
  assert.match(source, /eth_sendTransaction/);
  assert.doesNotMatch(source, /optionalMethods:[^\n]*eth_getBalance/);
});

test("loads and displays the native balance after WalletConnect connects", async () => {
  const source = await readFile(new URL("../app/WalletConnectCard.tsx", import.meta.url), "utf8");
  const translations = await readFile(
    new URL("../app/LanguageProvider.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /method:\s*"eth_getBalance"/);
  assert.match(source, /params:\s*\[normalized,\s*"latest"\]/);
  assert.match(source, /balance\.value} ETH/);
  assert.match(source, /t\("wallet\.balanceUnavailable"\)/);
  assert.match(translations, /"wallet\.balanceUnavailable": "Solde indisponible"/);
});

test("includes compact mobile layouts for the site routes", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(max-width: 380px\)/);
  assert.match(css, /\.console-grid,[^}]*\.backend-demo/);
  assert.match(css, /\.real-transfer-heading,[^}]*\.transfer-grid/);
  assert.match(css, /\.rail::before/);
  assert.match(css, /\.wallet-body \.wallet-connect-button[^}]*min-height: 56px/);
  assert.match(css, /\.trust-home \{ width: 100%; max-width: 480px/);
  assert.match(css, /@keyframes trust-wallet-loop/);
});
