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

export interface LuckPrize {
  id: string;
  name: string;
  type:
    | 'empty'
    | 'visual_puzzle'
    | 'coins'
    | 'cafe_discount'
    | 'museum_ticket'
    | 'postcard_discount'
    | 'free_postcard';
  coins?: number;
  icon: string;
  badgeText?: string;
  description?: string;
}

export const LUCK_PRIZES: LuckPrize[] = [
  { id: 'prize_empty_1', name: 'پوچ', type: 'empty', icon: '💨' },
  { id: 'prize_empty_2', name: 'پوچ', type: 'empty', icon: '💨' },
  { id: 'prize_empty_3', name: 'پوچ', type: 'empty', icon: '💨' },
  { id: 'prize_puzzle_1', name: 'معمای تصویری', type: 'visual_puzzle', icon: '🧩' },
  { id: 'prize_puzzle_2', name: 'معمای تصویری', type: 'visual_puzzle', icon: '🧩' },
  { id: 'prize_puzzle_3', name: 'معمای تصویری', type: 'visual_puzzle', icon: '🧩' },
  { id: 'prize_coins_30', name: '۳۰ سکهٔ بازی', type: 'coins', coins: 30, icon: '🪙' },
  { id: 'prize_cafe_20', name: 'تخفیف ۲۰٪ کافه', type: 'cafe_discount', icon: '☕' },
  { id: 'prize_coins_10', name: '۱۰ سکهٔ بازی', type: 'coins', coins: 10, icon: '🪙' },
  { id: 'prize_ticket', name: 'بلیت رایگان موزه', type: 'museum_ticket', icon: '🎟️' },
  { id: 'prize_postcard_50', name: 'تخفیف ۵۰٪ کارت‌پستال', type: 'postcard_discount', icon: '✉️' },
  { id: 'prize_postcard_free', name: 'کارت‌پستال رایگان', type: 'free_postcard', icon: '📯' },
];

export interface LuckMachineState {
  hasSpun: boolean;
  selectedCellIndex: number | null;
  prizeId: string | null;
  prizeName: string | null;
  prizeType: string | null;
  coinsAwarded?: number;
  completedAt: string | null;
}

const STORAGE_LUCK_MACHINE_KEY = 'museum_luck_machine_state';

const DEFAULT_STATE: LuckMachineState = {
  hasSpun: false,
  selectedCellIndex: null,
  prizeId: null,
  prizeName: null,
  prizeType: null,
  completedAt: null,
};

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
export const LUCK_MACHINE_ENABLED = false;

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
 * Saves the spin result once and awards coins if applicable.
 * Idempotent: will not double-award if already spun.
 */
export function saveLuckMachineSpinResult(cellIndex: number, prize: LuckPrize): LuckMachineState {
  const current = getLuckMachineState();
  if (current.hasSpun) {
    return current;
  }

  let coinsAwarded = 0;
  if (prize.type === 'coins' && prize.coins) {
    coinsAwarded = prize.coins;
    awardCoins(coinsAwarded);
  }

  const updated: LuckMachineState = {
    hasSpun: true,
    selectedCellIndex: cellIndex,
    prizeId: prize.id,
    prizeName: prize.name,
    prizeType: prize.type,
    coinsAwarded: coinsAwarded > 0 ? coinsAwarded : undefined,
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
 */
export function resetLuckMachineState(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_LUCK_MACHINE_KEY);
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
