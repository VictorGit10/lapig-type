drop trigger if exists award_rebalanced_speed_achievements on public.results;
drop function if exists public.award_rebalanced_speed_achievements();

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
      ('speed_50', p_gross_wpm >= 40),
      ('speed_75', p_gross_wpm >= 60),
      ('speed_100', p_gross_wpm >= 90),
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

insert into public.user_achievements (user_id, achievement_key, source_result_id, unlocked_at)
select distinct on (r.user_id, award.achievement_key) r.user_id, award.achievement_key, r.id, r.created_at
from public.results r
cross join lateral (values
  ('speed_50', r.gross_wpm >= 40),
  ('speed_75', r.gross_wpm >= 60),
  ('speed_100', r.gross_wpm >= 90)
) as award(achievement_key, eligible)
where r.trust_status = 'accepted' and award.eligible
order by r.user_id, award.achievement_key, r.created_at asc
on conflict do nothing;
