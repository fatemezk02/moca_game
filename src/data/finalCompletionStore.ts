import { isGalleryPuzzleCompleted, getPuzzleProgress } from './puzzleProgressStore';

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

// In-session tracking to avoid duplicate auto-transition sequences
let certificateSequenceTimer: NodeJS.Timeout | null = null;
let hasCertificateSequenceTriggeredInSession = false;

/**
 * Opens the independent final certificate modal.
 */
export function openFinalCertificateModal(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('museum_open_final_certificate'));
  }
}

/**
 * Closes the independent final certificate modal.
 */
export function closeFinalCertificateModal(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('museum_close_final_certificate'));
  }
}

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
  return false;
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
 * Independent of stars, star counts, or star modal state.
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
 * Calculates authoritative overall game progress (percentage, completed galleries count, etc.)
 */
export function getOverallGameProgress(): {
  completedGalleriesCount: number;
  totalGalleries: number;
  percentage: number;
  isAllComplete: boolean;
} {
  const completedCount = ALL_8_GALLERY_IDS.filter((id) =>
    isGalleryPuzzleCompleted(id)
  ).length;

  const progressDb = getPuzzleProgress();
  let collectedPiecesCount = 0;
  for (const gId of ALL_8_GALLERY_IDS) {
    const canon = gId === 'gallery-01' ? 'gallery_02' : gId.replace('-', '_');
    if (isGalleryPuzzleCompleted(gId)) {
      collectedPiecesCount += 3;
    } else {
      const pieces = progressDb[canon]?.collectedPieces;
      collectedPiecesCount += Array.isArray(pieces) ? pieces.length : 0;
    }
  }

  const isAllDone =
    completedCount >= 8 ||
    areAll8GalleryPuzzlesCompleted() ||
    isFinalCompletionAwarded();

  let percentage = 0;
  if (isAllDone) {
    percentage = 100;
  } else {
    // Total pieces across all 8 galleries is 24 (8 * 3 = 24)
    percentage = Math.min(99, Math.round((collectedPiecesCount / 24) * 100));
  }

  return {
    completedGalleriesCount: isAllDone ? 8 : completedCount,
    totalGalleries: 8,
    percentage,
    isAllComplete: isAllDone,
  };
}

/**
 * Starts the final certificate sequence:
 * - Commits final completion awarded
 * - Dispatches sequence started event
 * - Waits 2 seconds
 * - Opens the independent Certificate modal
 */
export function startFinalCertificateSequence(): void {
  setFinalCompletionAwarded();
  hasCertificateSequenceTriggeredInSession = true;

  console.log('[FINAL CERTIFICATE] All 8 puzzles completed. Sequence started (waiting 2s)...');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('museum_final_certificate_sequence_started', {
        detail: { timestamp: Date.now() },
      })
    );
  }

  if (certificateSequenceTimer) {
    clearTimeout(certificateSequenceTimer);
  }

  certificateSequenceTimer = setTimeout(() => {
    console.log('[FINAL CERTIFICATE] 2 seconds elapsed. Opening independent Certificate modal.');
    openFinalCertificateModal();
    certificateSequenceTimer = null;
  }, 2000);
}

/**
 * Checks whether all required puzzles have been completed and starts the sequence if so.
 * This is triggered ONLY by puzzle completion / puzzle progression events.
 */
export function checkAndTriggerFinalCertificate(force = false): boolean {
  const allCompleted = areAll8GalleryPuzzlesCompleted();

  if (!allCompleted) {
    return false;
  }

  // Prevent repeated auto-triggers in the same session unless forced
  if (!force && (hasCertificateSequenceTriggeredInSession || isFinalCompletionAwarded())) {
    return true;
  }

  startFinalCertificateSequence();
  return true;
}

/**
 * Backward compatibility alias for any existing callers.
 * Evaluates puzzle completion state only (stars are completely ignored).
 */
export function evaluateAndTriggerFinalCompletion(_galleryId?: string): boolean {
  return checkAndTriggerFinalCertificate();
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
  hasCertificateSequenceTriggeredInSession = false;
  if (certificateSequenceTimer) {
    clearTimeout(certificateSequenceTimer);
    certificateSequenceTimer = null;
  }
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

// Global listener: whenever puzzle progress or puzzle completion occurs,
// evaluate if all 8 required puzzles are complete.
if (typeof window !== 'undefined') {
  const handlePuzzleUpdate = () => {
    if (areAll8GalleryPuzzlesCompleted()) {
      checkAndTriggerFinalCertificate();
    }
  };

  window.addEventListener('museum_puzzle_progress_updated', handlePuzzleUpdate);
  window.addEventListener('museum_completed_gallery_puzzles_updated', handlePuzzleUpdate);
}
