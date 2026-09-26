import { resetPuzzleProgress } from './puzzleProgressStore';
import { resetAllQuestionsProgress } from './questionProgressStore';
import { resetStarPointProgress } from './starPointProgressStore';
import { resetExperienceProgress } from './experienceProgressStore';
import { resetUsedArrows, resetAnsweredQuestions } from './arrowConditionsStore';
import { resetPlayerLocation } from './playerLocationStore';
import { resetReachedGalleries } from './reachedGalleriesStore';
import { resetFinalCompletionState } from './finalCompletionStore';
import { resetCollectionNotificationStore } from './collectionNotificationStore';
import { clearUserProfile } from './userProfileStore';
import { resetLuckMachineState } from './luckMachineStore';

/**
 * Full, authoritative game reset.
 * Clears all progress records while preserving admin configs.
 */
export function resetEntireGame(): void {
  try {
    // Clear user profile so user starts from profile creation / welcome page
    clearUserProfile();

    // 1. Reset player location
    resetPlayerLocation();

    // 2. Reset puzzle pieces and completed gallery puzzles
    resetPuzzleProgress();

    // 3. Reset quiz and questions progress, spent coins, and reset bonus coins to 50
    resetAllQuestionsProgress();

    // 4. Reset star points discovery records
    resetStarPointProgress();

    // 4.1 Reset experience progress records
    resetExperienceProgress();

    // 5. Reset arrows usage & conditions
    resetUsedArrows();
    resetAnsweredQuestions();

    // 6. Reset reached galleries record
    resetReachedGalleries();

    // 7. Reset final completion award & card code
    resetFinalCompletionState();

    // 8. Reset collections unread notification store
    resetCollectionNotificationStore();

    // 8.1 Reset luck machine attempt state
    resetLuckMachineState();

    // 7. Reset active gallery navigation storage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('museum_active_gallery', 'gallery-00');
      localStorage.setItem('museum_current_gallery', 'gallery-00');
      localStorage.setItem('museum_player_current_gallery', 'gallery-01');
      localStorage.setItem('currentGalleryId', 'gallery-01');
      localStorage.removeItem('museum_has_entered_gallery_01');
      localStorage.removeItem('museum_has_entered_gallery_02');
      localStorage.removeItem('museum_has_entered_any_gallery');
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
