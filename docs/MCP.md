# MCP

Start:

```bash
screenlane mcp
# or
node dist/mcp/server.js
```

Transport: **stdio JSON-RPC** (line-delimited JSON).  
**stdout** = protocol only · **stderr** = diagnostics.

## Tools

| Tool | Description |
|------|-------------|
| `screenlane_capture` | Capture context |
| `screenlane_dictate` | Text/audio → transcript |
| `screenlane_command` | Build agent command |
| `screenlane_send` | Route command |
| `screenlane_doctor` | Diagnostics |
| `screenlane_demo` | Deterministic demo |
| `screenlane_list_contexts` | List saved contexts |
| `screenlane_list_commands` | List saved commands |

## Example client config

```json
{
  "mcpServers": {
    "screenlane": {
      "command": "npx",
      "args": ["-y", "@talocode/screenlane", "mcp"]
    }
  }
}
```

## Test

```bash
node scripts/test-mcp.mjs
```
