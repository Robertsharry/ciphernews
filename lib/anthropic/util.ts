import "server-only";

import type Anthropic from "@anthropic-ai/sdk";

type Message = Anthropic.Messages.Message;
type ContentBlock = Message["content"][number];

export function textFromMessage(message: Message): string {
  return message.content
    .map((b: ContentBlock) => (b.type === "text" ? b.text : ""))
    .join("\n");
}

export function extractJsonObject(s: string): unknown {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object in LLM response");
  }
  return JSON.parse(s.slice(start, end + 1));
}
