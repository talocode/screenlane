# talocode-screenlane (Python)

Python SDK and lightweight CLI for [ScreenLane](https://github.com/talocode/screenlane).

The Node package owns OS capture, MCP, and the local API. This package is:

- An HTTP client for `screenlane serve` (default `http://127.0.0.1:3070`)
- Offline deterministic command helpers
- CLI: `screenlane-py`

## Install

```bash
pip install talocode-screenlane
```

## Usage

```python
from talocode_screenlane import ScreenLaneClient

client = ScreenLaneClient(base_url="http://127.0.0.1:3070")
# If SCREENLANE_REQUIRE_AUTH=true on the server:
# client = ScreenLaneClient(api_key=os.environ["TALOCODE_API_KEY"])

print(client.health())
print(client.command({
    "text": "Fix this error",
    "contextText": "TypeError: ...",
    "target": "codra",
}))
```

CLI:

```bash
screenlane-py health
screenlane-py command --text "Fix this error" --context-file error.txt
screenlane-py command --text "Fix this error" --context-text "..." --offline
screenlane-py demo
```

Auth uses **only** `TALOCODE_API_KEY` (Bearer header).

## License

MIT
