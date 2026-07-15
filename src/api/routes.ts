import type { IncomingMessage, ServerResponse } from "node:http";
import { capture } from "../core/capture.js";
import { dictate } from "../core/transcribe.js";
import { createCommand } from "../core/command.js";
import { send } from "../core/router.js";
import { doctor } from "../core/doctor.js";
import { runDemo } from "../core/demo.js";
import {
  getCommand,
  getContext,
  listCommands,
  listContexts,
} from "../core/storage.js";
import { ScreenLaneError, redactSecrets } from "../core/errors.js";
import { checkAuthFromNodeRequest } from "../core/auth.js";

const VERSION = "0.1.0";

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new ScreenLaneError("Invalid JSON body", "BAD_JSON", 400);
  }
}

export function sendJson(res: ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Talocode-Api-Key",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(body);
}

export function sendError(res: ServerResponse, err: unknown): void {
  if (err instanceof ScreenLaneError) {
    sendJson(res, err.statusCode, {
      ok: false,
      ...err.toJSON(),
      message: redactSecrets(err.message),
    });
    return;
  }
  const message = redactSecrets(err instanceof Error ? err.message : String(err));
  sendJson(res, 500, { ok: false, error: "InternalError", message });
}

type Handler = (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => Promise<void>;

const publicPaths = new Set(["/health", "/v1/screenlane/health"]);

export async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || "/", "http://localhost");
  const path = url.pathname.replace(/\/$/, "") || "/";
  const method = (req.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (!publicPaths.has(path)) {
      checkAuthFromNodeRequest(req);
    }

    if (method === "GET" && (path === "/health" || path === "/v1/screenlane/health")) {
      sendJson(res, 200, { ok: true, service: "screenlane", version: VERSION });
      return;
    }

    if (method === "GET" && path === "/v1/screenlane/doctor") {
      sendJson(res, 200, await doctor());
      return;
    }

    if (method === "POST" && path === "/v1/screenlane/capture") {
      const body = (await readJsonBody(req)) as Record<string, unknown>;
      const result = await capture({
        source: body.source as never,
        file: body.file as string | undefined,
        text: body.text as string | undefined,
        url: body.url as string | undefined,
        save: body.save !== false,
        title: body.title as string | undefined,
        appName: body.appName as string | undefined,
      });
      sendJson(res, 200, result);
      return;
    }

    if (method === "POST" && path === "/v1/screenlane/dictate") {
      const body = (await readJsonBody(req)) as Record<string, unknown>;
      const result = await dictate({
        text: body.text as string | undefined,
        audio: (body.audio || body.audioPath) as string | undefined,
        provider: body.provider as never,
        language: body.language as string | undefined,
        save: Boolean(body.save),
      });
      sendJson(res, 200, result);
      return;
    }

    if (method === "POST" && path === "/v1/screenlane/command") {
      const body = (await readJsonBody(req)) as Record<string, unknown>;
      const result = await createCommand({
        text: (body.text || body.instruction) as string | undefined,
        instruction: body.instruction as string | undefined,
        contextFile: body.contextFile as string | undefined,
        contextText: (body.contextText || body.context) as string | undefined,
        contextId: body.contextId as string | undefined,
        url: body.url as string | undefined,
        clipboard: Boolean(body.clipboard),
        target: body.target as never,
        save: body.save !== false,
      });
      sendJson(res, 200, result);
      return;
    }

    if (method === "POST" && path === "/v1/screenlane/send") {
      const body = (await readJsonBody(req)) as Record<string, unknown>;
      const result = await send({
        target: body.target as never,
        commandId: body.commandId as string | undefined,
        commandFile: body.commandFile as string | undefined,
        text: (body.text || body.commandText) as string | undefined,
        commandText: body.commandText as string | undefined,
      });
      // For stdout target via API, include text in detail
      sendJson(res, 200, result);
      return;
    }

    if (method === "GET" && path === "/v1/screenlane/contexts") {
      sendJson(res, 200, { contexts: listContexts() });
      return;
    }

    const ctxMatch = path.match(/^\/v1\/screenlane\/contexts\/([^/]+)$/);
    if (method === "GET" && ctxMatch) {
      sendJson(res, 200, getContext(decodeURIComponent(ctxMatch[1])));
      return;
    }

    if (method === "GET" && path === "/v1/screenlane/commands") {
      sendJson(res, 200, { commands: listCommands() });
      return;
    }

    const cmdMatch = path.match(/^\/v1\/screenlane\/commands\/([^/]+)$/);
    if (method === "GET" && cmdMatch) {
      sendJson(res, 200, getCommand(decodeURIComponent(cmdMatch[1])));
      return;
    }

    if (method === "POST" && path === "/v1/screenlane/demo") {
      sendJson(res, 200, runDemo({ save: true }));
      return;
    }

    sendJson(res, 404, { ok: false, error: "NotFound", message: `No route ${method} ${path}` });
  } catch (err) {
    sendError(res, err);
  }
}

// export type for completeness
export type { Handler };
