export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "ligne-hosted-preview",
      assets: ["BTC", "ETH", "USDT", "USDC"],
      timestamp: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
