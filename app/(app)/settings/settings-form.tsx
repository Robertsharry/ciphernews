"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Defaults = {
  city: string;
  region: string;
  country: string;
  display_name: string;
  clean_mode: boolean;
};

export function SettingsForm({ defaults }: { defaults: Defaults }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function update<K extends keyof Defaults>(k: K, v: Defaults[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErr("Session expired");
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        city: form.city || null,
        region: form.region || null,
        country: form.country || null,
        display_name: form.display_name || null,
        clean_mode: form.clean_mode,
      })
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Display name
        <input
          value={form.display_name}
          onChange={(e) => update("display_name", e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          City
          <input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Region
          <input
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Country
          <input
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
          />
        </label>
      </div>
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.clean_mode}
          onChange={(e) => update("clean_mode", e.target.checked)}
          className="h-4 w-4 accent-foreground"
        />
        Clean mode: strips the profanity, keeps the facts
      </label>
      {err && <p className="text-sm text-polarity-critical">{err}</p>}
      {saved && <p className="text-sm text-polarity-positive">Saved.</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
