create or replace function public.get_public_profile_stats(target_user uuid)
returns table(streak integer, daily_limit integer, references_count bigint, references_limit integer)
language sql security definer set search_path=public stable as $$
  select usage.streak,
    3 + case when usage.streak % 3 = 0 then 1 else 0 end
      + case when usage.daily_bonus_expires_at > now() then usage.daily_bonus_slots else 0 end
      + usage.shop_bonus_slots,
    (select count(*) from public.references where user_id = target_user),
    10 + usage.capacity_bonus
  from public.user_usage usage
  join public.profiles profile on profile.user_id = usage.user_id
  where usage.user_id = target_user and auth.uid() is not null;
$$;
revoke all on function public.get_public_profile_stats(uuid) from public;
grant execute on function public.get_public_profile_stats(uuid) to authenticated;
