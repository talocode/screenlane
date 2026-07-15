# Skills

ScreenLane ships Talocode skills under `skills/`.

## Install / use

Copy a skill folder into your agent skills directory, or reference paths from this repo:

- `skills/screen-aware-command/`
- `skills/screen-aware-debugging/`
- `skills/screen-aware-writing/`

Each skill includes:

- `SKILL.md` — when to use, workflow, safety  
- `examples.md` — concrete prompts  
- `tools.json` — MCP/tool mapping  

## Mapping

| User says | Skill | Target bias |
|-----------|-------|-------------|
| “do this with what’s on screen” | screen-aware-command | any |
| “fix this”, “what’s wrong” | screen-aware-debugging | codra / codex / opencode |
| “reply”, “draft a post”, “write update” | screen-aware-writing | tera / clipboard |
