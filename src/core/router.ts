import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { platform as osPlatform } from "node:os";
import type { AgentCommand, CommandTarget, SendInput, SendResult } from "./types.js";
import { ProviderError, ScreenLaneError } from "./errors.js";
import { parseTarget, resolveTalocodeApiKey } from "./config.js";
import { getCommand } from "./storage.js";
import { sendToTera } from "../providers/tera.js";
import { sendToCodra } from "../providers/codra.js";
import { sendToGateLane } from "../providers/gatelane.js";

function which(cmd: string): boolean {
  try {
    execFileSync(process.platform === "win32" ? "where" : "which", [cmd], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

export function writeClipboard(text: string): void {
  const plat = osPlatform();
  if (plat === "darwin" && which("pbcopy")) {
    execFileSync("pbcopy", [], { input: text });
    return;
  }
  if (plat === "win32") {
    execFileSync("powershell", ["-NoProfile", "-Command", "Set-Clipboard -Value $input"], {
      input: text,
    });
    return;
  }
  if (which("wl-copy")) {
    execFileSync("wl-copy", [], { input: text });
    return;
  }
  if (which("xclip")) {
    execFileSync("xclip", ["-selection", "clipboard"], { input: text });
    return;
  }
  if (which("xsel")) {
    execFileSync("xsel", ["--clipboard", "--input"], { input: text });
    return;
  }
  throw new ProviderError(
    "Clipboard write tools unavailable. Install wl-copy/xclip/xsel (Linux) or pbcopy (macOS), or use --target stdout."
  );
}

function loadCommandPayload(input: SendInput): { text: string; command?: AgentCommand; target: CommandTarget } {
  if (input.commandId) {
    const command = getCommand(input.commandId);
    return {
      text: command.prompt,
      command,
      target: parseTarget(input.target || command.target),
    };
  }
  if (input.commandFile) {
    if (!existsSync(input.commandFile)) {
      throw new ScreenLaneError(`Command file not found: ${input.commandFile}`, "COMMAND_FILE", 400);
    }
    const raw = JSON.parse(readFileSync(input.commandFile, "utf8")) as AgentCommand | { prompt?: string; text?: string; target?: string };
    const text =
      ("prompt" in raw && raw.prompt) ||
      ("text" in raw && raw.text) ||
      JSON.stringify(raw, null, 2);
    const target = parseTarget(input.target || ("target" in raw ? raw.target : undefined) || "stdout");
    return { text: String(text), command: "id" in raw ? (raw as AgentCommand) : undefined, target };
  }
  const text = input.text || input.commandText;
  if (!text) {
    throw new ScreenLaneError(
      "Provide --command-id, --command-file, or --text to send.",
      "SEND_NO_INPUT",
      400
    );
  }
  return { text, target: parseTarget(input.target || "stdout") };
}

export async function routeCommand(input: SendInput): Promise<SendResult> {
  const { text, command, target } = loadCommandPayload(input);

  if (target === "stdout") {
    return { ok: true, target, message: "Printed to stdout", detail: { text } };
  }

  if (target === "clipboard") {
    writeClipboard(text);
    return { ok: true, target, message: "Copied prompt to clipboard" };
  }

  if (target === "mcp") {
    return {
      ok: true,
      target,
      message:
        "MCP target does not push remotely in v0.1. Use `screenlane mcp` and call tools from an MCP client. Prompt is ready in detail.",
      detail: { text, commandId: command?.id },
    };
  }

  if (target === "codex" || target === "opencode") {
    // Local agent launchers are optional; provide copyable prompt rather than faking process control
    return {
      ok: true,
      target,
      message: `${target} is a local agent target in v0.1. Prompt prepared for paste/launch. Install and run your local ${target} CLI separately.`,
      detail: { text, commandId: command?.id, launchHint: `${target} (paste prompt)` },
    };
  }

  if (target === "tera") {
    const result = await sendToTera(text, command);
    return { ok: true, target, message: "Sent to Tera", detail: result };
  }

  if (target === "codra") {
    const result = await sendToCodra(text, command);
    return { ok: true, target, message: "Sent to Codra", detail: result };
  }

  if (target === "gatelane") {
    const result = await sendToGateLane(text, command);
    return { ok: true, target, message: "Sent to GateLane", detail: result };
  }

  throw new ProviderError(`Unsupported target: ${target}`);
}

export async function send(input: SendInput): Promise<SendResult> {
  return routeCommand(input);
}

export function hasTalocodeKeyForCloud(): boolean {
  return Boolean(resolveTalocodeApiKey());
}
