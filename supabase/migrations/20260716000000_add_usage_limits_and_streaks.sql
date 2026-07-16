create table public.user_usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  streak integer not null default 1 check (streak > 0),
  last_visit date not null default current_date,
  generation_date date not null default current_date,
  generations_today integer not null default 0 check (generations_today >= 0)
);

alter table public.user_usage enable row level security;
create policy "read own usage" on public.user_usage for select using (auth.uid() = user_id);

create or replace function public.visit_and_get_usage()
returns table(streak integer, used_today integer, daily_limit integer, references_count bigint, references_limit integer)
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
  if usage_row.generation_date < current_date then
    usage_row.generation_date := current_date;
    usage_row.generations_today := 0;
  end if;
  update public.user_usage set streak = usage_row.streak, last_visit = usage_row.last_visit,
    generation_date = usage_row.generation_date, generations_today = usage_row.generations_today
  where user_id = auth.uid();
  return query select usage_row.streak, usage_row.generations_today,
    case when usage_row.streak % 3 = 0 then 4 else 3 end,
    (select count(*) from public.references where user_id = auth.uid()), 10;
end;
$$;

create or replace function public.claim_generation_slot()
returns table(used_today integer, daily_limit integer)
language plpgsql security definer set search_path = public
as $$
declare current_usage record;
begin
  select * into current_usage from public.visit_and_get_usage();
  if current_usage.used_today >= current_usage.daily_limit then
    raise exception 'Дневной лимит генераций исчерпан';
  end if;
  update public.user_usage set generations_today = generations_today + 1 where user_id = auth.uid();
  return query select current_usage.used_today + 1, current_usage.daily_limit;
end;
$$;

create or replace function public.enforce_reference_limit()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if (select count(*) from public.references where user_id = new.user_id) >= 10 then
    raise exception 'Можно хранить не больше 10 референсов';
  end if;
  return new;
end;
$$;

create trigger enforce_reference_limit before insert on public.references
for each row execute function public.enforce_reference_limit();

revoke all on function public.visit_and_get_usage() from public;
revoke all on function public.claim_generation_slot() from public;
grant execute on function public.visit_and_get_usage() to authenticated;
grant execute on function public.claim_generation_slot() to authenticated;
