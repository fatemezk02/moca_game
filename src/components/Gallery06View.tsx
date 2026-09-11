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
import { Gallery06MapSvg } from './Gallery06MapSvg';
import { StarDiscoveryModal } from './StarDiscoveryModal';
import { PuzzlePoint } from './PuzzlePoint';
import { PuzzleQuestionModal } from './PuzzleQuestionModal';
import { StarQuestionPopup } from './StarQuestionPopup';
import { StarPoint } from './StarPoint';
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

interface Gallery06ViewProps {
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

export const Gallery06View: React.FC<Gallery06ViewProps> = ({
  onNavigateBack,
  onNavigateToQuestions,
  onNavigateToPuzzleQuestion,
  onNavigateToGallery,
  onSelectTab,
}) => {
  const galleryRecord = contentService.getGalleryById('gallery-06');
  const galleryNumFa = formatTwoDigitPersian(galleryRecord?.galleryNumber || '06');
  const galleryNameFa = galleryRecord?.nameFa?.trim() || 'در کشاکش تماشا و استیلا';

  const [points, setPoints] = useState<AdminMapPoint[]>(() => getGalleryPoints('gallery-06'));
  const [arrows, setArrows] = useState<AdminArrowPoint[]>(() => getGalleryArrows('gallery-06'));
  const [selectedArtwork, setSelectedArtwork] = useState<AdminCollectionPoint | null>(null);
  const [selectedStarPointId, setSelectedStarPointId] = useState<string | null>(null);
  const [activeStarDiscoveryId, setActiveStarDiscoveryId] = useState<string | null>(null);
  const [activePuzzlePoint, setActivePuzzlePoint] = useState<AdminPuzzlePoint | null>(null);
  const [activeGalleryInfoId, setActiveGalleryInfoId] = useState<string | null>(null);
  const [puzzleUpdateTrigger, setPuzzleUpdateTrigger] = useState<number>(0);

  // Sync with Admin point changes dynamically
  useEffect(() => {
    const handleUpdate = () => {
      setPoints(getGalleryPoints('gallery-06'));
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
      setArrows(getGalleryArrows('gallery-06'));
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
    markArrowUsed(arrow.id);
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
  const iconPoints = points.filter((p): p is AdminIconPoint => p.type === 'icon');
  const puzzlePoints = points.filter((p): p is AdminPuzzlePoint => p.type === 'puzzle');

  // Fallback preset question icon if no icon points exist
  const effectiveIconPoints: AdminIconPoint[] =
    iconPoints.length > 0
      ? iconPoints
      : [
          {
            id: 'icon-g06-info-fallback',
            type: 'icon',
            galleryId: 'gallery-06',
            title: 'اطلاعات گالری ۰۶',
            x: 381,
            y: 574,
            iconType: 'preset-question',
            width: 48,
            height: 34,
            destination: 'gallery-06',
          },
        ];

  // Filter arrows based on completion condition engine
  const visibleArrows = arrows.filter((arrow) => isArrowVisibleToPlayer(arrow));

  // Determine active star question point
  const selectedStarArtwork = selectedStarPointId
    ? collectionPoints.find((cp) => cp.id === selectedStarPointId)
    : null;

  const modalsContent = (
    <>
      {/* Star Discovery Modal */}
      {activeStarDiscoveryId && (
        <StarDiscoveryModal
          starPointId={activeStarDiscoveryId}
          starId={collectionPoints.find((cp) => cp.id === activeStarDiscoveryId)?.starId || activeStarDiscoveryId}
          galleryId="gallery_06"
          isOpen={true}
          onClose={() => setActiveStarDiscoveryId(null)}
          onSelectTab={onSelectTab}
        />
      )}

      {/* Puzzle Question Modal (if opened directly in view without global handler) */}
      {activePuzzlePoint && (
        <PuzzleQuestionModal
          galleryId="gallery_06"
          puzzlePoint={activePuzzlePoint}
          isOpen={true}
          onClose={() => setActivePuzzlePoint(null)}
        />
      )}

      {/* Gallery Info Modal */}
      {activeGalleryInfoId && (
        <GalleryInfoModal
          galleryId="gallery-06"
          isOpen={true}
          onClose={() => setActiveGalleryInfoId(null)}
        />
      )}
    </>
  );

  return (
    <SharedGalleryPageLayout
      galleryId="gallery-06"
      galleryNumberPersian={galleryNumFa}
      galleryNamePersian={galleryNameFa}
      onNavigateBack={onNavigateBack}
      onSelectTab={onSelectTab}
      onClickOutside={handleClosePopup}
      mapWidth={763}
      mapHeight={1147}
      mapSvg={
        <Gallery06MapSvg
          style={{ transform: 'translate(-2%, -2%)' }}
          className="w-full h-full object-contain filter drop-shadow-sm pointer-events-auto"
        />
      }
      modals={modalsContent}
    >
      {/* 1. Dynamic Navigation Arrows Layer */}
      {visibleArrows.map((arrow) => {
        const leftPercent = (arrow.x / 763) * 100;
        const topPercent = (arrow.y / 1147) * 100;

        return (
          <div
            key={arrow.id}
            id={`arrow-${arrow.id}`}
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: 'translate(-50%, -50%)',
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

      {/* 2. Custom Icon Points (Type B) */}
      {effectiveIconPoints.map((iconPoint) => {
        const leftPercent = (iconPoint.x / 763) * 100;
        const topPercent = (iconPoint.y / 1147) * 100;

        return (
          <div
            key={iconPoint.id}
            id={`icon-point-${iconPoint.id}`}
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20"
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
          galleryId="gallery-06"
          mapWidth={763}
          mapHeight={1147}
          onClick={handlePuzzlePointClick}
          isSelected={activePuzzlePoint?.id === puzzlePoint.id}
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
              galleryId="gallery_06"
              mapWidth={763}
              mapHeight={1147}
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

        const leftPercent = (artwork.x / 763) * 100;
        const topPercent = (artwork.y / 1147) * 100;
        const isSelected = selectedArtwork?.id === artwork.id;
        const isRightSide = artwork.x > 381;

        return (
          <div
            key={artwork.id}
            id={`artwork-point-${artwork.id}`}
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-30"
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
