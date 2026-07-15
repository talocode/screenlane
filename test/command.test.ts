import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildAgentPrompt,
  createAgentCommand,
  createCommand,
  createScreenContext,
  createVoiceInput,
} from "../src/index.ts";

describe("command generation", () => {
  it("detects debug intent and builds prompt", () => {
    const ctx = createScreenContext({
      source: "text",
      text: "TypeError: cannot read map of undefined\n  at src/app.ts:10",
      title: "terminal",
    });
    const cmd = createAgentCommand({
      instruction: "Fix this error",
      context: ctx,
      target: "codra",
    });
    assert.equal(cmd.intent, "debug_error");
    assert.equal(cmd.target, "codra");
    assert.match(cmd.prompt, /Fix this error/);
    assert.match(cmd.prompt, /TypeError/);
    assert.ok(cmd.suggestedActions.length > 0);
  });

  it("buildAgentPrompt is deterministic", () => {
    const a = buildAgentPrompt({
      instruction: "Explain this page",
      contextSummary: "source=url | title=Example\n\nHello world",
      intent: "explain",
      target: "stdout",
    });
    const b = buildAgentPrompt({
      instruction: "Explain this page",
      contextSummary: "source=url | title=Example\n\nHello world",
      intent: "explain",
      target: "stdout",
    });
    assert.equal(a, b);
  });

  it("createCommand with context file text", async () => {
    const cmd = await createCommand({
      text: "Turn this into an X post",
      contextText: "Shipped ScreenLane v0.1 — talk to your screen.",
      target: "clipboard",
      save: false,
    });
    assert.equal(cmd.intent, "write_x_post");
    assert.match(cmd.prompt, /X \(Twitter\) post|X post/i);
  });

  it("createVoiceInput works", () => {
    const v = createVoiceInput({ source: "text", transcript: "hello" });
    assert.equal(v.transcript, "hello");
    assert.ok(v.id);
  });
});
