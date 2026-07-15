# SDK

```bash
npm install @talocode/screenlane
```

```ts
import { ScreenLaneClient } from "@talocode/screenlane";

const client = new ScreenLaneClient();
await client.createCommand({
  text: "Fix this error",
  contextText: "...",
  target: "codra",
});

// Local server
const http = new ScreenLaneClient({
  baseUrl: "http://127.0.0.1:3070",
  apiKey: process.env.TALOCODE_API_KEY,
});
```

Cloud integrations use `TALOCODE_API_KEY` and `https://api.talocode.site`.
