import React, { useState } from 'react';
import { Star, Coins, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { resetEntireGame } from '../data/gameReset';

export interface PlayerStatusBarProps {
  stars?: number;
  coins?: number;
  className?: string;
  showResetButton?: boolean;
}

/**
 * Compact Player Progress / Status Bar
 * Displays stars, coins, and quick game reset control.
 * Positioned directly below the top header on gallery map views.
 */
export const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({
  stars = 0,
  coins = 0,
  className = '',
  showResetButton = true,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

        {/* Right Side: Badges grouped together */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Stars Badge / Counter */}
          <div
            id="player-stars-badge"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-[#1e1b18] bg-[#fef08a] shadow-[2px_2px_0px_#1e1b18] text-[#1e1b18] cursor-default"
            title={`امتیاز: ${stars} ستاره (${stars} پاسخ به پرسش‌ها)`}
          >
            <Star className="w-4 h-4 fill-[#f59e0b] text-[#1e1b18] shrink-0 stroke-[2]" />
            <span className="font-mono-custom text-xs font-black leading-none">
              {stars}
            </span>
          </div>

          {/* Coins Badge / Counter */}
          <div
            id="player-coins-badge"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-[#1e1b18] bg-[#fed7aa] shadow-[2px_2px_0px_#1e1b18] text-[#1e1b18] cursor-default"
            title={`پاداش: ${coins} سکه`}
          >
            <Coins className="w-4 h-4 text-[#ea580c] fill-[#fb923c] shrink-0 stroke-[2]" />
            <span className="font-mono-custom text-xs font-black leading-none">
              {coins}
            </span>
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

