create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 48),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  passage_id text not null,
  passage_version integer not null default 1 check (passage_version > 0),
  expected_chars integer not null check (expected_chars between 80 and 1200),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  finished_at timestamptz,
  status text not null default 'started' check (status in ('started', 'finished', 'expired')),
  client_hash text not null,
  nonce_hash text not null
);

create index idx_attempts_user_started
on public.attempts (user_id, started_at desc);

create index idx_attempts_status_expires
on public.attempts (status, expires_at);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.attempts(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  passage_id text not null,
  gross_wpm integer not null check (gross_wpm >= 0),
  accuracy integer not null check (accuracy between 0 and 100),
  score integer not null check (score >= 0),
  duration_ms integer not null check (duration_ms > 0),
  mistake_count integer not null check (mistake_count >= 0),
  trust_status text not null check (trust_status in ('accepted', 'review', 'rejected')),
  flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_results_trust_score
on public.results (trust_status, score desc, accuracy desc, gross_wpm desc);

create index idx_results_user_score
on public.results (user_id, score desc);

alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.results enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.attempts from anon, authenticated;
revoke all on table public.results from anon, authenticated;

create or replace function public.finalize_typing_attempt(
  p_attempt_id uuid,
  p_user_id uuid,
  p_result_id uuid,
  p_gross_wpm integer,
  p_accuracy integer,
  p_score integer,
  p_duration_ms integer,
  p_mistake_count integer,
  p_trust_status text,
  p_flags jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_attempt public.attempts%rowtype;
begin
  if p_trust_status not in ('accepted', 'review', 'rejected') then
    return false;
  end if;

  update public.attempts
  set status = 'finished', finished_at = now()
  where id = p_attempt_id
    and user_id = p_user_id
    and status = 'started'
    and expires_at >= now()
  returning * into claimed_attempt;

  if not found then
    return false;
  end if;

  insert into public.results (
    id,
    attempt_id,
    user_id,
    passage_id,
    gross_wpm,
    accuracy,
    score,
    duration_ms,
    mistake_count,
    trust_status,
    flags
  ) values (
    p_result_id,
    claimed_attempt.id,
    claimed_attempt.user_id,
    claimed_attempt.passage_id,
    p_gross_wpm,
    p_accuracy,
    p_score,
    p_duration_ms,
    p_mistake_count,
    p_trust_status,
    p_flags
  );

  return true;
exception
  when unique_violation then
    return false;
end;
$$;

revoke all on function public.finalize_typing_attempt(
  uuid, uuid, uuid, integer, integer, integer, integer, integer, text, jsonb
) from public, anon, authenticated;

grant execute on function public.finalize_typing_attempt(
  uuid, uuid, uuid, integer, integer, integer, integer, integer, text, jsonb
) to service_role;
