import React, { useState, useEffect } from 'react';
import { Puzzle, Coins, Star } from 'lucide-react';
import { getOverallGameProgress } from '../data/finalCompletionStore';
import { toPersianDigits } from '../services/content/mappers';
import { contentService } from '../services/content/contentService';
import { getUnlockedInformationStarsCount } from '../data/starPointProgressStore';

export interface PlayerStatusBarProps {
  puzzles?: number;
  totalPuzzles?: number;
  stars?: number;
  totalStars?: number;
  coins?: number;
  className?: string;
  showProgressBar?: boolean;
  showResetButton?: boolean;
}

/**
 * Compact Player Progress / Status Bar
 * Displays overall game progress bar on the left, and stars, puzzles, coins on the right.
 * Positioned directly below the top header on gallery map views.
 */
export const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({
  puzzles,
  totalPuzzles: propTotalPuzzles,
  stars,
  totalStars: propTotalStars,
  coins = 0,
  className = '',
  showProgressBar = true,
}) => {
  const [progress, setProgress] = useState(() => getOverallGameProgress());
  const [totalStarsCount, setTotalStarsCount] = useState<number>(() => {
    const allStars = contentService.getStars().filter((s) => s.active !== false);
    return allStars.length > 0 ? allStars.length : 8;
  });

  useEffect(() => {
    const handleUpdate = () => {
      setProgress(getOverallGameProgress());
    };

    window.addEventListener('museum_puzzle_progress_updated', handleUpdate);
    window.addEventListener('museum_player_progress_updated', handleUpdate);
    window.addEventListener('museum_completed_gallery_puzzles_updated', handleUpdate);
    window.addEventListener('museum_completed_puzzle_points_updated', handleUpdate);
    window.addEventListener('museum_final_completion_awarded', handleUpdate);
    window.addEventListener('museum_final_card_code_generated', handleUpdate);
    window.addEventListener('museum_game_fully_reset', handleUpdate);
    window.addEventListener('museum_star_point_progress_updated', handleUpdate);
    window.addEventListener('museum_player_stats_updated', handleUpdate);

    return () => {
      window.removeEventListener('museum_puzzle_progress_updated', handleUpdate);
      window.removeEventListener('museum_player_progress_updated', handleUpdate);
      window.removeEventListener('museum_completed_gallery_puzzles_updated', handleUpdate);
      window.removeEventListener('museum_completed_puzzle_points_updated', handleUpdate);
      window.removeEventListener('museum_final_completion_awarded', handleUpdate);
      window.removeEventListener('museum_final_card_code_generated', handleUpdate);
      window.removeEventListener('museum_game_fully_reset', handleUpdate);
      window.removeEventListener('museum_star_point_progress_updated', handleUpdate);
      window.removeEventListener('museum_player_stats_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    return contentService.subscribe(() => {
      const allStars = contentService.getStars().filter((s) => s.active !== false);
      setTotalStarsCount(allStars.length > 0 ? allStars.length : 8);
    });
  }, []);

  const displayPuzzles = puzzles ?? 0;
  const totalPuzzles = propTotalPuzzles ?? 8;
  const displayStars = stars !== undefined ? stars : getUnlockedInformationStarsCount();
  const totalStars = propTotalStars ?? totalStarsCount;

  return (
    <div
      id="player-status-bar"
      role="region"
      aria-label="وضعیت بازیکن"
      className={`w-full px-3 sm:px-6 py-1.5 flex items-center justify-between select-none shrink-0 z-30 pointer-events-none ${className}`}
    >
      {/* Left Side: Game Progress Bar */}
      <div className="pointer-events-auto">
        {showProgressBar && (
          <div
            id="hud-game-progress-bar"
            className="flex items-center cursor-default group"
            title={`پیشرفت کلی بازی: ${toPersianDigits(progress.percentage)}٪ (${toPersianDigits(progress.completedGalleriesCount)} از ${toPersianDigits(progress.totalGalleries)} تالار)`}
          >
            {/* Medallion / Trophy Icon */}
            <div className="relative z-10 w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full border-2 border-[#1e1b18] bg-[#fef3c7] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1e1b18] shrink-0">
              <svg
                className="w-[22px] h-[22px] sm:w-[25px] sm:h-[25px] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1e1b18"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fill="#f59e0b" />
                <path d="M18 9h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" fill="#f59e0b" />
                <path d="M6 2h12v7a6 6 0 0 1-12 0V2z" fill="#f59e0b" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 21H4v1.5h16V21h-3c0-.76-.85-2.25-2.03-2.79-.5-.23-.97-.66-.97-1.21v-2.34H10z" fill="#f59e0b" />
              </svg>
            </div>
            {/* Progress Bar Capsule */}
            <div className="-mr-2 pr-3 sm:pr-3.5 pl-2.5 h-6 sm:h-6.5 rounded-full border-2 border-[#1e1b18] bg-[#ffffff] shadow-[1.5px_1.5px_0px_#1e1b18] flex items-center gap-1.5 min-w-[88px] sm:min-w-[120px] relative overflow-hidden">
              {/* Mini progress track */}
              <div className="w-12 sm:w-16 h-2 bg-[#f1f5f9] rounded-full border border-[#1e1b18]/30 overflow-hidden shrink-0">
                <div
                  className="h-full bg-[#f59e0b] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              {/* Percentage label */}
              <span className="font-mono-custom text-[11px] sm:text-[12px] font-black text-[#1e1b18] leading-none select-none">
                {toPersianDigits(progress.percentage)}٪
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Badges grouped together with separated icon medallion and number capsule */}
      <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto" dir="ltr">
        {/* Puzzles Badge: Circular Puzzle Medallion + Separate Number Capsule showing completed / total */}
        <div
          id="player-puzzles-badge"
          className="relative flex items-center cursor-default group"
          title={`پازل‌های تکمیل شده: ${toPersianDigits(displayPuzzles)} از ${toPersianDigits(totalPuzzles)} پازل`}
        >
          {/* Puzzle Icon Medallion */}
          <div className="relative z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full border-2 border-[#1e1b18] bg-[#ede9fe] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1e1b18] shrink-0">
            <Puzzle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1e1b18] fill-[#8b5cf6] stroke-[2]" />
          </div>
          {/* Value Capsule */}
          <div className="-ml-2 pl-3 sm:pl-3.5 pr-2 sm:pr-2.5 h-6 sm:h-6.5 rounded-full border-2 border-[#1e1b18] bg-[#ffffff] shadow-[1.5px_1.5px_0px_#1e1b18] min-w-[44px] sm:min-w-[48px] flex items-center justify-center">
            <span className="font-mono-custom text-xs sm:text-[13px] font-black text-[#1e1b18] leading-none select-none">
              {toPersianDigits(displayPuzzles)}/{toPersianDigits(totalPuzzles)}
            </span>
          </div>
        </div>

        {/* Stars Badge: Circular Star Medallion + Separate Number Capsule showing acquired / total */}
        <div
          id="player-stars-badge"
          className="relative flex items-center cursor-default group"
          title={`ستاره‌های کسب شده: ${toPersianDigits(displayStars)} از ${toPersianDigits(totalStars)} ستاره`}
        >
          {/* Star Icon Medallion */}
          <div className="relative z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full border-2 border-[#1e1b18] bg-[#fef3c7] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1e1b18] shrink-0">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1e1b18] fill-[#f59e0b] stroke-[1.5]" />
          </div>
          {/* Value Capsule */}
          <div className="-ml-2 pl-3 sm:pl-3.5 pr-2 sm:pr-2.5 h-6 sm:h-6.5 rounded-full border-2 border-[#1e1b18] bg-[#ffffff] shadow-[1.5px_1.5px_0px_#1e1b18] min-w-[44px] sm:min-w-[48px] flex items-center justify-center">
            <span className="font-mono-custom text-xs sm:text-[13px] font-black text-[#1e1b18] leading-none select-none">
              {toPersianDigits(displayStars)}/{toPersianDigits(totalStars)}
            </span>
          </div>
        </div>

        {/* Coins Badge: Circular Coin Medallion + Separate Number Capsule */}
        <div
          id="player-coins-badge"
          className="relative flex items-center cursor-default group"
          title={`پاداش: ${toPersianDigits(coins)} سکه`}
        >
          {/* Coin Icon Medallion */}
          <div className="relative z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full border-2 border-[#1e1b18] bg-[#fed7aa] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1e1b18] shrink-0">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ea580c] fill-[#fb923c] stroke-[2]" />
          </div>
          {/* Value Capsule */}
          <div className="-ml-2 pl-3 sm:pl-3.5 pr-2 h-6 sm:h-6.5 rounded-full border-2 border-[#1e1b18] bg-[#ffffff] shadow-[1.5px_1.5px_0px_#1e1b18] min-w-[36px] sm:min-w-[40px] flex items-center justify-center">
            <span className="font-mono-custom text-xs sm:text-[13px] font-black text-[#1e1b18] leading-none select-none">
              {toPersianDigits(coins)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

