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
import { ocrAvailable } from "./ocr.js";
import { maskKey } from "./errors.js";
import type { DoctorCheck, DoctorReport } from "./types.js";
import { nowIso } from "./ids.js";


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

  checks.push({
    name: "ocr",
    status: ocrAvailable() ? "ok" : "info",
    detail: ocrAvailable()
      ? "tesseract available (screen OCR enabled)"
      : "tesseract not found — install tesseract-ocr for screenshot text extraction",
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
    detail: TALOCODE_CLOUD_API_BASE,
  });

  checks.push({
    name: "cloud_targets",
    status: talo ? "ok" : "info",
    detail: talo
      ? `ready (${TALOCODE_CLOUD_API_BASE})`
      : `set TALOCODE_API_KEY to enable cloud send`,
  });

  checks.push({
    name: "env",
    status: "info",
    detail: JSON.stringify(getEnvSummary()),
  });

  try {
    const base = resolveCloudApiBase();
    const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(4000) });
    checks.push({
      name: "cloud_health",
      status: res.ok ? "ok" : "warn",
      detail: `${base}/health -> ${res.status}`,
    });
  } catch (err) {
    checks.push({
      name: "cloud_health",
      status: "info",
      detail: `${TALOCODE_CLOUD_API_BASE}/health unreachable (offline ok for local use)`,
    });
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
