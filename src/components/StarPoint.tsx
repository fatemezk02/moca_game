import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CollectionPointMarker } from './CollectionPointMarker';
import {
  isStarPointUnlocked,
  markStarPointFirstViewed,
} from '../data/starPointProgressStore';
import { getStarDiscovery } from '../data/starDiscoveryData';
import { contentService } from '../services/content/contentService';

export interface StarPointProps {
  id: string;
  starId?: string;
  x: number;
  y: number;
  title?: string;
  galleryId?: string;
  mapWidth?: number;
  mapHeight?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenDiscoveryModal: (starPointId: string) => void;
}

/**
 * ============================================================================
 * STANDARDIZED STAR POINT ENTITY COMPONENT
 * ============================================================================
 * A permanent, reusable game entity with unified visual design, data structure,
 * interaction flow, and persistent unlock state across all galleries.
 *
 * Interaction Flow:
 * 1. Unlocked State:
 *    - Click directly opens Artwork Information view (no label, no question, no cost).
 * 2. Locked State:
 *    - First Click: Opens the contextual label directly next to the star,
 *      connected by a horizontal line in line with the star (matching Section Point style).
 *    - Second Click (or clicking label): Opens the Discovery Modal with Title, Intro,
 *      [سؤال] and [اطلاعات بیشتر].
 */
export const StarPoint: React.FC<StarPointProps> = ({
  id,
  starId,
  x,
  y,
  title,
  galleryId = 'gallery-01',
  mapWidth = 848,
  mapHeight = 1264,
  isSelected = false,
  onSelect,
  onOpenDiscoveryModal,
}) => {
  const effectiveStarId = starId || id;
  const [unlocked, setUnlocked] = useState<boolean>(() => isStarPointUnlocked(effectiveStarId));
  const [isLabelOpen, setIsLabelOpen] = useState<boolean>(false);

  // Subscribe to ContentService to re-render when Google Sheets data finishes loading
  const [, setContentVersion] = useState(0);
  useEffect(() => {
    return contentService.subscribe(() => {
      setContentVersion((v) => v + 1);
    });
  }, []);

  const discoveryData = getStarDiscovery(effectiveStarId, galleryId, starId);
  const labelText = discoveryData?.labelTextFa || '';

  // Responsive map percentage coordinates
  const leftPercent = (x / mapWidth) * 100;
  const topPercent = (y / mapHeight) * 100;

  // Determine if star is on the right half of the map to flip label placement
  const isRightSide = x > mapWidth / 2;

  // Listen to persistent progress changes
  useEffect(() => {
    const handleProgressUpdate = () => {
      setUnlocked(isStarPointUnlocked(effectiveStarId));
    };

    window.addEventListener('museum_star_point_progress_updated', handleProgressUpdate);
    return () => {
      window.removeEventListener('museum_star_point_progress_updated', handleProgressUpdate);
    };
  }, [effectiveStarId]);

  // Sync external selection state
  useEffect(() => {
    if (!isSelected) {
      setIsLabelOpen(false);
    }
  }, [isSelected]);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. Post-Unlock Behavior: Direct open to artwork information view
    if (unlocked) {
      setIsLabelOpen(false);
      onOpenDiscoveryModal(effectiveStarId);
      return;
    }

    // 2. Locked Behavior
    if (isLabelOpen) {
      // Second click on the star: Open Discovery Modal
      setIsLabelOpen(false);
      onOpenDiscoveryModal(effectiveStarId);
    } else {
      // First click: Reveal contextual label
      markStarPointFirstViewed(effectiveStarId);
      setIsLabelOpen(true);
      onSelect?.();
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLabelOpen(false);
    onOpenDiscoveryModal(effectiveStarId);
  };

  return (
    <div
      id={`star-point-${id}`}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
        transformOrigin: 'center center',
        zIndex: isLabelOpen || isSelected ? 60 : 30,
      }}
      className={`absolute pointer-events-auto ${
        isLabelOpen || isSelected ? 'z-[60]' : 'z-30'
      }`}
    >
      {/* Clickable Star Marker with standard visual design & shine */}
      <button
        type="button"
        onClick={handleStarClick}
        aria-label={`نقطه ستاره: ${discoveryData?.titleFa || title || effectiveStarId}`}
        title={discoveryData?.titleFa || title}
        className="relative group flex items-center justify-center p-1 rounded-full cursor-pointer focus:outline-none"
      >
        <CollectionPointMarker
          pointType="star"
          isSelected={isSelected || isLabelOpen}
          showPulse={false}
        />
      </button>

      {/* ====================================================================
          FIRST CLICK CONTEXTUAL LABEL
          Styled to match the Gallery 00 main map Section Point labels:
          ★ ────────────────
            ردپای عکاسی را در گذر زمان دنبال کن
          ==================================================================== */}
      <AnimatePresence>
        {isLabelOpen && !unlocked && !!labelText && (
          <motion.div
            id={`star-label-${id}`}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transformOrigin: isRightSide ? 'right center' : 'left center',
              zIndex: 70,
            }}
            onClick={handleLabelClick}
            className={`absolute top-1/2 -translate-y-1/2 z-[70] pointer-events-auto cursor-pointer ${
              isRightSide ? 'right-[90%]' : 'left-[90%]'
            }`}
          >
            {isRightSide ? (
              /* Label projecting to the LEFT */
              <div className="flex flex-col items-end pr-1 select-none group">
                {/* Horizontal line in line with the star */}
                <div className="h-[2px] bg-[#1e1b18] w-6 sm:w-8 -mr-1" />

                {/* Collection/lamp-style badge container: content-based width with dynamic boundary limit */}
                <div
                  style={{
                    maxWidth: `min(290px, calc(${Math.max(15, leftPercent - 2)}vw - 16px))`,
                  }}
                  className="mt-1 bg-[#ffffff] text-[#1e1b18] group-hover:bg-[#fef3c7] border-1.5 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] rounded-md px-2 py-0.5 font-sans-custom text-[11px] font-black tracking-tight transition-all duration-200 flex items-center gap-1.5 w-max text-right opacity-90 group-hover:opacity-100"
                >
                  <span className="break-words leading-snug">{labelText}</span>
                </div>
              </div>
            ) : (
              /* Label projecting to the RIGHT */
              <div className="flex flex-col items-start pl-1 select-none group">
                {/* Horizontal line in line with the star */}
                <div className="h-[2px] bg-[#1e1b18] w-6 sm:w-8 -ml-1" />

                {/* Collection/lamp-style badge container: content-based width with dynamic boundary limit */}
                <div
                  style={{
                    maxWidth: `min(290px, calc(${Math.max(15, 100 - leftPercent - 2)}vw - 16px))`,
                  }}
                  className="mt-1 bg-[#ffffff] text-[#1e1b18] group-hover:bg-[#fef3c7] border-1.5 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] rounded-md px-2 py-0.5 font-sans-custom text-[11px] font-black tracking-tight transition-all duration-200 flex items-center gap-1.5 w-max text-right opacity-90 group-hover:opacity-100"
                >
                  <span className="break-words leading-snug">{labelText}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarPoint;
