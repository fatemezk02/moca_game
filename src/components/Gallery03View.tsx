import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import { AdminMapPoint, AdminCollectionPoint, AdminIconPoint, AdminArrowPoint, AdminPuzzlePoint } from '../types/admin';
import { ConfiguredArtworkReveal } from './ConfiguredArtworkReveal';
import { CustomIconRender } from './CustomIconRender';
import { CollectionPointMarker } from './CollectionPointMarker';
import { NavigationArrowRender } from './NavigationArrowRender';
import { Gallery03MapSvg } from './Gallery03MapSvg';
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
import { getLocationPinsVisible } from '../data/locationPinsVisibilityStore';
import { contentService } from '../services/content/contentService';
import { formatTwoDigitPersian } from '../services/content/mappers';
import { GalleryInfoModal } from './GalleryInfoModal';
import { SharedGalleryPageLayout } from './SharedGalleryPageLayout';

interface Gallery03ViewProps {
  onNavigateBack: () => void;
  onNavigateToQuestions?: () => void;
  onNavigateToPuzzleQuestion?: (puzzlePoint: AdminPuzzlePoint) => void;
  onNavigateToGallery?: (
    galleryId: 'gallery-00' | 'gallery-01' | 'gallery-03' | 'gallery-04' | 'gallery-01-questions' | 'gallery-03-questions'
  ) => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

const GALLERY_03_MAP_WIDTH = 561.28;
const GALLERY_03_MAP_HEIGHT = 851.79;

export const Gallery03View: React.FC<Gallery03ViewProps> = ({
  onNavigateBack,
  onNavigateToQuestions,
  onNavigateToPuzzleQuestion,
  onNavigateToGallery,
  onSelectTab,
}) => {
  const galleryRecord = contentService.getGalleryById('gallery-03');
  const galleryNumFa = formatTwoDigitPersian(galleryRecord?.galleryNumber || '03');
  const galleryNameFa = galleryRecord?.nameFa?.trim() || 'آلبوم‌های دیپلماتیک';

  const [points, setPoints] = useState<AdminMapPoint[]>(() => getGalleryPoints('gallery-03'));
  const [arrows, setArrows] = useState<AdminArrowPoint[]>(() => getGalleryArrows('gallery-03'));
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
      setPoints(getGalleryPoints('gallery-03'));
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
      setArrows(getGalleryArrows('gallery-03'));
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

  const handleArrowClick = (arrow: AdminArrowPoint, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!arrow.destination || arrow.destination === 'none') {
      return;
    }

    // Mark arrow as used so it disappears from source map (except return arrows)
    if (!arrow.title?.includes('بازگشت') && !arrow.id.includes('-to-g02') && !arrow.id.includes('-to-g01')) {
      markArrowUsed(arrow.id);
    }

    if (arrow.destination === 'gallery-00') {
      onNavigateBack();
    } else if (
      arrow.destination === 'gallery-01' ||
      arrow.destination === 'gallery-02' ||
      arrow.destination === 'gallery_01' ||
      arrow.destination === 'gallery_02'
    ) {
      setCurrentGalleryId('gallery-01');
      onNavigateToGallery?.('gallery-01');
    } else if (arrow.destination === 'gallery-03') {
      // Stay on Gallery 03
      return;
    } else if (arrow.destination === 'gallery-04') {
      setCurrentGalleryId('gallery-04');
      onNavigateToGallery?.('gallery-04');
    } else if (arrow.destination === 'gallery-03-questions') {
      onNavigateToQuestions?.();
    } else if (arrow.destination === 'gallery-01-questions') {
      onNavigateToGallery?.('gallery-01-questions');
    } else if (
      arrow.destination === 'collection' ||
      arrow.destination === 'tasks' ||
      arrow.destination === 'curator'
    ) {
      onSelectTab?.(arrow.destination);
    }
  };

  const handleIconPointClick = (iconPoint: AdminIconPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (iconPoint.destination === 'gallery-00') {
      onNavigateBack();
      return;
    }
    if (iconPoint.destination === 'gallery-01') {
      setCurrentGalleryId('gallery-01');
      onNavigateToGallery?.('gallery-01');
      return;
    }
    if (iconPoint.destination === 'gallery-04') {
      setCurrentGalleryId('gallery-04');
      onNavigateToGallery?.('gallery-04');
      return;
    }
    if (
      iconPoint.destination === 'collection' ||
      iconPoint.destination === 'tasks' ||
      iconPoint.destination === 'curator'
    ) {
      onSelectTab?.(iconPoint.destination);
      return;
    }
    // Requirement 1 & 11: Central icon on gallery map opens Gallery Information Modal
    const targetGalleryId = iconPoint.galleryId || 'gallery-03';
    setActiveGalleryInfoId(targetGalleryId);
  };

  const handlePuzzlePointClick = (puzzlePoint: AdminPuzzlePoint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (puzzlePoint.isActive !== false) {
      setActivePuzzlePoint(puzzlePoint);
    }
  };

  const collectionPoints = points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const iconPoints = points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const puzzlePoints = points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const experiencePoints = React.useMemo(() => getExperiencePointsForGallery('gallery-03'), [puzzleUpdateTrigger]);

  // Ensure central question entry point is always present at ~center (x: 281, y: 426)
  const effectiveIconPoints = iconPoints.some(
    (p) => p.destination === 'gallery-03-questions' || p.id === 'icon-g03-questions'
  )
    ? iconPoints
    : [
        ...iconPoints,
        {
          id: 'icon-g03-questions',
          type: 'icon' as const,
          galleryId: 'gallery-03',
          title: 'Gallery 03 Questions & Quiz',
          x: 240,
          y: 374,
          iconType: 'preset-question' as const,
          width: 48,
          height: 34,
          destination: 'gallery-03-questions' as const,
        },
      ];

  const modalsContent = (
    <>
      {/* Dedicated Star Point "Discover More" Modal */}
      {activeStarDiscoveryId && (
        <StarQuestionPopup
          starPointId={activeStarDiscoveryId}
          starId={collectionPoints.find((cp) => cp.id === activeStarDiscoveryId)?.starId || activeStarDiscoveryId}
          galleryId="gallery_03"
          isOpen={!!activeStarDiscoveryId}
          onClose={() => setActiveStarDiscoveryId(null)}
        />
      )}

      {/* Shared Puzzle Question Modal */}
      {activePuzzlePoint && (
        <PuzzleQuestionModal
          galleryId="gallery_03"
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
      galleryId="gallery-03"
      galleryNumberPersian={galleryNumFa}
      galleryNamePersian={galleryNameFa}
      onNavigateBack={onNavigateBack}
      onSelectTab={onSelectTab}
      onClickOutside={handleClosePopup}
      mapWidth={GALLERY_03_MAP_WIDTH}
      mapHeight={GALLERY_03_MAP_HEIGHT}
      mapSvg={
        <Gallery03MapSvg
          className="w-full h-full object-contain filter drop-shadow-sm pointer-events-auto"
        />
      }
      modals={modalsContent}
    >
            {/* Dynamic Navigation Arrows Layer */}
            {arrows.filter(isArrowVisibleToPlayer).map((arrow) => {
              const leftPercent = (arrow.x / GALLERY_03_MAP_WIDTH) * 100;
              const topPercent = (arrow.y / GALLERY_03_MAP_HEIGHT) * 100;

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

            {/* Custom Icon Points (Type B) — Gallery guide questions always visible; other location pins gated by areLocationPinsVisible */}
            {effectiveIconPoints
              .filter((iconPoint) => iconPoint.iconType === 'preset-question' || areLocationPinsVisible)
              .map((iconPoint, idx) => {
                const leftPercent = (iconPoint.x / GALLERY_03_MAP_WIDTH) * 100;
                const topPercent = (iconPoint.y / GALLERY_03_MAP_HEIGHT) * 100;
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

            {/* Interactive Puzzle Points (Type: Puzzle) */}
            {puzzlePoints.map((puzzlePoint) => (
              <PuzzlePoint
                key={puzzlePoint.id}
                puzzlePoint={puzzlePoint}
                galleryId="gallery-03"
                mapWidth={GALLERY_03_MAP_WIDTH}
                mapHeight={GALLERY_03_MAP_HEIGHT}
                onClick={handlePuzzlePointClick}
                isSelected={activePuzzlePoint?.id === puzzlePoint.id}
              />
            ))}

            {/* Interactive Experience Points (Gallery 03: frame, shadow-silhouette) */}
            {experiencePoints.map((exp) => (
              <ExperiencePoint
                key={exp.id}
                id={exp.id}
                experienceId={exp.experienceId}
                galleryId="gallery_03"
                x={exp.x}
                y={exp.y}
                iconId={exp.iconId}
                label={exp.labelFa}
                title={exp.title}
                mapWidth={GALLERY_03_MAP_WIDTH}
                mapHeight={GALLERY_03_MAP_HEIGHT}
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

            {/* Interactive Collection Points and Standardized Star Points */}
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
                    galleryId="gallery_03"
                    mapWidth={GALLERY_03_MAP_WIDTH}
                    mapHeight={GALLERY_03_MAP_HEIGHT}
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

              const leftPercent = (artwork.x / GALLERY_03_MAP_WIDTH) * 100;
              const topPercent = (artwork.y / GALLERY_03_MAP_HEIGHT) * 100;
              const isSelected = selectedArtwork?.id === artwork.id;
              const isRightSide = artwork.x > GALLERY_03_MAP_WIDTH / 2;

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

                  {/* Direct Artwork Frames Reveal with configured frames and reveal animation */}
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
