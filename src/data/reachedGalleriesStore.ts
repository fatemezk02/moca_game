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
import { isProgressionConditionsSatisfied } from './galleryProgressionStore';
import { isGalleryPuzzleCompleted } from './puzzleProgressStore';

const STORAGE_REACHED_GALLERIES_KEY = 'museum_reached_galleries_v1';

/**
 * Standard progression sequence of galleries in the museum:
 * 0. gallery_00 - Entrance Lobby & Master Floor Plan
 * 1. gallery_02 - Gallery 01 / 02 (Kimia-ye Noor / Architectural Hall)
 * 2. gallery_03 - Modern Hall / Diplomatic Albums
 * 3. gallery_04 - Sabt-e Davam-e Ma
 * 4. gallery_05 - Zarb Ahang-e Shahr
 * 5. gallery_06 - Dar Keshakesh-e Tamasha va Estila
 * 6. gallery_07 - Gozar az Boroon be Daroon
 * 7. gallery_08 - Avang-e Zaman
 * 8. gallery_09 - Talaqi-ye Resaneha
 */
export const CANONICAL_PROGRESSION_SEQUENCE: string[] = [
  'gallery_00',
  'gallery_02',
  'gallery_03',
  'gallery_04',
  'gallery_05',
  'gallery_06',
  'gallery_07',
  'gallery_08',
  'gallery_09',
];

/**
 * Retrieves the set of reached gallery canonical IDs from localStorage
 */
export function getReachedGalleries(): Set<string> {
  const reached = new Set<string>();

  // Base accessible areas are always considered reached from the start
  reached.add('gallery_00');
  reached.add('gallery_01');
  reached.add('gallery_02');

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

    // Also check saved active gallery in localStorage
    const savedActive = localStorage.getItem('museum_active_gallery');
    if (savedActive) {
      const canonActive = normalizeGalleryId(savedActive);
      if (canonActive) {
        reached.add(canonActive);
        // If saved gallery is further along, mark all preceding galleries reached
        const seqIdx = CANONICAL_PROGRESSION_SEQUENCE.indexOf(canonActive);
        if (seqIdx > 0) {
          for (let i = 0; i <= seqIdx; i++) {
            reached.add(CANONICAL_PROGRESSION_SEQUENCE[i]);
          }
        }
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

    // Also mark any preceding galleries in sequence as reached
    const seqIdx = CANONICAL_PROGRESSION_SEQUENCE.indexOf(canon);
    if (seqIdx > 0) {
      for (let i = 0; i <= seqIdx; i++) {
        current.add(CANONICAL_PROGRESSION_SEQUENCE[i]);
      }
    }

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

// Auto-track reached galleries whenever player location updates
if (typeof window !== 'undefined') {
  window.addEventListener('museum_player_location_updated', (e: any) => {
    const gid = e?.detail?.currentGalleryId;
    if (gid) {
      markGalleryReached(gid);
    }
  });
}


/**
 * Evaluates whether a gallery has been reached by the player.
 *
 * Returns:
 * - true: The player has reached / visited / unlocked this gallery
 * - false: The gallery is a future gallery that the player has not yet reached ("هنوز کاربر بهش نرسیده")
 */
export function isGalleryReached(rawGalleryId: string): boolean {
  if (!rawGalleryId) return true;
  const canon = normalizeGalleryId(rawGalleryId);
  if (!canon) return true;

  // 1. Lobby entrance & starting gallery 01 / 02 are reached from start
  if (canon === 'gallery_00' || canon === 'gallery_01' || canon === 'gallery_02') {
    return true;
  }

  // 2. Check persistent reached record
  const reachedSet = getReachedGalleries();
  if (reachedSet.has(canon)) {
    return true;
  }

  // 3. Check current player location
  const current = normalizeGalleryId(getCurrentGalleryId());
  if (current === canon) {
    return true;
  }

  // 4. If current location is further in sequence, all earlier galleries are reached
  const currentIndex = CANONICAL_PROGRESSION_SEQUENCE.indexOf(current);
  const targetIndex = CANONICAL_PROGRESSION_SEQUENCE.indexOf(canon);
  if (currentIndex !== -1 && targetIndex !== -1 && currentIndex >= targetIndex) {
    return true;
  }

  // 5. Check if the gallery was unlocked via progression satisfaction
  if (
    canon === 'gallery_03' &&
    (isProgressionConditionsSatisfied('gallery-01') ||
      isProgressionConditionsSatisfied('gallery-02') ||
      isGalleryPuzzleCompleted('gallery-01') ||
      isGalleryPuzzleCompleted('gallery-02'))
  ) {
    return true;
  }
  if (canon === 'gallery_04' && isProgressionConditionsSatisfied('gallery-03')) {
    return true;
  }
  if (canon === 'gallery_05' && isProgressionConditionsSatisfied('gallery-04')) {
    return true;
  }
  if (canon === 'gallery_06' && isProgressionConditionsSatisfied('gallery-05')) {
    return true;
  }

  // Otherwise, user has not reached this gallery yet
  return false;
}

/**
 * Resets the reached galleries record (used during game reset)
 */
export function resetReachedGalleries(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_REACHED_GALLERIES_KEY);
    } catch (err) {
      console.warn('Failed to clear reached galleries from localStorage:', err);
    }
  }
}
