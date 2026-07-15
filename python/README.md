# talocode-screenlane

Python client for [ScreenLane](https://github.com/talocode/screenlane).

```bash
pip install talocode-screenlane
export TALOCODE_API_KEY=your_key   # when talking to a gated server or cloud
```

Cloud base: `https://api.talocode.site`  
Local server: `http://127.0.0.1:3070` (`screenlane serve`)

```python
from talocode_screenlane import ScreenLaneClient

client = ScreenLaneClient()
print(client.command({
    "text": "Fix this error",
    "contextText": "TypeError: ...",
    "target": "codra",
}))
```

```bash
screenlane-py demo
screenlane-py command --text "Fix this" --context-text "..." --offline
```

MIT
