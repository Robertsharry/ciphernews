import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database, SubscriptionStatus } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Cached per-request — safe to call from multiple server components. */
export const getCurrentSession = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: (profile ?? null) as Profile | null };
});

export const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "trialing"];

export function isSubscribed(profile: Profile | null) {
  if (process.env.DEV_BYPASS_PAYWALL === "1") return true;
  return !!profile && ACTIVE_STATUSES.includes(profile.subscription_status);
}
