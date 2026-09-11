import { fileURLToPath } from "node:url";
import vinext from "vinext";
import { defineConfig } from "vite";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    // WalletConnect's logger imports the CommonJS browser build of pino as
    // ESM. Route only the bare import through a small ESM facade that exposes
    // both the default logger and the named `levels` export it expects.
    resolve: {
      alias: [
        {
          find: /^pino$/,
          replacement: fileURLToPath(
            new URL("./lib/pino-browser-interop.ts", import.meta.url),
          ),
        },
      ],
    },
    optimizeDeps: {
      include: ["pino/browser.js"],
      needsInterop: ["pino/browser.js"],
    },
    server: isCodexSeatbeltSandbox
      ? {
          host: true,
          watch: {
            useFsEvents: false,
            usePolling: true,
            ignored: ["**/.pnpm-store/**"],
          },
        }
      : { host: true, watch: { ignored: ["**/.pnpm-store/**"] } },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        configPath: "./wrangler.jsonc",
      }),
    ],
  };
});
