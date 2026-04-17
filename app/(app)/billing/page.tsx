import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession, isSubscribed } from "@/lib/auth/session";

export const metadata = { title: "Billing" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { user, profile } = await getCurrentSession();
  if (!user || !profile) redirect("/sign-in");

  const params = await searchParams;
  const subscribed = isSubscribed(profile);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Billing</h1>

      {params.success && (
        <p className="mt-4 rounded-md border border-polarity-positive bg-polarity-positive/10 px-4 py-3 text-sm">
          Subscription active. You are locked in.
        </p>
      )}
      {params.canceled && (
        <p className="mt-4 rounded-md border border-border px-4 py-3 text-sm text-muted-foreground">
          Nothing was charged. No sweat.
        </p>
      )}

      <div className="mt-8 rounded-lg border border-border p-6">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Current plan
        </p>
        <p className="mt-2 text-2xl font-semibold capitalize">
          {profile.subscription_status.replace("_", " ")}
        </p>
        {profile.current_period_end && (
          <p className="mt-1 text-sm text-muted-foreground">
            Renews / ends {new Date(profile.current_period_end).toLocaleDateString()}
          </p>
        )}
      </div>

      {subscribed ? (
        <form action="/api/stripe/portal" method="post" className="mt-6">
          <button className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
            Manage in Stripe →
          </button>
        </form>
      ) : (
        <div className="mt-6">
          <Link
            href="/pricing"
            className="inline-block rounded-md bg-foreground px-4 py-2.5 text-sm text-background hover:opacity-90"
          >
            See plans
          </Link>
        </div>
      )}
    </div>
  );
}
