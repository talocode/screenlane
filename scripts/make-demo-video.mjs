#!/usr/bin/env node
/**
 * Generate screenlane-demo.mp4 from SVG frames + ffmpeg (no paid AI video).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const framesDir = join(root, "demo", "frames");
const outMp4 = join(root, "screenlane-demo.mp4");

const scenes = [
  {
    t: "Talk to your screen.",
    sub: "ScreenLane v0.1",
    body: "Open-source screen-aware voice command layer",
  },
  {
    t: "Visible context",
    sub: "Terminal error on screen",
    body: "TypeError: Cannot read properties of undefined (reading 'map')\nat renderList (Dashboard.tsx:42)",
  },
  {
    t: "User instruction",
    sub: "text-mode voice simulation",
    body: '"Fix this error"',
  },
  {
    t: "screenlane capture + command",
    sub: "Context + instruction → agent prompt",
    body: "intent: debug_error\ntarget: codra\nprompt: Diagnose root cause, propose minimal patch…",
  },
  {
    t: "Route to agents",
    sub: "Codra · Tera · Codex · OpenCode · MCP · Clipboard",
    body: "Local-first. Cloud optional.",
  },
  {
    t: "ScreenLane",
    sub: "screen-aware voice command layer for AI agents",
    body: "npm i -g @talocode/screenlane\nscreenlane demo",
  },
];

function svgFor(scene, i) {
  const escape = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = scene.body.split("\n").map(escape);
  const lineEls = lines
    .map(
      (line, idx) =>
        `<text x="80" y="${340 + idx * 36}" fill="#c8d0e0" font-family="ui-monospace, monospace" font-size="22">${line}</text>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1020"/>
      <stop offset="100%" stop-color="#152038"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="40" y="40" width="1200" height="640" rx="16" fill="#111827" stroke="#334155" stroke-width="2"/>
  <text x="80" y="120" fill="#38bdf8" font-family="system-ui,sans-serif" font-size="28" font-weight="700">ScreenLane</text>
  <text x="80" y="200" fill="#f8fafc" font-family="system-ui,sans-serif" font-size="52" font-weight="700">${escape(scene.t)}</text>
  <text x="80" y="260" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="28">${escape(scene.sub)}</text>
  ${lineEls}
  <text x="80" y="640" fill="#64748b" font-family="system-ui,sans-serif" font-size="18">Scene ${i + 1}/${scenes.length} · talocode/screenlane</text>
</svg>`;
}

mkdirSync(framesDir, { recursive: true });
scenes.forEach((scene, i) => {
  writeFileSync(join(framesDir, `frame_${String(i).padStart(3, "0")}.svg`), svgFor(scene, i));
});

// Convert SVG → PNG via ffmpeg if possible, else try rsvg/inkscape, else leave SVG
const ff = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
if (ff.status !== 0) {
  console.error("ffmpeg not available — wrote SVG frames only to demo/frames/");
  process.exit(0);
}

// Use ffmpeg lavfi color + drawtext as more portable than SVG decode
const filterParts = scenes.map((scene, i) => {
  const start = i * 8;
  const end = start + 8;
  return null;
});
void filterParts;

// Generate simple color frames with drawtext
const listFile = join(framesDir, "list.txt");
const pngs = [];
for (let i = 0; i < scenes.length; i++) {
  const png = join(framesDir, `frame_${String(i).padStart(3, "0")}.png`);
  const scene = scenes[i];
  const title = scene.t.replace(/:/g, "\\:").replace(/'/g, "");
  const sub = scene.sub.replace(/:/g, "\\:").replace(/'/g, "");
  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "lavfi",
      "-i",
      "color=c=0x0b1020:s=1280x720:d=1",
      "-vf",
      `drawtext=text='ScreenLane':x=80:y=80:fontsize=28:fontcolor=0x38bdf8,drawtext=text='${title}':x=80:y=160:fontsize=40:fontcolor=white,drawtext=text='${sub}':x=80:y=230:fontsize=24:fontcolor=0x94a3b8`,
      "-frames:v",
      "1",
      png,
    ],
    { encoding: "utf8" }
  );
  if (r.status !== 0) {
    // fallback: copy a solid approach without drawtext fonts
    spawnSync(
      "ffmpeg",
      ["-y", "-f", "lavfi", "-i", `color=c=0x${(0x0b1020 + i * 0x101010).toString(16).slice(0, 6)}:s=1280x720:d=1`, "-frames:v", "1", png],
      { encoding: "utf8" }
    );
  }
  if (existsSync(png)) pngs.push(png);
}

if (!pngs.length) {
  console.error("Could not create PNG frames");
  process.exit(1);
}

writeFileSync(
  listFile,
  pngs.map((p) => `file '${p}'\nduration 8`).join("\n") + `\nfile '${pngs[pngs.length - 1]}'\n`
);

const concat = spawnSync(
  "ffmpeg",
  ["-y", "-f", "concat", "-safe", "0", "-i", listFile, "-vsync", "vfr", "-pix_fmt", "yuv420p", outMp4],
  { encoding: "utf8" }
);

if (concat.status !== 0) {
  console.error(concat.stderr);
  // alternate method
  const alt = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      "1/8",
      "-i",
      join(framesDir, "frame_%03d.png"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      outMp4,
    ],
    { encoding: "utf8" }
  );
  if (alt.status !== 0) {
    console.error(alt.stderr);
    process.exit(1);
  }
}

console.log("Wrote", outMp4);
