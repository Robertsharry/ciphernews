"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErr("Session expired");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("forum_posts").insert({
      thread_id: threadId,
      author_id: user.id,
      body,
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
      <textarea
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={8000}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
      />
      {err && <p className="text-sm text-polarity-critical">{err}</p>}
      <button
        type="submit"
        disabled={loading || !body.trim()}
        className="self-start rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Reply"}
      </button>
    </form>
  );
}
