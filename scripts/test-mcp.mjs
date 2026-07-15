#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const server = join(root, "dist", "mcp", "server.js");

const child = spawn(process.execPath, [server], {
  stdio: ["pipe", "pipe", "pipe"],
});

let out = "";
child.stdout.setEncoding("utf8");
child.stdout.on("data", (d) => {
  out += d;
});

function send(msg) {
  child.stdin.write(JSON.stringify(msg) + "\n");
}

function waitFor(pred, ms = 5000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const t = setInterval(() => {
      if (pred(out)) {
        clearInterval(t);
        resolve(true);
      } else if (Date.now() - start > ms) {
        clearInterval(t);
        reject(new Error("timeout: " + out.slice(-500)));
      }
    }, 50);
  });
}

try {
  send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
  await waitFor((s) => s.includes("protocolVersion"));
  send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  await waitFor((s) => s.includes("screenlane_demo"));
  send({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "screenlane_demo", arguments: {} },
  });
  await waitFor((s) => s.includes("debug_error") || s.includes("Fix this error"));
  console.log("MCP tests passed");
  child.kill();
  process.exit(0);
} catch (err) {
  console.error("MCP test failed:", err);
  console.error("stdout:", out);
  child.kill();
  process.exit(1);
}
