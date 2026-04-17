import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession, isSubscribed } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ReportView } from "@/components/report/report-view";
import { PaywallOverlay } from "@/components/report/paywall-overlay";
import { CleanModeToggle } from "@/components/report/clean-mode-toggle";
import type { Puzzle, Story } from "@/lib/supabase/types";

export const metadata = { title: "Today" };

export default async function DashboardPage() {
  const { user, profile } = await getCurrentSession();
  if (!user || !profile) redirect("/sign-in");

  const supabase = await createClient();

  const { data: worldReport } = await supabase
    .from("reports")
    .select("*")
    .eq("scope", "world")
    .order("cycle_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!worldReport) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">No report yet</h1>
        <p className="mt-2 text-muted-foreground">
          First report of the day is still generating. Sit tight.
        </p>
      </div>
    );
  }

  const regionKey = profile.city && profile.country
    ? [profile.country, profile.region ?? "", profile.city.replace(/\s+/g, "-")]
        .filter(Boolean)
        .join("-")
        .toUpperCase()
    : null;

  const { data: localReport } = regionKey
    ? await supabase
        .from("reports")
        .select("*")
        .eq("scope", "local")
        .eq("region_key", regionKey)
        .order("cycle_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const subscribed = isSubscribed(profile);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hey{profile.display_name ? `, ${profile.display_name}` : ""}.
        </p>
        <CleanModeToggle initial={profile.clean_mode} />
      </div>

      <ReportView
        reportId={worldReport.id}
        scope="world"
        cycleAt={worldReport.cycle_at}
        stories={worldReport.stories as Story[]}
        puzzle={worldReport.puzzle as Puzzle}
        cleanMode={profile.clean_mode}
        editorNote={
          (worldReport.generation_meta as { editor_note?: string } | null)
            ?.editor_note ?? null
        }
      />

      <section className="mt-20 border-t border-border pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Local
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              {profile.city}
              {profile.region ? `, ${profile.region}` : ""}
            </h2>
          </div>
          {subscribed && regionKey && !localReport && (
            <GenerateLocalButton regionKey={regionKey} />
          )}
        </div>

        {!subscribed ? (
          <PaywallOverlay reason="Local news needs a subscription" />
        ) : localReport ? (
          <div className="mt-8">
            <ReportView
              reportId={localReport.id}
              scope="local"
              cycleAt={localReport.cycle_at}
              regionLabel={`${profile.city}${profile.region ? `, ${profile.region}` : ""}`}
              stories={localReport.stories as Story[]}
              puzzle={localReport.puzzle as Puzzle}
              cleanMode={profile.clean_mode}
            />
          </div>
        ) : (
          <p className="mt-6 text-muted-foreground">
            No local report yet this cycle. Hit Generate and we build it on the spot.
          </p>
        )}
      </section>

      <div className="mt-16 text-center">
        <Link
          href="/archive"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Browse the archive →
        </Link>
      </div>
    </div>
  );
}

function GenerateLocalButton({ regionKey }: { regionKey: string }) {
  // Client component inlined as a link to a tiny trigger page would be overkill;
  // instead, we render a plain anchor that POSTs via a form.
  return (
    <form action={`/api/local/${regionKey}`} method="post">
      <button className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted">
        Generate
      </button>
    </form>
  );
}
