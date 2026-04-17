"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NewThreadForm() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErr("Session expired");
      setLoading(false);
      return;
    }

    const { data: thread, error: threadErr } = await supabase
      .from("forum_threads")
      .insert({ title, author_id: user.id })
      .select("id")
      .single();
    if (threadErr || !thread) {
      setErr(threadErr?.message ?? "Failed to create thread");
      setLoading(false);
      return;
    }

    const { error: postErr } = await supabase
      .from("forum_posts")
      .insert({ thread_id: thread.id, author_id: user.id, body });
    if (postErr) {
      setErr(postErr.message);
      setLoading(false);
      return;
    }

    router.push(`/forum/thread/${thread.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          className="rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:border-foreground"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        First post
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={8000}
          rows={8}
          className="rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:border-foreground"
        />
      </label>
      {err && <p className="text-sm text-polarity-critical">{err}</p>}
      <button
        type="submit"
        disabled={loading || !title.trim() || !body.trim()}
        className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Posting…" : "Post thread"}
      </button>
    </form>
  );
}
