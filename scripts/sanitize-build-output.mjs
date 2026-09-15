import { existsSync } from "node:fs";
import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const outputRoot = resolve(import.meta.dirname, "..", "dist");

async function removeGeneratedDevVars(path) {
  if (!existsSync(path)) return;
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      await removeGeneratedDevVars(child);
    } else if (entry.isFile() && entry.name === ".dev.vars") {
      await unlink(child);
    }
  }
}

await removeGeneratedDevVars(outputRoot);

const generatedWranglerConfig = join(outputRoot, "server", "wrangler.json");
if (existsSync(generatedWranglerConfig)) {
  const config = JSON.parse(await readFile(generatedWranglerConfig, "utf8"));
  config.configPath = "wrangler.json";
  config.userConfigPath = "wrangler.json";
  await writeFile(generatedWranglerConfig, `${JSON.stringify(config)}\n`, "utf8");
}

console.log("Removed generated local secrets and paths from build output.");
