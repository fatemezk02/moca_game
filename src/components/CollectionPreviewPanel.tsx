import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MuseumCollection, RevealDirection } from '../types';
import { PlaceholderArtworkGraphic } from './PlaceholderArtworkGraphic';
import { X, ArrowRight, Volume2, Compass, Layers, Sparkles } from 'lucide-react';

interface CollectionPreviewPanelProps {
  collection: MuseumCollection | null;
  onClose: () => void;
  onOpenFullDetail: (collection: MuseumCollection) => void;
  onAudioPlay?: (collection: MuseumCollection) => void;
  isAudioPlaying?: boolean;
  isStarPoint?: boolean;
  onOpenStarDiscovery?: () => void;
}

/**
 * ============================================================================
 * DIRECTIONAL REVEAL ANIMATION CONFIGURATION
 * ============================================================================
 * Calculates smooth emergence variants originating from the marker's wall position
 * and projecting into the gallery interior.
 */
function getMotionVariants(direction: RevealDirection) {
  switch (direction) {
    case 'left':
      // Wall on West (Left) -> Emerges eastward from left to right
      return {
        initial: {
          opacity: 0,
          x: -32,
          y: 0,
          scale: 0.95,
          clipPath: 'inset(0% 100% 0% 0%)',
        },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          transition: {
            duration: 0.42,
            ease: [0.16, 1, 0.3, 1], // snappy cubic bezier
          },
        },
        exit: {
          opacity: 0,
          x: -24,
          scale: 0.96,
          clipPath: 'inset(0% 100% 0% 0%)',
          transition: {
            duration: 0.28,
            ease: [0.4, 0, 1, 1],
          },
        },
      };

    case 'right':
      // Wall on East (Right) -> Emerges westward from right to left
      return {
        initial: {
          opacity: 0,
          x: 32,
          y: 0,
          scale: 0.95,
          clipPath: 'inset(0% 0% 0% 100%)',
        },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          transition: {
            duration: 0.42,
            ease: [0.16, 1, 0.3, 1],
          },
        },
        exit: {
          opacity: 0,
          x: 24,
          scale: 0.96,
          clipPath: 'inset(0% 0% 0% 100%)',
          transition: {
            duration: 0.28,
            ease: [0.4, 0, 1, 1],
          },
        },
      };

    case 'top':
      // Wall on North (Top) -> Emerges southward from top to bottom
      return {
        initial: {
          opacity: 0,
          x: 0,
          y: -32,
          scale: 0.95,
          clipPath: 'inset(0% 0% 100% 0%)',
        },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          transition: {
            duration: 0.42,
            ease: [0.16, 1, 0.3, 1],
          },
        },
        exit: {
          opacity: 0,
          y: -24,
          scale: 0.96,
          clipPath: 'inset(0% 0% 100% 0%)',
          transition: {
            duration: 0.28,
            ease: [0.4, 0, 1, 1],
          },
        },
      };

    case 'bottom':
      // Wall on South (Bottom) -> Emerges northward from bottom to top
      return {
        initial: {
          opacity: 0,
          x: 0,
          y: 32,
          scale: 0.95,
          clipPath: 'inset(100% 0% 0% 0%)',
        },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          transition: {
            duration: 0.42,
            ease: [0.16, 1, 0.3, 1],
          },
        },
        exit: {
          opacity: 0,
          y: 24,
          scale: 0.96,
          clipPath: 'inset(100% 0% 0% 0%)',
          transition: {
            duration: 0.28,
            ease: [0.4, 0, 1, 1],
          },
        },
      };
  }
}

export const CollectionPreviewPanel: React.FC<CollectionPreviewPanelProps> = ({
  collection,
  onClose,
  onOpenFullDetail,
  onAudioPlay,
  isAudioPlaying = false,
  isStarPoint = false,
  onOpenStarDiscovery,
}) => {
  return (
    <AnimatePresence mode="wait">
      {collection && (
        <motion.div
          key={collection.id}
          id="collection-preview-panel-container"
          variants={getMotionVariants(collection.direction)}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute z-40 pointer-events-auto w-full max-w-sm sm:max-w-md px-3 sm:px-0"
          style={{
            // Position panel intelligently based on screen and direction
            // On desktop/tablet, position dynamically relative to gallery interior
            left:
              collection.direction === 'left'
                ? 'min(max(20px, calc(28% + 10px)), calc(100vw - 360px))'
                : collection.direction === 'right'
                ? 'auto'
                : '50%',
            right: collection.direction === 'right' ? 'min(max(20px, calc(28% + 10px)), calc(100vw - 360px))' : 'auto',
            top:
              collection.direction === 'top'
                ? 'min(max(20px, calc(22% + 10px)), calc(100vh - 440px))'
                : collection.direction === 'bottom'
                ? 'auto'
                : '50%',
            bottom: collection.direction === 'bottom' ? '84px' : 'auto',
            transform:
              collection.direction === 'top' || collection.direction === 'bottom'
                ? 'translateX(-50%)'
                : collection.direction === 'left' || collection.direction === 'right'
                ? 'translateY(-50%)'
                : 'none',
          }}
        >
          {/* Neo-Pop Comic Card Frame */}
          <div
            id="collection-preview-card"
            className="bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl shadow-[5px_5px_0px_#1e1b18] relative overflow-hidden transition-all"
          >
            {/* Top Comic Header / Room Code Line */}
            <div className="bg-[#fee2e2] border-b-2 border-[#1e1b18] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444] border-[1.5px] border-[#1e1b18] inline-block"></span>
                <span className="font-sans-custom text-[12px] font-black text-[#1e1b18] tracking-wider uppercase">
                  {collection.roomCode}
                </span>
                <span className="text-[#1e1b18]/40">|</span>
                <span className="font-sans-custom text-[11px] font-bold text-[#991b1b]">
                  {collection.wing}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Reveal Origin Indicator Badge */}
                <div
                  className="text-[10px] font-bold bg-[#ffffff] text-[#1e1b18] px-2 py-0.5 rounded-full border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] uppercase flex items-center gap-1"
                  title={`دیوار ${collection.direction}`}
                >
                  <Compass className="w-3 h-3 text-[#f59e0b]" />
                  <span>دیوار {collection.direction}</span>
                </div>

                {/* Close Button */}
                <button
                  id="close-preview-button"
                  onClick={onClose}
                  aria-label="بستن پیش‌نمایش"
                  className="w-7 h-7 rounded-full bg-[#ffffff] hover:bg-[#ef4444] hover:text-white transition-all text-[#1e1b18] border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 space-y-3">
              {/* Collection Title & Subtitle */}
              <div>
                <h3 className="font-sans-custom text-[18px] sm:text-[20px] leading-tight font-black text-[#1e1b18]">
                  {collection.title}
                </h3>
                <p className="text-[12px] font-medium text-[#64748b] mt-0.5">
                  {collection.period} • {collection.subtitle}
                </p>
              </div>

              {/* Placeholder Collection Graphic / Real Artwork Asset Area */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18]">
                <PlaceholderArtworkGraphic collection={collection} />
                
                {/* Artwork Count Tag */}
                <div className="absolute top-2 left-2 bg-[#fef08a] border-2 border-[#1e1b18] px-2 py-0.5 rounded-lg text-[11px] font-black text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>{collection.artworkCount} اثر</span>
                </div>
              </div>

              {/* Star Collection Point: Discover More Message */}
              {isStarPoint && (
                <div className="text-center -mt-1 mb-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenStarDiscovery?.();
                    }}
                    className="cursor-pointer group inline-block"
                  >
                    <span className="inline-block text-[11px] font-sans-custom font-bold text-[#1e1b18] bg-[#fef3c7] hover:bg-[#fbbf24] border border-[#1e1b18] px-3 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#1e1b18] tracking-tight transition-all group-hover:scale-105 active:scale-95">
                      کشف بیشتر
                    </span>
                  </button>
                </div>
              )}

              {/* Short Curatorial Description */}
              <p className="text-[13px] leading-relaxed text-[#334155] font-medium line-clamp-3">
                {collection.curatorNote}
              </p>

              {/* Accession Meta & Audio Guide Badge */}
              <div className="pt-2 border-t-2 border-[#f1f5f9] flex items-center justify-between text-[11px] font-bold text-[#64748b]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#1e1b18]">شماره ثبت:</span>
                  <span className="font-mono-custom text-[#475569]">{collection.accessionRange}</span>
                </div>
                <div className="flex items-center gap-1 text-[#d97706] bg-[#fef3c7] px-2 py-0.5 rounded-full border border-[#1e1b18]">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{collection.audioGuideDuration}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 grid grid-cols-2 gap-2.5">
                <button
                  id="preview-audio-guide-btn"
                  onClick={() => onAudioPlay && onAudioPlay(collection)}
                  className={`neo-btn py-2 px-2.5 text-[12px] flex items-center justify-center gap-1.5 cursor-pointer ${
                    isAudioPlaying
                      ? 'bg-[#f59e0b] text-[#1e1b18]'
                      : 'bg-[#ffffff] text-[#1e1b18] hover:bg-[#f8fafc]'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isAudioPlaying ? 'در حال پخش' : 'راهنمای صوتی'}</span>
                </button>

                <button
                  id="preview-explore-artworks-btn"
                  onClick={() => onOpenFullDetail(collection)}
                  className="neo-btn py-2 px-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#1e1b18] text-[12px] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>مشاهده بخش</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Subtle Status Bar */}
            <div className="bg-[#f8fafc] px-4 py-1.5 border-t-2 border-[#1e1b18] flex items-center justify-between text-[10px] font-bold text-[#64748b]">
              <span className="flex items-center gap-1 text-[#f59e0b]">
                <Sparkles className="w-3 h-3" />
                گالری ۰۰ • مخزن آثار
              </span>
              <span>برای بستن کلیک کنید</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
