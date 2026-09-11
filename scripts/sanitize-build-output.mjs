import { existsSync } from "node:fs";
import { readdir, unlink } from "node:fs/promises";
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
console.log("Removed generated local secret files from build output.");
