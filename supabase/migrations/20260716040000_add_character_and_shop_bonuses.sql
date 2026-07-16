alter table public.user_usage
  add column shop_bonus_slots integer not null default 0 check (shop_bonus_slots >= 0),
  add column shop_bonus_expires_at timestamptz;

alter table public.artwork_rewards drop constraint artwork_rewards_stars_awarded_check;
alter table public.artwork_rewards add constraint artwork_rewards_stars_awarded_check check (stars_awarded between 1 and 8);

create or replace function public.visit_and_get_usage()
returns table(streak integer, used_today integer, daily_limit integer, references_count bigint, references_limit integer, stars integer, reward_available boolean)
language plpgsql security definer set search_path=public as $$
declare usage_row public.user_usage; bonus integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.user_usage(user_id) values(auth.uid()) on conflict(user_id) do nothing;
  select * into usage_row from public.user_usage where user_id=auth.uid() for update;
  if usage_row.last_visit<current_date then usage_row.streak:=case when usage_row.last_visit=current_date-1 then usage_row.streak+1 else 1 end; usage_row.last_visit:=current_date; end if;
  if usage_row.generation_date<current_date then usage_row.generation_date:=current_date; usage_row.generations_today:=0; end if;
  bonus:=case when usage_row.daily_bonus_expires_at>now() then usage_row.daily_bonus_slots else 0 end + case when usage_row.shop_bonus_expires_at>now() then usage_row.shop_bonus_slots else 0 end;
  update public.user_usage set streak=usage_row.streak,last_visit=usage_row.last_visit,generation_date=usage_row.generation_date,generations_today=usage_row.generations_today where user_id=auth.uid();
  return query select usage_row.streak,usage_row.generations_today,3+case when usage_row.streak%3=0 then 1 else 0 end+bonus,
    (select count(*) from public.references where user_id=auth.uid()),10+usage_row.capacity_bonus,usage_row.stars,usage_row.reward_claimed_on is distinct from current_date;
end; $$;

create or replace function public.buy_creation_slot()
returns integer language plpgsql security definer set search_path=public as $$
declare slots integer;
begin
  update public.user_usage set stars=stars-5,
    shop_bonus_slots=case when shop_bonus_expires_at>now() then shop_bonus_slots+1 else 1 end,
    shop_bonus_expires_at=now()+interval '24 hours'
  where user_id=auth.uid() and stars>=5 returning shop_bonus_slots into slots;
  if slots is null then raise exception 'Нужно 5 звёзд'; end if;
  return slots;
end; $$;

create or replace function public.award_verified_art(ref_id uuid, detected text, similarity_score numeric)
returns integer language plpgsql security definer set search_path=public as $$
declare selected_type text; character_count integer; reward integer;
begin
  if similarity_score<0.55 then raise exception 'Рисунок недостаточно похож на идею референса'; end if;
  select render_type,people_count into selected_type,character_count from public.references where id=ref_id and user_id=auth.uid();
  if selected_type is null then raise exception 'Референс не найден'; end if;
  if exists(select 1 from public.artwork_rewards where reference_id=ref_id) then return(select stars_awarded from public.artwork_rewards where reference_id=ref_id); end if;
  reward:=case when detected='sketch' then 1 when detected='color' then 2 when detected='full' and selected_type='Полноценный арт' then 5 when detected='full' then 3 else 1 end;
  reward:=reward+greatest(character_count-1,0);
  insert into public.artwork_rewards(reference_id,user_id,detected_type,similarity,stars_awarded) values(ref_id,auth.uid(),detected,similarity_score,reward);
  update public.user_usage set stars=stars+reward where user_id=auth.uid();
  return reward;
end; $$;

revoke all on function public.buy_creation_slot() from public;
grant execute on function public.buy_creation_slot() to authenticated;
