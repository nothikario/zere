create or replace function public.visit_and_get_usage()
returns table(streak integer, used_today integer, daily_limit integer, references_count bigint, references_limit integer, stars integer, reward_available boolean)
language plpgsql security definer set search_path=public as $$
declare usage_row public.user_usage; gift_bonus integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.user_usage(user_id) values(auth.uid()) on conflict(user_id) do nothing;
  select * into usage_row from public.user_usage where user_id=auth.uid() for update;
  if usage_row.last_visit<current_date then usage_row.streak:=case when usage_row.last_visit=current_date-1 then usage_row.streak+1 else 1 end; usage_row.last_visit:=current_date; end if;
  if usage_row.generation_date<current_date then usage_row.generation_date:=current_date; usage_row.generations_today:=0; end if;
  gift_bonus:=case when usage_row.daily_bonus_expires_at>now() then usage_row.daily_bonus_slots else 0 end;
  update public.user_usage set streak=usage_row.streak,last_visit=usage_row.last_visit,generation_date=usage_row.generation_date,generations_today=usage_row.generations_today where user_id=auth.uid();
  return query select usage_row.streak,usage_row.generations_today,3+case when usage_row.streak%3=0 then 1 else 0 end+gift_bonus+usage_row.shop_bonus_slots,
    (select count(*) from public.references where user_id=auth.uid()),10+usage_row.capacity_bonus,usage_row.stars,usage_row.reward_claimed_on is distinct from current_date;
end; $$;

create or replace function public.buy_creation_slot()
returns integer language plpgsql security definer set search_path=public as $$
declare slots integer;
begin
  update public.user_usage set stars=stars-10,shop_bonus_slots=shop_bonus_slots+1 where user_id=auth.uid() and stars>=10 returning shop_bonus_slots into slots;
  if slots is null then raise exception 'Нужно 10 звёзд'; end if;
  return slots;
end; $$;

create or replace function public.buy_reference_capacity()
returns integer language plpgsql security definer set search_path=public as $$
declare new_capacity integer;
begin
  update public.user_usage set stars=stars-20,capacity_bonus=capacity_bonus+1 where user_id=auth.uid() and stars>=20 returning 10+capacity_bonus into new_capacity;
  if new_capacity is null then raise exception 'Нужно 20 звёзд'; end if;
  return new_capacity;
end; $$;
