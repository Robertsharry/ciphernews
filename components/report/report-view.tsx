import type { Puzzle, Story } from "@/lib/supabase/types";
import { StoryCard } from "./story-card";
import { PuzzleRunner } from "@/components/puzzle/puzzle-runner";

type Props = {
  reportId: string;
  scope: "world" | "local";
  cycleAt: string;
  regionLabel?: string | null;
  stories: Story[];
  puzzle: Puzzle;
  cleanMode: boolean;
  editorNote?: string | null;
};

export function ReportView({
  reportId,
  scope,
  cycleAt,
  regionLabel,
  stories,
  puzzle,
  cleanMode,
  editorNote,
}: Props) {
  return (
    <div>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {scope === "world" ? "World" : `Local · ${regionLabel ?? ""}`}
        </p>
        <h1 className="mt-2 text-4xl font-semibold">
          {new Date(cycleAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </h1>
        {editorNote && (
          <p className="mt-3 italic text-muted-foreground">{editorNote}</p>
        )}
      </header>
      <div>
        {stories.map((story, i) => (
          <StoryCard
            key={story.id}
            story={story}
            cleanMode={cleanMode}
            index={i}
          />
        ))}
      </div>
      <section className="mt-16 border-t border-border pt-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          End of report
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Before you go</h2>
        <PuzzleRunner reportId={reportId} puzzle={puzzle} />
      </section>
    </div>
  );
}
