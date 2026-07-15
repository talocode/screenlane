import { existsSync } from "node:fs";
import {
  getConfigPath,
  getHomeDir,
  getEnvSummary,
  loadConfig,
  resolveCloudApiBase,
  resolveTalocodeApiKey,
  TALOCODE_CLOUD_API_BASE,
} from "./config.js";
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
    name: "cloud_api",
    status: "info",
    detail: `base=${resolveCloudApiBase()} (default ${TALOCODE_CLOUD_API_BASE})`,
  });

  checks.push({
    name: "tera",
    status: teraApiKey() ? "ok" : "info",
    detail: teraApiKey()
      ? `ready base=${teraBaseUrl()}`
      : `base=${teraBaseUrl()} — set TALOCODE_API_KEY to enable`,
  });

  checks.push({
    name: "codra",
    status: codraApiKey() ? "ok" : "info",
    detail: codraApiKey()
      ? `ready base=${codraBaseUrl()}`
      : `base=${codraBaseUrl()} — set TALOCODE_API_KEY to enable`,
  });

  checks.push({
    name: "gatelane",
    status: gatelaneApiKey() ? "ok" : "info",
    detail: gatelaneApiKey()
      ? `ready base=${gatelaneBaseUrl()}`
      : `base=${gatelaneBaseUrl()} — set TALOCODE_API_KEY to enable`,
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
