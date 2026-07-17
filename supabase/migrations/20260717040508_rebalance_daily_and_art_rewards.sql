-- Remove today's permanent gallery bonus if it came from the old daily gift.
-- Purchased capacity is untouched: the old gift can be identified by its daily roll.
update public.user_usage
set capacity_bonus = greatest(capacity_bonus - 1, 0)
where reward_claimed_on = current_date
  and (extract(doy from reward_claimed_on)::integer + streak) % 7 = 4;

create or replace function public.claim_daily_reward()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  reward_number integer;
  reward_text text;
begin
  perform public.visit_and_get_usage();
  if (select reward_claimed_on = current_date from public.user_usage where user_id = auth.uid()) then
    raise exception 'Подарок уже получен';
  end if;

  reward_number := (extract(doy from current_date)::integer
    + (select streak from public.user_usage where user_id = auth.uid())) % 7;
  reward_text := case
    when reward_number in (0, 3, 5) then '1 ⭐'
    when reward_number in (2, 6) then '2 ⭐'
    else '+1 создание референса на 24 часа'
  end;

  update public.user_usage
  set reward_claimed_on = current_date,
      stars = stars + case when reward_number in (2, 6) then 2 when reward_number in (0, 3, 5) then 1 else 0 end,
      daily_bonus_slots = case when reward_number in (1, 4) then 1 else daily_bonus_slots end,
      daily_bonus_expires_at = case when reward_number in (1, 4) then now() + interval '24 hours' else daily_bonus_expires_at end
  where user_id = auth.uid();

  return reward_text;
end;
$$;

alter table public.artwork_rewards drop constraint artwork_rewards_stars_awarded_check;
alter table public.artwork_rewards add constraint artwork_rewards_stars_awarded_check
  check (stars_awarded between 1 and 60);

create or replace function public.award_verified_art(ref_id uuid, detected text, similarity_score numeric)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  character_count integer;
  has_background boolean;
  reward integer;
begin
  if similarity_score < 0.55 then
    raise exception 'Рисунок недостаточно похож на идею референса';
  end if;

  select people_count, details like '%Фон: С фоном%'
  into character_count, has_background
  from public.references
  where id = ref_id and user_id = auth.uid();

  if character_count is null then raise exception 'Референс не найден'; end if;
  if exists (select 1 from public.artwork_rewards where reference_id = ref_id) then
    return (select stars_awarded from public.artwork_rewards where reference_id = ref_id);
  end if;

  reward := case detected
    when 'sketch' then (array[3, 7, 13, 18])[character_count]
    when 'color' then (array[7, 15, 23, 32])[character_count]
    when 'full' then (array[12, 24, 36, 48])[character_count]
    else 1
  end;

  if has_background then
    reward := case detected
      when 'sketch' then (array[5, 10, 18, 25])[character_count]
      when 'color' then (array[10, 20, 30, 40])[character_count]
      when 'full' then (array[15, 30, 45, 60])[character_count]
      else reward
    end;
  end if;

  insert into public.artwork_rewards(reference_id, user_id, detected_type, similarity, stars_awarded)
  values (ref_id, auth.uid(), detected, similarity_score, reward);
  update public.user_usage set stars = stars + reward where user_id = auth.uid();
  return reward;
end;
$$;
