# Examples — screen-aware-debugging

## CLI

```bash
screenlane command \
  --text "Fix this error" \
  --context-text "TypeError: Cannot read properties of undefined (reading 'map')
    at renderList (src/components/Dashboard.tsx:42:18)" \
  --target codra \
  --out prompt --save
```

## MCP

```json
{
  "name": "screenlane_command",
  "arguments": {
    "instruction": "what is wrong here",
    "contextText": "FAIL src/api.test.ts — expected 200 received 500",
    "target": "opencode",
    "save": true
  }
}
```
