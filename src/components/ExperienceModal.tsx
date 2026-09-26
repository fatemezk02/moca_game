import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Image as ImageIcon, Lock, Coins, AlertCircle } from 'lucide-react';
import { ExperienceContent } from '../services/content/types';
import { ExperienceIcon } from './ExperienceIcon';
import {
  isExperienceUnlocked,
  unlockExperienceWithCoins,
  markExperienceDiscovered,
  EXPERIENCE_UNLOCK_COST,
} from '../data/experienceProgressStore';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { contentService } from '../services/content/contentService';
import { formatTwoDigitPersian, toPersianDigits } from '../services/content/mappers';

export interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience: ExperienceContent | null;
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  experience,
}) => {
  const playerStats = usePlayerStats();
  const [unlocked, setUnlocked] = useState<boolean>(() =>
    isExperienceUnlocked(experience?.id || experience?.experienceId || '')
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const isUnlockingRef = useRef<boolean>(false);

  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  // Sync unlock status and reset image state when experience changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setAspectRatio(null);
    setErrorMessage(null);
    const isUnl = isExperienceUnlocked(experience?.id || experience?.experienceId || '');
    setUnlocked(isUnl);

    if (isOpen && isUnl && experience?.id) {
      markExperienceDiscovered(experience.id);
      if (experience.experienceId) {
        markExperienceDiscovered(experience.experienceId);
      }
    }
  }, [isOpen, experience?.id, experience?.experienceId, experience?.imageUrl]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !experience) return null;

  const titleText = experience.title || experience.labelFa || 'تجربه تعاملی';
  const descriptionText = experience.descriptionFa || '';
  const rawImageUrl = typeof experience.imageUrl === 'string' ? experience.imageUrl.trim() : '';
  const hasImage = Boolean(rawImageUrl && rawImageUrl !== 'null' && rawImageUrl !== 'undefined');

  const galleryRecord = experience.galleryId
    ? contentService.getGalleryById(experience.galleryId)
    : null;
  const rawGalleryNum =
    galleryRecord?.galleryNumber ??
    experience.galleryId?.replace(/[^0-9]/g, '') ??
    '01';
  const galleryNumberFa = formatTwoDigitPersian(rawGalleryNum);

  const getExpNum = (exp: ExperienceContent): string => {
    const id = (exp.id || exp.experienceId || '').toLowerCase().trim();
    if (id.includes('1') || id.includes('reversed')) return '۰۱';
    if (id.includes('2') || id.includes('frame')) return '۰۲';
    if (id.includes('3') || id.includes('shadow')) return '۰۳';
    if (id.includes('4') || id.includes('stereoscope')) return '۰۴';
    if (id.includes('5') || id.includes('vintage')) return '۰۵';
    if (id.includes('6') || id.includes('mirror')) return '۰۶';
    if (id.includes('7') || id.includes('darkroom')) return '۰۷';
    const digits = id.replace(/[^0-9]/g, '');
    return digits ? formatTwoDigitPersian(parseInt(digits, 10)) : '۰۱';
  };
  const expNumberFa = getExpNum(experience);
  const modalHeaderTitle = `تجربه ${expNumberFa} ـ گالری ${galleryNumberFa}`;

  // Handle unlocking experience with 7 coins
  const handleUnlock = () => {
    if (isUnlockingRef.current) return;
    setErrorMessage(null);

    const cost = EXPERIENCE_UNLOCK_COST;
    if (playerStats.coins < cost) {
      setErrorMessage(`موجودی سکه شما کافی نیست (حداقل ${toPersianDigits(cost)} سکه نیاز است).`);
      return;
    }

    isUnlockingRef.current = true;
    setIsUnlocking(true);

    try {
      const expId = experience.id || experience.experienceId || '';
      const result = unlockExperienceWithCoins(expId, cost);
      if (result.success) {
        setUnlocked(true);
        markExperienceDiscovered(expId);
        if (experience.experienceId) {
          markExperienceDiscovered(experience.experienceId);
        }
      } else {
        setErrorMessage(`موجودی سکه شما کافی نیست (حداقل ${toPersianDigits(cost)} سکه نیاز است).`);
      }
    } finally {
      isUnlockingRef.current = false;
      setIsUnlocking(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="experience-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#0e0f0f]/60 backdrop-blur-xs select-none"
        dir="rtl"
      >
        <motion.div
          id="experience-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Top Header Bar - Matches Star & Puzzle Modals with distinct Violet theme */}
          <div
            id="experience-modal-header"
            className="bg-[#ede9fe] border-b-2 border-[#1e1b18] px-4 py-2.5 flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#c4b5fd] border-[1.5px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center text-[#1e1b18] shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#6d28d9] fill-[#a78bfa]" />
              </div>
              <h2
                id="experience-modal-title"
                className="font-sans-custom text-[13px] sm:text-[14px] font-black text-[#1e1b18] tracking-tight truncate"
              >
                {modalHeaderTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Experience Badge */}
              {unlocked ? (
                <div
                  id="modal-experience-badge"
                  className="bg-[#ffffff] text-[#1e1b18] border-[1.5px] border-[#1e1b18] rounded-full px-2.5 py-0.5 shadow-[1px_1px_0px_#1e1b18] flex items-center gap-1 font-sans-custom text-[11px] font-black shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-[#a78bfa] inline-block"></span>
                  <span>ایستگاه تجربه</span>
                </div>
              ) : (
                <div
                  id="modal-experience-locked-badge"
                  className="bg-[#fef3c7] text-[#1e1b18] border-[1.5px] border-[#1e1b18] rounded-full px-2.5 py-0.5 shadow-[1px_1px_0px_#1e1b18] flex items-center gap-1 font-sans-custom text-[11px] font-black shrink-0"
                >
                  <Lock className="w-3 h-3 text-[#d97706] stroke-[2.5]" />
                  <span>{toPersianDigits(EXPERIENCE_UNLOCK_COST)} سکه</span>
                  <Coins className="w-3 h-3 text-[#ea580c] fill-[#fb923c]" />
                </div>
              )}

              {/* Close Button */}
              <button
                id="experience-modal-close-btn"
                type="button"
                onClick={onClose}
                aria-label="بستن پنجره"
                className="w-7 h-7 rounded-full bg-[#ffffff] hover:bg-[#ef4444] hover:text-white transition-colors text-[#1e1b18] border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Modal Body Container */}
          {!unlocked ? (
            /* ==========================================================
               LOCKED EXPERIENCE: PAYMENT & UNLOCK CONFIRMATION UI
               ========================================================== */
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center text-center space-y-4">
              {/* Central Experience Icon */}
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#ede9fe] border-[2px] border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center p-3 shrink-0">
                <ExperienceIcon
                  iconId={experience.iconId || 'frame'}
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
              </div>

              {/* Title & subtitle */}
              <div className="space-y-1">
                <h3 className="font-sans-custom text-[15px] sm:text-[16px] font-black text-[#1e1b18]">
                  {titleText}
                </h3>
              </div>

              {/* Cost Box */}
              <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl px-5 py-3 shadow-[2px_2px_0px_#1e1b18] inline-flex flex-col items-center gap-1">
                <div className="text-[12px] font-bold text-[#64748b]">
                  هزینه بازگشایی:
                </div>
                <div className="font-mono-custom text-[18px] font-black text-[#d97706] flex items-center gap-1.5">
                  <span>{toPersianDigits(EXPERIENCE_UNLOCK_COST)}</span>
                  <span className="text-[15px]">🪙</span>
                  <span className="text-[12px] font-sans-custom text-[#1e1b18]">
                    (کسر از موجودی)
                  </span>
                </div>
              </div>

              {/* Insufficient coins error notice */}
              {(errorMessage || playerStats.coins < EXPERIENCE_UNLOCK_COST) && (
                <div className="w-full bg-[#fee2e2] border border-[#ef4444] text-[#991b1b] rounded-xl p-3 text-[11px] font-bold flex items-center gap-2 text-right">
                  <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
                  <span>
                    {errorMessage ||
                      `موجودی سکه شما کافی نیست (حداقل ${toPersianDigits(EXPERIENCE_UNLOCK_COST)} سکه نیاز است).`}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="w-full space-y-2 pt-1">
                <button
                  id="experience-unlock-confirm-btn"
                  type="button"
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  className={`w-full py-3 px-4 font-black text-[13px] sm:text-[14px] border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 transition-all ${
                    playerStats.coins < EXPERIENCE_UNLOCK_COST
                      ? 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed shadow-[1px_1px_0px_#1e1b18]'
                      : 'bg-[#fbbf24] hover:bg-[#f59e0b] active:bg-[#d97706] text-[#1e1b18] cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1.5px_1.5px_0px_#1e1b18]'
                  }`}
                >
                  <Coins className="w-4 h-4 text-[#ea580c] fill-[#fb923c]" />
                  <span>پرداخت {toPersianDigits(EXPERIENCE_UNLOCK_COST)} سکه و بازگشایی</span>
                </button>

                <button
                  id="experience-cancel-btn"
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 bg-transparent hover:bg-[#f1f5f9] text-[#64748b] font-bold text-[12px] rounded-lg transition-colors cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          ) : (
            /* ==========================================================
               UNLOCKED EXPERIENCE: EXISTING CONTENT DISPLAY
               ========================================================== */
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col justify-start space-y-3.5">
              {/* Complete Artwork Image Container */}
              {hasImage && !imageError && (
                <div
                  id="experience-modal-image-wrapper"
                  className="w-full flex items-center justify-center overflow-hidden shrink-0"
                >
                  <div
                    className={`relative border-2 border-[#1e1b18] rounded-xl overflow-hidden shadow-[2px_2px_0px_#1e1b18] bg-[#f8fafc] p-1 inline-flex items-center justify-center max-w-full max-h-[35vh] sm:max-h-[40vh] mx-auto ${
                      imageLoaded ? 'w-fit' : 'w-full'
                    }`}
                    style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
                  >
                    {!imageLoaded && (
                      <div className="w-full py-8 flex flex-col items-center justify-center gap-2 bg-[#f8fafc] animate-pulse">
                        <ImageIcon className="w-6 h-6 text-[#a8a29e]" />
                        <span className="text-[11px] font-sans-custom text-[#78716c]">
                          در حال بارگذاری تصویر...
                        </span>
                      </div>
                    )}
                    <img
                      src={rawImageUrl}
                      alt={titleText}
                      referrerPolicy="no-referrer"
                      onLoad={(e) => {
                        setImageLoaded(true);
                        const { naturalWidth, naturalHeight } = e.currentTarget;
                        if (naturalWidth && naturalHeight) {
                          setAspectRatio(naturalWidth / naturalHeight);
                        }
                      }}
                      onError={() => setImageError(true)}
                      className={`max-w-full max-h-[35vh] sm:max-h-[40vh] w-full h-full object-contain rounded-lg block mx-auto transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'absolute inset-0 opacity-0 pointer-events-none'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Description Text */}
              {descriptionText ? (
                <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl p-3.5 sm:p-4 shadow-[2px_2px_0px_#1e1b18] space-y-2">
                  <div className="flex items-center gap-1.5 text-[12px] font-black text-[#1e1b18]">
                    <Sparkles className="w-3.5 h-3.5 text-[#6d28d9] shrink-0" />
                    <span>درباره این تجربه</span>
                  </div>
                  <p
                    id="experience-modal-description"
                    className="text-[12px] sm:text-[13px] leading-relaxed text-[#334155] font-medium text-justify whitespace-pre-line break-words"
                  >
                    {descriptionText}
                  </p>
                </div>
              ) : null}

              {/* Bottom Dismiss Button */}
              <button
                id="experience-modal-action-btn"
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#1e1b18] hover:bg-[#2a2b2b] text-[#ffffff] font-bold text-[13px] rounded-xl shadow-[2px_2px_0px_#1e1b18] cursor-pointer transition-all shrink-0"
              >
                متوجه شدم
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExperienceModal;
