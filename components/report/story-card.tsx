import type { Story } from "@/lib/supabase/types";
import { ToneBadge } from "./tone-badge";
import { PolarityIndicator } from "./polarity-indicator";

type Props = {
  story: Story;
  cleanMode: boolean;
  index: number;
};

export function StoryCard({ story, cleanMode, index }: Props) {
  const body = cleanMode ? story.body_clean : story.body_spicy;

  return (
    <article className="border-b border-border py-8 first:pt-0 last:border-b-0">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xs font-mono text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <ToneBadge tone={story.tone} />
        <PolarityIndicator polarity={story.polarity} />
      </div>
      <h2 className="text-2xl font-semibold leading-tight">{story.headline}</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground/90">
        {body.split(/\n\n+/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      {story.sources.length > 0 && (
        <div className="mt-4 text-xs text-muted-foreground">
          Sources:{" "}
          {story.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ", "}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted hover:text-foreground"
              >
                {s.name}
              </a>
            </span>
          ))}
        </div>
      )}
      {story.neutrality_check === "needs_review" && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          Flagged for editorial review. Blackbox was not fully confident this landed
          on the right side of the line.
        </p>
      )}
    </article>
  );
}
