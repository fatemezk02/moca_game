import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check, Sparkles, Award } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { MuseumExplorerBadge } from './MuseumExplorerBadge';
import {
  getFinalCardCode,
  isFinalCardClaimed,
  generateAndSaveFinalCardCode,
} from '../data/finalCompletionStore';

interface FinalCompletionCardBackProps {
  onClose: () => void;
  onFlipBack?: () => void;
  // Trigger timestamp or prop to coordinate sequential entrance
  isFlipped: boolean;
}

export const FinalCompletionCardBack: React.FC<FinalCompletionCardBackProps> = ({
  onClose,
  onFlipBack,
  isFlipped,
}) => {
  const [code, setCode] = useState<string | null>(() => getFinalCardCode());
  const [claimed, setClaimed] = useState<boolean>(() => isFinalCardClaimed());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isFlipped) {
      const savedCode = getFinalCardCode();
      if (savedCode) {
        setCode(savedCode);
        setClaimed(true);
      }
    }
  }, [isFlipped]);

  const handleClaim = () => {
    const generated = generateAndSaveFinalCardCode();
    setCode(generated);
    setClaimed(true);
  };

  const handleCopy = () => {
    if (!code) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="final-completion-card-back"
      className="relative w-full h-full min-h-[460px] sm:min-h-[500px] bg-[#fcfaf7] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] flex flex-col justify-between p-4 sm:p-5 text-[#1e1b18] font-sans-custom overflow-y-auto select-none"
      dir="rtl"
    >
      {/* Ornate decorative inner border certificate frame */}
      <div className="absolute inset-2 sm:inset-2.5 border border-[#d97706]/35 rounded-xl pointer-events-none" />

      {/* Top Bar with Close Button */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#e5e7eb] pb-2 sm:pb-3">
        <div className="flex items-center gap-2">
          {/* Close Button */}
          <button
            id="final-card-close-btn"
            type="button"
            onClick={onClose}
            aria-label="بستن کارت"
            className="w-8 h-8 rounded-full bg-white hover:bg-[#ef4444] hover:text-white transition-colors text-[#1e1b18] border border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] flex items-center justify-center cursor-pointer active:translate-x-[1px] active:translate-y-[1px] shrink-0"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {onFlipBack && (
            <button
              id="final-card-flip-back-btn"
              type="button"
              onClick={onFlipBack}
              title="مشاهده اطلاعات اثر"
              aria-label="مشاهده اطلاعات اثر"
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#f3f4f6] text-[#64748b] hover:text-[#1e1b18] border border-[#1e1b18] text-[10px] sm:text-[11px] font-bold shadow-[1px_1px_0px_#1e1b18] cursor-pointer transition-all"
            >
              مشاهده اثر
            </button>
          )}
        </div>

        {/* Certificate Badge Ribbon */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#fef3c7] border border-[#d97706] text-[#b45309] font-black text-[11px] shadow-[1px_1px_0px_#d97706]">
          <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
          <span>کارت دستاورد نهایی</span>
        </div>
      </div>

      {/* Main Congratulatory Content Section */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-2 sm:py-3 space-y-2.5 sm:space-y-3">
        {/* Subtle celebratory tagline */}
        <span className="text-[11px] sm:text-[12px] font-bold text-[#d97706] tracking-wide">
          ✨ تبریک! مأموریتت با موفقیت به پایان رسید ✨
        </span>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-[#1e1b18] tracking-tight">
          کاشف موزه
        </h2>

        {/* Main congratulatory text */}
        <p className="text-[13px] sm:text-[14px] font-bold text-[#1e1b18] leading-relaxed max-w-[340px] px-1">
          تو آثار گمشده در موزه را کامل کردی و بازدیدت را با موفقیت به پایان رساندی.
        </p>

        {/* Free return-visit ticket notice */}
        <p className="text-[12px] sm:text-[13px] font-medium text-[#b45309] bg-[#fef3c7]/60 border border-[#f59e0b]/40 rounded-xl px-3.5 py-2 leading-relaxed max-w-[340px]">
          این کارت به منزلهٔ بلیت رایگان بازدید دوباره از موزه برای توست.
        </p>
      </div>

      {/* LOWER AREA: Museum Stamp + Explorer Badge Animated Landing */}
      <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6 py-2 my-1">
        {/* 1. Museum Logo Stamp */}
        <motion.div
          id="museum-logo-stamp"
          initial={{ scale: 1.6, opacity: 0, rotate: -35, y: -22 }}
          animate={
            isFlipped
              ? {
                  scale: [1.6, 0.94, 1.02, 1],
                  opacity: [0, 1, 1, 1],
                  rotate: [-35, -8, -6, -8],
                  y: [-22, 0, -2, 0],
                }
              : {}
          }
          transition={{
            delay: 0.65,
            duration: 0.45,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-dashed border-[#991b1b] bg-[#fee2e2]/30 flex flex-col items-center justify-center p-1.5 shadow-[0_0_0_2px_#991b1b] text-[#991b1b] select-none"
        >
          <div className="absolute inset-1 rounded-full border border-[#991b1b]/40 pointer-events-none" />
          <span className="text-[8px] font-black tracking-tighter leading-none mb-0.5">
            موزه هنرهای معاصر
          </span>
          <div className="w-8 h-8 flex items-center justify-center my-0.5">
            <AppLogo className="w-7 h-7 text-[#991b1b]" />
          </div>
          <span className="text-[7.5px] font-bold tracking-tight leading-none mt-0.5">
            تأیید بازدید رسمی
          </span>
        </motion.div>

        {/* 2. Explorer Badge - Stamped directly onto paper, without outer card box or generic icon */}
        <motion.div
          id="museum-explorer-badge"
          initial={{ scale: 1.6, opacity: 0, rotate: 28, y: -24 }}
          animate={
            isFlipped
              ? {
                  scale: [1.6, 0.92, 1.03, 1],
                  opacity: [0, 1, 1, 1],
                  rotate: [28, 5, 3, 4],
                  y: [-24, 0, -2, 0],
                }
              : {}
          }
          transition={{
            delay: 0.95,
            duration: 0.45,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="relative flex items-center justify-center select-none"
        >
          <MuseumExplorerBadge className="w-20 h-24 sm:w-22 sm:h-26" />
        </motion.div>
      </div>

      {/* BOTTOM SECTION: «دریافت کارت» Button OR 4-Letter Code Display */}
      <div className="relative z-10 pt-2 border-t border-[#e5e7eb]">
        {!claimed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isFlipped ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.35, duration: 0.3 }}
          >
            <button
              id="claim-final-card-btn"
              type="button"
              onClick={handleClaim}
              className="w-full py-3 sm:py-3.5 px-4 bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-[#1e1b18] font-black text-base sm:text-lg border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1e1b18]"
            >
              <Award className="w-5 h-5 text-[#1e1b18]" />
              <span>دریافت کارت</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-2"
          >
            <span className="text-[11px] sm:text-[12px] font-bold text-[#4a443b]">
              کد دریافت کارت
            </span>

            {/* Visual Prominent 4-Letter Monospace Code */}
            <div className="flex items-center justify-center gap-2">
              <div
                id="final-card-generated-code"
                dir="ltr"
                className="bg-white border-2 border-[#1e1b18] rounded-xl px-5 py-2 font-mono text-2xl sm:text-3xl font-black text-[#1e1b18] tracking-[0.25em] shadow-[3px_3px_0px_#1e1b18] select-all"
              >
                {code}
              </div>

              <button
                id="copy-final-code-btn"
                type="button"
                onClick={handleCopy}
                title="کپی کردن کد"
                aria-label="کپی کردن کد"
                className="p-2.5 rounded-xl bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-[#15803d]" />
                ) : (
                  <Copy className="w-5 h-5 text-[#1e1b18]" />
                )}
              </button>
            </div>

            {/* Instruction Message */}
            <p className="text-[12px] sm:text-[13px] font-bold text-[#1e1b18] pt-1">
              میتونی از بخش کیچ استور بلیتت رو دریافت کنی.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
