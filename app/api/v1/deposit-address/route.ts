import { env } from "cloudflare:workers";
import { getAddress } from "viem";

export async function GET() {
  const configuredAddress = (env as unknown as { MAINNET_RECEIVER_ADDRESS?: string }).MAINNET_RECEIVER_ADDRESS?.trim();
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
        assets: ["ETH", "USDC"],
        chain: "ethereum",
        chain_id: 1,
        mode: "MAINNET",
      },
    },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
