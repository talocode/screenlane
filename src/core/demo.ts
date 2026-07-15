import type { DemoResult } from "./types.js";
import { createScreenContext } from "./capture.js";
import { createVoiceInput } from "./transcribe.js";
import { createAgentCommand } from "./command.js";
import { saveCommand, saveContext, saveVoice } from "./storage.js";

const DEMO_ERROR = `TypeError: Cannot read properties of undefined (reading 'map')
    at renderList (src/components/Dashboard.tsx:42:18)
    at Dashboard (src/components/Dashboard.tsx:88:5)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:15486:18)

  40 | function renderList(items) {
  41 |   // items may be undefined when API fails
> 42 |   return items.map((item) => <Row key={item.id} item={item} />);
     |                  ^
  43 | }

Error: API /api/items returned 500
    at fetchItems (src/lib/api.ts:15:11)`;

/**
 * Deterministic demo — no mic, no real screenshot.
 * Uses text-mode voice simulation for CI-safe output.
 */
export function runDemo(opts: { save?: boolean; target?: "codra" | "stdout" | "clipboard" | "tera" } = {}): DemoResult {
  const context = createScreenContext({
    source: "text",
    title: "Terminal — npm run dev (error)",
    appName: "terminal",
    text: DEMO_ERROR,
    metadata: {
      demo: true,
      note: "text-mode voice simulation for deterministic demo",
    },
  });

  const voice = createVoiceInput({
    source: "text",
    transcript: "Fix this error",
    language: "en",
  });

  const command = createAgentCommand({
    instruction: voice.transcript,
    context,
    voice,
    target: opts.target || "codra",
  });

  if (opts.save) {
    saveContext(context);
    saveVoice(voice);
    saveCommand(command);
  }

  return {
    context,
    voice,
    command,
    note: "text-mode voice simulation for deterministic demo. No live microphone or screenshot was used.",
  };
}
