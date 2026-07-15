/** Core ScreenLane domain types */

export type ContextSource =
  | "screen"
  | "window"
  | "file"
  | "text"
  | "url"
  | "clipboard"
  | "manual";

export type VoiceSource = "mic" | "file" | "text";

export type CommandTarget =
  | "tera"
  | "codra"
  | "codex"
  | "opencode"
  | "gatelane"
  | "mcp"
  | "clipboard"
  | "stdout";

export type DictateProvider = "local" | "openai" | "tera";

export interface ScreenContext {
  id: string;
  timestamp: string;
  platform: string;
  source: ContextSource;
  title?: string;
  appName?: string;
  url?: string;
  text?: string;
  imagePath?: string;
  metadata?: Record<string, unknown>;
}

export interface VoiceInput {
  id: string;
  timestamp: string;
  source: VoiceSource;
  transcript: string;
  audioPath?: string;
  language?: string;
  durationMs?: number;
}

export interface AgentCommand {
  id: string;
  timestamp: string;
  intent: string;
  instruction: string;
  contextSummary: string;
  target: CommandTarget;
  confidence: number;
  prompt: string;
  suggestedActions: string[];
  safetyNotes: string[];
  rawContextId?: string;
  rawVoiceInputId?: string;
}

export interface CaptureInput {
  source?: ContextSource;
  file?: string;
  text?: string;
  url?: string;
  save?: boolean;
  title?: string;
  appName?: string;
  /** Run local OCR on screenshot when tesseract is available (default true for screen/window) */
  ocr?: boolean;
}

export interface DictateInput {
  text?: string;
  audio?: string;
  audioPath?: string;
  provider?: DictateProvider;
  language?: string;
  save?: boolean;
}

export interface CreateCommandInput {
  text?: string;
  instruction?: string;
  contextFile?: string;
  contextText?: string;
  contextId?: string;
  url?: string;
  clipboard?: boolean;
  target?: CommandTarget;
  save?: boolean;
  voiceInputId?: string;
}

export interface SendInput {
  target?: CommandTarget;
  commandId?: string;
  commandFile?: string;
  text?: string;
  commandText?: string;
}

export interface SendResult {
  ok: boolean;
  target: CommandTarget;
  message: string;
  detail?: unknown;
}

export interface DoctorCheck {
  name: string;
  status: "ok" | "warn" | "fail" | "info";
  detail: string;
}

export interface DoctorReport {
  ok: boolean;
  platform: string;
  nodeVersion: string;
  checks: DoctorCheck[];
  timestamp: string;
}

export interface ScreenLaneConfig {
  version: number;
  defaultTarget: CommandTarget;
  defaultProvider: DictateProvider;
  apiPort: number;
  storageDir: string;
  requireAuth: boolean;
  createdAt: string;
  updatedAt: string;
  /** Masked key presence only — never store full secrets by default */
  hasTalocodeKey?: boolean;
}

export interface DemoResult {
  context: ScreenContext;
  voice: VoiceInput;
  command: AgentCommand;
  note: string;
}
