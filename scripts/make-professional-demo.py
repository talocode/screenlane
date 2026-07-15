#!/usr/bin/env python3
"""Professional ScreenLane demo frames (talocode-video skill) → ffmpeg MP4."""
from __future__ import annotations

import subprocess
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    subprocess.check_call(
        ["pip", "install", "pillow", "--break-system-packages", "-q"]
    )
    from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FRAMES = ROOT / "demo" / "frames_pro"
OUT = ROOT / "screenlane-demo.mp4"
W, H = 1280, 720
FPS = 30

# Talocode dark theme
BG = (28, 28, 28)
PANEL = (15, 20, 25)
PRIMARY = (88, 196, 221)
SECONDARY = (131, 193, 103)
ERROR = (255, 107, 107)
TEXT = (255, 255, 255)
MUTED = (136, 136, 136)
SOFT = (152, 167, 187)
ACCENT = (255, 255, 0)


def font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for c in candidates:
        if Path(c).exists():
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def mono(size: int):
    for c in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    ):
        if Path(c).exists():
            return ImageFont.truetype(c, size)
    return font(size)


def gradient_bg() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # soft top accent band
    d.rectangle((0, 0, W, 120), fill=(22, 32, 42))
    d.ellipse((-80, -80, 420, 280), fill=(35, 55, 70))
    d.ellipse((W - 360, -40, W + 80, 260), fill=(30, 50, 40))
    return img


def chrome(draw: ImageDraw.ImageDraw, title: str = "ScreenLane"):
    draw.text((48, 28), title, fill=PRIMARY, font=font(22, True))
    draw.text((W - 280, 32), "talocode/screenlane", fill=MUTED, font=font(16))


def caption(draw: ImageDraw.ImageDraw, text: str):
    # bar
    y0 = H - 78
    draw.rounded_rectangle((48, y0, W - 48, H - 32), radius=12, fill=(0, 0, 0, 180))
    # PIL RGB no alpha on draw - solid
    draw.rounded_rectangle((48, y0, W - 48, H - 32), radius=12, fill=(12, 12, 12))
    draw.rounded_rectangle((48, y0, W - 48, H - 32), radius=12, outline=(50, 50, 50))
    # center-ish
    bbox = draw.textbbox((0, 0), text, font=font(22, True))
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, y0 + 14), text, fill=TEXT, font=font(22, True))


def terminal(draw: ImageDraw.ImageDraw, x, y, w, h, title, lines):
    draw.rounded_rectangle((x, y, x + w, y + h), radius=16, fill=(10, 14, 19), outline=(45, 45, 45))
    draw.rounded_rectangle((x, y, x + w, y + 40), radius=16, fill=(25, 30, 36))
    draw.rectangle((x, y + 24, x + w, y + 40), fill=(25, 30, 36))
    for i, col in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse((x + 16 + i * 22, y + 14, x + 28 + i * 22, y + 26), fill=col)
    draw.text((x + 100, y + 12), title, fill=MUTED, font=font(14))
    ty = y + 56
    for color, line in lines:
        draw.text((x + 24, ty), line, fill=color, font=mono(18))
        ty += 28


def scene_hook(frame: int, total: int) -> Image.Image:
    img = gradient_bg()
    d = ImageDraw.Draw(img)
    chrome(d)
    # fade progress
    t = frame / max(1, total - 1)
    d.text((W // 2 - 320, 220), "Talk to your screen.", fill=TEXT, font=font(64, True))
    d.text((W // 2 - 300, 320), "Screen-aware voice commands for AI agents", fill=SOFT, font=font(26))
    # pill
    d.rounded_rectangle((W // 2 - 160, 400, W // 2 + 160, 450), radius=24, outline=PRIMARY)
    d.text((W // 2 - 120, 412), "ScreenLane · open source", fill=PRIMARY, font=font(18, True))
    caption(d, "Voice + screen context is the product")
    return img


def scene_pain(frame: int, total: int) -> Image.Image:
    img = gradient_bg()
    d = ImageDraw.Draw(img)
    chrome(d)
    d.text((48, 90), "The terminal is screaming.", fill=TEXT, font=font(40, True))
    d.text((48, 145), "You know what to say. Your agent needs the context too.", fill=SOFT, font=font(22))
    progress = frame / max(1, total - 1)
    lines = [
        (ERROR, "TypeError: Cannot read properties of undefined (reading 'map')"),
        (SOFT, "  at renderList (Dashboard.tsx:42)"),
        (SOFT, "  at fetchItems (api.ts:15)"),
        (SOFT, ""),
        (ACCENT, '> "Fix this error"'),
    ]
    shown = max(1, int(progress * len(lines) + 0.5))
    terminal(d, 48, 200, W - 96, 320, "npm run dev", lines[:shown])
    caption(d, "text-mode voice simulation for deterministic demo")
    return img


def scene_workflow(frame: int, total: int) -> Image.Image:
    img = gradient_bg()
    d = ImageDraw.Draw(img)
    chrome(d)
    d.text((48, 90), "One command. Agent-ready.", fill=TEXT, font=font(40, True))
    d.text((48, 145), "Capture context → build intent → route to Codra / Tera / clipboard", fill=SOFT, font=font(20))
    progress = frame / max(1, total - 1)
    lines = [
        (SECONDARY, "$ screenlane demo"),
        (SOFT, ""),
        (PRIMARY, "intent:  debug_error"),
        (PRIMARY, "target:  codra"),
        (SOFT, ""),
        (SOFT, "prompt: You are Codra… Diagnose root cause,"),
        (SOFT, "propose a minimal patch, apply carefully."),
    ]
    shown = max(1, int(progress * len(lines) + 0.5))
    terminal(d, 48, 190, W - 96, 340, "screenlane", lines[:shown])
    caption(d, "Deterministic templates · works offline · OCR when tesseract is present")
    return img


def scene_cloud(frame: int, total: int) -> Image.Image:
    img = gradient_bg()
    d = ImageDraw.Draw(img)
    chrome(d)
    d.text((48, 120), "Simple by design", fill=TEXT, font=font(44, True))
    d.text((48, 185), "One key. One cloud base.", fill=SOFT, font=font(26))
    # cards
    d.rounded_rectangle((48, 260, 600, 420), radius=18, fill=PANEL, outline=(50, 50, 50))
    d.text((80, 290), "KEY", fill=MUTED, font=font(16))
    d.text((80, 330), "TALOCODE_API_KEY", fill=PRIMARY, font=mono(28))

    d.rounded_rectangle((640, 260, W - 48, 420), radius=18, fill=PANEL, outline=(50, 50, 50))
    d.text((680, 290), "CLOUD API", fill=MUTED, font=font(16))
    d.text((680, 330), "api.talocode.site", fill=SECONDARY, font=mono(26))

    d.text((48, 460), "Local capture / command / demo work without a key.", fill=SOFT, font=font(22))
    caption(d, "Gate access with TALOCODE_API_KEY only")
    return img


def scene_cta(frame: int, total: int) -> Image.Image:
    img = gradient_bg()
    d = ImageDraw.Draw(img)
    chrome(d)
    d.text((W // 2 - 220, 180), "Ship the layer.", fill=TEXT, font=font(56, True))
    d.text(
        (W // 2 - 380, 260),
        "ScreenLane — screen-aware voice command layer for AI agents",
        fill=SOFT,
        font=font(22),
    )
    d.rounded_rectangle((W // 2 - 300, 340, W // 2 + 300, 410), radius=14, outline=PRIMARY, fill=(10, 14, 19))
    d.text((W // 2 - 250, 360), "npm i -g @talocode/screenlane", fill=PRIMARY, font=mono(24))
    d.text((W // 2 - 230, 440), "npx @talocode/screenlane@latest demo", fill=SECONDARY, font=mono(20))
    d.text((W // 2 - 280, 500), "github.com/talocode/screenlane · api.talocode.site", fill=MUTED, font=font(18))
    caption(d, "Talk to your screen.")
    return img


SCENES = [
    (3, scene_hook),
    (7, scene_pain),
    (18, scene_workflow),
    (12, scene_cloud),
    (8, scene_cta),
]


def main():
    FRAMES.mkdir(parents=True, exist_ok=True)
    # clear old
    for p in FRAMES.glob("*.png"):
        p.unlink()

    idx = 0
    for sec, fn in SCENES:
        n = sec * FPS
        for i in range(n):
            img = fn(i, n)
            img.save(FRAMES / f"f_{idx:05d}.png")
            idx += 1
            if idx % 60 == 0:
                print(f"frame {idx}")

    print(f"wrote {idx} frames")
    # encode
    cmd = [
        "ffmpeg",
        "-y",
        "-framerate",
        str(FPS),
        "-i",
        str(FRAMES / "f_%05d.png"),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "18",
        "-movflags",
        "+faststart",
        str(OUT),
    ]
    print(" ".join(cmd))
    subprocess.check_call(cmd)
    print("OUT", OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
