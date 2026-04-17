import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentSession, isSubscribed } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Forum" };

export default async function ForumPage() {
  await connection();
  const { user, profile } = await getCurrentSession();
  if (!user || !profile) redirect("/sign-in");

  const supabase = await createClient();
  const { data: threads } = await supabase
    .from("forum_threads")
    .select("id, title, last_post_at, post_count, author_id")
    .order("last_post_at", { ascending: false })
    .limit(50);

  const subscribed = isSubscribed(profile);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Forum
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Discussion</h1>
          {!subscribed && (
            <p className="mt-2 text-sm text-muted-foreground">
              You can read. Subscribe to talk.
            </p>
          )}
        </div>
        {subscribed ? (
          <Link
            href="/forum/new"
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            New thread
          </Link>
        ) : (
          <Link
            href="/billing"
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Subscribe to post
          </Link>
        )}
      </div>

      <div className="mt-8 divide-y divide-border border-t border-b border-border">
        {threads && threads.length > 0 ? (
          threads.map((t) => (
            <Link
              key={t.id}
              href={`/forum/thread/${t.id}`}
              className="flex items-center justify-between gap-4 px-1 py-4 hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.post_count} {t.post_count === 1 ? "reply" : "replies"} ·
                  last activity {new Date(t.last_post_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="px-1 py-8 text-center text-sm text-muted-foreground">
            No threads yet. Be the first.
          </p>
        )}
      </div>
    </div>
  );
}
