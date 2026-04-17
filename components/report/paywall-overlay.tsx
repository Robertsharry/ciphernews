import Link from "next/link";

export function PaywallOverlay({ reason }: { reason: string }) {
  return (
    <div className="mt-8 rounded-lg border border-border bg-muted/40 p-8 text-center">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">
        Subscribers only
      </p>
      <h3 className="mt-3 text-2xl font-semibold">{reason}</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        $4.99/month or $49/year. Cancel whenever. No ads. No tracking. No sides.
      </p>
      <Link
        href="/billing"
        className="mt-6 inline-block rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
      >
        Subscribe
      </Link>
    </div>
  );
}
