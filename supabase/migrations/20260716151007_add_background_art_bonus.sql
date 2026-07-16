alter table public.artwork_rewards drop constraint artwork_rewards_stars_awarded_check;
alter table public.artwork_rewards add constraint artwork_rewards_stars_awarded_check
  check (stars_awarded between 1 and 10);

create or replace function public.award_verified_art(ref_id uuid, detected text, similarity_score numeric)
returns integer language plpgsql security definer set search_path=public as $$
declare selected_type text; character_count integer; has_background boolean; reward integer;
begin
  if similarity_score<0.55 then raise exception 'Рисунок недостаточно похож на идею референса'; end if;
  select render_type,people_count,details like '%Фон: С фоном%'
    into selected_type,character_count,has_background
    from public.references where id=ref_id and user_id=auth.uid();
  if selected_type is null then raise exception 'Референс не найден'; end if;
  if exists(select 1 from public.artwork_rewards where reference_id=ref_id) then
    return(select stars_awarded from public.artwork_rewards where reference_id=ref_id);
  end if;
  reward:=case when detected='sketch' then 1 when detected='color' then 2
    when detected='full' and selected_type='Полноценный арт' then 5
    when detected='full' then 3 else 1 end;
  reward:=reward+greatest(character_count-1,0)+case when has_background then 2 else 0 end;
  insert into public.artwork_rewards(reference_id,user_id,detected_type,similarity,stars_awarded)
    values(ref_id,auth.uid(),detected,similarity_score,reward);
  update public.user_usage set stars=stars+reward where user_id=auth.uid();
  return reward;
end; $$;
