import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/supabase/types";

const LABELS: Record<Tone, string> = {
  somber: "Somber",
  urgent: "Urgent",
  absurd: "Absurd",
  neutral: "Neutral",
  curious: "Curious",
};

const STYLES: Record<Tone, string> = {
  somber: "bg-muted text-muted-foreground",
  urgent: "bg-polarity-critical/15 text-polarity-critical",
  absurd: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  neutral: "bg-muted text-muted-foreground",
  curious: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
};

export function ToneBadge({ tone }: { tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        STYLES[tone],
      )}
    >
      {LABELS[tone]}
    </span>
  );
}
