import { capture } from "../core/capture.js";
import { dictate } from "../core/transcribe.js";
import { createCommand } from "../core/command.js";
import { send } from "../core/router.js";
import { doctor } from "../core/doctor.js";
import { runDemo } from "../core/demo.js";
import { listCommands, listContexts } from "../core/storage.js";
import { redactSecrets } from "../core/errors.js";

export interface McpToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "screenlane_capture",
    description: "Capture screen/window/file/text/url/clipboard context for agent commands",
    inputSchema: {
      type: "object",
      properties: {
        source: {
          type: "string",
          enum: ["screen", "window", "clipboard", "file", "text", "url", "manual"],
        },
        text: { type: "string" },
        file: { type: "string" },
        url: { type: "string" },
        save: { type: "boolean" },
      },
    },
  },
  {
    name: "screenlane_dictate",
    description: "Transcribe voice input. Prefer text for deterministic mode; audio needs provider keys.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string" },
        audioPath: { type: "string" },
        provider: { type: "string", enum: ["local", "openai", "tera"] },
        save: { type: "boolean" },
      },
    },
  },
  {
    name: "screenlane_command",
    description: "Build an agent-ready command from instruction + screen context",
    inputSchema: {
      type: "object",
      properties: {
        instruction: { type: "string" },
        text: { type: "string" },
        contextText: { type: "string" },
        contextFile: { type: "string" },
        url: { type: "string" },
        target: {
          type: "string",
          enum: ["tera", "codra", "codex", "opencode", "gatelane", "mcp", "clipboard", "stdout"],
        },
        save: { type: "boolean" },
      },
      required: [],
    },
  },
  {
    name: "screenlane_send",
    description: "Route a command to a target (clipboard/stdout always work; cloud targets need keys)",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["tera", "codra", "codex", "opencode", "gatelane", "mcp", "clipboard", "stdout"],
        },
        commandId: { type: "string" },
        commandText: { type: "string" },
        commandFile: { type: "string" },
      },
    },
  },
  {
    name: "screenlane_doctor",
    description: "Diagnose ScreenLane environment (tools, keys presence, config)",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "screenlane_demo",
    description: "Run deterministic demo (text-mode voice simulation)",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "screenlane_list_contexts",
    description: "List saved screen contexts from local storage",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "screenlane_list_commands",
    description: "List saved agent commands from local storage",
    inputSchema: { type: "object", properties: {} },
  },
];

function textResult(data: unknown) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return {
    content: [{ type: "text", text: redactSecrets(text) }],
  };
}

function errorResult(err: unknown) {
  const message = redactSecrets(err instanceof Error ? err.message : String(err));
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

export async function callTool(name: string, args: Record<string, unknown> = {}) {
  try {
    switch (name) {
      case "screenlane_capture":
        return textResult(
          await capture({
            source: args.source as never,
            text: args.text as string | undefined,
            file: args.file as string | undefined,
            url: args.url as string | undefined,
            save: args.save !== false,
          })
        );
      case "screenlane_dictate":
        return textResult(
          await dictate({
            text: args.text as string | undefined,
            audioPath: args.audioPath as string | undefined,
            provider: args.provider as never,
            save: Boolean(args.save),
          })
        );
      case "screenlane_command":
        return textResult(
          await createCommand({
            instruction: (args.instruction || args.text) as string | undefined,
            text: args.text as string | undefined,
            contextText: args.contextText as string | undefined,
            contextFile: args.contextFile as string | undefined,
            url: args.url as string | undefined,
            target: args.target as never,
            save: args.save !== false,
          })
        );
      case "screenlane_send": {
        const result = await send({
          target: args.target as never,
          commandId: args.commandId as string | undefined,
          commandText: args.commandText as string | undefined,
          commandFile: args.commandFile as string | undefined,
          text: args.commandText as string | undefined,
        });
        return textResult(result);
      }
      case "screenlane_doctor":
        return textResult(await doctor());
      case "screenlane_demo":
        return textResult(runDemo({ save: true }));
      case "screenlane_list_contexts":
        return textResult({ contexts: listContexts() });
      case "screenlane_list_commands":
        return textResult({ commands: listCommands() });
      default:
        return errorResult(new Error(`Unknown tool: ${name}`));
    }
  } catch (err) {
    return errorResult(err);
  }
}
