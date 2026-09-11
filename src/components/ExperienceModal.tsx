import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ExperienceContent } from '../services/content/types';
import { ExperienceIcon } from './ExperienceIcon';

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
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Reset image state when experience changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [experience?.id, experience?.imageUrl]);

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
  const labelText = experience.labelFa || titleText;
  const descriptionText = experience.descriptionFa || '';
  const rawImageUrl = typeof experience.imageUrl === 'string' ? experience.imageUrl.trim() : '';
  const hasImage = Boolean(rawImageUrl && rawImageUrl !== 'null' && rawImageUrl !== 'undefined');

  return (
    <AnimatePresence>
      <div
        id="experience-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#1e1b18]/65 backdrop-blur-sm overflow-y-auto"
        dir="rtl"
      >
        <motion.div
          id="experience-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl shadow-[6px_6px_0px_#1e1b18] overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Top Decorative Header Accent */}
          <div className="h-2 bg-[#f59e0b] border-b-2 border-[#1e1b18] w-full" />

          {/* Modal Header */}
          <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-[#f1ede4] bg-[#faf8f4]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#fffbeb] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center text-[#1e1b18]">
                <ExperienceIcon iconId={experience.iconId} className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-sans-custom font-black px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]">
                    ایستگاه تجربه
                  </span>
                </div>
                <h3
                  id="experience-modal-title"
                  className="font-sans-custom font-black text-[17px] sm:text-[19px] text-[#1e1b18] mt-0.5 leading-tight"
                >
                  {titleText}
                </h3>
              </div>
            </div>

            {/* Close Button */}
            <button
              id="experience-modal-close-btn"
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#faf8f4] hover:bg-[#fee2e2] text-[#1e1b18] hover:text-[#991b1b] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer focus:outline-none"
              aria-label="بستن پنجره"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Scrollable Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* Complete Artwork Image Container (Responsive, Uncropped, Preserves Aspect Ratio) */}
            {hasImage && !imageError && (
              <div
                id="experience-modal-image-wrapper"
                className="relative w-full rounded-2xl overflow-hidden border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] bg-[#f5f2eb] flex items-center justify-center p-1 sm:p-1.5"
              >
                {!imageLoaded && (
                  <div className="w-full py-8 flex flex-col items-center justify-center gap-2 bg-[#f5f2eb] animate-pulse">
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
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={`max-w-full max-h-[48vh] sm:max-h-[55vh] w-auto h-auto object-contain rounded-xl block mx-auto transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'absolute inset-0 opacity-0 pointer-events-none'
                  }`}
                />
              </div>
            )}

            {/* Description Text */}
            {descriptionText ? (
              <div className="bg-[#faf8f4] border border-[#e7e2d9] rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[#92400e] text-[12px] font-sans-custom font-bold mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                  <span>درباره این تجربه</span>
                </div>
                <p
                  id="experience-modal-description"
                  className="font-sans-custom text-[13.5px] sm:text-[14.5px] leading-relaxed text-[#2c2723] text-justify font-normal"
                >
                  {descriptionText}
                </p>
              </div>
            ) : null}
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:p-4 bg-[#faf8f4] border-t border-[#f1ede4] flex items-center justify-end">
            <button
              id="experience-modal-action-btn"
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#1e1b18] hover:bg-[#2e2b26] text-[#ffffff] font-sans-custom font-black text-[13px] border-2 border-[#1e1b18] shadow-[3px_3px_0px_#f59e0b] hover:shadow-[1.5px_1.5px_0px_#f59e0b] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExperienceModal;
