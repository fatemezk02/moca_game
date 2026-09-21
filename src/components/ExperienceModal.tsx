import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ExperienceContent } from '../services/content/types';
import { ExperienceIcon } from './ExperienceIcon';
import { markExperienceDiscovered } from '../data/experienceProgressStore';

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
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  // Reset image state when experience changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setAspectRatio(null);
    if (isOpen && experience?.id) {
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
  const labelText = experience.labelFa || titleText;
  const descriptionText = experience.descriptionFa || '';
  const rawImageUrl = typeof experience.imageUrl === 'string' ? experience.imageUrl.trim() : '';
  const hasImage = Boolean(rawImageUrl && rawImageUrl !== 'null' && rawImageUrl !== 'undefined');

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
                {titleText}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Experience Badge */}
              <div
                id="modal-experience-badge"
                className="bg-[#ffffff] text-[#1e1b18] border-[1.5px] border-[#1e1b18] rounded-full px-2.5 py-0.5 shadow-[1px_1px_0px_#1e1b18] flex items-center gap-1 font-sans-custom text-[11px] font-black shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-[#a78bfa] inline-block"></span>
                <span>ایستگاه تجربه</span>
              </div>

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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExperienceModal;
