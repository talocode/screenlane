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

Live `screenlane send --target tera` requires `TERA_API_BASE_URL` and `TALOCODE_API_KEY`.
