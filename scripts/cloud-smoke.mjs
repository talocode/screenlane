#!/usr/bin/env node
/**
 * Honest cloud smoke against https://api.talocode.site
 * Does not print secrets. Requires TALOCODE_API_KEY for auth-gated calls.
 */
import { spawnSync } from "node:child_process";

const base = "https://api.talocode.site";
const key = process.env.TALOCODE_API_KEY || "";

function get(path) {
  const r = spawnSync(
    "curl",
    ["-sS", "-o", "/tmp/sl-cloud-body.json", "-w", "%{http_code}", "--max-time", "12", `${base}${path}`],
    { encoding: "utf8" }
  );
  return { code: r.stdout?.trim(), body: r.stderr || "" };
}

async function post(path, body) {
  const headers = { "Content-Type": "application/json" };
  if (key) {
    headers.Authorization = `Bearer ${key}`;
    headers["X-Talocode-Api-Key"] = key;
  }
  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    return { status: res.status, snippet: text.slice(0, 160).replace(/\s+/g, " ") };
  } catch (err) {
    return { status: 0, snippet: err instanceof Error ? err.message : String(err) };
  }
}

console.log("ScreenLane cloud smoke");
console.log("base:", base);
console.log("TALOCODE_API_KEY:", key ? `set (len=${key.length})` : "not set");

const health = get("/health");
console.log("GET /health ->", health.code);

const paths = [
  "/v1/router/chat/completions",
  "/v1/chat/completions",
  "/v1/tera/chat/completions",
  "/v1/tera/writing/rewrite",
  "/v1/codra/repo-summary",
];

const payload = {
  model: "default",
  messages: [{ role: "user", content: "ping from screenlane cloud-smoke" }],
};

for (const p of paths) {
  const body =
    p.includes("rewrite")
      ? { text: "hello", instruction: "shorten" }
      : p.includes("repo-summary")
        ? { prompt: "summarize", text: "ping" }
        : payload;
  const r = await post(p, body);
  console.log(`POST ${p} -> ${r.status} ${r.snippet}`);
}

if (!key) {
  console.log("\nNOTE: Set TALOCODE_API_KEY to test authenticated routes.");
  process.exit(0);
}
console.log("\nDone.");
