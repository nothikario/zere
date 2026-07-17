import { WizardValues } from './wizardOptions';

export type WizardProgress = { values: WizardValues; characters: WizardValues[]; stepIndex: number };
const storageKey = (ownerId: string) => `refri-wizard-progress-${ownerId}`;

export function loadWizardProgress(ownerId: string): WizardProgress | null {
  try {
    const stored = localStorage.getItem(storageKey(ownerId));
    return stored ? JSON.parse(stored) as WizardProgress : null;
  } catch { return null; }
}

export const saveWizardProgress = (ownerId: string, progress: WizardProgress) => localStorage.setItem(storageKey(ownerId), JSON.stringify(progress));
export const clearWizardProgress = (ownerId: string) => localStorage.removeItem(storageKey(ownerId));
