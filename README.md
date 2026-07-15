# ScreenLane

**Talk to your screen.**

Open-source screen-aware voice command layer for AI agents — capture screen context, transcribe voice, generate agent-ready commands, and send actions to Tera, Codra, Codex, OpenCode, GateLane, or any MCP-compatible workflow.

> Voice alone is not the product. **Voice + screen context** is the product.

[![npm](https://img.shields.io/npm/v/@talocode/screenlane)](https://www.npmjs.com/package/@talocode/screenlane)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why ScreenLane

Builders already say things like:

- “Fix this error” while a terminal stack trace is visible  
- “Explain this page” while a docs tab is open  
- “Review this UI” while an app screen is up  
- “Turn this into an X post” while notes are visible  
- “Reply to this politely” while an email is open  
- “Write the prompt for this issue” while Codex / OpenCode is open  

ScreenLane turns that into a **structured, agent-ready command** — locally, without requiring cloud for core flows.

## How it works

```
User voice + screen
        ↓
ScreenLane capture / dictate
        ↓
Screen context + instruction
        ↓
Agent command builder (deterministic templates in v0.1)
        ↓
Tera / Codra / Codex / OpenCode / GateLane / MCP / Clipboard / stdout
```

## Install

```bash
npm install -g @talocode/screenlane
# or one-shot
npx @talocode/screenlane@latest demo
```

Python client (talks to local API):

```bash
pip install talocode-screenlane
```

Requirements: **Node.js ≥ 18**.

## Quickstart

```bash
screenlane init
screenlane doctor
screenlane demo

# Build a command from instruction + context
screenlane command \
  --text "Fix this error" \
  --context-file ./error.txt \
  --target codra \
  --out prompt

# Capture text context explicitly (always works)
screenlane capture --source text --text "Stack trace here..." --save

# Dictation: deterministic text mode (recommended for CI/demos)
screenlane dictate --text "Explain this page" --out text

# Local API
screenlane serve   # http://127.0.0.1:3070

# MCP (stdio)
screenlane mcp
```

## CLI

| Command | Purpose |
|--------|---------|
| `screenlane init` | Create `~/.screenlane` config |
| `screenlane capture` | Capture screen/window/file/text/url/clipboard |
| `screenlane dictate` | Voice/text input (`--text` or `--audio`) |
| `screenlane command` | Build agent-ready command |
| `screenlane send` | Route to target |
| `screenlane serve` | Local HTTP API (port **3070**) |
| `screenlane mcp` | MCP server over stdio |
| `screenlane doctor` | Environment diagnostics |
| `screenlane demo` | Deterministic end-to-end demo |
| `screenlane auth` | Set/status/clear **TALOCODE_API_KEY** |

See [docs/CLI.md](docs/CLI.md).

## SDK

```ts
import {
  ScreenLaneClient,
  createCommand,
  capture,
  buildAgentPrompt,
} from "@talocode/screenlane";

// In-process (no server)
const client = new ScreenLaneClient();
const cmd = await client.createCommand({
  text: "Fix this error",
  contextText: "TypeError: ...",
  target: "codra",
});

// HTTP mode
const remote = new ScreenLaneClient({
  baseUrl: "http://127.0.0.1:3070",
  apiKey: process.env.TALOCODE_API_KEY,
});
```

See [docs/SDK.md](docs/SDK.md).

## API

Default: `http://127.0.0.1:3070`

| Method | Path |
|--------|------|
| GET | `/health`, `/v1/screenlane/health` |
| GET | `/v1/screenlane/doctor` |
| POST | `/v1/screenlane/capture` |
| POST | `/v1/screenlane/dictate` |
| POST | `/v1/screenlane/command` |
| POST | `/v1/screenlane/send` |
| GET | `/v1/screenlane/contexts`, `/contexts/:id` |
| GET | `/v1/screenlane/commands`, `/commands/:id` |
| POST | `/v1/screenlane/demo` |

**Auth:** local open by default. When `SCREENLANE_REQUIRE_AUTH=true`, send:

```http
Authorization: Bearer <TALOCODE_API_KEY>
```

See [docs/API.md](docs/API.md).

## MCP tools

- `screenlane_capture`
- `screenlane_dictate`
- `screenlane_command`
- `screenlane_send`
- `screenlane_doctor`
- `screenlane_demo`
- `screenlane_list_contexts`
- `screenlane_list_commands`

See [docs/MCP.md](docs/MCP.md).

## Skills

Talocode skills under `skills/`:

1. **screen-aware-command** — general voice + screen → action  
2. **screen-aware-debugging** — “fix this” against terminal/editor context  
3. **screen-aware-writing** — replies, X posts, docs from visible context  

See [docs/SKILLS.md](docs/SKILLS.md).

## Python package

Package: `talocode-screenlane` · CLI: `screenlane-py`  
See [docs/PYTHON.md](docs/PYTHON.md) and [python/README.md](python/README.md).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `TALOCODE_API_KEY` | API access (when auth required) and cloud targets |
| `SCREENLANE_REQUIRE_AUTH` | `true` → require `Authorization: Bearer <TALOCODE_API_KEY>` |
| Cloud API base | **`https://api.talocode.site`** (default) |
| `SCREENLANE_API_BASE_URL` / `TALOCODE_API_BASE_URL` / `TALOCODE_BASE_URL` | Optional override of cloud base |
| `SCREENLANE_HOME` | Override `~/.screenlane` |
| `SCREENLANE_PORT` | Local API port (default 3070) |

Local capture/command/demo do not require `TALOCODE_API_KEY`. Cloud send uses `https://api.talocode.site` by default.

## Security & privacy

- Local-first: contexts and commands live under `~/.screenlane/` as JSON  
- Do not commit API keys; use env or `screenlane auth set` (file mode `0600`)  
- Auth store never prints full keys  
- See [docs/SECURITY.md](docs/SECURITY.md)

## OS support

| Capability | Notes |
|------------|--------|
| Text / file / url context | Works everywhere |
| Clipboard | Needs `wl-paste`/`xclip`/`xsel` (Linux), `pbpaste` (macOS) |
| Screenshots | Linux: grim, gnome-screenshot, import, scrot, spectacle · macOS: screencapture · Windows: PowerShell helper |
| Mic | **Not bundled in v0.1** — use `--text` or `--audio` + provider |
| CI | Fully deterministic via text modes + `screenlane demo` |

Missing tools produce **clear errors or documented fallbacks**, never silent success.

## Demo video

- Asset: `screenlane-demo.mp4`  
- Storyboard / script / captions under `demo/`  
- Demo uses **text-mode voice simulation** for determinism  

```bash
screenlane demo
node scripts/make-demo-video.mjs   # requires ffmpeg
```

See [docs/VIDEO.md](docs/VIDEO.md).

## Talocode ecosystem

Part of **[Talocode](https://github.com/talocode)** — open-source workflow layers for builders. Explore sibling projects:

| Project | What it is |
|---------|------------|
| **[ScreenLane](https://github.com/talocode/screenlane)** | Screen-aware voice command layer **(this repo)** |
| **[Tera](https://github.com/talocode/tera)** | AI chat & assistant |
| **[Codra](https://github.com/talocode/codra)** | Local coding agent |
| **[GateLane](https://github.com/talocode/gatelane)** | MCP gateway & agent tool control plane |
| **[ContextLane](https://github.com/talocode/contextlane)** | Context ingestion for persistent agents |
| **[MemoryLane](https://github.com/talocode/memorylane)** | Persistent agent memory |
| **[SignalLane](https://github.com/talocode/signallane)** | X growth intelligence |
| **[ReplyLane](https://github.com/talocode/replylane)** | X reply opportunity intelligence |
| **[CrawlerLane](https://github.com/talocode/crawlerlane)** | Crawler / SEO intelligence |
| **[WebDataLane](https://github.com/talocode/webdatalane)** | Web extraction to structured data |
| **[SearchLane](https://github.com/talocode/searchlane)** | Search layer for agents |
| **[InvoiceLane](https://github.com/talocode/invoicelane)** | Invoicing tools |
| **[GeoLane](https://github.com/talocode/geolane)** | Geo intelligence |
| **[UgcLane](https://github.com/talocode/ugclane)** | UGC workflows |
| **[OpenSourceLane](https://github.com/talocode/opensourcelane)** | Open-source distribution tools |
| **[StackLane](https://github.com/talocode/stacklane)** | Builder stack platform |
| **[Tradia](https://github.com/talocode/tradia)** | Trading intelligence |
| **[Agent Browser](https://github.com/talocode/agent-browser)** | Browser automation for agents |
| **[Talocode](https://github.com/talocode/talocode)** | Org home & control plane |
| **[Skills](https://github.com/talocode/skills)** | Shared agent skills |
| **[X Agent](https://github.com/talocode/x-agent)** | X automation agent |
| **[LaunchPix](https://github.com/talocode/launchpix)** | Launch tooling |
| **[ForgeCAD](https://github.com/talocode/forgecad)** | CAD workflows |
| **[WorkLane](https://github.com/talocode/worklane)** | Work automation |
| **[ClipLoop](https://github.com/talocode/cliploop)** | Clip / video loops |

MCP-compatible agents integrate via each product's MCP server where available ([Model Context Protocol](https://modelcontextprotocol.io/)).

More: [github.com/talocode](https://github.com/talocode) · [talocode.site](https://talocode.site) · [docs.talocode.site](https://docs.talocode.site)

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).

## Limitations (v0.1 — honest)

- Live microphone capture is not shipped; prefer `--text` or audio files + keys  
- Screenshot capture depends on OS tools/permissions  
- Command generation is **deterministic templates** (no cloud LLM required)  
- Tera / Codra / GateLane integrations need real base URLs and `TALOCODE_API_KEY` — not faked  
- OCR on screenshots is not included  

## Contributing

PRs welcome. Keep the product local-first, secret-free in git, and honest about fallbacks.

```bash
npm install
npm run build
npm test
node scripts/smoke-test.mjs
```

## License

MIT © Talocode
