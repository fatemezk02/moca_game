/**
 * Persistent Puzzle Progress Store
 * Stores and manages collected puzzle pieces and completed puzzle points per gallery.
 */

export interface GalleryPuzzleProgress {
  collectedPieces: string[]; // List of collected puzzle piece IDs (e.g. ["gallery01-piece-01"])
  completedQuestions?: string[]; // List of completed question IDs
  completedPointIds?: string[]; // List of completed puzzle point IDs (e.g. ["puzzle-point-01", "puzzle-g03-point-01"])
  isCompleted?: boolean;
  completedAt?: string;
  updatedAt?: string;
}

export type PuzzleProgressDatabase = Record<string, GalleryPuzzleProgress>;

const STORAGE_PUZZLE_PROGRESS_KEY = 'museum_puzzle_progress';
const STORAGE_COMPLETED_GALLERIES_KEY = 'museum_completed_gallery_puzzles';
const STORAGE_COMPLETED_PUZZLE_POINTS_KEY = 'museum_completed_puzzle_points';

/**
 * Returns list of all completed puzzle point IDs from persistent storage
 */
export function getCompletedPuzzlePoints(): string[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_COMPLETED_PUZZLE_POINTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading completed puzzle points:', err);
  }
  return [];
}

/**
 * Checks whether a specific puzzle point has been completed by its unique ID.
 * Also checks fallback by galleryId and puzzlePieceId/questionId for robust backward compatibility.
 */
export function isPuzzlePointCompleted(
  pointId: string,
  galleryId?: string,
  puzzlePieceId?: string
): boolean {
  if (!pointId && !puzzlePieceId) return false;

  // 1. Check in global completed puzzle point IDs list
  if (pointId) {
    const completedList = getCompletedPuzzlePoints();
    if (completedList.includes(pointId)) {
      return true;
    }
  }

  // 2. Check in gallery progress completedPointIds or collectedPieces
  const progress = getPuzzleProgress();
  if (galleryId) {
    const canonId = toCanonicalGalleryId(galleryId);
    const galleryProgress = progress[canonId] || progress[galleryId];
    if (galleryProgress) {
      if (
        pointId &&
        Array.isArray(galleryProgress.completedPointIds) &&
        galleryProgress.completedPointIds.includes(pointId)
      ) {
        return true;
      }
      if (
        puzzlePieceId &&
        Array.isArray(galleryProgress.collectedPieces) &&
        galleryProgress.collectedPieces.includes(puzzlePieceId)
      ) {
        return true;
      }
    }
  } else {
    // Search across all galleries
    for (const gId in progress) {
      const gProg = progress[gId];
      if (
        pointId &&
        Array.isArray(gProg.completedPointIds) &&
        gProg.completedPointIds.includes(pointId)
      ) {
        return true;
      }
      if (
        puzzlePieceId &&
        Array.isArray(gProg.collectedPieces) &&
        gProg.collectedPieces.includes(puzzlePieceId)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Marks a puzzle point completed by its unique point ID, saving to localStorage
 * and updating the gallery's puzzle progress.
 */
export function markPuzzlePointCompleted(
  pointId: string,
  galleryId: string,
  puzzlePieceId?: string,
  questionId?: string
): void {
  if (!pointId && !puzzlePieceId) return;

  const canonId = toCanonicalGalleryId(galleryId);

  // 1. Save to global completed puzzle points list
  if (pointId) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const currentList = getCompletedPuzzlePoints();
        if (!currentList.includes(pointId)) {
          const nextList = [...currentList, pointId];
          localStorage.setItem(STORAGE_COMPLETED_PUZZLE_POINTS_KEY, JSON.stringify(nextList));
        }
      }
    } catch (e) {
      console.error('Error saving completed puzzle points:', e);
    }
  }

  // 2. Award puzzle piece and update gallery puzzle progress
  if (puzzlePieceId) {
    collectPuzzlePiece(galleryId, puzzlePieceId, questionId, pointId);
  } else {
    const currentDb = getPuzzleProgress();
    const currentProg = currentDb[canonId] || {
      collectedPieces: [],
      completedQuestions: [],
      completedPointIds: [],
    };
    const pointSet = new Set(currentProg.completedPointIds || []);
    if (pointId) pointSet.add(pointId);
    currentDb[canonId] = {
      ...currentProg,
      completedPointIds: Array.from(pointSet),
      updatedAt: new Date().toISOString(),
    };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_PUZZLE_PROGRESS_KEY, JSON.stringify(currentDb));
      }
    } catch (e) {
      console.error('Error saving puzzle progress:', e);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('museum_puzzle_progress_updated', {
          detail: { galleryId: canonId, pointId },
        })
      );
    }
  }
}

/**
 * Normalizes gallery ID to standard canonical format (e.g., 'gallery-01', 'gallery-03')
 */
export function toCanonicalGalleryId(galleryId: string): string {
  const clean = galleryId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.startsWith('gallery')) {
    const num = clean.replace('gallery', '');
    return `gallery-${num.padStart(2, '0')}`;
  }
  return galleryId.toLowerCase();
}

/**
 * Returns list of completed gallery puzzle IDs from persistent storage
 */
export function getCompletedGalleryPuzzles(): string[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw =
        localStorage.getItem(STORAGE_COMPLETED_GALLERIES_KEY) ||
        localStorage.getItem('completedGalleryPuzzles');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading completed gallery puzzles:', err);
  }
  return [];
}

/**
 * Retrieves the entire puzzle progress database from localStorage
 */
export function getPuzzleProgress(): PuzzleProgressDatabase {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_PUZZLE_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error reading puzzle progress from storage:', err);
  }
  return {};
}

/**
 * Checks whether a specific puzzle piece has already been collected
 */
export function isPuzzlePieceCollected(galleryId: string, puzzlePieceId: string): boolean {
  if (!galleryId || !puzzlePieceId) return false;
  const progress = getPuzzleProgress();
  const canonId = toCanonicalGalleryId(galleryId);
  const galleryProgress = progress[canonId] || progress[galleryId];
  if (!galleryProgress || !Array.isArray(galleryProgress.collectedPieces)) {
    return false;
  }
  return galleryProgress.collectedPieces.includes(puzzlePieceId);
}

/**
 * Checks whether a specific question has already been completed
 */
export function isPuzzleQuestionCompleted(galleryId: string, questionId: string): boolean {
  if (!galleryId || !questionId) return false;
  const progress = getPuzzleProgress();
  const canonId = toCanonicalGalleryId(galleryId);
  const galleryProgress = progress[canonId] || progress[galleryId];
  if (!galleryProgress || !Array.isArray(galleryProgress.completedQuestions)) {
    return false;
  }
  return galleryProgress.completedQuestions.includes(questionId);
}

/**
 * Returns the list of all collected puzzle pieces for a specific gallery
 */
export function getCollectedPiecesForGallery(galleryId: string): string[] {
  const progress = getPuzzleProgress();
  const canonId = toCanonicalGalleryId(galleryId);
  const galleryProgress = progress[canonId] || progress[galleryId];
  return galleryProgress?.collectedPieces || [];
}

/**
 * Checks whether the puzzle for a specific gallery has been completed:
 * 1. Progress database isCompleted flag
 * 2. Or completed gallery puzzles list in localStorage
 * 3. Or all 3 puzzle pieces (piece-01, piece-02, piece-03) have been collected
 */
export function isGalleryPuzzleCompleted(galleryId: string): boolean {
  const canonId = toCanonicalGalleryId(galleryId);
  const progress = getPuzzleProgress();
  const galleryProgress = progress[canonId] || progress[galleryId];

  if (galleryProgress?.isCompleted) {
    return true;
  }

  const completedList = getCompletedGalleryPuzzles();
  if (completedList.includes(canonId) || completedList.includes(galleryId)) {
    return true;
  }

  // Check if all 3 pieces are collected
  const collected = galleryProgress?.collectedPieces || [];
  const cleanId = canonId.replace('-', '');
  const requiredPieces = [
    `${cleanId}-piece-01`,
    `${cleanId}-piece-02`,
    `${cleanId}-piece-03`,
  ];
  const all3Collected = requiredPieces.every((p) => collected.includes(p));
  if (all3Collected) {
    return true;
  }

  return false;
}

/**
 * Marks a gallery puzzle as fully assembled and completed
 */
export function markGalleryPuzzleCompleted(galleryId: string): void {
  const canonId = toCanonicalGalleryId(galleryId);
  const currentDb = getPuzzleProgress();
  const currentGalleryProgress = currentDb[canonId] || {
    collectedPieces: [],
    completedQuestions: [],
  };

  currentDb[canonId] = {
    ...currentGalleryProgress,
    isCompleted: true,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_PUZZLE_PROGRESS_KEY, JSON.stringify(currentDb));
      const completedList = getCompletedGalleryPuzzles();
      if (!completedList.includes(canonId)) {
        const next = [...completedList, canonId];
        localStorage.setItem(STORAGE_COMPLETED_GALLERIES_KEY, JSON.stringify(next));
        localStorage.setItem('completedGalleryPuzzles', JSON.stringify(next));
      }
    }
  } catch (err) {
    console.error('Error saving gallery completed puzzle:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('museum_puzzle_progress_updated', {
        detail: { galleryId: canonId, isCompleted: true },
      })
    );
  }
}

/**
 * Awards a puzzle piece to the player and persists it to localStorage.
 * Automatically marks the gallery puzzle complete if all 3 pieces are now collected.
 */
export function collectPuzzlePiece(
  galleryId: string,
  puzzlePieceId: string,
  questionId?: string,
  pointId?: string
): void {
  if (!galleryId || !puzzlePieceId) return;

  const canonId = toCanonicalGalleryId(galleryId);
  const currentDb = getPuzzleProgress();
  const currentGalleryProgress = currentDb[canonId] || {
    collectedPieces: [],
    completedQuestions: [],
    completedPointIds: [],
  };

  const collectedPiecesSet = new Set(currentGalleryProgress.collectedPieces || []);
  collectedPiecesSet.add(puzzlePieceId);

  const completedQuestionsSet = new Set(currentGalleryProgress.completedQuestions || []);
  if (questionId) {
    completedQuestionsSet.add(questionId);
  }

  const completedPointIdsSet = new Set(currentGalleryProgress.completedPointIds || []);
  if (pointId) {
    completedPointIdsSet.add(pointId);
  }

  const collectedList = Array.from(collectedPiecesSet);
  const cleanId = canonId.replace('-', '');
  const requiredPieces = [
    `${cleanId}-piece-01`,
    `${cleanId}-piece-02`,
    `${cleanId}-piece-03`,
  ];
  const all3Collected = requiredPieces.every((p) => collectedList.includes(p));
  const isCompleted = currentGalleryProgress.isCompleted || all3Collected;

  currentDb[canonId] = {
    ...currentGalleryProgress,
    collectedPieces: collectedList,
    completedQuestions: Array.from(completedQuestionsSet),
    completedPointIds: Array.from(completedPointIdsSet),
    isCompleted,
    completedAt: isCompleted ? (currentGalleryProgress.completedAt || new Date().toISOString()) : undefined,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_PUZZLE_PROGRESS_KEY, JSON.stringify(currentDb));
      if (pointId) {
        const currentPoints = getCompletedPuzzlePoints();
        if (!currentPoints.includes(pointId)) {
          localStorage.setItem(
            STORAGE_COMPLETED_PUZZLE_POINTS_KEY,
            JSON.stringify([...currentPoints, pointId])
          );
        }
      }
      if (isCompleted) {
        const completedList = getCompletedGalleryPuzzles();
        if (!completedList.includes(canonId)) {
          const next = [...completedList, canonId];
          localStorage.setItem(STORAGE_COMPLETED_GALLERIES_KEY, JSON.stringify(next));
          localStorage.setItem('completedGalleryPuzzles', JSON.stringify(next));
        }
      }
    }
  } catch (err) {
    console.error('Error saving puzzle progress to storage:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('museum_puzzle_progress_updated', {
        detail: { galleryId: canonId, puzzlePieceId, questionId, pointId, isCompleted },
      })
    );
  }
}

/**
 * Resets puzzle progress for one gallery or all galleries
 */
export function resetPuzzleProgress(galleryId?: string): void {
  const currentDb = getPuzzleProgress();
  if (galleryId) {
    const canonId = toCanonicalGalleryId(galleryId);
    delete currentDb[canonId];
  } else {
    for (const key of Object.keys(currentDb)) {
      delete currentDb[key];
    }
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_PUZZLE_PROGRESS_KEY, JSON.stringify(currentDb));
      if (!galleryId) {
        localStorage.removeItem(STORAGE_COMPLETED_GALLERIES_KEY);
        localStorage.removeItem('completedGalleryPuzzles');
        localStorage.removeItem(STORAGE_COMPLETED_PUZZLE_POINTS_KEY);
      } else {
        const canonId = toCanonicalGalleryId(galleryId);
        const completed = getCompletedGalleryPuzzles().filter((id) => id !== canonId);
        localStorage.setItem(STORAGE_COMPLETED_GALLERIES_KEY, JSON.stringify(completed));
        localStorage.setItem('completedGalleryPuzzles', JSON.stringify(completed));
      }
    }
  } catch (err) {
    console.error('Error resetting puzzle progress:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('museum_puzzle_progress_updated', {
        detail: { galleryId: galleryId || 'all' },
      })
    );
  }
}
