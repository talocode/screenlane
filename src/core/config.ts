import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import type { CommandTarget, DictateProvider, ScreenLaneConfig } from "./types.js";
import { ConfigError } from "./errors.js";
import { nowIso } from "./ids.js";

const CONFIG_VERSION = 1;

export function getHomeDir(): string {
  return process.env.SCREENLANE_HOME || join(homedir(), ".screenlane");
}

export function getConfigPath(): string {
  return join(getHomeDir(), "config.json");
}

export function getContextsDir(): string {
  return join(getHomeDir(), "contexts");
}

export function getCommandsDir(): string {
  return join(getHomeDir(), "commands");
}

export function getAuthPath(): string {
  return join(getHomeDir(), "auth.json");
}

export function getCapturesDir(): string {
  return join(getHomeDir(), "captures");
}

export function defaultConfig(): ScreenLaneConfig {
  const t = nowIso();
  return {
    version: CONFIG_VERSION,
    defaultTarget: "stdout",
    defaultProvider: "local",
    apiPort: Number(process.env.SCREENLANE_PORT || 3070),
    storageDir: getHomeDir(),
    requireAuth: process.env.SCREENLANE_REQUIRE_AUTH === "true",
    createdAt: t,
    updatedAt: t,
    hasTalocodeKey: Boolean(process.env.TALOCODE_API_KEY),
  };
}

export function ensureDirs(): void {
  for (const dir of [getHomeDir(), getContextsDir(), getCommandsDir(), getCapturesDir()]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

export function loadConfig(): ScreenLaneConfig {
  ensureDirs();
  const path = getConfigPath();
  if (!existsSync(path)) {
    return defaultConfig();
  }
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as Partial<ScreenLaneConfig>;
    return {
      ...defaultConfig(),
      ...raw,
      hasTalocodeKey: Boolean(process.env.TALOCODE_API_KEY || loadStoredTalocodeKey()),
      requireAuth:
        process.env.SCREENLANE_REQUIRE_AUTH === "true" ||
        raw.requireAuth === true,
    };
  } catch {
    return defaultConfig();
  }
}

export function saveConfig(partial: Partial<ScreenLaneConfig> = {}): ScreenLaneConfig {
  ensureDirs();
  const current = existsSync(getConfigPath()) ? loadConfig() : defaultConfig();
  const next: ScreenLaneConfig = {
    ...current,
    ...partial,
    version: CONFIG_VERSION,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  };
  writeFileSync(getConfigPath(), JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}

export function initConfig(): ScreenLaneConfig {
  ensureDirs();
  if (existsSync(getConfigPath())) {
    return loadConfig();
  }
  return saveConfig(defaultConfig());
}

interface AuthStore {
  talocodeApiKey?: string;
  updatedAt?: string;
}

export function loadStoredTalocodeKey(): string | undefined {
  const path = getAuthPath();
  if (!existsSync(path)) return undefined;
  try {
    const data = JSON.parse(readFileSync(path, "utf8")) as AuthStore;
    return data.talocodeApiKey;
  } catch {
    return undefined;
  }
}

/** Resolve TALOCODE_API_KEY from env first, then local auth store */
export function resolveTalocodeApiKey(): string | undefined {
  return process.env.TALOCODE_API_KEY || loadStoredTalocodeKey();
}

export function setTalocodeApiKey(key: string): void {
  if (!key || !key.trim()) throw new ConfigError("API key cannot be empty");
  ensureDirs();
  const store: AuthStore = {
    talocodeApiKey: key.trim(),
    updatedAt: nowIso(),
  };
  writeFileSync(getAuthPath(), JSON.stringify(store, null, 2) + "\n", "utf8");
  try {
    chmodSync(getAuthPath(), 0o600);
  } catch {
    /* best effort on Windows */
  }
  saveConfig({ hasTalocodeKey: true });
}

export function clearTalocodeApiKey(): void {
  ensureDirs();
  writeFileSync(
    getAuthPath(),
    JSON.stringify({ updatedAt: nowIso() }, null, 2) + "\n",
    "utf8"
  );
  saveConfig({ hasTalocodeKey: false });
}

export function getEnvSummary(): Record<string, string> {
  const keys = [
    "TALOCODE_API_KEY",
    "SCREENLANE_REQUIRE_AUTH",
    "SCREENLANE_API_BASE_URL",
    "TERA_API_BASE_URL",
    "CODRA_API_BASE_URL",
    "GATELANE_API_BASE_URL",
  ];
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = process.env[k];
    if (k.endsWith("_KEY")) {
      out[k] = v ? "set" : "not set";
    } else {
      out[k] = v || "not set";
    }
  }
  if (loadStoredTalocodeKey() && !process.env.TALOCODE_API_KEY) {
    out.TALOCODE_API_KEY = "set (auth store)";
  }
  return out;
}

export function getPlatform(): string {
  return platform();
}

export function parseTarget(value: string | undefined, fallback: CommandTarget = "stdout"): CommandTarget {
  const allowed: CommandTarget[] = [
    "tera",
    "codra",
    "codex",
    "opencode",
    "gatelane",
    "mcp",
    "clipboard",
    "stdout",
  ];
  if (!value) return fallback;
  if (!allowed.includes(value as CommandTarget)) {
    throw new ConfigError(`Invalid target: ${value}. Allowed: ${allowed.join(", ")}`);
  }
  return value as CommandTarget;
}

export function parseProvider(value: string | undefined, fallback: DictateProvider = "local"): DictateProvider {
  const allowed: DictateProvider[] = ["local", "openai", "tera"];
  if (!value) return fallback;
  if (!allowed.includes(value as DictateProvider)) {
    throw new ConfigError(`Invalid provider: ${value}. Allowed: ${allowed.join(", ")}`);
  }
  return value as DictateProvider;
}
