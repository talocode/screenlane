# Security

## Local-first

- Default storage: `~/.screenlane/` (contexts, commands, config)
- Core capture/command/demo work **without** network or `TALOCODE_API_KEY`

## API keys

- Use `TALOCODE_API_KEY` for API auth and cloud targets
- Optional: `screenlane auth set --key ...` writes `~/.screenlane/auth.json` with mode `0600`
- Never commit `.env` or auth files
- CLI `auth status` prints **masked** keys only
- Outputs run through secret redaction for common patterns

## Auth model

| Mode | Behavior |
|------|----------|
| Default | Local API open on localhost |
| `SCREENLANE_REQUIRE_AUTH=true` | Require Bearer / `X-Talocode-Api-Key` matching `TALOCODE_API_KEY` |

Health endpoints stay public.

## Clipboard / screen

OS clipboard and screenshot tools may access sensitive UI. Review prompts before sending to external agents.

## Reporting

Open a private security report via GitHub Security Advisories on `talocode/screenlane`.
