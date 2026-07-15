#!/usr/bin/env node
/**
 * ScreenLane MCP server (stdio JSON-RPC).
 * Only JSON-RPC may go to stdout. Diagnostics go to stderr.
 */
import { MCP_TOOLS, callTool } from "./tools.js";

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "screenlane", version: "0.1.3" };

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

function writeMessage(msg: unknown): void {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function respond(id: string | number | null | undefined, result: unknown): void {
  writeMessage({ jsonrpc: "2.0", id: id ?? null, result });
}

function respondError(
  id: string | number | null | undefined,
  code: number,
  message: string
): void {
  writeMessage({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
}

async function handle(req: JsonRpcRequest): Promise<void> {
  const method = req.method || "";
  const id = req.id;
  const params = (req.params || {}) as Record<string, unknown>;

  try {
    switch (method) {
      case "initialize":
        respond(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        });
        return;
      case "notifications/initialized":
      case "initialized":
        // notification — no response required if no id
        if (id !== undefined && id !== null) respond(id, {});
        return;
      case "tools/list":
        respond(id, { tools: MCP_TOOLS });
        return;
      case "tools/call": {
        const name = String(params.name || "");
        const args = (params.arguments || {}) as Record<string, unknown>;
        const result = await callTool(name, args);
        respond(id, result);
        return;
      }
      case "ping":
        respond(id, {});
        return;
      default:
        respondError(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`screenlane-mcp error: ${message}\n`);
    respondError(id, -32000, message);
  }
}

let buffer = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk: string) => {
  buffer += chunk;
  let idx: number;
  while ((idx = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line) continue;
    // Support Content-Length framed messages (optional)
    if (line.toLowerCase().startsWith("content-length:")) continue;
    if (line === "\r" || line === "") continue;
    try {
      const msg = JSON.parse(line) as JsonRpcRequest;
      void handle(msg);
    } catch (err) {
      process.stderr.write(
        `screenlane-mcp parse error: ${err instanceof Error ? err.message : String(err)}\n`
      );
    }
  }
});

// Also support Content-Length framing in a simple way via full buffer scans
// (line-delimited is primary for tests)

process.stdin.on("end", () => process.exit(0));
process.stderr.write("ScreenLane MCP server ready (stdio)\n");
