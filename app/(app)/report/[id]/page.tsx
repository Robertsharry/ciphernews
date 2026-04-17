import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentSession, isSubscribed } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ReportView } from "@/components/report/report-view";
import { PaywallOverlay } from "@/components/report/paywall-overlay";
import type { Puzzle, Story } from "@/lib/supabase/types";

type Ctx = { params: Promise<{ id: string }> };

export default async function ReportPage({ params }: Ctx) {
  await connection();
  const { id } = await params;
  const { user, profile } = await getCurrentSession();
  if (!user || !profile) redirect("/sign-in");

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!report) notFound();

  // Free users can only see today's latest (by cycle).
  const subscribed = isSubscribed(profile);
  if (!subscribed) {
    const { data: latest } = await supabase
      .from("reports")
      .select("id")
      .eq("scope", report.scope)
      .order("cycle_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.id !== report.id) {
      return (
        <div className="mx-auto max-w-3xl px-6 py-12">
          <PaywallOverlay reason="Older reports are for subscribers" />
        </div>
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <ReportView
        reportId={report.id}
        scope={report.scope}
        cycleAt={report.cycle_at}
        regionLabel={report.region_key}
        stories={report.stories as Story[]}
        puzzle={report.puzzle as Puzzle}
        cleanMode={profile.clean_mode}
        editorNote={
          (report.generation_meta as { editor_note?: string } | null)
            ?.editor_note ?? null
        }
      />
    </div>
  );
}
