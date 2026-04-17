import { z } from "zod";

export const StorySourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
});

export const ToneSchema = z.enum([
  "somber",
  "urgent",
  "absurd",
  "neutral",
  "curious",
]);

export const PolaritySchema = z.enum(["positive", "critical", "neutral"]);

export const StorySchema = z.object({
  id: z.string().min(1),
  headline: z.string().min(1).max(180),
  body_spicy: z.string().min(40),
  body_clean: z.string().min(40),
  tone: ToneSchema,
  polarity: PolaritySchema,
  sources: z.array(StorySourceSchema).min(1),
  neutrality_check: z.enum(["ok", "needs_review"]),
});

export const ReportPayloadSchema = z.object({
  stories: z.array(StorySchema).min(10).max(12),
  editor_note: z.string().optional(),
});

export type ReportPayload = z.infer<typeof ReportPayloadSchema>;

// ---- puzzle ----
export const PuzzleTypeSchema = z.enum([
  "newsword",
  "word-ladder",
  "trivia",
  "riddle",
]);

export const PuzzleSchema = z.object({
  type: PuzzleTypeSchema,
  prompt: z.string().min(10),
  solution: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  hints: z.array(z.string().min(1)).max(3),
  ui_config: z.record(z.string(), z.unknown()).default({}),
});

export type PuzzlePayload = z.infer<typeof PuzzleSchema>;
