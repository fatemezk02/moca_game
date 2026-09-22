import confetti from 'canvas-confetti';
import {
  isGalleryPuzzleCompleted,
  getPuzzleProgress,
  getCompletedPuzzlePoints,
  toCanonicalGalleryId,
} from './puzzleProgressStore';

export const STORAGE_FINAL_COMPLETION_AWARDED = 'museum_final_completion_awarded';
export const STORAGE_FINAL_CARD_CODE = 'museum_final_card_code';
export const STORAGE_FINAL_CARD_CLAIMED = 'museum_final_card_claimed';
export const STORAGE_EXPLORER_CONFETTI_SHOWN = 'museum_explorer_confetti_shown';

/**
 * List of the prerequisite 7 gallery IDs before Gallery 08
 */
export const PREREQUISITE_GALLERY_IDS = [
  'gallery-01',
  'gallery-02',
  'gallery-03',
  'gallery-04',
  'gallery-05',
  'gallery-06',
  'gallery-07',
];

/**
 * All 8 galleries that have puzzles in the game (Gallery 01 to Gallery 08)
 */
export const ALL_8_GALLERY_IDS = [
  'gallery-01',
  'gallery-02',
  'gallery-03',
  'gallery-04',
  'gallery-05',
  'gallery-06',
  'gallery-07',
  'gallery-08',
];

/**
 * All 24 required unique puzzle point IDs across the 8 galleries
 */
export const ALL_24_REQUIRED_PUZZLE_POINT_IDS = [
  'puzzle-point-01',
  'puzzle-point-02',
  'puzzle-point-03',
  'puzzle-g03-point-01',
  'puzzle-g03-point-02',
  'puzzle-g03-point-03',
  'puzzle-g04-point-01',
  'puzzle-g04-point-02',
  'puzzle-g04-point-03',
  'puzzle-g05-point-01',
  'puzzle-g05-point-02',
  'puzzle-g05-point-03',
  'puzzle-g06-point-01',
  'puzzle-g06-point-02',
  'puzzle-g06-point-03',
  'puzzle-g07-point-01',
  'puzzle-g07-point-02',
  'puzzle-g07-point-03',
  'puzzle-g08-point-01',
  'puzzle-g08-point-02',
  'puzzle-g08-point-03',
  'puzzle-g09-point-01',
  'puzzle-g09-point-02',
  'puzzle-g09-point-03',
];

// In-session tracking to avoid duplicate auto-transition sequences
let certificateSequenceTimer: NodeJS.Timeout | null = null;
let hasCertificateSequenceTriggeredInSession = false;
let hasExplorerConfettiTriggeredInSession = false;

/**
 * Checks if the confetti for the Museum Explorer card has already fired in this session/game.
 */
export function hasExplorerCardConfettiTriggered(): boolean {
  if (hasExplorerConfettiTriggeredInSession) return true;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(STORAGE_EXPLORER_CONFETTI_SHOWN) === 'true';
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Marks that the confetti for the Museum Explorer card has been fired.
 */
export function markExplorerCardConfettiTriggered(): void {
  hasExplorerConfettiTriggeredInSession = true;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_EXPLORER_CONFETTI_SHOWN, 'true');
    }
  } catch {
    // ignore
  }
}

/**
 * Triggers celebratory confetti falling in from BOTH the LEFT and RIGHT sides of the screen.
 * Triggers ONLY ONCE per game/session when the Museum Explorer card is first awarded/displayed.
 */
export function triggerMuseumExplorerConfetti(): void {
  if (typeof window === 'undefined') return;
  if (hasExplorerCardConfettiTriggered()) return;

  markExplorerCardConfettiTriggered();

  try {
    const colors = [
      '#d97706',
      '#f59e0b',
      '#fde047',
      '#991b1b',
      '#38bdf8',
      '#22c55e',
      '#ffffff',
    ];

    // Left cannon pointing toward center
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    // Right cannon pointing toward center
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    // Smooth follow-up burst after 180ms
    setTimeout(() => {
      try {
        confetti({
          particleCount: 30,
          angle: 55,
          spread: 60,
          origin: { x: 0.02, y: 0.7 },
          colors,
          zIndex: 9999,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 30,
          angle: 125,
          spread: 60,
          origin: { x: 0.98, y: 0.7 },
          colors,
          zIndex: 9999,
          disableForReducedMotion: true,
        });
      } catch {
        // safe fallback
      }
    }, 180);
  } catch {
    // safe fallback in case of iframe restrictions
  }
}

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
 * Checks whether all 7 prerequisite gallery puzzles (Galleries 01 to 07) are completed.
 */
export function areAllPrerequisitePuzzlesCompleted(): boolean {
  return PREREQUISITE_GALLERY_IDS.every((id) => isGalleryPuzzleCompleted(id));
}

/**
 * Checks whether all 8 gallery puzzles in the museum are completed.
 * Independent of stars, star counts, or star modal state.
 */
export function areAll8GalleryPuzzlesCompleted(): boolean {
  if (isFinalCompletionAwarded()) return true;

  const allGalleriesDone = ALL_8_GALLERY_IDS.every((id) => isGalleryPuzzleCompleted(id));
  if (allGalleriesDone) return true;

  const globalPoints = getCompletedPuzzlePoints();
  const allPointsDone = ALL_24_REQUIRED_PUZZLE_POINT_IDS.every((ptId) =>
    globalPoints.includes(ptId)
  );
  return allPointsDone;
}

/**
 * Calculates authoritative overall game progress (percentage, completed galleries count, completed puzzles count, etc.)
 */
export function getOverallGameProgress(): {
  completedGalleriesCount: number;
  totalGalleries: number;
  percentage: number;
  isAllComplete: boolean;
  completedPuzzlesCount: number;
  totalPuzzlesCount: number;
} {
  const completedGalleries = ALL_8_GALLERY_IDS.filter((id) => isGalleryPuzzleCompleted(id));
  const completedCount = completedGalleries.length;

  const progressDb = getPuzzleProgress();
  const globalCompletedPoints = getCompletedPuzzlePoints();

  const galleryPointMap: Record<string, string[]> = {
    'gallery-01': ['puzzle-point-01', 'puzzle-point-02', 'puzzle-point-03'],
    'gallery-02': ['puzzle-g03-point-01', 'puzzle-g03-point-02', 'puzzle-g03-point-03'],
    'gallery-03': ['puzzle-g04-point-01', 'puzzle-g04-point-02', 'puzzle-g04-point-03'],
    'gallery-04': ['puzzle-g05-point-01', 'puzzle-g05-point-02', 'puzzle-g05-point-03'],
    'gallery-05': ['puzzle-g06-point-01', 'puzzle-g06-point-02', 'puzzle-g06-point-03'],
    'gallery-06': ['puzzle-g07-point-01', 'puzzle-g07-point-02', 'puzzle-g07-point-03'],
    'gallery-07': ['puzzle-g08-point-01', 'puzzle-g08-point-02', 'puzzle-g08-point-03'],
    'gallery-08': ['puzzle-g09-point-01', 'puzzle-g09-point-02', 'puzzle-g09-point-03'],
  };

  let uniqueCompletedPuzzlePoints = 0;
  for (const gId of ALL_8_GALLERY_IDS) {
    if (isGalleryPuzzleCompleted(gId)) {
      uniqueCompletedPuzzlePoints += 3;
    } else {
      const canon = toCanonicalGalleryId(gId);
      const gProg = progressDb[canon] || progressDb[gId];
      const gPoints = Array.isArray(gProg?.completedPointIds) ? gProg.completedPointIds : [];
      const gPieces = Array.isArray(gProg?.collectedPieces) ? gProg.collectedPieces : [];
      const expectedPts = galleryPointMap[gId] || [];

      const completedPtsInGallery = expectedPts.filter(
        (pt) => globalCompletedPoints.includes(pt) || gPoints.includes(pt)
      ).length;

      uniqueCompletedPuzzlePoints += Math.max(completedPtsInGallery, Math.min(3, gPieces.length));
    }
  }

  const isCardAwarded = isFinalCompletionAwarded();
  const isAllDone =
    isCardAwarded ||
    completedCount >= 8 ||
    uniqueCompletedPuzzlePoints >= 24 ||
    areAll8GalleryPuzzlesCompleted();

  let percentage = 0;
  if (isAllDone || uniqueCompletedPuzzlePoints >= 24) {
    percentage = 100;
  } else {
    // Total pieces across all 8 galleries is 24 (8 * 3 = 24)
    percentage = Math.min(99, Math.round((uniqueCompletedPuzzlePoints / 24) * 100));
  }

  return {
    completedGalleriesCount: isAllDone ? 8 : completedCount,
    totalGalleries: 8,
    percentage,
    isAllComplete: isAllDone,
    completedPuzzlesCount: isAllDone ? 24 : Math.min(24, uniqueCompletedPuzzlePoints),
    totalPuzzlesCount: 24,
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
  hasExplorerConfettiTriggeredInSession = false;
  if (certificateSequenceTimer) {
    clearTimeout(certificateSequenceTimer);
    certificateSequenceTimer = null;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_FINAL_COMPLETION_AWARDED);
      localStorage.removeItem(STORAGE_FINAL_CARD_CODE);
      localStorage.removeItem(STORAGE_FINAL_CARD_CLAIMED);
      localStorage.removeItem(STORAGE_EXPLORER_CONFETTI_SHOWN);
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
