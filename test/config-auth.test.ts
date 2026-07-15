import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  initConfig,
  setTalocodeApiKey,
  clearTalocodeApiKey,
  resolveTalocodeApiKey,
  resolveCloudApiBase,
  TALOCODE_CLOUD_API_BASE,
  maskKey,
  redactSecrets,
  AuthError,
} from "../src/index.ts";
import { checkAuth, isAuthRequired } from "../src/core/auth.ts";

describe("config and auth", () => {
  before(() => {
    process.env.SCREENLANE_HOME = mkdtempSync(join(tmpdir(), "screenlane-cfg-"));
    delete process.env.TALOCODE_API_KEY;
    delete process.env.SCREENLANE_REQUIRE_AUTH;
  });

  it("init creates config", () => {
    const cfg = initConfig();
    assert.equal(cfg.version, 1);
    assert.equal(cfg.apiPort, 3070);
  });

  it("auth store set/status/clear without printing full key", () => {
    setTalocodeApiKey("talo_test_secret_key_123456");
    const key = resolveTalocodeApiKey();
    assert.ok(key);
    assert.equal(maskKey(key).includes("talo"), true);
    assert.ok(!maskKey(key).includes("secret_key_123456"));
    clearTalocodeApiKey();
    delete process.env.TALOCODE_API_KEY;
    // clear removes store; env still empty
    assert.equal(resolveTalocodeApiKey(), undefined);
  });

  it("gates with TALOCODE_API_KEY when require auth", () => {
    process.env.SCREENLANE_REQUIRE_AUTH = "true";
    process.env.TALOCODE_API_KEY = "test-key-abc";
    assert.equal(isAuthRequired(), true);
    assert.throws(
      () => checkAuth({ headers: {} }),
      (err: unknown) => err instanceof AuthError
    );
    assert.throws(
      () => checkAuth({ headers: { authorization: "Bearer wrong-key" } }),
      (err: unknown) => err instanceof AuthError
    );
    checkAuth({ headers: { authorization: "Bearer test-key-abc" } });
    checkAuth({ headers: { "x-talocode-api-key": "test-key-abc" } });
    delete process.env.SCREENLANE_REQUIRE_AUTH;
    delete process.env.TALOCODE_API_KEY;
  });

  it("redacts secrets", () => {
    const s = redactSecrets("Bearer sk-abcdefghijklmnop and TALOCODE_API_KEY=supersecret");
    assert.ok(!s.includes("supersecret"));
    assert.ok(!s.includes("sk-abcdefghijklmnop"));
  });

  it("cloud API base is api.talocode.site", () => {
    assert.equal(TALOCODE_CLOUD_API_BASE, "https://api.talocode.site");
    assert.equal(resolveCloudApiBase(), "https://api.talocode.site");
  });
});
