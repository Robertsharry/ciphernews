# Decisions log

Chronological log of non-obvious product/architecture decisions. Add a dated entry when you pick between real alternatives. Keep entries short.

## 2026-04-17 — Initial architecture locked

- **Stack**: Next.js 16 App Router + Cache Components, Supabase (auth + Postgres + RLS + realtime), Stripe billing, Claude Opus for reports + Haiku for puzzles, NewsAPI for discovery, Vercel hosting.
- **Rejected**: Clerk (one less vendor preferred); NextAuth (more wiring); Supabase beat them for auth-+-db in one hop, plus realtime for forum.
- **Pricing**: $4.99/mo or $49/yr, paid-only with a 1-report-per-day teaser. No free-forever tier.
- **Cadence**: world news 4x daily at UTC 00/06/12/18 via Vercel Cron; local news on-demand per city with 6h cache.
- **Puzzles**: AI-generated per report (4 shapes: newsword / word ladder / trivia / riddle).
- **Location**: user-entered city+region at onboarding, Vercel geo headers seed the default.
- **Profanity**: default on in `body_spicy`, account-level Clean mode swaps in `body_clean`. Single generation produces both to keep caching cheap.
