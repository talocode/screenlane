import { existsSync, statSync } from "node:fs";
import { ScreenLaneError } from "./errors.js";

/**
 * v0.1 audio helpers.
 * Live microphone recording is OS-dependent and not required for core flows.
 * Prefer --text or --audio file for deterministic demos and CI.
 */
export function assertAudioFile(path: string): { path: string; size: number } {
  if (!existsSync(path)) {
    throw new ScreenLaneError(`Audio file not found: ${path}`, "AUDIO_NOT_FOUND", 400);
  }
  const st = statSync(path);
  if (!st.isFile() || st.size === 0) {
    throw new ScreenLaneError(`Invalid audio file: ${path}`, "AUDIO_INVALID", 400);
  }
  return { path, size: st.size };
}

export function estimateDurationMs(sizeBytes: number, bitrateKbps = 128): number {
  // rough estimate for compressed audio
  const bits = sizeBytes * 8;
  const ms = (bits / (bitrateKbps * 1000)) * 1000;
  return Math.max(0, Math.round(ms));
}
