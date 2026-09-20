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
  questionFailed?: boolean;
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
 * Resolves a stable, deterministic list of equivalent storage keys for a star/point ID.
 * Prevents unintentional cross-matching (e.g. col-g09-01 matching star-09 or col-g09-02).
 */
export function getEquivalentStarKeys(id?: string): string[] {
  if (!id) return [];
  const clean = id.trim();
  const keys = new Set<string>([clean]);

  // Gallery 09 specific mappings
  if (clean === 'col-g09-01' || clean === 'star-20' || clean === '20') {
    keys.add('col-g09-01');
    keys.add('star-20');
    keys.add('20');
    return Array.from(keys);
  }
  if (clean === 'col-g09-02' || clean === 'star-21' || clean === '21') {
    keys.add('col-g09-02');
    keys.add('star-21');
    keys.add('21');
    return Array.from(keys);
  }
  if (clean === 'col-g09-03' || clean === 'star-22' || clean === '22') {
    keys.add('col-g09-03');
    keys.add('star-22');
    keys.add('22');
    return Array.from(keys);
  }
  if (clean === 'col-g09-04' || clean === 'star-23' || clean === '23') {
    keys.add('col-g09-04');
    keys.add('star-23');
    keys.add('23');
    return Array.from(keys);
  }
  if (clean === 'star-24' || clean === '24') {
    keys.add('star-24');
    keys.add('24');
    return Array.from(keys);
  }
  if (clean === 'star-25' || clean === '25') {
    keys.add('star-25');
    keys.add('25');
    return Array.from(keys);
  }

  // Gallery 01 / 03 known point-to-star aliases
  if (clean === 'artwork-01' || clean === 'col-01' || clean === 'star-01' || clean === '1') {
    keys.add('artwork-01');
    keys.add('col-01');
    keys.add('star-01');
    keys.add('1');
    return Array.from(keys);
  }
  if (clean === 'artwork-g03-star' || clean === 'star-03' || clean === '3') {
    keys.add('artwork-g03-star');
    keys.add('star-03');
    keys.add('3');
    return Array.from(keys);
  }

  // Standard star-XX or star-q-XX or pure number
  const starMatch = clean.match(/^star(?:-q)?[-_]?0*(\d+)$/i);
  if (starMatch && starMatch[1]) {
    const num = parseInt(starMatch[1], 10);
    keys.add(`star-${String(num).padStart(2, '0')}`);
    keys.add(`star-${num}`);
    keys.add(String(num));
    return Array.from(keys);
  }

  if (/^\d+$/.test(clean)) {
    const num = parseInt(clean, 10);
    keys.add(`star-${String(num).padStart(2, '0')}`);
    keys.add(`star-${num}`);
    keys.add(String(num));
    return Array.from(keys);
  }

  return Array.from(keys);
}

/**
 * Retrieves progress for a specific Star Point ID.
 */
export function getStarPointProgress(starPointId: string): StarPointProgressItem {
  if (!starPointId) {
    return {
      firstViewed: false,
      discoveryUnlocked: false,
      questionCompleted: false,
      informationUnlocked: false,
      rewardClaimed: false,
      labelSeen: false,
    };
  }
  const db = getStarPointProgressDb();
  if (db[starPointId]) return db[starPointId];

  const equivalentKeys = getEquivalentStarKeys(starPointId);
  for (const key of equivalentKeys) {
    if (db[key]) {
      return db[key];
    }
  }

  return {
    firstViewed: false,
    discoveryUnlocked: false,
    questionCompleted: false,
    informationUnlocked: false,
    rewardClaimed: false,
    labelSeen: false,
  };
}

/**
 * Checks if a Star Point is permanently unlocked (either via question or coin payment).
 * When unlocked, clicking the star bypasses labels/questions and opens artwork info directly.
 */
export function isStarPointUnlocked(starPointId: string): boolean {
  if (!starPointId) return false;
  const progress = getStarPointProgress(starPointId);
  return Boolean(progress.discoveryUnlocked || progress.informationUnlocked);
}

/**
 * Checks if a Star Point's INFORMATION has been specifically unlocked.
 */
export function isStarPointInformationUnlocked(starPointId: string): boolean {
  if (!starPointId) return false;
  const progress = getStarPointProgress(starPointId);
  return Boolean(progress.informationUnlocked);
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
    for (const star of allActiveStars) {
      const starId = star.id;
      const altId = star.starId;
      if (
        isStarPointInformationUnlocked(starId) ||
        (altId && isStarPointInformationUnlocked(altId)) ||
        isStarPointUnlocked(starId) ||
        (altId && isStarPointUnlocked(altId))
      ) {
        unlockedCount++;
      }
    }
    return unlockedCount;
  }

  // Fallback: count distinct unique stars in db with informationUnlocked === true or discoveryUnlocked === true
  const unlockedKeys = new Set<string>();
  for (const [key, item] of Object.entries(db)) {
    if (item.informationUnlocked || item.discoveryUnlocked || item.questionCompleted) {
      const canonicalKey = getEquivalentStarKeys(key)[0] || key;
      unlockedKeys.add(canonicalKey);
    }
  }
  return unlockedKeys.size;
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
    const existing = getStarPointProgress(starPointId);
    const updated: StarPointProgressItem = {
      ...existing,
      starPointId,
      firstViewed: true,
      labelSeen: true,
    };
    const keys = getEquivalentStarKeys(starPointId);
    for (const k of keys) {
      db[k] = { ...updated, starPointId: k };
    }

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
    
    const keys = getEquivalentStarKeys(starPointId);
    for (const k of keys) {
      db[k] = { ...updated, starPointId: k };
    }

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
    
    const keys = getEquivalentStarKeys(starPointId);
    for (const k of keys) {
      db[k] = { ...updated, starPointId: k };
    }

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
    
    const keys = getEquivalentStarKeys(starPointId);
    for (const k of keys) {
      db[k] = { ...updated, starPointId: k };
    }

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
    
    const keys = getEquivalentStarKeys(starPointId);
    for (const k of keys) {
      db[k] = { ...updated, starPointId: k };
    }

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
 * Checks if a player has previously failed/answered incorrectly to a Star Point question.
 */
export function hasStarPointQuestionFailed(starPointId: string): boolean {
  if (!starPointId) return false;
  const progress = getStarPointProgress(starPointId);
  return Boolean(progress.questionFailed);
}

/**
 * Marks that the player answered incorrectly to the Star Point question.
 */
export function markStarPointQuestionFailed(starPointId: string): void {
  try {
    const db = getStarPointProgressDb();
    const existing = getStarPointProgress(starPointId);
    const updated: StarPointProgressItem = {
      ...existing,
      starPointId,
      firstViewed: true,
      questionFailed: true,
    };
    
    const keys = getEquivalentStarKeys(starPointId);
    for (const k of keys) {
      db[k] = { ...updated, starPointId: k };
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_STAR_PROGRESS_KEY, JSON.stringify(db));
      window.dispatchEvent(
        new CustomEvent('museum_star_point_progress_updated', {
          detail: { starPointId, progress: updated },
        })
      );
    }
  } catch (err) {
    console.error('Error marking star point question failed:', err);
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
