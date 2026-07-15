import type { AgentCommand } from "../core/types.js";
import { ProviderError } from "../core/errors.js";
import { resolveCloudApiBase, resolveTalocodeApiKey } from "../core/config.js";

export function teraBaseUrl(): string {
  return resolveCloudApiBase();
}

export function teraApiKey(): string | undefined {
  return resolveTalocodeApiKey();
}

/**
 * Send prompt to Talocode Cloud.
 * Documented paths (CLOUD.md): /v1/router/chat/completions, /v1/chat/completions, /v1/tera/*
 */
export async function sendToTera(prompt: string, command?: AgentCommand): Promise<unknown> {
  const base = teraBaseUrl();
  const key = teraApiKey();
  if (!key) {
    throw new ProviderError(
      "Tera integration requires TALOCODE_API_KEY. Clipboard/stdout targets work offline."
    );
  }

  const body = {
    model: process.env.TERA_MODEL || "default",
    messages: [
      { role: "system", content: "You are Tera acting on a ScreenLane screen-aware command." },
      { role: "user", content: prompt },
    ],
    metadata: {
      source: "screenlane",
      commandId: command?.id,
      intent: command?.intent,
    },
  };

  const endpoints = [
    `${base}/v1/router/chat/completions`,
    `${base}/v1/chat/completions`,
    `${base}/v1/tera/chat/completions`,
    `${base}/v1/tera/writing/rewrite`,
  ];

  let lastErr = "";
  for (const url of endpoints) {
    try {
      const payload =
        url.includes("/writing/rewrite")
          ? { text: prompt, instruction: command?.instruction || "Act on the ScreenLane command." }
          : body;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "X-Talocode-Api-Key": key,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });
      const text = await res.text();
      if (res.ok) {
        try {
          return { endpoint: url, data: JSON.parse(text) };
        } catch {
          return { endpoint: url, raw: text };
        }
      }
      lastErr = `${url} -> ${res.status}: ${text.slice(0, 200)}`;
      // Auth failures: don't spam other routes with same key issue
      if (res.status === 401 || res.status === 403) break;
    } catch (err) {
      lastErr = `${url} -> ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  throw new ProviderError(
    `Cloud send failed against ${base}. Last error: ${lastErr}. ` +
      `Local capture/command still work offline. Ensure TALOCODE_API_KEY is valid and cloud routes are deployed.`
  );
}
