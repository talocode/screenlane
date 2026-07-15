import { readFileSync } from "node:fs";
import type { DictateInput, DictateProvider, VoiceInput } from "./types.js";
import { ProviderError, ScreenLaneError } from "./errors.js";
import { newId, nowIso } from "./ids.js";
import { assertAudioFile, estimateDurationMs } from "./audio.js";
import { saveVoice } from "./storage.js";
import { resolveCloudApiBase, resolveTalocodeApiKey } from "./config.js";

export function createVoiceInput(
  partial: Partial<VoiceInput> & { transcript: string; source: VoiceInput["source"] }
): VoiceInput {
  return {
    id: partial.id || newId("voice"),
    timestamp: partial.timestamp || nowIso(),
    source: partial.source,
    transcript: partial.transcript,
    audioPath: partial.audioPath,
    language: partial.language || "en",
    durationMs: partial.durationMs,
  };
}

async function transcribeOpenAI(audioPath: string, language?: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new ProviderError(
      "Audio transcription unavailable. Use --text for deterministic input."
    );
  }
  const base = (process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const buf = readFileSync(audioPath);
  const form = new FormData();
  form.append("file", new Blob([buf]), audioPath.split("/").pop() || "audio.wav");
  form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1");
  if (language) form.append("language", language);

  const res = await fetch(`${base}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ProviderError(`OpenAI transcription failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { text?: string };
  if (!data.text) throw new ProviderError("OpenAI transcription returned empty text");
  return data.text;
}

async function transcribeTera(audioPath: string): Promise<string> {
  const key = resolveTalocodeApiKey();
  const base = resolveCloudApiBase();
  if (!key) {
    throw new ProviderError(
      "Tera transcription requires TALOCODE_API_KEY. Use --text if unavailable."
    );
  }
  const buf = readFileSync(audioPath);
  const form = new FormData();
  form.append("file", new Blob([buf]), audioPath.split("/").pop() || "audio.wav");
  const res = await fetch(`${base}/v1/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "X-Talocode-Api-Key": key,
    },
    body: form,
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ProviderError(`Tera transcription failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { text?: string; transcript?: string };
  const text = data.text || data.transcript;
  if (!text) throw new ProviderError("Tera transcription returned empty text");
  return text;
}

export async function dictate(input: DictateInput = {}): Promise<VoiceInput> {
  const audioPath = input.audio || input.audioPath;
  let provider: DictateProvider = input.provider || "local";

  // Deterministic text path (primary for v0.1 demos/CI)
  if (input.text !== undefined && input.text !== null && String(input.text).length > 0) {
    const voice = createVoiceInput({
      source: "text",
      transcript: String(input.text),
      language: input.language || "en",
    });
    if (input.save) saveVoice(voice);
    return voice;
  }

  if (!audioPath) {
    throw new ScreenLaneError(
      "No input. Provide --text for deterministic dictation, or --audio <path> with a transcription provider (openai|tera).",
      "DICTATE_NO_INPUT",
      400
    );
  }

  const file = assertAudioFile(audioPath);

  if (provider === "local") {
    if (resolveTalocodeApiKey()) provider = "tera";
    if (provider === "local") {
      throw new ProviderError(
        'Local mic/STT is not bundled in v0.1. Use --text "..." for deterministic input, or set TALOCODE_API_KEY for cloud transcription.'
      );
    }
  }

  let transcript: string;
  if (provider === "openai") {
    transcript = await transcribeOpenAI(file.path, input.language);
  } else if (provider === "tera") {
    transcript = await transcribeTera(file.path);
  } else {
    throw new ProviderError(`Unknown provider: ${provider}`);
  }

  const voice = createVoiceInput({
    source: "file",
    transcript,
    audioPath: file.path,
    language: input.language || "en",
    durationMs: estimateDurationMs(file.size),
  });
  if (input.save) saveVoice(voice);
  return voice;
}
