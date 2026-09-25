import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import {
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
} from '../types/admin';
import { Gallery06MapSvg } from './Gallery06MapSvg';
import { Gallery07MapSvg } from './Gallery07MapSvg';
import { StarPoint } from './StarPoint';
import { ExperiencePoint } from './ExperiencePoint';
import { PuzzlePoint } from './PuzzlePoint';
import { NavigationArrowRender } from './NavigationArrowRender';
import { CustomIconRender } from './CustomIconRender';
import { PlayerStatusBar } from './PlayerStatusBar';
import { BottomNavBar } from './BottomNavBar';
import { getUserProfile, UserProfile } from '../data/userProfileStore';
import { isArrowVisibleToPlayer } from '../data/arrowConditionsStore';
import { getLocationPinsVisible } from '../data/locationPinsVisibilityStore';
import { getExperiencePointsForGallery } from '../data/experiencePointsConfig';
import { usePlayerStats } from '../hooks/usePlayerStats';

interface Gallery05To06CameraTransitionProps {
  direction?: 'forward' | 'reverse'; // forward: Gallery 05 -> Gallery 06, reverse: Gallery 06 -> Gallery 05
  onComplete: () => void;
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

// Canonical Map SVG Dimensions matching original SVG viewBoxes
// Gallery 05 map SVG (Gallery06MapSvg): viewBox="0 0 486.92 793.01"
const G05_MAP_WIDTH = 486.92;
const G05_MAP_HEIGHT = 793.01;

// Gallery 06 map SVG (Gallery07MapSvg): viewBox="0 0 544.58 650"
const G06_MAP_WIDTH = 544.58;
const G06_MAP_HEIGHT = 650;

// Exact Architectural Connection Anchors derived from visible SVG geometry:
// - Gallery 05 has a BLACK, TALL, SOLID vertical wall on its left side at X = 173.0
// - Gallery 06's RIGHT vertical side/wall is at X = 373.28
const G05_ANCHOR_X = 173.0;
const G06_ANCHOR_X = 373.28;

// Scale and Vertical Reference for Gallery 06 relative to Gallery 05:
const G06_SCALE = 0.97;
const G06_WORLD_Y = 91; // Upper geometry vertical alignment reference

// Shared World Coordinates for Gallery 06 relative to Gallery 05 at origin (0, 0):
// - Horizontally: G06 right wall (X = 373.28 * 0.97 = 362.0816) touches G05 black wall (X = 173.0) with zero gap
const G06_WORLD_X = G05_ANCHOR_X - G06_ANCHOR_X * G06_SCALE; // -189.0816

interface MapDimensions {
  width: number;
  height: number;
  scale: number;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

function getInitialEstimatedDimensions(mapWidth: number, mapHeight: number): MapDimensions | null {
  if (typeof window === 'undefined') return null;
  const availWidth = Math.max(0, window.innerWidth - 16);
  const availHeight = Math.max(0, window.innerHeight - 196);
  if (availWidth <= 0 || availHeight <= 0) return null;
  const scale = Math.min(availWidth / mapWidth, availHeight / mapHeight);
  const fittedWidth = Math.floor(mapWidth * scale * 10) / 10;
  const fittedHeight = Math.floor(mapHeight * scale * 10) / 10;
  return { width: fittedWidth, height: fittedHeight, scale };
}

/**
 * Cinematic Camera-Travel Transition between Gallery 05 and Gallery 06 from scratch.
 *
 * Architecture:
 * - Single temporary shared world coordinate system containing both maps.
 * - Gallery 05 is placed at world origin (0, 0).
 * - Gallery 06 is placed at (-200.28, 163.09) so its RIGHT vertical side/wall (X = 373.28)
 *   physically touches Gallery 05's BLACK TALL vertical wall (X = 173.0) with zero gap / zero overlap.
 * - Animate ONLY the virtual camera viewport (cx, cy, scale) from Gallery 05 focal center
 *   to Gallery 06 focal center.
 * - At the final frame, the camera view matches normal Gallery 06 page view to the subpixel,
 *   guaranteeing ZERO snap, jump, or flicker upon completion.
 */
export const Gallery05To06CameraTransition: React.FC<Gallery05To06CameraTransitionProps> = ({
  direction = 'forward',
  onComplete,
  onNavigateBack,
  onSelectTab,
}) => {
  const isReverse = direction === 'reverse';
  const containerRef = useRef<HTMLElement>(null);
  const [, setProfile] = useState<UserProfile | null>(() => getUserProfile());
  const playerStats = usePlayerStats();

  const [g05Dim, setG05Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G05_MAP_WIDTH, G05_MAP_HEIGHT)
  );
  const [g06Dim, setG06Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G06_MAP_WIDTH, G06_MAP_HEIGHT)
  );

  const calculateFitting = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);

    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;

    const availWidth = Math.max(0, rect.width - paddingLeft - paddingRight);
    const availHeight = Math.max(0, rect.height - paddingTop - paddingBottom);

    if (availWidth <= 0 || availHeight <= 0) return;

    const s5 = Math.min(availWidth / G05_MAP_WIDTH, availHeight / G05_MAP_HEIGHT);
    const s6 = Math.min(availWidth / G06_MAP_WIDTH, availHeight / G06_MAP_HEIGHT);

    const fW5 = Math.floor(G05_MAP_WIDTH * s5 * 10) / 10;
    const fH5 = Math.floor(G05_MAP_HEIGHT * s5 * 10) / 10;
    const fW6 = Math.floor(G06_MAP_WIDTH * s6 * 10) / 10;
    const fH6 = Math.floor(G06_MAP_HEIGHT * s6 * 10) / 10;

    setG05Dim((prev) => {
      if (
        prev &&
        Math.abs(prev.width - fW5) < 0.5 &&
        Math.abs(prev.height - fH5) < 0.5 &&
        Math.abs(prev.scale - s5) < 0.001
      ) {
        return prev;
      }
      return { width: fW5, height: fH5, scale: s5 };
    });

    setG06Dim((prev) => {
      if (
        prev &&
        Math.abs(prev.width - fW6) < 0.5 &&
        Math.abs(prev.height - fH6) < 0.5 &&
        Math.abs(prev.scale - s6) < 0.001
      ) {
        return prev;
      }
      return { width: fW6, height: fH6, scale: s6 };
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    calculateFitting();
  }, [calculateFitting]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    calculateFitting();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        calculateFitting();
      });
      resizeObserver.observe(el);
    }

    window.addEventListener('resize', calculateFitting);
    window.addEventListener('orientationchange', calculateFitting);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', calculateFitting);
      window.removeEventListener('orientationchange', calculateFitting);
    };
  }, [calculateFitting]);

  useEffect(() => {
    const handleProfileUpdate = () => setProfile(getUserProfile());
    window.addEventListener('museum_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('museum_user_profile_updated', handleProfileUpdate);
  }, []);

  // Gallery 05 Data (config key 'gallery-06')
  const g05Points = getGalleryPoints('gallery-06');
  const g05Arrows = getGalleryArrows('gallery-06');
  const g05ColPoints = g05Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g05IconPoints = g05Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g05PuzzlePoints = g05Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g05ExpPoints = getExperiencePointsForGallery('gallery-06');

  // Gallery 06 Data (config key 'gallery-07')
  const g06Points = getGalleryPoints('gallery-07');
  const g06Arrows = getGalleryArrows('gallery-07');
  const g06ColPoints = g06Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g06IconPoints = g06Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g06PuzzlePoints = g06Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g06ExpPoints = getExperiencePointsForGallery('gallery-07');

  const areLocationPinsVisible = getLocationPinsVisible();

  // Scale factors for Gallery 05 & 06 in normal view
  const s5 = g05Dim?.scale || 1;
  const s6 = g06Dim?.scale || 1;

  // Focal Centers in Shared World-Space:
  // - Gallery 05 center in world-space: (486.92 / 2, 793.01 / 2) = (243.46, 396.505)
  // - Gallery 06 center in world-space: (G06_WORLD_X + G06_MAP_WIDTH * G06_SCALE / 2, G06_WORLD_Y + G06_MAP_HEIGHT * G06_SCALE / 2)
  const g05CenterWorldX = G05_MAP_WIDTH / 2; // 243.46
  const g05CenterWorldY = G05_MAP_HEIGHT / 2; // 396.505

  const g06CenterWorldX = G06_WORLD_X + (G06_MAP_WIDTH * G06_SCALE) / 2;
  const g06CenterWorldY = G06_WORLD_Y + (G06_MAP_HEIGHT * G06_SCALE) / 2;

  const camScale6 = s6 / G06_SCALE;

  // Start & End Camera Positions
  const startCamX = isReverse ? g06CenterWorldX : g05CenterWorldX;
  const startCamY = isReverse ? g06CenterWorldY : g05CenterWorldY;
  const startCamScale = isReverse ? camScale6 : s5;

  const endCamX = isReverse ? g05CenterWorldX : g06CenterWorldX;
  const endCamY = isReverse ? g05CenterWorldY : g06CenterWorldY;
  const endCamScale = isReverse ? s5 : camScale6;

  // Animation Trigger
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    const DURATION = 850; // 0.85 seconds transition (matches earlier reference transitions)

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / DURATION);

      // Smooth cubic-bezier ease-out curve with soft final settling
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimationProgress(eased);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [onComplete]);

  // Interpolated Camera State
  const currentCamX = startCamX + (endCamX - startCamX) * animationProgress;
  const currentCamY = startCamY + (endCamY - startCamY) * animationProgress;
  const currentCamScale = startCamScale + (endCamScale - startCamScale) * animationProgress;

  // Opacities for fading maps smoothly during travel
  // Forward: G05 (1 -> 0), G06 (0 -> 1)
  // Reverse: G06 (1 -> 0), G05 (0 -> 1)
  const g05Opacity = isReverse
    ? Math.min(1, animationProgress * 1.5)
    : Math.max(0, 1 - animationProgress * 1.2);

  const g06Opacity = isReverse
    ? Math.max(0, 1 - animationProgress * 1.2)
    : Math.min(1, animationProgress * 1.5);

  return (
    <div
      id="gallery-05-to-06-transition-root"
      className="user-facing-app h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom select-none"
    >
      {/* Top App Bar Header with Alternating Title */}
      <header
        dir="ltr"
        className="bg-[#ffffff] border-b-[1.25px] border-[#1e1b18] shadow-[0px_2px_0px_#1e1b18] flex flex-col w-full z-40 relative select-none pt-safe shrink-0"
      >
        <div className="h-[5px] w-full bg-[#f59e0b] border-b border-[#1e1b18]" />

        <div className="flex justify-between items-center px-3.5 sm:px-6 h-[56px] sm:h-[60px]">
          {/* Back Button */}
          <button
            onClick={onNavigateBack}
            aria-label="بازگشت به نقشه اصلی"
            className="w-10 h-10 rounded-xl border-[1.5px] border-[#1e1b18] bg-[#fbf9f9] text-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] flex items-center justify-center cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150 hover:bg-[#f3ede8]"
          >
            <ArrowLeft className="w-5 h-5 text-[#1e1b18]" />
          </button>

          {/* Dynamic Header Title */}
          <div className="flex flex-col items-center justify-center flex-1 mx-2 text-center overflow-hidden">
            <span className="font-bold text-sm sm:text-base text-[#1e1b18] truncate">
              {animationProgress > 0.5 ? 'گذر از برون به درون' : 'در کشاکش تماشا و استیلا'}
            </span>
            <span className="text-[10px] sm:text-xs text-[#8c827a] font-mono-custom tracking-tight">
              {animationProgress > 0.5 ? 'گالری ۰۶' : 'گالری ۰۵'}
            </span>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* Player Status Bar */}
      <PlayerStatusBar
        puzzles={playerStats.completedPuzzles}
        stars={playerStats.stars}
        coins={playerStats.coins}
      />

      {/* Main Viewport Container — Shared World Canvas */}
      <main
        ref={containerRef as any}
        data-transition-layer="main-viewport"
        className="flex-1 min-h-0 relative overflow-hidden bg-[#fbf9f9] flex items-center justify-center p-2 sm:p-2.5 mb-[calc(64px+env(safe-area-inset-bottom,0px))] sm:mb-[calc(68px+env(safe-area-inset-bottom,0px))]"
      >
        {/* The Camera Container moving smoothly in Shared World-Space */}
        <div
          data-transition-layer="camera-stage"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 0,
            height: 0,
            transform: `scale(${currentCamScale}) translate3d(${-currentCamX}px, ${-currentCamY}px, 0)`,
            willChange: 'transform',
          }}
          className="overflow-visible pointer-events-none"
        >
          {/* ==================== GALLERY 05 MAP ==================== */}
          <div
            data-transition-layer="g05"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${G05_MAP_WIDTH}px`,
              height: `${G05_MAP_HEIGHT}px`,
              opacity: g05Opacity,
              ['--map-point-scale' as any]: (G05_MAP_WIDTH / 360).toFixed(4),
            }}
            className="relative flex items-center justify-center shrink-0 select-none overflow-visible pointer-events-none"
          >
            <Gallery06MapSvg className="w-full h-full object-contain pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none">
              {/* G05 Navigation Arrows */}
              {g05Arrows.map((arrow) => {
                const isEnabled = isArrowVisibleToPlayer(arrow);
                const leftPercent = (arrow.x / G05_MAP_WIDTH) * 100;
                const topPercent = (arrow.y / G05_MAP_HEIGHT) * 100;
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
                    className="absolute z-30 pointer-events-none"
                  >
                    <NavigationArrowRender arrow={arrow} isDisabled={!isEnabled} isInteractive={false} />
                  </div>
                );
              })}

              {/* G05 Icon Points */}
              {g05IconPoints
                .filter((ip) => ip.iconType === 'preset-question' || areLocationPinsVisible)
                .map((iconPoint) => {
                  const leftPercent = (iconPoint.x / G05_MAP_WIDTH) * 100;
                  const topPercent = (iconPoint.y / G05_MAP_HEIGHT) * 100;
                  const isGuideQuestion = iconPoint.iconType === 'preset-question';
                  return (
                    <div
                      key={iconPoint.id}
                      id={`icon-point-${iconPoint.id}`}
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        transform: isGuideQuestion
                          ? 'translate(-50%, -50%) scale(calc(var(--map-point-scale, 1) * 1.13))'
                          : 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
                        transformOrigin: 'center center',
                      }}
                      className="absolute z-20 pointer-events-none"
                    >
                      <CustomIconRender point={iconPoint} />
                    </div>
                  );
                })}

              {/* G05 Star Points */}
              {g05ColPoints
                .filter((cp) => (cp as any).pointType === 'star')
                .map((artwork) => (
                  <StarPoint
                    key={artwork.id}
                    id={artwork.id}
                    starId={artwork.starId || artwork.id}
                    x={artwork.x}
                    y={artwork.y}
                    title={artwork.title}
                    galleryId="gallery-06"
                    mapWidth={G05_MAP_WIDTH}
                    mapHeight={G05_MAP_HEIGHT}
                    scaleFactor={1.11}
                    onOpenDiscoveryModal={() => {}}
                  />
                ))}

              {/* G05 Experience Points */}
              {g05ExpPoints.map((exp) => (
                <ExperiencePoint
                  key={exp.id}
                  id={exp.id}
                  experienceId={exp.experienceId}
                  galleryId="gallery_06"
                  x={exp.x}
                  y={exp.y}
                  iconId={exp.iconId}
                  label={exp.labelFa}
                  title={exp.title}
                  mapWidth={G05_MAP_WIDTH}
                  mapHeight={G05_MAP_HEIGHT}
                  onOpenModal={() => {}}
                />
              ))}

              {/* G05 Puzzle Points */}
              {g05PuzzlePoints.map((puzzlePoint) => (
                <PuzzlePoint
                  key={puzzlePoint.id}
                  puzzlePoint={puzzlePoint}
                  galleryId="gallery-06"
                  mapWidth={G05_MAP_WIDTH}
                  mapHeight={G05_MAP_HEIGHT}
                  scaleFactor={1.11}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>

          {/* ==================== GALLERY 06 MAP ==================== */}
          <div
            data-transition-layer="g06"
            style={{
              position: 'absolute',
              left: `${G06_WORLD_X}px`,
              top: `${G06_WORLD_Y}px`,
              width: `${G06_MAP_WIDTH * G06_SCALE}px`,
              height: `${G06_MAP_HEIGHT * G06_SCALE}px`,
              opacity: g06Opacity,
              ['--map-point-scale' as any]: ((G06_MAP_WIDTH * G06_SCALE) / 360).toFixed(4),
            }}
            className="relative flex items-center justify-center shrink-0 select-none overflow-visible pointer-events-none"
          >
            <Gallery07MapSvg className="w-full h-full object-contain pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none">
              {/* G06 Navigation Arrows */}
              {g06Arrows.map((arrow) => {
                const isEnabled = isArrowVisibleToPlayer(arrow);
                const leftPercent = (arrow.x / G06_MAP_WIDTH) * 100;
                const topPercent = (arrow.y / G06_MAP_HEIGHT) * 100;
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
                    className="absolute z-30 pointer-events-none"
                  >
                    <NavigationArrowRender arrow={arrow} isDisabled={!isEnabled} isInteractive={false} />
                  </div>
                );
              })}

              {/* G06 Icon Points */}
              {g06IconPoints
                .filter((ip) => ip.iconType === 'preset-question' || areLocationPinsVisible)
                .map((iconPoint) => {
                  const leftPercent = (iconPoint.x / G06_MAP_WIDTH) * 100;
                  const topPercent = (iconPoint.y / G06_MAP_HEIGHT) * 100;
                  const isGuideQuestion = iconPoint.iconType === 'preset-question';
                  return (
                    <div
                      key={iconPoint.id}
                      id={`icon-point-${iconPoint.id}`}
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        transform: isGuideQuestion
                          ? 'translate(-50%, -50%) scale(calc(var(--map-point-scale, 1) * 1.13))'
                          : 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
                        transformOrigin: 'center center',
                      }}
                      className="absolute z-20 pointer-events-none"
                    >
                      <CustomIconRender point={iconPoint} />
                    </div>
                  );
                })}

              {/* G06 Star Points */}
              {g06ColPoints
                .filter((cp) => (cp as any).pointType === 'star')
                .map((artwork) => (
                  <StarPoint
                    key={artwork.id}
                    id={artwork.id}
                    starId={artwork.starId || artwork.id}
                    x={artwork.x}
                    y={artwork.y}
                    title={artwork.title}
                    galleryId="gallery-07"
                    mapWidth={G06_MAP_WIDTH}
                    mapHeight={G06_MAP_HEIGHT}
                    scaleFactor={1.11}
                    onOpenDiscoveryModal={() => {}}
                  />
                ))}

              {/* G06 Experience Points */}
              {g06ExpPoints.map((exp) => (
                <ExperiencePoint
                  key={exp.id}
                  id={exp.id}
                  experienceId={exp.experienceId}
                  galleryId="gallery_07"
                  x={exp.x}
                  y={exp.y}
                  iconId={exp.iconId}
                  label={exp.labelFa}
                  title={exp.title}
                  mapWidth={G06_MAP_WIDTH}
                  mapHeight={G06_MAP_HEIGHT}
                  onOpenModal={() => {}}
                />
              ))}

              {/* G06 Puzzle Points */}
              {g06PuzzlePoints.map((puzzlePoint) => (
                <PuzzlePoint
                  key={puzzlePoint.id}
                  puzzlePoint={puzzlePoint}
                  galleryId="gallery-07"
                  mapWidth={G06_MAP_WIDTH}
                  mapHeight={G06_MAP_HEIGHT}
                  scaleFactor={1.11}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Circular Map Toggle Button */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-30 pointer-events-auto">
        <button
          onClick={onNavigateBack}
          aria-label="بازگشت به نقشه اصلی"
          className="w-13 h-13 rounded-2xl border-[2.5px] border-[#1e1b18] bg-[#f59e0b] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150 hover:bg-[#d97706]"
        >
          <span className="text-sm font-bold">نقشه</span>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="map" onSelectTab={onSelectTab} />
    </div>
  );
};
