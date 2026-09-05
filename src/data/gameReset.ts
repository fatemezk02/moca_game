import { resetPuzzleProgress } from './puzzleProgressStore';
import { resetAllQuestionsProgress } from './questionProgressStore';
import { resetStarPointProgress } from './starPointProgressStore';
import { resetUsedArrows, resetAnsweredQuestions } from './arrowConditionsStore';
import { resetPlayerLocation } from './playerLocationStore';

/**
 * Full, authoritative game reset.
 * Clears all progress records while preserving admin configs.
 */
export function resetEntireGame(): void {
  try {
    // 1. Reset player location
    resetPlayerLocation();

    // 2. Reset puzzle pieces and completed gallery puzzles
    resetPuzzleProgress();

    // 3. Reset quiz and questions progress, spent coins, and reset bonus coins to 50
    resetAllQuestionsProgress();

    // 4. Reset star points discovery records
    resetStarPointProgress();

    // 5. Reset arrows usage & conditions
    resetUsedArrows();
    resetAnsweredQuestions();

    // 6. Reset active gallery navigation storage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('museum_active_gallery', 'gallery-00');
      localStorage.setItem('museum_current_gallery', 'gallery-00');
      localStorage.setItem('museum_player_current_gallery', 'gallery-00');
    }

    // 7. Dispatch global reset notification event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('museum_game_fully_reset', {
          detail: { timestamp: Date.now() },
        })
      );
      window.dispatchEvent(
        new CustomEvent('museum_player_progress_updated', {
          detail: { type: 'full_game_reset' },
        })
      );
    }
  } catch (err) {
    console.error('Error during full game reset:', err);
  }
}
