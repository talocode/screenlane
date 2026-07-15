import { ProviderError } from "../core/errors.js";

export function openaiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function requireOpenAI(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new ProviderError("Audio transcription provider is not configured. Use --text instead.");
  }
  return key;
}

export function openaiBaseUrl(): string {
  return (process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
}
