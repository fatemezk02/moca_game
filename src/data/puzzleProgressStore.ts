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
const STORAGE_PUZZLE_WRONG_ATTEMPTS_KEY = 'museum_puzzle_wrong_attempts';

/**
 * Returns the number of incorrect attempts recorded for a specific puzzle ID / point ID.
 */
export function getPuzzleIncorrectAttempts(puzzleId: string): number {
  if (!puzzleId) return 0;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_PUZZLE_WRONG_ATTEMPTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return typeof parsed[puzzleId] === 'number' ? parsed[puzzleId] : 0;
        }
      }
    }
  } catch (err) {
    console.error('Error reading puzzle incorrect attempts:', err);
  }
  return 0;
}

/**
 * Records an incorrect answer attempt for a specific puzzle point/puzzle ID.
 * Returns the updated total number of incorrect attempts for this specific puzzle.
 */
export function recordPuzzleIncorrectAttempt(puzzleId: string): number {
  if (!puzzleId) return 0;
  try {
    let attemptsDb: Record<string, number> = {};
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_PUZZLE_WRONG_ATTEMPTS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            attemptsDb = parsed;
          }
        } catch {}
      }
      const newCount = (attemptsDb[puzzleId] || 0) + 1;
      attemptsDb[puzzleId] = newCount;
      localStorage.setItem(STORAGE_PUZZLE_WRONG_ATTEMPTS_KEY, JSON.stringify(attemptsDb));
      return newCount;
    }
  } catch (err) {
    console.error('Error recording puzzle incorrect attempt:', err);
  }
  return 1;
}

/**
 * Resets incorrect attempts for a specific puzzle or all puzzles.
 */
export function resetPuzzleIncorrectAttempts(puzzleId?: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (puzzleId) {
        const raw = localStorage.getItem(STORAGE_PUZZLE_WRONG_ATTEMPTS_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              delete parsed[puzzleId];
              localStorage.setItem(STORAGE_PUZZLE_WRONG_ATTEMPTS_KEY, JSON.stringify(parsed));
            }
          } catch {}
        }
      } else {
        localStorage.removeItem(STORAGE_PUZZLE_WRONG_ATTEMPTS_KEY);
      }
    }
  } catch (err) {
    console.error('Error resetting puzzle incorrect attempts:', err);
  }
}

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
    const legacyId = canonId.replace('_', '-');
    const checkIds = Array.from(new Set([canonId, legacyId, galleryId]));
    for (const id of checkIds) {
      const galleryProgress = progress[id];
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
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('museum_completed_puzzle_points_updated', {
                detail: { pointId, completedList: nextList },
              })
            );
          }
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
 * Normalizes gallery ID to standard canonical format (e.g., 'gallery_01', 'gallery_03')
 */
export function toCanonicalGalleryId(galleryId?: string): string {
  if (!galleryId || typeof galleryId !== 'string') return 'gallery_01';
  const clean = galleryId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.startsWith('gallery')) {
    const num = clean.replace('gallery', '');
    return `gallery_${num.padStart(2, '0')}`;
  }
  if (/^\d+$/.test(clean)) {
    return `gallery_${clean.padStart(2, '0')}`;
  }
  return galleryId.toLowerCase().replace(/-/g, '_');
}

/**
 * Normalizes any gallery ID to its unique canonical ID for completed gallery tracking.
 */
export function normalizeCanonicalGallery(galleryId?: string): string {
  if (!galleryId || typeof galleryId !== 'string') return 'gallery_01';
  return toCanonicalGalleryId(galleryId);
}

/**
 * Returns list of completed unique gallery puzzle IDs from persistent storage,
 * canonicalized and deduplicated so each completed gallery puzzle is counted exactly once.
 */
export function getCompletedGalleryPuzzles(): string[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw =
        localStorage.getItem(STORAGE_COMPLETED_GALLERIES_KEY) ||
        localStorage.getItem('completedGalleryPuzzles');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const uniqueSet = new Set<string>();
          for (const item of parsed) {
            if (typeof item === 'string' && item.trim()) {
              uniqueSet.add(normalizeCanonicalGallery(item));
            }
          }

          // Auto-heal: Verify whether each gallery in completed list truly completed its own puzzles
          const progress = getPuzzleProgress();
          const globalPoints = getCompletedPuzzlePoints();
          const galleryPointMap: Record<string, string[]> = {
            gallery_01: ['puzzle-point-01', 'puzzle-point-02', 'puzzle-point-03'],
            gallery_02: ['puzzle-g03-point-01', 'puzzle-g03-point-02', 'puzzle-g03-point-03'],
            gallery_03: ['puzzle-g04-point-01', 'puzzle-g04-point-02', 'puzzle-g04-point-03'],
            gallery_04: ['puzzle-g05-point-01', 'puzzle-g05-point-02', 'puzzle-g05-point-03'],
            gallery_05: ['puzzle-g06-point-01', 'puzzle-g06-point-02', 'puzzle-g06-point-03'],
            gallery_06: ['puzzle-g07-point-01', 'puzzle-g07-point-02', 'puzzle-g07-point-03'],
            gallery_07: ['puzzle-g08-point-01', 'puzzle-g08-point-02', 'puzzle-g08-point-03'],
            gallery_08: ['puzzle-g09-point-01', 'puzzle-g09-point-02', 'puzzle-g09-point-03'],
          };

          let modified = false;
          for (const gId of Array.from(uniqueSet)) {
            const gProg = progress[gId] || progress[gId.replace('_', '-')];
            const pieces = gProg?.collectedPieces || [];
            const points = gProg?.completedPointIds || [];
            const expectedPts = galleryPointMap[gId] || [];

            const hasGenuineCompletion =
              (pieces.length >= 3 && Boolean(gProg?.isCompleted)) ||
              (points.length >= 3 && Boolean(gProg?.isCompleted)) ||
              (expectedPts.length > 0 && expectedPts.every((pt) => globalPoints.includes(pt)));

            if (!hasGenuineCompletion) {
              uniqueSet.delete(gId);
              uniqueSet.delete(gId.replace('_', '-'));
              modified = true;
            }
          }

          if (modified) {
            const nextList = Array.from(uniqueSet);
            localStorage.setItem(STORAGE_COMPLETED_GALLERIES_KEY, JSON.stringify(nextList));
            localStorage.setItem('completedGalleryPuzzles', JSON.stringify(nextList));
          }

          return Array.from(uniqueSet);
        }
      }
    }
  } catch (err) {
    console.error('Error reading completed gallery puzzles:', err);
  }
  return [];
}

/**
 * Retrieves the entire puzzle progress database from localStorage,
 * automatically sanitizing any legacy cross-contamination between galleries.
 */
export function getPuzzleProgress(): PuzzleProgressDatabase {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_PUZZLE_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          let modified = false;

          // Auto-heal legacy bug: Remove spurious gallery_01 pieces/questions/points that leaked into gallery_02
          for (const g02Key of ['gallery_02', 'gallery-02']) {
            const g02Data = parsed[g02Key];
            if (g02Data) {
              const pieces = Array.isArray(g02Data.collectedPieces) ? g02Data.collectedPieces : [];
              const questions = Array.isArray(g02Data.completedQuestions) ? g02Data.completedQuestions : [];
              const points = Array.isArray(g02Data.completedPointIds) ? g02Data.completedPointIds : [];

              const genuinePieces = pieces.filter(
                (p: string) => !p.startsWith('gallery01-') && !p.startsWith('gallery-01-')
              );
              const genuineQuestions = questions.filter(
                (q: string) => q !== '1' && q !== '2' && q !== '3'
              );
              const genuinePoints = points.filter(
                (pt: string) => !['puzzle-point-01', 'puzzle-point-02', 'puzzle-point-03'].includes(pt)
              );

              if (
                genuinePieces.length !== pieces.length ||
                genuineQuestions.length !== questions.length ||
                genuinePoints.length !== points.length
              ) {
                g02Data.collectedPieces = genuinePieces;
                g02Data.completedQuestions = genuineQuestions;
                g02Data.completedPointIds = genuinePoints;
                if (genuinePieces.length < 3 && genuineQuestions.length < 3 && genuinePoints.length < 3) {
                  g02Data.isCompleted = false;
                }
                modified = true;
              }
            }
          }

          // Sanitize any gallery having isCompleted=true without actually collecting 3 pieces or points
          for (const key of Object.keys(parsed)) {
            const gData = parsed[key];
            if (gData && gData.isCompleted) {
              const pieces = Array.isArray(gData.collectedPieces) ? gData.collectedPieces : [];
              const points = Array.isArray(gData.completedPointIds) ? gData.completedPointIds : [];
              if (pieces.length < 3 && points.length < 3) {
                gData.isCompleted = false;
                modified = true;
              }
            }
          }

          if (modified) {
            localStorage.setItem(STORAGE_PUZZLE_PROGRESS_KEY, JSON.stringify(parsed));
          }

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
  if (!puzzlePieceId) return false;
  const progress = getPuzzleProgress();
  const canonId = galleryId ? toCanonicalGalleryId(galleryId) : '';
  const legacyId = canonId.replace('_', '-');

  const checkIds = Array.from(new Set([canonId, legacyId, galleryId].filter(Boolean)));

  if (checkIds.length > 0) {
    for (const id of checkIds) {
      const galleryProgress = progress[id];
      if (galleryProgress && Array.isArray(galleryProgress.collectedPieces)) {
        if (galleryProgress.collectedPieces.includes(puzzlePieceId)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Checks whether a specific question has already been completed
 */
export function isPuzzleQuestionCompleted(galleryId: string, questionId: string): boolean {
  if (!galleryId || !questionId) return false;
  const progress = getPuzzleProgress();
  const canonId = toCanonicalGalleryId(galleryId);
  const legacyId = canonId.replace('_', '-');

  const checkIds = Array.from(new Set([canonId, legacyId, galleryId]));

  for (const id of checkIds) {
    const galleryProgress = progress[id];
    if (galleryProgress && Array.isArray(galleryProgress.completedQuestions)) {
      if (galleryProgress.completedQuestions.includes(questionId)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns the list of all collected puzzle pieces for a specific gallery
 */
export function getCollectedPiecesForGallery(galleryId: string): string[] {
  const progress = getPuzzleProgress();
  const canonId = toCanonicalGalleryId(galleryId);
  const legacyId = canonId.replace('_', '-');

  const checkIds = Array.from(new Set([canonId, legacyId, galleryId]));

  const pieceSet = new Set<string>();
  for (const id of checkIds) {
    const pieces = progress[id]?.collectedPieces;
    if (Array.isArray(pieces)) {
      pieces.forEach((p) => pieceSet.add(p));
    }
  }

  return Array.from(pieceSet);
}

/**
 * Checks whether the puzzle for a specific gallery has been completed:
 * 1. Progress database isCompleted flag (verified with at least 3 collected pieces/points)
 * 2. Or completed gallery puzzles list in localStorage
 * 3. Or all 3 puzzle pieces have been collected in this specific gallery
 * 4. Or all 3 puzzle points for this gallery are in global completed list
 */
export function isGalleryPuzzleCompleted(galleryId?: string): boolean {
  if (!galleryId) return false;
  const canonId = toCanonicalGalleryId(galleryId);
  const legacyId = canonId.replace('_', '-');
  const uniqueCanonId = normalizeCanonicalGallery(galleryId);
  const progress = getPuzzleProgress();

  const relatedGalleryIds = Array.from(new Set([canonId, legacyId, galleryId, uniqueCanonId]));

  // 1. Check isCompleted flag
  for (const id of relatedGalleryIds) {
    const gProg = progress[id];
    if (gProg?.isCompleted) {
      const piecesCount = gProg.collectedPieces?.length || 0;
      const pointsCount = gProg.completedPointIds?.length || 0;
      if (piecesCount >= 3 || pointsCount >= 3) {
        return true;
      }
    }
  }

  // 2. Check completedList
  const completedList = getCompletedGalleryPuzzles();
  if (completedList.includes(uniqueCanonId)) return true;
  for (const id of relatedGalleryIds) {
    if (completedList.includes(id)) return true;
  }

  // 3. Check collected pieces count across related gallery IDs for THIS gallery only
  const allCollectedPieces: string[] = [];
  const allCompletedPoints: string[] = [];
  const allCompletedQuestions: string[] = [];

  for (const id of relatedGalleryIds) {
    if (Array.isArray(progress[id]?.collectedPieces)) {
      allCollectedPieces.push(...progress[id].collectedPieces);
    }
    if (Array.isArray(progress[id]?.completedPointIds)) {
      allCompletedPoints.push(...progress[id].completedPointIds);
    }
    if (Array.isArray(progress[id]?.completedQuestions)) {
      allCompletedQuestions.push(...progress[id].completedQuestions);
    }
  }

  if (
    new Set(allCollectedPieces).size >= 3 ||
    new Set(allCompletedPoints).size >= 3 ||
    new Set(allCompletedQuestions).size >= 3
  ) {
    return true;
  }

  // 4. Check specific piece IDs for this gallery
  const galleryPiecePrefixMap: Record<string, string[]> = {
    gallery_01: ['gallery01'],
    gallery_02: ['gallery03', 'gallery02'],
    gallery_03: ['gallery04'],
    gallery_04: ['gallery05'],
    gallery_05: ['gallery06'],
    gallery_06: ['gallery07'],
    gallery_07: ['gallery08'],
    gallery_08: ['gallery09'],
  };

  const candidatePrefixes = galleryPiecePrefixMap[canonId] || [canonId.replace(/[-_]/g, '')];

  for (const prefix of candidatePrefixes) {
    const required = [`${prefix}-piece-01`, `${prefix}-piece-02`, `${prefix}-piece-03`];
    if (required.every((p) => allCollectedPieces.includes(p))) {
      return true;
    }
  }

  // 5. Check global completed puzzle points for each gallery
  const globalCompletedPoints = getCompletedPuzzlePoints();
  const galleryPointMap: Record<string, string[]> = {
    gallery_01: ['puzzle-point-01', 'puzzle-point-02', 'puzzle-point-03'],
    gallery_02: ['puzzle-g03-point-01', 'puzzle-g03-point-02', 'puzzle-g03-point-03'],
    gallery_03: ['puzzle-g04-point-01', 'puzzle-g04-point-02', 'puzzle-g04-point-03'],
    gallery_04: ['puzzle-g05-point-01', 'puzzle-g05-point-02', 'puzzle-g05-point-03'],
    gallery_05: ['puzzle-g06-point-01', 'puzzle-g06-point-02', 'puzzle-g06-point-03'],
    gallery_06: ['puzzle-g07-point-01', 'puzzle-g07-point-02', 'puzzle-g07-point-03'],
    gallery_07: ['puzzle-g08-point-01', 'puzzle-g08-point-02', 'puzzle-g08-point-03'],
    gallery_08: ['puzzle-g09-point-01', 'puzzle-g09-point-02', 'puzzle-g09-point-03'],
  };

  const expectedPoints = galleryPointMap[canonId];
  if (expectedPoints && expectedPoints.every((pt) => globalCompletedPoints.includes(pt))) {
    return true;
  }

  return false;
}

/**
 * Marks a gallery puzzle as fully assembled and completed
 */
export function markGalleryPuzzleCompleted(galleryId: string): void {
  const canonId = toCanonicalGalleryId(galleryId);
  const uniqueCanonId = normalizeCanonicalGallery(galleryId);
  const currentDb = getPuzzleProgress();
  const currentGalleryProgress = currentDb[canonId] || currentDb[uniqueCanonId] || {
    collectedPieces: [],
    completedQuestions: [],
    completedPointIds: [],
  };

  const updatedProgress: GalleryPuzzleProgress = {
    ...currentGalleryProgress,
    isCompleted: true,
    completedAt: currentGalleryProgress.completedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  currentDb[canonId] = updatedProgress;
  currentDb[uniqueCanonId] = updatedProgress;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_PUZZLE_PROGRESS_KEY, JSON.stringify(currentDb));
      const completedList = getCompletedGalleryPuzzles();
      const nextList = Array.from(new Set([...completedList, uniqueCanonId, canonId]));
      localStorage.setItem(STORAGE_COMPLETED_GALLERIES_KEY, JSON.stringify(nextList));
      localStorage.setItem('completedGalleryPuzzles', JSON.stringify(nextList));
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
    window.dispatchEvent(
      new CustomEvent('museum_arrows_updated', {
        detail: { galleryId: canonId },
      })
    );
    window.dispatchEvent(
      new CustomEvent('museum_player_progress_updated', {
        detail: { type: 'puzzleCompleted', galleryId: canonId },
      })
    );
    window.dispatchEvent(
      new CustomEvent('museum_completed_gallery_puzzles_updated', {
        detail: { galleryId: canonId, isCompleted: true },
      })
    );
  }
}

/**
 * Awards a puzzle piece to the player and persists it to localStorage.
 * Automatically marks the gallery puzzle complete if all 3 pieces/questions are now collected.
 */
export function collectPuzzlePiece(
  galleryId: string,
  puzzlePieceId: string,
  questionId?: string,
  pointId?: string
): void {
  if (!galleryId || !puzzlePieceId) return;

  const canonId = toCanonicalGalleryId(galleryId);
  const uniqueCanonId = normalizeCanonicalGallery(galleryId);
  const currentDb = getPuzzleProgress();
  const currentGalleryProgress = currentDb[canonId] || currentDb[uniqueCanonId] || {
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
  const cleanId = canonId.replace(/[-_]/g, '');
  const candidatePrefixes = [cleanId];
  if (canonId === 'gallery_02') {
    candidatePrefixes.push('gallery03');
  }

  const all3Collected =
    candidatePrefixes.some((prefix) =>
      [`${prefix}-piece-01`, `${prefix}-piece-02`, `${prefix}-piece-03`].every((p) =>
        collectedList.includes(p)
      )
    ) ||
    collectedList.length >= 3 ||
    completedPointIdsSet.size >= 3 ||
    completedQuestionsSet.size >= 3;

  const isCompleted = currentGalleryProgress.isCompleted || all3Collected;

  const updatedGalleryData: GalleryPuzzleProgress = {
    ...currentGalleryProgress,
    collectedPieces: collectedList,
    completedQuestions: Array.from(completedQuestionsSet),
    completedPointIds: Array.from(completedPointIdsSet),
    isCompleted,
    completedAt: isCompleted ? (currentGalleryProgress.completedAt || new Date().toISOString()) : undefined,
    updatedAt: new Date().toISOString(),
  };

  currentDb[canonId] = updatedGalleryData;
  currentDb[uniqueCanonId] = updatedGalleryData;

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
        const nextList = Array.from(new Set([...completedList, uniqueCanonId, canonId]));
        localStorage.setItem(STORAGE_COMPLETED_GALLERIES_KEY, JSON.stringify(nextList));
        localStorage.setItem('completedGalleryPuzzles', JSON.stringify(nextList));
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
    window.dispatchEvent(
      new CustomEvent('museum_arrows_updated', {
        detail: { galleryId: canonId },
      })
    );
    window.dispatchEvent(
      new CustomEvent('museum_player_progress_updated', {
        detail: { type: 'puzzlePieceCollected', galleryId: canonId, isCompleted },
      })
    );
    if (isCompleted) {
      window.dispatchEvent(
        new CustomEvent('museum_completed_gallery_puzzles_updated', {
          detail: { galleryId: canonId, isCompleted: true },
        })
      );
    }
  }
}

/**
 * Resets puzzle progress for one gallery or all galleries
 */
export function resetPuzzleProgress(galleryId?: string): void {
  const currentDb = getPuzzleProgress();
  if (galleryId) {
    const canonId = toCanonicalGalleryId(galleryId);
    const uniqueCanonId = normalizeCanonicalGallery(galleryId);
    delete currentDb[canonId];
    delete currentDb[uniqueCanonId];
    delete currentDb[canonId.replace('_', '-')];
    delete currentDb[canonId.replace('-', '_')];
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
        localStorage.removeItem(STORAGE_PUZZLE_WRONG_ATTEMPTS_KEY);
      } else {
        const uniqueCanonId = normalizeCanonicalGallery(galleryId);
        const canonId = toCanonicalGalleryId(galleryId);
        const completed = getCompletedGalleryPuzzles().filter(
          (id) => id !== uniqueCanonId && id !== canonId && id !== galleryId
        );
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
