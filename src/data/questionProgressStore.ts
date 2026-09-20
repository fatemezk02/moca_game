/**
 * Persistent Question Progress Store
 * Stores and manages question completion and answered states per gallery independently.
 */

import { getCompletedGalleryPuzzles } from './puzzleProgressStore';
import { getUnlockedInformationStarsCount } from './starPointProgressStore';
import { contentService } from '../services/content/contentService';

export interface GalleryQuestionProgress {
  completed: boolean;
  answeredQuestionsCount?: number;
  completedAt?: string;
}

export type QuestionProgressDatabase = Record<string, GalleryQuestionProgress>;

export interface PlayerStats {
  stars: number;
  coins: number;
  completedArtworksCount: number;
  totalAnsweredQuestions: number;
  completedPuzzles: number;
  puzzles: number;
}

const STORAGE_QUESTION_PROGRESS_KEY = 'museum_question_progress';
const STORAGE_SPENT_COINS_KEY = 'museum_spent_coins';
const STORAGE_BONUS_COINS_KEY = 'museum_bonus_coins';

/**
 * Retrieves total spent coins from localStorage
 */
export function getSpentCoins(): number {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_SPENT_COINS_KEY);
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        return isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    }
  } catch (err) {
    console.error('Error reading spent coins:', err);
  }
  return 0;
}

/**
 * Retrieves bonus/starter coins from localStorage
 */
export function getBonusCoins(): number {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_BONUS_COINS_KEY);
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        return isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
      // Initialize with 50 starter coins if first time playing so user has initial balance to test
      localStorage.setItem(STORAGE_BONUS_COINS_KEY, '50');
      return 50;
    }
  } catch (err) {
    console.error('Error reading bonus coins:', err);
  }
  return 50;
}

/**
 * Normalizes gallery ID to standard canonical format (e.g., 'gallery-01', 'gallery-03')
 */
function toCanonicalGalleryId(galleryId?: string): string {
  if (!galleryId || typeof galleryId !== 'string') return 'gallery-01';
  const clean = galleryId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.startsWith('gallery')) {
    const num = clean.replace('gallery', '');
    return `gallery-${num.padStart(2, '0')}`;
  }
  return galleryId.toLowerCase();
}

/**
 * Retrieves the entire progress database from localStorage
 */
export function getQuestionProgress(): QuestionProgressDatabase {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_QUESTION_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error reading question progress from storage:', err);
  }
  return {};
}

/**
 * Calculates current player stats across all galleries:
 * - stars = total answered questions (1 question = 1 star)
 * - completedArtworks = total completed galleries/artworks
 * - coins = completedArtworks * 50
 */
export function getPlayerStats(): PlayerStats {
  const progress = getQuestionProgress();
  const canonicalMap: Record<string, GalleryQuestionProgress> = {};

  for (const [key, value] of Object.entries(progress)) {
    if (!value || typeof value !== 'object') continue;
    const canonId = toCanonicalGalleryId(key);
    // Merge or pick highest progress
    const existing = canonicalMap[canonId];
    const isCompleted = Boolean(value.completed || existing?.completed);
    const count = Math.max(
      value.answeredQuestionsCount ?? (value.completed ? 3 : 0),
      existing?.answeredQuestionsCount ?? (existing?.completed ? 3 : 0)
    );
    canonicalMap[canonId] = {
      completed: isCompleted,
      answeredQuestionsCount: count,
    };
  }

  let totalAnsweredQuestions = 0;
  let completedArtworksCount = 0;

  for (const entry of Object.values(canonicalMap)) {
    const answered = entry.answeredQuestionsCount ?? (entry.completed ? 3 : 0);
    totalAnsweredQuestions += answered;
    if (entry.completed) {
      completedArtworksCount += 1;
    }
  }

  // Real-time unlocked stars count across all galleries
  let stars = 0;
  try {
    const activeStars = contentService.getStars().filter((s) => s.active !== false);
    stars = getUnlockedInformationStarsCount(activeStars.length > 0 ? activeStars : undefined);
  } catch {
    stars = getUnlockedInformationStarsCount();
  }

  const earnedCoins = completedArtworksCount * 50;
  const bonusCoins = getBonusCoins();
  const spentCoins = getSpentCoins();
  const coins = Math.max(0, earnedCoins + bonusCoins - spentCoins);
  const completedGalleryPuzzles = getCompletedGalleryPuzzles();
  const completedPuzzles = completedGalleryPuzzles.length;

  return {
    stars,
    coins,
    completedArtworksCount,
    totalAnsweredQuestions,
    completedPuzzles,
    puzzles: completedPuzzles,
  };
}

/**
 * Deducts a specified amount of coins from the player's balance if sufficient.
 * Returns true if successful, false if balance was insufficient.
 */
export function spendCoins(amount: number): boolean {
  try {
    const currentStats = getPlayerStats();
    if (currentStats.coins < amount) {
      return false;
    }

    const currentSpent = getSpentCoins();
    const newSpent = currentSpent + amount;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_SPENT_COINS_KEY, newSpent.toString());
      window.dispatchEvent(
        new CustomEvent('museum_player_stats_updated', {
          detail: getPlayerStats(),
        })
      );
    }
    return true;
  } catch (err) {
    console.error('Error spending coins:', err);
    return false;
  }
}

/**
 * Deducts a specified amount of coins from the player's current balance as a penalty.
 * Clamps deduction to current coin balance so balance never drops below zero.
 */
export function deductCoins(amount: number): number {
  try {
    if (amount <= 0) return 0;
    const currentStats = getPlayerStats();
    const actualDeduction = Math.min(currentStats.coins, amount);
    if (actualDeduction <= 0) return 0;

    const currentSpent = getSpentCoins();
    const newSpent = currentSpent + actualDeduction;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_SPENT_COINS_KEY, newSpent.toString());
      window.dispatchEvent(
        new CustomEvent('museum_player_stats_updated', {
          detail: getPlayerStats(),
        })
      );
    }
    return actualDeduction;
  } catch (err) {
    console.error('Error deducting coins:', err);
    return 0;
  }
}

/**
 * Awards coins to the player's balance (e.g. from discovery rewards).
 */
export function awardCoins(amount: number): void {
  try {
    const currentBonus = getBonusCoins();
    const newBonus = currentBonus + amount;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_BONUS_COINS_KEY, newBonus.toString());
      window.dispatchEvent(
        new CustomEvent('museum_player_stats_updated', {
          detail: getPlayerStats(),
        })
      );
    }
  } catch (err) {
    console.error('Error awarding coins:', err);
  }
}

/**
 * Checks whether the questions for a specific gallery have been completed
 */
export function isGalleryQuestionsCompleted(galleryId?: string): boolean {
  if (!galleryId) return false;
  const progress = getQuestionProgress();
  const canonId = toCanonicalGalleryId(galleryId);
  const rawId = typeof galleryId === 'string' ? galleryId.toLowerCase() : '';
  const normalizedKey = rawId.replace(/[^a-z0-9]/g, '');

  if (progress[canonId]?.completed) return true;
  if (progress[rawId]?.completed) return true;
  if (progress[normalizedKey]?.completed) return true;

  return false;
}

/**
 * Records individual answered question count for a gallery (1, 2, or 3)
 */
export function setGalleryAnsweredCount(galleryId: string, count: number): void {
  if (!galleryId) return;
  try {
    const progress = getQuestionProgress();
    const canonId = toCanonicalGalleryId(galleryId);
    const rawId = typeof galleryId === 'string' ? galleryId.toLowerCase() : '';
    const normalizedKey = rawId.replace(/[^a-z0-9]/g, '');

    const existing = progress[canonId] || progress[rawId] || progress[normalizedKey] || { completed: false };
    const entry: GalleryQuestionProgress = {
      ...existing,
      answeredQuestionsCount: Math.max(existing.answeredQuestionsCount || 0, count),
      completed: count >= 3 ? true : existing.completed,
    };

    progress[canonId] = entry;
    progress[rawId] = entry;
    progress[normalizedKey] = entry;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_QUESTION_PROGRESS_KEY, JSON.stringify(progress));
      window.dispatchEvent(
        new CustomEvent('museum_question_progress_updated', {
          detail: { galleryId, progress: entry },
        })
      );
      window.dispatchEvent(
        new CustomEvent('museum_player_stats_updated', {
          detail: getPlayerStats(),
        })
      );
    }
  } catch (err) {
    console.error('Error saving answered question count to storage:', err);
  }
}

/**
 * Sets the question completion status for a specific gallery and saves to localStorage
 */
export function setGalleryQuestionsCompleted(galleryId: string, completed = true): void {
  if (!galleryId) return;
  try {
    const progress = getQuestionProgress();
    const canonId = toCanonicalGalleryId(galleryId);
    const rawId = typeof galleryId === 'string' ? galleryId.toLowerCase() : '';
    const normalizedKey = rawId.replace(/[^a-z0-9]/g, '');
    const entry: GalleryQuestionProgress = {
      completed,
      answeredQuestionsCount: completed ? 3 : (progress[canonId]?.answeredQuestionsCount || 0),
      completedAt: new Date().toISOString(),
    };

    progress[canonId] = entry;
    progress[rawId] = entry;
    progress[normalizedKey] = entry;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_QUESTION_PROGRESS_KEY, JSON.stringify(progress));
      window.dispatchEvent(
        new CustomEvent('museum_question_progress_updated', {
          detail: { galleryId, completed },
        })
      );
      window.dispatchEvent(
        new CustomEvent('museum_player_stats_updated', {
          detail: getPlayerStats(),
        })
      );
    }
  } catch (err) {
    console.error('Error saving question progress to storage:', err);
  }
}

/**
 * Resets question completion for a specific gallery
 */
export function resetGalleryQuestionsProgress(galleryId: string): void {
  if (!galleryId) return;
  try {
    const progress = getQuestionProgress();
    const canonId = toCanonicalGalleryId(galleryId);
    const rawId = typeof galleryId === 'string' ? galleryId.toLowerCase() : '';
    const normalizedKey = rawId.replace(/[^a-z0-9]/g, '');
    delete progress[canonId];
    delete progress[rawId];
    delete progress[normalizedKey];

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_QUESTION_PROGRESS_KEY, JSON.stringify(progress));
      window.dispatchEvent(
        new CustomEvent('museum_question_progress_updated', {
          detail: { galleryId, completed: false },
        })
      );
      window.dispatchEvent(
        new CustomEvent('museum_player_stats_updated', {
          detail: getPlayerStats(),
        })
      );
    }
  } catch (err) {
    console.error('Error resetting question progress in storage:', err);
  }
}

/**
 * Completely resets all questions progress, resets spent coins, and restores bonus coins.
 */
export function resetAllQuestionsProgress(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_QUESTION_PROGRESS_KEY);
      localStorage.setItem(STORAGE_SPENT_COINS_KEY, '0');
      localStorage.setItem(STORAGE_BONUS_COINS_KEY, '50');
      window.dispatchEvent(
        new CustomEvent('museum_question_progress_updated', {
          detail: { galleryId: 'all', completed: false },
        })
      );
      window.dispatchEvent(
        new CustomEvent('museum_player_stats_updated', {
          detail: getPlayerStats(),
        })
      );
    }
  } catch (err) {
    console.error('Error resetting all question progress in storage:', err);
  }
}

