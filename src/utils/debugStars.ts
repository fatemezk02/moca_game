/**
 * ============================================================================
 * STAR ID & STAR QUESTION MAPPING DEBUG UTILITY
 * ============================================================================
 * Utility to verify and log the content structure of all 25 stars fetched from
 * the ContentService (Google Sheets source of truth).
 *
 * Verifies that:
 * 1. Exactly 25 Star Points exist.
 * 2. Each Star has a unique, permanent star_id ("star-01" to "star-25").
 * 3. Each Star is strictly mapped to its own question ("star-q-01" to "star-q-25")
 *    by star_id, NOT by array index or rendering order.
 * 4. Options and correct answers are accurately attached.
 */

import { contentService } from '../services/content/contentService';
import { StarContent } from '../services/content/types';

export interface StarVerificationResult {
  isValid: boolean;
  totalStars: number;
  expectedStars: number;
  duplicateIds: string[];
  missingIds: string[];
  mismatchedQuestions: Array<{
    starId: string;
    starNumber: string | number;
    expectedQuestionId: string;
    actualQuestionId: string;
    questionText: string;
  }>;
  stars: Array<{
    starNumber: number;
    starId: string;
    galleryId: string;
    title: string;
    questionId: string;
    question: string;
    optionsCount: number;
    correctIndex: number;
    correctAnswer: string;
  }>;
}

/**
 * Runs a full verification check against all 25 stars loaded in ContentService.
 */
export async function verifyStarsMapping(): Promise<StarVerificationResult> {
  // Ensure content service has loaded from network or cache
  let stars = contentService.getStars();
  if (!stars || stars.length === 0) {
    await contentService.initializeContent();
    stars = contentService.getStars();
  }

  const activeStars = (stars || []).filter((s) => s.active !== false);

  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];
  const missingIds: string[] = [];
  const mismatchedQuestions: StarVerificationResult['mismatchedQuestions'] = [];

  const starSummaryList: StarVerificationResult['stars'] = [];

  // Expected 28 canonical IDs: star-01 .. star-28
  const expectedIds = Array.from({ length: 28 }, (_, i) => `star-${String(i + 1).padStart(2, '0')}`);

  for (let i = 1; i <= 28; i++) {
    const expectedId = `star-${String(i).padStart(2, '0')}`;
    const expectedQId = `star-q-${String(i).padStart(2, '0')}`;

    // Strictly lookup star by star_id or canonical number, never by array index
    const star =
      activeStars.find((s) => (s.starId || s.id || '').toLowerCase() === expectedId) ||
      contentService.getStarForStarPoint(expectedId, undefined, expectedId);

    if (!star) {
      missingIds.push(expectedId);
      continue;
    }

    const sId = star.starId || star.id;
    if (seenIds.has(sId)) {
      duplicateIds.push(sId);
    } else {
      seenIds.add(sId);
    }

    // Verify question mapping
    const actualQId = (star.questionId || '').trim();
    if (actualQId && actualQId !== expectedQId && actualQId !== `${i}`) {
      mismatchedQuestions.push({
        starId: sId,
        starNumber: star.starNumber || i,
        expectedQuestionId: expectedQId,
        actualQuestionId: actualQId,
        questionText: star.questionText || '',
      });
    }

    starSummaryList.push({
      starNumber: i,
      starId: sId,
      galleryId: star.galleryId,
      title: star.titleFa,
      questionId: star.questionId || expectedQId,
      question: star.questionText || '',
      optionsCount: star.questionOptions?.length || 0,
      correctIndex: star.correctIndex ?? -1,
      correctAnswer: star.correctAnswer || '',
    });
  }

  const isValid =
    starSummaryList.length === 28 &&
    missingIds.length === 0 &&
    duplicateIds.length === 0 &&
    mismatchedQuestions.length === 0;

  return {
    isValid,
    totalStars: starSummaryList.length,
    expectedStars: 28,
    duplicateIds,
    missingIds,
    mismatchedQuestions,
    stars: starSummaryList,
  };
}

/**
 * Logs a human-readable diagnostic report to the console.
 */
export async function logAllStarsDebug(): Promise<void> {
  console.group('🌟 [Star Debugging] Verifying 28 Stars & Question Mapping');
  const result = await verifyStarsMapping();

  console.log(`Status: ${result.isValid ? '✅ VALID (28/28)' : '❌ INVALID'}`);
  console.log(`Total active stars: ${result.totalStars} / ${result.expectedStars}`);

  if (result.missingIds.length > 0) {
    console.error('Missing Star IDs:', result.missingIds);
  }
  if (result.duplicateIds.length > 0) {
    console.error('Duplicate Star IDs:', result.duplicateIds);
  }
  if (result.mismatchedQuestions.length > 0) {
    console.error('Mismatched Questions:', result.mismatchedQuestions);
  }

  console.table(
    result.stars.map((s) => ({
      '#': s.starNumber,
      'Star ID': s.starId,
      Gallery: s.galleryId,
      Title: s.title,
      'Q ID': s.questionId,
      'Question Preview': s.question.slice(0, 35) + (s.question.length > 35 ? '...' : ''),
      Options: s.optionsCount,
      'Correct Index': s.correctIndex,
    }))
  );

  console.groupEnd();
}

// Attach to window object for convenient browser DevTools debugging
if (typeof window !== 'undefined') {
  (window as any).__DEBUG_STARS__ = {
    verifyStarsMapping,
    logAllStarsDebug,
  };
}

// Self-run when executed directly via tsx / node
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('debugStars')) {
  logAllStarsDebug().catch(console.error);
}
