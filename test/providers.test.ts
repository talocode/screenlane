import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { send, ProviderError } from "../src/index.ts";

describe("providers / send", () => {
  it("stdout works offline", async () => {
    const result = await send({ target: "stdout", text: "hello agent" });
    assert.equal(result.ok, true);
    assert.equal(result.target, "stdout");
  });

  it("missing tera config errors clearly", async () => {
    const prevBase = process.env.TERA_API_BASE_URL;
    const prevKey = process.env.TERA_API_KEY;
    const prevTalo = process.env.TALOCODE_API_KEY;
    delete process.env.TERA_API_BASE_URL;
    delete process.env.TERA_API_KEY;
    delete process.env.TALOCODE_API_KEY;
    await assert.rejects(
      () => send({ target: "tera", text: "hi" }),
      (err: unknown) => err instanceof ProviderError
    );
    if (prevBase) process.env.TERA_API_BASE_URL = prevBase;
    if (prevKey) process.env.TERA_API_KEY = prevKey;
    if (prevTalo) process.env.TALOCODE_API_KEY = prevTalo;
  });
});
