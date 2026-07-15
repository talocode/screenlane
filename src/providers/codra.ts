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

  const url = `${base}/v1/codra/run`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "X-Talocode-Api-Key": key,
    },
    body: JSON.stringify({
      prompt,
      source: "screenlane",
      commandId: command?.id,
      intent: command?.intent,
    }),
    signal: AbortSignal.timeout(30000),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new ProviderError(`Codra send failed (${res.status}): ${body.slice(0, 200)}`);
  }
  try {
    return JSON.parse(body);
  } catch {
    return { raw: body };
  }
}
