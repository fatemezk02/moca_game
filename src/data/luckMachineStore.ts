/**
 * Persistent Luck Machine Store
 * Manages Luck Machine state, prize configurations, and Gallery 02 completion gating.
 */

import {
  getCompletedPuzzlePoints,
  getPuzzleProgress,
  isGalleryPuzzleCompleted,
} from './puzzleProgressStore';
import { awardCoins } from './questionProgressStore';
import {
  CANONICAL_PROGRESSION_SEQUENCE,
  isGalleryReached,
  markGalleryManuallyUnlocked,
  markGalleryReached,
} from './reachedGalleriesStore';
import { unlockStarPointDiscovery } from './starPointProgressStore';
import { markExperienceUnlockedDirectly } from './experienceProgressStore';
import { contentService } from '../services/content/contentService';
import { GALLERY_03_EXPERIENCE_DEFS } from './experiencePointsConfig';

export interface CafeDiscountRecord {
  code: string;
  discountPercent: 10 | 25;
  rewardedAt: string;
  redeemed: boolean;
  redeemedAt?: string;
}

export interface LuckPrize {
  id: string;
  name: string;
  type:
    | 'empty'
    | 'next_gallery'
    | 'cafe_discount'
    | 'coins'
    | 'gallery03_stars'
    | 'gallery03_first_experience';
  coins?: number;
  discountPercent?: 10 | 25;
  icon: string;
  badgeText?: string;
  description?: string;
}

/**
 * EXACT 12 Prize Options for the Luck Machine:
 * 1..4: پوچ (x4)
 * 5: باز شدن قفل گالری بعدی که قفل باشد
 * 6: تخفیف ۲۵٪ کافه
 * 7: تخفیف ۱۰٪ کافه
 * 8: ۱۵ سکهٔ بازی
 * 9: ۱۵ سکهٔ بازی
 * 10: ۲۵ سکهٔ بازی
 * 11: باز شدن ستاره‌های گالری بعدی (گالری 03)
 * 12: باز شدن اولین تجربهٔ گالری بعدی (گالری 03)
 */
export const LUCK_PRIZES: LuckPrize[] = [
  { id: 'prize_empty_1', name: 'پوچ', type: 'empty', icon: '💨' },
  { id: 'prize_empty_2', name: 'پوچ', type: 'empty', icon: '💨' },
  { id: 'prize_empty_3', name: 'پوچ', type: 'empty', icon: '💨' },
  { id: 'prize_empty_4', name: 'پوچ', type: 'empty', icon: '💨' },
  {
    id: 'prize_next_gallery',
    name: 'باز شدن قفل گالری بعدی که قفل باشد',
    type: 'next_gallery',
    icon: '🗝️',
  },
  {
    id: 'prize_cafe_25',
    name: 'تخفیف ۲۵٪ کافه',
    type: 'cafe_discount',
    discountPercent: 25,
    icon: '☕',
  },
  {
    id: 'prize_cafe_10',
    name: 'تخفیف ۱۰٪ کافه',
    type: 'cafe_discount',
    discountPercent: 10,
    icon: '☕',
  },
  {
    id: 'prize_coins_15_a',
    name: '۱۵ سکهٔ بازی',
    type: 'coins',
    coins: 15,
    icon: '🪙',
  },
  {
    id: 'prize_coins_15_b',
    name: '۱۵ سکهٔ بازی',
    type: 'coins',
    coins: 15,
    icon: '🪙',
  },
  {
    id: 'prize_coins_25',
    name: '۲۵ سکهٔ بازی',
    type: 'coins',
    coins: 25,
    icon: '🪙',
  },
  {
    id: 'prize_gallery03_stars',
    name: 'باز شدن ستاره‌های گالری بعدی (گالری 03)',
    type: 'gallery03_stars',
    icon: '⭐',
  },
  {
    id: 'prize_gallery03_first_exp',
    name: 'باز شدن اولین تجربهٔ گالری بعدی (گالری 03)',
    type: 'gallery03_first_experience',
    icon: '✨',
  },
];

export interface LuckMachineState {
  hasSpun: boolean;
  selectedCellIndex: number | null;
  prizeId: string | null;
  prizeName: string | null;
  prizeType: string | null;
  coinsAwarded?: number;
  cafeCode?: string;
  cafeDiscountPercent?: 10 | 25;
  unlockedGalleryNumber?: string;
  unlockedGalleryName?: string;
  unlockedExperienceName?: string;
  completedAt: string | null;
}

const STORAGE_LUCK_MACHINE_KEY = 'museum_luck_machine_state';
const STORAGE_CAFE_CODES_KEY = 'museum_cafe_discount_codes_v1';

const DEFAULT_STATE: LuckMachineState = {
  hasSpun: false,
  selectedCellIndex: null,
  prizeId: null,
  prizeName: null,
  prizeType: null,
  completedAt: null,
};

/**
 * Returns all generated cafe discount codes and their redemption status.
 */
export function getAllCafeDiscountCodes(): CafeDiscountRecord[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_CAFE_CODES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading cafe discount codes:', err);
  }
  return [];
}

/**
 * Generates a unique, non-guessable cafe discount code (e.g. CAFE-7K4P-92XM).
 * Ensures it has never been generated before.
 */
export function generateUniqueCafeCode(discountPercent: 10 | 25): CafeDiscountRecord {
  const existing = getAllCafeDiscountCodes();
  const existingCodeSet = new Set(existing.map((c) => c.code.toUpperCase().trim()));

  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let candidate = '';
  let attempts = 0;

  do {
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += chars[Math.floor(Math.random() * chars.length)];
      p2 += chars[Math.floor(Math.random() * chars.length)];
    }
    candidate = `CAFE-${p1}-${p2}`;
    attempts++;
  } while (existingCodeSet.has(candidate) && attempts < 100);

  const newRecord: CafeDiscountRecord = {
    code: candidate,
    discountPercent,
    rewardedAt: new Date().toISOString(),
    redeemed: false,
  };

  existing.push(newRecord);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_CAFE_CODES_KEY, JSON.stringify(existing));
    }
  } catch (err) {
    console.error('Error saving new cafe discount code:', err);
  }

  return newRecord;
}

/**
 * Marks a cafe discount code as redeemed (one-time use).
 * Cannot be redeemed twice.
 */
export function redeemCafeDiscountCode(codeToRedeem: string): { success: boolean; error?: 'not_found' | 'already_redeemed' } {
  if (!codeToRedeem) return { success: false, error: 'not_found' };
  const clean = codeToRedeem.trim().toUpperCase();
  const existing = getAllCafeDiscountCodes();
  const target = existing.find((c) => c.code.toUpperCase() === clean);

  if (!target) {
    return { success: false, error: 'not_found' };
  }
  if (target.redeemed) {
    return { success: false, error: 'already_redeemed' };
  }

  target.redeemed = true;
  target.redeemedAt = new Date().toISOString();

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_CAFE_CODES_KEY, JSON.stringify(existing));
      window.dispatchEvent(
        new CustomEvent('museum_cafe_code_redeemed', {
          detail: { code: clean },
        })
      );
    }
  } catch (err) {
    console.error('Error persisting redeemed cafe code:', err);
  }

  return { success: true };
}

/**
 * Returns whether all 3 required puzzle points of Gallery 02 are complete.
 * Strict gating:
 * - Must NOT be available when only 0, 1, or 2 puzzles are completed.
 * - MUST be available when puzzle 1 + puzzle 2 + puzzle 3 of Gallery 02 are all completed.
 */
export function isGallery02PuzzlesFullyCompleted(): boolean {
  try {
    const completedPoints = getCompletedPuzzlePoints();
    const g02Points = [
      'puzzle-g03-point-01',
      'puzzle-g03-point-02',
      'puzzle-g03-point-03',
    ];

    const hasAll3Points = g02Points.every((pt) => completedPoints.includes(pt));
    if (hasAll3Points) return true;

    // Check collected pieces for Gallery 02
    const progress = getPuzzleProgress();
    const g02Pieces = [
      ...(progress['gallery_02']?.collectedPieces || []),
      ...(progress['gallery-02']?.collectedPieces || []),
      ...(progress['gallery-03']?.collectedPieces || []),
      ...(progress['gallery_03']?.collectedPieces || []),
    ];

    const hasAll3Pieces =
      g02Pieces.includes('gallery03-piece-01') &&
      g02Pieces.includes('gallery03-piece-02') &&
      g02Pieces.includes('gallery03-piece-03');

    if (hasAll3Pieces) return true;

    return isGalleryPuzzleCompleted('gallery_02');
  } catch (err) {
    console.error('Error checking Gallery 02 puzzle completion for Luck Machine:', err);
    return false;
  }
}

/**
 * Master feature flag for the Luck Machine ("دستگاه شانس").
 * Set to false to temporarily hide and disable the Luck Machine feature.
 * Set to true to restore the Luck Machine behavior.
 */
export const LUCK_MACHINE_ENABLED = true;

/**
 * Gating helper: determines if the Luck Machine entry/modal is available.
 */
export function isGallery02LuckMachineAvailable(): boolean {
  if (!LUCK_MACHINE_ENABLED) {
    return false;
  }
  return isGallery02PuzzlesFullyCompleted();
}

/**
 * Retrieves the persisted Luck Machine state.
 */
export function getLuckMachineState(): LuckMachineState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_LUCK_MACHINE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            hasSpun: Boolean(parsed.hasSpun),
            selectedCellIndex: typeof parsed.selectedCellIndex === 'number' ? parsed.selectedCellIndex : null,
            prizeId: parsed.prizeId || null,
            prizeName: parsed.prizeName || null,
            prizeType: parsed.prizeType || null,
            coinsAwarded: typeof parsed.coinsAwarded === 'number' ? parsed.coinsAwarded : undefined,
            cafeCode: parsed.cafeCode || undefined,
            cafeDiscountPercent: parsed.cafeDiscountPercent || undefined,
            unlockedGalleryNumber: parsed.unlockedGalleryNumber || undefined,
            unlockedGalleryName: parsed.unlockedGalleryName || undefined,
            unlockedExperienceName: parsed.unlockedExperienceName || undefined,
            completedAt: parsed.completedAt || null,
          };
        }
      }
    }
  } catch (err) {
    console.error('Error reading Luck Machine state:', err);
  }
  return { ...DEFAULT_STATE };
}

/**
 * Executes the reward fulfillment logic for the awarded prize:
 * - next_gallery: unlocks the first subsequent locked canonical gallery
 * - cafe_discount: generates and persists a unique one-time code
 * - coins: awards 15 or 25 coins via existing awardCoins
 * - gallery03_stars: unlocks all stars belonging to Gallery 03
 * - gallery03_first_experience: unlocks the first experience of Gallery 03
 * - empty: no reward
 */
export function saveLuckMachineSpinResult(cellIndex: number, prize: LuckPrize): LuckMachineState {
  const current = getLuckMachineState();
  if (current.hasSpun) {
    return current;
  }

  let coinsAwarded: number | undefined;
  let cafeCode: string | undefined;
  let cafeDiscountPercent: (10 | 25) | undefined;
  let unlockedGalleryNumber: string | undefined;
  let unlockedGalleryName: string | undefined;
  let unlockedExperienceName: string | undefined;

  // 1. Coins reward
  if (prize.type === 'coins' && prize.coins) {
    coinsAwarded = prize.coins;
    awardCoins(coinsAwarded);
  }

  // 2. Cafe discount reward (unique non-guessable code)
  if (prize.type === 'cafe_discount') {
    const percent = prize.discountPercent || 25;
    const generated = generateUniqueCafeCode(percent);
    cafeCode = generated.code;
    cafeDiscountPercent = percent;
  }

  // 3. Unlock next locked gallery
  if (prize.type === 'next_gallery') {
    // Current progression: 01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07 -> 08
    const sequence = [
      { id: 'gallery_03', num: '03', name: 'ثبت دوام ما' },
      { id: 'gallery_04', num: '04', name: 'ضرب‌آهنگ شهر' },
      { id: 'gallery_05', num: '05', name: 'در کشاکش تماشا و استیلا' },
      { id: 'gallery_06', num: '06', name: 'گذر از برون به درون' },
      { id: 'gallery_07', num: '07', name: 'آونگ زمان' },
      { id: 'gallery_08', num: '08', name: 'تلاقی رسانه‌ها' },
    ];

    const nextLocked = sequence.find((g) => !isGalleryReached(g.id));
    if (nextLocked) {
      markGalleryManuallyUnlocked(nextLocked.id);
      markGalleryReached(nextLocked.id);
      unlockedGalleryNumber = nextLocked.num;
      unlockedGalleryName = nextLocked.name;
    } else {
      // All later galleries already unlocked
      unlockedGalleryNumber = 'همگی باز هستند';
      unlockedGalleryName = 'همه تالارها در دسترس هستند';
    }
  }

  // 4. Unlock stars in Gallery 03
  if (prize.type === 'gallery03_stars') {
    // Gallery 03 has star-07 in dataset / maps
    unlockStarPointDiscovery('star-07', 'info');
    unlockStarPointDiscovery('star-q-07', 'info');
  }

  // 5. Unlock first experience in Gallery 03
  if (prize.type === 'gallery03_first_experience') {
    // First experience in Gallery 03 canonical list is experience_2 (exp-g03-frame)
    let firstExpTitle = 'قرن ۱۹ عکاسخانه';
    let targetExpId = 'experience_2';

    try {
      const g03Exps = contentService.getExperiencesForGallery('gallery-03');
      if (g03Exps && g03Exps.length > 0) {
        targetExpId = g03Exps[0].experienceId || g03Exps[0].id;
        firstExpTitle = g03Exps[0].title || g03Exps[0].labelFa || firstExpTitle;
      } else if (GALLERY_03_EXPERIENCE_DEFS.length > 0) {
        targetExpId = GALLERY_03_EXPERIENCE_DEFS[0].experienceId || GALLERY_03_EXPERIENCE_DEFS[0].id;
        firstExpTitle = GALLERY_03_EXPERIENCE_DEFS[0].title || GALLERY_03_EXPERIENCE_DEFS[0].labelFa || firstExpTitle;
      }
    } catch {
      // fallback
    }

    markExperienceUnlockedDirectly(targetExpId);
    markExperienceUnlockedDirectly('exp-g03-frame');
    unlockedExperienceName = firstExpTitle;
  }

  const updated: LuckMachineState = {
    hasSpun: true,
    selectedCellIndex: cellIndex,
    prizeId: prize.id,
    prizeName: prize.name,
    prizeType: prize.type,
    coinsAwarded,
    cafeCode,
    cafeDiscountPercent,
    unlockedGalleryNumber,
    unlockedGalleryName,
    unlockedExperienceName,
    completedAt: new Date().toISOString(),
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_LUCK_MACHINE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('museum_luck_machine_updated', {
          detail: updated,
        })
      );
    }
  } catch (err) {
    console.error('Error saving Luck Machine spin result:', err);
  }

  return updated;
}

/**
 * Resets the Luck Machine state (called during full game reset).
 * Preserves permanent won reward across regular game reset.
 */
export function resetLuckMachineState(force: boolean = false): void {
  try {
    const current = getLuckMachineState();
    // Do not clear permanent luck machine completion and reward on regular game reset
    if (current.hasSpun && !force) {
      return;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_LUCK_MACHINE_KEY);
      localStorage.removeItem(STORAGE_CAFE_CODES_KEY);
      window.dispatchEvent(
        new CustomEvent('museum_luck_machine_updated', {
          detail: { ...DEFAULT_STATE },
        })
      );
    }
  } catch (err) {
    console.error('Error resetting Luck Machine state:', err);
  }
}
