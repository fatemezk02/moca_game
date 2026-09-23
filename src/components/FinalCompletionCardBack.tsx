import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { MuseumExplorerBadge } from './MuseumExplorerBadge';

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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const GOOGLE_SCRIPT_FEEDBACK_URL =
    'https://script.google.com/macros/s/AKfycbxATDjK2Z5-oeKHeJo9pYVj0OEodnRM75WpMLNmp7p_r3htAICuQoqndiDKid_JIWPP/exec';

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = feedbackText.trim();
    if (!textToSend || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Local backup save
      try {
        const STORAGE_FEEDBACK_KEY = 'museum_game_feedback_list';
        const existing = JSON.parse(localStorage.getItem(STORAGE_FEEDBACK_KEY) || '[]');
        existing.push({
          feedback: textToSend,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem(STORAGE_FEEDBACK_KEY, JSON.stringify(existing));
      } catch {
        // ignore
      }

      // Send POST request with JSON body { "feedback": userFeedbackText }
      await fetch(GOOGLE_SCRIPT_FEEDBACK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          feedback: textToSend,
        }),
      });
    } catch (err) {
      console.error('Feedback submission error:', err);
    } finally {
      setIsSubmitting(false);
      setFeedbackText('');
      setIsSubmitted(true);
    }
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
          تو موفق شدی در سفر تاریخی عکاسی آثار رو مهمی رو برای گنجینه موزه هنرهای معاصر جمع آوری کنی.
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

      {/* BOTTOM SECTION: «نظرسنجی بازی» Button */}
      <div className="relative z-10 pt-2 border-t border-[#e5e7eb]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isFlipped ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.35, duration: 0.3 }}
        >
          <button
            id="open-game-feedback-btn"
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="w-full py-3 sm:py-3.5 px-4 bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-[#1e1b18] font-black text-base sm:text-lg border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1e1b18]"
          >
            <MessageSquare className="w-5 h-5 text-[#1e1b18]" />
            <span>نظرسنجی بازی</span>
          </button>
        </motion.div>
      </div>

      {/* Feedback Modal / Card above the Certificate */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div
            id="game-feedback-modal-backdrop"
            className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-[#0e0f0f]/60 backdrop-blur-xs select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsFeedbackOpen(false);
              }
            }}
          >
            <motion.div
              id="game-feedback-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm sm:max-w-md bg-[#fcfaf7] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] p-4 sm:p-5 text-[#1e1b18] font-sans-custom flex flex-col gap-3 sm:gap-4"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2.5">
                <h3 className="text-base sm:text-lg font-black text-[#1e1b18]">
                  نظر شما درباره بازی
                </h3>
                <button
                  id="close-feedback-modal-btn"
                  type="button"
                  onClick={() => {
                    setIsFeedbackOpen(false);
                    setIsSubmitted(false);
                  }}
                  aria-label="بستن"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-[#ef4444] hover:text-white transition-colors text-[#1e1b18] border border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </button>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-3">
                  <textarea
                    id="game-feedback-textarea"
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="نظرات و پیشنهادات خود را بنویسید..."
                    disabled={isSubmitting}
                    className="w-full p-3 bg-white border-2 border-[#1e1b18] rounded-xl text-sm font-medium text-[#1e1b18] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#f59e0b] shadow-[2px_2px_0px_#1e1b18] resize-none disabled:opacity-60"
                    autoFocus
                  />
                  <button
                    id="submit-game-feedback-btn"
                    type="submit"
                    disabled={!feedbackText.trim() || isSubmitting}
                    className="w-full py-2.5 sm:py-3 px-4 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed text-[#1e1b18] font-black text-sm sm:text-base border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1e1b18]"
                  >
                    <Send className={`w-4 h-4 text-[#1e1b18] ${isSubmitting ? 'animate-spin' : ''}`} />
                    <span>{isSubmitting ? 'در حال ارسال...' : 'ارسال نظر'}</span>
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#dcfce7] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center text-[#15803d]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm sm:text-base font-black text-[#15803d] leading-relaxed">
                    نظر شما ثبت شد، ممنون از همراهی شما
                  </p>
                  <button
                    id="feedback-success-close-btn"
                    type="button"
                    onClick={() => {
                      setIsFeedbackOpen(false);
                      setIsSubmitted(false);
                    }}
                    className="mt-2 py-2 px-6 bg-white hover:bg-[#f3f4f6] text-[#1e1b18] font-bold text-sm border-2 border-[#1e1b18] rounded-xl shadow-[2px_2px_0px_#1e1b18] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    بستن
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
