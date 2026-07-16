import { supabase } from './supabase';

export type Usage = {
  streak: number;
  used_today: number;
  daily_limit: number;
  references_count: number;
  references_limit: number;
  stars: number;
  reward_available: boolean;
};

export async function visitAndGetUsage() {
  const { data, error } = await supabase.rpc('visit_and_get_usage');
  if (error) throw error;
  return data[0] as Usage;
}

export async function buyReferenceCapacity() {
  const { data, error } = await supabase.rpc('buy_reference_capacity');
  if (error) throw error;
  return data as number;
}

export async function claimDailyReward() {
  const { data, error } = await supabase.rpc('claim_daily_reward');
  if (error) throw error;
  return data as string;
}

export async function buyCreationSlot() {
  const { data, error } = await supabase.rpc('buy_creation_slot');
  if (error) throw error;
  return data as number;
}

const GUEST_REFERENCE_KEY = 'refri-guest-reference-used';

export function hasGuestReference() {
  return localStorage.getItem(GUEST_REFERENCE_KEY) === 'true';
}

export function markGuestReferenceCreated() {
  localStorage.setItem(GUEST_REFERENCE_KEY, 'true');
}
