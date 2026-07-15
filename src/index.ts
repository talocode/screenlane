/** @talocode/screenlane — public SDK exports */

export const VERSION = "0.1.4";

export type {
  ScreenContext,
  VoiceInput,
  AgentCommand,
  CommandTarget,
  ContextSource,
  VoiceSource,
  CaptureInput,
  DictateInput,
  CreateCommandInput,
  SendInput,
  SendResult,
  DoctorReport,
  DoctorCheck,
  ScreenLaneConfig,
  DemoResult,
  DictateProvider,
} from "./core/types.js";

export { ScreenLaneClient } from "./sdk/client.js";
export type { ScreenLaneClientOptions } from "./sdk/client.js";

export {
  createScreenContext,
  capture,
  listScreenshotTools,
  listClipboardTools,
  ocrAvailable,
  runOcr,
} from "./core/capture.js";
export { createVoiceInput, dictate } from "./core/transcribe.js";
export {
  createAgentCommand,
  createCommand,
  buildAgentPrompt,
} from "./core/command.js";
export { routeCommand, send, writeClipboard } from "./core/router.js";
export { doctor } from "./core/doctor.js";
export { runDemo } from "./core/demo.js";
export {
  initConfig,
  loadConfig,
  saveConfig,
  getHomeDir,
  resolveTalocodeApiKey,
  resolveCloudApiBase,
  TALOCODE_CLOUD_API_BASE,
  setTalocodeApiKey,
  clearTalocodeApiKey,
  getEnvSummary,
} from "./core/config.js";
export {
  saveContext,
  getContext,
  listContexts,
  saveCommand,
  getCommand,
  listCommands,
  saveVoice,
} from "./core/storage.js";
export { summarizeContext, detectLikelyIntent } from "./core/context.js";
export {
  ScreenLaneError,
  AuthError,
  NotFoundError,
  ProviderError,
  CaptureError,
  redactSecrets,
  maskKey,
} from "./core/errors.js";
export { startServer, createApiServer } from "./api/server.js";
export { MCP_TOOLS, callTool } from "./mcp/tools.js";
