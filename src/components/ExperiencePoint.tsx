import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExperiencePointMarker } from './ExperiencePointMarker';
import { ExperienceContent, ExperienceIconType } from '../services/content/types';
import { contentService } from '../services/content/contentService';
import { DEFAULT_EXPERIENCES } from '../services/content/defaultSeedContent';

export interface ExperiencePointProps {
  id: string;
  experienceId: string;
  galleryId: string;
  x: number;
  y: number;
  iconId?: ExperienceIconType | string;
  label?: string;
  title?: string;
  mapWidth?: number;
  mapHeight?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenModal: (experience: ExperienceContent) => void;
}

export const ExperiencePoint: React.FC<ExperiencePointProps> = ({
  id,
  experienceId,
  galleryId,
  x,
  y,
  iconId: propIconId,
  label: propLabel,
  title: propTitle,
  mapWidth = 848,
  mapHeight = 1264,
  isSelected = false,
  onSelect,
  onOpenModal,
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState<boolean>(false);
  const [, setContentVersion] = useState<number>(0);

  // Subscribe to ContentService updates (e.g. when Google Sheets load finishes)
  useEffect(() => {
    return contentService.subscribe(() => {
      setContentVersion((v) => v + 1);
    });
  }, []);

  // Sync external selection state
  useEffect(() => {
    if (!isSelected) {
      setIsLabelOpen(false);
    }
  }, [isSelected]);

  // Resolve the specific experience data for this point.
  // CRITICAL: Never fall back to the first experience of another entity.
  const resolvedExperience = React.useMemo<ExperienceContent>(() => {
    const targetId = (experienceId || id || '').toLowerCase();
    const fromService =
      contentService.getExperienceById(experienceId || id || '') ||
      contentService.getExperiencesForGallery(galleryId || '').find(
        (e) =>
          (e.experienceId || '').toLowerCase() === targetId ||
          (e.id || '').toLowerCase() === targetId
      );

    if (fromService) {
      return fromService;
    }

    // Seed fallback for this specific experienceId ONLY
    const fromSeed = DEFAULT_EXPERIENCES.find(
      (e) =>
        (e.experienceId || '').toLowerCase() === targetId ||
        (e.id || '').toLowerCase() === targetId
    );

    if (fromSeed) {
      return fromSeed;
    }

    // Fallback constructed ONLY for this experience entity
    return {
      id: experienceId || id || 'experience',
      experienceId: experienceId || id || 'experience',
      galleryId,
      labelFa: propLabel || propTitle || experienceId,
      title: propTitle || propLabel || experienceId,
      descriptionFa: '',
      iconId: (propIconId as ExperienceIconType) || 'frame',
      active: true,
    };
  }, [experienceId, galleryId, propIconId, propLabel, propTitle]);

  const displayLabel = resolvedExperience.labelFa || resolvedExperience.title || experienceId;
  const effectiveIcon =
    id === 'exp-g02-reversed-camera' || propIconId === 'reversed-camera' || resolvedExperience.iconId === 'reversed-camera'
      ? 'reversed-camera'
      : id === 'exp-g05-vintage-camera'
      ? 'vintage-camera'
      : id === 'exp-g05-mirror-selfie'
      ? 'mirror-selfie'
      : propIconId || resolvedExperience.iconId || 'frame';

  // Responsive map percentage coordinates
  const leftPercent = (x / mapWidth) * 100;
  const topPercent = (y / mapHeight) * 100;
  const isRightSide = x > mapWidth / 2;

  const handleMarkerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLabelOpen) {
      // Second click: Open modal
      setIsLabelOpen(false);
      onOpenModal(resolvedExperience);
    } else {
      // First click: Reveal label
      setIsLabelOpen(true);
      onSelect?.();
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLabelOpen(false);
    onOpenModal(resolvedExperience);
  };

  return (
    <div
      id={`experience-point-${id}`}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
        transformOrigin: 'center center',
      }}
      className="absolute pointer-events-auto z-30"
    >
      {/* Clickable Experience Marker */}
      <button
        type="button"
        onClick={handleMarkerClick}
        aria-label={`تجربه: ${displayLabel}`}
        title={displayLabel}
        className="relative group flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer focus:outline-none"
      >
        <ExperiencePointMarker
          iconId={effectiveIcon}
          isSelected={isSelected || isLabelOpen}
          title={displayLabel}
        />
      </button>

      {/* First Click Contextual Label */}
      <AnimatePresence>
        {isLabelOpen && !!displayLabel && (
          <motion.div
            id={`experience-label-${id}`}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transformOrigin: isRightSide ? 'right center' : 'left center',
            }}
            onClick={handleLabelClick}
            className={`absolute top-1/2 -translate-y-1/2 z-40 pointer-events-auto cursor-pointer ${
              isRightSide ? 'right-[90%]' : 'left-[90%]'
            }`}
          >
            {isRightSide ? (
              /* Label projecting to the LEFT */
              <div className="flex flex-col items-end pr-1 select-none group">
                {/* Horizontal line in line with the marker */}
                <div className="h-[2px] bg-[#1e1b18] w-6 sm:w-8 -mr-1" />

                {/* Collection/lamp-style badge container: content-based width with dynamic boundary limit */}
                <div
                  style={{
                    maxWidth: `min(290px, calc(${Math.max(15, leftPercent - 2)}vw - 16px))`,
                  }}
                  className="mt-1 bg-[#ffffff] text-[#1e1b18] group-hover:bg-[#fef3c7] border-1.5 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] rounded-md px-2 py-0.5 font-sans-custom text-[11px] font-black tracking-tight transition-all duration-200 flex items-center gap-1.5 w-max text-right opacity-90 group-hover:opacity-100"
                >
                  <span className="break-words leading-snug">{displayLabel}</span>
                </div>
              </div>
            ) : (
              /* Label projecting to the RIGHT */
              <div className="flex flex-col items-start pl-1 select-none group">
                {/* Horizontal line in line with the marker */}
                <div className="h-[2px] bg-[#1e1b18] w-6 sm:w-8 -ml-1" />

                {/* Collection/lamp-style badge container: content-based width with dynamic boundary limit */}
                <div
                  style={{
                    maxWidth: `min(290px, calc(${Math.max(15, 100 - leftPercent - 2)}vw - 16px))`,
                  }}
                  className="mt-1 bg-[#ffffff] text-[#1e1b18] group-hover:bg-[#fef3c7] border-1.5 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] rounded-md px-2 py-0.5 font-sans-custom text-[11px] font-black tracking-tight transition-all duration-200 flex items-center gap-1.5 w-max text-right opacity-90 group-hover:opacity-100"
                >
                  <span className="break-words leading-snug">{displayLabel}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExperiencePoint;
