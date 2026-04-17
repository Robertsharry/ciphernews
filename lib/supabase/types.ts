// Supabase database typings. Regenerate with:
//   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
// For now a hand-written shape that matches db/migrations/0001_init.sql.

export type SubscriptionStatus =
  | "free"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

export type Polarity = "positive" | "critical" | "neutral";
export type Tone = "somber" | "urgent" | "absurd" | "neutral" | "curious";
export type PuzzleType = "newsword" | "word-ladder" | "trivia" | "riddle";

export type StorySource = { name: string; url: string };

export type Story = {
  id: string;
  headline: string;
  body_spicy: string;
  body_clean: string;
  tone: Tone;
  polarity: Polarity;
  sources: StorySource[];
  neutrality_check: "ok" | "needs_review";
};

export type Puzzle = {
  type: PuzzleType;
  prompt: string;
  solution: string | string[];
  hints: string[];
  ui_config: Record<string, unknown>;
};

type Timestamptz = string;
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfilesRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  clean_mode: boolean;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: Timestamptz | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

type ReportsRow = {
  id: string;
  scope: "world" | "local";
  region_key: string | null;
  cycle_at: Timestamptz;
  stories: Story[];
  puzzle: Puzzle;
  generation_meta: Record<string, unknown> | null;
  created_at: Timestamptz;
};

type ForumThreadsRow = {
  id: string;
  author_id: string;
  title: string;
  last_post_at: Timestamptz;
  post_count: number;
  locked: boolean;
  created_at: Timestamptz;
};

type ForumPostsRow = {
  id: string;
  thread_id: string;
  author_id: string;
  parent_post_id: string | null;
  body: string;
  edited_at: Timestamptz | null;
  hidden: boolean;
  created_at: Timestamptz;
};

type PuzzleAttemptsRow = {
  id: string;
  user_id: string;
  report_id: string;
  solved_at: Timestamptz | null;
  tries: number;
  last_answer: Json | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow;
        Insert: Partial<ProfilesRow> & { id: string };
        Update: Partial<ProfilesRow>;
        Relationships: [];
      };
      reports: {
        Row: ReportsRow;
        Insert: Omit<ReportsRow, "id" | "created_at"> & {
          id?: string;
          created_at?: Timestamptz;
        };
        Update: Partial<ReportsRow>;
        Relationships: [];
      };
      forum_threads: {
        Row: ForumThreadsRow;
        Insert: Partial<ForumThreadsRow> & { author_id: string; title: string };
        Update: Partial<ForumThreadsRow>;
        Relationships: [];
      };
      forum_posts: {
        Row: ForumPostsRow;
        Insert: Partial<ForumPostsRow> & {
          thread_id: string;
          author_id: string;
          body: string;
        };
        Update: Partial<ForumPostsRow>;
        Relationships: [];
      };
      puzzle_attempts: {
        Row: PuzzleAttemptsRow;
        Insert: Partial<PuzzleAttemptsRow> & {
          user_id: string;
          report_id: string;
        };
        Update: Partial<PuzzleAttemptsRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
