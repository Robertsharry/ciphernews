-- ciphernews initial schema
-- Run against Supabase Postgres. Depends on auth.users (Supabase-managed).

-- Extensions (Supabase usually has these, include for local dev)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles: 1-to-1 with auth.users
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  city text,
  region text,
  country text,
  clean_mode boolean not null default false,
  subscription_status text not null default 'free' check (
    subscription_status in ('free', 'active', 'trialing', 'past_due', 'canceled', 'incomplete')
  ),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_subscription_status_idx
  on public.profiles (subscription_status);

-- Auto-create profile row on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- reports: world + local reports by cycle
-- ============================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('world', 'local')),
  region_key text,          -- null for world; 'US-TX-Austin' style for local
  cycle_at timestamptz not null,
  stories jsonb not null,   -- [{id, headline, body_spicy, body_clean, tone, polarity, sources[], neutrality_check}]
  puzzle jsonb not null,    -- {type, prompt, solution, hints[], ui_config}
  generation_meta jsonb,    -- {model, input_tokens, output_tokens, newsapi_query_count, elapsed_ms}
  created_at timestamptz not null default now(),
  unique (scope, region_key, cycle_at)
);

create index if not exists reports_scope_cycle_idx
  on public.reports (scope, cycle_at desc);
create index if not exists reports_region_cycle_idx
  on public.reports (scope, region_key, cycle_at desc);

-- ============================================================
-- forum: threads + posts
-- ============================================================
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete set null,
  title text not null,
  last_post_at timestamptz not null default now(),
  post_count integer not null default 0,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists forum_threads_last_post_idx
  on public.forum_threads (last_post_at desc);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete set null,
  parent_post_id uuid references public.forum_posts(id) on delete set null,
  body text not null check (char_length(body) between 1 and 8000),
  edited_at timestamptz,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists forum_posts_thread_idx
  on public.forum_posts (thread_id, created_at);

-- Maintain thread post_count + last_post_at
create or replace function public.forum_posts_update_thread()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.forum_threads
      set post_count = post_count + 1,
          last_post_at = greatest(last_post_at, new.created_at)
      where id = new.thread_id;
  elsif tg_op = 'DELETE' then
    update public.forum_threads
      set post_count = greatest(post_count - 1, 0)
      where id = old.thread_id;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists forum_posts_update_thread_trg on public.forum_posts;
create trigger forum_posts_update_thread_trg
  after insert or delete on public.forum_posts
  for each row execute procedure public.forum_posts_update_thread();

-- ============================================================
-- puzzle_attempts
-- ============================================================
create table if not exists public.puzzle_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  solved_at timestamptz,
  tries integer not null default 0,
  last_answer jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, report_id)
);

drop trigger if exists puzzle_attempts_set_updated_at on public.puzzle_attempts;
create trigger puzzle_attempts_set_updated_at
  before update on public.puzzle_attempts
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Row-level security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_posts enable row level security;
alter table public.puzzle_attempts enable row level security;

-- profiles: user reads/updates own row. Inserts come from the trigger only.
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Users cannot flip their own subscription status
    and subscription_status = (select subscription_status from public.profiles where id = auth.uid())
    and stripe_customer_id is not distinct from (select stripe_customer_id from public.profiles where id = auth.uid())
    and stripe_subscription_id is not distinct from (select stripe_subscription_id from public.profiles where id = auth.uid())
  );

-- reports: public read. Writes only via service role (bypasses RLS).
drop policy if exists "reports_public_read" on public.reports;
create policy "reports_public_read" on public.reports
  for select using (true);

-- forum_threads:
--   read: any authenticated user
--   insert/update: authors with subscription_status='active' or 'trialing'
drop policy if exists "forum_threads_auth_read" on public.forum_threads;
create policy "forum_threads_auth_read" on public.forum_threads
  for select using (auth.role() = 'authenticated');

drop policy if exists "forum_threads_sub_insert" on public.forum_threads;
create policy "forum_threads_sub_insert" on public.forum_threads
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.subscription_status in ('active', 'trialing')
    )
  );

drop policy if exists "forum_threads_author_update" on public.forum_threads;
create policy "forum_threads_author_update" on public.forum_threads
  for update using (author_id = auth.uid());

-- forum_posts: same pattern
drop policy if exists "forum_posts_auth_read" on public.forum_posts;
create policy "forum_posts_auth_read" on public.forum_posts
  for select using (auth.role() = 'authenticated' and hidden = false);

drop policy if exists "forum_posts_sub_insert" on public.forum_posts;
create policy "forum_posts_sub_insert" on public.forum_posts
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.subscription_status in ('active', 'trialing')
    )
    and exists (
      select 1 from public.forum_threads t where t.id = thread_id and t.locked = false
    )
  );

drop policy if exists "forum_posts_author_update" on public.forum_posts;
create policy "forum_posts_author_update" on public.forum_posts
  for update using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- puzzle_attempts: user reads/writes own
drop policy if exists "puzzle_attempts_self_select" on public.puzzle_attempts;
create policy "puzzle_attempts_self_select" on public.puzzle_attempts
  for select using (user_id = auth.uid());

drop policy if exists "puzzle_attempts_self_insert" on public.puzzle_attempts;
create policy "puzzle_attempts_self_insert" on public.puzzle_attempts
  for insert with check (user_id = auth.uid());

drop policy if exists "puzzle_attempts_self_update" on public.puzzle_attempts;
create policy "puzzle_attempts_self_update" on public.puzzle_attempts
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());
