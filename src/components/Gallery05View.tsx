import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import {
  AdminMapPoint,
  AdminCollectionPoint,
  AdminIconPoint,
  AdminArrowPoint,
  AdminPuzzlePoint,
} from '../types/admin';
import { ConfiguredArtworkReveal } from './ConfiguredArtworkReveal';
import { CustomIconRender } from './CustomIconRender';
import { CollectionPointMarker } from './CollectionPointMarker';
import { NavigationArrowRender } from './NavigationArrowRender';
import { Gallery05MapSvg } from './Gallery05MapSvg';
import { StarDiscoveryModal } from './StarDiscoveryModal';
import { PuzzlePoint } from './PuzzlePoint';
import { PuzzleQuestionModal } from './PuzzleQuestionModal';
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
import { getLocationPinsVisible } from '../data/locationPinsVisibilityStore';
import { contentService } from '../services/content/contentService';
import { formatTwoDigitPersian } from '../services/content/mappers';
import { GalleryInfoModal } from './GalleryInfoModal';
import { SharedGalleryPageLayout } from './SharedGalleryPageLayout';

interface Gallery05ViewProps {
  onNavigateBack: () => void;
  onNavigateToQuestions?: () => void;
  onNavigateToPuzzleQuestion?: (puzzlePoint: AdminPuzzlePoint) => void;
  onNavigateToGallery?: (
    galleryId:
      | 'gallery-00'
      | 'gallery-01'
      | 'gallery-03'
      | 'gallery-04'
      | 'gallery-05'
      | 'gallery-06'
      | 'gallery-01-questions'
      | 'gallery-03-questions'
  ) => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

const GALLERY_05_MAP_WIDTH = 682.05;
const GALLERY_05_MAP_HEIGHT = 729.06;

export const Gallery05View: React.FC<Gallery05ViewProps> = ({
  onNavigateBack,
  onNavigateToQuestions,
  onNavigateToPuzzleQuestion,
  onNavigateToGallery,
  onSelectTab,
}) => {
  const galleryRecord = contentService.getGalleryById('gallery-05');
  const galleryNumFa = formatTwoDigitPersian(galleryRecord?.galleryNumber || '05');
  const galleryNameFa = galleryRecord?.nameFa?.trim() || 'ضرب آهنگ شهر';

  const [points, setPoints] = useState<AdminMapPoint[]>(() => getGalleryPoints('gallery-05'));
  const [arrows, setArrows] = useState<AdminArrowPoint[]>(() => getGalleryArrows('gallery-05'));
  const [selectedArtwork, setSelectedArtwork] = useState<AdminCollectionPoint | null>(null);
  const [selectedStarPointId, setSelectedStarPointId] = useState<string | null>(null);
  const [activeStarDiscoveryId, setActiveStarDiscoveryId] = useState<string | null>(null);
  const [activePuzzlePoint, setActivePuzzlePoint] = useState<AdminPuzzlePoint | null>(null);
  const [activeGalleryInfoId, setActiveGalleryInfoId] = useState<string | null>(null);
  const [selectedExperiencePointId, setSelectedExperiencePointId] = useState<string | null>(null);
  const [activeExperience, setActiveExperience] = useState<ExperienceContent | null>(null);
  const [puzzleUpdateTrigger, setPuzzleUpdateTrigger] = useState<number>(0);
  const [areLocationPinsVisible, setAreLocationPinsVisible] = useState<boolean>(() => getLocationPinsVisible());
  const [locationAnimKey, setLocationAnimKey] = useState<number>(0);

  // Sync with Admin point changes dynamically
  useEffect(() => {
    const handleUpdate = () => {
      setPoints(getGalleryPoints('gallery-05'));
    };
    window.addEventListener('museum_points_updated', handleUpdate);
    window.addEventListener('museum_puzzle_progress_updated', handleUpdate);
    return () => {
      window.removeEventListener('museum_points_updated', handleUpdate);
      window.removeEventListener('museum_puzzle_progress_updated', handleUpdate);
    };
  }, []);

  // Listen to location pin visibility toggle event
  useEffect(() => {
    const handleVisUpdate = (e: any) => {
      const isVis = typeof e?.detail?.visible === 'boolean' ? e.detail.visible : getLocationPinsVisible();
      setAreLocationPinsVisible(isVis);
      if (isVis) {
        setLocationAnimKey(Date.now());
      }
    };
    window.addEventListener('museum_location_pins_visibility_changed', handleVisUpdate);
    return () => window.removeEventListener('museum_location_pins_visibility_changed', handleVisUpdate);
  }, []);

  // Sync with Admin arrow changes and usage dynamically
  useEffect(() => {
    const handleArrowsUpdate = () => {
      setArrows(getGalleryArrows('gallery-05'));
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

    if (onNavigateToPuzzleQuestion) {
      onNavigateToPuzzleQuestion(puzzlePoint);
    } else {
      setActivePuzzlePoint(puzzlePoint);
    }
  };

  const handleArrowClick = (arrow: AdminArrowPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!arrow.title?.includes('بازگشت') && !arrow.id.includes('-to-g04')) {
      markArrowUsed(arrow.id);
    }
    if (arrow.destination) {
      setCurrentGalleryId(arrow.destination);
      if (onNavigateToGallery) {
        onNavigateToGallery(arrow.destination as any);
      }
    }
  };

  const handleIconPointClick = (iconPoint: AdminIconPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (iconPoint.destination) {
      setActiveGalleryInfoId(iconPoint.destination);
    }
  };

  // Filter and separate point types
  const collectionPoints = points.filter(
    (p): p is AdminCollectionPoint => p.type === 'collection'
  );
  const iconPoints = points.filter((p): p is AdminIconPoint => p.type === 'icon' && p.id !== 'icon-3527');
  const puzzlePoints = points.filter((p): p is AdminPuzzlePoint => p.type === 'puzzle');
  const experiencePoints = React.useMemo(() => getExperiencePointsForGallery('gallery-05'), [puzzleUpdateTrigger]);

  // Fallback preset question icon if no icon points exist
  const effectiveIconPoints: AdminIconPoint[] =
    iconPoints.length > 0
      ? iconPoints
      : [
          {
            id: 'icon-g05-info-fallback',
            type: 'icon',
            galleryId: 'gallery-05',
            title: 'اطلاعات گالری ۰۵',
            x: 215,
            y: 242,
            iconType: 'preset-question',
            width: 48,
            height: 34,
            destination: 'gallery-05',
          },
        ];

  // Filter arrows based on completion condition engine
  const visibleArrows = arrows.filter((arrow) => isArrowVisibleToPlayer(arrow));

  const modalsContent = (
    <>
      {/* Star Discovery Modal */}
      {activeStarDiscoveryId && (
        <StarDiscoveryModal
          starPointId={activeStarDiscoveryId}
          starId={activeStarDiscoveryId}
          galleryId="gallery-05"
          isOpen={Boolean(activeStarDiscoveryId)}
          onClose={() => setActiveStarDiscoveryId(null)}
        />
      )}

      {/* In-view Puzzle Question Modal fallback */}
      {activePuzzlePoint && (
        <PuzzleQuestionModal
          galleryId="gallery_05"
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
      galleryId="gallery-05"
      galleryNumberPersian={galleryNumFa}
      galleryNamePersian={galleryNameFa}
      onNavigateBack={onNavigateBack}
      onSelectTab={onSelectTab}
      onClickOutside={handleClosePopup}
      mapWidth={GALLERY_05_MAP_WIDTH}
      mapHeight={GALLERY_05_MAP_HEIGHT}
      mapSvg={
        <Gallery05MapSvg
          className="w-full h-full object-contain filter drop-shadow-sm pointer-events-auto"
        />
      }
      modals={modalsContent}
    >
      {/* 1. Dynamic Navigation Arrows Layer */}
      {visibleArrows.map((arrow) => {
        const leftPercent = (arrow.x / GALLERY_05_MAP_WIDTH) * 100;
        const topPercent = (arrow.y / GALLERY_05_MAP_HEIGHT) * 100;

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

      {/* 2. Custom Icon Points (Type B) — Gallery guide questions always visible; other location pins gated by areLocationPinsVisible */}
      {effectiveIconPoints
        .filter((iconPoint) => iconPoint.iconType === 'preset-question' || areLocationPinsVisible)
        .map((iconPoint, idx) => {
          const leftPercent = (iconPoint.x / GALLERY_05_MAP_WIDTH) * 100;
          const topPercent = (iconPoint.y / GALLERY_05_MAP_HEIGHT) * 100;
          const isGuideQuestion = iconPoint.iconType === 'preset-question';

          return (
            <div
              key={`${iconPoint.id}-${locationAnimKey}`}
              id={`icon-point-${iconPoint.id}`}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: isGuideQuestion
                  ? 'translate(-50%, -50%) scale(var(--map-point-scale, 1))'
                  : 'translate(-50%, -100%) scale(var(--map-point-scale, 1))',
                transformOrigin: isGuideQuestion ? 'center center' : 'bottom center',
              }}
              className="absolute pointer-events-auto z-20"
            >
              <div
                className={isGuideQuestion ? 'relative' : 'relative animate-quick-grow origin-bottom'}
                style={!isGuideQuestion ? { animationDelay: `${idx * 0.08}s` } : undefined}
              >
                {!isGuideQuestion && (
                  <span
                    className="absolute inset-0 rounded-full border-2 border-[#f59e0b] animate-location-burst-ring pointer-events-none"
                    style={{
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  />
                )}
                <button
                  onClick={(e) => handleIconPointClick(iconPoint, e)}
                  aria-label={`Open ${iconPoint.title}`}
                  className="relative group flex items-center justify-center cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
                >
                  <CustomIconRender point={iconPoint} />
                </button>
              </div>
            </div>
          );
        })}

      {/* 3. Interactive Puzzle Points (Type: Puzzle) */}
      {puzzlePoints.map((puzzlePoint) => (
        <PuzzlePoint
          key={puzzlePoint.id}
          puzzlePoint={puzzlePoint}
          galleryId="gallery-05"
          mapWidth={GALLERY_05_MAP_WIDTH}
          mapHeight={GALLERY_05_MAP_HEIGHT}
          onClick={handlePuzzlePointClick}
          isSelected={activePuzzlePoint?.id === puzzlePoint.id}
        />
      ))}

      {/* Interactive Experience Points (Gallery 05: vintage-camera, mirror-selfie) */}
      {experiencePoints.map((exp) => (
        <ExperiencePoint
          key={exp.id}
          id={exp.id}
          experienceId={exp.experienceId}
          galleryId="gallery_05"
          x={exp.x}
          y={exp.y}
          iconId={exp.iconId}
          label={exp.labelFa}
          title={exp.title}
          mapWidth={GALLERY_05_MAP_WIDTH}
          mapHeight={GALLERY_05_MAP_HEIGHT}
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
              galleryId="gallery-05"
              mapWidth={GALLERY_05_MAP_WIDTH}
              mapHeight={GALLERY_05_MAP_HEIGHT}
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

        const leftPercent = (artwork.x / GALLERY_05_MAP_WIDTH) * 100;
        const topPercent = (artwork.y / GALLERY_05_MAP_HEIGHT) * 100;
        const isSelected = selectedArtwork?.id === artwork.id;
        const isRightSide = artwork.x > GALLERY_05_MAP_WIDTH / 2;

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
