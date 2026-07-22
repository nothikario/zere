alter table public.user_usage
  add column max_streak integer not null default 1 check (max_streak > 0);

update public.user_usage set max_streak = greatest(max_streak, streak);

drop function if exists public.visit_and_get_usage();
create function public.visit_and_get_usage()
returns table(streak integer, max_streak integer, used_today integer, daily_limit integer, references_count bigint, references_limit integer, stars integer, reward_available boolean)
language plpgsql security definer set search_path = public as $$
declare
  usage_row public.user_usage;
  gift_bonus integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.user_usage(user_id) values(auth.uid()) on conflict(user_id) do nothing;
  select * into usage_row from public.user_usage where user_id=auth.uid() for update;

  if usage_row.last_visit < current_date then
    usage_row.streak := case when usage_row.last_visit = current_date - 1 then usage_row.streak + 1 else 1 end;
    usage_row.max_streak := greatest(usage_row.max_streak, usage_row.streak);
    usage_row.last_visit := current_date;
  end if;
  if usage_row.generation_date < current_date then
    usage_row.generation_date := current_date;
    usage_row.generations_today := 0;
  end if;

  gift_bonus := case when usage_row.daily_bonus_expires_at > now() then usage_row.daily_bonus_slots else 0 end;
  update public.user_usage set
    streak=usage_row.streak, max_streak=usage_row.max_streak, last_visit=usage_row.last_visit,
    generation_date=usage_row.generation_date, generations_today=usage_row.generations_today
  where user_id=auth.uid();

  return query select usage_row.streak, usage_row.max_streak, usage_row.generations_today,
    3 + case when usage_row.streak % 3 = 0 then 1 else 0 end + gift_bonus + usage_row.shop_bonus_slots,
    (select count(*) from public.references where user_id=auth.uid()),
    10 + usage_row.capacity_bonus, usage_row.stars,
    usage_row.reward_claimed_on is distinct from current_date;
end; $$;

drop function if exists public.get_public_profile_stats(uuid);
create function public.get_public_profile_stats(target_user uuid)
returns table(streak integer, max_streak integer, daily_limit integer, references_count bigint, references_limit integer)
language sql security definer set search_path=public stable as $$
  select
    case when usage.last_visit >= current_date - 1 then usage.streak else 0 end,
    usage.max_streak,
    3 + case when usage.last_visit >= current_date - 1 and usage.streak % 3 = 0 then 1 else 0 end
      + case when usage.daily_bonus_expires_at > now() then usage.daily_bonus_slots else 0 end
      + usage.shop_bonus_slots,
    (select count(*) from public.references where user_id = target_user),
    10 + usage.capacity_bonus
  from public.user_usage usage
  join public.profiles profile on profile.user_id = usage.user_id
  where usage.user_id = target_user and auth.uid() is not null;
$$;

revoke all on function public.visit_and_get_usage() from public;
revoke all on function public.get_public_profile_stats(uuid) from public;
grant execute on function public.visit_and_get_usage() to authenticated;
grant execute on function public.get_public_profile_stats(uuid) to authenticated;
