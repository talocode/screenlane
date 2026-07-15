import type { ScreenContext } from "./types.js";

/** Summarize screen context for prompts without dumping huge blobs */
export function summarizeContext(ctx: ScreenContext, maxLen = 2000): string {
  const parts: string[] = [];
  parts.push(`source=${ctx.source}`);
  if (ctx.title) parts.push(`title=${ctx.title}`);
  if (ctx.appName) parts.push(`app=${ctx.appName}`);
  if (ctx.url) parts.push(`url=${ctx.url}`);
  if (ctx.imagePath) parts.push(`image=${ctx.imagePath}`);
  const header = parts.join(" | ");
  const body = (ctx.text || "").trim();
  if (!body) return header;
  const clipped = body.length > maxLen ? body.slice(0, maxLen) + "\n…[truncated]" : body;
  return `${header}\n\n${clipped}`;
}

export function detectLikelyIntent(instruction: string, contextText = ""): string {
  const s = `${instruction}\n${contextText}`.toLowerCase();
  if (/\b(fix|debug|error|exception|stack trace|traceback|crash)\b/.test(s)) return "debug_error";
  if (/\b(explain|what is|summarize|summary)\b/.test(s)) return "explain";
  if (/\b(review|ui|design|layout)\b/.test(s)) return "review_ui";
  if (/\b(tweet|x post|post on x|thread)\b/.test(s)) return "write_x_post";
  if (/\b(email|reply|respond)\b/.test(s)) return "write_reply";
  if (/\b(prompt|write the prompt)\b/.test(s)) return "write_prompt";
  if (/\b(refactor|clean up|improve code)\b/.test(s)) return "refactor";
  if (/\b(test|unit test|coverage)\b/.test(s)) return "write_tests";
  if (/\b(document|readme|docs)\b/.test(s)) return "write_docs";
  return "general_action";
}

export function extractLikelyPaths(text: string): string[] {
  const matches = text.match(/(?:[A-Za-z0-9_.@-]+\/)+[A-Za-z0-9_.@-]+\.[A-Za-z0-9]+/g) || [];
  return [...new Set(matches)].slice(0, 12);
}
