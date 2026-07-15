import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import type { AgentCommand, ScreenContext, VoiceInput } from "./types.js";
import { ensureDirs, getCommandsDir, getContextsDir, getHomeDir } from "./config.js";
import { NotFoundError } from "./errors.js";


function writeJson(path: string, data: unknown): void {
  ensureDirs();
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function saveContext(ctx: ScreenContext): ScreenContext {
  ensureDirs();
  writeJson(join(getContextsDir(), `${ctx.id}.json`), ctx);
  return ctx;
}

export function getContext(id: string): ScreenContext {
  const path = join(getContextsDir(), `${id}.json`);
  if (!existsSync(path)) throw new NotFoundError(`Context not found: ${id}`);
  return readJson<ScreenContext>(path);
}

export function listContexts(limit = 50): ScreenContext[] {
  ensureDirs();
  const dir = getContextsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return readJson<ScreenContext>(join(dir, f));
      } catch {
        return null;
      }
    })
    .filter((x): x is ScreenContext => Boolean(x))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

export function saveCommand(cmd: AgentCommand): AgentCommand {
  ensureDirs();
  writeJson(join(getCommandsDir(), `${cmd.id}.json`), cmd);
  return cmd;
}

export function getCommand(id: string): AgentCommand {
  const path = join(getCommandsDir(), `${id}.json`);
  if (!existsSync(path)) throw new NotFoundError(`Command not found: ${id}`);
  return readJson<AgentCommand>(path);
}

export function listCommands(limit = 50): AgentCommand[] {
  ensureDirs();
  const dir = getCommandsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return readJson<AgentCommand>(join(dir, f));
      } catch {
        return null;
      }
    })
    .filter((x): x is AgentCommand => Boolean(x))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

export function saveVoice(voice: VoiceInput): VoiceInput {
  ensureDirs();
  const dir = join(getHomeDir(), "voices");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeJson(join(dir, `${voice.id}.json`), voice);
  return voice;
}

export function deleteContext(id: string): void {
  const path = join(getContextsDir(), `${id}.json`);
  if (existsSync(path)) unlinkSync(path);
}

export function deleteCommand(id: string): void {
  const path = join(getCommandsDir(), `${id}.json`);
  if (existsSync(path)) unlinkSync(path);
}
