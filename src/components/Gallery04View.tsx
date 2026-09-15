import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import { AdminMapPoint, AdminCollectionPoint, AdminIconPoint, AdminArrowPoint, AdminPuzzlePoint } from '../types/admin';
import { ConfiguredArtworkReveal } from './ConfiguredArtworkReveal';
import { CustomIconRender } from './CustomIconRender';
import { CollectionPointMarker } from './CollectionPointMarker';
import { NavigationArrowRender } from './NavigationArrowRender';
import { Gallery04MapSvg } from './Gallery04MapSvg';
import { StarDiscoveryModal } from './StarDiscoveryModal';
import { PuzzlePoint } from './PuzzlePoint';
import { PuzzleQuestionModal } from './PuzzleQuestionModal';
import { StarQuestionPopup } from './StarQuestionPopup';
import { StarPoint } from './StarPoint';
import { ExperiencePoint } from './ExperiencePoint';
import { ExperienceModal } from './ExperienceModal';
import { getExperiencePointsForGallery } from '../data/experiencePointsConfig';
import { ExperienceContent } from '../services/content/types';
import {
  hasStarPointBeenViewed,
  markStarPointFirstViewed,
} from '../data/starPointProgressStore';
import {
  isArrowVisibleToPlayer,
  markArrowUsed,
} from '../data/arrowConditionsStore';
import { setCurrentGalleryId } from '../data/playerLocationStore';
import { contentService } from '../services/content/contentService';
import { formatTwoDigitPersian } from '../services/content/mappers';
import { GalleryInfoModal } from './GalleryInfoModal';
import { SharedGalleryPageLayout } from './SharedGalleryPageLayout';

interface Gallery04ViewProps {
  onNavigateBack: () => void;
  onNavigateToQuestions?: () => void;
  onNavigateToPuzzleQuestion?: (puzzlePoint: AdminPuzzlePoint) => void;
  onNavigateToGallery?: (
    galleryId: 'gallery-00' | 'gallery-01' | 'gallery-03' | 'gallery-04' | 'gallery-05' | 'gallery-01-questions' | 'gallery-03-questions'
  ) => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

const GALLERY_04_MAP_WIDTH = 498.55;
const GALLERY_04_MAP_HEIGHT = 851.79;

export const Gallery04View: React.FC<Gallery04ViewProps> = ({
  onNavigateBack,
  onNavigateToQuestions,
  onNavigateToPuzzleQuestion,
  onNavigateToGallery,
  onSelectTab,
}) => {
  const galleryRecord = contentService.getGalleryById('gallery-04');
  const galleryNumFa = formatTwoDigitPersian(galleryRecord?.galleryNumber || '04');
  const galleryNameFa = galleryRecord?.nameFa?.trim() || 'ثبت دوام ما';

  const [points, setPoints] = useState<AdminMapPoint[]>(() => getGalleryPoints('gallery-04'));
  const [arrows, setArrows] = useState<AdminArrowPoint[]>(() => getGalleryArrows('gallery-04'));
  const [selectedArtwork, setSelectedArtwork] = useState<AdminCollectionPoint | null>(null);
  const [selectedStarPointId, setSelectedStarPointId] = useState<string | null>(null);
  const [activeStarDiscoveryId, setActiveStarDiscoveryId] = useState<string | null>(null);
  const [activePuzzlePoint, setActivePuzzlePoint] = useState<AdminPuzzlePoint | null>(null);
  const [activeGalleryInfoId, setActiveGalleryInfoId] = useState<string | null>(null);
  const [selectedExperiencePointId, setSelectedExperiencePointId] = useState<string | null>(null);
  const [activeExperience, setActiveExperience] = useState<ExperienceContent | null>(null);
  const [puzzleUpdateTrigger, setPuzzleUpdateTrigger] = useState<number>(0);

  // Sync with Admin point changes dynamically
  useEffect(() => {
    const handleUpdate = () => {
      setPoints(getGalleryPoints('gallery-04'));
    };
    window.addEventListener('museum_points_updated', handleUpdate);
    window.addEventListener('museum_puzzle_progress_updated', handleUpdate);
    return () => {
      window.removeEventListener('museum_points_updated', handleUpdate);
      window.removeEventListener('museum_puzzle_progress_updated', handleUpdate);
    };
  }, []);

  // Sync with Admin arrow changes and usage dynamically
  useEffect(() => {
    const handleArrowsUpdate = () => {
      setArrows(getGalleryArrows('gallery-04'));
    };
    window.addEventListener('museum_arrows_updated', handleArrowsUpdate);
    window.addEventListener('museum_used_arrows_updated', handleArrowsUpdate);
    window.addEventListener('museum_player_progress_updated', handleArrowsUpdate);
    window.addEventListener('museum_answered_questions_updated', handleArrowsUpdate);
    window.addEventListener('museum_puzzle_progress_updated', handleArrowsUpdate);

    return () => {
      window.removeEventListener('museum_arrows_updated', handleArrowsUpdate);
      window.removeEventListener('museum_used_arrows_updated', handleArrowsUpdate);
      window.removeEventListener('museum_player_progress_updated', handleArrowsUpdate);
      window.removeEventListener('museum_answered_questions_updated', handleArrowsUpdate);
      window.removeEventListener('museum_puzzle_progress_updated', handleArrowsUpdate);
    };
  }, []);

  // Sync with puzzle progress updates
  useEffect(() => {
    const handlePuzzleProgress = () => {
      setPuzzleUpdateTrigger((prev) => prev + 1);
    };
    window.addEventListener('museum_puzzle_progress_updated', handlePuzzleProgress);
    return () => window.removeEventListener('museum_puzzle_progress_updated', handlePuzzleProgress);
  }, []);

  const handlePointClick = (artwork: AdminCollectionPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStarPointId(null);

    // Normal Collection Point: toggle artwork display
    if (selectedArtwork?.id === artwork.id) {
      setSelectedArtwork(null);
    } else {
      setSelectedArtwork(artwork);
    }
  };

  const handleClosePopup = () => {
    setSelectedArtwork(null);
    setSelectedStarPointId(null);
    setSelectedExperiencePointId(null);
  };

  const handlePuzzlePointClick = (puzzlePoint: AdminPuzzlePoint, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArtwork(null);
    setSelectedStarPointId(null);
    if (puzzlePoint.isActive !== false) {
      setActivePuzzlePoint(puzzlePoint);
    }
  };

  const handleArrowClick = (arrow: AdminArrowPoint, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!arrow.destination || arrow.destination === 'none') {
      return;
    }

    // Mark arrow as used so it disappears from source map (except return arrows)
    if (!arrow.title?.includes('بازگشت') && !arrow.id.includes('-to-g03')) {
      markArrowUsed(arrow.id);
    }

    // If destination is gallery-00, return to master floor plan
    if (arrow.destination === 'gallery-00') {
      setCurrentGalleryId('gallery-00');
      onNavigateBack();
      return;
    }

    // Otherwise navigate directly to the target gallery
    setCurrentGalleryId(arrow.destination as any);
    if (onNavigateToGallery) {
      onNavigateToGallery(arrow.destination as any);
    }
  };

  const handleIconPointClick = (iconPoint: AdminIconPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArtwork(null);
    setSelectedStarPointId(null);

    if (iconPoint.destination === 'gallery-04') {
      setActiveGalleryInfoId('gallery-04');
      return;
    }

    if (iconPoint.destination === 'gallery-00') {
      setCurrentGalleryId('gallery-00');
      onNavigateBack();
      return;
    }

    if (iconPoint.destination === 'gallery-01' || iconPoint.destination === 'gallery-03') {
      setCurrentGalleryId(iconPoint.destination);
      if (onNavigateToGallery) {
        onNavigateToGallery(iconPoint.destination);
      }
      return;
    }

    setActiveGalleryInfoId('gallery-04');
  };

  // Filter dynamic visibility for arrows based on player puzzle completion
  const visibleArrows = arrows.filter((arrow) => isArrowVisibleToPlayer(arrow));

  const collectionPoints = points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const iconPoints = points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const puzzlePoints = points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const experiencePoints = React.useMemo(() => getExperiencePointsForGallery('gallery-04'), [puzzleUpdateTrigger]);

  // Ensure central question/info entry point is present at ~center (x: 249, y: 426)
  const effectiveIconPoints = iconPoints.some(
    (p) => p.destination === 'gallery-04' || p.id === 'icon-g04-info'
  )
    ? iconPoints
    : [
        ...iconPoints,
        {
          id: 'icon-g04-info',
          type: 'icon' as const,
          galleryId: 'gallery-04',
          title: 'اطلاعات گالری ۰۴',
          x: 244,
          y: 387,
          iconType: 'preset-question' as const,
          width: 48,
          height: 34,
          destination: 'gallery-04' as const,
        },
      ];

  const modalsContent = (
    <>
      {/* Dedicated Star Point "Discover More" Modal */}
      {activeStarDiscoveryId && (
        <StarQuestionPopup
          starPointId={activeStarDiscoveryId}
          galleryId="gallery-04"
          isOpen={!!activeStarDiscoveryId}
          onClose={() => setActiveStarDiscoveryId(null)}
        />
      )}

      {/* Shared Puzzle Question Modal */}
      {activePuzzlePoint && (
        <PuzzleQuestionModal
          galleryId="gallery_04"
          puzzlePoint={activePuzzlePoint}
          onClose={() => setActivePuzzlePoint(null)}
        />
      )}

      {/* Shared Gallery Information Modal for Gallery Center Icon */}
      <GalleryInfoModal
        galleryId={activeGalleryInfoId}
        isOpen={Boolean(activeGalleryInfoId)}
        onClose={() => setActiveGalleryInfoId(null)}
      />

      {/* Interactive Experience Modal */}
      {activeExperience && (
        <ExperienceModal
          isOpen={Boolean(activeExperience)}
          onClose={() => setActiveExperience(null)}
          experience={activeExperience}
        />
      )}
    </>
  );

  return (
    <SharedGalleryPageLayout
      galleryId="gallery-04"
      galleryNumberPersian={galleryNumFa}
      galleryNamePersian={galleryNameFa}
      onNavigateBack={onNavigateBack}
      onSelectTab={onSelectTab}
      onClickOutside={handleClosePopup}
      mapWidth={GALLERY_04_MAP_WIDTH}
      mapHeight={GALLERY_04_MAP_HEIGHT}
      mapSvg={
        <Gallery04MapSvg
          className="w-full h-full object-contain filter drop-shadow-sm pointer-events-auto"
        />
      }
      modals={modalsContent}
    >
      {/* 1. Dynamic Navigation Arrows Layer */}
      {visibleArrows.map((arrow) => {
        const leftPercent = (arrow.x / GALLERY_04_MAP_WIDTH) * 100;
        const topPercent = (arrow.y / GALLERY_04_MAP_HEIGHT) * 100;

        return (
          <div
            key={arrow.id}
            id={`arrow-${arrow.id}`}
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
              transformOrigin: 'center center',
            }}
            className="absolute z-30 pointer-events-auto"
          >
            <NavigationArrowRender
              arrow={arrow}
              isInteractive={true}
              onClick={(e) => handleArrowClick(arrow, e)}
            />
          </div>
        );
      })}

      {/* 2. Custom Icon Points (Type B) — Central Info Icon */}
      {effectiveIconPoints.map((iconPoint) => {
        const leftPercent = (iconPoint.x / GALLERY_04_MAP_WIDTH) * 100;
        const topPercent = (iconPoint.y / GALLERY_04_MAP_HEIGHT) * 100;

        return (
          <div
            key={iconPoint.id}
            id={`icon-point-${iconPoint.id}`}
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
              transformOrigin: 'center center',
            }}
            className="absolute pointer-events-auto z-20"
          >
            <button
              onClick={(e) => handleIconPointClick(iconPoint, e)}
              aria-label={`Open ${iconPoint.title}`}
              className="relative group flex items-center justify-center cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
            >
              <CustomIconRender point={iconPoint} />
            </button>
          </div>
        );
      })}

      {/* 3. Interactive Puzzle Points (Type: Puzzle) */}
      {puzzlePoints.map((puzzlePoint) => (
        <PuzzlePoint
          key={puzzlePoint.id}
          puzzlePoint={puzzlePoint}
          galleryId="gallery-04"
          mapWidth={GALLERY_04_MAP_WIDTH}
          mapHeight={GALLERY_04_MAP_HEIGHT}
          onClick={handlePuzzlePointClick}
          isSelected={activePuzzlePoint?.id === puzzlePoint.id}
        />
      ))}

      {/* Interactive Experience Points (Gallery 04: mirror) */}
      {experiencePoints.map((exp) => (
        <ExperiencePoint
          key={exp.id}
          id={exp.id}
          experienceId={exp.experienceId}
          galleryId="gallery_04"
          x={exp.x}
          y={exp.y}
          iconId={exp.iconId}
          label={exp.labelFa}
          title={exp.title}
          mapWidth={GALLERY_04_MAP_WIDTH}
          mapHeight={GALLERY_04_MAP_HEIGHT}
          isSelected={selectedExperiencePointId === exp.id}
          onSelect={() => {
            setSelectedArtwork(null);
            setSelectedStarPointId(null);
            setSelectedExperiencePointId(exp.id);
          }}
          onOpenModal={(experience) => {
            setSelectedArtwork(null);
            setSelectedStarPointId(null);
            setSelectedExperiencePointId(null);
            setActiveExperience(experience);
          }}
        />
      ))}

      {/* 4. Render Collection Points & Star Points */}
      {collectionPoints.map((artwork) => {
        if (artwork.pointType === 'star') {
          return (
            <StarPoint
              key={artwork.id}
              id={artwork.id}
              starId={artwork.starId || artwork.id}
              x={artwork.x}
              y={artwork.y}
              title={artwork.title}
              galleryId="gallery-04"
              mapWidth={GALLERY_04_MAP_WIDTH}
              mapHeight={GALLERY_04_MAP_HEIGHT}
              isSelected={selectedStarPointId === artwork.id}
              onSelect={() => {
                setSelectedArtwork(null);
                setSelectedStarPointId(artwork.id);
              }}
              onOpenDiscoveryModal={(starId) => {
                setSelectedArtwork(null);
                setSelectedStarPointId(null);
                setActiveStarDiscoveryId(starId);
              }}
            />
          );
        }

        const leftPercent = (artwork.x / GALLERY_04_MAP_WIDTH) * 100;
        const topPercent = (artwork.y / GALLERY_04_MAP_HEIGHT) * 100;
        const isSelected = selectedArtwork?.id === artwork.id;
        const isRightSide = artwork.x > GALLERY_04_MAP_WIDTH / 2;

        return (
          <div
            key={artwork.id}
            id={`artwork-point-${artwork.id}`}
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
              transformOrigin: 'center center',
            }}
            className="absolute pointer-events-auto z-30"
          >
            {/* Clickable Map Marker Button */}
            <button
              onClick={(e) => handlePointClick(artwork, e)}
              aria-label={`Artwork Point: ${artwork.title}`}
              className="relative group flex items-center justify-center p-1 rounded-full cursor-pointer focus:outline-none"
            >
              <CollectionPointMarker
                pointType="normal"
                isSelected={isSelected}
                showPulse={true}
              />
            </button>

            {/* Direct Artwork Frames Reveal */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  key={`artwork-reveal-${artwork.id}`}
                  initial={{
                    clipPath: isRightSide
                      ? 'inset(0% 0% 0% 100%)'
                      : 'inset(0% 100% 0% 0%)',
                  }}
                  animate={{
                    clipPath: 'inset(0% 0% 0% 0%)',
                  }}
                  exit={{
                    clipPath: isRightSide
                      ? 'inset(0% 0% 0% 100%)'
                      : 'inset(0% 100% 0% 0%)',
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClosePopup();
                  }}
                  className={`absolute z-50 pointer-events-auto cursor-pointer ${
                    isRightSide
                      ? 'right-full mr-2 sm:mr-3 top-1/2 -translate-y-1/2'
                      : 'left-full ml-2 sm:ml-3 top-1/2 -translate-y-1/2'
                  }`}
                  title="Click to dismiss artwork"
                >
                  <ConfiguredArtworkReveal frames={artwork.frames} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </SharedGalleryPageLayout>
  );
};
