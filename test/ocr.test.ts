import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ocrAvailable, runOcr, capture } from "../src/index.ts";

describe("ocr", () => {
  it("reports availability without throwing", () => {
    const avail = ocrAvailable();
    assert.equal(typeof avail, "boolean");
  });

  it("runOcr on missing file returns empty", () => {
    const r = runOcr("/tmp/definitely-missing-screenlane-ocr.png");
    assert.equal(r.text, "");
    assert.equal(r.engine, "none");
  });

  it("capture image file uses ocr path or clear note", async () => {
    // Minimal valid 1x1 PNG
    const dir = join(tmpdir(), `screenlane-ocr-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const png = join(dir, "tiny.png");
    const buf = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    writeFileSync(png, buf);
    const ctx = await capture({ source: "file", file: png, save: false, ocr: true });
    assert.ok(ctx.imagePath === png || ctx.metadata?.file === png);
    assert.ok(typeof ctx.text === "string");
    assert.ok(ctx.metadata?.ocr);
  });
});
