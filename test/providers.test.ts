import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { send, ProviderError } from "../src/index.ts";

describe("providers / send", () => {
  it("stdout works offline", async () => {
    const result = await send({ target: "stdout", text: "hello agent" });
    assert.equal(result.ok, true);
    assert.equal(result.target, "stdout");
  });

  it("requires TALOCODE_API_KEY for tera send", async () => {
    const prevTalo = process.env.TALOCODE_API_KEY;
    delete process.env.TALOCODE_API_KEY;
    await assert.rejects(
      () => send({ target: "tera", text: "hi" }),
      (err: unknown) =>
        err instanceof ProviderError && String((err as Error).message).includes("TALOCODE_API_KEY")
    );
    if (prevTalo) process.env.TALOCODE_API_KEY = prevTalo;
  });
});

