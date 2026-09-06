import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const TEST_RECEIVER_ADDRESS = "0x2222222222222222222222222222222222222222";

async function requestWorker(pathname, init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, init),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
      MAINNET_RECEIVER_ADDRESS: TEST_RECEIVER_ADDRESS,
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
  assert.match(html, /ETH \+ USDC · Ethereum Mainnet/);
  assert.match(html, /Valeur réelle/);
  assert.match(html, /Où souhaitez-vous recevoir votre argent/);
  assert.match(html, /Choisissez un pays pour continuer/);
  assert.doesNotMatch(html, /Connecter avec WalletConnect/);
  assert.doesNotMatch(html, /Tester le pipeline serveur/);
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
  assert.doesNotMatch(route, /PRIVATE_KEY|SEED_PHRASE/);
  assert.doesNotMatch(transfer, /PRIVATE_KEY|SEED_PHRASE/);
});

test("prepares ETH and USDC transfers for wallet signature", async () => {
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
  assert.doesNotMatch(client, /setConfirmed|transfer-confirmation/);
  assert.match(translations, /"transfer\.submit": "Soumettre et signer"/);
  assert.match(translations, /"transfer\.confirmWallet": "Confirmez dans votre wallet/);
  assert.match(translations, /"transfer\.cashback": "Cashback estimé"/);
  const server = await readFile(
    new URL("../app/api/v1/transfer-requests/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(server, /buildMainnetTransaction/);
  assert.match(server, /request_id/);
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
