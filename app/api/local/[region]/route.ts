import { NextResponse, type NextRequest } from "next/server";
import { updateTag } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { fetchLocalBatch } from "@/lib/newsapi/client";
import { generateLocalReport } from "@/lib/anthropic/prompts/local-report";
import { generatePuzzle } from "@/lib/anthropic/prompts/puzzle";

export const maxDuration = 300;

type Ctx = { params: Promise<{ region: string }> };

/**
 * region is a slug shaped like "US-TX-Austin". We decode it and use the
 * user's profile (city/region/country) to actually drive the fetch — the
 * URL param is just the cache key.
 */
export async function POST(request: NextRequest, { params }: Ctx) {
  const { region } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("city, region, country, subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile?.city || !profile?.country) {
    return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
  }

  // Paywall: local news is subscriber-only.
  if (!["active", "trialing"].includes(profile.subscription_status)) {
    return NextResponse.json({ error: "Subscription required" }, { status: 402 });
  }

  const expectedRegion = regionKey(profile.city, profile.region, profile.country);
  if (region !== expectedRegion) {
    return NextResponse.json({ error: "Region mismatch" }, { status: 400 });
  }

  const service = createServiceClient();
  const cycleAt = truncateToCycle(new Date());

  // Check existing cache first.
  const { data: existing } = await service
    .from("reports")
    .select("id")
    .eq("scope", "local")
    .eq("region_key", region)
    .eq("cycle_at", cycleAt.toISOString())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, cached: true, id: existing.id });
  }

  // Generate.
  try {
    const articles = await fetchLocalBatch({
      city: profile.city,
      region: profile.region,
      country: profile.country,
    });

    const report = await generateLocalReport({
      cycleAt,
      city: profile.city,
      region: profile.region,
      country: profile.country,
      articles,
    });
    const puzzle = await generatePuzzle(report.stories);

    const { data: inserted, error } = await service
      .from("reports")
      .upsert(
        {
          scope: "local",
          region_key: region,
          cycle_at: cycleAt.toISOString(),
          stories: report.stories,
          puzzle,
          generation_meta: {
            city: profile.city,
            region: profile.region,
            country: profile.country,
            articles_considered: articles.length,
          },
        },
        { onConflict: "scope,region_key,cycle_at" },
      )
      .select("id")
      .single();
    if (error) throw error;

    updateTag(`local-${region}`);

    return NextResponse.json({ ok: true, cached: false, id: inserted?.id });
  } catch (err) {
    console.error("[api/local] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}

function regionKey(city: string, region: string | null, country: string): string {
  const parts = [country, region ?? "", city.replace(/\s+/g, "-")].filter(Boolean);
  return parts.join("-").toUpperCase();
}

function truncateToCycle(now: Date): Date {
  const d = new Date(now);
  d.setUTCMinutes(0, 0, 0);
  const hr = d.getUTCHours();
  d.setUTCHours(hr - (hr % 6));
  return d;
}
