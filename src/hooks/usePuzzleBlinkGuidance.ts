import { useState, useEffect, useRef, useCallback } from 'react';
import { AdminPuzzlePoint } from '../types/admin';
import { isPuzzlePointCompleted } from '../data/puzzleProgressStore';

export interface UsePuzzleBlinkGuidanceProps {
  galleryId: string;
  puzzlePoints: AdminPuzzlePoint[];
  activePuzzlePoint: AdminPuzzlePoint | null;
}

/**
 * Custom hook to guide players to the next incomplete Puzzle Point in a gallery.
 *
 * Requirements handled:
 * 1. On gallery entry / re-entry:
 *    Wait until:
 *    - The gallery page is mounted,
 *    - Puzzle progress data is available,
 *    - Puzzle Points are rendered,
 *    - The first incomplete Puzzle Point is present in the DOM,
 *    and ONLY THEN start the two-blink animation after a small visible delay (400ms).
 *    The target Puzzle Point blinks visibly exactly TWO complete cycles, then returns to normal.
 * 2. On puzzle completion: when the modal closes, waits exactly 1 second (1000ms), then blinks
 *    the next incomplete puzzle point exactly 2 times.
 * 3. Does NOT blink if modal is closed without completion.
 * 4. Does NOT loop continuously.
 * 5. Does NOT lose entry animation due to React re-renders, layout recalculations, or asynchronous DOM mounting.
 * 6. Cleans up cleanly on unmount / navigation.
 */
export function usePuzzleBlinkGuidance({
  galleryId,
  puzzlePoints,
  activePuzzlePoint,
}: UsePuzzleBlinkGuidanceProps) {
  const [blinkingPointId, setBlinkingPointId] = useState<string | null>(null);

  // Keep track of active modal and whether it was completed during this modal session
  const prevActiveRef = useRef<AdminPuzzlePoint | null>(null);
  const completedDuringSessionRef = useRef<boolean>(false);
  const activePointWhenOpenedRef = useRef<AdminPuzzlePoint | null>(null);

  // Track gallery entry state:
  // hasTriggeredEntryForGalleryRef stores the galleryId once entry blink has fired (or all puzzles are completed)
  const hasTriggeredEntryForGalleryRef = useRef<string | null>(null);
  const isEntryScheduledRef = useRef<boolean>(false);

  // Timer references for robust cleanup
  const entryPollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track mount status so unmounted components don't execute timers
  const isMountedRef = useRef<boolean>(true);

  // Reset entry state if galleryId changes while component stays mounted
  const prevGalleryIdRef = useRef<string>(galleryId);
  if (prevGalleryIdRef.current !== galleryId) {
    prevGalleryIdRef.current = galleryId;
    hasTriggeredEntryForGalleryRef.current = null;
    isEntryScheduledRef.current = false;
    if (entryPollTimerRef.current) {
      clearTimeout(entryPollTimerRef.current);
      entryPollTimerRef.current = null;
    }
    if (entryDelayTimerRef.current) {
      clearTimeout(entryDelayTimerRef.current);
      entryDelayTimerRef.current = null;
    }
  }

  // Helper to trigger blink on a specific puzzle point
  const triggerBlink = useCallback((pointId: string) => {
    if (fallbackEndTimerRef.current) {
      clearTimeout(fallbackEndTimerRef.current);
      fallbackEndTimerRef.current = null;
    }

    setBlinkingPointId(pointId);

    // Fallback timer: 1300ms animation duration + 250ms buffer to safely reset if onAnimationEnd doesn't fire
    fallbackEndTimerRef.current = setTimeout(() => {
      setBlinkingPointId((curr) => (curr === pointId ? null : curr));
      fallbackEndTimerRef.current = null;
    }, 1550);
  }, []);

  const handleBlinkEnd = useCallback(() => {
    if (fallbackEndTimerRef.current) {
      clearTimeout(fallbackEndTimerRef.current);
      fallbackEndTimerRef.current = null;
    }
    setBlinkingPointId(null);
  }, []);

  // Helper to find the first incomplete puzzle point in defined gallery order
  const getFirstIncompletePoint = useCallback(() => {
    if (!puzzlePoints || puzzlePoints.length === 0) return null;
    return (
      puzzlePoints.find(
        (p) => !isPuzzlePointCompleted(p.id, p.galleryId || galleryId, p.puzzlePieceId)
      ) || null
    );
  }, [galleryId, puzzlePoints]);

  // Listen to puzzle progress events to detect if the currently open modal's puzzle was completed
  useEffect(() => {
    const handleProgressUpdate = (e: any) => {
      const detail = e?.detail;
      const currentOpen = activePointWhenOpenedRef.current;
      if (currentOpen) {
        if (
          detail?.pointId === currentOpen.id ||
          detail?.puzzlePieceId === currentOpen.puzzlePieceId ||
          isPuzzlePointCompleted(
            currentOpen.id,
            currentOpen.galleryId || galleryId,
            currentOpen.puzzlePieceId
          )
        ) {
          completedDuringSessionRef.current = true;
        }
      }
    };

    window.addEventListener('museum_puzzle_progress_updated', handleProgressUpdate);
    return () => {
      window.removeEventListener('museum_puzzle_progress_updated', handleProgressUpdate);
    };
  }, [galleryId]);

  // 1. Initial entry / re-entry:
  // Wait until:
  // 1. The gallery page is mounted,
  // 2. Puzzle progress data is available,
  // 3. Puzzle Points are rendered,
  // 4. The first incomplete Puzzle Point is present in the DOM,
  // and ONLY THEN start the two-blink animation after a small visible delay (400ms).
  useEffect(() => {
    // If already completed entry for this gallery, do not repeat
    if (hasTriggeredEntryForGalleryRef.current === galleryId) {
      return;
    }

    // If an entry delay timer is already scheduled and counting down, do NOT cancel it on re-renders!
    if (isEntryScheduledRef.current) {
      return;
    }

    // If puzzlePoints are not available yet, wait for next render
    if (!puzzlePoints || puzzlePoints.length === 0) {
      return;
    }

    // If modal is currently open on mount, do not run entry blink
    if (activePuzzlePoint) {
      return;
    }

    const firstIncomplete = getFirstIncompletePoint();
    if (!firstIncomplete) {
      // All puzzles in this gallery are already completed
      hasTriggeredEntryForGalleryRef.current = galleryId;
      return;
    }

    const targetId = firstIncomplete.id;
    let attempts = 0;
    const maxAttempts = 60; // 60 * 50ms = 3.0 seconds max polling

    const checkDomAndSchedule = () => {
      if (!isMountedRef.current) return;
      if (hasTriggeredEntryForGalleryRef.current === galleryId) return;
      if (isEntryScheduledRef.current) return;

      const domElement =
        document.querySelector(`[data-puzzle-point-id="${targetId}"]`) ||
        document.getElementById(`puzzle-point-${targetId}`) ||
        document.getElementById(targetId);

      if (domElement && document.body.contains(domElement)) {
        // First incomplete Puzzle Point is now verified present in the DOM!
        isEntryScheduledRef.current = true;

        // Add a small visible delay (400ms) after the gallery page & Puzzle Points are rendered
        // to guarantee that the user can actually see the animation clearly after entering
        entryDelayTimerRef.current = setTimeout(() => {
          entryDelayTimerRef.current = null;
          isEntryScheduledRef.current = false;

          if (!isMountedRef.current) return;

          // Verify element is still present in DOM before firing
          const el =
            document.querySelector(`[data-puzzle-point-id="${targetId}"]`) ||
            document.getElementById(`puzzle-point-${targetId}`) ||
            document.getElementById(targetId);

          if (el) {
            hasTriggeredEntryForGalleryRef.current = galleryId;
            triggerBlink(targetId);
          }
        }, 400);
      } else {
        attempts++;
        if (attempts < maxAttempts && isMountedRef.current) {
          entryPollTimerRef.current = setTimeout(checkDomAndSchedule, 50);
        }
      }
    };

    // Use requestAnimationFrame to begin checking right after the initial frame
    const frameId = requestAnimationFrame(() => {
      checkDomAndSchedule();
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (entryPollTimerRef.current) {
        clearTimeout(entryPollTimerRef.current);
        entryPollTimerRef.current = null;
      }
      // Note: entryDelayTimerRef is preserved across normal component re-renders
      // so a re-render does NOT cancel the visible entry blink.
    };
  }, [galleryId, puzzlePoints, activePuzzlePoint, getFirstIncompletePoint, triggerBlink]);

  // 2. Track opening and closing of puzzle modal (Post-Completion Flow)
  useEffect(() => {
    const prev = prevActiveRef.current;
    const curr = activePuzzlePoint;

    // Modal JUST opened (transition from null to point)
    if (!prev && curr) {
      // Clear any active blink or pending completion delay timer
      if (completionDelayTimerRef.current) {
        clearTimeout(completionDelayTimerRef.current);
        completionDelayTimerRef.current = null;
      }
      setBlinkingPointId(null);

      activePointWhenOpenedRef.current = curr;
      const alreadyCompleted = isPuzzlePointCompleted(
        curr.id,
        curr.galleryId || galleryId,
        curr.puzzlePieceId
      );
      completedDuringSessionRef.current = false;
      (activePointWhenOpenedRef.current as any)._wasAlreadyCompleted = alreadyCompleted;
    }

    // Modal JUST closed (transition from point to null)
    if (prev && !curr) {
      const openedPoint = activePointWhenOpenedRef.current;
      const wasAlreadyCompleted = (openedPoint as any)?._wasAlreadyCompleted;

      // Check if newly completed: either completedDuringSession flag or isPuzzlePointCompleted is now true
      const isCompletedNow = openedPoint
        ? isPuzzlePointCompleted(
            openedPoint.id,
            openedPoint.galleryId || galleryId,
            openedPoint.puzzlePieceId
          )
        : false;

      const justCompleted =
        openedPoint &&
        !wasAlreadyCompleted &&
        (completedDuringSessionRef.current || isCompletedNow);

      if (justCompleted) {
        // Wait exactly 1 second (1000ms) after modal is fully closed
        if (completionDelayTimerRef.current) {
          clearTimeout(completionDelayTimerRef.current);
        }
        completionDelayTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          // Find next incomplete puzzle point in defined order
          const nextIncomplete = getFirstIncompletePoint();
          if (nextIncomplete) {
            triggerBlink(nextIncomplete.id);
          }
          completionDelayTimerRef.current = null;
        }, 1000);
      }

      activePointWhenOpenedRef.current = null;
      completedDuringSessionRef.current = false;
    }

    prevActiveRef.current = curr;
  }, [activePuzzlePoint, galleryId, getFirstIncompletePoint, triggerBlink]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (entryPollTimerRef.current) clearTimeout(entryPollTimerRef.current);
      if (entryDelayTimerRef.current) clearTimeout(entryDelayTimerRef.current);
      if (completionDelayTimerRef.current) clearTimeout(completionDelayTimerRef.current);
      if (fallbackEndTimerRef.current) clearTimeout(fallbackEndTimerRef.current);
    };
  }, []);

  return {
    blinkingPointId,
    handleBlinkEnd,
  };
}
