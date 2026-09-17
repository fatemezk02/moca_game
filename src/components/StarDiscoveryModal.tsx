import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  BookOpen,
  HelpCircle,
  Coins,
  CheckCircle2,
  Check,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Info,
  Star,
} from 'lucide-react';
import { getStarDiscovery } from '../data/starDiscoveryData';
import {
  isStarPointUnlocked,
  unlockStarPointViaQuestion,
  unlockStarPointViaCoins,
  getStarPointProgress,
  getUnlockedInformationStarsCount,
  hasStarPointQuestionFailed,
  markStarPointQuestionFailed,
} from '../data/starPointProgressStore';
import { contentService } from '../services/content/contentService';
import { toPersianDigits, formatTwoDigitPersian } from '../services/content/mappers';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { deductCoins } from '../data/questionProgressStore';
import { ArtworkFrame } from './ArtworkFrame';

export interface StarDiscoveryModalProps {
  starPointId?: string;
  starId?: string;
  galleryId?: string;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'discovery' | 'direct_info';
}

type ModalPhase =
  | 'initial_choice'    // Title, Intro, [سؤال], [اطلاعات بیشتر]
  | 'payment_confirm'   // Confirm paying 30 coins for info
  | 'question'          // Answering the discovery question
  | 'correct_answer'    // Question correct (+50 coins, unlocked)
  | 'incorrect_answer'  // Question incorrect (0 coins, locked)
  | 'artwork_info';     // View artwork image and detailed info

/**
 * ============================================================================
 * STANDARDIZED STAR POINT DISCOVERY MODAL
 * ============================================================================
 * Unified modal and interaction flow for all Star Points:
 * 1. If already unlocked -> opens 'artwork_info' directly.
 * 2. If locked -> opens 'initial_choice' with:
 *    - Title
 *    - Short intro
 *    - [ سؤال ] (Question path: +50 coins on correct answer)
 *    - [ اطلاعات بیشتر ] (More info path: cost 30 coins)
 */
export const StarDiscoveryModal: React.FC<StarDiscoveryModalProps> = ({
  starPointId,
  starId,
  galleryId = 'gallery-01',
  isOpen,
  onClose,
  initialMode,
}) => {
  const effectiveStarPointId = starPointId || starId || '';
  const effectiveStarId = starId || starPointId || '';
  const playerStats = usePlayerStats();

  // Content subscription to ensure live re-render when Google Sheets data finishes loading
  const [, setContentVersion] = useState(0);
  useEffect(() => {
    return contentService.subscribe(() => {
      setContentVersion((v) => v + 1);
    });
  }, []);

  const discoveryData = getStarDiscovery(effectiveStarPointId, galleryId, effectiveStarId);

  const [phase, setPhase] = useState<ModalPhase>('initial_choice');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [wrongOptionIndex, setWrongOptionIndex] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [artworkImageError, setArtworkImageError] = useState(false);
  const wrongAnswerTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (wrongAnswerTimerRef.current) {
        clearTimeout(wrongAnswerTimerRef.current);
        wrongAnswerTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setArtworkImageError(false);
  }, [effectiveStarPointId, discoveryData?.information?.image]);

  // Dynamic calculation of information unlock progress
  const [progressCount, setProgressCount] = useState<{ unlocked: number; total: number }>(() => {
    const activeStars = contentService.getStars().filter((s) => s.active !== false);
    const total = activeStars.length > 0 ? activeStars.length : 8;
    const unlocked = getUnlockedInformationStarsCount(activeStars);
    return { unlocked, total };
  });

  useEffect(() => {
    const updateCounts = () => {
      const activeStars = contentService.getStars().filter((s) => s.active !== false);
      const total = activeStars.length > 0 ? activeStars.length : 8;
      const unlocked = getUnlockedInformationStarsCount(activeStars);
      setProgressCount({ unlocked, total });
    };

    updateCounts();
    window.addEventListener('museum_star_point_progress_updated', updateCounts);
    const unsub = contentService.subscribe(() => updateCounts());

    return () => {
      window.removeEventListener('museum_star_point_progress_updated', updateCounts);
      unsub();
    };
  }, [isOpen]);

  // Resolve gallery number dynamically from Galleries content
  const targetGalleryId = discoveryData?.galleryId || galleryId;
  const starGallery = contentService.getGalleryById(targetGalleryId);
  const rawGalleryNum = starGallery?.galleryNumber || discoveryData?.galleryNumber || (targetGalleryId.includes('3') ? '03' : '01');
  const formattedGalleryNum = formatTwoDigitPersian(rawGalleryNum);

  // Resolve star number deterministically from Star record identity
  const deriveStarNumber = (): string => {
    if (discoveryData?.starNumber) {
      return discoveryData.starNumber;
    }
    const starIdStr = discoveryData?.starId || discoveryData?.id || effectiveStarPointId || '';
    const numMatch = starIdStr ? starIdStr.match(/\d+/)?.[0] : null;
    if (numMatch) {
      return parseInt(numMatch, 10).toString();
    }
    const activeStars = contentService
      .getStars()
      .filter((s) => s.active !== false && s.galleryId === targetGalleryId);
    const starIdx = activeStars.findIndex(
      (s) => (s.starId || s.id) === (discoveryData?.starId || discoveryData?.id)
    );
    return (starIdx >= 0 ? starIdx + 1 : 1).toString();
  };

  const formattedStarNum = toPersianDigits(deriveStarNumber());

  // Dynamic top title pattern: کشف [Star Number] ـ گالری [Gallery Number]
  const modalHeaderTitle = `کشف ${formattedStarNum} ـ گالری ${formattedGalleryNum}`;

  // Net reward calculation: correct reward - information cost
  const correctRewardCoins = discoveryData?.question?.correctReward ?? 50;
  const infoUnlockCost = discoveryData?.informationCost ?? 30;
  const netReward = Math.max(0, correctRewardCoins - infoUnlockCost);

  // Auto-transition timer for correct answer sequence (~2 seconds)
  const autoTransitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (phase === 'correct_answer') {
      autoTransitionTimerRef.current = setTimeout(() => {
        setPhase('artwork_info');
      }, 2000);
    }

    return () => {
      if (autoTransitionTimerRef.current) {
        clearTimeout(autoTransitionTimerRef.current);
        autoTransitionTimerRef.current = null;
      }
    };
  }, [phase]);

  useEffect(() => {
    if (!isOpen && autoTransitionTimerRef.current) {
      clearTimeout(autoTransitionTimerRef.current);
      autoTransitionTimerRef.current = null;
    }
  }, [isOpen]);

  // Initialize or reset modal phase whenever opened or when starPointId changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSelectedOption(null);
      setWrongOptionIndex(null);
      setIsAnswering(false);
      if (wrongAnswerTimerRef.current) {
        clearTimeout(wrongAnswerTimerRef.current);
        wrongAnswerTimerRef.current = null;
      }

      const isUnlocked = isStarPointUnlocked(starPointId);
      if (isUnlocked || initialMode === 'direct_info') {
        setPhase('artwork_info');
      } else {
        setPhase('initial_choice');
      }
    } else {
      if (wrongAnswerTimerRef.current) {
        clearTimeout(wrongAnswerTimerRef.current);
        wrongAnswerTimerRef.current = null;
      }
    }
  }, [isOpen, starPointId, initialMode]);

  // Handle choice 1: [ سؤال ] (Discovery Question - Free)
  const handleSelectQuestionChoice = () => {
    setErrorMessage(null);
    setSelectedOption(null);
    setWrongOptionIndex(null);
    setIsAnswering(false);
    if (wrongAnswerTimerRef.current) {
      clearTimeout(wrongAnswerTimerRef.current);
      wrongAnswerTimerRef.current = null;
    }
    setPhase('question');
  };

  // Handle choice 2: [ ۳۰ سکه ] (Payment confirmation - Dynamic cost)
  const handleSelectMoreInfoChoice = () => {
    setErrorMessage(null);
    setPhase('payment_confirm');
  };

  // Handle user answering the question
  const handleSelectQuestionOption = (idx: number) => {
    if (isAnswering || phase !== 'question') return;

    setSelectedOption(idx);
    const correctIdx = discoveryData.question.correctIndex;

    if (idx === correctIdx) {
      setIsAnswering(true);
      // Award NET reward coins (correct_reward_coins - informationCost)
      // and unlock information permanently
      unlockStarPointViaQuestion(starPointId, netReward);
      setPhase('correct_answer');
      setIsAnswering(false);
    } else {
      // No coins deducted on incorrect answer
      markStarPointQuestionFailed(effectiveStarPointId || starPointId || '');
      setWrongOptionIndex(idx);
      setIsAnswering(true);

      if (wrongAnswerTimerRef.current) {
        clearTimeout(wrongAnswerTimerRef.current);
      }
      wrongAnswerTimerRef.current = setTimeout(() => {
        setWrongOptionIndex(null);
        setIsAnswering(false);
        setPhase('incorrect_answer');
      }, 1200);
    }
  };

  // Handle paying coins to unlock information directly
  const handleConfirm30Payment = () => {
    setErrorMessage(null);
    const cost = discoveryData.informationCost || 30;

    if (playerStats.coins < cost) {
      setErrorMessage(`موجودی سکه شما کافی نیست (حداقل ${toPersianDigits(cost)} سکه نیاز است).`);
      return;
    }

    const success = unlockStarPointViaCoins(starPointId, cost);
    if (success) {
      setPhase('artwork_info');
    } else {
      setErrorMessage('تراکنش انجام نشد. موجودی سکه ناکافی است.');
    }
  };

  if (!isOpen) return null;

  if (!discoveryData) {
    console.warn(
      `[StarDiscoveryModal] Missing Star record for Star Point ID "${effectiveStarPointId}", missing star_id: "${effectiveStarId}" in gallery "${galleryId}". Modal cannot display content.`
    );
    return (
      <AnimatePresence>
        <div
          id="star-discovery-modal-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#0e0f0f]/60 backdrop-blur-xs select-none"
          onClick={onClose}
        >
          <motion.div
            id="star-discovery-modal-missing-card"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] p-6 text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#fee2e2] border-2 border-[#1e1b18] flex items-center justify-center text-[#dc2626]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans-custom text-[16px] font-black text-[#1e1b18]">
                محتوای ستاره یافت نشد
              </h3>
              <p className="text-[12px] text-[#64748b] mt-1 font-mono-custom">
                شناسه: {starPointId}
              </p>
              <p className="text-[12px] text-[#475569] mt-2 leading-relaxed">
                برای این نقطه ستاره محتوایی در شیت این گالری تعریف نشده است.
              </p>
            </div>
            <button
              id="star-discovery-close-missing-btn"
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-[#1e1b18] text-[#ffffff] font-bold text-[13px] rounded-xl cursor-pointer hover:bg-[#2a2b2b] transition-all"
            >
              بستن
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div
        id="star-discovery-modal-backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#0e0f0f]/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <motion.div
          id="star-discovery-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Top Header Bar */}
          <div
            id="star-discovery-modal-header"
            className="bg-[#fef3c7] border-b-2 border-[#1e1b18] px-4 py-2.5 flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#fbbf24] border-[1.5px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center text-[#1e1b18] shrink-0">
                <Star className="w-3.5 h-3.5 text-[#d97706] fill-[#fbbf24]" />
              </div>
              <h2
                id="star-modal-header-title"
                className="font-sans-custom text-[13px] sm:text-[14px] font-black text-[#1e1b18] tracking-tight truncate"
              >
                {modalHeaderTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Star Information Unlocked Progress Badge (Replaces Coins HUD) */}
              <div
                id="modal-star-progress-badge"
                title={`پیشرفت بازگشایی اطلاعات ستاره‌ها: ${toPersianDigits(progressCount.unlocked)} از ${toPersianDigits(progressCount.total)}`}
                className="bg-[#ffffff] text-[#1e1b18] border-[1.5px] border-[#1e1b18] rounded-full px-2.5 py-0.5 shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center gap-1.5 font-mono-custom text-[11px] sm:text-[12px] font-black tracking-wider select-none shrink-0"
                dir="ltr"
              >
                <Star className="w-3 h-3 text-[#d97706] fill-[#fbbf24] shrink-0" />
                <span>{toPersianDigits(progressCount.unlocked)} / {toPersianDigits(progressCount.total)}</span>
              </div>

              {/* Close Button */}
              <button
                id="star-discovery-close-btn"
                type="button"
                onClick={onClose}
                aria-label="بستن پنجره"
                className="w-7 h-7 rounded-full bg-[#ffffff] hover:bg-[#ef4444] hover:text-white transition-colors text-[#1e1b18] border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Star Artwork Image - Visible immediately upon modal opening and in all phases */}
          {discoveryData.information.image && !artworkImageError && (
            <div className="w-full flex items-center justify-center overflow-hidden pt-3 px-4 sm:px-5 shrink-0">
              <ArtworkFrame>
                <img
                  src={discoveryData.information.image}
                  alt={discoveryData.titleFa || 'تصویر ستاره اثر'}
                  className="max-h-[22vh] sm:max-h-[25vh] max-w-full w-auto h-auto object-contain block rounded-xs select-none"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    console.warn(
                      `[StarDiscoveryModal] Failed to load artwork image: ${discoveryData.information.image}`
                    );
                    setArtworkImageError(true);
                  }}
                />
              </ArtworkFrame>
            </div>
          )}

          {/* Modal Body Container */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col justify-center">
            {/* ==========================================================
                STAGE 1: TWO INITIAL CHOICES ([سؤال] | [۳۰ سکه])
                ========================================================== */}
            {phase === 'initial_choice' && (
              <motion.div
                key="phase-initial-choice"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 my-auto"
              >
                <div className="text-center space-y-1.5">
                  <h3 className="font-sans-custom text-[16px] sm:text-[17px] font-black text-[#1e1b18] break-words">
                    {discoveryData.titleFa}
                  </h3>
                  {discoveryData.introFa && (
                    <p className="text-[12px] sm:text-[13px] font-medium text-[#475569] leading-relaxed px-2 break-words">
                      {discoveryData.introFa}
                    </p>
                  )}
                </div>

                {/* Action buttons (if question was answered incorrectly once, only the coins unlock button is shown) */}
                {(() => {
                  const isQuestionFailed = hasStarPointQuestionFailed(effectiveStarPointId || starPointId || '');
                  return (
                    <div className={`grid ${isQuestionFailed ? 'grid-cols-1' : 'grid-cols-2'} gap-2.5 sm:gap-3 pt-2`}>
                      {/* Choice 1: [ سؤال ] (Free, leads to discovery question - Hidden if user already failed this question) */}
                      {!isQuestionFailed && (
                        <button
                          id="star-choice-question-btn"
                          type="button"
                          onClick={handleSelectQuestionChoice}
                          className="w-full py-3.5 px-2 sm:px-3 bg-[#ffffff] hover:bg-[#f0fdf4] border-2 border-[#1e1b18] rounded-xl shadow-[2.5px_2.5px_0px_#1e1b18] text-center cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center gap-2 group select-none min-h-[48px]"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#dcfce7] border border-[#1e1b18] flex items-center justify-center text-[#15803d] shrink-0 group-hover:bg-[#86efac] transition-colors">
                            <HelpCircle className="w-4 h-4 text-[#1e1b18]" />
                          </div>
                          <span className="font-sans-custom text-[13px] sm:text-[14px] font-black text-[#1e1b18] whitespace-nowrap">
                            سؤال
                          </span>
                        </button>
                      )}

                      {/* Choice 2: [ ۳۰ سکه ] (Cost resolved dynamically, no "اطلاعات بیشتر" label) */}
                      <button
                        id="star-choice-more-info-btn"
                        type="button"
                        onClick={handleSelectMoreInfoChoice}
                        className="w-full py-3.5 px-2 sm:px-3 bg-[#ffffff] hover:bg-[#fefce8] border-2 border-[#1e1b18] rounded-xl shadow-[2.5px_2.5px_0px_#1e1b18] text-center cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center gap-2 group select-none min-h-[48px]"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#fef3c7] border border-[#1e1b18] flex items-center justify-center text-[#d97706] shrink-0 group-hover:bg-[#fbbf24] transition-colors">
                          <Coins className="w-4 h-4 text-[#1e1b18]" />
                        </div>
                        <span className="font-sans-custom text-[13px] sm:text-[14px] font-black text-[#1e1b18] whitespace-nowrap">
                          {toPersianDigits(discoveryData.informationCost || 30)} سکه
                        </span>
                      </button>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* ==========================================================
                STAGE 2: MORE INFORMATION PATH (PAYMENT CONFIRMATION)
                ========================================================== */}
            {phase === 'payment_confirm' && (
              <motion.div
                key="phase-payment-confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 my-auto text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fef3c7] border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center">
                  <Coins className="w-7 h-7 text-[#d97706]" />
                </div>

                <div>
                  <h3 className="font-sans-custom text-[16px] font-black text-[#1e1b18]">
                    اطلاعات بیشتر اثر
                  </h3>
                  <p className="text-[12px] font-medium text-[#64748b] mt-1">
                    با پرداخت هزینه، مشخصات کامل و تصویر اثر هنری بازگشایی می‌شود.
                  </p>
                </div>

                {/* Cost Box */}
                <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl px-5 py-3 shadow-[2px_2px_0px_#1e1b18] inline-flex flex-col items-center gap-1">
                  <div className="text-[12px] font-bold text-[#64748b]">
                    هزینه بازگشایی:
                  </div>
                  <div className="font-mono-custom text-[18px] font-black text-[#d97706] flex items-center gap-1.5">
                    <span>{toPersianDigits(discoveryData.informationCost || 30)}</span>
                    <span className="text-[15px]">🪙</span>
                    <span className="text-[12px] font-sans-custom text-[#1e1b18]">
                      (کسر از موجودی)
                    </span>
                  </div>
                </div>

                {/* Error Notice if insufficient coins */}
                {errorMessage && (
                  <div className="bg-[#fee2e2] border border-[#ef4444] text-[#991b1b] rounded-lg p-2.5 text-[11px] font-bold flex items-center gap-2 text-right">
                    <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    id="star-pay-30-confirm-btn"
                    type="button"
                    onClick={handleConfirm30Payment}
                    className="w-full py-3 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] active:bg-[#d97706] text-[#1e1b18] font-black text-[14px] border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1.5px_1.5px_0px_#1e1b18]"
                  >
                    <span>پرداخت {toPersianDigits(discoveryData.informationCost || 30)} سکه و دیدن اطلاعات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setPhase('initial_choice');
                    }}
                    className="w-full py-2 text-[12px] font-bold text-[#64748b] hover:text-[#1e1b18] cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>بازگشت به انتخاب گزینه‌ها</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==========================================================
                STAGE 3: QUESTION PATH (ANSWER DISCOVERY QUESTION)
                ========================================================== */}
            {phase === 'question' && (
              <motion.div
                key="phase-question"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#d97706]">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>سؤال کشف اثر (رایگان)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPhase('initial_choice')}
                    className="text-[11px] font-bold text-[#64748b] hover:text-[#1e1b18] flex items-center gap-1 cursor-pointer"
                  >
                    <span>بازگشت</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>

                {/* Question Text */}
                <h3 className="font-sans-custom text-[14px] sm:text-[15px] font-black text-[#1e1b18] leading-snug">
                  {discoveryData.question.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2.5">
                  {discoveryData.question.options.map((optText, idx) => {
                    const isChosen = selectedOption === idx && wrongOptionIndex === null;
                    const isWrong = wrongOptionIndex === idx;
                    const isCorrectAnswer = wrongOptionIndex !== null && idx === discoveryData.question.correctIndex;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswering}
                        onClick={() => handleSelectQuestionOption(idx)}
                        className={`w-full text-right p-3 sm:p-3.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer group disabled:cursor-not-allowed ${
                          isWrong
                            ? 'bg-[#fee2e2] text-[#dc2626] border-[#ef4444] shadow-[2px_2px_0px_#ef4444]'
                            : isCorrectAnswer
                            ? 'bg-[#f0fdf4] text-[#15803d] border-[#22c55e] shadow-[2px_2px_0px_#22c55e]'
                            : isChosen
                            ? 'bg-[#1e1b18] text-[#ffffff] border-[#1e1b18] shadow-[3px_3px_0px_#f59e0b]'
                            : 'bg-[#ffffff] text-[#1e1b18] border-[#1e1b18] hover:bg-[#f8fafc] shadow-[2px_2px_0px_#1e1b18]'
                        }`}
                      >
                        <div className="flex items-center gap-2 pr-2 min-w-0 flex-1">
                          {isCorrectAnswer && (
                            <div className="w-5 h-5 rounded-full bg-[#dcfce7] border border-[#22c55e] flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-[#15803d] stroke-[3]" />
                            </div>
                          )}
                          <span className="text-[12px] sm:text-[13px] font-bold leading-relaxed">
                            {optText}
                          </span>
                        </div>
                        <span
                          className={`font-mono-custom text-[11px] font-black shrink-0 px-2 py-0.5 rounded border ${
                            isWrong
                              ? 'bg-[#ef4444] text-white border-[#b91c1c]'
                              : isCorrectAnswer
                              ? 'bg-[#22c55e] text-white border-[#15803d]'
                              : isChosen
                              ? 'bg-[#fbbf24] text-[#1e1b18] border-[#fbbf24]'
                              : 'bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] group-hover:border-[#1e1b18]'
                          }`}
                        >
                          {isCorrectAnswer ? '✓' : idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ==========================================================
                STAGE 4: QUESTION CORRECT (+NET REWARD COINS, AUTO-TRANSITION)
                ========================================================== */}
            {phase === 'correct_answer' && (
              <motion.div
                key="phase-correct-answer"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="space-y-4 my-auto text-center relative py-2"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#dcfce7] border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#15803d]" />
                </div>

                <div>
                  <h3 className="font-sans-custom text-[17px] font-black text-[#15803d]">
                    پاسخ شما درست است! 🎉
                  </h3>
                </div>

                {/* Net Reward Coin Display & Floating Reward Animation */}
                <div className="relative flex flex-col items-center justify-center py-2">
                  {/* Floating upward fading reward badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.8 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [12, -4, -18, -32],
                      scale: [0.8, 1.15, 1.05, 0.95],
                    }}
                    transition={{
                      duration: 1.8,
                      times: [0, 0.2, 0.7, 1],
                      ease: 'easeOut',
                    }}
                    className="absolute z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fef3c7] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] text-[#d97706] select-none pointer-events-none"
                  >
                    <span className="text-[14px]">🪙</span>
                    <span className="font-mono-custom text-[17px] font-black text-[#15803d]">
                      +{toPersianDigits(netReward)}
                    </span>
                    <span className="font-sans-custom text-[12px] font-black text-[#1e1b18]">
                      سکه
                    </span>
                  </motion.div>

                  {/* Main Static Net Reward Badge */}
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.25 }}
                    className="bg-[#f0fdf4] border-2 border-[#1e1b18] rounded-2xl px-6 py-3.5 shadow-[3px_3px_0px_#1e1b18] inline-flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#fbbf24] border border-[#1e1b18] flex items-center justify-center text-[15px] shadow-[1px_1px_0px_#1e1b18] shrink-0">
                      🪙
                    </div>
                    <div
                      className="flex items-baseline gap-1 font-mono-custom font-black text-[22px] text-[#15803d]"
                      dir="ltr"
                    >
                      <span>+{toPersianDigits(netReward)}</span>
                      <span className="font-sans-custom text-[14px] text-[#1e1b18] font-black mr-1">
                        سکه
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Quick manual transition link */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (autoTransitionTimerRef.current) {
                        clearTimeout(autoTransitionTimerRef.current);
                        autoTransitionTimerRef.current = null;
                      }
                      setPhase('artwork_info');
                    }}
                    className="text-[12px] font-bold text-[#64748b] hover:text-[#1e1b18] cursor-pointer inline-flex items-center gap-1 transition-colors"
                  >
                    <span>مشاهده اطلاعات اثر</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==========================================================
                STAGE 5: QUESTION INCORRECT (0 COINS, LOCKED)
                ========================================================== */}
            {phase === 'incorrect_answer' && (
              <motion.div
                key="phase-incorrect-answer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 my-auto text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fee2e2] border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-[#dc2626]" />
                </div>

                <div>
                  <h3 className="font-sans-custom text-[16px] font-black text-[#dc2626]">
                    پاسخ نادرست بود
                  </h3>
                  <p className="text-[12px] font-medium text-[#64748b] mt-1 leading-relaxed">
                    گزینه انتخابی صحیح نبود. هیچ سکه‌ای دریافت یا کسر نشد و اطلاعات اثر هنوز بازگشایی نگردیده است.
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setPhase('payment_confirm');
                    }}
                    className="w-full py-2.5 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e1b18] font-black text-[12px] border-2 border-[#1e1b18] rounded-xl shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>دریافت اطلاعات با {discoveryData.informationCost || 30} سکه</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 text-[12px] font-bold text-[#64748b] hover:text-[#1e1b18] cursor-pointer"
                  >
                    بستن
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==========================================================
                STAGE 6: ARTWORK INFORMATION & IMAGE DISPLAY (UNLOCKED)
                ========================================================== */}
            {phase === 'artwork_info' && (
              <motion.div
                key="phase-artwork-info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#059669]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>اطلاعات اثر بازگشایی شده</span>
                  </div>
                </div>

                {/* Unlocked Artwork Information Text */}
                <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl p-3.5 shadow-[2px_2px_0px_#1e1b18] space-y-2 max-h-[36vh] overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-[12px] font-black text-[#1e1b18]">
                    <Info className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>{discoveryData.titleFa}</span>
                  </div>
                  <p className="text-[12px] sm:text-[13px] leading-relaxed text-[#334155] font-medium text-justify">
                    {discoveryData.information.textFa}
                  </p>
                  {discoveryData.information.textEn && (
                    <p className="text-[11px] sm:text-[12px] leading-relaxed text-[#64748b] font-mono-custom dir-ltr text-left pt-2 border-t border-[#e2e8f0]">
                      {discoveryData.information.textEn}
                    </p>
                  )}
                </div>

                {/* Bottom Dismiss Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#1e1b18] hover:bg-[#2a2b2b] text-[#ffffff] font-bold text-[13px] rounded-xl shadow-[2px_2px_0px_#1e1b18] cursor-pointer transition-all"
                >
                  بستن
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StarDiscoveryModal;
