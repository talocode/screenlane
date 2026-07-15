# TypeScript SDK

```bash
npm install @talocode/screenlane
```

## Client

```ts
import { ScreenLaneClient } from "@talocode/screenlane";

// Local in-process
const local = new ScreenLaneClient();
await local.capture({ source: "text", text: "hello" });
await local.dictate({ text: "Fix this" });
await local.createCommand({ text: "Fix this", contextText: "..." });
await local.send({ target: "stdout", text: "..." });
await local.doctor();
await local.listContexts();
await local.listCommands();
await local.getContext(id);
await local.getCommand(id);

// HTTP
const http = new ScreenLaneClient({
  baseUrl: "http://127.0.0.1:3070",
  apiKey: process.env.TALOCODE_API_KEY,
});
```

## Core helpers

```ts
import {
  createScreenContext,
  createVoiceInput,
  createAgentCommand,
  buildAgentPrompt,
  routeCommand,
  capture,
  dictate,
  createCommand,
  send,
  runDemo,
} from "@talocode/screenlane";
```

All core helpers work offline without starting the API server.
