# Subscription economics

## Pricing (v1)

- **Monthly**: $4.99
- **Annual**: $49 (save ~18%)
- **Free tier**: latest daily report visible, forum read-only. No local news. No mini-game. No archive.

## Per-subscriber variable cost (rough)

| Item | Est. monthly |
|---|---|
| Claude (4 world reports × 30 + on-demand local) | ~$0.40 |
| NewsAPI (dev tier free up to ~100 req/day; upgrade at scale) | ~$0.00 – $0.50 |
| Supabase (free tier covers early; Pro at ~$25 flat amortized) | ~$0.05 |
| Vercel (hobby → Pro at $20 flat amortized) | ~$0.05 |
| Stripe (2.9% + $0.30 per transaction, ~$0.44 on $4.99) | ~$0.44 |

**Ballpark gross margin**: ~$3.50/sub on monthly, ~$3.60/sub on annual (one Stripe hit vs 12).

## Levers if the unit economics get tight

1. Batch world report generation into a single Claude call (cheapest effective prompt caching)
2. Local news: proactively generate for top-N cities by subscriber count; others on-demand only
3. Haiku (not Opus) for puzzle generation and post moderation
4. Move NewsAPI → RSS ingestion if NewsAPI bills climb past ~$5/sub
5. Annual plan marketing push — locks 12 months of revenue with one payment-processing hit

## Price-change rules of thumb

- Don't raise price on existing subs for 12 months after signup
- Announce changes ≥30 days in advance with email + in-app banner
- Grandfather lifetime-capped deals to keep early supporters loyal
