import { env } from "cloudflare:workers";

export async function GET() {
  const projectId = (env as unknown as { REOWN_PROJECT_ID?: string }).REOWN_PROJECT_ID?.trim();
  if (!projectId) {
    return Response.json({ error: { code: "WALLET_CONFIG_UNAVAILABLE", message: "WalletConnect indisponible." } }, { status: 503 });
  }
  return Response.json({ projectId }, { headers: { "cache-control": "public, max-age=300" } });
}
