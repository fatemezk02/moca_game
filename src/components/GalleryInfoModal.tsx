import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RotateCw, Compass, Eye, Puzzle, Star } from 'lucide-react';
import { contentService, formatTwoDigitPersian } from '../services/content';
import { GuideAudioControl } from './GuideAudioControl';
import { guideAudioManager } from '../services/audio/guideAudioService';

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1e1b18]/60 backdrop-blur-xs select-none"
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
  const galleryNum = parseInt(gallery.galleryNumber || '', 10);
  const idNumMatch = (gallery.galleryId || '').match(/\d+/);
  const idNum = idNumMatch ? parseInt(idNumMatch[0], 10) : NaN;
  const isGallery5or9 = galleryNum === 5 || galleryNum === 9 || idNum === 5 || idNum === 9;

  const rawGalleryNum = gallery.galleryNumber || (gallery.galleryId ? gallery.galleryId.replace(/[^0-9]/g, '') : '') || '01';
  const formattedGalleryNum = formatTwoDigitPersian(rawGalleryNum);
  const galleryDisplayTitle = `گالری ${formattedGalleryNum}`;

  const imageSide: 'left' | 'right' = isGallery5or9 ? 'right' : 'left';
  const nameSide: 'left' | 'right' = isGallery5or9 ? 'left' : 'right';

  return (
    <AnimatePresence>
      <div
        id="gallery-info-modal-backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#1e1b18]/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        {/* Outer 3D Perspective Wrapper */}
        <motion.div
          id="gallery-info-modal-wrapper"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg [perspective:1200px]"
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
            className="relative w-full"
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
              className={`w-full min-h-[300px] sm:min-h-[340px] max-h-[85vh] bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl p-4 sm:p-6 shadow-[6px_6px_0px_#1e1b18] flex flex-col justify-between overflow-y-auto relative ${
                isFlipped ? 'pointer-events-none select-none' : 'pointer-events-auto'
              }`}
              dir="rtl"
            >
              <div className="w-full flex flex-col">
                {/* TOP: Header (Close Button at Top-Left, Title Centered, Flip Button at Top-Right) */}
                <div
                  id="gallery-info-modal-header"
                  className="relative flex items-center justify-center border-b-2 border-[#1e1b18] pb-3 sm:pb-3.5 px-11 shrink-0"
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

                  {/* Centered Gallery Number Title */}
                  <div className="flex items-center justify-center gap-1.5 text-center">
                    <Sparkles className="w-4 h-4 text-[#ea580c] shrink-0" />
                    <h2
                      id="gallery-info-modal-title"
                      className="font-sans-custom text-[18px] sm:text-[21px] font-black text-[#1e1b18] text-center"
                    >
                      {galleryDisplayTitle}
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

                {/* GALLERY NAME AS TITLE & GALLERY DESCRIPTION (Full-width, natural document flow) */}
                <div
                  id="gallery-info-modal-body"
                  className="w-full pt-3 sm:pt-4 px-1 sm:px-2 flex flex-col items-center"
                >
                  <div
                    id="gallery-info-description-container"
                    className="w-full text-right select-text"
                  >
                    {/* Gallery Name as heading above description */}
                    {gallery.nameFa && (
                      <h3
                        id="gallery-info-name-heading"
                        className="font-sans-custom text-[16px] sm:text-[18.5px] font-black text-[#1e1b18] mb-2 text-center"
                      >
                        {gallery.nameFa}
                      </h3>
                    )}
                    <p
                      id="gallery-info-description-text"
                      className="font-sans-custom text-[14px] sm:text-[15.5px] text-[#292524] leading-[1.85] sm:leading-[1.95] font-medium text-right whitespace-pre-line break-words"
                    >
                      {gallery.descriptionFa}
                    </p>
                  </div>
                </div>
              </div>

              {/* AUDIO GUIDE CONTROL (Only for galleries with local audio; Gallery 06 renders nothing) */}
              <GuideAudioControl galleryId={gallery.galleryId || gallery.id || galleryId || ''} />

              {/* DEDICATED GUIDE / CURATOR SECTION (Strictly BELOW the complete description in document flow) */}
              {(hasCuratorImage || hasCuratorName) && (
                <div
                  id="gallery-info-curator-section"
                  className="w-full mt-4 sm:mt-5 pt-3 border-t border-[#f1f5f9] flex flex-col justify-end shrink-0"
                >
                  <div className="w-full flex items-end justify-between gap-3">
                    {isGallery5or9 ? (
                      <>
                        {/* Right Side: Curator Image */}
                        {hasCuratorImage ? (
                          <div
                            id="gallery-info-curator-image-container"
                            className="shrink-0 flex items-end justify-start max-w-[50%] h-[150px] sm:h-[188px]"
                          >
                            <img
                              id="gallery-info-curator-image"
                              src={gallery.curatorUrl}
                              alt={gallery.curator ? `نام راهنما: ${gallery.curator}` : 'تصویر راهنما'}
                              className="h-full w-auto max-w-full object-contain block select-none"
                              referrerPolicy="no-referrer"
                              onError={() => {
                                console.warn(
                                  `[GalleryInfoModal] Failed to load curator image from: "${gallery.curatorUrl}". Hiding image area.`
                                );
                                setImageError(true);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex-1" />
                        )}

                        {/* Left Side: Curator Name */}
                        {hasCuratorName && (
                          <div
                            id="gallery-info-curator-name-container"
                            className="flex-1 select-text text-left pb-1 sm:pb-2"
                          >
                            <span
                              id="gallery-info-curator-name-text"
                              className="font-sans-custom text-[12px] sm:text-[13.5px] font-black text-[#1e1b18] leading-snug inline-block bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1.5 rounded-xl shadow-xs"
                            >
                              نام راهنما:{' '}
                              <span className="font-black text-[#ea580c]">{gallery.curator}</span>
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Right Side: Curator Name */}
                        {hasCuratorName && (
                          <div
                            id="gallery-info-curator-name-container"
                            className="flex-1 select-text text-right pb-1 sm:pb-2"
                          >
                            <span
                              id="gallery-info-curator-name-text"
                              className="font-sans-custom text-[12px] sm:text-[13.5px] font-black text-[#1e1b18] leading-snug inline-block bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1.5 rounded-xl shadow-xs"
                            >
                              نام راهنما:{' '}
                              <span className="font-black text-[#ea580c]">{gallery.curator}</span>
                            </span>
                          </div>
                        )}

                        {/* Left Side: Curator Image */}
                        {hasCuratorImage && (
                          <div
                            id="gallery-info-curator-image-container"
                            className="shrink-0 flex items-end justify-end max-w-[50%] h-[150px] sm:h-[188px]"
                          >
                            <img
                              id="gallery-info-curator-image"
                              src={gallery.curatorUrl}
                              alt={gallery.curator ? `نام راهنما: ${gallery.curator}` : 'تصویر راهنما'}
                              className="h-full w-auto max-w-full object-contain block select-none"
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
                      </>
                    )}
                  </div>
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
              className={`absolute inset-0 w-full h-full bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl p-4 sm:p-6 shadow-[6px_6px_0px_#1e1b18] flex flex-col justify-between overflow-y-auto ${
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
                  <Compass className="w-4 h-4 text-[#ea580c] shrink-0" />
                  <h2
                    id="gallery-info-back-title"
                    className="font-sans-custom text-[18px] sm:text-[21px] font-black text-[#1e1b18] text-center"
                  >
                    انواع ایستگاه‌ها
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

              {/* CENTER: Stations Guide */}
              <div
                id="gallery-info-back-body"
                className="flex-1 flex flex-col justify-evenly py-2 sm:py-4 px-1"
              >
                {/* Row 1: Puzzle */}
                <div
                  id="gallery-info-rule-puzzle"
                  className="flex items-center text-right gap-3 sm:gap-3.5"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-[#1e1b18] bg-[#c084fc] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center shrink-0">
                    <Puzzle className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e1b18]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs sm:text-[13px] font-black text-[#1e1b18] block mb-0.5">پازل‌ها</span>
                    <p className="text-[11.5px] sm:text-[13px] text-[#581c87] font-medium leading-relaxed">
                      در هر گالری به محدوده پازل‌ها برو. سوالات پازل تو را با هویت عکاسی در هر دوره آشنا می‌کنند.
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-[#e2e8f0] w-full" />

                {/* Row 2: Star */}
                <div
                  id="gallery-info-rule-star"
                  className="flex items-center text-right gap-3 sm:gap-3.5"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-[#1e1b18] bg-[#34d399] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e1b18]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs sm:text-[13px] font-black text-[#1e1b18] block mb-0.5">ستاره‌ها</span>
                    <p className="text-[11.5px] sm:text-[13px] text-[#064e3b] font-medium leading-relaxed">
                      با رفتن به محدوده نقاط ستاره می‌تونی با سکه یا پاسخ به سوال اطلاعات اضافه و جالب کشف کنی.
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-[#e2e8f0] w-full" />

                {/* Row 3: Experience */}
                <div
                  id="gallery-info-rule-experience"
                  className="flex items-center text-right gap-3 sm:gap-3.5"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-[#1e1b18] bg-[#38bdf8] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e1b18]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs sm:text-[13px] font-black text-[#1e1b18] block mb-0.5">تجربه</span>
                    <p className="text-[11.5px] sm:text-[13px] text-[#0369a1] font-medium leading-relaxed">
                      این نقاط حاوی اطلاعات جالب یا محتوای چندرسانه‌ای درباره ابزارهای تجربه تعاملی در موزه هستن.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

