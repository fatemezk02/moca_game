import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, X, Loader2 } from 'lucide-react';
import { useGlobalGuideAudio } from '../services/audio/guideAudioService';
import { getLogicalGalleryNumber, formatTwoDigitPersian } from '../services/content/mappers';

export const GlobalGuideAudioPlayer: React.FC = () => {
  const {
    galleryId,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    togglePlay,
    stop,
    seek,
  } = useGlobalGuideAudio();

  // Only show when an audio guide is currently playing or paused/active
  const isVisible = Boolean(galleryId && (isPlaying || currentTime > 0 || isLoading));

  if (!isVisible || !galleryId) {
    return null;
  }

  const logicalNum = getLogicalGalleryNumber(galleryId);
  const galleryTitle = logicalNum
    ? `راهنمای گالری ${formatTwoDigitPersian(logicalNum)}`
    : 'راهنمای صوتی';

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="hud-attached-audio-bar"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        id="global-top-sticky-audio-bar"
        dir="ltr"
        className="w-full z-40 bg-[#ffffff]/95 backdrop-blur-md border-b-[1.25px] border-[#1e1b18] shadow-[0px_1.5px_0px_#1e1b18] select-none shrink-0"
      >
        <div className="w-full max-w-4xl mx-auto h-7 sm:h-8 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
          {/* LEFT: Small Play/Pause Button */}
          <button
            type="button"
            id="top-audio-play-pause-btn"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={isPlaying ? 'توقف پخش' : 'ادامه پخش'}
            title={isPlaying ? 'توقف' : 'پخش'}
            disabled={isLoading}
            className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none flex items-center justify-center cursor-pointer transition-all shrink-0 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-3 h-3 fill-white stroke-[2.5]" />
            ) : (
              <Play className="w-3 h-3 fill-white stroke-[2.5] translate-x-[0.5px]" />
            )}
          </button>

          {/* Current Gallery Name / Number (Canonical, Persian Digits) */}
          <span
            id="top-audio-gallery-title"
            dir="rtl"
            className="font-sans-custom text-[10.5px] sm:text-[11.5px] font-black text-[#1e1b18] whitespace-nowrap shrink-0 select-text"
          >
            {galleryTitle}
          </span>

          {/* CENTER: Thin Horizontal Progress Indicator with Active Position Dot */}
          <div
            id="top-audio-progress-track"
            onClick={handleProgressBarClick}
            role="slider"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="نوار پیشرفت پخش صوتی"
            className="flex-1 h-1.5 sm:h-1.5 bg-[#fed7aa]/50 hover:bg-[#fed7aa]/80 rounded-full border border-[#1e1b18]/40 overflow-visible cursor-pointer relative transition-colors flex items-center"
          >
            {/* Filled Progress Segment */}
            <div
              id="top-audio-progress-fill"
              className="h-full bg-[#ea580c] rounded-full transition-[width] duration-100 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Circular Progress Dot Indicator at exact playback position */}
            <div
              id="top-audio-progress-dot"
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#ea580c] border-[1.5px] border-[#1e1b18] rounded-full shadow-[1px_1px_0px_#1e1b18] transition-[left] duration-100 ease-linear pointer-events-none z-10"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* RIGHT: Small "×" Close / Stop Button */}
          <button
            type="button"
            id="top-audio-stop-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              stop();
            }}
            aria-label="بستن و توقف راهنمای صوتی"
            title="بستن راهنما"
            className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#f1f5f9] hover:bg-[#fee2e2] text-[#64748b] hover:text-[#ef4444] border border-[#1e1b18]/60 shadow-[1px_1px_0px_#1e1b18] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none flex items-center justify-center cursor-pointer transition-all shrink-0"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
