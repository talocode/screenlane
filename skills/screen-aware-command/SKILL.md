# Skill: Screen-Aware Command

## Purpose

Teach agents how to use **ScreenLane** to turn voice (or typed instruction) + current screen context into precise agent actions.

## When to use

- User refers to “this”, “that error”, “this page”, “what’s on screen”
- Visible UI/terminal/docs matter more than chat history alone
- You need a clean, portable prompt for Codra, Codex, OpenCode, Tera, or MCP tools

## Workflow

1. **Capture context** — `screenlane_capture` or CLI `screenlane capture`  
   Prefer explicit text/file/url when screenshots lack OCR.
2. **Capture instruction** — `screenlane_dictate` with `--text` or transcript.
3. **Build command** — `screenlane_command` with target (codra/tera/…).
4. **Review safety notes** on the command object.
5. **Send** — `screenlane_send` to clipboard/stdout offline, or live targets if keys exist.

## Tool mapping

| Step | MCP tool | CLI |
|------|----------|-----|
| Context | `screenlane_capture` | `screenlane capture` |
| Voice | `screenlane_dictate` | `screenlane dictate` |
| Build | `screenlane_command` | `screenlane command` |
| Route | `screenlane_send` | `screenlane send` |

## Prompt style

- Lead with role + intent  
- Include a **truncated** context block, not a full dump  
- End with concrete requirements and safety constraints  

## Safety

- Do not exfiltrate secrets from screen context  
- Prefer minimal fixes over rewrites  
- Confirm destructive intent  
- Local-first: do not require cloud for command construction  

## Examples

See `examples.md`.
