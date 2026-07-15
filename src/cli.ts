#!/usr/bin/env node
import { Command } from "commander";
import { initConfig, loadConfig, setTalocodeApiKey, clearTalocodeApiKey, resolveTalocodeApiKey, getHomeDir } from "./core/config.js";
import { capture } from "./core/capture.js";
import { dictate } from "./core/transcribe.js";
import { createCommand } from "./core/command.js";
import { send } from "./core/router.js";
import { doctor } from "./core/doctor.js";
import { runDemo } from "./core/demo.js";
import { startServer } from "./api/server.js";
import { maskKey, redactSecrets, ScreenLaneError } from "./core/errors.js";
import { VERSION } from "./index.js";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const program = new Command();

function print(data: unknown, out: string = "json"): void {
  if (out === "json") {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (out === "prompt" && data && typeof data === "object" && "prompt" in data) {
    console.log(String((data as { prompt: string }).prompt));
    return;
  }
  if (out === "text") {
    if (typeof data === "string") {
      console.log(data);
      return;
    }
    if (data && typeof data === "object") {
      const o = data as Record<string, unknown>;
      if (typeof o.transcript === "string") {
        console.log(o.transcript);
        return;
      }
      if (typeof o.prompt === "string") {
        console.log(o.prompt);
        return;
      }
      if (typeof o.text === "string") {
        console.log(o.text);
        return;
      }
      if (typeof o.message === "string") {
        console.log(o.message);
        return;
      }
    }
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

function fail(err: unknown): never {
  const message = redactSecrets(err instanceof Error ? err.message : String(err));
  console.error(`Error: ${message}`);
  if (err instanceof ScreenLaneError) process.exitCode = 1;
  else process.exitCode = 1;
  process.exit(process.exitCode);
}

program
  .name("screenlane")
  .description(
    "ScreenLane — open-source screen-aware voice command layer for AI agents.\nTalk to your screen."
  )
  .version(VERSION);

program
  .command("init")
  .description("Create ~/.screenlane config and storage dirs")
  .action(() => {
    try {
      const config = initConfig();
      print({ ok: true, home: getHomeDir(), config });
    } catch (err) {
      fail(err);
    }
  });

program
  .command("capture")
  .description("Capture current screen/window/file/text/url/clipboard context")
  .option("--source <source>", "screen|window|clipboard|file|text|url|manual", "screen")
  .option("--file <path>", "file path for --source file")
  .option("--text <text>", "text context")
  .option("--url <url>", "url to fetch as context")
  .option("--out <format>", "json|text", "json")
  .option("--save", "persist to ~/.screenlane/contexts", false)
  .option("--ocr", "OCR screenshots when tesseract is available (default on)", true)
  .option("--no-ocr", "Skip OCR on screenshots")
  .action(async (opts) => {
    try {
      const ctx = await capture({
        source: opts.source,
        file: opts.file,
        text: opts.text,
        url: opts.url,
        save: Boolean(opts.save),
        ocr: opts.ocr !== false,
      });
      print(ctx, opts.out);
    } catch (err) {
      fail(err);
    }
  });

program
  .command("dictate")
  .description("Record/transcribe voice (v0.1: --text or --audio + provider)")
  .option("--text <text>", "deterministic text input (recommended for demos/CI)")
  .option("--audio <path>", "audio file path")
  .option("--provider <provider>", "local|openai|tera", "local")
  .option("--out <format>", "json|text", "json")
  .option("--save", "persist voice input", false)
  .action(async (opts) => {
    try {
      const voice = await dictate({
        text: opts.text,
        audio: opts.audio,
        provider: opts.provider,
        save: Boolean(opts.save),
      });
      print(voice, opts.out);
    } catch (err) {
      fail(err);
    }
  });

program
  .command("command")
  .description("Combine screen context + instruction into an agent-ready command")
  .option("--text <instruction>", "user instruction")
  .option("--context-file <path>", "path to context file")
  .option("--context-text <text>", "inline context text")
  .option("--url <url>", "fetch URL as context")
  .option("--clipboard", "use clipboard as context", false)
  .option("--target <target>", "tera|codra|codex|opencode|gatelane|mcp|clipboard|stdout", "stdout")
  .option("--out <format>", "json|text|prompt", "json")
  .option("--save", "persist command", false)
  .action(async (opts) => {
    try {
      const cmd = await createCommand({
        text: opts.text,
        contextFile: opts.contextFile,
        contextText: opts.contextText,
        url: opts.url,
        clipboard: Boolean(opts.clipboard),
        target: opts.target,
        save: Boolean(opts.save),
      });
      print(cmd, opts.out);
    } catch (err) {
      fail(err);
    }
  });

program
  .command("send")
  .description("Send a generated command to a target")
  .option("--target <target>", "tera|codra|codex|opencode|gatelane|mcp|clipboard|stdout", "stdout")
  .option("--command-id <id>", "saved command id")
  .option("--command-file <path>", "command JSON file")
  .option("--text <text>", "raw text/prompt to send")
  .action(async (opts) => {
    try {
      const result = await send({
        target: opts.target,
        commandId: opts.commandId,
        commandFile: opts.commandFile,
        text: opts.text,
      });
      if (result.target === "stdout" && result.detail && typeof result.detail === "object" && "text" in result.detail) {
        console.log(String((result.detail as { text: string }).text));
      } else {
        print(result);
      }
    } catch (err) {
      fail(err);
    }
  });

program
  .command("serve")
  .description("Start local HTTP API (default port 3070)")
  .option("--port <port>", "port", "3070")
  .option("--host <host>", "host", "127.0.0.1")
  .action((opts) => {
    startServer({ port: Number(opts.port), host: opts.host });
  });

program
  .command("mcp")
  .description("Start MCP server over stdio")
  .action(() => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const serverPath = join(__dirname, "mcp", "server.js");
    const child = spawn(process.execPath, [serverPath], {
      stdio: "inherit",
    });
    child.on("exit", (code) => process.exit(code ?? 0));
  });

program
  .command("doctor")
  .description("Check OS, tools, env, config, and connectivity")
  .option("--out <format>", "json|text", "text")
  .action(async (opts) => {
    try {
      const report = await doctor();
      if (opts.out === "json") {
        print(report);
        return;
      }
      console.log(`ScreenLane doctor — ${report.ok ? "OK" : "ISSUES"}`);
      console.log(`Platform: ${report.platform}  Node: ${report.nodeVersion}`);
      for (const c of report.checks) {
        const mark =
          c.status === "ok" ? "✓" : c.status === "warn" ? "!" : c.status === "fail" ? "✗" : "·";
        console.log(`  [${mark}] ${c.name}: ${c.detail}`);
      }
    } catch (err) {
      fail(err);
    }
  });

program
  .command("demo")
  .description("Run deterministic demo (text-mode voice simulation)")
  .option("--save", "save artifacts to ~/.screenlane", false)
  .option("--target <target>", "command target", "codra")
  .option("--out <format>", "json|text|prompt", "json")
  .action((opts) => {
    try {
      const result = runDemo({
        save: Boolean(opts.save),
        target: opts.target,
      });
      if (opts.out === "prompt") {
        console.log(result.command.prompt);
        return;
      }
      if (opts.out === "text") {
        console.log("=== ScreenLane Demo ===");
        console.log(result.note);
        console.log("");
        console.log("Context title:", result.context.title);
        console.log("Voice:", result.voice.transcript);
        console.log("Intent:", result.command.intent);
        console.log("Target:", result.command.target);
        console.log("");
        console.log(result.command.prompt);
        return;
      }
      print(result);
    } catch (err) {
      fail(err);
    }
  });

const auth = program.command("auth").description("Manage TALOCODE_API_KEY (never prints full key)");

auth
  .command("set")
  .description("Save TALOCODE_API_KEY to ~/.screenlane/auth.json")
  .requiredOption("--key <key>", "API key value")
  .action((opts) => {
    try {
      setTalocodeApiKey(opts.key);
      console.log(`Saved TALOCODE_API_KEY ${maskKey(opts.key)} to auth store`);
    } catch (err) {
      fail(err);
    }
  });

auth
  .command("status")
  .description("Show whether TALOCODE_API_KEY is configured")
  .action(() => {
    const key = resolveTalocodeApiKey();
    const fromEnv = Boolean(process.env.TALOCODE_API_KEY);
    console.log(
      JSON.stringify(
        {
          configured: Boolean(key),
          source: key ? (fromEnv ? "env" : "auth_store") : null,
          masked: maskKey(key),
        },
        null,
        2
      )
    );
  });

auth
  .command("clear")
  .description("Clear stored TALOCODE_API_KEY")
  .action(() => {
    clearTalocodeApiKey();
    console.log("Cleared stored TALOCODE_API_KEY (env var unaffected)");
  });

program
  .command("config")
  .description("Show local config")
  .action(() => {
    print(loadConfig());
  });

program.parseAsync(process.argv).catch(fail);
