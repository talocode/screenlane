# Demo video plan

## Goal

30–60 second product video: **Talk to your screen.**

## Assets

| File | Purpose |
|------|---------|
| `screenlane-demo.mp4` | Rendered demo |
| `demo/storyboard.md` | Shot list |
| `demo/script.md` | Narration |
| `demo/captions.srt` | Subtitles |
| `demo/demo-output.json` | Real CLI demo snapshot |

## Generation

```bash
screenlane demo --out json > demo/demo-output.json
node scripts/make-demo-video.mjs   # needs ffmpeg
```

If ffmpeg is missing: SVG/PNG frames remain under `demo/frames/`.

## Honesty

Demo uses **text-mode voice simulation** — not a live microphone recording.
