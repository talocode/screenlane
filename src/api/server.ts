import { createServer, type Server } from "node:http";
import { handleRequest } from "./routes.js";
import { loadConfig } from "../core/config.js";

export interface ServeOptions {
  port?: number;
  host?: string;
}

export function createApiServer(): Server {
  return createServer((req, res) => {
    void handleRequest(req, res);
  });
}

export function startServer(opts: ServeOptions = {}): Server {
  const config = loadConfig();
  const port = opts.port ?? config.apiPort ?? 3070;
  const host = opts.host ?? process.env.SCREENLANE_HOST ?? "127.0.0.1";
  const server = createApiServer();
  server.listen(port, host, () => {
    // stderr so MCP/stdio clients are unaffected if someone reuses process
    console.error(`ScreenLane API listening on http://${host}:${port}`);
    console.error(`Health: http://${host}:${port}/health`);
    if (process.env.SCREENLANE_REQUIRE_AUTH === "true") {
      console.error("Auth: required (Authorization: Bearer <TALOCODE_API_KEY>)");
    } else {
      console.error("Auth: local open (set SCREENLANE_REQUIRE_AUTH=true to gate with TALOCODE_API_KEY)");
    }
  });
  return server;
}

// CLI entry when run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("server.js")) {
  startServer();
}
