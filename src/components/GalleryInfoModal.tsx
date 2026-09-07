import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RotateCw, BookOpen } from 'lucide-react';
import { contentService } from '../services/content';

export interface GalleryInfoModalProps {
  galleryId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryInfoModal: React.FC<GalleryInfoModalProps> = ({
  galleryId,
  isOpen,
  onClose,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset image error and flip state whenever galleryId or open state changes
  useEffect(() => {
    setImageError(false);
    setIsFlipped(false);
  }, [galleryId, isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Requirement 11 & 13: Resolve GalleryContent strictly using gallery_id
  const gallery = useMemo(() => {
    if (!galleryId) return null;

    const record = contentService.getGalleryById(galleryId);
    if (!record) {
      console.warn(
        `[GalleryInfoModal] No matching Gallery record found for gallery_id: "${galleryId}".`
      );
      return null;
    }

    // Requirement 13: Only active gallery records should appear in user-facing modal
    if (record.active === false) {
      console.warn(
        `[GalleryInfoModal] Gallery record for gallery_id: "${galleryId}" is marked inactive.`
      );
      return null;
    }

    return record;
  }, [galleryId]);

  if (!isOpen) return null;

  // If gallery record was not found or is inactive: log warning and show fallback card
  if (!gallery) {
    return (
      <AnimatePresence>
        <div
          id="gallery-info-modal-backdrop-fallback"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b18]/60 backdrop-blur-xs select-none"
          onClick={onClose}
        >
          <motion.div
            id="gallery-info-modal-fallback-card"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl p-6 shadow-[6px_6px_0px_#1e1b18] text-center space-y-4"
          >
            <div className="flex justify-between items-center border-b-2 border-[#1e1b18] pb-3">
              <span className="font-sans-custom text-[13px] font-black text-[#64748b]">
                اطلاعات گالری
              </span>
              <button
                id="gallery-info-fallback-close-btn"
                onClick={onClose}
                aria-label="بستن"
                className="w-8 h-8 rounded-full bg-[#fee2e2] hover:bg-[#ef4444] hover:text-white transition-all text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
            <p className="font-sans-custom text-[14px] text-[#475569] leading-relaxed py-4">
              اطلاعات مربوط به این تالار در دسترس نیست یا تالار غیرفعال است.
            </p>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  const hasCuratorImage = Boolean(gallery.curatorUrl && gallery.curatorUrl.trim().length > 0 && !imageError);
  const hasCuratorName = Boolean(gallery.curator && gallery.curator.trim().length > 0);

  // Requirement 3: Positioning rule based on gallery number/data
  // For Gallery 5 and Gallery 9: imageSide = 'right', nameSide = 'left'
  // For all other galleries: imageSide = 'left', nameSide = 'right'
  const galleryNum = parseInt(gallery.galleryNumber, 10);
  const idNumMatch = gallery.galleryId.match(/\d+/);
  const idNum = idNumMatch ? parseInt(idNumMatch[0], 10) : NaN;
  const isGallery5or9 = galleryNum === 5 || galleryNum === 9 || idNum === 5 || idNum === 9;

  const imageSide: 'left' | 'right' = isGallery5or9 ? 'right' : 'left';
  const nameSide: 'left' | 'right' = isGallery5or9 ? 'left' : 'right';

  return (
    <AnimatePresence>
      <div
        id="gallery-info-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1e1b18]/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        {/* Outer 3D Perspective Wrapper */}
        <motion.div
          id="gallery-info-modal-wrapper"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg min-h-[385px] sm:min-h-[425px] [perspective:1200px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card Flip Container */}
          <motion.div
            id="gallery-info-modal-flipper"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
            style={{
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
            }}
            className="relative w-full h-full min-h-[385px] sm:min-h-[425px]"
          >
            {/* ================================================== */}
            {/* 1. FRONT FACE: Gallery Information                 */}
            {/* ================================================== */}
            <div
              id="gallery-info-card-front"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              className={`w-full min-h-[385px] sm:min-h-[425px] bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl p-5 sm:p-7 shadow-[6px_6px_0px_#1e1b18] flex flex-col overflow-hidden relative ${
                isFlipped ? 'pointer-events-none select-none' : 'pointer-events-auto'
              }`}
              dir="rtl"
            >
              {/* TOP: Header (Close Button at Top-Left, Title Centered, Flip Button at Top-Right) */}
              <div
                id="gallery-info-modal-header"
                className="relative flex items-center justify-center border-b-2 border-[#1e1b18] pb-3 sm:pb-3.5 px-11"
              >
                {/* Close Button (Top-Left) */}
                <button
                  id="gallery-info-modal-close-btn"
                  onClick={onClose}
                  aria-label="بستن پنجره اطلاعات گالری"
                  className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#fee2e2] hover:bg-[#ef4444] hover:text-white transition-all text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Centered Gallery Title */}
                <div className="flex items-center justify-center gap-1.5 text-center">
                  <Sparkles className="w-4 h-4 text-[#ea580c] shrink-0" />
                  <h2
                    id="gallery-info-modal-title"
                    className="font-sans-custom text-[18px] sm:text-[21px] font-black text-[#1e1b18] text-center"
                  >
                    {gallery.nameFa}
                  </h2>
                </div>

                {/* Flip Button (Top-Right) */}
                <button
                  id="gallery-info-modal-flip-btn"
                  onClick={() => setIsFlipped(true)}
                  aria-label="نمایش راهنمای بازی"
                  title="نمایش راهنمای بازی"
                  className="absolute right-0 top-0 w-8 h-8 rounded-full bg-[#fef3c7] hover:bg-[#fde68a] active:translate-x-[1px] active:translate-y-[1px] text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center cursor-pointer transition-all group"
                >
                  <RotateCw className="w-4 h-4 stroke-[2.5] text-[#1e1b18] group-hover:rotate-45 transition-transform duration-200" />
                </button>
              </div>

              {/* CENTER / HIGHER UP: Gallery Description */}
              {/* Positioned higher up, significantly closer to the title */}
              <div
                id="gallery-info-modal-body"
                className="relative flex flex-col items-center pt-3 sm:pt-4 px-2 sm:px-4"
              >
                <div
                  id="gallery-info-description-container"
                  className="w-full max-w-[260px] sm:max-w-[320px] text-center mx-auto z-10 select-text"
                >
                  <p
                    id="gallery-info-description-text"
                    className="font-sans-custom text-[14.5px] sm:text-[16.5px] text-[#292524] leading-[1.85] sm:leading-[2.05] font-medium text-center"
                  >
                    {gallery.descriptionFa}
                  </p>
                </div>
              </div>

              {/* BOTTOM CORNERS: Independently Anchored Curator Elements */}
              {/* 1. Large Curator Image (Direct on modal bg, ~30-35% visual area, no card/border) */}
              {hasCuratorImage && (
                <div
                  id="gallery-info-curator-image-anchor"
                  className={`absolute z-20 pointer-events-none select-none bg-transparent flex items-end w-[32%] sm:w-[35%] max-w-[145px] sm:max-w-[185px] max-h-[155px] sm:max-h-[195px] ${
                    imageSide === 'right'
                      ? 'bottom-3.5 right-4 sm:bottom-4 sm:right-6 justify-end'
                      : 'bottom-3.5 left-4 sm:bottom-4 sm:left-6 justify-start'
                  }`}
                >
                  <img
                    id="gallery-info-curator-image"
                    src={gallery.curatorUrl}
                    alt={gallery.curator ? `نام راهنما: ${gallery.curator}` : 'تصویر راهنما'}
                    className={`w-full h-auto max-h-[150px] sm:max-h-[190px] object-contain bg-transparent block ${
                      imageSide === 'right' ? 'object-bottom-right' : 'object-bottom-left'
                    }`}
                    referrerPolicy="no-referrer"
                    onError={() => {
                      console.warn(
                        `[GalleryInfoModal] Failed to load curator image from: "${gallery.curatorUrl}". Hiding image area.`
                      );
                      setImageError(true);
                    }}
                  />
                </div>
              )}

              {/* 2. Curator Name (Opposite corner from Curator Image) */}
              {hasCuratorName && (
                <div
                  id="gallery-info-curator-name-anchor"
                  className={`absolute z-20 select-text pointer-events-auto max-w-[40%] sm:max-w-[45%] ${
                    nameSide === 'right'
                      ? 'bottom-4 right-4 sm:bottom-5 sm:right-6 text-right'
                      : 'bottom-4 left-4 sm:bottom-5 sm:left-6 text-right'
                  }`}
                >
                  <span
                    id="gallery-info-curator-name-text"
                    className="font-sans-custom text-[11px] sm:text-[13px] font-black text-[#1e1b18] leading-snug block"
                  >
                    نام راهنما:{' '}
                    <span className="font-black text-[#ea580c]">{gallery.curator}</span>
                  </span>
                </div>
              )}
            </div>

            {/* ================================================== */}
            {/* 2. BACK FACE: Game Guide (Puzzle & Star Rules)     */}
            {/* ================================================== */}
            <div
              id="gallery-info-card-back"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                WebkitTransform: 'rotateY(180deg)',
              }}
              className={`absolute inset-0 w-full h-full min-h-[385px] sm:min-h-[425px] bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl p-5 sm:p-7 shadow-[6px_6px_0px_#1e1b18] flex flex-col justify-between overflow-hidden ${
                !isFlipped ? 'pointer-events-none select-none' : 'pointer-events-auto'
              }`}
              dir="rtl"
            >
              {/* TOP: Header (Close Button at Top-Left, Title Centered, Flip Button at Top-Right) */}
              <div
                id="gallery-info-back-header"
                className="relative flex items-center justify-center border-b-2 border-[#1e1b18] pb-3 sm:pb-3.5 px-11"
              >
                {/* Close Button (Top-Left) */}
                <button
                  id="gallery-info-back-close-btn"
                  onClick={onClose}
                  aria-label="بستن پنجره"
                  className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#fee2e2] hover:bg-[#ef4444] hover:text-white transition-all text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Centered Guide Title */}
                <div className="flex items-center justify-center gap-1.5 text-center">
                  <BookOpen className="w-4 h-4 text-[#ea580c] shrink-0" />
                  <h2
                    id="gallery-info-back-title"
                    className="font-sans-custom text-[18px] sm:text-[21px] font-black text-[#1e1b18] text-center"
                  >
                    راهنمای بازی
                  </h2>
                </div>

                {/* Flip Button (Top-Right) - Flips back to Front */}
                <button
                  id="gallery-info-back-flip-btn"
                  onClick={() => setIsFlipped(false)}
                  aria-label="بازگشت به اطلاعات گالری"
                  title="بازگشت به اطلاعات گالری"
                  className="absolute right-0 top-0 w-8 h-8 rounded-full bg-[#fef3c7] hover:bg-[#fde68a] active:translate-x-[1px] active:translate-y-[1px] text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center cursor-pointer transition-all group"
                >
                  <RotateCw className="w-4 h-4 stroke-[2.5] text-[#1e1b18] group-hover:-rotate-45 transition-transform duration-200" />
                </button>
              </div>

              {/* CENTER: Concise Game Rules for Puzzle and Star */}
              <div
                id="gallery-info-back-body"
                className="flex-1 flex flex-col justify-around py-3 sm:py-4 px-2 sm:px-4 space-y-3"
              >
                {/* A) PUZZLE SECTION */}
                <div
                  id="gallery-info-rule-puzzle"
                  className="text-center flex flex-col items-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <svg
                      viewBox="0 0 28 28"
                      className="w-5 h-5 sm:w-6 sm:h-6 overflow-visible shrink-0"
                      style={{ filter: 'drop-shadow(1.5px 1.5px 0px #1e1b18)' }}
                    >
                      <path
                        d="M 5 7 C 5 5.5, 6.5 4, 8 4 L 11 4 C 11 2.2, 12.5 1, 14 1 C 15.5 1, 17 2.2, 17 4 L 20 4 C 21.5 4, 23 5.5, 23 7 L 23 10 C 24.8 10, 26 11.5, 26 13 C 26 14.5, 24.8 16, 23 16 L 23 20 C 23 21.5, 21.5 23, 20 23 L 17 23 C 17 21.2, 15.5 20, 14 20 C 12.5 20, 11 21.2, 11 23 L 8 23 C 6.5 23, 5 21.5, 5 20 L 5 17 C 6.8 17, 8 15.5, 8 14 C 8 12.5, 6.8 11, 5 11 Z"
                        fill="#38bdf8"
                        stroke="#1e1b18"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <h3 className="font-sans-custom text-[15px] sm:text-[16.5px] font-black text-[#1e1b18]">
                      پازل
                    </h3>
                  </div>
                  <p className="font-sans-custom text-[12px] sm:text-[13.5px] text-[#334155] leading-relaxed max-w-sm text-center">
                    پازل‌ها را با پاسخ درست به سؤال‌ها تکمیل کن. هر پاسخ درست یک تکه از اثر گالری را به تو می‌دهد. با کامل شدن همه تکه‌ها، اثر گالری کامل می‌شود.
                  </p>
                </div>

                {/* Subtle Divider */}
                <div className="w-20 h-[1.5px] bg-[#e2e8f0] mx-auto rounded-full" />

                {/* B) STAR SECTION */}
                <div
                  id="gallery-info-rule-star"
                  className="text-center flex flex-col items-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 sm:w-6 sm:h-6 overflow-visible shrink-0"
                      style={{ filter: 'drop-shadow(1.5px 1.5px 0px #1e1b18)' }}
                    >
                      <path
                        d="M 11.29 3.43 Q 12 2 12.71 3.43 L 14.74 7.54 Q 15.09 8.26 15.88 8.38 L 20.42 9.04 Q 22 9.27 20.85 10.39 L 17.57 13.58 Q 17 14.14 17.14 14.93 L 17.91 19.44 Q 18.18 21.02 16.76 20.27 L 12.71 18.14 Q 12 17.77 11.29 18.14 L 7.24 20.27 Q 5.82 21.02 6.09 19.44 L 6.86 14.93 Q 7 14.14 6.43 13.58 L 3.15 10.39 Q 2 9.27 3.58 9.04 L 8.12 8.38 Q 8.91 8.26 9.26 7.54 Z"
                        fill="#fbbf24"
                        stroke="#1e1b18"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <h3 className="font-sans-custom text-[15px] sm:text-[16.5px] font-black text-[#1e1b18]">
                      ستاره
                    </h3>
                  </div>
                  <p className="font-sans-custom text-[12px] sm:text-[13.5px] text-[#334155] leading-relaxed max-w-sm text-center">
                    با ستاره‌ها اطلاعات بیشتری درباره آثار و موضوعات گالری پیدا کن. برای باز کردن اطلاعات می‌توانی به سؤال ستاره پاسخ درست بدهی یا هزینه اطلاعات را پرداخت کنی.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

