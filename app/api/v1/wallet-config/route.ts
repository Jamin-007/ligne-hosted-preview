import { getRuntimeEnv } from "@/lib/runtime-env";

export async function GET() {
  const env = await getRuntimeEnv();
  const projectId = env.REOWN_PROJECT_ID?.trim();
  if (!projectId) {
    return Response.json({ error: { code: "WALLET_CONFIG_UNAVAILABLE", message: "WalletConnect indisponible." } }, { status: 503 });
  }
  return Response.json({ projectId }, { headers: { "cache-control": "public, max-age=300" } });
}
