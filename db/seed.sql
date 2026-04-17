-- Dev seed: one demo world report so the dashboard has something to render before cron runs.
-- Run only in local/dev environments.

insert into public.reports (scope, region_key, cycle_at, stories, puzzle, generation_meta)
values (
  'world',
  null,
  date_trunc('hour', now()),
  '[
    {
      "id": "s1",
      "headline": "Global undersea cable consortium greenlights new Pacific link",
      "body_spicy": "Eight telecom operators signed off today on a $2.1B cable that will run Oregon to Tokyo. It is, in the most literal sense, a new piece of the internet getting glued to the ocean floor. Expected in service 2028.",
      "body_clean": "Eight telecom operators signed off today on a $2.1B cable that will run Oregon to Tokyo. It is, in the most literal sense, a new piece of the internet getting glued to the ocean floor. Expected in service 2028.",
      "tone": "curious",
      "polarity": "neutral",
      "sources": [{"name": "Reuters", "url": "https://example.com/1"}],
      "neutrality_check": "ok"
    },
    {
      "id": "s2",
      "headline": "Demo placeholder — replace with cron output",
      "body_spicy": "This is a seeded story so the UI has shape before the real generator runs.",
      "body_clean": "This is a seeded story so the UI has shape before the real generator runs.",
      "tone": "neutral",
      "polarity": "neutral",
      "sources": [],
      "neutrality_check": "ok"
    }
  ]'::jsonb,
  '{
    "type": "riddle",
    "prompt": "I connect continents but I am not a bridge. I carry conversations but I cannot hear. I am always underwater but never drown. What am I?",
    "solution": "undersea cable",
    "hints": ["Think about story 1.", "It is buried beneath the ocean."],
    "ui_config": {}
  }'::jsonb,
  '{"source": "seed"}'::jsonb
)
on conflict do nothing;
