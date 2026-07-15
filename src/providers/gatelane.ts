import type { AgentCommand } from "../core/types.js";
import { ProviderError } from "../core/errors.js";
import { resolveCloudApiBase, resolveTalocodeApiKey } from "../core/config.js";

export function gatelaneBaseUrl(): string {
  return resolveCloudApiBase();
}

export function gatelaneApiKey(): string | undefined {
  return resolveTalocodeApiKey();
}

export async function sendToGateLane(prompt: string, command?: AgentCommand): Promise<unknown> {
  const base = gatelaneBaseUrl();
  const key = gatelaneApiKey();
  if (!key) {
    throw new ProviderError("GateLane integration requires TALOCODE_API_KEY.");
  }

  const url = `${base}/v1/gatelane/call`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "X-Talocode-Api-Key": key,
    },
    body: JSON.stringify({
      tool: "screenlane.command",
      input: {
        prompt,
        commandId: command?.id,
        intent: command?.intent,
      },
      source: "screenlane",
    }),
    signal: AbortSignal.timeout(30000),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new ProviderError(`GateLane send failed (${res.status}): ${body.slice(0, 200)}`);
  }
  try {
    return JSON.parse(body);
  } catch {
    return { raw: body };
  }
}
