import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Info } from 'lucide-react';
import { LocationContent } from '../services/content/types';

export interface LocationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationContent | null;
}

export const LocationInfoModal: React.FC<LocationInfoModalProps> = ({
  isOpen,
  onClose,
  location,
}) => {
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

  if (!isOpen || !location) return null;

  const titleText = location.name?.trim() || 'اطلاعات مکان';
  const sectionTitle =
    location.title?.trim() ||
    location.rawFields?.['title']?.trim() ||
    location.rawFields?.['عنوان']?.trim() ||
    location.name?.trim() ||
    'اطلاعات مکان';
  const descriptionText = location.description?.trim() || '';

  return (
    <AnimatePresence>
      <div
        id="location-info-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-[#0e0f0f]/60 backdrop-blur-xs select-none"
        dir="rtl"
      >
        <motion.div
          id="location-info-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Top Header Bar - Matches Star & Puzzle Modals */}
          <div
            id="location-info-modal-header"
            className="bg-[#fef3c7] border-b-2 border-[#1e1b18] px-4 py-2.5 flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#fbbf24] border-[1.5px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center text-[#1e1b18] shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#d97706] fill-[#fbbf24]" />
              </div>
              <h2
                id="location-info-modal-title"
                className="font-sans-custom text-[13px] sm:text-[14px] font-black text-[#1e1b18] tracking-tight truncate"
              >
                {titleText}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Close Button */}
              <button
                id="location-info-modal-close-btn"
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
            {descriptionText ? (
              <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl p-3.5 sm:p-4 shadow-[2px_2px_0px_#1e1b18] space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-black text-[#1e1b18]">
                  <Info className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                  <span id="location-info-modal-section-title">{sectionTitle}</span>
                </div>
                <p
                  id="location-info-modal-description"
                  className="text-[12px] sm:text-[13px] leading-relaxed text-[#334155] font-medium text-justify whitespace-pre-line break-words"
                >
                  {descriptionText}
                </p>
              </div>
            ) : null}

            {/* Bottom Dismiss Button */}
            <button
              id="location-info-modal-action-btn"
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-[#1e1b18] hover:bg-[#2a2b2b] text-[#ffffff] font-bold text-[13px] rounded-xl shadow-[2px_2px_0px_#1e1b18] cursor-pointer transition-all"
            >
              بستن
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LocationInfoModal;

