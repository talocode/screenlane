# CLI Reference

Binary: `screenlane`

## Global

```bash
screenlane --help
screenlane --version
```

## init

Create `~/.screenlane/config.json` and storage directories.

```bash
screenlane init
```

## capture

```bash
screenlane capture [--source screen|window|clipboard|file|text|url|manual]
                   [--file path] [--text "..."] [--url URL]
                   [--out json|text] [--save]
```

Examples:

```bash
screenlane capture --source text --text "error log..." --save
screenlane capture --source file --file ./trace.txt
screenlane capture --source url --url https://example.com
screenlane capture --source clipboard
screenlane capture --source screen   # uses OS tools; falls back with clear message
```

## dictate

```bash
screenlane dictate [--text "..."] [--audio path]
                   [--provider local|openai|tera]
                   [--out json|text] [--save]
```

v0.1: **always** prefer `--text` for demos/CI.

## command

```bash
screenlane command --text "Fix this error" \
  [--context-file path] [--context-text "..."] [--url URL] [--clipboard] \
  [--target tera|codra|codex|opencode|gatelane|mcp|clipboard|stdout] \
  [--out json|text|prompt] [--save]
```

## send

```bash
screenlane send --target stdout --text "prompt..."
screenlane send --target clipboard --text "prompt..."
screenlane send --target codra --command-id <id>
screenlane send --target tera --command-file command.json
```

## serve

```bash
screenlane serve [--port 3070] [--host 127.0.0.1]
```

## mcp

```bash
screenlane mcp
```

## doctor

```bash
screenlane doctor [--out text|json]
```

## demo

```bash
screenlane demo [--save] [--target codra] [--out json|text|prompt]
```

Uses **text-mode voice simulation** (no live mic).

## auth

Manages `TALOCODE_API_KEY`:

```bash
screenlane auth set --key <key>   # does not print full key
screenlane auth status
screenlane auth clear
```
