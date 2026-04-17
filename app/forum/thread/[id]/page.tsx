import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { getCurrentSession, isSubscribed } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ReplyForm } from "./reply-form";

type Ctx = { params: Promise<{ id: string }> };

export default async function ThreadPage({ params }: Ctx) {
  await connection();
  const { id } = await params;
  const { user, profile } = await getCurrentSession();
  if (!user || !profile) redirect("/sign-in");

  const supabase = await createClient();
  const { data: thread } = await supabase
    .from("forum_threads")
    .select("id, title, locked, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!thread) notFound();

  const { data: posts } = await supabase
    .from("forum_posts")
    .select("id, body, author_id, created_at")
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  const subscribed = isSubscribed(profile);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/forum" className="text-sm text-muted-foreground hover:text-foreground">
        ← Forum
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{thread.title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Opened {new Date(thread.created_at).toLocaleDateString()}
      </p>

      <div className="mt-8 space-y-6">
        {(posts ?? []).map((p) => (
          <article
            key={p.id}
            className="rounded-lg border border-border p-5"
          >
            <p className="text-xs text-muted-foreground">
              {new Date(p.created_at).toLocaleString()}
            </p>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
              {p.body}
            </div>
          </article>
        ))}
      </div>

      {thread.locked ? (
        <p className="mt-10 text-sm text-muted-foreground">This thread is locked.</p>
      ) : subscribed ? (
        <div className="mt-10">
          <h2 className="text-sm font-medium">Reply</h2>
          <ReplyForm threadId={id} />
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">
          <Link href="/billing" className="underline">
            Subscribe
          </Link>{" "}
          to reply.
        </p>
      )}
    </div>
  );
}
