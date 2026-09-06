import { getAddress, isAddress } from "viem";
import { buildMainnetTransaction, type TransferAsset } from "@/lib/mainnet-transfer";
import { getRuntimeEnv } from "@/lib/runtime-env";

type TransferRequestBody = {
  account?: string;
  asset?: string;
  amount?: string;
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const env = await getRuntimeEnv();
    const receiverAddress = env.MAINNET_RECEIVER_ADDRESS?.trim();
    if (!receiverAddress) {
      return json({ error: { message: "Configuration de réception indisponible." } }, 503);
    }

    const body = await request.json() as TransferRequestBody;
    if (!body.account || !isAddress(body.account)) {
      return json({ error: { message: "Wallet émetteur invalide." } }, 400);
    }
    if (body.asset !== "ETH" && body.asset !== "USDC") {
      return json({ error: { message: "Actif non pris en charge." } }, 400);
    }
    if (!body.amount) {
      return json({ error: { message: "Montant requis." } }, 400);
    }

    const account = getAddress(body.account) as `0x${string}`;
    const asset = body.asset as TransferAsset;
    const transaction = buildMainnetTransaction(account, asset, body.amount, receiverAddress);

    return json({
      data: {
        request_id: `req_${crypto.randomUUID()}`,
        network: "Ethereum Mainnet",
        chain_id: 1,
        asset,
        amount: body.amount.trim().replace(",", "."),
        transaction,
      },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const unavailable = code === "RECEIVER_ADDRESS_UNAVAILABLE";
    const message = code === "INVALID_AMOUNT"
      ? "Saisissez un montant positif valide."
      : unavailable ? "Configuration de réception indisponible." : "La demande n’a pas pu être préparée.";
    return json({ error: { message } }, unavailable ? 503 : 400);
  }
}
