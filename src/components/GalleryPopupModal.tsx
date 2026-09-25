import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Coffee } from 'lucide-react';
import { PopupContent } from '../services/content/types';
import { toPersianDigits } from '../services/content/mappers';

export interface GalleryPopupModalProps {
  popups: PopupContent[];
  isOpen: boolean;
  onClose: () => void;
  galleryNameFa?: string;
  galleryNumberFa?: string;
}

/**
 * Reusable contextual story / discovery popup modal for the 'pop' sheet system.
 * Designed as an elegant, themed museum discovery card with comic-aesthetic accents.
 */
export const GalleryPopupModal: React.FC<GalleryPopupModalProps> = ({
  popups,
  isOpen,
  onClose,
  galleryNameFa,
  galleryNumberFa,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [imageRatioMap, setImageRatioMap] = useState<Record<string, number>>({});

  // Ensure active items only and valid index bounds
  const activePopups = React.useMemo(() => {
    return (popups || []).filter((p) => p && p.active !== false && (p.infoTxt || p.picture));
  }, [popups]);

  if (!isOpen || activePopups.length === 0) {
    return null;
  }

  const currentPopup = activePopups[currentIndex] || activePopups[0];
  const hasMultiple = activePopups.length > 1;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < activePopups.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleImageError = (popupId: string) => {
    setImageErrorMap((prev) => ({ ...prev, [popupId]: true }));
  };

  const currentPopupKey = currentPopup.id || currentPopup.popupId || String(currentIndex);

  const hasValidPicture =
    Boolean(currentPopup.picture && currentPopup.picture.trim()) &&
    !imageErrorMap[currentPopupKey];

  const headerTitle = currentPopup.title || 'پیشنهاد';

  return (
    <AnimatePresence>
      <div
        id="gallery-story-popup-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-[3px] select-none"
        dir="rtl"
      >
        <motion.div
          id="gallery-story-popup-card"
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm sm:max-w-md bg-[#ffffff] rounded-3xl border-[2.75px] border-[#1e1b18] shadow-[5px_5px_0px_#1e1b18] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b-[2px] border-[#1e1b18] bg-[#fefce8]/60 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#fef08a] border-[1.75px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center text-[#854d0e]">
                <Coffee className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans-custom font-extrabold text-[14px] sm:text-[15px] text-[#1e1b18] tracking-tight">
                  {headerTitle}
                </span>
                {hasMultiple && (
                  <span className="text-[11px] font-bold text-[#8c827a] font-sans-custom">
                    صفحه {toPersianDigits(currentIndex + 1)} از {toPersianDigits(activePopups.length)}
                  </span>
                )}
              </div>
            </div>

            {/* Top Close Button (matches Star modal close button style) */}
            <button
              id="gallery-story-popup-close-btn"
              type="button"
              onClick={onClose}
              aria-label="بستن پنجره"
              title="بستن"
              className="w-7 h-7 rounded-full bg-[#ffffff] hover:bg-[#ef4444] hover:text-white transition-colors text-[#1e1b18] border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 min-h-0">
            {/* Optional Prominent Image Card */}
            {hasValidPicture && (
              <div className="w-full flex items-center justify-center shrink-0">
                <div
                  className="relative rounded-2xl border-[2px] border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] overflow-hidden bg-[#f3ede8] inline-flex items-center justify-center max-w-full"
                  style={
                    imageRatioMap[currentPopupKey]
                      ? { aspectRatio: `${imageRatioMap[currentPopupKey]}` }
                      : undefined
                  }
                >
                  <img
                    src={currentPopup.picture}
                    alt={currentPopup.title || 'تصویر راهنما'}
                    onLoad={(e) => {
                      const { naturalWidth, naturalHeight } = e.currentTarget;
                      if (naturalWidth && naturalHeight) {
                        setImageRatioMap((prev) => ({
                          ...prev,
                          [currentPopupKey]: naturalWidth / naturalHeight,
                        }));
                      }
                    }}
                    onError={() => handleImageError(currentPopupKey)}
                    className="max-h-[185px] sm:max-h-[200px] max-w-full w-auto h-auto object-contain block select-none"
                    loading="eager"
                  />
                </div>
              </div>
            )}

            {/* Main Info Text */}
            {currentPopup.infoTxt && (
              <div className="px-1 py-0.5">
                <p className="font-sans-custom text-sm sm:text-base font-semibold text-[#1e1b18] leading-relaxed text-justify whitespace-pre-line">
                  {currentPopup.infoTxt}
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="p-3.5 sm:p-4 bg-[#fbf9f9] flex flex-col gap-2.5 shrink-0">
            {/* Carousel dots & navigation if multiple */}
            {hasMultiple && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  {activePopups.map((_, idx) => (
                    <button
                      key={`dot-${idx}`}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                        idx === currentIndex
                          ? 'w-6 bg-[#f59e0b] border-[1.25px] border-[#1e1b18]'
                          : 'w-2.5 bg-[#e2e8f0] border-[1px] border-[#94a3b8]'
                      }`}
                      aria-label={`رفتن به صفحه ${idx + 1}`}
                    />
                  ))}
                </div>
                {currentIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-3 py-1.5 rounded-lg border-[1.5px] border-[#1e1b18] bg-[#ffffff] hover:bg-[#f1f5f9] text-[#1e1b18] font-sans-custom font-bold text-[12px] shadow-[1px_1px_0px_#1e1b18] flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>قبلی</span>
                  </button>
                )}
              </div>
            )}

            {/* Big confirmation / action button */}
            <button
              id="gallery-story-popup-confirm-btn"
              type="button"
              onClick={handleNext}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl border-[2px] border-[#1e1b18] bg-[#1e1b18] hover:bg-[#2a2b2b] text-[#ffffff] font-sans-custom font-bold text-[13.5px] sm:text-[14px] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150"
            >
              <span>
                {hasMultiple && currentIndex < activePopups.length - 1
                  ? 'صفحه بعدی'
                  : 'باشه'}
              </span>
              {hasMultiple && currentIndex < activePopups.length - 1 && (
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
