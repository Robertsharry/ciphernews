"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CleanModeToggle({ initial }: { initial: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const supabase = createClient();

  async function toggle() {
    const next = !initial;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ clean_mode: next })
      .eq("id", user.id);
    startTransition(() => router.refresh());
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={initial}
        disabled={pending}
        onChange={toggle}
        className="h-4 w-4 accent-foreground"
      />
      Clean mode
    </label>
  );
}
