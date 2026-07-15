# Security

- Local-first storage under `~/.screenlane/`
- Core capture / command / demo work without a key
- Cloud and gated API use **`TALOCODE_API_KEY`**
- Cloud base: **`https://api.talocode.site`**
- `screenlane auth set` stores the key with mode `0600`
- Never commit real keys
