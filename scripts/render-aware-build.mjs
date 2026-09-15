import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const serverBundle = resolve(projectRoot, "dist", "server", "index.js");
const isRenderBuild = Boolean(process.env.RENDER_GIT_COMMIT);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

if (isRenderBuild && existsSync(serverBundle)) {
  console.log("Using audited precompiled Vinext output on Render.");
  run(process.execPath, [resolve(projectRoot, "scripts", "privacy-audit.mjs"), "output"]);
} else {
  const pnpmEntry = process.env.npm_execpath;
  if (pnpmEntry) {
    run(process.execPath, [pnpmEntry, "run", "build:source"]);
  } else {
    run(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["run", "build:source"]);
  }
}
