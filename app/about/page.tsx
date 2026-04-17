import Link from "next/link";

export const metadata = { title: "The manifesto" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 leading-relaxed">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; ciphernews
      </Link>
      <h1 className="mt-8 text-4xl font-semibold">Why this exists</h1>

      <section className="mt-10 space-y-5 text-lg">
        <p>
          Nobody here is going to tell you who was right. We tell you what
          happened. Full stop.
        </p>
        <p>
          Every six hours we grab the 10 to 12 things worth knowing from the
          last stretch. Some of it is grim. Some of it is great. Some of it is
          just weird. The tone follows the story, not the other way around.
        </p>
        <p>
          What you will never find in these reports:
        </p>
        <ul className="ml-6 list-disc space-y-2">
          <li>Editorial endorsements. No &ldquo;finally,&rdquo; no &ldquo;cruel decision,&rdquo; no halos.</li>
          <li>Unsourced claims. If we cannot attribute it, we do not publish it.</li>
          <li>A verdict when the sources disagree. You see the disagreement laid out, unedited.</li>
          <li>Slurs, threats, or targeting anyone by who they are.</li>
        </ul>
        <p>
          What you <em>will</em> find:
        </p>
        <ul className="ml-6 list-disc space-y-2">
          <li>
            Profanity, when an event genuinely warrants the emphasis. Flip Clean
            mode in your settings if that is not your thing. Every story ships
            with both versions.
          </li>
          <li>A mix that refuses to be all doom or all sunshine.</li>
          <li>Local coverage for your city right next to the world feed.</li>
          <li>A puzzle at the end, because you deserve to leave on something lighter.</li>
          <li>A forum to hash it out with other readers who give a damn.</li>
        </ul>
        <p>
          $4.99 a month. $49 a year. No ads. No tracking beyond what keeps the
          lights on. Cancel whenever you want.
        </p>
      </section>

      <div className="mt-12 flex gap-4">
        <Link
          href="/sign-up"
          className="rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90"
        >
          Get started
        </Link>
        <Link
          href="/pricing"
          className="rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
        >
          See plans
        </Link>
      </div>
    </main>
  );
}
