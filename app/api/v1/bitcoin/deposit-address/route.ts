import {
  BITCOIN_MAINNET_CAIP2,
  isValidBitcoinMainnetAddress,
} from "@/lib/bitcoin-payment";
import { getRuntimeEnv } from "@/lib/runtime-env";

export async function GET() {
  const env = await getRuntimeEnv();
  const address = env.BITCOIN_RECEIVER_ADDRESS?.trim();
  if (!address) {
    return Response.json(
      { error: { code: "BITCOIN_RECEIVER_UNAVAILABLE", message: "Configuration de réception Bitcoin indisponible." } },
      { status: 503 },
    );
  }
  if (!await isValidBitcoinMainnetAddress(address)) {
    return Response.json(
      { error: { code: "INVALID_BITCOIN_RECEIVER_ADDRESS", message: "Configuration de réception Bitcoin invalide." } },
      { status: 503 },
    );
  }

  return Response.json(
    {
      data: {
        address,
        asset: "BTC",
        chain: "bitcoin",
        chain_id: BITCOIN_MAINNET_CAIP2,
        mode: "MAINNET",
      },
    },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
