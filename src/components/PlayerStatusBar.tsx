import React, { useState } from 'react';
import { Puzzle, Coins, Star, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { resetEntireGame } from '../data/gameReset';

export interface PlayerStatusBarProps {
  puzzles?: number;
  stars?: number;
  coins?: number;
  className?: string;
  showResetButton?: boolean;
}

/**
 * Compact Player Progress / Status Bar
 * Displays completed puzzles, stars, coins, and quick game reset control.
 * Positioned directly below the top header on gallery map views.
 */
export const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({
  puzzles,
  stars,
  coins = 0,
  className = '',
  showResetButton = true,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const displayPuzzles = puzzles ?? 0;
  const displayStars = stars ?? 0;

  const handleConfirmReset = () => {
    resetEntireGame();
    setShowConfirmModal(false);
  };

  return (
    <>
      <div
        id="player-status-bar"
        role="region"
        aria-label="وضعیت بازیکن"
        className={`w-full px-3 sm:px-6 py-1.5 flex items-center justify-between select-none shrink-0 z-30 pointer-events-none ${className}`}
      >
        {/* Left Side: Reset Game Button */}
        <div className="pointer-events-auto">
          {showResetButton && (
            <button
              id="btn-restart-game"
              onClick={() => setShowConfirmModal(true)}
              aria-label="شروع مجدد بازی"
              title="شروع مجدد بازی و بازنشانی تمام پیشرفت‌ها"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-[#1e1b18] bg-[#ffffff] hover:bg-[#fee2e2] text-[#991b1b] shadow-[1.5px_1.5px_0px_#1e1b18] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all duration-150 text-[11px] font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>ریست بازی</span>
            </button>
          )}
        </div>

        {/* Right Side: Badges grouped together with separated icon medallion and number capsule */}
        <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto" dir="ltr">
          {/* Stars Badge: Circular Star Medallion + Separate Number Capsule */}
          <div
            id="player-stars-badge"
            className="relative flex items-center cursor-default group"
            title={`ستاره‌های کسب شده: ${displayStars} ستاره`}
          >
            {/* Star Icon Medallion */}
            <div className="relative z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full border-2 border-[#1e1b18] bg-[#fef3c7] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1e1b18] shrink-0">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1e1b18] fill-[#f59e0b] stroke-[1.5]" />
            </div>
            {/* Value Capsule */}
            <div className="-ml-2 pl-3 sm:pl-3.5 pr-2 h-6 sm:h-6.5 rounded-full border-2 border-[#1e1b18] bg-[#ffffff] shadow-[1.5px_1.5px_0px_#1e1b18] min-w-[36px] sm:min-w-[40px] flex items-center justify-center">
              <span className="font-mono-custom text-xs sm:text-[13px] font-black text-[#1e1b18] leading-none select-none">
                {displayStars}
              </span>
            </div>
          </div>

          {/* Puzzles Badge: Circular Puzzle Medallion + Separate Number Capsule */}
          <div
            id="player-puzzles-badge"
            className="relative flex items-center cursor-default group"
            title={`پازل‌های تکمیل شده: ${displayPuzzles} پازل`}
          >
            {/* Puzzle Icon Medallion */}
            <div className="relative z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full border-2 border-[#1e1b18] bg-[#ede9fe] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1e1b18] shrink-0">
              <Puzzle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1e1b18] fill-[#8b5cf6] stroke-[2]" />
            </div>
            {/* Value Capsule */}
            <div className="-ml-2 pl-3 sm:pl-3.5 pr-2 h-6 sm:h-6.5 rounded-full border-2 border-[#1e1b18] bg-[#ffffff] shadow-[1.5px_1.5px_0px_#1e1b18] min-w-[36px] sm:min-w-[40px] flex items-center justify-center">
              <span className="font-mono-custom text-xs sm:text-[13px] font-black text-[#1e1b18] leading-none select-none">
                {displayPuzzles}
              </span>
            </div>
          </div>

          {/* Coins Badge: Circular Coin Medallion + Separate Number Capsule */}
          <div
            id="player-coins-badge"
            className="relative flex items-center cursor-default group"
            title={`پاداش: ${coins} سکه`}
          >
            {/* Coin Icon Medallion */}
            <div className="relative z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full border-2 border-[#1e1b18] bg-[#fed7aa] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1e1b18] shrink-0">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ea580c] fill-[#fb923c] stroke-[2]" />
            </div>
            {/* Value Capsule */}
            <div className="-ml-2 pl-3 sm:pl-3.5 pr-2 h-6 sm:h-6.5 rounded-full border-2 border-[#1e1b18] bg-[#ffffff] shadow-[1.5px_1.5px_0px_#1e1b18] min-w-[36px] sm:min-w-[40px] flex items-center justify-center">
              <span className="font-mono-custom text-xs sm:text-[13px] font-black text-[#1e1b18] leading-none select-none">
                {coins}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
        >
          <div className="w-full max-w-sm bg-[#ffffff] border-2 border-[#1e1b18] rounded-2xl p-5 shadow-[4px_4px_0px_#1e1b18] text-[#1e1b18] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2 text-[#b91c1c]">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 id="reset-modal-title" className="font-black text-sm sm:text-base">
                  شروع دوباره بازی
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#1e1b18] transition-colors"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              آیا مایلید تمام پیشرفت بازی از ابتدا ریست شود؟
              <br />
              <span className="text-[#991b1b] font-medium text-[11px] block mt-1">
                • قطعات پازل و پیشرفت تالارها پاک می‌شوند.
                <br />
                • سکه‌ها و ستاره‌ها به مقدار اولیه بازمی‌گردند.
                <br />
                • به تالار اصلی موزه (گالری ۰۰) بازگردانده می‌شوید.
              </span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 rounded-xl border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#475569] text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                id="confirm-reset-game-btn"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl border-2 border-[#1e1b18] bg-[#ef4444] hover:bg-[#dc2626] text-[#ffffff] text-xs font-black shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تایید و ریست بازی</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

