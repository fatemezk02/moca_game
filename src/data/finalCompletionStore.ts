import { isGalleryPuzzleCompleted, markGalleryPuzzleCompleted } from './puzzleProgressStore';

export const STORAGE_FINAL_COMPLETION_AWARDED = 'museum_final_completion_awarded';
export const STORAGE_FINAL_CARD_CODE = 'museum_final_card_code';
export const STORAGE_FINAL_CARD_CLAIMED = 'museum_final_card_claimed';

/**
 * List of the prerequisite 7 gallery IDs before Gallery 09
 */
export const PREREQUISITE_GALLERY_IDS = [
  'gallery-01',
  'gallery-03',
  'gallery-04',
  'gallery-05',
  'gallery-06',
  'gallery-07',
  'gallery-08',
];

/**
 * All 8 galleries that have puzzles in the game
 */
export const ALL_8_GALLERY_IDS = [
  'gallery-01',
  'gallery-03',
  'gallery-04',
  'gallery-05',
  'gallery-06',
  'gallery-07',
  'gallery-08',
  'gallery-09',
];

/**
 * Checks whether the final completion card has already been awarded.
 */
export function isFinalCompletionAwarded(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (localStorage.getItem(STORAGE_FINAL_COMPLETION_AWARDED) === 'true') {
        return true;
      }
    }
  } catch (err) {
    console.error('Error reading final completion awarded status:', err);
  }
  return areAll8GalleryPuzzlesCompleted();
}

/**
 * Marks the final completion card as permanently awarded.
 */
export function setFinalCompletionAwarded(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_FINAL_COMPLETION_AWARDED, 'true');
      window.dispatchEvent(
        new CustomEvent('museum_final_completion_awarded', {
          detail: { timestamp: Date.now() },
        })
      );
    }
  } catch (err) {
    console.error('Error saving final completion awarded status:', err);
  }
}

/**
 * Checks whether all 7 prerequisite gallery puzzles (Galleries 01 to 08) are completed.
 */
export function areAllPrerequisitePuzzlesCompleted(): boolean {
  const candidatePrereqs = [
    'gallery-01',
    'gallery-02',
    'gallery-03',
    'gallery-04',
    'gallery-05',
    'gallery-06',
    'gallery-07',
    'gallery-08',
  ];
  const completed = new Set(
    candidatePrereqs
      .filter((id) => isGalleryPuzzleCompleted(id))
      .map((id) => (id === 'gallery-02' ? 'gallery-01' : id))
  );
  return completed.size >= 7;
}

/**
 * Checks whether all 8 gallery puzzles in the museum are completed.
 */
export function areAll8GalleryPuzzlesCompleted(): boolean {
  const candidateGalleries = [
    'gallery-01',
    'gallery-02',
    'gallery-03',
    'gallery-04',
    'gallery-05',
    'gallery-06',
    'gallery-07',
    'gallery-08',
    'gallery-09',
  ];
  const completed = new Set(
    candidateGalleries
      .filter((id) => isGalleryPuzzleCompleted(id))
      .map((id) => (id === 'gallery-02' ? 'gallery-01' : id))
  );
  return completed.size >= 8;
}

/**
 * Evaluates whether answering this Star question in Gallery 09 triggers the final completion flow.
 * Trigger conditions:
 * - The player is in Gallery 09
 * - The final Star question is answered correctly
 * - Completes and commits the 8th puzzle (Gallery 09) to existing game progress state
 * - Verifies all 8 required gallery puzzles are now complete
 */
export function evaluateAndTriggerFinalCompletion(galleryId?: string): boolean {
  if (galleryId) {
    const norm = galleryId.toLowerCase().replace('_', '-');
    if (norm === 'gallery-09') {
      markGalleryPuzzleCompleted('gallery-09');
    }
  }

  // Query the actual newly completed final state from the existing source of truth
  const completedGalleries = ALL_8_GALLERY_IDS.filter((id) => isGalleryPuzzleCompleted(id));
  const allCompleted = completedGalleries.length >= 8 || areAll8GalleryPuzzlesCompleted();

  console.log('[FINAL CERTIFICATE] Completed puzzles:', completedGalleries, 'Total count:', completedGalleries.length);
  console.log('[FINAL CERTIFICATE] All 8 puzzles completed:', allCompleted);

  if (!allCompleted) {
    return false;
  }

  console.log('[FINAL CERTIFICATE] Final completion detected', {
    galleryId: galleryId || 'all-8',
    completedPuzzles: completedGalleries,
  });

  // Persist that the final completion has been awarded
  setFinalCompletionAwarded();
  return true;
}

/**
 * Returns the persisted 4-letter final card code if already generated.
 */
export function getFinalCardCode(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(STORAGE_FINAL_CARD_CODE);
    }
  } catch (err) {
    console.error('Error reading final card code:', err);
  }
  return null;
}

/**
 * Checks if the user has already tapped «دریافت کارت».
 */
export function isFinalCardClaimed(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(STORAGE_FINAL_CARD_CLAIMED) === 'true';
    }
  } catch (err) {
    console.error('Error reading final card claimed status:', err);
  }
  return false;
}

/**
 * Generates and persists a unique 4-letter uppercase English alphabet code.
 * Guaranteed to generate only once and never change on reopen or refresh.
 */
export function generateAndSaveFinalCardCode(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = localStorage.getItem(STORAGE_FINAL_CARD_CODE);
      if (existing && existing.trim().length === 4) {
        return existing.trim();
      }

      // Generate exactly 4 English uppercase letters
      const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 4; i++) {
        const idx = Math.floor(Math.random() * letters.length);
        code += letters[idx];
      }

      localStorage.setItem(STORAGE_FINAL_CARD_CODE, code);
      localStorage.setItem(STORAGE_FINAL_CARD_CLAIMED, 'true');

      window.dispatchEvent(
        new CustomEvent('museum_final_card_code_generated', {
          detail: { code },
        })
      );

      return code;
    }
  } catch (err) {
    console.error('Error generating and saving final card code:', err);
  }

  return 'EXPL';
}

/**
 * Resets the final completion state (for testing/game reset).
 */
export function resetFinalCompletionState(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_FINAL_COMPLETION_AWARDED);
      localStorage.removeItem(STORAGE_FINAL_CARD_CODE);
      localStorage.removeItem(STORAGE_FINAL_CARD_CLAIMED);
    }
  } catch (err) {
    console.error('Error resetting final completion state:', err);
  }
}
