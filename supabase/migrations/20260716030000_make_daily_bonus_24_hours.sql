alter table public.user_usage add column daily_bonus_expires_at timestamptz;

create or replace function public.visit_and_get_usage()
returns table(streak integer, used_today integer, daily_limit integer, references_count bigint, references_limit integer, stars integer, reward_available boolean)
language plpgsql security definer set search_path = public
as $$
declare usage_row public.user_usage; bonus integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.user_usage(user_id) values (auth.uid()) on conflict (user_id) do nothing;
  select * into usage_row from public.user_usage where user_id=auth.uid() for update;
  if usage_row.last_visit<current_date then usage_row.streak:=case when usage_row.last_visit=current_date-1 then usage_row.streak+1 else 1 end; usage_row.last_visit:=current_date; end if;
  if usage_row.generation_date<current_date then usage_row.generation_date:=current_date; usage_row.generations_today:=0; end if;
  bonus:=case when usage_row.daily_bonus_expires_at>now() then usage_row.daily_bonus_slots else 0 end;
  update public.user_usage set streak=usage_row.streak,last_visit=usage_row.last_visit,generation_date=usage_row.generation_date,generations_today=usage_row.generations_today where user_id=auth.uid();
  return query select usage_row.streak,usage_row.generations_today,3+case when usage_row.streak%3=0 then 1 else 0 end+bonus,
    (select count(*) from public.references where user_id=auth.uid()),10+usage_row.capacity_bonus,usage_row.stars,usage_row.reward_claimed_on is distinct from current_date;
end; $$;

create or replace function public.claim_daily_reward()
returns text language plpgsql security definer set search_path=public as $$
declare reward_number integer; reward_text text;
begin
  perform public.visit_and_get_usage();
  if (select reward_claimed_on=current_date from public.user_usage where user_id=auth.uid()) then raise exception 'Подарок уже получен'; end if;
  reward_number:=(extract(doy from current_date)::integer+(select streak from public.user_usage where user_id=auth.uid()))%7;
  reward_text:=case reward_number when 0 then '1 ⭐' when 1 then '+1 референс на 24 часа' when 2 then '2 ⭐' when 3 then '+2 референса на 24 часа' when 4 then '+1 место навсегда' when 5 then '1 ⭐' else '+1 референс на 24 часа' end;
  update public.user_usage set reward_claimed_on=current_date,
    stars=stars+case when reward_number in(0,5) then 1 when reward_number=2 then 2 else 0 end,
    capacity_bonus=capacity_bonus+case when reward_number=4 then 1 else 0 end,
    daily_bonus_slots=case when reward_number=3 then 2 when reward_number in(1,6) then 1 else daily_bonus_slots end,
    daily_bonus_expires_at=case when reward_number in(1,3,6) then now()+interval '24 hours' else daily_bonus_expires_at end
  where user_id=auth.uid();
  return reward_text;
end; $$;
