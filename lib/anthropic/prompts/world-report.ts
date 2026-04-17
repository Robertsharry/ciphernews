import "server-only";

import { getAnthropic, MODELS } from "@/lib/anthropic/client";
import { EDITORIAL_SYSTEM } from "./system";
import { ReportPayloadSchema, type ReportPayload } from "@/lib/anthropic/schemas";
import { textFromMessage, extractJsonObject } from "@/lib/anthropic/util";
import type { NewsApiArticle } from "@/lib/newsapi/client";

type Args = {
  cycleAt: Date;
  articles: NewsApiArticle[];
};

export async function generateWorldReport({
  cycleAt,
  articles,
}: Args): Promise<ReportPayload> {
  const anthropic = getAnthropic();

  const newsDigest = articles
    .slice(0, 60)
    .map((a, i) => {
      return `[${i + 1}] ${a.source?.name ?? "Unknown"} — ${a.title}
  url: ${a.url}
  desc: ${a.description ?? ""}
  published: ${a.publishedAt}`;
    })
    .join("\n\n");

  const userPrompt = `
Today's cycle: ${cycleAt.toISOString()} UTC (world edition).

You have ${articles.length} candidate stories fetched from NewsAPI in the past 6 hours, ordered by source mix:

---
${newsDigest}
---

## Your task

1. Cluster the candidates into distinct real-world events. Drop duplicates, celebrity churn, and thin aggregator re-posts.
2. Pick 10–12 of the most globally significant events — real news, not opinion pieces.
3. For each, write the story per the editorial system prompt. Cite at least one of the source URLs above per story.
4. Balance polarity per the rules. If you cannot hit ~4/~4/~4, write editor_note explaining why.
5. Return JSON only — no preamble, no markdown fences.
`.trim();

  const resp = await anthropic.messages.create({
    model: MODELS.report,
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: EDITORIAL_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  return ReportPayloadSchema.parse(extractJsonObject(textFromMessage(resp)));
}
