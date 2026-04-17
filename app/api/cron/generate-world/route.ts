import { NextResponse, type NextRequest } from "next/server";
import { updateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchWorldBatch } from "@/lib/newsapi/client";
import { generateWorldReport } from "@/lib/anthropic/prompts/world-report";
import { generatePuzzle } from "@/lib/anthropic/prompts/puzzle";

export const maxDuration = 300; // 5 min — Claude Opus + NewsAPI can be slow

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const started = Date.now();
  const cycleAt = truncateToCycle(new Date());

  try {
    const articles = await fetchWorldBatch();
    if (articles.length < 20) {
      return NextResponse.json(
        { error: "NewsAPI returned too few articles", count: articles.length },
        { status: 502 },
      );
    }

    const report = await generateWorldReport({ cycleAt, articles });
    const puzzle = await generatePuzzle(report.stories);

    const supabase = createServiceClient();
    const { error } = await supabase.from("reports").upsert(
      {
        scope: "world",
        region_key: null,
        cycle_at: cycleAt.toISOString(),
        stories: report.stories,
        puzzle,
        generation_meta: {
          model: "claude-opus-4-7",
          articles_considered: articles.length,
          elapsed_ms: Date.now() - started,
          editor_note: report.editor_note ?? null,
        },
      },
      { onConflict: "scope,region_key,cycle_at" },
    );
    if (error) throw error;

    updateTag("world");

    return NextResponse.json({
      ok: true,
      cycle_at: cycleAt.toISOString(),
      stories: report.stories.length,
      puzzle_type: puzzle.type,
      elapsed_ms: Date.now() - started,
    });
  } catch (err) {
    console.error("[cron/generate-world] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}

function isAuthorized(request: NextRequest): boolean {
  const header = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return header === `Bearer ${secret}`;
}

function truncateToCycle(now: Date): Date {
  const d = new Date(now);
  d.setUTCMinutes(0, 0, 0);
  const hr = d.getUTCHours();
  d.setUTCHours(hr - (hr % 6));
  return d;
}
