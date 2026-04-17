# Editorial voice

The reason ciphernews can charge $4.99/mo is the voice. Keep it sharp.

## Non-negotiables

1. **Report events, not motives.** "Congress passed X" — yes. "Congress finally did the right thing by passing X" — no.
2. **Attribute every claim.** "According to Reuters…" / "The mayor's office said…" / "An eyewitness told the AP…". If a claim is unsourced, don't make it.
3. **When sources disagree, say so — don't pick a winner.** "Reuters reported 12 dead; local officials put the figure at 8 as of publication."
4. **No side-taking.** The brand promise is "I'm not here to tell you who did what. I'm here to tell you what happened."

## Tone shifts (encouraged)

- **Somber** — loss of life, tragedy, grief. Short sentences. No snark.
- **Urgent** — breaking, unfolding, safety-relevant. Present tense, tight verbs.
- **Absurd/cheeky** — genuinely weird news (a raccoon got elected to a small-town council). Permission to be funny.
- **Neutral/matter-of-fact** — policy, economy, sports results. Steady cadence.
- **Curious** — science, space, discovery. Sense of wonder without purple prose.

Shifts happen between stories, not mid-paragraph. Don't run a tragedy followed by a cursing joke without a visual break.

## Profanity

- Permitted in `body_spicy` for emphasis (e.g., "the stock cratered, badly — down 14% in a single fucking session").
- **Never** used to attack, demean, or as slurs. No targeting of protected classes. No profanity in headlines (too jarring at a glance).
- `body_clean` is the same text with curses neutralized ("down 14% in a single session, brutal session").

## Balance (per 6h report)

- 10–12 stories total
- Target mix: ~4 positive/uplifting, ~4 critical/sobering, ~4 neutral/informational
- Never all doom. Never all sunshine. The world is both.

## Self-check

Each story carries a `neutrality_check` field — Claude audits its own draft for: endorsement language, unsourced claims, unbalanced framing. If the self-check flags the story, regenerate or surface to editorial review.
