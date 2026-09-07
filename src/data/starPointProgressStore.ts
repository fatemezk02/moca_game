import { awardCoins, spendCoins } from './questionProgressStore';

/**
 * ============================================================================
 * PERSISTENT STAR POINT PROGRESS STORE
 * ============================================================================
 * Standardized persistent state model for Star Points across the entire game.
 * 
 * Each Star Point tracks:
 * - starPointId: string
 * - discoveryUnlocked: boolean (unlocked either by question or coins)
 * - questionCompleted: boolean (answered question correctly)
 * - informationUnlocked: boolean (information view directly accessible)
 * - rewardClaimed: boolean (+50 coins claimed; cannot receive again)
 * - unlockedVia: 'question' | 'coins'
 * - labelSeen: boolean (whether first-click label was displayed)
 * - firstViewed: boolean
 */

export interface StarPointProgressItem {
  starPointId?: string;
  firstViewed: boolean;
  labelSeen?: boolean;
  discoveryUnlocked: boolean;
  questionCompleted?: boolean;
  informationUnlocked?: boolean;
  rewardClaimed?: 'coins' | 'info' | boolean;
  answeredQuestion?: boolean;
  selectedOption?: number;
  unlockedVia?: 'question' | 'coins';
  unlockedAt?: string;
}

export type StarPointProgressDatabase = Record<string, StarPointProgressItem>;

const STORAGE_STAR_PROGRESS_KEY = 'museum_star_points_progress_v2';
const STORAGE_LEGACY_KEY = 'museum_star_points_progress';

/**
 * Retrieves the entire star points progress database from localStorage.
 */
export function getStarPointProgressDb(): StarPointProgressDatabase {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Check v2 key first
      const raw = localStorage.getItem(STORAGE_STAR_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }

      // Backward compatibility fallback: check legacy key
      const legacyRaw = localStorage.getItem(STORAGE_LEGACY_KEY);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error reading star point progress from storage:', err);
  }
  return {};
}

/**
 * Retrieves progress for a specific Star Point ID.
 */
export function getStarPointProgress(starPointId: string): StarPointProgressItem {
  const db = getStarPointProgressDb();
  return (
    db[starPointId] || {
      firstViewed: false,
      discoveryUnlocked: false,
      questionCompleted: false,
      informationUnlocked: false,
      rewardClaimed: false,
      labelSeen: false,
    }
  );
}

/**
 * Checks if a Star Point is permanently unlocked (either via question or coin payment).
 * When unlocked, clicking the star bypasses labels/questions and opens artwork info directly.
 */
export function isStarPointUnlocked(starPointId: string): boolean {
  const progress = getStarPointProgress(starPointId);
  if (Boolean(progress.discoveryUnlocked || progress.informationUnlocked)) {
    return true;
  }
  const db = getStarPointProgressDb();
  const extractNum = (s: string) => {
    const m = s.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  };
  const targetNum = extractNum(starPointId);
  if (targetNum !== null) {
    return Object.entries(db).some(([key, item]) => {
      if (!item.discoveryUnlocked && !item.informationUnlocked) return false;
      const keyNum = extractNum(key);
      return keyNum !== null && keyNum === targetNum;
    });
  }
  return false;
}

/**
 * Checks if a Star Point's INFORMATION has been specifically unlocked.
 */
export function isStarPointInformationUnlocked(starPointId: string): boolean {
  const progress = getStarPointProgress(starPointId);
  if (Boolean(progress.informationUnlocked)) {
    return true;
  }
  const db = getStarPointProgressDb();
  const extractNum = (s: string) => {
    const m = s.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  };
  const targetNum = extractNum(starPointId);
  if (targetNum !== null) {
    return Object.entries(db).some(([key, item]) => {
      if (!item.informationUnlocked) return false;
      const keyNum = extractNum(key);
      return keyNum !== null && keyNum === targetNum;
    });
  }
  return false;
}

/**
 * Calculates the total number of Star Points whose INFORMATION has been unlocked by the player.
 * Rules:
 * - Count only information unlocks (informationUnlocked === true).
 * - Do NOT count: stars merely discovered, stars clicked, questions opened, questions answered without info unlock.
 * - Dynamic, persistent, user-wide across all galleries.
 */
export function getUnlockedInformationStarsCount(allActiveStars?: Array<{ id: string; starId?: string }>): number {
  const db = getStarPointProgressDb();

  if (allActiveStars && allActiveStars.length > 0) {
    let unlockedCount = 0;
    const extractNum = (s: string) => {
      const m = s.match(/\d+/);
      return m ? parseInt(m[0], 10) : null;
    };

    for (const star of allActiveStars) {
      const starId = star.id;
      const altId = star.starId || '';

      // Direct check in db
      if (db[starId]?.informationUnlocked || (altId && db[altId]?.informationUnlocked)) {
        unlockedCount++;
        continue;
      }

      // Check numeric/alias match in db
      const starNum = extractNum(starId) ?? (altId ? extractNum(altId) : null);
      const foundMatch = Object.entries(db).some(([key, item]) => {
        if (!item.informationUnlocked) return false;
        if (key === starId || key === altId) return true;
        const keyNum = extractNum(key);
        if (keyNum !== null && starNum !== null && keyNum === starNum) return true;
        return false;
      });

      if (foundMatch) {
        unlockedCount++;
      }
    }
    return unlockedCount;
  }

  // Fallback: count distinct entries in db with informationUnlocked === true
  return Object.values(db).filter((item) => Boolean(item.informationUnlocked)).length;
}

/**
 * Legacy compatibility alias for isStarPointUnlocked.
 */
export function isStarPointDiscoveryUnlocked(starPointId: string): boolean {
  return isStarPointUnlocked(starPointId);
}

/**
 * Checks if a Star Point has been clicked/viewed at least once.
 */
export function hasStarPointBeenViewed(starPointId: string): boolean {
  const progress = getStarPointProgress(starPointId);
  return Boolean(progress.firstViewed || progress.labelSeen || progress.discoveryUnlocked);
}

/**
 * Marks a Star Point label as seen on first click.
 */
export function markStarPointFirstViewed(starPointId: string): void {
  try {
    const db = getStarPointProgressDb();
    const existing = db[starPointId] || { firstViewed: false, discoveryUnlocked: false };
    const updated: StarPointProgressItem = {
      ...existing,
      starPointId,
      firstViewed: true,
      labelSeen: true,
    };
    db[starPointId] = updated;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_STAR_PROGRESS_KEY, JSON.stringify(db));
      window.dispatchEvent(
        new CustomEvent('museum_star_point_progress_updated', {
          detail: { starPointId, progress: updated },
        })
      );
    }
  } catch (err) {
    console.error('Error saving star point first viewed status:', err);
  }
}

/**
 * Unlocks a Star Point via the QUESTION PATH:
 * - Awards reward coins (+50 or custom) if not already claimed
 * - Marks questionCompleted, discoveryUnlocked, informationUnlocked, rewardClaimed
 */
export function unlockStarPointViaQuestion(starPointId: string, rewardCoins: number = 50): void {
  try {
    const db = getStarPointProgressDb();
    const existing = getStarPointProgress(starPointId);

    // Award reward coins if not previously claimed
    const alreadyClaimed = Boolean(existing.rewardClaimed);
    if (!alreadyClaimed && rewardCoins > 0) {
      awardCoins(rewardCoins);
    }

    const updated: StarPointProgressItem = {
      ...existing,
      starPointId,
      firstViewed: true,
      labelSeen: true,
      discoveryUnlocked: true,
      questionCompleted: true,
      informationUnlocked: true,
      rewardClaimed: true,
      answeredQuestion: true,
      unlockedVia: 'question',
      unlockedAt: new Date().toISOString(),
    };
    db[starPointId] = updated;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_STAR_PROGRESS_KEY, JSON.stringify(db));
      window.dispatchEvent(
        new CustomEvent('museum_star_point_progress_updated', {
          detail: { starPointId, progress: updated },
        })
      );
    }
  } catch (err) {
    console.error('Error unlocking star point via question:', err);
  }
}

/**
 * Unlocks a Star Point via the INFORMATION PATH (Coins):
 * - Deducts cost (default: 30 coins)
 * - Returns true if successful, false if balance insufficient
 */
export function unlockStarPointViaCoins(starPointId: string, cost: number = 30): boolean {
  try {
    const success = spendCoins(cost);
    if (!success) {
      return false;
    }

    const db = getStarPointProgressDb();
    const existing = getStarPointProgress(starPointId);
    const updated: StarPointProgressItem = {
      ...existing,
      starPointId,
      firstViewed: true,
      labelSeen: true,
      discoveryUnlocked: true,
      informationUnlocked: true,
      unlockedVia: 'coins',
      unlockedAt: new Date().toISOString(),
    };
    db[starPointId] = updated;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_STAR_PROGRESS_KEY, JSON.stringify(db));
      window.dispatchEvent(
        new CustomEvent('museum_star_point_progress_updated', {
          detail: { starPointId, progress: updated },
        })
      );
    }
    return true;
  } catch (err) {
    console.error('Error unlocking star point via coins:', err);
    return false;
  }
}

/**
 * Legacy compatibility alias for unlocking discovery information.
 */
export function unlockStarPointDiscovery(
  starPointId: string,
  rewardType: 'coins' | 'info' = 'info'
): void {
  if (rewardType === 'coins') {
    unlockStarPointViaQuestion(starPointId);
  } else {
    const db = getStarPointProgressDb();
    const existing = getStarPointProgress(starPointId);
    const updated: StarPointProgressItem = {
      ...existing,
      starPointId,
      firstViewed: true,
      discoveryUnlocked: true,
      informationUnlocked: true,
      rewardClaimed: rewardType,
      unlockedAt: new Date().toISOString(),
    };
    db[starPointId] = updated;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_STAR_PROGRESS_KEY, JSON.stringify(db));
      window.dispatchEvent(
        new CustomEvent('museum_star_point_progress_updated', {
          detail: { starPointId, progress: updated },
        })
      );
    }
  }
}

/**
 * Records that the question for a Star Point has been answered.
 */
export function recordStarPointAnswer(starPointId: string, selectedOption: number): void {
  try {
    const db = getStarPointProgressDb();
    const existing = getStarPointProgress(starPointId);
    const updated: StarPointProgressItem = {
      ...existing,
      starPointId,
      firstViewed: true,
      answeredQuestion: true,
      selectedOption,
    };
    db[starPointId] = updated;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_STAR_PROGRESS_KEY, JSON.stringify(db));
      window.dispatchEvent(
        new CustomEvent('museum_star_point_progress_updated', {
          detail: { starPointId, progress: updated },
        })
      );
    }
  } catch (err) {
    console.error('Error recording star point answer:', err);
  }
}

/**
 * Resets all star point progress records.
 */
export function resetStarPointProgress(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_STAR_PROGRESS_KEY);
      localStorage.removeItem(STORAGE_LEGACY_KEY);
      window.dispatchEvent(
        new CustomEvent('museum_star_point_progress_updated', {
          detail: { starPointId: 'all', progress: null },
        })
      );
    }
  } catch (err) {
    console.error('Error resetting star point progress:', err);
  }
}
