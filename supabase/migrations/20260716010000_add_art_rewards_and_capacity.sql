alter table public.references
  add column art_style text not null default 'Манга',
  add column render_type text not null default 'Скетч';

alter table public.user_usage
  add column stars integer not null default 0 check (stars >= 0),
  add column capacity_bonus integer not null default 0 check (capacity_bonus >= 0);

drop function public.claim_generation_slot();
drop function public.visit_and_get_usage();

create table public.artwork_rewards (
  reference_id uuid primary key references public.references(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  detected_type text not null,
  similarity numeric not null,
  stars_awarded integer not null check (stars_awarded between 1 and 5),
  created_at timestamptz not null default now()
);
alter table public.artwork_rewards enable row level security;
create policy "read own artwork rewards" on public.artwork_rewards for select using (auth.uid() = user_id);

create or replace function public.visit_and_get_usage()
returns table(streak integer, used_today integer, daily_limit integer, references_count bigint, references_limit integer, stars integer)
language plpgsql security definer set search_path = public
as $$
declare usage_row public.user_usage;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.user_usage(user_id) values (auth.uid()) on conflict (user_id) do nothing;
  select * into usage_row from public.user_usage where user_id = auth.uid() for update;
  if usage_row.last_visit < current_date then
    usage_row.streak := case when usage_row.last_visit = current_date - 1 then usage_row.streak + 1 else 1 end;
    usage_row.last_visit := current_date;
  end if;
  if usage_row.generation_date < current_date then usage_row.generation_date := current_date; usage_row.generations_today := 0; end if;
  update public.user_usage set streak = usage_row.streak, last_visit = usage_row.last_visit,
    generation_date = usage_row.generation_date, generations_today = usage_row.generations_today where user_id = auth.uid();
  return query select usage_row.streak, usage_row.generations_today,
    case when usage_row.streak % 3 = 0 then 4 else 3 end,
    (select count(*) from public.references where user_id = auth.uid()),
    10 + usage_row.capacity_bonus, usage_row.stars;
end;
$$;

create function public.claim_generation_slot()
returns table(used_today integer, daily_limit integer)
language plpgsql security definer set search_path = public
as $$
declare current_usage record;
begin
  select * into current_usage from public.visit_and_get_usage();
  if current_usage.used_today >= current_usage.daily_limit then raise exception 'Дневной лимит референсов исчерпан'; end if;
  update public.user_usage set generations_today = generations_today + 1 where user_id = auth.uid();
  return query select current_usage.used_today + 1, current_usage.daily_limit;
end;
$$;

create or replace function public.enforce_reference_limit()
returns trigger language plpgsql security definer set search_path = public
as $$
declare allowed integer;
begin
  select 10 + coalesce(capacity_bonus, 0) into allowed from public.user_usage where user_id = new.user_id;
  if (select count(*) from public.references where user_id = new.user_id) >= coalesce(allowed, 10) then
    raise exception 'Лимит референсов исчерпан';
  end if;
  return new;
end;
$$;

create or replace function public.award_verified_art(ref_id uuid, detected text, similarity_score numeric)
returns integer language plpgsql security definer set search_path = public
as $$
declare selected_type text; reward integer;
begin
  if similarity_score < 0.55 then raise exception 'Рисунок недостаточно похож на идею референса'; end if;
  select render_type into selected_type from public.references where id = ref_id and user_id = auth.uid();
  if selected_type is null then raise exception 'Референс не найден'; end if;
  if exists(select 1 from public.artwork_rewards where reference_id = ref_id) then
    return (select stars_awarded from public.artwork_rewards where reference_id = ref_id);
  end if;
  reward := case when detected = 'sketch' then 1 when detected = 'color' then 2
    when detected = 'full' and selected_type = 'Полноценный арт' then 5
    when detected = 'full' then 3 else 1 end;
  insert into public.artwork_rewards(reference_id, user_id, detected_type, similarity, stars_awarded)
    values(ref_id, auth.uid(), detected, similarity_score, reward);
  update public.user_usage set stars = stars + reward where user_id = auth.uid();
  return reward;
end;
$$;

create or replace function public.buy_reference_capacity()
returns integer language plpgsql security definer set search_path = public
as $$
declare new_capacity integer;
begin
  update public.user_usage set stars = stars - 10, capacity_bonus = capacity_bonus + 1
    where user_id = auth.uid() and stars >= 10 returning 10 + capacity_bonus into new_capacity;
  if new_capacity is null then raise exception 'Нужно 10 звёзд'; end if;
  return new_capacity;
end;
$$;

revoke all on function public.award_verified_art(uuid, text, numeric) from public;
revoke all on function public.buy_reference_capacity() from public;
grant execute on function public.award_verified_art(uuid, text, numeric) to authenticated;
grant execute on function public.buy_reference_capacity() to authenticated;
grant execute on function public.visit_and_get_usage() to authenticated;
grant execute on function public.claim_generation_slot() to authenticated;
