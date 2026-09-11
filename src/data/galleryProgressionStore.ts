/**
 * Authoritative Gallery Progression Configuration & Progression Engine
 *
 * Single source of truth for gallery progression rules:
 * - Flow: Gallery 00 -> Gallery 01 -> Gallery 03 -> Gallery 04 -> future galleries
 * - Unlocking requirements per gallery (e.g. 3 puzzle pieces)
 * - Progression arrow mappings
 */

import { isPuzzlePieceCollected, isGalleryPuzzleCompleted } from './puzzleProgressStore';
import { isArrowUsed } from './arrowConditionsStore';

export interface GalleryProgressionRule {
  galleryId: string;
  targetGalleryId: string;
  arrowId: string;
  requiredPuzzlePiecesCount: number;
  requiredPuzzlePieceIds: string[];
}

export const GALLERY_PROGRESSION_RULES: Record<string, GalleryProgressionRule> = {
  'gallery-00': {
    galleryId: 'gallery-00',
    targetGalleryId: 'gallery-01',
    arrowId: 'arrow-g00-to-g01',
    requiredPuzzlePiecesCount: 0,
    requiredPuzzlePieceIds: [],
  },
  'gallery-01': {
    galleryId: 'gallery-01',
    targetGalleryId: 'gallery-03',
    arrowId: 'arrow-g01-to-g03',
    requiredPuzzlePiecesCount: 3,
    requiredPuzzlePieceIds: [
      'gallery01-piece-01',
      'gallery01-piece-02',
      'gallery01-piece-03',
    ],
  },
  'gallery-03': {
    galleryId: 'gallery-03',
    targetGalleryId: 'gallery-04',
    arrowId: 'arrow-g03-to-g04',
    requiredPuzzlePiecesCount: 3,
    requiredPuzzlePieceIds: [
      'gallery03-piece-01',
      'gallery03-piece-02',
      'gallery03-piece-03',
    ],
  },
  'gallery-04': {
    galleryId: 'gallery-04',
    targetGalleryId: 'gallery-05',
    arrowId: 'arrow-g04-to-g05',
    requiredPuzzlePiecesCount: 3,
    requiredPuzzlePieceIds: [
      'gallery04-piece-01',
      'gallery04-piece-02',
      'gallery04-piece-03',
    ],
  },
  'gallery-05': {
    galleryId: 'gallery-05',
    targetGalleryId: 'gallery-06',
    arrowId: 'arrow-g05-to-g06',
    requiredPuzzlePiecesCount: 3,
    requiredPuzzlePieceIds: [
      'gallery05-piece-01',
      'gallery05-piece-02',
      'gallery05-piece-03',
    ],
  },
};

/**
 * Finds a progression rule by its associated unlock arrow ID
 */
export function getProgressionRuleForArrow(arrowId: string): GalleryProgressionRule | undefined {
  if (!arrowId) return undefined;
  return Object.values(GALLERY_PROGRESSION_RULES).find((rule) => rule.arrowId === arrowId);
}

/**
 * Finds the progression rule for a source gallery
 */
export function getProgressionRuleForGallery(galleryId: string): GalleryProgressionRule | undefined {
  if (!galleryId) return undefined;
  return GALLERY_PROGRESSION_RULES[galleryId];
}

/**
 * Evaluates whether the progression conditions for unlocking the next gallery from
 * a given source gallery are currently satisfied by the player.
 *
 * - Gallery 00 -> Unlocked from start (0 pieces)
 * - Gallery 01 -> Requires all 3 puzzle pieces collected (piece1 && piece2 && piece3)
 * - Gallery 03 -> Requires all 3 puzzle pieces collected (piece1 && piece2 && piece3)
 */
export function isProgressionConditionsSatisfied(galleryId: string): boolean {
  const rule = getProgressionRuleForGallery(galleryId);
  if (!rule) return true;

  if (rule.requiredPuzzlePiecesCount === 0) {
    return true;
  }

  // Check if all required puzzle pieces have been collected
  if (rule.requiredPuzzlePieceIds && rule.requiredPuzzlePieceIds.length > 0) {
    const allPiecesCollected = rule.requiredPuzzlePieceIds.every((pieceId) =>
      isPuzzlePieceCollected(rule.galleryId, pieceId)
    );
    if (!allPiecesCollected) {
      return false;
    }
  }

  return isGalleryPuzzleCompleted(rule.galleryId);
}

/**
 * Checks whether a progression arrow is visible to the player:
 * - Must NOT be used (used one-time arrows disappear)
 * - Progression conditions for the gallery must be satisfied
 */
export function isProgressionArrowVisible(arrowId: string): boolean {
  if (isArrowUsed(arrowId)) {
    return false;
  }

  const rule = getProgressionRuleForArrow(arrowId);
  if (!rule) {
    return true;
  }

  return isProgressionConditionsSatisfied(rule.galleryId);
}
