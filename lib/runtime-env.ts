// Cloudflare Workers (OpenAI Sites) injects vars through `cloudflare:workers`'s `env`,
// which doesn't exist as a real module under plain Node (e.g. `vinext start` on Render).
// Fall back to `process.env` there so the same route works on both runtimes.
export async function getRuntimeEnv(): Promise<Record<string, string | undefined>> {
  const nodeEnv = typeof process === "undefined" ? {} : process.env;
  try {
    const cf = await import("cloudflare:workers");
    return {
      ...nodeEnv,
      ...cf.env as unknown as Record<string, string | undefined>,
    };
  } catch {
    return nodeEnv;
  }
}
