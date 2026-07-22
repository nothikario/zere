import { supabase } from './supabase';
import type { ArtReference } from './references';

export type Usage = {
  streak: number;
  max_streak: number;
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

function clearLegacyGuestReference() {
  localStorage.removeItem(GUEST_REFERENCE_KEY);
  localStorage.removeItem(GUEST_REFERENCE_DATA_KEY);
  localStorage.removeItem(GUEST_REFERENCE_DATE_KEY);
}

export function hasGuestReference() {
  return sessionStorage.getItem(GUEST_REFERENCE_KEY) === 'true';
}

export function markGuestReferenceCreated() {
  sessionStorage.setItem(GUEST_REFERENCE_KEY, 'true');
}

export function saveGuestReference(reference: ArtReference) {
  markGuestReferenceCreated();
  try {
    sessionStorage.setItem(GUEST_REFERENCE_DATA_KEY, JSON.stringify(reference));
  } catch {
    sessionStorage.setItem(GUEST_REFERENCE_DATA_KEY, JSON.stringify({ ...reference, image_path: null }));
  }
}

export function loadGuestReference() {
  clearLegacyGuestReference();
  const value = sessionStorage.getItem(GUEST_REFERENCE_DATA_KEY);
  if (!value) return null;
  try { return JSON.parse(value) as ArtReference; } catch { return null; }
}

export function removeGuestReference() {
  sessionStorage.removeItem(GUEST_REFERENCE_DATA_KEY);
}

export function clearGuestSession() {
  sessionStorage.removeItem(GUEST_REFERENCE_KEY);
  sessionStorage.removeItem(GUEST_REFERENCE_DATA_KEY);
  clearLegacyGuestReference();
}
