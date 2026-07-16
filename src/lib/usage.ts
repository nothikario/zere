import { supabase } from './supabase';
import type { ArtReference } from './references';

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
const GUEST_REFERENCE_DATA_KEY = 'refri-guest-reference';
const GUEST_REFERENCE_DATE_KEY = 'refri-guest-reference-date';

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function clearExpiredGuestReference() {
  if (localStorage.getItem(GUEST_REFERENCE_DATE_KEY) === todayKey()) return;
  localStorage.removeItem(GUEST_REFERENCE_KEY);
  localStorage.removeItem(GUEST_REFERENCE_DATA_KEY);
  localStorage.removeItem(GUEST_REFERENCE_DATE_KEY);
}

export function hasGuestReference() {
  clearExpiredGuestReference();
  return localStorage.getItem(GUEST_REFERENCE_KEY) === 'true';
}

export function markGuestReferenceCreated() {
  localStorage.setItem(GUEST_REFERENCE_KEY, 'true');
  localStorage.setItem(GUEST_REFERENCE_DATE_KEY, todayKey());
}

export function saveGuestReference(reference: ArtReference) {
  markGuestReferenceCreated();
  const stored = reference.image_path?.startsWith('data:') ? { ...reference, image_path: null } : reference;
  localStorage.setItem(GUEST_REFERENCE_DATA_KEY, JSON.stringify(stored));
}

export function loadGuestReference() {
  clearExpiredGuestReference();
  const value = localStorage.getItem(GUEST_REFERENCE_DATA_KEY);
  if (!value) return null;
  try { return JSON.parse(value) as ArtReference; } catch { return null; }
}

export function removeGuestReference() {
  localStorage.removeItem(GUEST_REFERENCE_DATA_KEY);
}
