# CLI

```bash
screenlane --help
```

| Command | Notes |
|---------|--------|
| `init` | Create `~/.screenlane` |
| `capture` | `--source text\|file\|url\|clipboard\|screen` |
| `dictate` | Prefer `--text` |
| `command` | `--text` + context → agent prompt |
| `send` | `--target` stdout / clipboard / tera / codra / … |
| `serve` | Local API on port 3070 |
| `mcp` | MCP stdio |
| `doctor` | Diagnostics |
| `demo` | Deterministic demo |
| `auth set\|status\|clear` | `TALOCODE_API_KEY` |

Cloud send: set `TALOCODE_API_KEY` (base `https://api.talocode.site`).
