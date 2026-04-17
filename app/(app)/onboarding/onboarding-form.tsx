"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = { defaults: { city: string; region: string; country: string } };

export function OnboardingForm({ defaults }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [city, setCity] = useState(defaults.city);
  const [region, setRegion] = useState(defaults.region);
  const [country, setCountry] = useState(defaults.country);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErr("Session expired. Sign in again.");
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ city, region, country })
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        City
        <input
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Region / State
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="e.g. CA, TX, NY"
          className="rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Country
        <input
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g. US, GB, DE"
          className="rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
        />
      </label>
      {err && <p className="text-sm text-polarity-critical">{err}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
