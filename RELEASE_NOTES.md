# ScreenLane v0.1.0

**Talk to your screen.**

Open-source screen-aware voice command layer for AI agents — capture screen context, transcribe voice, generate agent-ready commands, and send actions to Tera, Codra, Codex, OpenCode, GateLane, or MCP tools.

## What's included

- **CLI** `screenlane`: init, capture, dictate, command, send, serve, mcp, doctor, demo, auth
- **TypeScript SDK** `@talocode/screenlane`
- **Local HTTP API** on port 3070
- **MCP server** (stdio) with 8 tools
- **Talocode Skills**: screen-aware-command, screen-aware-debugging, screen-aware-writing
- **Python package** `talocode-screenlane` / CLI `screenlane-py` (HTTP client + helpers)

## Install

```bash
npm install -g @talocode/screenlane
# or
npx @talocode/screenlane@latest demo
```

Python:

```bash
pip install talocode-screenlane
screenlane-py --help
```

## Demo

```bash
screenlane demo
screenlane command --text "Fix this error" --context-text "TypeError: ..." --target codra --out prompt
screenlane doctor
```

## Auth

Local-first by default. To gate the HTTP API:

```bash
export SCREENLANE_REQUIRE_AUTH=true
export TALOCODE_API_KEY=your_key
# Authorization: Bearer <TALOCODE_API_KEY>
```

Access: `TALOCODE_API_KEY` · Cloud: `https://api.talocode.site`

## Limitations (honest)

- Live microphone capture is **not** bundled; use `--text` or `--audio` + OpenAI/Tera keys
- Screenshot capture depends on OS tools (grim, scrot, screencapture, etc.) with text fallbacks
- Tera/Codra/GateLane sends require live base URLs + keys — not faked
- Command generation in v0.1 is deterministic template-based (works offline)

## Roadmap

- Native mic recording helpers
- OCR on screenshots
- Deeper local agent launchers (Codex/OpenCode)
- Richer cloud transcription providers

## License

MIT
