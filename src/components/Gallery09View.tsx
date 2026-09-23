import React, { useState, useEffect, useMemo } from 'react';
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
import { Gallery09MapSvg } from './Gallery09MapSvg';
import { StarDiscoveryModal } from './StarDiscoveryModal';
import { PuzzlePoint } from './PuzzlePoint';
import { PuzzleQuestionModal } from './PuzzleQuestionModal';
import { StarPoint } from './StarPoint';
import {
  isArrowVisibleToPlayer,
  markArrowUsed,
} from '../data/arrowConditionsStore';
import { setCurrentGalleryId } from '../data/playerLocationStore';
import { getLocationPinsVisible } from '../data/locationPinsVisibilityStore';
import { contentService } from '../services/content/contentService';
import { formatTwoDigitPersian, normalizeGalleryId } from '../services/content/mappers';
import { GalleryInfoModal } from './GalleryInfoModal';
import { SharedGalleryPageLayout } from './SharedGalleryPageLayout';
import { usePuzzleBlinkGuidance } from '../hooks/usePuzzleBlinkGuidance';

interface Gallery09ViewProps {
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
      | 'gallery-07'
      | 'gallery-08'
      | 'gallery-09'
      | 'gallery-01-questions'
      | 'gallery-03-questions'
      | string
  ) => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

const GALLERY_09_MAP_WIDTH = 453.09;
const GALLERY_09_MAP_HEIGHT = 846.45;

export const Gallery09View: React.FC<Gallery09ViewProps> = ({
  onNavigateBack,
  onNavigateToQuestions,
  onNavigateToPuzzleQuestion,
  onNavigateToGallery,
  onSelectTab,
}) => {
  const galleryRecord = contentService.getGalleryById('gallery-08') || contentService.getGalleryById('gallery-09');
  const galleryNumFa = formatTwoDigitPersian(galleryRecord?.galleryNumber || '08');
  const galleryNameFa = galleryRecord?.nameFa?.trim() || 'تلاقی رسانه‌ها';

  const [points, setPoints] = useState<AdminMapPoint[]>(() => getGalleryPoints('gallery-09'));
  const [arrows, setArrows] = useState<AdminArrowPoint[]>(() => getGalleryArrows('gallery-09'));
  const [selectedArtwork, setSelectedArtwork] = useState<AdminCollectionPoint | null>(null);
  const [selectedStarPointId, setSelectedStarPointId] = useState<string | null>(null);
  const [activeStarDiscoveryId, setActiveStarDiscoveryId] = useState<string | null>(null);
  const [activePuzzlePoint, setActivePuzzlePoint] = useState<AdminPuzzlePoint | null>(null);
  const [activeGalleryInfoId, setActiveGalleryInfoId] = useState<string | null>(null);
  const [, setPuzzleUpdateTrigger] = useState<number>(0);
  const [areLocationPinsVisible, setAreLocationPinsVisible] = useState<boolean>(() => getLocationPinsVisible());
  const [locationAnimKey, setLocationAnimKey] = useState<number>(0);

  // Sync with Admin point changes dynamically
  useEffect(() => {
    const handleUpdate = () => {
      setPoints(getGalleryPoints('gallery-09'));
    };
    window.addEventListener('museum_points_updated', handleUpdate);
    window.addEventListener('museum_puzzle_progress_updated', handleUpdate);
    window.addEventListener('museum_content_service_updated', handleUpdate);
    return () => {
      window.removeEventListener('museum_points_updated', handleUpdate);
      window.removeEventListener('museum_puzzle_progress_updated', handleUpdate);
      window.removeEventListener('museum_content_service_updated', handleUpdate);
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
      setArrows(getGalleryArrows('gallery-09'));
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
    if (!isArrowVisibleToPlayer(arrow)) {
      return;
    }
    if (!arrow.title?.includes('بازگشت') && !arrow.id.includes('-to-g08')) {
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

  // Dynamic Stars resolution: load all active stars for gallery_08 / gallery_09 from ContentService
  const effectiveCollectionPoints = useMemo(() => {
    const configuredCollectionPoints = points.filter(
      (p): p is AdminCollectionPoint => p.type === 'collection'
    );

    // Query active stars from ContentService
    const allStars = contentService.getStars().filter((s) => s.active !== false);
    const g08Stars = allStars.filter((s) => {
      const gId = normalizeGalleryId(s.galleryId);
      return (
        gId === 'gallery_08' ||
        gId === 'gallery-08' ||
        gId === 'gallery_09' ||
        gId === 'gallery-09'
      );
    });

    const result = [...configuredCollectionPoints];

    // Placeholder positions for dynamic stars not yet manually calibrated in admin config
    const placeholderPositions = [
      { x: 300, y: 360 },
      { x: 480, y: 360 },
      { x: 290, y: 650 },
      { x: 480, y: 650 },
      { x: 400, y: 780 },
      { x: 210, y: 420 },
    ];

    g08Stars.forEach((star, idx) => {
      const starId = star.starId || star.id;
      const alreadyExists = result.some(
        (cp) => cp.id === starId || cp.starId === starId || cp.id === `star-${starId}` || cp.id === `col-g09-0${idx + 1}`
      );

      if (!alreadyExists) {
        const pos = placeholderPositions[idx % placeholderPositions.length];
        result.push({
          id: starId,
          starId: starId,
          type: 'collection',
          pointType: 'star',
          galleryId: 'gallery-09',
          title: star.titleFa || star.labelTextFa || `ستاره کشف ${starId}`,
          x: pos.x,
          y: pos.y,
          frames: [],
        });
      }
    });

    return result;
  }, [points]);

  const iconPoints = points.filter((p): p is AdminIconPoint => p.type === 'icon');
  const puzzlePoints = points.filter((p): p is AdminPuzzlePoint => p.type === 'puzzle');

  const { blinkingPointId, handleBlinkEnd, triggerNextPuzzleBlink } = usePuzzleBlinkGuidance({
    galleryId: 'gallery-09',
    puzzlePoints,
    activePuzzlePoint,
  });

  const effectiveIconPoints: AdminIconPoint[] = iconPoints.filter(
    (p) => p.destination !== 'gallery-09' && p.id !== 'icon-g09-info' && p.id !== 'icon-g09-info-fallback'
  );

  // Filter arrows based on completion condition engine
  const visibleArrows = arrows.filter((arrow) => isArrowVisibleToPlayer(arrow));

  const modalsContent = (
    <>
      {/* Star Discovery Modal */}
      {activeStarDiscoveryId && (
        <StarDiscoveryModal
          starPointId={activeStarDiscoveryId}
          starId={effectiveCollectionPoints.find((cp) => cp.id === activeStarDiscoveryId)?.starId || activeStarDiscoveryId}
          galleryId="gallery-09"
          isOpen={true}
          onClose={() => setActiveStarDiscoveryId(null)}
          onSelectTab={onSelectTab}
        />
      )}

      {/* Puzzle Question Modal */}
      {activePuzzlePoint && (
        <PuzzleQuestionModal
          galleryId="gallery_08"
          puzzlePoint={activePuzzlePoint}
          isOpen={true}
          onClose={() => setActivePuzzlePoint(null)}
        />
      )}

      {/* Gallery Info Modal */}
      {activeGalleryInfoId && (
        <GalleryInfoModal
          galleryId="gallery-09"
          isOpen={true}
          onClose={() => setActiveGalleryInfoId(null)}
        />
      )}
    </>
  );

  return (
    <SharedGalleryPageLayout
      galleryId="gallery-09"
      galleryNumberPersian={galleryNumFa}
      galleryNamePersian={galleryNameFa}
      onNavigateBack={onNavigateBack}
      onSelectTab={onSelectTab}
      onClickOutside={handleClosePopup}
      onOpenGuide={() => setActiveGalleryInfoId('gallery-09')}
      onTriggerNextPuzzle={triggerNextPuzzleBlink}
      mapWidth={GALLERY_09_MAP_WIDTH}
      mapHeight={GALLERY_09_MAP_HEIGHT}
      mapSvg={
        <Gallery09MapSvg
          className="w-full h-full object-contain filter drop-shadow-sm pointer-events-auto"
        />
      }
      modals={modalsContent}
    >
      {/* 1. Dynamic Navigation Arrows Layer */}
      {arrows.map((arrow) => {
        const isEnabled = isArrowVisibleToPlayer(arrow);
        const leftPercent = (arrow.x / GALLERY_09_MAP_WIDTH) * 100;
        const topPercent = (arrow.y / GALLERY_09_MAP_HEIGHT) * 100;

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
            className={`absolute z-30 ${isEnabled ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <NavigationArrowRender
              arrow={arrow}
              isDisabled={!isEnabled}
              isInteractive={isEnabled}
              onClick={isEnabled ? (e) => handleArrowClick(arrow, e) : undefined}
            />
          </div>
        );
      })}

      {/* 2. Custom Icon Points — Gallery guide questions always visible; other location pins gated by areLocationPinsVisible */}
      {effectiveIconPoints
        .filter((iconPoint) => iconPoint.iconType === 'preset-question' || areLocationPinsVisible)
        .map((iconPoint, idx) => {
          const leftPercent = (iconPoint.x / GALLERY_09_MAP_WIDTH) * 100;
          const topPercent = (iconPoint.y / GALLERY_09_MAP_HEIGHT) * 100;
          const isGuideQuestion = iconPoint.iconType === 'preset-question';

          return (
            <div
              key={`${iconPoint.id}-${locationAnimKey}`}
              id={`icon-point-${iconPoint.id}`}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
                transformOrigin: 'center center',
              }}
              className="absolute pointer-events-auto z-20"
            >
              <div
                className={isGuideQuestion ? 'relative' : 'relative animate-quick-grow origin-center'}
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
          galleryId="gallery-09"
          mapWidth={GALLERY_09_MAP_WIDTH}
          mapHeight={GALLERY_09_MAP_HEIGHT}
          scaleFactor={1.2978}
          onClick={handlePuzzlePointClick}
          isSelected={activePuzzlePoint?.id === puzzlePoint.id}
          isBlinking={blinkingPointId === puzzlePoint.id}
          onBlinkEnd={handleBlinkEnd}
        />
      ))}

      {/* 4. Render Collection Points & Star Points */}
      {effectiveCollectionPoints.map((artwork) => {
        if (artwork.pointType === 'star') {
          return (
            <StarPoint
              key={artwork.id}
              id={artwork.id}
              starId={artwork.starId || artwork.id}
              x={artwork.x}
              y={artwork.y}
              title={artwork.title}
              galleryId="gallery-09"
              mapWidth={GALLERY_09_MAP_WIDTH}
              mapHeight={GALLERY_09_MAP_HEIGHT}
              scaleFactor={1.2978}
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

        const leftPercent = (artwork.x / GALLERY_09_MAP_WIDTH) * 100;
        const topPercent = (artwork.y / GALLERY_09_MAP_HEIGHT) * 100;
        const isSelected = selectedArtwork?.id === artwork.id;
        const isRightSide = artwork.x > GALLERY_09_MAP_WIDTH / 2;

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
