export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">
        ciphernews
      </p>
      <h1 className="mt-4 text-5xl font-semibold leading-tight text-foreground">
        Ten to twelve stories.
        <br />
        Every six hours.
        <br />
        <span className="text-muted-foreground">No sides.</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        We tell you what happened. Not who to blame. The tone matches the
        story. We swear when the moment calls for it. Clean mode if you want
        it. Every report ends with a puzzle because you earned one.
      </p>
      <div className="mt-10 flex gap-4">
        <a
          href="/sign-up"
          className="rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90"
        >
          Get in for $4.99/mo
        </a>
        <a
          href="/about"
          className="rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
        >
          Read the manifesto
        </a>
      </div>
    </main>
  );
}
