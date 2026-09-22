import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Compass, Sparkles, Puzzle, Star, Coins, Eye, Trophy } from 'lucide-react';

interface MuseumInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
  onNavigateToGallery?: (
    galleryId:
      | 'gallery-00'
      | 'gallery-01'
      | 'gallery-02'
      | 'gallery-03'
      | 'gallery-04'
      | 'gallery-05'
      | 'gallery-06'
      | string
  ) => void;
}

export const MuseumInfoModal: React.FC<MuseumInfoModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onNavigateToGallery,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1e1b18]/60 backdrop-blur-xs select-none">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative z-10 w-full max-w-lg bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#1e1b18] space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#1e1b18] pb-3.5">
            <div>
              <span className="font-sans-custom text-[11px] text-[#ea580c] font-black tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                راهنمای بخش ها و علائم
              </span>
              <h2 className="font-sans-custom text-[20px] font-black text-[#1e1b18]">
                راهنمای بازی
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#fee2e2] hover:bg-[#ef4444] hover:text-white transition-all text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4 text-[13px] text-[#334155] leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
            {/* Game Guide Boxes (Matching Initial Walkthrough) */}
            <div className="space-y-3 pt-1">
              {/* Box 1: Story and Goal */}
              <div className="border-2 border-[#1e1b18] rounded-2xl p-4 bg-[#e0f2fe] shadow-[2.5px_2.5px_0px_#1e1b18] text-right flex flex-col items-start">
                <div className="flex items-center gap-2 font-black text-xs text-[#0369a1] mb-2">
                  <Compass className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span>داستان و هدف بازی</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#1e293b] leading-relaxed font-medium text-right">
                  در این بازی ۸ اثر مربوط به ۸ برهه مهم تاریخ عکاسی جهان را پیدا می‌کنی و از این طریق با ابعاد متفاوت عکاسی و مسیرش از فن به فرهنگ و هنر آشنا می‌شوی.
                </p>
              </div>

              {/* Box 2: How to Play */}
              <div className="border-2 border-[#1e1b18] rounded-2xl p-3.5 bg-[#ffffff] shadow-[2.5px_2.5px_0px_#1e1b18] text-right flex flex-col items-start">
                <div className="flex items-center gap-2 font-black text-xs text-[#1e1b18] mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#f59e0b] shrink-0" />
                  <span>چگونه بازی کنیم؟</span>
                </div>
                <ul className="text-[11px] sm:text-xs text-[#475569] leading-relaxed font-medium text-right space-y-1 w-full list-none">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#f59e0b] font-bold shrink-0">•</span>
                    <span>در هر گالری تکه‌های پازل رو جمع کن</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#f59e0b] font-bold shrink-0">•</span>
                    <span>اطلاعات جالب رو کشف کن یا با تجربه‌های تعاملی آشنا شو</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#f59e0b] font-bold shrink-0">•</span>
                    <span>و با استفاده از فلش‌های راهنما به گالری بعدی برو تا به زمان حال برسی</span>
                  </li>
                </ul>
              </div>

              {/* Box 3: Elements Guide (Puzzles, Stars, Coins, Experience, End of Visit) */}
              <div className="border-2 border-[#1e1b18] rounded-2xl p-3 sm:p-3.5 bg-[#ffffff] shadow-[2.5px_2.5px_0px_#1e1b18] text-right flex flex-col gap-2.5">
                <div className="flex items-center text-right gap-2.5">
                  <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#c084fc] flex items-center justify-center shrink-0">
                    <Puzzle className="w-4 h-4 text-[#1e1b18]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1e1b18] block">پازل‌ها</span>
                    <p className="text-[11px] text-[#581c87] font-medium leading-tight">
                      در هر گالری به محدوده پازل‌ها برو. سؤالات پازل تو را با هویت عکاسی در هر دوره آشنا می‌کنند.
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-[#e2e8f0] w-full" />

                <div className="flex items-center text-right gap-2.5">
                  <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#34d399] flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-[#1e1b18]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1e1b18] block">ستاره‌ها</span>
                    <p className="text-[11px] text-[#064e3b] font-medium leading-tight">
                      با رفتن به محدوده نقاط ستاره می‌تونی با سکه یا پاسخ به سؤال اطلاعات اضافه و جالب کشف کنی.
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-[#e2e8f0] w-full" />

                <div className="flex items-center text-right gap-2.5">
                  <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#facc15] flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4 text-[#1e1b18]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1e1b18] block">سکه‌ها</span>
                    <p className="text-[11px] text-[#713f12] font-medium leading-tight">
                      سکه‌ها بخشی از پاداش پاسخ به سؤالات ستاره یا تجربه هستند و می‌تونی با اون‌ها قفل گالری یا اطلاعات رو باز کنی.
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-[#e2e8f0] w-full" />

                <div className="flex items-center text-right gap-2.5">
                  <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#38bdf8] flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4 text-[#1e1b18]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1e1b18] block">تجربه</span>
                    <p className="text-[11px] text-[#0369a1] font-medium leading-tight">
                      این نقاط حاوی اطلاعات جالب یا محتوای چندرسانه‌ای درباره ابزارهای تجربه تعاملی در موزه هستند.
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-[#e2e8f0] w-full" />

                <div className="flex items-center text-right gap-2.5">
                  <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#fb923c] flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-[#1e1b18]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#1e1b18] block">پایان بازدید</span>
                    <p className="text-[11px] text-[#7c2d12] font-medium leading-tight">
                      گواهی‌نامه کشف تاریخ عکاسی را به همراه یک جایزه از طرف موزه دریافت می‌کنی.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="neo-btn w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-[#1e1b18] text-[13px] font-black cursor-pointer"
            >
              کاوش در نقشه موزه
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

