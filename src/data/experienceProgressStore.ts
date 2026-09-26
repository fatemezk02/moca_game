/**
 * Experience Points Progress Store
 * Tracks which interactive experiences the player has unlocked and discovered in the museum.
 * Experiences cost 7 coins to unlock and once unlocked remain permanently accessible.
 */

import { spendCoins } from './questionProgressStore';
import { getPlayerStats } from './questionProgressStore';

export const EXPERIENCE_UNLOCK_COST = 7;

const STORAGE_KEY = 'museum_experience_progress_v2';
const OLD_STORAGE_KEY = 'museum_experience_progress_v1';
const STORAGE_UNLOCKED_KEY = 'museum_experience_unlocked_v1';

const SHIFT_MAP: Record<string, string> = {
  experience_1: 'experience_2',
  experience_2: 'experience_3',
  experience_3: 'experience_4',
  // Do NOT shift experience_4 into experience_5 so Gallery 04's exp-g05-vintage-camera does not inherit Gallery 03's state
  // Do NOT shift experience_5 into experience_6 so Gallery 04's exp-g05-mirror-selfie does not inherit an unlocked state
  experience_6: 'experience_7',
};

/**
 * Returns equivalent storage keys for an experience (maps id to experienceId and vice-versa)
 */
export function getEquivalentExperienceKeys(experienceId?: string): string[] {
  if (!experienceId) return [];
  const clean = experienceId.trim().toLowerCase();
  const keys = new Set<string>([clean]);

  if (clean === 'exp-g02-reversed-camera' || clean === 'experience_1' || clean === 'experience-1') {
    keys.add('exp-g02-reversed-camera');
    keys.add('experience_1');
    keys.add('experience-1');
  } else if (clean === 'exp-g03-frame' || clean === 'experience_2' || clean === 'experience-2') {
    keys.add('exp-g03-frame');
    keys.add('experience_2');
    keys.add('experience-2');
  } else if (clean === 'exp-g03-shadow' || clean === 'experience_3' || clean === 'experience-3') {
    keys.add('exp-g03-shadow');
    keys.add('experience_3');
    keys.add('experience-3');
  } else if (clean === 'exp-g03-stereoscope' || clean === 'experience_4' || clean === 'experience-4') {
    keys.add('exp-g03-stereoscope');
    keys.add('experience_4');
    keys.add('experience-4');
  } else if (clean === 'exp-g05-vintage-camera' || clean === 'experience_5' || clean === 'experience-5') {
    keys.add('exp-g05-vintage-camera');
    keys.add('experience_5');
    keys.add('experience-5');
  } else if (clean === 'exp-g05-mirror-selfie' || clean === 'experience_6' || clean === 'experience-6') {
    keys.add('exp-g05-mirror-selfie');
    keys.add('experience_6');
    keys.add('experience-6');
  } else if (clean === 'exp-g08-darkroom' || clean === 'experience_7' || clean === 'experience-7') {
    keys.add('exp-g08-darkroom');
    keys.add('experience_7');
    keys.add('experience-7');
  }
  return Array.from(keys);
}

export function getDiscoveredExperiences(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: string[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [];
    } else {
      // Migrate from v1 with +1 ID shift (excluding Gallery 04's experience_5 and experience_6)
      const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        if (Array.isArray(oldParsed)) {
          list = oldParsed
            .map((id) => SHIFT_MAP[id] || id)
            .filter(
              (id) =>
                id !== 'experience_5' &&
                id !== 'exp-g05-vintage-camera' &&
                id !== 'experience_6' &&
                id !== 'exp-g05-mirror-selfie'
            );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
      }
    }

    // Ensure exp-g05-vintage-camera (experience_5) and exp-g05-mirror-selfie (experience_6)
    // in Gallery 04 NEVER inherit stale legacy discovery unless explicitly unlocked with 7 coins in STORAGE_UNLOCKED_KEY
    const rawUnlocked = localStorage.getItem(STORAGE_UNLOCKED_KEY);
    const unlockedList: string[] = rawUnlocked ? JSON.parse(rawUnlocked) : [];
    const isExplicitlyUnlocked = unlockedList.some((id) => {
      const lower = id.toLowerCase().trim();
      return lower === 'exp-g05-vintage-camera' || lower === 'experience_5' || lower === 'experience-5';
    });

    if (!isExplicitlyUnlocked) {
      list = list.filter((id) => {
        const lower = id.toLowerCase().trim();
        return lower !== 'exp-g05-vintage-camera' && lower !== 'experience_5' && lower !== 'experience-5';
      });
    }

    const isMirrorSelfieExplicitlyUnlocked = unlockedList.some((id) => {
      const lower = id.toLowerCase().trim();
      return lower === 'exp-g05-mirror-selfie' || lower === 'experience_6' || lower === 'experience-6';
    });

    if (!isMirrorSelfieExplicitlyUnlocked) {
      list = list.filter((id) => {
        const lower = id.toLowerCase().trim();
        return lower !== 'exp-g05-mirror-selfie' && lower !== 'experience_6' && lower !== 'experience-6';
      });
    }

    return list;
  } catch (err) {
    console.error('Failed to read experience progress from localStorage:', err);
    return [];
  }
}

/**
 * Retrieves all unlocked experience IDs.
 * Combines explicitly unlocked experiences and any previously discovered experiences.
 * Guarantees that Gallery 04 paid experiences start locked and can only be unlocked
 * by paying 7 coins into STORAGE_UNLOCKED_KEY.
 */
export function getUnlockedExperiences(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_UNLOCKED_KEY);
    const unlocked: string[] = raw ? JSON.parse(raw) : [];

    // For legacy discovered experiences:
    // Gallery 04 experiences (exp-g05-vintage-camera / experience_5 and exp-g05-mirror-selfie / experience_6)
    // must NEVER inherit an unlocked state from another experience, another gallery, or an old session!
    const discovered = getDiscoveredExperiences().filter((id) => {
      const lower = id.toLowerCase().trim();
      return (
        lower !== 'exp-g05-vintage-camera' &&
        lower !== 'experience_5' &&
        lower !== 'experience-5' &&
        lower !== 'exp-g05-mirror-selfie' &&
        lower !== 'experience_6' &&
        lower !== 'experience-6'
      );
    });

    const combined = Array.from(new Set([...unlocked, ...discovered]));
    return combined;
  } catch (err) {
    console.error('Failed to read unlocked experiences:', err);
    return [];
  }
}

/**
 * Checks if a specific Experience is unlocked.
 * Returns true if the user has already paid 7 coins or previously unlocked it.
 */
export function isExperienceUnlocked(experienceId?: string): boolean {
  if (!experienceId) return false;
  const list = getUnlockedExperiences();
  const keys = getEquivalentExperienceKeys(experienceId);
  return keys.some((k) => list.some((item) => item.toLowerCase() === k.toLowerCase()));
}

/**
 * Attempts to unlock an Experience by deducting 7 coins from the player's balance.
 * Safety:
 * - Checks player coin balance >= 7
 * - If already unlocked, returns success with 0 deduction
 * - Deducts coins only once via spendCoins
 * - Persists unlock state tied to stable experience ID
 */
export function unlockExperienceWithCoins(
  experienceId: string,
  cost: number = EXPERIENCE_UNLOCK_COST
): { success: boolean; error?: 'insufficient_coins' | 'already_unlocked' | 'unknown' } {
  if (!experienceId || typeof window === 'undefined' || !window.localStorage) {
    return { success: false, error: 'unknown' };
  }

  // If already unlocked, do not deduct again
  if (isExperienceUnlocked(experienceId)) {
    return { success: true };
  }

  // Check balance before any deduction
  const currentStats = getPlayerStats();
  if (currentStats.coins < cost) {
    return { success: false, error: 'insufficient_coins' };
  }

  // Deduct exactly 7 coins
  const spent = spendCoins(cost);
  if (!spent) {
    return { success: false, error: 'insufficient_coins' };
  }

  try {
    const keys = getEquivalentExperienceKeys(experienceId);

    // Save to STORAGE_UNLOCKED_KEY
    const rawUnlocked = localStorage.getItem(STORAGE_UNLOCKED_KEY);
    const unlockedList: string[] = rawUnlocked ? JSON.parse(rawUnlocked) : [];
    for (const k of keys) {
      if (!unlockedList.some((id) => id.toLowerCase() === k.toLowerCase())) {
        unlockedList.push(k);
      }
    }
    localStorage.setItem(STORAGE_UNLOCKED_KEY, JSON.stringify(unlockedList));

    // Also mark in discovered list
    for (const k of keys) {
      markExperienceDiscovered(k);
    }

    // Broadcast unlock events for real-time reactive UI updates
    window.dispatchEvent(
      new CustomEvent('museum_experience_unlocked', {
        detail: { experienceId, cost, keys },
      })
    );
    window.dispatchEvent(
      new CustomEvent('museum_experience_progress_updated', {
        detail: { experienceId, totalDiscovered: getDiscoveredExperiences().length },
      })
    );

    return { success: true };
  } catch (err) {
    console.error('Failed to save experience unlock state:', err);
    return { success: false, error: 'unknown' };
  }
}

export function isExperienceDiscovered(experienceId: string): boolean {
  if (!experienceId) return false;
  const list = getDiscoveredExperiences();
  const lower = experienceId.toLowerCase();
  return list.some((id) => id.toLowerCase() === lower);
}

export function markExperienceDiscovered(experienceId: string): void {
  if (!experienceId || typeof window === 'undefined' || !window.localStorage) return;
  try {
    const list = getDiscoveredExperiences();
    const lower = experienceId.toLowerCase();
    if (!list.some((id) => id.toLowerCase() === lower)) {
      list.push(experienceId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(
        new CustomEvent('museum_experience_progress_updated', {
          detail: { experienceId, totalDiscovered: list.length },
        })
      );
    }
  } catch (err) {
    console.error('Failed to save experience discovery:', err);
  }
}

export function getDiscoveredExperiencesCount(allActiveExperiences?: Array<{ id: string; experienceId?: string }>): number {
  const discovered = getDiscoveredExperiences();
  if (!allActiveExperiences || allActiveExperiences.length === 0) {
    return discovered.length;
  }
  return allActiveExperiences.filter((exp) => {
    return (
      isExperienceDiscovered(exp.id) ||
      (exp.experienceId && isExperienceDiscovered(exp.experienceId))
    );
  }).length;
}

export function resetExperienceProgress(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OLD_STORAGE_KEY);
    localStorage.removeItem(STORAGE_UNLOCKED_KEY);
    window.dispatchEvent(
      new CustomEvent('museum_experience_progress_updated', {
        detail: { totalDiscovered: 0 },
      })
    );
    window.dispatchEvent(
      new CustomEvent('museum_experience_unlocked', {
        detail: { reset: true },
      })
    );
  } catch (err) {
    console.error('Failed to reset experience progress:', err);
  }
}
