# ScreenLane v0.1.4

**Talk to your screen.**

## Auth & cloud (simple)

| | |
|--|--|
| **Key** | `TALOCODE_API_KEY` |
| **Cloud API** | `https://api.talocode.site` |

Local capture / command / demo work **without** a key.

## Install

```bash
npm install -g @talocode/screenlane
npx @talocode/screenlane@latest demo

pip install talocode-screenlane
```

## What's new in 0.1.4

- Local **OCR** via `tesseract` for screen/image captures
- `screenlane command --context-file image.png` OCR + fix-error flow
- Cloud providers probe Talocode-documented routes
- Professional 48s demo video (talocode-video skill / motion graphics)
- Docs: only `TALOCODE_API_KEY` + `api.talocode.site`

## Demo

```bash
screenlane demo
screenlane capture --source file --file ./error.png
screenlane command --text "Fix this error" --context-file ./error.png --target codra --out prompt
```

## Cloud status (honest)

`GET https://api.talocode.site/health` is live (Stacklane API host).  
Product chat routes (`/v1/router/chat/completions`, `/v1/tera/*`, `/v1/codra/*`) return **404** on the current deploy until the full Talocode Cloud router is live. Offline clipboard/stdout send always works.

## Limitations

- Live mic not bundled — use `--text`
- OCR needs `tesseract-ocr` installed
- Screenshots need OS tools when available

## Links

- https://github.com/talocode/screenlane  
- https://www.npmjs.com/package/@talocode/screenlane  
- https://pypi.org/project/talocode-screenlane/  
