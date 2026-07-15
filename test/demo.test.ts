import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runDemo, redactSecrets } from "../src/index.ts";

describe("demo", () => {
  it("runs deterministic demo without secrets", () => {
    const result = runDemo({ save: false, target: "codra" });
    assert.equal(result.voice.transcript, "Fix this error");
    assert.equal(result.command.intent, "debug_error");
    assert.match(result.note, /text-mode voice simulation/i);
    const dumped = redactSecrets(JSON.stringify(result));
    assert.ok(!dumped.includes("sk-"));
  });
});
