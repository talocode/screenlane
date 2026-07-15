import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createScreenContext,
  createAgentCommand,
  saveContext,
  getContext,
  listContexts,
  saveCommand,
  getCommand,
  listCommands,
} from "../src/index.ts";

describe("storage", () => {
  before(() => {
    const dir = mkdtempSync(join(tmpdir(), "screenlane-test-"));
    process.env.SCREENLANE_HOME = dir;
  });

  it("saves and loads contexts", () => {
    const ctx = createScreenContext({ source: "text", text: "hello", title: "t" });
    saveContext(ctx);
    const loaded = getContext(ctx.id);
    assert.equal(loaded.text, "hello");
    const list = listContexts();
    assert.ok(list.some((c) => c.id === ctx.id));
  });

  it("saves and loads commands", () => {
    const ctx = createScreenContext({ source: "text", text: "err", title: "t" });
    const cmd = createAgentCommand({ instruction: "fix", context: ctx, target: "stdout" });
    saveCommand(cmd);
    const loaded = getCommand(cmd.id);
    assert.equal(loaded.instruction, "fix");
    assert.ok(listCommands().some((c) => c.id === cmd.id));
  });
});
