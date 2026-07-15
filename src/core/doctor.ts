import { existsSync } from "node:fs";
import { getConfigPath, getHomeDir, getEnvSummary, loadConfig, resolveTalocodeApiKey } from "./config.js";
import { listClipboardTools, listScreenshotTools } from "./capture.js";
import { maskKey } from "./errors.js";
import type { DoctorCheck, DoctorReport } from "./types.js";
import { nowIso } from "./ids.js";
import { teraBaseUrl, teraApiKey } from "../providers/tera.js";
import { codraBaseUrl, codraApiKey } from "../providers/codra.js";
import { gatelaneBaseUrl, gatelaneApiKey } from "../providers/gatelane.js";

export async function doctor(): Promise<DoctorReport> {
  const checks: DoctorCheck[] = [];
  const config = loadConfig();

  checks.push({
    name: "node",
    status: "ok",
    detail: process.version,
  });

  checks.push({
    name: "platform",
    status: "ok",
    detail: `${process.platform} ${process.arch}`,
  });

  const home = getHomeDir();
  checks.push({
    name: "storage",
    status: existsSync(home) ? "ok" : "warn",
    detail: existsSync(home) ? home : `${home} (will be created on init)`,
  });

  checks.push({
    name: "config",
    status: existsSync(getConfigPath()) ? "ok" : "warn",
    detail: existsSync(getConfigPath())
      ? getConfigPath()
      : "missing — run `screenlane init`",
  });

  const shot = listScreenshotTools();
  const shotOk = shot.some((t) => t.available);
  checks.push({
    name: "screenshot_tools",
    status: shotOk ? "ok" : "warn",
    detail: shot.map((t) => `${t.name}:${t.available ? "yes" : "no"}`).join(", ") +
      (shotOk ? "" : " — use --source text|file|url|clipboard"),
  });

  const clip = listClipboardTools();
  const clipOk = clip.some((t) => t.available);
  checks.push({
    name: "clipboard_tools",
    status: clipOk ? "ok" : "warn",
    detail: clip.map((t) => `${t.name}:${t.available ? "yes" : "no"}`).join(", "),
  });

  const talo = resolveTalocodeApiKey();
  checks.push({
    name: "TALOCODE_API_KEY",
    status: talo ? "ok" : "info",
    detail: talo
      ? `present ${maskKey(talo)}`
      : "not set — local core works without it",
  });

  checks.push({
    name: "auth_mode",
    status: "info",
    detail: config.requireAuth || process.env.SCREENLANE_REQUIRE_AUTH === "true"
      ? "required (Bearer TALOCODE_API_KEY)"
      : "local open (set SCREENLANE_REQUIRE_AUTH=true + TALOCODE_API_KEY to gate)",
  });

  checks.push({
    name: "tera",
    status: teraBaseUrl() && teraApiKey() ? "ok" : "info",
    detail:
      teraBaseUrl() && teraApiKey()
        ? `configured base=${teraBaseUrl()}`
        : "not fully configured (TERA_API_BASE_URL + TALOCODE_API_KEY)",
  });

  checks.push({
    name: "codra",
    status: codraBaseUrl() && codraApiKey() ? "ok" : "info",
    detail:
      codraBaseUrl() && codraApiKey()
        ? `configured base=${codraBaseUrl()}`
        : "not fully configured (CODRA_API_BASE_URL + TALOCODE_API_KEY)",
  });

  checks.push({
    name: "gatelane",
    status: gatelaneBaseUrl() && gatelaneApiKey() ? "ok" : "info",
    detail:
      gatelaneBaseUrl() && gatelaneApiKey()
        ? `configured base=${gatelaneBaseUrl()}`
        : "not fully configured (GATELANE_API_BASE_URL + TALOCODE_API_KEY)",
  });

  checks.push({
    name: "env",
    status: "info",
    detail: JSON.stringify(getEnvSummary()),
  });

  // Optional connectivity pings — only when bases configured
  for (const [name, base] of [
    ["tera_health", teraBaseUrl()],
    ["codra_health", codraBaseUrl()],
    ["gatelane_health", gatelaneBaseUrl()],
  ] as const) {
    if (!base) continue;
    try {
      const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(4000) });
      checks.push({
        name,
        status: res.ok ? "ok" : "warn",
        detail: `${base}/health -> ${res.status}`,
      });
    } catch (err) {
      checks.push({
        name,
        status: "warn",
        detail: `${base}/health unreachable: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const ok = !checks.some((c) => c.status === "fail");
  return {
    ok,
    platform: process.platform,
    nodeVersion: process.version,
    checks,
    timestamp: nowIso(),
  };
}
