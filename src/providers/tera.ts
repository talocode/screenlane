import type { AgentCommand } from "../core/types.js";
import { ProviderError } from "../core/errors.js";
import { resolveTalocodeApiKey } from "../core/config.js";

export function teraBaseUrl(): string | undefined {
  const base = process.env.TERA_API_BASE_URL || process.env.SCREENLANE_API_BASE_URL;
  return base ? base.replace(/\/$/, "") : undefined;
}

export function teraApiKey(): string | undefined {
  return resolveTalocodeApiKey();
}

export async function sendToTera(prompt: string, command?: AgentCommand): Promise<unknown> {
  const base = teraBaseUrl();
  const key = teraApiKey();
  if (!base || !key) {
    throw new ProviderError(
      "Tera integration requires TERA_API_BASE_URL and TALOCODE_API_KEY. Clipboard/stdout targets work offline."
    );
  }

  const endpoints = [`${base}/v1/chat/completions`, `${base}/v1/tera/chat`, `${base}/chat`];
  let lastErr = "";
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "X-Talocode-Api-Key": key,
        },
        body: JSON.stringify({
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
        }),
        signal: AbortSignal.timeout(30000),
      });
      const body = await res.text();
      if (res.ok) {
        try {
          return JSON.parse(body);
        } catch {
          return { raw: body };
        }
      }
      lastErr = `${url} -> ${res.status}: ${body.slice(0, 200)}`;
    } catch (err) {
      lastErr = `${url} -> ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  throw new ProviderError(`Tera send failed. Last error: ${lastErr}`);
}
