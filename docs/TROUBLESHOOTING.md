# Troubleshooting

## Screenshot failed

Use text/file context:

```bash
screenlane capture --source text --text "..."
screenlane capture --source file --file ./context.txt
```

## Dictate

```bash
screenlane dictate --text "your words"
```

## Cloud send

Set `TALOCODE_API_KEY`. Cloud base is `https://api.talocode.site`.

Offline:

```bash
screenlane send --target stdout --text "..."
```

## API 401

```bash
export SCREENLANE_REQUIRE_AUTH=true
export TALOCODE_API_KEY=your_key
# Authorization: Bearer <TALOCODE_API_KEY>
```
