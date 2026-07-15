# ScreenLane

**Talk to your screen.**

Open-source screen-aware voice command layer for AI agents. Capture what’s on your screen, take an instruction, build an agent-ready command, and send it to tools like [Tera](https://github.com/talocode/tera), [Codra](https://github.com/talocode/codra), [GateLane](https://github.com/talocode/gatelane), Codex, OpenCode, MCP, clipboard, or stdout.

> Voice alone is not the product. **Voice + screen context** is the product.

[![npm](https://img.shields.io/npm/v/@talocode/screenlane)](https://www.npmjs.com/package/@talocode/screenlane)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Install

```bash
npm install -g @talocode/screenlane
# or
npx @talocode/screenlane@latest demo
```

Requires **Node.js ≥ 18**.

## Quickstart

```bash
screenlane init
screenlane doctor
screenlane demo

screenlane command \
  --text "Fix this error" \
  --context-file ./error.txt \
  --target codra \
  --out prompt

screenlane capture --source text --text "Stack trace here..." --save
screenlane dictate --text "Explain this page" --out text
screenlane serve    # local API: http://127.0.0.1:3070
screenlane mcp      # MCP over stdio
```

## Auth & cloud

One key. One cloud base.

| | |
|--|--|
| **Key** | `TALOCODE_API_KEY` |
| **Cloud API** | `https://api.talocode.site` |

```bash
export TALOCODE_API_KEY=your_key

# Optional: gate the local HTTP API
export SCREENLANE_REQUIRE_AUTH=true
# Then clients send: Authorization: Bearer <TALOCODE_API_KEY>
```

```bash
screenlane auth set --key your_key
screenlane auth status
screenlane auth clear
```

- **Local** capture / command / demo work **without** a key.
- **Cloud** send (Tera, Codra, GateLane, …) uses `TALOCODE_API_KEY` + `https://api.talocode.site`.

## CLI

| Command | Purpose |
|---------|---------|
| `init` | Create `~/.screenlane` |
| `capture` | Screen / file / text / url / clipboard context |
| `dictate` | Instruction (`--text` recommended) |
| `command` | Build agent-ready prompt |
| `send` | Route to a target |
| `serve` | Local HTTP API (port **3070**) |
| `mcp` | MCP server (stdio) |
| `doctor` | Diagnostics |
| `demo` | Deterministic demo |
| `auth` | Manage `TALOCODE_API_KEY` |

## SDK

```ts
import { ScreenLaneClient } from "@talocode/screenlane";

// Local (no server)
const local = new ScreenLaneClient();
const cmd = await local.createCommand({
  text: "Fix this error",
  contextText: "TypeError: ...",
  target: "codra",
});

// Talk to local server
const api = new ScreenLaneClient({
  baseUrl: "http://127.0.0.1:3070",
  apiKey: process.env.TALOCODE_API_KEY,
});
```

## Local HTTP API

`screenlane serve` → `http://127.0.0.1:3070`

- `GET /health`
- `GET /v1/screenlane/doctor`
- `POST /v1/screenlane/capture|dictate|command|send|demo`
- `GET /v1/screenlane/contexts` · `commands`

When `SCREENLANE_REQUIRE_AUTH=true`:

```http
Authorization: Bearer <TALOCODE_API_KEY>
```

## MCP

```bash
screenlane mcp
```

Tools: `screenlane_capture`, `screenlane_dictate`, `screenlane_command`, `screenlane_send`, `screenlane_doctor`, `screenlane_demo`, `screenlane_list_contexts`, `screenlane_list_commands`

## How it works

```
Screen context + instruction
        ↓
Agent command (deterministic templates in v0.1)
        ↓
Tera / Codra / Codex / OpenCode / GateLane / MCP / clipboard / stdout
```

Cloud path uses **`TALOCODE_API_KEY`** against **`https://api.talocode.site`**.

## Skills

- `skills/screen-aware-command/`
- `skills/screen-aware-debugging/`
- `skills/screen-aware-writing/`

## Python

```bash
pip install talocode-screenlane
screenlane-py --help
```

## Notes

- Prefer `--text` for dictate (no bundled live mic in v0.1).
- Screenshots need OS tools when available; text/file/url always work.
- Demo is **text-mode voice simulation** (deterministic).
- More docs: [docs/](docs/) · Demo: `screenlane demo`

## Talocode ecosystem

Part of **[Talocode](https://github.com/talocode)**. Sibling projects:

| Project | What it is |
|---------|------------|
| **[ScreenLane](https://github.com/talocode/screenlane)** | Screen-aware voice commands **(this repo)** |
| **[Tera](https://github.com/talocode/tera)** | AI chat & assistant |
| **[Codra](https://github.com/talocode/codra)** | Local coding agent |
| **[GateLane](https://github.com/talocode/gatelane)** | MCP gateway |
| **[ContextLane](https://github.com/talocode/contextlane)** | Context ingestion |
| **[MemoryLane](https://github.com/talocode/memorylane)** | Agent memory |
| **[SignalLane](https://github.com/talocode/signallane)** | X growth intelligence |
| **[ReplyLane](https://github.com/talocode/replylane)** | X reply intelligence |
| **[CrawlerLane](https://github.com/talocode/crawlerlane)** | Crawler intelligence |
| **[WebDataLane](https://github.com/talocode/webdatalane)** | Web extraction |
| **[SearchLane](https://github.com/talocode/searchlane)** | Search for agents |
| **[StackLane](https://github.com/talocode/stacklane)** | Builder platform |
| **[Tradia](https://github.com/talocode/tradia)** | Trading intelligence |
| **[Agent Browser](https://github.com/talocode/agent-browser)** | Browser automation |
| **[Skills](https://github.com/talocode/skills)** | Shared agent skills |

More: [github.com/talocode](https://github.com/talocode) · [talocode.site](https://talocode.site) · [docs.talocode.site](https://docs.talocode.site)

## License

MIT © Talocode
