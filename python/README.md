# talocode-screenlane

Python client for [ScreenLane](https://github.com/talocode/screenlane) — screen-aware voice commands for AI agents.

```bash
pip install talocode-screenlane
```

## Auth & cloud

| | |
|--|--|
| **Key** | `TALOCODE_API_KEY` |
| **Cloud API** | `https://api.talocode.site` |

```bash
export TALOCODE_API_KEY=your_key
```

## Usage

```python
from talocode_screenlane import ScreenLaneClient

# Talk to local ScreenLane server (screenlane serve)
client = ScreenLaneClient()  # http://127.0.0.1:3070

# Or cloud
cloud = ScreenLaneClient(
    base_url="https://api.talocode.site",
    api_key=__import__("os").environ["TALOCODE_API_KEY"],
)

print(client.command({
    "text": "Fix this error",
    "contextText": "TypeError: ...",
    "target": "codra",
}))
```

## CLI

```bash
screenlane-py --help
screenlane-py demo
screenlane-py command --text "Fix this error" --context-text "..." --offline
```

MIT © Talocode · [github.com/talocode/screenlane](https://github.com/talocode/screenlane)
