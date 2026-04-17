import "server-only";

import { getAnthropic, MODELS } from "@/lib/anthropic/client";
import { PuzzleSchema, type PuzzlePayload } from "@/lib/anthropic/schemas";
import { textFromMessage, extractJsonObject } from "@/lib/anthropic/util";
import type { Story } from "@/lib/supabase/types";

const PUZZLE_SYSTEM = `
You generate short end-of-report puzzles for ciphernews. Pick ONE of these shapes per cycle:

1. "riddle" — a single lateral-thinking riddle, 1-3 sentences. solution is a short phrase.
   ui_config: {}
2. "trivia" — five multiple-choice questions based on the stories in this cycle.
   solution is an array of the correct letters (e.g. ["B","A","C","D","A"]).
   ui_config: { "questions": [ { "q": "...", "options": ["A...", "B...", "C...", "D..."] }, ... ] }
3. "word-ladder" — start word to end word in 3-5 steps, changing one letter per step.
   solution is the array of words [start, ..., end].
   ui_config: { "start": "...", "end": "...", "steps": <number-of-steps> }
4. "newsword" — 5 short crossword-style clues tied to headlines in this cycle.
   solution is an array of the 5 answers.
   ui_config: { "clues": [{ "clue": "...", "length": 6 }, ...] }

Rules:
- Stay family-friendly. Never use profanity in puzzles (they sit below a cursing report already).
- Keep it quick — under 60 seconds of engagement.
- Output a single JSON object only, no markdown fences.
`.trim();

export async function generatePuzzle(
  stories: Story[],
  opts?: { preferredType?: PuzzlePayload["type"] },
): Promise<PuzzlePayload> {
  const anthropic = getAnthropic();

  const storyDigest = stories
    .slice(0, 12)
    .map(
      (s, i) => `[${i + 1}] ${s.headline}\n    topic: ${s.tone}/${s.polarity}`,
    )
    .join("\n");

  const userPrompt = `
Today's stories (for inspiration only — you decide the shape):

${storyDigest}

${opts?.preferredType ? `Use puzzle type: ${opts.preferredType}.` : "Pick any one of the four shapes."}

Return a single JSON object matching the schema in the system prompt.
`.trim();

  const resp = await anthropic.messages.create({
    model: MODELS.puzzle,
    max_tokens: 1200,
    system: [
      {
        type: "text",
        text: PUZZLE_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  return PuzzleSchema.parse(extractJsonObject(textFromMessage(resp)));
}
