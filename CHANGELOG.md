# Changelog

## [0.1.1] — 2026-07-15

### Fixed

- npm `bin` entry points at `dist/cli.js` so `npx @talocode/screenlane` exposes the CLI

## [0.1.0] — 2026-07-15

### Added

- Initial ScreenLane release: screen-aware voice command layer for AI agents
- CLI: `init`, `capture`, `dictate`, `command`, `send`, `serve`, `mcp`, `doctor`, `demo`, `auth`
- TypeScript SDK (`ScreenLaneClient` + core helpers)
- Local HTTP API on port 3070
- MCP server (stdio) with 8 tools
- Talocode skills: screen-aware-command, screen-aware-debugging, screen-aware-writing
- Python package `talocode-screenlane` / `screenlane-py`
- Local JSON storage under `~/.screenlane`
- Auth gated solely by `TALOCODE_API_KEY` when `SCREENLANE_REQUIRE_AUTH=true`
- Deterministic demo and offline command templates
- Docs, examples, smoke tests, demo video assets
