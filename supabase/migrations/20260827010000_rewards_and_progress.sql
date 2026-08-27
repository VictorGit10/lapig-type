alter table public.results
  add column if not exists passage_version integer not null default 1 check (passage_version > 0),
  add column if not exists correct_chars integer not null default 0 check (correct_chars >= 0),
  add column if not exists completed boolean not null default false;

create table public.passage_progress (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  passage_id text not null,
  passage_version integer not null check (passage_version > 0),
  attempts integer not null default 1 check (attempts > 0),
  best_score integer not null default 0 check (best_score >= 0),
  best_wpm integer not null default 0 check (best_wpm >= 0),
  best_accuracy integer not null default 0 check (best_accuracy between 0 and 100),
  best_correct_chars integer not null default 0 check (best_correct_chars >= 0),
  completed boolean not null default false,
  first_attempted_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, passage_id, passage_version)
);

create table public.user_achievements (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  achievement_key text not null check (achievement_key in (
    'first_verified', 'speed_50', 'speed_75', 'speed_100', 'precision_100',
    'top_3', 'top_1', 'all_passages_attempted', 'all_passages_completed'
  )),
  unlocked_at timestamptz not null default now(),
  source_result_id uuid references public.results(id) on delete set null,
  primary key (user_id, achievement_key)
);

create table public.profile_cosmetics (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  avatar_key text not null default 'topographic' check (avatar_key in ('topographic', 'cerrado', 'atlas')),
  frame_key text not null default 'none' check (frame_key in ('none', 'baseline', 'vector', 'high-resolution', 'control-point', 'reference', 'zero-mark')),
  effect_key text not null default 'none' check (effect_key in ('none', 'contours', 'scan', 'solar-pulse')),
  updated_at timestamptz not null default now()
);

create index idx_passage_progress_user on public.passage_progress (user_id, updated_at desc);
create index idx_user_achievements_user on public.user_achievements (user_id, unlocked_at desc);

alter table public.passage_progress enable row level security;
alter table public.user_achievements enable row level security;
alter table public.profile_cosmetics enable row level security;

revoke all on table public.passage_progress from anon, authenticated;
revoke all on table public.user_achievements from anon, authenticated;
revoke all on table public.profile_cosmetics from anon, authenticated;
grant select, insert, update on table public.passage_progress to service_role;
grant select, insert, update, delete on table public.user_achievements to service_role;
grant select, insert, update on table public.profile_cosmetics to service_role;

drop function if exists public.finalize_typing_attempt(
  uuid, uuid, uuid, integer, integer, integer, integer, integer, text, jsonb
);

create or replace function public.finalize_typing_attempt(
  p_attempt_id uuid,
  p_user_id uuid,
  p_result_id uuid,
  p_gross_wpm integer,
  p_accuracy integer,
  p_score integer,
  p_duration_ms integer,
  p_mistake_count integer,
  p_correct_chars integer,
  p_total_passages integer,
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
  attempted_count integer := 0;
  completed_count integer := 0;
  current_placement integer;
begin
  if p_trust_status not in ('accepted', 'review', 'rejected') then
    return false;
  end if;
  if p_correct_chars < 0 or p_total_passages < 1 or p_total_passages > 100 then
    return false;
  end if;

  update public.attempts
  set status = 'finished', finished_at = now()
  where id = p_attempt_id
    and user_id = p_user_id
    and status = 'started'
    and expires_at >= now()
    and p_correct_chars <= expected_chars
  returning * into claimed_attempt;

  if not found then
    return false;
  end if;

  insert into public.results (
    id, attempt_id, user_id, passage_id, passage_version, gross_wpm, accuracy,
    score, duration_ms, mistake_count, correct_chars, completed, trust_status, flags
  ) values (
    p_result_id, claimed_attempt.id, claimed_attempt.user_id, claimed_attempt.passage_id,
    claimed_attempt.passage_version, p_gross_wpm, p_accuracy, p_score, p_duration_ms,
    p_mistake_count, p_correct_chars, p_correct_chars = claimed_attempt.expected_chars,
    p_trust_status, p_flags
  );

  if p_trust_status = 'accepted' then
    insert into public.passage_progress (
      user_id, passage_id, passage_version, attempts, best_score, best_wpm,
      best_accuracy, best_correct_chars, completed, completed_at
    ) values (
      p_user_id, claimed_attempt.passage_id, claimed_attempt.passage_version, 1,
      p_score, p_gross_wpm, p_accuracy, p_correct_chars,
      p_correct_chars = claimed_attempt.expected_chars,
      case when p_correct_chars = claimed_attempt.expected_chars then now() else null end
    )
    on conflict (user_id, passage_id, passage_version) do update set
      attempts = public.passage_progress.attempts + 1,
      best_score = greatest(public.passage_progress.best_score, excluded.best_score),
      best_wpm = greatest(public.passage_progress.best_wpm, excluded.best_wpm),
      best_accuracy = greatest(public.passage_progress.best_accuracy, excluded.best_accuracy),
      best_correct_chars = greatest(public.passage_progress.best_correct_chars, excluded.best_correct_chars),
      completed = public.passage_progress.completed or excluded.completed,
      completed_at = coalesce(public.passage_progress.completed_at, excluded.completed_at),
      updated_at = now();

    insert into public.user_achievements (user_id, achievement_key, source_result_id)
    select p_user_id, award.achievement_key, p_result_id
    from (values
      ('first_verified', true),
      ('speed_50', p_gross_wpm >= 50),
      ('speed_75', p_gross_wpm >= 75),
      ('speed_100', p_gross_wpm >= 100),
      ('precision_100', p_accuracy = 100 and p_gross_wpm >= 20)
    ) as award(achievement_key, eligible)
    where award.eligible
    on conflict (user_id, achievement_key) do nothing;

    select
      count(*) filter (where passage_version = claimed_attempt.passage_version),
      count(*) filter (where passage_version = claimed_attempt.passage_version and completed)
    into attempted_count, completed_count
    from public.passage_progress
    where user_id = p_user_id;

    if attempted_count >= p_total_passages then
      insert into public.user_achievements (user_id, achievement_key, source_result_id)
      values (p_user_id, 'all_passages_attempted', p_result_id)
      on conflict (user_id, achievement_key) do nothing;
    end if;
    if completed_count >= p_total_passages then
      insert into public.user_achievements (user_id, achievement_key, source_result_id)
      values (p_user_id, 'all_passages_completed', p_result_id)
      on conflict (user_id, achievement_key) do nothing;
    end if;

    with user_best as (
      select distinct on (user_id) user_id, score, accuracy, gross_wpm, created_at
      from public.results
      where trust_status = 'accepted'
      order by user_id, score desc, accuracy desc, gross_wpm desc, created_at asc
    ), ranked as (
      select user_id, row_number() over (order by score desc, accuracy desc, gross_wpm desc, created_at asc) as placement
      from user_best
    )
    select placement::integer into current_placement from ranked where user_id = p_user_id;

    if current_placement <= 3 then
      insert into public.user_achievements (user_id, achievement_key, source_result_id)
      values (p_user_id, 'top_3', p_result_id)
      on conflict (user_id, achievement_key) do nothing;
    end if;
    if current_placement = 1 then
      insert into public.user_achievements (user_id, achievement_key, source_result_id)
      values (p_user_id, 'top_1', p_result_id)
      on conflict (user_id, achievement_key) do nothing;
    end if;
  end if;

  return true;
exception
  when unique_violation then
    return false;
end;
$$;

revoke all on function public.finalize_typing_attempt(
  uuid, uuid, uuid, integer, integer, integer, integer, integer, integer, integer, text, jsonb
) from public, anon, authenticated;
grant execute on function public.finalize_typing_attempt(
  uuid, uuid, uuid, integer, integer, integer, integer, integer, integer, integer, text, jsonb
) to service_role;

insert into public.passage_progress (
  user_id, passage_id, passage_version, attempts, best_score, best_wpm,
  best_accuracy, best_correct_chars, completed, first_attempted_at, updated_at
)
select user_id, passage_id, passage_version, count(*)::integer, max(score),
  max(gross_wpm), max(accuracy), max(correct_chars), bool_or(completed), min(created_at), max(created_at)
from public.results
where trust_status = 'accepted'
group by user_id, passage_id, passage_version
on conflict (user_id, passage_id, passage_version) do nothing;

insert into public.user_achievements (user_id, achievement_key, source_result_id, unlocked_at)
select distinct on (user_id) user_id, 'first_verified', id, created_at
from public.results where trust_status = 'accepted'
order by user_id, created_at asc
on conflict do nothing;

insert into public.user_achievements (user_id, achievement_key, source_result_id, unlocked_at)
select distinct on (r.user_id, award.achievement_key) r.user_id, award.achievement_key, r.id, r.created_at
from public.results r
cross join lateral (values
  ('speed_50', r.gross_wpm >= 50),
  ('speed_75', r.gross_wpm >= 75),
  ('speed_100', r.gross_wpm >= 100),
  ('precision_100', r.accuracy = 100 and r.gross_wpm >= 20)
) as award(achievement_key, eligible)
where r.trust_status = 'accepted' and award.eligible
order by r.user_id, award.achievement_key, r.created_at asc
on conflict do nothing;

with user_best as (
  select distinct on (user_id) id, user_id, score, accuracy, gross_wpm, created_at
  from public.results where trust_status = 'accepted'
  order by user_id, score desc, accuracy desc, gross_wpm desc, created_at asc
), ranked as (
  select *, row_number() over (order by score desc, accuracy desc, gross_wpm desc, created_at asc) as placement
  from user_best
)
insert into public.user_achievements (user_id, achievement_key, source_result_id, unlocked_at)
select user_id, 'top_3', id, created_at
from ranked where placement <= 3
on conflict do nothing;

with user_best as (
  select distinct on (user_id) id, user_id, score, accuracy, gross_wpm, created_at
  from public.results where trust_status = 'accepted'
  order by user_id, score desc, accuracy desc, gross_wpm desc, created_at asc
), ranked as (
  select *, row_number() over (order by score desc, accuracy desc, gross_wpm desc, created_at asc) as placement
  from user_best
)
insert into public.user_achievements (user_id, achievement_key, source_result_id, unlocked_at)
select user_id, 'top_1', id, created_at
from ranked where placement = 1
on conflict do nothing;

insert into public.user_achievements (user_id, achievement_key, unlocked_at)
select user_id, 'all_passages_attempted', max(updated_at)
from public.passage_progress
group by user_id
having count(distinct passage_id) >= 3
on conflict do nothing;

insert into public.user_achievements (user_id, achievement_key, unlocked_at)
select user_id, 'all_passages_completed', max(completed_at)
from public.passage_progress
group by user_id
having count(distinct passage_id) filter (where completed) >= 3
on conflict do nothing;

create or replace view public.passage_difficulty_stats
with (security_invoker = true)
as
select passage_id, passage_version, count(*) as accepted_attempts,
  percentile_cont(0.5) within group (order by gross_wpm) as median_wpm,
  percentile_cont(0.5) within group (order by accuracy) as median_accuracy,
  avg(correct_chars)::numeric(10,2) as average_correct_chars,
  avg(completed::integer)::numeric(6,4) as completion_rate
from public.results
where trust_status = 'accepted'
group by passage_id, passage_version;

revoke all on table public.passage_difficulty_stats from public, anon, authenticated;
grant select on table public.passage_difficulty_stats to service_role;
