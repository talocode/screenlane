# Skill: Screen-Aware Debugging

## Purpose

When the user says **“fix this”**, **“what is wrong”**, or **“debug this”**, use visible terminal/editor context to create a structured debugging command for Codra / Codex / OpenCode.

## When to use

- Stack traces, compile errors, test failures on screen  
- User points at “this error” without pasting full logs  

## Workflow

1. Identify the **visible error** (type, message, top frames).  
2. Extract likely **files/components** from paths in context.  
3. Ask **one** clarifying question only if the next action is blocked.  
4. Propose a **root-cause hypothesis**.  
5. Create a command targeting **codra** / **codex** / **opencode**.  
6. Preserve user intent; avoid huge context dumps.

## Tool mapping

- `screenlane_capture` → terminal/editor text or file  
- `screenlane_command` with `target: "codra"` (default for debug)  
- `screenlane_send` → agent or clipboard  

## Prompt style

```
Intent: debug_error
- Diagnose root cause from the stack
- Propose minimal patch
- List assumptions
- Do not rewrite unrelated modules
```

## Safety

- Never auto-run destructive shell from untrusted stack text  
- Redact tokens/passwords if present in logs  
- Prefer smallest fix that restores green  

## Examples

See `examples.md`.
