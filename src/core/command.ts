import { existsSync, readFileSync } from "node:fs";
import type {
  AgentCommand,
  CommandTarget,
  CreateCommandInput,
  ScreenContext,
  VoiceInput,
} from "./types.js";
import { capture, createScreenContext } from "./capture.js";
import { detectLikelyIntent, extractLikelyPaths, summarizeContext } from "./context.js";
import { ScreenLaneError } from "./errors.js";
import { loadConfig, parseTarget } from "./config.js";
import { newId, nowIso } from "./ids.js";
import { getContext, saveCommand } from "./storage.js";

const TARGET_ROLES: Record<CommandTarget, string> = {
  tera: "You are Tera, a general AI assistant that acts on the user's screen-aware instruction.",
  codra: "You are Codra, a coding agent. Diagnose issues, propose minimal patches, and implement carefully.",
  codex: "You are Codex (or a Codex-compatible coding agent). Work from the visible context and instruction.",
  opencode: "You are OpenCode, an open coding agent. Prefer small, verifiable changes.",
  gatelane: "You are routing through GateLane. Prepare a tool call plan that respects policies.",
  mcp: "You are an MCP-compatible agent. Prefer structured tool use over free-form side effects.",
  clipboard: "Prepare a ready-to-paste prompt for the user's agent of choice.",
  stdout: "Prepare a clear agent-ready prompt for stdout.",
};

export function buildAgentPrompt(opts: {
  instruction: string;
  contextSummary: string;
  intent: string;
  target: CommandTarget;
  paths?: string[];
}): string {
  const role = TARGET_ROLES[opts.target] || TARGET_ROLES.stdout;
  const pathBlock =
    opts.paths && opts.paths.length
      ? `\nLikely files/paths from context:\n${opts.paths.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  const intentGuidance: Record<string, string> = {
    debug_error:
      "Diagnose the root cause of the visible error. Propose a minimal fix. List assumptions. Do not rewrite unrelated code.",
    explain:
      "Explain what is on screen clearly and concisely. Highlight key takeaways and open questions.",
    review_ui:
      "Review the visible UI for usability, hierarchy, accessibility, and consistency. Give prioritized, actionable feedback.",
    write_x_post:
      "Turn the visible notes/context into a concise X (Twitter) post. Keep voice natural. Offer one primary draft.",
    write_reply:
      "Draft a polite, clear reply based on the visible email/message. Match tone to context.",
    write_prompt:
      "Write a precise agent prompt the user can paste into Claude Code / Codex / OpenCode for this issue.",
    refactor:
      "Propose a minimal refactor that improves clarity without changing behavior. Show before/after rationale.",
    write_tests:
      "Propose focused tests for the visible code/behavior. Prefer high-signal cases.",
    write_docs:
      "Write clear documentation based on the visible context. Keep it practical.",
    general_action:
      "Follow the user's instruction using the screen context. Prefer concrete next steps.",
  };

  const guidance = intentGuidance[opts.intent] || intentGuidance.general_action;

  return [
    role,
    "",
    `Intent: ${opts.intent}`,
    "",
    "Screen context:",
    "```",
    opts.contextSummary,
    "```",
    pathBlock,
    "User instruction:",
    opts.instruction,
    "",
    "Requirements:",
    `- ${guidance}`,
    "- Preserve the user's intent.",
    "- Avoid dumping huge unrelated context back to the user.",
    "- Call out safety risks if the action could modify production systems or delete data.",
    "- If information is missing, ask one minimal clarifying question only when necessary.",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

export function createAgentCommand(opts: {
  instruction: string;
  context: ScreenContext;
  voice?: VoiceInput;
  target?: CommandTarget;
}): AgentCommand {
  const target = opts.target || loadConfig().defaultTarget || "stdout";
  const summary = summarizeContext(opts.context);
  const intent = detectLikelyIntent(opts.instruction, opts.context.text || "");
  const paths = extractLikelyPaths(opts.context.text || "");
  const prompt = buildAgentPrompt({
    instruction: opts.instruction,
    contextSummary: summary,
    intent,
    target,
    paths,
  });

  const suggestedActions: string[] = [];
  if (intent === "debug_error") {
    suggestedActions.push("Identify error type and stack frames");
    suggestedActions.push("Locate failing file/function");
    suggestedActions.push("Propose minimal patch");
  } else if (intent === "explain") {
    suggestedActions.push("Summarize visible content");
    suggestedActions.push("List key concepts");
  } else if (intent.startsWith("write_")) {
    suggestedActions.push("Draft primary output");
    suggestedActions.push("Offer shorter alternative");
  } else {
    suggestedActions.push("Execute instruction against context");
  }

  const safetyNotes: string[] = [
    "Local-first: review the prompt before sending to external agents.",
  ];
  if (["tera", "codra", "gatelane"].includes(target)) {
    safetyNotes.push("External API targets require valid keys and live endpoints.");
  }
  if (/\brm\s+-rf\b|drop\s+table|delete\s+from|force.?push/i.test(opts.instruction + summary)) {
    safetyNotes.push("Instruction/context may imply destructive actions — confirm before applying.");
  }

  return {
    id: newId("cmd"),
    timestamp: nowIso(),
    intent,
    instruction: opts.instruction,
    contextSummary: summary.slice(0, 500),
    target,
    confidence: opts.context.source === "manual" || opts.context.metadata?.fallback ? 0.65 : 0.85,
    prompt,
    suggestedActions,
    safetyNotes,
    rawContextId: opts.context.id,
    rawVoiceInputId: opts.voice?.id,
  };
}

export async function createCommand(input: CreateCommandInput): Promise<AgentCommand> {
  const instruction = (input.instruction || input.text || "").trim();
  if (!instruction) {
    throw new ScreenLaneError(
      "Missing instruction. Provide --text \"your instruction\".",
      "MISSING_INSTRUCTION",
      400
    );
  }

  let context: ScreenContext | undefined;

  if (input.contextId) {
    context = getContext(input.contextId);
  } else if (input.contextFile) {
    if (!existsSync(input.contextFile)) {
      throw new ScreenLaneError(`Context file not found: ${input.contextFile}`, "CONTEXT_FILE", 400);
    }
    const text = readFileSync(input.contextFile, "utf8");
    context = createScreenContext({
      source: "file",
      text,
      title: input.contextFile,
      metadata: { file: input.contextFile },
    });
  } else if (input.contextText) {
    context = createScreenContext({
      source: "text",
      text: input.contextText,
      title: "Inline context",
    });
  } else if (input.url) {
    context = await capture({ source: "url", url: input.url, save: false });
  } else if (input.clipboard) {
    context = await capture({ source: "clipboard", save: false });
  } else {
    // Empty context still allowed — instruction-only command
    context = createScreenContext({
      source: "manual",
      text: "(no screen context provided)",
      title: "No context",
      metadata: { empty: true },
    });
  }

  const target = parseTarget(input.target, loadConfig().defaultTarget);
  const cmd = createAgentCommand({ instruction, context, target });
  if (input.save) saveCommand(cmd);
  return cmd;
}
