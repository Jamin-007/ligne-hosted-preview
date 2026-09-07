import { getAddress } from "viem";
import { getRuntimeEnv } from "@/lib/runtime-env";

export async function GET() {
  const env = await getRuntimeEnv();
  const configuredAddress = env.MAINNET_RECEIVER_ADDRESS?.trim();
  if (!configuredAddress) {
    return Response.json({ error: { message: "Configuration de réception indisponible." } }, { status: 503 });
  }

  let address: `0x${string}`;
  try {
    address = getAddress(configuredAddress);
  } catch {
    return Response.json({ error: { message: "Configuration de réception invalide." } }, { status: 503 });
  }

  return Response.json(
    {
      data: {
        address,
        assets: ["ETH", "USDC", "USDT"],
        chain: "ethereum",
        chain_id: 1,
        mode: "MAINNET",
      },
    },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
