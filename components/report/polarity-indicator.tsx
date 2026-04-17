import { cn } from "@/lib/utils";
import type { Polarity } from "@/lib/supabase/types";

const DOT: Record<Polarity, string> = {
  positive: "bg-polarity-positive",
  critical: "bg-polarity-critical",
  neutral: "bg-polarity-neutral",
};

const LABEL: Record<Polarity, string> = {
  positive: "Uplifting",
  critical: "Sobering",
  neutral: "Informational",
};

export function PolarityIndicator({ polarity }: { polarity: Polarity }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[polarity])} />
      {LABEL[polarity]}
    </span>
  );
}
