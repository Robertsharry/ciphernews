# ciphernews

Paid news app. Ten-to-twelve stories every six hours, world + local. Non-partisan voice. Profanity-allowed by default, Clean mode toggle. Mini-game at end of each report. Subscriber forum.

## Commands

```bash
npm run dev         # start dev server on :3000 (Turbopack)
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

## Stack

- **Next.js 16** App Router + Cache Components (`use cache`, `cacheTag`, `cacheLife`, `updateTag`)
- **React 19**, **TypeScript 5.7**, **Tailwind CSS v4** (CSS-first `@theme`), **shadcn/ui**
- **Supabase** — Postgres (migrations in `db/migrations/`), Auth (`@supabase/ssr`), RLS is the primary authz layer, Realtime for forum live updates
- **Stripe** — subscription billing, customer portal, webhook → `profiles.subscription_status`
- **Anthropic Claude** — `claude-opus-4-7` for reports, `claude-haiku-4-5` for puzzle gen + moderation. Prompt caching on system/style-guide blocks (use `cache_control: { type: "ephemeral" }`)
- **NewsAPI.org** — story discovery
- **Vercel** — hosting, Cron, Functions (fluid compute), Marketplace integrations for Supabase + Stripe

## Architecture

- `app/(marketing)` — public landing, pricing, manifesto
- `app/(auth)` — sign-in/up/callback
- `app/(app)` — auth-required shell (dashboard, reports, archive, settings, billing)
- `app/forum` — thread list + detail (subscriber-only writes)
- `app/api/cron/*` — scheduled world report gen
- `app/api/local/[region]` — on-demand local report gen with 6h cache
- `app/api/stripe/*` — checkout, webhook, portal
- `proxy.ts` — Next 16 renamed middleware; Supabase session refresh only

### Content pipeline
1. Cron hits `/api/cron/generate-world` at UTC 00/06/12/18
2. Pull NewsAPI top headlines, cluster/dedupe
3. Claude rewrites: one JSON per story with both `body_spicy` (default voice, profanity OK) and `body_clean` (sanitized, same facts). Adds `tone`, `polarity`, `sources[]`, `neutrality_check`
4. Claude (Haiku) emits puzzle JSON: one of `newsword`, `word-ladder`, `trivia`, `riddle`, rendered by unified `<PuzzleRunner>`
5. Write to `reports` table; `updateTag('world' | \`local-${region}\`)`

Local reports generate on-demand per city key (e.g. `US-TX-Austin`), cached 6h.

### Non-negotiable editorial rules (enforced in system prompt)
- Report events, not motives
- Attribute claims to the source; no editorial endorsement
- If sources disagree, say so without adjudicating
- Mix of 10–12 stories: ~4 positive / ~4 critical / ~4 neutral
- Profanity permitted for emphasis in `body_spicy`; never slurs, threats, or targeted attacks

### Paywall model
- **Free**: latest daily report visible, forum read-only
- **Paid ($4.99/mo or $49/yr)**: all reports, local news, mini-games, forum posting
- Enforcement: `profiles.subscription_status` + RLS on writes + server-side gates on paywalled routes

## File conventions

- Paths: `@/lib/...`, `@/components/...`, `@/app/...`
- Server-only modules: add `import "server-only"` at top; never import server modules into client components
- Claude outputs: **always** validate with Zod before DB write (`lib/anthropic/schemas.ts`)
- Cache Components: never read `cookies()`/`headers()` inside a `use cache` function; session-aware UI lives outside caching

## Environment

Secrets live in `.env.local` (git-ignored) locally and in Vercel env for prod. `.env.example` documents every required var. Never commit real keys. Supabase + Stripe env vars auto-inject via Vercel Marketplace.

## Memory

Session memories under `/Users/robertharry/.claude/projects/-Users-robertharry-development-apps-bizapps-ciphernews/memory/` — product-level decisions, user feedback, editorial rules.
