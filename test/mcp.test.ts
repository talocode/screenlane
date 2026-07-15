import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MCP_TOOLS, callTool } from "../src/mcp/tools.ts";

describe("MCP tools", () => {
  it("lists expected tools", () => {
    const names = MCP_TOOLS.map((t) => t.name).sort();
    for (const n of [
      "screenlane_capture",
      "screenlane_dictate",
      "screenlane_command",
      "screenlane_send",
      "screenlane_doctor",
      "screenlane_demo",
      "screenlane_list_contexts",
      "screenlane_list_commands",
    ]) {
      assert.ok(names.includes(n), `missing ${n}`);
    }
  });

  it("screenlane_demo tool call", async () => {
    const result = await callTool("screenlane_demo", {});
    assert.equal(result.isError, undefined);
    const text = result.content[0]?.text || "";
    assert.match(text, /debug_error|Fix this error/);
  });

  it("screenlane_command tool call", async () => {
    const result = await callTool("screenlane_command", {
      instruction: "Review this UI",
      contextText: "Button too small, poor contrast on header",
      target: "stdout",
      save: false,
    });
    assert.equal(result.isError, undefined);
    assert.match(result.content[0]?.text || "", /review_ui|Review this UI/);
  });
});
