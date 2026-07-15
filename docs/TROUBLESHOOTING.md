# Troubleshooting

## Screenshot capture failed

Install a tool (`grim`, `scrot`, etc.) or use:

```bash
screenlane capture --source text --text "..."
screenlane capture --source file --file ./context.txt
```

## Dictate fails without --text

v0.1 has no bundled mic STT. Use:

```bash
screenlane dictate --text "your words"
```

## Cloud send errors

Need the service base URL and `TALOCODE_API_KEY`. Offline:

```bash
screenlane send --target clipboard --text "..."
screenlane send --target stdout --text "..."
```

## API 401

`SCREENLANE_REQUIRE_AUTH=true` requires:

```http
Authorization: Bearer <TALOCODE_API_KEY>
```

## MCP client sees logs as protocol errors

Ensure nothing writes non-JSON to **stdout**. ScreenLane MCP uses stderr for diagnostics only.

## Permission denied writing ~/.screenlane

Check home directory permissions or set `SCREENLANE_HOME` to a writable path.
