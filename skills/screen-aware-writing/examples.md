# Examples — screen-aware-writing

## Polite email reply

```bash
screenlane command \
  --text "Reply to this politely and propose next week" \
  --context-file ./email.txt \
  --target clipboard \
  --out prompt
```

## X post from notes

```bash
screenlane command \
  --text "Turn this into an X post" \
  --context-text "Shipped ScreenLane v0.1 — talk to your screen." \
  --target stdout \
  --out prompt
```
