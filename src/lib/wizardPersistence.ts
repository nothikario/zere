import { WizardValues } from './wizardOptions';

export type WizardProgress = { values: WizardValues; characters: WizardValues[]; stepIndex: number };
const storageKey = (guest: boolean) => `refri-wizard-progress-${guest ? 'guest' : 'account'}`;

export function loadWizardProgress(guest: boolean): WizardProgress | null {
  try {
    const stored = localStorage.getItem(storageKey(guest));
    return stored ? JSON.parse(stored) as WizardProgress : null;
  } catch { return null; }
}

export const saveWizardProgress = (guest: boolean, progress: WizardProgress) => localStorage.setItem(storageKey(guest), JSON.stringify(progress));
export const clearWizardProgress = (guest: boolean) => localStorage.removeItem(storageKey(guest));
