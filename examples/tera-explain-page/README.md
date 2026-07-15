# Example: explain page (Tera-oriented)

```bash
screenlane command \
  --text "Explain this page" \
  --url https://example.com \
  --target tera \
  --out prompt

# Offline-safe send
screenlane send --target clipboard --text "$(screenlane command --text "Explain this page" --context-text "..." --out prompt)"
```

Live `screenlane send --target tera` requires `TALOCODE_API_KEY` (cloud base: `https://api.talocode.site`).
