import type { AgentCommand } from "../core/types.js";
import { ProviderError } from "../core/errors.js";
import { resolveCloudApiBase, resolveTalocodeApiKey } from "../core/config.js";

export function codraBaseUrl(): string {
  return resolveCloudApiBase();
}

export function codraApiKey(): string | undefined {
  return resolveTalocodeApiKey();
}

export async function sendToCodra(prompt: string, command?: AgentCommand): Promise<unknown> {
  const base = codraBaseUrl();
  const key = codraApiKey();
  if (!key) {
    throw new ProviderError(
      "Codra integration requires TALOCODE_API_KEY. Use --target clipboard|stdout offline."
    );
  }

  const endpoints = [
    `${base}/v1/codra/repo-summary`,
    `${base}/v1/codra/run`,
    `${base}/v1/router/chat/completions`,
  ];

  let lastErr = "";
  for (const url of endpoints) {
    try {
      const isChat = url.includes("chat/completions");
      const payload = isChat
        ? {
            model: "default",
            messages: [
              {
                role: "system",
                content: "You are Codra acting on a ScreenLane debug/coding command.",
              },
              { role: "user", content: prompt },
            ],
          }
        : {
            prompt,
            text: prompt,
            source: "screenlane",
            commandId: command?.id,
            intent: command?.intent,
          };

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
      if (res.status === 401 || res.status === 403) break;
    } catch (err) {
      lastErr = `${url} -> ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  throw new ProviderError(
    `Codra cloud send failed against ${base}. Last error: ${lastErr}. Use --target clipboard offline.`
  );
}
