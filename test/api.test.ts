import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { handleRequest } from "../src/api/routes.ts";
import { AuthError } from "../src/index.ts";

describe("API", () => {
  let server: Server;
  let base: string;

  before(async () => {
    delete process.env.SCREENLANE_REQUIRE_AUTH;
    server = createServer((req, res) => {
      void handleRequest(req, res);
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("no addr");
    base = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("health", async () => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    const data = (await res.json()) as { ok: boolean; service: string };
    assert.equal(data.ok, true);
    assert.equal(data.service, "screenlane");
  });

  it("demo endpoint", async () => {
    const res = await fetch(`${base}/v1/screenlane/demo`, { method: "POST", body: "{}" });
    assert.equal(res.status, 200);
    const data = (await res.json()) as { command: { intent: string } };
    assert.equal(data.command.intent, "debug_error");
  });

  it("command endpoint", async () => {
    const res = await fetch(`${base}/v1/screenlane/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Explain this page",
        contextText: "Welcome to Example Corp docs.",
        target: "stdout",
        save: false,
      }),
    });
    assert.equal(res.status, 200);
    const data = (await res.json()) as { intent: string; prompt: string };
    assert.equal(data.intent, "explain");
    assert.match(data.prompt, /Explain this page/);
  });

  it("auth required rejects missing key", async () => {
    process.env.SCREENLANE_REQUIRE_AUTH = "true";
    process.env.TALOCODE_API_KEY = "only-talo-key";
    const res = await fetch(`${base}/v1/screenlane/doctor`);
    assert.equal(res.status, 401);
    const ok = await fetch(`${base}/v1/screenlane/doctor`, {
      headers: { Authorization: "Bearer only-talo-key" },
    });
    assert.equal(ok.status, 200);
    // health stays public
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    delete process.env.SCREENLANE_REQUIRE_AUTH;
    delete process.env.TALOCODE_API_KEY;
    void AuthError;
  });
});
