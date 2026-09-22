/**
 * Store for Tracking Galleries Reached by the Player
 *
 * Single source of truth for:
 * - Which galleries the player has already reached / unlocked
 * - Which galleries are still in the future ("اونهایی که در آینده بهش قرار برسه")
 * - Persisting reached status across sessions
 */

import { normalizeGalleryId } from '../services/content/mappers';
import { getCurrentGalleryId } from './playerLocationStore';
import { isGalleryPuzzleCompleted } from './puzzleProgressStore';

const STORAGE_REACHED_GALLERIES_KEY = 'museum_reached_galleries_v1';
const STORAGE_MANUALLY_UNLOCKED_KEY = 'museum_manually_unlocked_galleries_v1';

/**
 * Standard progression sequence of galleries in the museum:
 * 0. gallery_00 - Entrance Lobby & Master Floor Plan
 * 1. gallery_01 - Gallery 01 (Kimia-ye Noor)
 * 2. gallery_02 - Gallery 02 (Architectural Hall / Diplomatic Albums)
 * 3. gallery_03 - Gallery 03 (Sabt-e Davam-e Ma)
 * 4. gallery_04 - Gallery 04 (Zarb Ahang-e Shahr)
 * 5. gallery_05 - Gallery 05 (Dar Keshakesh-e Tamasha va Estila)
 * 6. gallery_06 - Gallery 06 (Gozar az Boroon be Daroon)
 * 7. gallery_07 - Gallery 07 (Avang-e Zaman)
 * 8. gallery_08 - Gallery 08 (Talaqi-ye Resaneha)
 */
export const CANONICAL_PROGRESSION_SEQUENCE: string[] = [
  'gallery_00',
  'gallery_01',
  'gallery_02',
  'gallery_03',
  'gallery_04',
  'gallery_05',
  'gallery_06',
  'gallery_07',
  'gallery_08',
];

/**
 * Retrieves the set of manually (coin-based) unlocked gallery canonical IDs
 */
export function getManuallyUnlockedGalleries(): Set<string> {
  const unlocked = new Set<string>();

  if (typeof window === 'undefined' || !window.localStorage) {
    return unlocked;
  }

  try {
    const raw = localStorage.getItem(STORAGE_MANUALLY_UNLOCKED_KEY);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => {
          const canon = normalizeGalleryId(id);
          if (canon) {
            unlocked.add(canon);
            unlocked.add(id);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to read manually unlocked galleries from localStorage:', err);
  }

  return unlocked;
}

/**
 * Marks a gallery as manually unlocked (e.g. via coins)
 */
export function markGalleryManuallyUnlocked(rawGalleryId: string): void {
  if (!rawGalleryId) return;
  const canon = normalizeGalleryId(rawGalleryId);
  if (!canon) return;

  const current = getManuallyUnlockedGalleries();
  current.add(canon);
  current.add(rawGalleryId);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(
        STORAGE_MANUALLY_UNLOCKED_KEY,
        JSON.stringify(Array.from(current))
      );
      localStorage.setItem(
        STORAGE_REACHED_GALLERIES_KEY,
        JSON.stringify(Array.from(current))
      );
    } catch (err) {
      console.warn('Failed to save manually unlocked galleries to localStorage:', err);
    }

    window.dispatchEvent(
      new CustomEvent('museum_gallery_manually_unlocked', {
        detail: { galleryId: canon },
      })
    );
    window.dispatchEvent(
      new CustomEvent('museum_player_progress_updated', {
        detail: { type: 'gallery_unlocked', galleryId: canon },
      })
    );
  }
}

/**
 * Checks if a gallery was manually unlocked (coin purchase)
 */
export function isGalleryManuallyUnlocked(rawGalleryId: string): boolean {
  if (!rawGalleryId) return false;
  const canon = normalizeGalleryId(rawGalleryId);
  const unlocked = getManuallyUnlockedGalleries();
  return unlocked.has(rawGalleryId) || (!!canon && unlocked.has(canon));
}

/**
 * Retrieves the set of reached gallery canonical IDs from localStorage
 */
export function getReachedGalleries(): Set<string> {
  const reached = new Set<string>();

  // Base accessible areas are always considered reached from the start
  reached.add('gallery_00');
  reached.add('gallery_01');

  if (typeof window === 'undefined' || !window.localStorage) {
    return reached;
  }

  try {
    const raw = localStorage.getItem(STORAGE_REACHED_GALLERIES_KEY);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => {
          const canon = normalizeGalleryId(id);
          if (canon) reached.add(canon);
        });
      }
    }
  } catch (err) {
    console.warn('Failed to read reached galleries from localStorage:', err);
  }

  return reached;
}

/**
 * Marks a gallery as reached by the player and persists it to localStorage
 */
export function markGalleryReached(rawGalleryId: string): void {
  if (!rawGalleryId) return;
  const canon = normalizeGalleryId(rawGalleryId);
  if (!canon) return;

  const current = getReachedGalleries();
  if (!current.has(canon)) {
    current.add(canon);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_REACHED_GALLERIES_KEY, JSON.stringify(Array.from(current)));
      } catch (err) {
        console.warn('Failed to save reached galleries to localStorage:', err);
      }
    }

    // Dispatch notification events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('museum_gallery_reached', {
          detail: { galleryId: canon },
        })
      );
      window.dispatchEvent(
        new CustomEvent('museum_player_progress_updated', {
          detail: { type: 'gallery_reached', galleryId: canon },
        })
      );
    }
  }
}

/**
 * Evaluates whether a gallery has been reached / unlocked by the player.
 *
 * Requirements:
 * - Gallery 01: Always unlocked from start
 * - Gallery N: Unlocked ONLY IF all required puzzles of Gallery (N-1) are completed
 *   OR the gallery was manually purchased with coins.
 */
export function isGalleryReached(rawGalleryId: string): boolean {
  if (!rawGalleryId) return true;
  const canon = normalizeGalleryId(rawGalleryId);
  if (!canon) return true;

  // 1. Lobby entrance & starting gallery 01 are unlocked from start
  if (canon === 'gallery_00' || canon === 'gallery_01') {
    return true;
  }

  // 2. Check manual coin unlock
  if (isGalleryManuallyUnlocked(rawGalleryId) || isGalleryManuallyUnlocked(canon)) {
    return true;
  }

  // 3. Check if all required puzzles of predecessor gallery are completed:
  if (canon === 'gallery_02') {
    return isGalleryPuzzleCompleted('gallery_01') || isGalleryPuzzleCompleted('gallery-01');
  }
  if (canon === 'gallery_03') {
    return (
      isGalleryPuzzleCompleted('gallery_02') ||
      isGalleryPuzzleCompleted('gallery-02') ||
      isGalleryPuzzleCompleted('gallery_03')
    );
  }
  if (canon === 'gallery_04') {
    return (
      isGalleryPuzzleCompleted('gallery_03') ||
      isGalleryPuzzleCompleted('gallery-03') ||
      isGalleryPuzzleCompleted('gallery_04')
    );
  }
  if (canon === 'gallery_05') {
    return (
      isGalleryPuzzleCompleted('gallery_04') ||
      isGalleryPuzzleCompleted('gallery-04') ||
      isGalleryPuzzleCompleted('gallery_05')
    );
  }
  if (canon === 'gallery_06') {
    return (
      isGalleryPuzzleCompleted('gallery_05') ||
      isGalleryPuzzleCompleted('gallery-05') ||
      isGalleryPuzzleCompleted('gallery_06')
    );
  }
  if (canon === 'gallery_07') {
    return isGalleryPuzzleCompleted('gallery_06') || isGalleryPuzzleCompleted('gallery-06') || isGalleryPuzzleCompleted('gallery-07');
  }
  if (canon === 'gallery_08') {
    return isGalleryPuzzleCompleted('gallery_07') || isGalleryPuzzleCompleted('gallery-07') || isGalleryPuzzleCompleted('gallery-08');
  }

  return false;
}

/**
 * Resets the reached galleries record (used during game reset)
 */
export function resetReachedGalleries(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_REACHED_GALLERIES_KEY);
      localStorage.removeItem(STORAGE_MANUALLY_UNLOCKED_KEY);
      localStorage.setItem('museum_active_gallery', 'gallery-00');
      localStorage.setItem('museum_current_gallery', 'gallery-00');
      localStorage.setItem('museum_player_current_gallery', 'gallery-01');
      localStorage.setItem('currentGalleryId', 'gallery-01');
    } catch (err) {
      console.warn('Failed to clear reached galleries from localStorage:', err);
    }
  }
}

