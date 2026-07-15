# Examples — screen-aware-command

## Fix terminal error

```bash
screenlane command \
  --text "Fix this error" \
  --context-file ./error.txt \
  --target codra \
  --out prompt
```

## Explain webpage

```bash
screenlane command \
  --text "Explain this page" \
  --url https://example.com/docs \
  --target tera \
  --out prompt
```

## Clipboard notes → X post

```bash
screenlane command \
  --text "Turn this into an X post" \
  --clipboard \
  --target clipboard \
  --out prompt
```
