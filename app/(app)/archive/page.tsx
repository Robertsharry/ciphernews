import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession, isSubscribed } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PaywallOverlay } from "@/components/report/paywall-overlay";

export const metadata = { title: "Archive" };

export default async function ArchivePage() {
  const { user, profile } = await getCurrentSession();
  if (!user || !profile) redirect("/sign-in");

  if (!isSubscribed(profile)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Archive</h1>
        <PaywallOverlay reason="The archive is a subscriber perk" />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, scope, cycle_at, region_key")
    .eq("scope", "world")
    .order("cycle_at", { ascending: false })
    .limit(120);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Archive</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every 6-hour report, newest first.
      </p>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {(reports ?? []).map((r) => (
          <li key={r.id}>
            <Link
              href={`/report/${r.id}`}
              className="flex items-center justify-between px-1 py-3 text-sm hover:bg-muted/40"
            >
              <span>
                {new Date(r.cycle_at).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {r.scope}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
