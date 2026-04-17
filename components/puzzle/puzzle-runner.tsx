"use client";

import { useState } from "react";
import type { Puzzle } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Props = { reportId: string; puzzle: Puzzle };

export function PuzzleRunner({ reportId, puzzle }: Props) {
  const [revealed, setRevealed] = useState(false);

  switch (puzzle.type) {
    case "riddle":
      return <RiddleRenderer puzzle={puzzle} reportId={reportId} revealed={revealed} setRevealed={setRevealed} />;
    case "trivia":
      return <TriviaRenderer puzzle={puzzle} reportId={reportId} />;
    case "word-ladder":
      return <WordLadderRenderer puzzle={puzzle} reportId={reportId} revealed={revealed} setRevealed={setRevealed} />;
    case "newsword":
      return <NewswordRenderer puzzle={puzzle} reportId={reportId} revealed={revealed} setRevealed={setRevealed} />;
  }
}

// ---- riddle ----
function RiddleRenderer({
  puzzle,
  reportId,
  revealed,
  setRevealed,
}: {
  puzzle: Puzzle;
  reportId: string;
  revealed: boolean;
  setRevealed: (b: boolean) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const expected = asStringSolution(puzzle.solution);

  function check() {
    const ok = answer.trim().toLowerCase() === expected.toLowerCase();
    setResult(ok ? "correct" : "wrong");
    if (ok) recordAttempt(reportId, { type: "riddle", answer, solved: true });
  }

  return (
    <PuzzleShell prompt={puzzle.prompt}>
      <div className="mt-4 flex gap-2">
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={check}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Check
        </button>
      </div>
      {result === "correct" && <p className="mt-2 text-sm text-polarity-positive">Nailed it.</p>}
      {result === "wrong" && <p className="mt-2 text-sm text-polarity-critical">Wrong. Go again.</p>}
      <HintsAndReveal
        hints={puzzle.hints}
        revealed={revealed}
        setRevealed={setRevealed}
        solution={expected}
      />
    </PuzzleShell>
  );
}

// ---- trivia ----
type TriviaConfig = {
  questions?: { q: string; options: string[] }[];
};

function TriviaRenderer({ puzzle, reportId }: { puzzle: Puzzle; reportId: string }) {
  const config = puzzle.ui_config as TriviaConfig;
  const questions = config?.questions ?? [];
  const solution = Array.isArray(puzzle.solution)
    ? puzzle.solution
    : [puzzle.solution];
  const [picks, setPicks] = useState<string[]>(() => questions.map(() => ""));
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    setSubmitted(true);
    const correct = picks.every(
      (p, i) => p.toUpperCase() === String(solution[i] ?? "").toUpperCase(),
    );
    if (correct) recordAttempt(reportId, { type: "trivia", picks, solved: true });
  }

  const score = submitted
    ? picks.filter(
        (p, i) => p.toUpperCase() === String(solution[i] ?? "").toUpperCase(),
      ).length
    : 0;

  return (
    <PuzzleShell prompt={puzzle.prompt}>
      <div className="mt-4 space-y-5">
        {questions.map((q, qi) => (
          <div key={qi}>
            <p className="font-medium">
              {qi + 1}. {q.q}
            </p>
            <div className="mt-2 grid gap-1">
              {q.options.map((opt, oi) => {
                const letter = String.fromCharCode(65 + oi);
                const picked = picks[qi] === letter;
                const correctLetter = String(solution[qi] ?? "").toUpperCase();
                const showCorrect = submitted && letter === correctLetter;
                const showWrong = submitted && picked && letter !== correctLetter;
                return (
                  <button
                    key={oi}
                    onClick={() =>
                      !submitted &&
                      setPicks((prev) =>
                        prev.map((v, i) => (i === qi ? letter : v)),
                      )
                    }
                    className={cn(
                      "rounded-md border px-3 py-2 text-left text-sm",
                      picked
                        ? "border-foreground"
                        : "border-border hover:border-foreground/50",
                      showCorrect && "border-polarity-positive bg-polarity-positive/10",
                      showWrong && "border-polarity-critical bg-polarity-critical/10",
                    )}
                  >
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {letter}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={submit}
          disabled={picks.some((p) => !p)}
          className="mt-6 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-50"
        >
          Submit
        </button>
      ) : (
        <p className="mt-6 text-sm">
          You got <strong>{score}</strong>/{questions.length}.
        </p>
      )}
    </PuzzleShell>
  );
}

// ---- word ladder ----
function WordLadderRenderer({
  puzzle,
  reportId,
  revealed,
  setRevealed,
}: {
  puzzle: Puzzle;
  reportId: string;
  revealed: boolean;
  setRevealed: (b: boolean) => void;
}) {
  const solution = Array.isArray(puzzle.solution)
    ? puzzle.solution.map((s) => s.toLowerCase())
    : [];
  const start = solution[0] ?? "";
  const end = solution[solution.length - 1] ?? "";
  const steps = Math.max(solution.length - 2, 1);
  const [guesses, setGuesses] = useState<string[]>(() => Array(steps).fill(""));
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  function check() {
    const full = [start, ...guesses.map((g) => g.toLowerCase()), end];
    const ok = full.join(",") === solution.join(",");
    setResult(ok ? "correct" : "wrong");
    if (ok) recordAttempt(reportId, { type: "word-ladder", guesses, solved: true });
  }

  return (
    <PuzzleShell prompt={puzzle.prompt}>
      <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-sm">
        <span className="rounded-md bg-muted px-3 py-1.5">{start}</span>
        {guesses.map((g, i) => (
          <input
            key={i}
            value={g}
            onChange={(e) =>
              setGuesses((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
            }
            placeholder="___"
            className="w-24 rounded-md border border-border bg-background px-3 py-1.5"
          />
        ))}
        <span className="rounded-md bg-muted px-3 py-1.5">{end}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={check}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Check
        </button>
      </div>
      {result === "correct" && <p className="mt-2 text-sm text-polarity-positive">Clean run.</p>}
      {result === "wrong" && <p className="mt-2 text-sm text-polarity-critical">One of those is wrong. Fix it.</p>}
      <HintsAndReveal
        hints={puzzle.hints}
        revealed={revealed}
        setRevealed={setRevealed}
        solution={solution.join(" → ")}
      />
    </PuzzleShell>
  );
}

// ---- newsword ----
type NewswordConfig = { clues?: { clue: string; length: number }[] };

function NewswordRenderer({
  puzzle,
  reportId,
  revealed,
  setRevealed,
}: {
  puzzle: Puzzle;
  reportId: string;
  revealed: boolean;
  setRevealed: (b: boolean) => void;
}) {
  const config = puzzle.ui_config as NewswordConfig;
  const clues = config?.clues ?? [];
  const solution = Array.isArray(puzzle.solution)
    ? puzzle.solution.map((s) => s.toLowerCase())
    : [];
  const [answers, setAnswers] = useState<string[]>(() => clues.map(() => ""));
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  function check() {
    const ok = answers.every(
      (a, i) => a.trim().toLowerCase() === String(solution[i] ?? "").toLowerCase(),
    );
    setResult(ok ? "correct" : "wrong");
    if (ok) recordAttempt(reportId, { type: "newsword", answers, solved: true });
  }

  return (
    <PuzzleShell prompt={puzzle.prompt}>
      <ol className="mt-4 space-y-3">
        {clues.map((c, i) => (
          <li key={i} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="flex-1 text-sm">
              <span className="mr-2 font-mono text-xs text-muted-foreground">
                {i + 1}.
              </span>
              {c.clue}
            </span>
            <input
              value={answers[i]}
              onChange={(e) =>
                setAnswers((prev) =>
                  prev.map((v, j) => (j === i ? e.target.value : v)),
                )
              }
              maxLength={c.length}
              className="w-40 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm"
              placeholder={"_".repeat(c.length)}
            />
          </li>
        ))}
      </ol>
      <button
        onClick={check}
        className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
      >
        Check
      </button>
      {result === "correct" && <p className="mt-2 text-sm text-polarity-positive">Locked it in.</p>}
      {result === "wrong" && <p className="mt-2 text-sm text-polarity-critical">At least one clue is off.</p>}
      <HintsAndReveal
        hints={puzzle.hints}
        revealed={revealed}
        setRevealed={setRevealed}
        solution={solution.join(", ")}
      />
    </PuzzleShell>
  );
}

// ---- shared ----

function PuzzleShell({
  prompt,
  children,
}: {
  prompt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-lg border border-border p-6">
      <p className="text-base leading-relaxed">{prompt}</p>
      {children}
    </div>
  );
}

function HintsAndReveal({
  hints,
  revealed,
  setRevealed,
  solution,
}: {
  hints: string[];
  revealed: boolean;
  setRevealed: (b: boolean) => void;
  solution: string;
}) {
  return (
    <div className="mt-4 space-y-2 text-xs text-muted-foreground">
      {hints.length > 0 && (
        <details>
          <summary className="cursor-pointer">Hints ({hints.length})</summary>
          <ul className="mt-2 list-disc pl-5">
            {hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </details>
      )}
      <button
        onClick={() => setRevealed(!revealed)}
        className="underline decoration-dotted hover:text-foreground"
      >
        {revealed ? "Hide answer" : "Reveal answer"}
      </button>
      {revealed && <p className="italic">Answer: {solution}</p>}
    </div>
  );
}

function asStringSolution(s: string | string[]): string {
  return Array.isArray(s) ? s.join(" ") : s;
}

function recordAttempt(reportId: string, payload: Record<string, unknown>) {
  // Fire-and-forget; we don't block the UI on success.
  fetch("/api/puzzle/attempt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ report_id: reportId, payload }),
  }).catch(() => {});
}
