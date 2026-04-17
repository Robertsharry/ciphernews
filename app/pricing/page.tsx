import Link from "next/link";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← ciphernews
      </Link>
      <h1 className="mt-6 text-4xl font-semibold">One price. Everything. No bullshit.</h1>
      <p className="mt-3 text-muted-foreground">
        $4.99 a month or $49 a year. No ads. No tracking. No editorial slant.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <PlanCard
          name="Monthly"
          price="$4.99"
          cadence="/mo"
          form="monthly"
          bullets={[
            "Every 6-hour report",
            "Local news for your city",
            "Puzzle at the end of every report",
            "Post in the forum",
            "Cancel whenever you want",
          ]}
        />
        <PlanCard
          name="Annual"
          price="$49"
          cadence="/yr"
          sub="(saves ~$11/yr vs monthly)"
          form="yearly"
          bullets={[
            "Everything in Monthly",
            "Two months free",
            "One less payment per year",
          ]}
          highlight
        />
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        Still thinking? The latest daily report is free. No card, no signup wall
        just to read. <Link href="/sign-up" className="underline">Make an account</Link> to
        lock in your city.
      </p>
    </main>
  );
}

type PlanCardProps = {
  name: string;
  price: string;
  cadence: string;
  sub?: string;
  form: "monthly" | "yearly";
  bullets: string[];
  highlight?: boolean;
};

function PlanCard({ name, price, cadence, sub, form, bullets, highlight }: PlanCardProps) {
  return (
    <div
      className={`rounded-lg border p-6 ${highlight ? "border-foreground" : "border-border"}`}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">{name}</h2>
        {highlight && (
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[11px] font-medium text-background">
            Best value
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold">
        {price}
        <span className="text-base text-muted-foreground">{cadence}</span>
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      <ul className="mt-4 space-y-1.5 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-muted-foreground">·</span> {b}
          </li>
        ))}
      </ul>
      <form action="/api/stripe/checkout" method="post" className="mt-6">
        <input type="hidden" name="plan" value={form} />
        <button className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90">
          Subscribe — {form === "yearly" ? "$49/yr" : "$4.99/mo"}
        </button>
      </form>
    </div>
  );
}
