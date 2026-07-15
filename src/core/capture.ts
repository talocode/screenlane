import { execFileSync, execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { platform as osPlatform } from "node:os";
import type { CaptureInput, ContextSource, ScreenContext } from "./types.js";
import { CaptureError } from "./errors.js";
import { getCapturesDir, getPlatform, ensureDirs } from "./config.js";
import { newId, nowIso } from "./ids.js";
import { saveContext } from "./storage.js";

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

export function listScreenshotTools(): { name: string; available: boolean }[] {
  const tools =
    osPlatform() === "darwin"
      ? ["screencapture"]
      : osPlatform() === "win32"
        ? ["powershell"]
        : ["grim", "gnome-screenshot", "import", "scrot", "spectacle"];
  return tools.map((name) => ({ name, available: Boolean(which(name)) }));
}

export function listClipboardTools(): { name: string; available: boolean }[] {
  const tools =
    osPlatform() === "darwin"
      ? ["pbpaste"]
      : osPlatform() === "win32"
        ? ["powershell"]
        : ["wl-paste", "xclip", "xsel"];
  return tools.map((name) => ({ name, available: Boolean(which(name)) }));
}

function tryScreenshot(): { imagePath?: string; note: string } {
  ensureDirs();
  const dir = getCapturesDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const imagePath = join(dir, `capture_${Date.now()}.png`);
  const plat = osPlatform();

  if (plat === "darwin" && which("screencapture")) {
    try {
      execFileSync("screencapture", ["-x", imagePath], { stdio: "ignore" });
      if (existsSync(imagePath)) return { imagePath, note: "Captured with screencapture" };
    } catch {
      /* fall through */
    }
  }

  if (plat === "linux" || plat === "freebsd") {
    const attempts: Array<[string, string[]]> = [
      ["grim", [imagePath]],
      ["gnome-screenshot", ["-f", imagePath]],
      ["import", ["-window", "root", imagePath]],
      ["scrot", [imagePath]],
      ["spectacle", ["-b", "-n", "-o", imagePath]],
    ];
    for (const [cmd, args] of attempts) {
      if (!which(cmd)) continue;
      try {
        execFileSync(cmd, args, { stdio: "ignore", timeout: 15000 });
        if (existsSync(imagePath)) return { imagePath, note: `Captured with ${cmd}` };
      } catch {
        /* try next */
      }
    }
  }

  if (plat === "win32") {
    try {
      const ps = `
Add-Type -AssemblyName System.Windows.Forms,System.Drawing
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$bmp.Save('${imagePath.replace(/'/g, "''")}')
$g.Dispose(); $bmp.Dispose()
`;
      execFileSync("powershell", ["-NoProfile", "-Command", ps], {
        stdio: "ignore",
        timeout: 20000,
      });
      if (existsSync(imagePath)) return { imagePath, note: "Captured with PowerShell" };
    } catch {
      /* fall through */
    }
  }

  return {
    note:
      "No screenshot tool available. Install grim, gnome-screenshot, scrot, spectacle, ImageMagick import (Linux), screencapture (macOS), or use --source text|file|url|clipboard.",
  };
}

function readClipboardText(): string | null {
  const plat = osPlatform();
  try {
    if (plat === "darwin" && which("pbpaste")) {
      return execFileSync("pbpaste", [], { encoding: "utf8" });
    }
    if (plat === "win32") {
      return execFileSync(
        "powershell",
        ["-NoProfile", "-Command", "Get-Clipboard -Raw"],
        { encoding: "utf8" }
      );
    }
    if (which("wl-paste")) {
      return execFileSync("wl-paste", ["-n"], { encoding: "utf8" });
    }
    if (which("xclip")) {
      return execFileSync("xclip", ["-selection", "clipboard", "-o"], { encoding: "utf8" });
    }
    if (which("xsel")) {
      return execFileSync("xsel", ["--clipboard", "--output"], { encoding: "utf8" });
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchUrlText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ScreenLane/0.1.0 (+https://github.com/talocode/screenlane)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new CaptureError(`Failed to fetch URL (${res.status}): ${url}`);
    const html = await res.text();
    // crude text extraction for offline-friendly context
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000);
    return text || `(empty body from ${url})`;
  } catch (err) {
    if (err instanceof CaptureError) throw err;
    throw new CaptureError(
      `Could not fetch URL: ${url}. ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export function createScreenContext(
  partial: Partial<ScreenContext> & { source: ContextSource }
): ScreenContext {
  return {
    id: partial.id || newId("ctx"),
    timestamp: partial.timestamp || nowIso(),
    platform: partial.platform || getPlatform(),
    source: partial.source,
    title: partial.title,
    appName: partial.appName,
    url: partial.url,
    text: partial.text,
    imagePath: partial.imagePath,
    metadata: partial.metadata,
  };
}

export async function capture(input: CaptureInput = {}): Promise<ScreenContext> {
  const source: ContextSource = input.source || (input.url ? "url" : input.file ? "file" : input.text ? "text" : "screen");

  let text = input.text;
  let url = input.url;
  let imagePath: string | undefined;
  let title = input.title;
  let appName = input.appName;
  const metadata: Record<string, unknown> = { captureMode: source };

  if (source === "text" || source === "manual") {
    if (!text) throw new CaptureError("Provide --text for text/manual capture");
    title = title || "Manual text context";
  } else if (source === "file") {
    if (!input.file) throw new CaptureError("Provide --file for file capture");
    if (!existsSync(input.file)) throw new CaptureError(`File not found: ${input.file}`);
    text = readFileSync(input.file, "utf8").slice(0, 100_000);
    title = title || input.file;
    metadata.file = input.file;
  } else if (source === "url") {
    if (!url) throw new CaptureError("Provide --url for url capture");
    text = await fetchUrlText(url);
    title = title || url;
  } else if (source === "clipboard") {
    const clip = readClipboardText();
    if (!clip) {
      throw new CaptureError(
        "Clipboard tools unavailable or clipboard empty. Install wl-paste/xclip/xsel (Linux) or pbpaste (macOS), or use --source text."
      );
    }
    text = clip.slice(0, 100_000);
    title = title || "Clipboard";
  } else if (source === "screen" || source === "window") {
    const shot = tryScreenshot();
    imagePath = shot.imagePath;
    metadata.captureNote = shot.note;
    if (!imagePath && !text) {
      // Deterministic fallback: do not fail silently
      text =
        "[ScreenLane] Screenshot tools unavailable. Provide --text, --file, --url, or --source clipboard for context.\n" +
        shot.note;
      title = title || "Fallback manual context";
      metadata.fallback = true;
    } else if (imagePath) {
      title = title || "Screen capture";
      text =
        text ||
        `[Screen capture saved to ${imagePath}]. OCR is not included in v0.1; pair with --text for agent-ready text context.`;
    }
  }

  const ctx = createScreenContext({
    source: metadata.fallback ? "manual" : source,
    text,
    url,
    imagePath,
    title,
    appName,
    metadata,
  });

  if (input.save) {
    saveContext(ctx);
  }

  return ctx;
}

/** Write a small marker file for CI-safe tests */
export function writeManualCaptureFile(text: string, outPath?: string): string {
  ensureDirs();
  const path = outPath || join(getCapturesDir(), `manual_${Date.now()}.txt`);
  writeFileSync(path, text, "utf8");
  return path;
}

export function toolAvailable(cmd: string): boolean {
  return Boolean(which(cmd));
}

// silence unused import if execSync unused
void execSync;
