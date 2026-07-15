import { ProviderError } from "../core/errors.js";

export function openaiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function requireOpenAI(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new ProviderError("OPENAI_API_KEY is not set");
  }
  return key;
}

export function openaiBaseUrl(): string {
  return (process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
}
