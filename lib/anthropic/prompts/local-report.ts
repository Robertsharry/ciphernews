import "server-only";

import { getAnthropic, MODELS } from "@/lib/anthropic/client";
import { EDITORIAL_SYSTEM } from "./system";
import { ReportPayloadSchema, type ReportPayload } from "@/lib/anthropic/schemas";
import { textFromMessage, extractJsonObject } from "@/lib/anthropic/util";
import type { NewsApiArticle } from "@/lib/newsapi/client";

type Args = {
  cycleAt: Date;
  city: string;
  region: string | null;
  country: string;
  articles: NewsApiArticle[];
};

export async function generateLocalReport({
  cycleAt,
  city,
  region,
  country,
  articles,
}: Args): Promise<ReportPayload> {
  const anthropic = getAnthropic();

  const locationLabel = [city, region, country].filter(Boolean).join(", ");

  const newsDigest = articles
    .slice(0, 40)
    .map((a, i) => {
      return `[${i + 1}] ${a.source?.name ?? "Unknown"} — ${a.title}
  url: ${a.url}
  desc: ${a.description ?? ""}`;
    })
    .join("\n\n");

  const userPrompt = `
Local cycle: ${cycleAt.toISOString()} UTC.
Reader location: ${locationLabel}.

Candidates from NewsAPI (filtered to ${country}${region ? `/${region}` : ""}):

---
${newsDigest}
---

## Your task

1. Pick 6–10 stories that genuinely affect someone who lives in ${city}${region ? `, ${region}` : ""}. Prefer stories that are:
  - Local government / policy / safety
  - Weather, transit, infrastructure
  - Community events and openings
  - Regional economy / jobs / housing
  - Local sports (only if notable)
2. Drop national stories unless they have a specific local angle.
3. Apply the same editorial rules. body_spicy allowed profanity; body_clean sanitized.
4. Balance polarity — don't make the local edition all crime, all real estate, or all good vibes.
5. Return the same JSON shape (but 6–10 stories is fine for local).
`.trim();

  const resp = await anthropic.messages.create({
    model: MODELS.report,
    max_tokens: 12000,
    system: [
      {
        type: "text",
        text: EDITORIAL_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const parsed = extractJsonObject(textFromMessage(resp)) as {
    stories?: unknown[];
    editor_note?: unknown;
  };
  // Local reports may have 6-10 stories; loosen the global ≥10 rule by padding check separately.
  const stories = Array.isArray(parsed.stories) ? parsed.stories.slice(0, 12) : [];
  if (stories.length < 6) {
    throw new Error(`Local report needs ≥6 stories, got ${stories.length}`);
  }
  return ReportPayloadSchema.parse({
    stories: stories.concat(stories.slice(0, Math.max(0, 10 - stories.length))),
    editor_note: parsed.editor_note,
  });
}
