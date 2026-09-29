import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, Ticket, Key, Star, Coins, Coffee, Frown, X, Check, Copy, HelpCircle } from 'lucide-react';
import { getLuckMachineState, LuckMachineState } from '../data/luckMachineStore';
import { getDarkroomRiddleState, DarkroomDiscountRecord } from '../data/darkroomRiddleStore';
import { isFinalCompletionAwarded, getFinalCardCode } from '../data/finalCompletionStore';
import { ExperienceIcon } from './ExperienceIcon';
import { toPersianDigits } from '../services/content/mappers';

interface RewardCircleModalData {
  title: string;
  subtitle: string;
  code?: string;
  description: string;
  icon: React.ReactNode;
  bgCircleColor: string;
}

interface PlayerGameRewardsBarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayerGameRewardsBar: React.FC<PlayerGameRewardsBarProps> = ({
  className = '',
  size = 'md',
}) => {
  const [luckState, setLuckState] = useState<LuckMachineState>(() => getLuckMachineState());
  const [darkroomState, setDarkroomState] = useState<DarkroomDiscountRecord>(() => getDarkroomRiddleState());
  const [isFinalAwarded, setIsFinalAwarded] = useState<boolean>(() => isFinalCompletionAwarded());
  const [finalCardCode, setFinalCardCode] = useState<string | null>(() => getFinalCardCode());
  const [activeModalData, setActiveModalData] = useState<RewardCircleModalData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const handleLuckUpdate = () => {
      setLuckState(getLuckMachineState());
    };
    const handleDarkroomUpdate = () => {
      setDarkroomState(getDarkroomRiddleState());
    };
    const handleFinalUpdate = () => {
      setIsFinalAwarded(isFinalCompletionAwarded());
      setFinalCardCode(getFinalCardCode());
    };
    const handleReset = () => {
      setLuckState(getLuckMachineState());
      setDarkroomState(getDarkroomRiddleState());
      setIsFinalAwarded(false);
      setFinalCardCode(null);
    };

    window.addEventListener('museum_luck_machine_updated', handleLuckUpdate);
    window.addEventListener('museum_darkroom_solved_updated', handleDarkroomUpdate);
    window.addEventListener('museum_final_completion_awarded', handleFinalUpdate);
    window.addEventListener('museum_final_card_code_generated', handleFinalUpdate);
    window.addEventListener('museum_game_fully_reset', handleReset);

    return () => {
      window.removeEventListener('museum_luck_machine_updated', handleLuckUpdate);
      window.removeEventListener('museum_darkroom_solved_updated', handleDarkroomUpdate);
      window.removeEventListener('museum_final_completion_awarded', handleFinalUpdate);
      window.removeEventListener('museum_final_card_code_generated', handleFinalUpdate);
      window.removeEventListener('museum_game_fully_reset', handleReset);
    };
  }, []);

  const handleCopyCode = (code: string) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // 1. Luck Machine Circle computation
  const isLuckWon = luckState.hasSpun && luckState.prizeType && luckState.prizeType !== 'empty';
  const isLuckEmpty = luckState.hasSpun && luckState.prizeType === 'empty';

  // Determine icon & content for luck circle
  const renderLuckIcon = () => {
    if (!luckState.hasSpun) {
      // Inactive initial state: Luck machine dice icon
      return <Dices className="w-4 h-4 text-[#78350f] stroke-[2.2]" />;
    }

    if (isLuckEmpty) {
      return <Frown className="w-4 h-4 text-[#64748b] stroke-[2.2]" />;
    }

    switch (luckState.prizeType) {
      case 'cafe_discount':
        return (
          <div className="flex flex-col items-center justify-center leading-none">
            <Coffee className="w-3.5 h-3.5 text-[#b45309] stroke-[2.2]" />
            <span className="text-[7.5px] font-black text-[#b45309] -mt-0.5">
              {toPersianDigits(luckState.cafeDiscountPercent || 25)}٪
            </span>
          </div>
        );
      case 'coins':
        return (
          <div className="flex flex-col items-center justify-center leading-none">
            <Coins className="w-3.5 h-3.5 text-[#ea580c] fill-[#fb923c] stroke-[2]" />
            <span className="text-[7.5px] font-black text-[#ea580c] -mt-0.5">
              +{toPersianDigits(luckState.coinsAwarded || 15)}
            </span>
          </div>
        );
      case 'next_gallery':
        return <Key className="w-4 h-4 text-[#d97706] stroke-[2.2]" />;
      case 'gallery03_stars':
        return <Star className="w-4 h-4 text-[#eab308] fill-[#fde047] stroke-[2]" />;
      case 'gallery03_first_experience':
        return <ExperienceIcon iconId="frame" className="w-4.5 h-4.5" />;
      default:
        return <Dices className="w-4 h-4 text-[#78350f] stroke-[2.2]" />;
    }
  };

  const getLuckBgClass = () => {
    if (!luckState.hasSpun) {
      return 'bg-[#f1f5f9] border-[#94a3b8] opacity-60 shadow-[1px_1px_0px_#94a3b8]';
    }
    if (isLuckEmpty) {
      return 'bg-[#f1f5f9] border-[#94a3b8] shadow-[1.5px_1.5px_0px_#94a3b8]';
    }
    return 'bg-[#fef3c7] border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] ring-2 ring-[#fde68a]';
  };

  const handleLuckCircleClick = () => {
    if (!luckState.hasSpun) {
      setActiveModalData({
        title: 'دستگاه شانس گالری ۰۲',
        subtitle: 'هنوز دریافت نشده',
        description: 'با حل هر سه پازل گالری ۰۲، شانس خود را برای دریافت جوایز ویژه امتحان کنید.',
        icon: <Dices className="w-8 h-8 text-[#78350f]" />,
        bgCircleColor: 'bg-[#fef3c7]',
      });
      return;
    }

    if (isLuckEmpty) {
      setActiveModalData({
        title: 'نتیجه دستگاه شانس',
        subtitle: 'پوچ',
        description: 'در این چرخش جایزه‌ای تعلق نگرفت. در طول بازی به کاوش ادامه دهید!',
        icon: <Frown className="w-8 h-8 text-[#64748b]" />,
        bgCircleColor: 'bg-[#f1f5f9]',
      });
      return;
    }

    // Won prize
    const isCafe = luckState.prizeType === 'cafe_discount';
    setActiveModalData({
      title: 'جایزه دستگاه شانس',
      subtitle: luckState.prizeName || 'پاداش شانس',
      code: isCafe ? luckState.cafeCode : undefined,
      description: isCafe
        ? `کوپن تخفیف ${toPersianDigits(luckState.cafeDiscountPercent || 25)} درصدی برای استفاده در کافه موزه.`
        : luckState.prizeType === 'coins'
        ? `${toPersianDigits(luckState.coinsAwarded || 15)} سکه بازی به حسابت اضافه شد.`
        : luckState.prizeType === 'next_gallery'
        ? `قفل تالار بعدی (${luckState.unlockedGalleryNumber ? toPersianDigits(luckState.unlockedGalleryNumber) : ''}) بازگشایی شد.`
        : luckState.prizeType === 'gallery03_stars'
        ? 'ستاره‌های گالری ۰۳ باز شدند.'
        : `تجربه «${luckState.unlockedExperienceName || 'هم‌قاب با چهره‌ها'}» بازگشایی شد.`,
      icon: renderLuckIcon(),
      bgCircleColor: 'bg-[#fef3c7]',
    });
  };

  // 2. Darkroom Riddle Circle computation
  const isDarkroomSolved = darkroomState.isSolved;
  const isDarkroomExhausted = Boolean(
    darkroomState.isExhausted || (!darkroomState.isSolved && (darkroomState.wrongAttempts || 0) >= 3)
  );

  const renderDarkroomIcon = () => {
    if (!isDarkroomSolved) {
      // Inactive darkroom puzzle icon (question mark)
      return <HelpCircle className="w-4 h-4 text-[#64748b] stroke-[2.2]" />;
    }
    // Solved: discount percentage icon
    return (
      <div className="flex flex-col items-center justify-center leading-none">
        <span className="text-[10px] font-black text-[#831843]">۵۰٪</span>
        <span className="text-[6.5px] font-bold text-[#831843] -mt-0.5">تخفیف</span>
      </div>
    );
  };

  const getDarkroomBgClass = () => {
    if (!isDarkroomSolved) {
      return 'bg-[#f1f5f9] border-[#94a3b8] opacity-60 shadow-[1px_1px_0px_#94a3b8]';
    }
    return 'bg-[#fce7f3] border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] ring-2 ring-[#fbcfe8]';
  };

  const handleDarkroomCircleClick = () => {
    if (!isDarkroomSolved) {
      setActiveModalData({
        title: 'معمای تاریکخانه (گالری ۰۸)',
        subtitle: 'هنوز حل نشده',
        description: 'با کشف رمز ۶ رقمی تاریکخانه در گالری ۰۸، کد تخفیف ۵۰٪ کارت‌پستال را دریافت کنید.',
        icon: <HelpCircle className="w-8 h-8 text-[#831843] stroke-[2]" />,
        bgCircleColor: 'bg-[#ede9fe]',
      });
      return;
    }

    setActiveModalData({
      title: 'جایزه معمای تاریکخانه',
      subtitle: 'تخفیف ۵۰ درصدی کارت‌پستال',
      code: darkroomState.code || undefined,
      description: 'با ارائه این کد تخفیف به کتابفروشی موزه، از ۵۰٪ تخفیف خرید کارت‌پستال بهره‌مند شوید.',
      icon: (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-xl font-black text-[#831843]">۵۰٪</span>
          <span className="text-[9px] font-bold text-[#831843]">تخفیف</span>
        </div>
      ),
      bgCircleColor: 'bg-[#fce7f3]',
    });
  };

  // 3. Final Trophy / Ticket Circle computation
  const isTicketReceived = isFinalAwarded;

  const renderTrophyIcon = () => {
    if (!isTicketReceived) {
      // Inactive cup / trophy icon
      return (
        <svg
          className="w-4 h-4 text-[#94a3b8] opacity-75"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M18 9h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
          <path d="M6 2h12v7a6 6 0 0 1-12 0V2z" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 21H4v1.5h16V21h-3c0-.76-.85-2.25-2.03-2.79-.5-.23-.97-.66-.97-1.21v-2.34H10z" />
        </svg>
      );
    }
    // Received: ticket icon
    return <Ticket className="w-4 h-4 text-[#16a34a] stroke-[2.2]" />;
  };

  const getTrophyBgClass = () => {
    if (!isTicketReceived) {
      return 'bg-[#f1f5f9] border-[#94a3b8] opacity-60 shadow-[1px_1px_0px_#94a3b8]';
    }
    return 'bg-[#dcfce7] border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] ring-2 ring-[#bbf7d0]';
  };

  const handleTrophyCircleClick = () => {
    if (!isTicketReceived) {
      setActiveModalData({
        title: 'بلیت رایگان پایان بازی',
        subtitle: 'هنوز دریافت نشده',
        description: 'با تکمیل تمام ۸ تالار موزه، کارت کاشف موزه و بلیت رایگان بازدید مجدد را به دست آورید.',
        icon: (
          <svg
            className="w-8 h-8 text-[#94a3b8]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M18 9h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
            <path d="M6 2h12v7a6 6 0 0 1-12 0V2z" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 21H4v1.5h16V21h-3c0-.76-.85-2.25-2.03-2.79-.5-.23-.97-.66-.97-1.21v-2.34H10z" />
          </svg>
        ),
        bgCircleColor: 'bg-[#fef3c7]',
      });
      return;
    }

    setActiveModalData({
      title: 'بلیت رایگان بازدید دوباره از موزه',
      subtitle: 'کارت کاشف موزه فعال شد',
      code: finalCardCode || undefined,
      description: 'این کارت و بلیت به منزله ورود رایگان مجدد به موزه هنرهای معاصر است.',
      icon: <Ticket className="w-8 h-8 text-[#16a34a]" />,
      bgCircleColor: 'bg-[#dcfce7]',
    });
  };

  const circleDimensions =
    size === 'lg'
      ? 'w-11 h-11 sm:w-12 sm:h-12'
      : size === 'md'
      ? 'w-9 h-9 sm:w-10 sm:h-10'
      : 'w-7 h-7 sm:w-7.5 sm:h-7.5';

  return (
    <>
      {/* 3 Circular Reward Badges row */}
      <div
        id="player-rewards-strip"
        dir="ltr"
        className={`flex items-center gap-2.5 sm:gap-3.5 pointer-events-auto ${className}`}
      >
        {/* 1. Luck Machine Circle (hidden if spun and result is empty / پوچ) */}
        {!isLuckEmpty && (
          <button
            type="button"
            onClick={handleLuckCircleClick}
            title="دستگاه شانس"
            aria-label="دستگاه شانس"
            className={`${circleDimensions} rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${getLuckBgClass()}`}
          >
            {renderLuckIcon()}
          </button>
        )}

        {/* 2. Darkroom Riddle Circle (hidden if exhausted) */}
        {!isDarkroomExhausted && (
          <button
            type="button"
            onClick={handleDarkroomCircleClick}
            title="معمای تاریکخانه"
            aria-label="معمای تاریکخانه"
            className={`${circleDimensions} rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${getDarkroomBgClass()}`}
          >
            {renderDarkroomIcon()}
          </button>
        )}

        {/* 3. Final Trophy / Ticket Circle */}
        <button
          type="button"
          onClick={handleTrophyCircleClick}
          title="بلیت و دستاورد پایانی"
          aria-label="بلیت و دستاورد پایانی"
          className={`${circleDimensions} rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${getTrophyBgClass()}`}
        >
          {renderTrophyIcon()}
        </button>
      </div>

      {/* Info / Discount Code Popover Modal */}
      <AnimatePresence>
        {activeModalData && (
          <div
            id="reward-detail-modal-backdrop"
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0e0f0f]/60 backdrop-blur-xs select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveModalData(null);
              }
            }}
          >
            <motion.div
              id="reward-detail-modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[4px_4px_0px_#1e1b18] p-4 text-[#1e1b18] font-sans-custom relative flex flex-col items-center text-center"
              dir="rtl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveModalData(null)}
                aria-label="بستن"
                className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-[#f1f5f9] hover:bg-[#fee2e2] text-[#1e1b18] border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Icon Medallion */}
              <div
                className={`w-14 h-14 rounded-full border-[2px] border-[#1e1b18] ${activeModalData.bgCircleColor} shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center mb-2.5 shrink-0`}
              >
                {activeModalData.icon}
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-black text-[15px] sm:text-[16px] text-[#1e1b18] mb-0.5">
                {activeModalData.title}
              </h3>
              <p className="font-bold text-[12px] sm:text-[13px] text-[#b45309] mb-2">
                {activeModalData.subtitle}
              </p>

              {/* Description */}
              <p className="text-[11.5px] text-[#4b5563] leading-relaxed mb-3 px-1">
                {activeModalData.description}
              </p>

              {/* Coupon / Discount Code (if available) */}
              {activeModalData.code && (
                <div className="w-full p-2.5 bg-[#fefce8] border-2 border-dashed border-[#b45309] rounded-xl shadow-[1.5px_1.5px_0px_#1e1b18] mb-3 flex flex-col items-center gap-1.5">
                  <span className="text-[10.5px] font-bold text-[#854d0e]">
                    کد تخفیف اختصاصی:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      dir="ltr"
                      className="font-mono font-black text-[15px] sm:text-[16px] text-[#1e1b18] tracking-widest select-all bg-white px-2.5 py-1 rounded-lg border border-[#1e1b18]"
                    >
                      {activeModalData.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(activeModalData.code!)}
                      title="کپی کردن کد"
                      className="p-1.5 rounded-lg bg-white border border-[#1e1b18] text-[#1e1b18] hover:bg-[#fef3c7] shadow-[1px_1px_0px_#1e1b18] active:translate-y-0.5 cursor-pointer transition-all"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <span className="text-[10px] text-emerald-700 font-bold">
                      کد با موفقیت کپی شد!
                    </span>
                  )}
                </div>
              )}

              {/* Dismiss Action */}
              <button
                type="button"
                onClick={() => setActiveModalData(null)}
                className="w-full py-2 bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] border-2 border-[#1e1b18] rounded-xl shadow-[2px_2px_0px_#1e1b18] font-bold text-[12.5px] cursor-pointer active:translate-y-0.5 transition-all"
              >
                متوجه شدم
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
