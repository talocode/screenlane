#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(root, "dist", "cli.js");

function run(args, opts = {}) {
  const r = spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    cwd: root,
    env: { ...process.env, ...opts.env },
  });
  return r;
}

let failed = 0;
function check(name, cond, detail = "") {
  if (cond) console.log(`✓ ${name}`);
  else {
    console.error(`✗ ${name} ${detail}`);
    failed++;
  }
}

const help = run(["--help"]);
check("help exit 0", help.status === 0);
check("help mentions capture", /capture/.test(help.stdout));

const demo = run(["demo", "--out", "json"]);
check("demo exit 0", demo.status === 0, demo.stderr);
check("demo intent", /debug_error/.test(demo.stdout));
check("demo note", /text-mode voice simulation/i.test(demo.stdout));

const doctor = run(["doctor", "--out", "json"]);
check("doctor exit 0", doctor.status === 0, doctor.stderr);

const cmd = run([
  "command",
  "--text",
  "Explain this page",
  "--context-text",
  "Hello docs",
  "--target",
  "stdout",
  "--out",
  "prompt",
]);
check("command exit 0", cmd.status === 0, cmd.stderr);
check("command prompt content", /Explain this page/.test(cmd.stdout));

// no secret leakage
const blob = [help.stdout, demo.stdout, doctor.stdout, cmd.stdout].join("\n");
check("no sk- leakage", !/sk-[a-zA-Z0-9]{20,}/.test(blob));

if (failed) {
  console.error(`Smoke failed: ${failed}`);
  process.exit(1);
}
console.log("Smoke tests passed");
