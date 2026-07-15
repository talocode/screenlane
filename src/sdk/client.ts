import type {
  AgentCommand,
  CaptureInput,
  CreateCommandInput,
  DictateInput,
  DoctorReport,
  ScreenContext,
  SendInput,
  SendResult,
  VoiceInput,
} from "../core/types.js";
import { capture as localCapture } from "../core/capture.js";
import { dictate as localDictate } from "../core/transcribe.js";
import { createCommand as localCreateCommand } from "../core/command.js";
import { send as localSend } from "../core/router.js";
import { doctor as localDoctor } from "../core/doctor.js";
import {
  getCommand as localGetCommand,
  getContext as localGetContext,
  listCommands as localListCommands,
  listContexts as localListContexts,
} from "../core/storage.js";
import { runDemo } from "../core/demo.js";
import { ScreenLaneError } from "../core/errors.js";
import { resolveTalocodeApiKey } from "../core/config.js";

export interface ScreenLaneClientOptions {
  /** When set, SDK talks to local/remote HTTP API instead of in-process core */
  baseUrl?: string;
  /** TALOCODE_API_KEY for auth when server has SCREENLANE_REQUIRE_AUTH=true */
  apiKey?: string;
  timeoutMs?: number;
}

export class ScreenLaneClient {
  private baseUrl?: string;
  private apiKey?: string;
  private timeoutMs: number;

  constructor(opts: ScreenLaneClientOptions = {}) {
    this.baseUrl = opts.baseUrl?.replace(/\/$/, "");
    this.apiKey = opts.apiKey || resolveTalocodeApiKey();
    this.timeoutMs = opts.timeoutMs ?? 30000;
  }

  private async http<T>(method: string, path: string, body?: unknown): Promise<T> {
    if (!this.baseUrl) throw new ScreenLaneError("No baseUrl configured");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
      headers["X-Talocode-Api-Key"] = this.apiKey;
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      const msg =
        typeof data === "object" && data && "message" in data
          ? String((data as { message: string }).message)
          : text.slice(0, 300);
      throw new ScreenLaneError(msg || `HTTP ${res.status}`, "HTTP_ERROR", res.status);
    }
    return data as T;
  }

  async capture(input: CaptureInput = {}): Promise<ScreenContext> {
    if (this.baseUrl) return this.http("POST", "/v1/screenlane/capture", input);
    return localCapture(input);
  }

  async dictate(input: DictateInput = {}): Promise<VoiceInput> {
    if (this.baseUrl) return this.http("POST", "/v1/screenlane/dictate", input);
    return localDictate(input);
  }

  async createCommand(input: CreateCommandInput): Promise<AgentCommand> {
    if (this.baseUrl) return this.http("POST", "/v1/screenlane/command", input);
    return localCreateCommand(input);
  }

  async send(input: SendInput): Promise<SendResult> {
    if (this.baseUrl) return this.http("POST", "/v1/screenlane/send", input);
    return localSend(input);
  }

  async doctor(): Promise<DoctorReport> {
    if (this.baseUrl) return this.http("GET", "/v1/screenlane/doctor");
    return localDoctor();
  }

  async listContexts(): Promise<ScreenContext[]> {
    if (this.baseUrl) {
      const data = await this.http<{ contexts: ScreenContext[] }>("GET", "/v1/screenlane/contexts");
      return data.contexts;
    }
    return localListContexts();
  }

  async listCommands(): Promise<AgentCommand[]> {
    if (this.baseUrl) {
      const data = await this.http<{ commands: AgentCommand[] }>("GET", "/v1/screenlane/commands");
      return data.commands;
    }
    return localListCommands();
  }

  async getContext(id: string): Promise<ScreenContext> {
    if (this.baseUrl) return this.http("GET", `/v1/screenlane/contexts/${encodeURIComponent(id)}`);
    return localGetContext(id);
  }

  async getCommand(id: string): Promise<AgentCommand> {
    if (this.baseUrl) return this.http("GET", `/v1/screenlane/commands/${encodeURIComponent(id)}`);
    return localGetCommand(id);
  }

  async demo(): Promise<unknown> {
    if (this.baseUrl) return this.http("POST", "/v1/screenlane/demo", {});
    return runDemo({ save: true });
  }

  async health(): Promise<{ ok: boolean; service: string; version: string }> {
    if (this.baseUrl) return this.http("GET", "/v1/screenlane/health");
    return { ok: true, service: "screenlane", version: "0.1.0" };
  }
}
