import { AdminArrowPoint, ArrowVisibilityCondition } from '../types/admin';
import {
  isPuzzlePieceCollected,
  isPuzzleQuestionCompleted,
  isGalleryPuzzleCompleted,
  getPuzzleProgress,
} from './puzzleProgressStore';
import { isGalleryQuestionsCompleted, getQuestionProgress } from './questionProgressStore';
import { getProgressionRuleForArrow } from './galleryProgressionStore';

/**
 * ============================================================================
 * ARROW CONDITIONS & PLAYER PROGRESS STORE
 * ============================================================================
 * Manages player progress state and conditional visibility evaluation for arrows:
 * - Answered questions
 * - Collected puzzle pieces
 * - Used one-time arrows
 */

const STORAGE_USED_ARROWS_KEY = 'museum_used_arrows';
const STORAGE_ANSWERED_QUESTIONS_KEY = 'museum_answered_questions';

/**
 * Normalizes question ID for robust matching across formats
 * e.g. 'gallery01-puzzle-q03', 'gallery01-q03', 'q03', 'q3', 'question-03'
 */
function normalizeQuestionId(qId?: string): string {
  if (!qId || typeof qId !== 'string') return '';
  return qId.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Retrieves list of used arrow IDs from localStorage
 */
export function getUsedArrows(): string[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_USED_ARROWS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error reading used arrows from storage:', err);
  }
  return [];
}

/**
 * Checks if a specific arrow has already been used by the player
 */
export function isArrowUsed(arrowId: string): boolean {
  if (!arrowId) return false;
  const used = getUsedArrows();
  return used.includes(arrowId);
}

/**
 * Marks an arrow as used and persists state so it never reappears on the source map
 */
export function markArrowUsed(arrowId: string): void {
  if (!arrowId) return;
  try {
    const used = getUsedArrows();
    if (!used.includes(arrowId)) {
      const next = [...used, arrowId];
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_USED_ARROWS_KEY, JSON.stringify(next));
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('museum_used_arrows_updated', {
            detail: { usedArrows: next, lastUsedId: arrowId },
          })
        );
        window.dispatchEvent(
          new CustomEvent('museum_player_progress_updated', {
            detail: { type: 'arrowUsed', arrowId },
          })
        );
      }
    }
  } catch (err) {
    console.error('Error saving used arrow:', err);
  }
}

/**
 * Resets all used arrows (useful for testing or full game reset)
 */
export function resetUsedArrows(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_USED_ARROWS_KEY);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('museum_used_arrows_updated', { detail: { usedArrows: [] } })
      );
      window.dispatchEvent(
        new CustomEvent('museum_player_progress_updated', { detail: { type: 'reset' } })
      );
    }
  } catch (err) {
    console.error('Error resetting used arrows:', err);
  }
}

/**
 * Retrieves list of recorded answered question IDs
 */
export function getAnsweredQuestions(): string[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_ANSWERED_QUESTIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error reading answered questions from storage:', err);
  }
  return [];
}

/**
 * Records that a question has been answered and persists state
 */
export function recordAnsweredQuestion(questionId: string): void {
  if (!questionId) return;
  try {
    const list = getAnsweredQuestions();
    const normalized = normalizeQuestionId(questionId);
    
    // Store both original and normalized key for maximum compatibility
    const hasAlready = list.some((item) => normalizeQuestionId(item) === normalized);
    if (!hasAlready) {
      const next = [...list, questionId];
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_ANSWERED_QUESTIONS_KEY, JSON.stringify(next));
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('museum_answered_questions_updated', {
            detail: { answeredQuestions: next, questionId },
          })
        );
        window.dispatchEvent(
          new CustomEvent('museum_player_progress_updated', {
            detail: { type: 'questionAnswered', questionId },
          })
        );
      }
    }
  } catch (err) {
    console.error('Error recording answered question:', err);
  }
}

/**
 * Resets all recorded answered questions (for testing or full game reset)
 */
export function resetAnsweredQuestions(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_ANSWERED_QUESTIONS_KEY);
      window.dispatchEvent(
        new CustomEvent('museum_answered_questions_updated', {
          detail: { answeredQuestions: [] },
        })
      );
      window.dispatchEvent(
        new CustomEvent('museum_player_progress_updated', {
          detail: { type: 'reset' },
        })
      );
    }
  } catch (err) {
    console.error('Error resetting answered questions:', err);
  }
}

/**
 * Alias for recording answered question
 */
export const markQuestionAnswered = recordAnsweredQuestion;

/**
 * Checks whether a specific question has been answered by the player.
 * Resolves against:
 * 1. Direct recorded answered questions
 * 2. Puzzle points completed questions
 * 3. Gallery Quiz progress (e.g. Gallery 01 Question 1, 2, 3)
 */
export function isQuestionAnswered(questionId: string): boolean {
  if (!questionId) return false;
  const targetNorm = normalizeQuestionId(questionId);

  // 1. Check in explicitly recorded answered questions
  const answeredList = getAnsweredQuestions();
  if (answeredList.some((q) => normalizeQuestionId(q) === targetNorm)) {
    return true;
  }

  // 2. Check in puzzle progress store across known galleries
  if (
    isPuzzleQuestionCompleted('gallery-01', questionId) ||
    isPuzzleQuestionCompleted('gallery-03', questionId) ||
    isPuzzleQuestionCompleted('gallery-04', questionId) ||
    isPuzzleQuestionCompleted('gallery-05', questionId) ||
    isPuzzleQuestionCompleted('gallery-06', questionId) ||
    isPuzzleQuestionCompleted('gallery-07', questionId) ||
    isPuzzleQuestionCompleted('gallery-08', questionId) ||
    isPuzzleQuestionCompleted('gallery-09', questionId) ||
    isPuzzleQuestionCompleted('gallery-00', questionId)
  ) {
    return true;
  }

  // 3. Check Gallery Quiz progress store
  const quizProgress = getQuestionProgress();
  
  // Gallery 01 Quiz checking
  if (targetNorm.includes('gallery01') || targetNorm.startsWith('g01')) {
    const g01Prog = quizProgress['gallery-01'] || quizProgress['gallery01'];
    const count = g01Prog?.answeredQuestionsCount || (g01Prog?.completed ? 3 : 0);
    if (targetNorm.includes('q01') || targetNorm.includes('q1')) return count >= 1;
    if (targetNorm.includes('q02') || targetNorm.includes('q2')) return count >= 2;
    if (targetNorm.includes('q03') || targetNorm.includes('q3')) return count >= 3;
    if (g01Prog?.completed) return true;
  }

  // Gallery 03 Quiz checking
  if (targetNorm.includes('gallery03') || targetNorm.startsWith('g03')) {
    const g03Prog = quizProgress['gallery-03'] || quizProgress['gallery03'];
    const count = g03Prog?.answeredQuestionsCount || (g03Prog?.completed ? 3 : 0);
    if (targetNorm.includes('q01') || targetNorm.includes('q1')) return count >= 1;
    if (targetNorm.includes('q02') || targetNorm.includes('q2')) return count >= 2;
    if (targetNorm.includes('q03') || targetNorm.includes('q3')) return count >= 3;
    if (g03Prog?.completed) return true;
  }

  // Generic q01, q02, q03 aliases if no gallery specified
  if (targetNorm === 'q01' || targetNorm === 'q1' || targetNorm === 'question01' || targetNorm === 'question1') {
    const g01Count = quizProgress['gallery-01']?.answeredQuestionsCount || 0;
    return g01Count >= 1;
  }
  if (targetNorm === 'q02' || targetNorm === 'q2' || targetNorm === 'question02' || targetNorm === 'question2') {
    const g01Count = quizProgress['gallery-01']?.answeredQuestionsCount || 0;
    return g01Count >= 2;
  }
  if (targetNorm === 'q03' || targetNorm === 'q3' || targetNorm === 'question03' || targetNorm === 'question3') {
    const g01Count = quizProgress['gallery-01']?.answeredQuestionsCount || (quizProgress['gallery-01']?.completed ? 3 : 0);
    return g01Count >= 3;
  }

  return false;
}

/**
 * Checks whether a specific puzzle piece has been collected
 */
export function isPieceCollected(puzzlePieceId: string): boolean {
  if (!puzzlePieceId) return false;
  const progress = getPuzzleProgress();
  for (const gId in progress) {
    if (Array.isArray(progress[gId]?.collectedPieces) && progress[gId].collectedPieces.includes(puzzlePieceId)) {
      return true;
    }
  }
  return (
    isPuzzlePieceCollected('gallery-01', puzzlePieceId) ||
    isPuzzlePieceCollected('gallery-03', puzzlePieceId) ||
    isPuzzlePieceCollected('gallery-04', puzzlePieceId) ||
    isPuzzlePieceCollected('gallery-05', puzzlePieceId) ||
    isPuzzlePieceCollected('gallery-06', puzzlePieceId) ||
    isPuzzlePieceCollected('gallery-07', puzzlePieceId) ||
    isPuzzlePieceCollected('gallery-08', puzzlePieceId) ||
    isPuzzlePieceCollected('gallery-09', puzzlePieceId) ||
    isPuzzlePieceCollected('gallery-00', puzzlePieceId)
  );
}

/**
 * Evaluates whether a single visibility condition is satisfied
 */
export function isConditionSatisfied(condition: ArrowVisibilityCondition): boolean {
  switch (condition.type) {
    case 'alwaysVisible':
      return true;

    case 'questionAnswered':
      return condition.questionId ? isQuestionAnswered(condition.questionId) : true;

    case 'puzzlePieceCollected':
      return condition.puzzlePieceId ? isPieceCollected(condition.puzzlePieceId) : true;

    case 'galleryPuzzleCompleted':
      return condition.galleryId ? isGalleryPuzzleCompleted(condition.galleryId) : true;

    case 'arrowUsed':
      return condition.arrowId ? isArrowUsed(condition.arrowId) : true;

    default:
      return true;
  }
}

/**
 * Evaluates all visibility conditions configured for an arrow with logical AND.
 * Arrow is visible ONLY when ALL conditions are satisfied.
 * If conditions array is empty or undefined, defaults to visible (always visible).
 */
export function evaluateArrowConditions(
  conditions?: ArrowVisibilityCondition[]
): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  // ALL configured conditions must be satisfied (Logical AND)
  return conditions.every((cond) => isConditionSatisfied(cond));
}

/**
 * Evaluates whether an arrow should currently be rendered on the user-facing map:
 * 1. Progression conditions must be satisfied (if a progression rule is associated)
 * 2. ALL custom visibility conditions must be satisfied
 * Note: Navigation arrows (both next gallery and return arrows) remain permanently visible once unlocked/received.
 */
export function isArrowVisibleToPlayer(arrow: AdminArrowPoint): boolean {
  // If this is the arrow on the main map pointing to Gallery 01/02, hide it permanently once the user has entered Gallery 02
  if (arrow.id === 'arrow-g00-to-g01' || arrow.galleryId === 'gallery-00') {
    if (isArrowUsed(arrow.id) || isArrowUsed('arrow-g00-to-g01')) {
      return false;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (localStorage.getItem('museum_has_entered_gallery_02') === 'true') {
          return false;
        }
      } catch {}
    }
  }

  // Check progression rules for game progression arrows
  const progressionRule = getProgressionRuleForArrow(arrow.id);
  if (progressionRule && progressionRule.requiredPuzzlePiecesCount > 0) {
    if (progressionRule.requiredPuzzlePieceIds && progressionRule.requiredPuzzlePieceIds.length > 0) {
      const allPiecesCollected = progressionRule.requiredPuzzlePieceIds.every((pieceId) =>
        isPuzzlePieceCollected(progressionRule.galleryId, pieceId)
      );
      if (!allPiecesCollected) {
        return false;
      }
    }
    if (!isGalleryPuzzleCompleted(progressionRule.galleryId)) {
      return false;
    }
  }

  // Check all configured visibility conditions
  return evaluateArrowConditions(arrow.visibilityConditions);
}

/**
 * Snapshot of complete player progress state for debugging & evaluation
 */
export function getPlayerProgressSnapshot() {
  return {
    answeredQuestions: getAnsweredQuestions(),
    usedArrows: getUsedArrows(),
  };
}
