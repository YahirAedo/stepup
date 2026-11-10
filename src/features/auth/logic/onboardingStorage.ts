import { storage } from '../../../services/storage';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export async function hasSeenOnboarding(): Promise<boolean> {
  const value = await storage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

export async function markOnboardingSeen(): Promise<void> {
  await storage.setItem(ONBOARDING_KEY, 'true');
}
