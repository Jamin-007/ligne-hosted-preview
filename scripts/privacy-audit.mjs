import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { hostname, homedir, userInfo } from "node:os";
import { extname, join, relative, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const mode = process.argv[2] ?? "all";
const sourceRoots = ["app", "db", "lib", "public", "worker"];
const sourceFiles = ["package.json", "vite.config.ts", "tsconfig.json", ".openai/hosting.json"];
const outputRoots = ["dist"];
const ignoredExtensions = new Set([".gif", ".ico", ".jpeg", ".jpg", ".png", ".webp", ".woff", ".woff2"]);
const nonPersonalSystemIdentifiers = new Set([
  "admin",
  "node",
  "nobody",
  "render",
  "root",
  "runner",
  "ubuntu",
  "worker",
  "www-data",
]);

function command(args) {
  try {
    return execFileSync("git", ["-C", projectRoot, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function localDenylist() {
  const values = [homedir(), userInfo().username, process.env.USER, process.env.LOGNAME, hostname()];
  const gitName = command(["config", "user.name"]);
  const gitEmail = command(["config", "user.email"]);
  const remote = command(["remote", "get-url", "origin"]);
  const remoteOwner = remote.match(/(?:github\.com|gitlab\.com)[:/]([^/]+)\//i)?.[1];
  values.push(gitName, gitEmail, remoteOwner);
  return values.filter((value) => {
    if (typeof value !== "string" || value.trim().length < 4) return false;
    return !nonPersonalSystemIdentifiers.has(value.trim().toLowerCase());
  });
}

async function privateDenylist() {
  const path = join(projectRoot, ".privacy-denylist");
  if (!existsSync(path)) return [];
  const content = await readFile(path, "utf8");
  return content.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && line.length >= 3);
}

async function runtimeSecrets() {
  const values = [];
  for (const filename of [".dev.vars", ".env", ".env.local", ".env.production.local"]) {
    const path = join(projectRoot, filename);
    if (!existsSync(path)) continue;
    const content = await readFile(path, "utf8");
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
      const value = line.slice(line.indexOf("=") + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
      if (value.length >= 8) values.push(value);
    }
  }
  return values;
}

async function walk(path) {
  if (!existsSync(path)) return [];
  const info = await stat(path);
  if (info.isFile()) return [path];
  const files = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await walk(child));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

function publicIpv4(value) {
  const matches = [
    ...value.matchAll(/https?:\/\/(\d{1,3}(?:\.\d{1,3}){3})(?=[:/\s"'`]|$)/gi),
    ...value.matchAll(/\b(?:host|hostname|ip|server)[\w.-]*\s*[:=]\s*["'`](\d{1,3}(?:\.\d{1,3}){3})["'`]/gi),
  ].map((match) => match[1]);
  return matches.some((ip) => {
    const parts = ip.split(".").map(Number);
    if (parts.some((part) => part > 255)) return false;
    return !(parts[0] === 10 || parts[0] === 127 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31));
  });
}

async function auditFiles(paths, personalValues, secretValues) {
  const findings = [];
  const files = (await Promise.all(paths.map((path) => walk(path)))).flat();

  for (const path of files) {
    if (ignoredExtensions.has(extname(path).toLowerCase())) continue;
    const info = await stat(path);
    if (info.size > 8_000_000) continue;
    const content = await readFile(path, "utf8");
    const displayPath = relative(projectRoot, path);

    if (/(?:\/home\/[^/\s"'`]+|\/Users\/[^/\s"'`]+|[A-Za-z]:\\Users\\[^\\\s"'`]+)/.test(content)) findings.push([displayPath, "local path"]);
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(content)) findings.push([displayPath, "email address"]);
    if (/BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(content)) findings.push([displayPath, "private key"]);
    if (publicIpv4(content)) findings.push([displayPath, "public IP address"]);

    const lower = content.toLowerCase();
    if (personalValues.some((value) => lower.includes(value.toLowerCase()))) findings.push([displayPath, "personal identifier"]);
    if (secretValues.some((value) => content.includes(value))) findings.push([displayPath, "runtime secret"]);
  }

  return findings;
}

function trackedSensitiveFiles() {
  const tracked = command(["ls-files"]).split(/\r?\n/).filter(Boolean);
  return tracked.filter((path) => /(^|\/)(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?|\.privacy-denylist)$/.test(path));
}

const personalValues = [...new Set([...localDenylist(), ...await privateDenylist()])];
const secretValues = await runtimeSecrets();
const findings = [];

if (mode === "source" || mode === "all") {
  const tracked = trackedSensitiveFiles();
  findings.push(...tracked.map((path) => [path, "tracked sensitive file"]));
  findings.push(...await auditFiles(
    [...sourceRoots.map((path) => join(projectRoot, path)), ...sourceFiles.map((path) => join(projectRoot, path))],
    personalValues,
    secretValues,
  ));
}

if (mode === "output" || mode === "all") {
  findings.push(...await auditFiles(outputRoots.map((path) => join(projectRoot, path)), personalValues, secretValues));
}

if (findings.length) {
  console.error("Privacy audit failed. Deployment was stopped:");
  for (const [path, category] of findings) console.error(`- ${path}: ${category}`);
  process.exit(1);
}

console.log(`Privacy audit passed (${mode}).`);
