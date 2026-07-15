import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

export interface OcrResult {
  text: string;
  engine: "tesseract" | "none";
  note: string;
}

function which(cmd: string): string | null {
  try {
    const out = execFileSync(process.platform === "win32" ? "where" : "which", [cmd], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out.split(/\r?\n/)[0] || null;
  } catch {
    return null;
  }
}

export function ocrAvailable(): boolean {
  return Boolean(which("tesseract"));
}

/**
 * Best-effort OCR for screenshot PNGs.
 * Uses system `tesseract` when installed — no cloud required.
 */
export function runOcr(imagePath: string, lang = "eng"): OcrResult {
  if (!existsSync(imagePath)) {
    return { text: "", engine: "none", note: `Image not found: ${imagePath}` };
  }
  if (!which("tesseract")) {
    return {
      text: "",
      engine: "none",
      note: "OCR unavailable. Install tesseract-ocr for screen text extraction, or pass --text / --file.",
    };
  }
  try {
    const text = execFileSync(
      "tesseract",
      [imagePath, "stdout", "-l", lang, "--psm", "6"],
      {
        encoding: "utf8",
        timeout: 60000,
        maxBuffer: 4 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
      }
    ).trim();
    return {
      text: text.slice(0, 100_000),
      engine: "tesseract",
      note: text
        ? `OCR extracted ${text.length} chars via tesseract`
        : "OCR ran but extracted no text",
    };
  } catch (err) {
    return {
      text: "",
      engine: "tesseract",
      note: `OCR failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
