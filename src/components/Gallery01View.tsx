import React, { useState, useEffect } from 'react';
import { ArrowLeft, Compass, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNavBar } from './BottomNavBar';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import {
  AdminMapPoint,
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
  AdminArrowPoint,
} from '../types/admin';
import { ConfiguredArtworkReveal } from './ConfiguredArtworkReveal';
import { CustomIconRender } from './CustomIconRender';
import { CollectionPointMarker } from './CollectionPointMarker';
import { PuzzlePointMarker } from './PuzzlePointMarker';
import { NavigationArrowRender } from './NavigationArrowRender';
import { PlayerStatusBar } from './PlayerStatusBar';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFitMapDimensions } from '../hooks/useFitMapDimensions';
import { Gallery01MapSvg } from './Gallery01MapSvg';
import { isPuzzlePieceCollected } from '../data/puzzleProgressStore';
import { StarDiscoveryModal } from './StarDiscoveryModal';
import { PuzzleQuestionModal } from './PuzzleQuestionModal';
import { PuzzlePoint } from './PuzzlePoint';
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

interface Gallery01ViewProps {
  onNavigateBack: () => void;
  onNavigateToQuestions?: () => void;
  onNavigateToPuzzleQuestion?: (puzzlePoint: AdminPuzzlePoint) => void;
  onNavigateToGallery?: (galleryId: 'gallery-00' | 'gallery-01' | 'gallery-03' | 'gallery-01-questions' | 'gallery-03-questions') => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

export const Gallery01View: React.FC<Gallery01ViewProps> = ({
  onNavigateBack,
  onNavigateToQuestions,
  onNavigateToPuzzleQuestion,
  onNavigateToGallery,
  onSelectTab,
}) => {
  const playerStats = usePlayerStats();
  const { containerRef, dimensions } = useFitMapDimensions(848, 1264, 1.4);
  const galleryRecord = contentService.getGalleryById('gallery_02');
  const galleryNumFa = formatTwoDigitPersian(galleryRecord?.galleryNumber || '02');
  const galleryNameFa = galleryRecord?.nameFa?.trim() || '';

  // Current Gallery ID for this page is gallery_02
  useEffect(() => {
    setCurrentGalleryId('gallery_02');
  }, []);

  const [points, setPoints] = useState<AdminMapPoint[]>(() => getGalleryPoints('gallery-01'));
  const [arrows, setArrows] = useState<AdminArrowPoint[]>(() => getGalleryArrows('gallery-01'));
  const [selectedArtwork, setSelectedArtwork] = useState<AdminCollectionPoint | null>(null);
  const [selectedStarPointId, setSelectedStarPointId] = useState<string | null>(null);
  const [activeStarDiscoveryId, setActiveStarDiscoveryId] = useState<string | null>(null);
  const [activePuzzlePoint, setActivePuzzlePoint] = useState<AdminPuzzlePoint | null>(null);
  const [activeGalleryInfoId, setActiveGalleryInfoId] = useState<string | null>(null);
  const [puzzleUpdateTrigger, setPuzzleUpdateTrigger] = useState<number>(0);

  // Sync with Admin point changes dynamically
  useEffect(() => {
    const handleUpdate = () => {
      setPoints(getGalleryPoints('gallery-01'));
    };
    window.addEventListener('museum_points_updated', handleUpdate);
    return () => window.removeEventListener('museum_points_updated', handleUpdate);
  }, []);

  // Sync with Admin arrow changes and usage dynamically
  useEffect(() => {
    const handleArrowsUpdate = () => {
      setArrows(getGalleryArrows('gallery-01'));
    };
    window.addEventListener('museum_arrows_updated', handleArrowsUpdate);
    window.addEventListener('museum_used_arrows_updated', handleArrowsUpdate);
    window.addEventListener('museum_player_progress_updated', handleArrowsUpdate);
    window.addEventListener('museum_answered_questions_updated', handleArrowsUpdate);

    return () => {
      window.removeEventListener('museum_arrows_updated', handleArrowsUpdate);
      window.removeEventListener('museum_used_arrows_updated', handleArrowsUpdate);
      window.removeEventListener('museum_player_progress_updated', handleArrowsUpdate);
      window.removeEventListener('museum_answered_questions_updated', handleArrowsUpdate);
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

  const handleArrowClick = (arrow: AdminArrowPoint, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!arrow.destination || arrow.destination === 'none') {
      return;
    }

    // Mark arrow as used so it disappears from source map
    markArrowUsed(arrow.id);

    if (arrow.destination === 'gallery-00') {
      onNavigateBack();
    } else if (arrow.destination === 'gallery-01') {
      // Stay on Gallery 01
      return;
    } else if (arrow.destination === 'gallery-03') {
      setCurrentGalleryId('gallery-03');
      onNavigateToGallery?.('gallery-03');
    } else if (arrow.destination === 'gallery-01-questions') {
      onNavigateToQuestions?.();
    } else if (arrow.destination === 'gallery-03-questions') {
      onNavigateToGallery?.('gallery-03-questions');
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
    } else if (iconPoint.destination === 'collection' || iconPoint.destination === 'tasks' || iconPoint.destination === 'curator') {
      onSelectTab?.(iconPoint.destination);
    } else {
      // Requirement 1 & 11: Central icon on gallery map opens Gallery Information Modal
      const targetGalleryId = iconPoint.galleryId || 'gallery_02';
      setActiveGalleryInfoId(targetGalleryId);
    }
  };

  const collectionPoints = points.filter(
    (p) => p.type === 'collection' && p.id !== 'artwork-02' && p.id !== 'artwork-03' && p.id !== 'artwork-04'
  ) as AdminCollectionPoint[];
  const iconPoints = points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const puzzlePoints = points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];

  const handlePuzzlePointClick = (puzzlePoint: AdminPuzzlePoint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (puzzlePoint.isActive !== false) {
      setActivePuzzlePoint(puzzlePoint);
    }
  };

  const effectiveIconPoints = iconPoints.some((p) => p.destination === 'gallery-01-questions')
    ? iconPoints
    : [
        ...iconPoints,
        {
          id: 'icon-g01-questions',
          type: 'icon' as const,
          galleryId: 'gallery-01',
          title: 'Gallery 01 Questions & Quiz',
          x: 424,
          y: 675,
          iconType: 'preset-question' as const,
          width: 48,
          height: 34,
          destination: 'gallery-01-questions' as const,
        },
      ];

  return (
    <div
      id="gallery-01-view-root"
      className="user-facing-app h-screen w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom select-none"
      onClick={handleClosePopup}
    >
      {/* Top App Bar Header */}
      <header
        id="gallery-01-top-bar"
        dir="ltr"
        className="bg-gradient-to-b from-[#fdfcfb] to-[#f7f4ee] border-b border-[#e2dcd2] shadow-xs flex justify-between items-center px-4 sm:px-6 py-3 z-40 relative select-none shrink-0"
      >
        {/* Left Action (Back Arrow to Gallery 00) */}
        <button
          id="gallery-01-back-btn"
          onClick={onNavigateBack}
          aria-label="بازگشت به گالری ۰۰"
          title="بازگشت به گالری ۰۰"
          className="text-[#0e0f0f] p-2 hover:bg-[#0e0f0f] hover:text-[#fbf9f9] transition-colors border border-[#0e0f0f] active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Title */}
        <div className="flex items-center gap-2">
          <h1 className="font-sans-custom text-[18px] sm:text-[20px] font-bold text-[#1c1917] tracking-tight">
            گالری {galleryNumFa}
          </h1>
          <span className="font-mono-custom text-[9px] px-2 py-0.5 bg-[#fef9c3] text-[#854d0e] border border-[#fde68a] tracking-wider rounded-md font-bold">
            {galleryNameFa}
          </span>
        </div>

        {/* Right Spacer to keep center alignment */}
        <div className="w-9 h-9" aria-hidden="true" />
      </header>

      {/* Compact Player Status Bar */}
      <PlayerStatusBar stars={playerStats.stars} coins={playerStats.coins} />

      {/* Main Floor Plan Canvas - Available Viewport between Header and Bottom Nav */}
      <main
        ref={containerRef}
        id="gallery-01-canvas-area"
        className="flex-1 min-h-0 relative overflow-hidden flex items-center justify-center p-3 sm:p-5 mb-16 sm:mb-[68px]"
      >
        <div
          style={{
            ...(dimensions
              ? { width: `${dimensions.width}px`, height: `${dimensions.height}px` }
              : { width: '100%', height: '100%' }),
            aspectRatio: '848 / 1264',
          }}
          className="relative mx-auto flex items-center justify-center shrink-0 select-none overflow-visible"
        >
          {/* Base SVG Architectural Plan */}
          <Gallery01MapSvg className="w-full h-full object-contain filter drop-shadow-sm pointer-events-auto" />

          {/* Map Overlay for Interactive Points (Coordinates relative to 848 x 1264 SVG map) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Dynamic Navigation Arrows Layer */}
            {arrows.filter(isArrowVisibleToPlayer).map((arrow) => {
              const leftPercent = (arrow.x / 848) * 100;
              const topPercent = (arrow.y / 1264) * 100;

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

            {/* Custom Icon Points (Type B) — without default dot/marker */}
            {effectiveIconPoints.map((iconPoint) => {
              const leftPercent = (iconPoint.x / 848) * 100;
              const topPercent = (iconPoint.y / 1264) * 100;

              return (
                <div
                  key={iconPoint.id}
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

            {/* Interactive Puzzle Points (Type: Puzzle) */}
            {puzzlePoints.map((puzzlePoint) => (
              <PuzzlePoint
                key={puzzlePoint.id}
                puzzlePoint={puzzlePoint}
                galleryId="gallery_02"
                onClick={handlePuzzlePointClick}
                isSelected={activePuzzlePoint?.id === puzzlePoint.id}
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
                    galleryId="gallery-01"
                    mapWidth={848}
                    mapHeight={1264}
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

              const leftPercent = (artwork.x / 848) * 100;
              const topPercent = (artwork.y / 1264) * 100;
              const isSelected = selectedArtwork?.id === artwork.id;
              const isRightSide = artwork.x > 424;

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
          </div>
        </div>
      </main>

      {/* Bottom Right Floating Circular Toggle Button to return to Gallery 00 */}
      <div
        id="gallery-01-floating-controls"
        className="absolute bottom-20 right-4 sm:right-6 z-30 flex items-center justify-center select-none"
      >
        <button
          id="btn-gallery-01-toggle-map"
          onClick={onNavigateBack}
          aria-label="بازگشت به نقشه اصلی (گالری ۰۰)"
          title="بازگشت به نقشه اصلی (گالری ۰۰)"
          className="w-12 h-12 rounded-full border border-[#0e0f0f] bg-[#fbf9f9] text-[#0e0f0f] hover:bg-[#0e0f0f] hover:text-[#fbf9f9] active:scale-95 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none"
        >
          <Map className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Navigation Bar - Matching Gallery 00 exactly */}
      <BottomNavBar
        activeTab="map"
        onTabChange={(tab) => {
          if (tab === 'map') {
            onNavigateBack();
          } else {
            onSelectTab?.(tab);
            onNavigateBack();
          }
        }}
        collectionCount={8}
      />

      {/* Dedicated Star Point "Discover More" Modal */}
      {activeStarDiscoveryId && (
        <StarQuestionPopup
          starPointId={activeStarDiscoveryId}
          galleryId="gallery-01"
          isOpen={!!activeStarDiscoveryId}
          onClose={() => setActiveStarDiscoveryId(null)}
        />
      )}

      {/* Shared Puzzle Question Modal */}
      {activePuzzlePoint && (
        <PuzzleQuestionModal
          galleryId="gallery_02"
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
    </div>
  );
};
