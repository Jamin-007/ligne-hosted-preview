import {
  BITCOIN_MAINNET_CAIP2,
  buildBitcoinPaymentRequest,
  isValidBitcoinMainnetAddress,
} from "@/lib/bitcoin-payment";
import { getRuntimeEnv } from "@/lib/runtime-env";

type BitcoinTransferRequestBody = {
  account?: unknown;
  amount?: unknown;
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const env = await getRuntimeEnv();
    const receiverAddress = env.BITCOIN_RECEIVER_ADDRESS?.trim();
    if (!receiverAddress) {
      return json({ error: { code: "BITCOIN_RECEIVER_UNAVAILABLE", message: "Configuration de réception Bitcoin indisponible." } }, 503);
    }

    const body = await request.json() as BitcoinTransferRequestBody;
    if (typeof body.account !== "string" || !await isValidBitcoinMainnetAddress(body.account)) {
      return json({ error: { code: "INVALID_BITCOIN_ACCOUNT", message: "Wallet Bitcoin Mainnet invalide." } }, 400);
    }
    if (typeof body.amount !== "string") {
      return json({ error: { code: "INVALID_AMOUNT", message: "Montant BTC requis." } }, 400);
    }

    const payment = await buildBitcoinPaymentRequest(body.amount, receiverAddress);
    return json({
      data: {
        request_id: `btc_${crypto.randomUUID()}`,
        network: "Bitcoin Mainnet",
        chain: "bitcoin",
        chain_id: BITCOIN_MAINNET_CAIP2,
        asset: "BTC",
        amount: payment.amount,
        amount_sats: payment.amountSats,
        sender_address: body.account.trim(),
        recipient_address: payment.recipientAddress,
        payment_uri: payment.paymentUri,
        wallet_request: payment.walletRequest,
      },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "INVALID_AMOUNT") {
      return json({ error: { code, message: "Saisissez un montant BTC positif avec 8 décimales maximum." } }, 400);
    }
    if (code === "INVALID_BITCOIN_RECEIVER_ADDRESS") {
      return json({ error: { code, message: "L’adresse de réception Bitcoin Mainnet est invalide." } }, 503);
    }
    return json({ error: { code: "BITCOIN_REQUEST_FAILED", message: "La demande Bitcoin n’a pas pu être préparée." } }, 400);
  }
}
