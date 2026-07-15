import type { IncomingMessage } from "node:http";
import { AuthError } from "./errors.js";
import { loadConfig, resolveTalocodeApiKey } from "./config.js";

/**
 * Access gating uses TALOCODE_API_KEY.
 * When SCREENLANE_REQUIRE_AUTH=true (or config.requireAuth),
 * clients must send:
 *   Authorization: Bearer <TALOCODE_API_KEY>
 * or
 *   X-Talocode-Api-Key: <TALOCODE_API_KEY>
 */
export function isAuthRequired(): boolean {
  if (process.env.SCREENLANE_REQUIRE_AUTH === "true") return true;
  if (process.env.SCREENLANE_REQUIRE_AUTH === "false") return false;
  return loadConfig().requireAuth === true;
}

export function extractBearerOrTalocodeKey(
  headers: Record<string, string | string[] | undefined>
): string | undefined {
  const authHeader = headers["authorization"] || headers["Authorization"];
  const apiKeyHeader = headers["x-talocode-api-key"] || headers["X-Talocode-Api-Key"];

  if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  if (Array.isArray(authHeader) && authHeader[0]?.toLowerCase().startsWith("bearer ")) {
    return authHeader[0].slice(7).trim();
  }
  if (typeof apiKeyHeader === "string") return apiKeyHeader.trim();
  if (Array.isArray(apiKeyHeader)) return apiKeyHeader[0]?.trim();
  return undefined;
}

export function checkAuth(req: { headers: Record<string, string | string[] | undefined> }): void {
  if (!isAuthRequired()) return;

  const expected = resolveTalocodeApiKey();
  if (!expected) {
    throw new AuthError(
      "SCREENLANE_REQUIRE_AUTH is enabled but TALOCODE_API_KEY is not set (env or `screenlane auth set`)."
    );
  }

  const provided = extractBearerOrTalocodeKey(req.headers);
  if (!provided || provided !== expected) {
    throw new AuthError("Invalid or missing API key. Use Authorization: Bearer <TALOCODE_API_KEY>");
  }
}

export function checkAuthFromNodeRequest(req: IncomingMessage): void {
  checkAuth({ headers: req.headers as Record<string, string | string[] | undefined> });
}
