import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const generatedPaths = [
  ".next",
  "dist",
  "node_modules/.vite",
  ".wrangler/tmp",
];

await Promise.all(
  generatedPaths.map((path) =>
    rm(resolve(projectRoot, path), { recursive: true, force: true }),
  ),
);

console.log("Removed stale build output and caches.");
