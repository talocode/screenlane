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

Live `screenlane send --target tera` needs `TALOCODE_API_KEY` → `https://api.talocode.site`.
