import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import {
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
} from '../types/admin';
import { Gallery07MapSvg } from './Gallery07MapSvg';
import { Gallery08MapSvg } from './Gallery08MapSvg';
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

interface Gallery06To07CameraTransitionProps {
  direction?: 'forward' | 'reverse'; // forward: Gallery 06 -> Gallery 07, reverse: Gallery 07 -> Gallery 06
  onComplete: () => void;
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

// Canonical Map SVG Dimensions matching original SVG viewBoxes
// Source: Gallery 06 map SVG (Gallery07MapSvg): viewBox="0 0 544.58 650"
const G06_MAP_WIDTH = 544.58;
const G06_MAP_HEIGHT = 650;

// Destination: Gallery 07 map SVG (Gallery08MapSvg): viewBox="0 0 501.5 642.18"
const G07_MAP_WIDTH = 501.5;
const G07_MAP_HEIGHT = 642.18;

// Exact Manually Established Values from Visual Transition Editor
const G06_ANCHOR_X = 227.28;
const G06_ANCHOR_Y = 638.50;

const G07_ANCHOR_X = 445.16;
const G07_ANCHOR_Y = 34.65;

// Fixed Shared World Transform for Gallery 07 (CONSTANT throughout entire transition)
const G07_WORLD_X = -218.78;
const G07_WORLD_Y = 328.51;
const G07_WORLD_SCALE = 1.18;

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
 * Cinematic Camera-Travel Transition between Gallery 06 and Gallery 07.
 *
 * Architecture:
 * - Single temporary shared world coordinate system containing both maps.
 * - Gallery 06 is placed at world origin (0, 0).
 * - Gallery 07's upper-right corridor aligns with Gallery 06's lower corridor in world-space.
 * - Initial overlap scale matches corridor widths; then smoothly zooms out to normal scale.
 * - Animate ONLY the virtual camera viewport (cx, cy, scale) from Gallery 06 focal center
 *   to Gallery 07 focal center.
 * - At the final frame, the camera view matches normal Gallery 07 page view to the subpixel,
 *   guaranteeing ZERO snap, jump, or flicker upon completion.
 */
export const Gallery06To07CameraTransition: React.FC<Gallery06To07CameraTransitionProps> = ({
  direction = 'forward',
  onComplete,
  onNavigateBack,
  onSelectTab,
}) => {
  const isReverse = direction === 'reverse';
  const containerRef = useRef<HTMLElement>(null);
  const [, setProfile] = useState<UserProfile | null>(() => getUserProfile());
  const playerStats = usePlayerStats();

  const [g06Dim, setG06Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G06_MAP_WIDTH, G06_MAP_HEIGHT)
  );
  const [g07Dim, setG07Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G07_MAP_WIDTH, G07_MAP_HEIGHT)
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

    const s6 = Math.min(availWidth / G06_MAP_WIDTH, availHeight / G06_MAP_HEIGHT);
    const s7 = Math.min(availWidth / G07_MAP_WIDTH, availHeight / G07_MAP_HEIGHT);

    const fW6 = Math.floor(G06_MAP_WIDTH * s6 * 10) / 10;
    const fH6 = Math.floor(G06_MAP_HEIGHT * s6 * 10) / 10;
    const fW7 = Math.floor(G07_MAP_WIDTH * s7 * 10) / 10;
    const fH7 = Math.floor(G07_MAP_HEIGHT * s7 * 10) / 10;

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

    setG07Dim((prev) => {
      if (
        prev &&
        Math.abs(prev.width - fW7) < 0.5 &&
        Math.abs(prev.height - fH7) < 0.5 &&
        Math.abs(prev.scale - s7) < 0.001
      ) {
        return prev;
      }
      return { width: fW7, height: fH7, scale: s7 };
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

  // Gallery 06 Data (config key 'gallery-07')
  const g06Points = getGalleryPoints('gallery-07');
  const g06Arrows = getGalleryArrows('gallery-07');
  const g06ColPoints = g06Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g06IconPoints = g06Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g06PuzzlePoints = g06Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g06ExpPoints = getExperiencePointsForGallery('gallery-07');

  // Gallery 07 Data (config key 'gallery-08')
  const g07Points = getGalleryPoints('gallery-08');
  const g07Arrows = getGalleryArrows('gallery-08');
  const g07ColPoints = g07Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g07IconPoints = g07Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g07PuzzlePoints = g07Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g07ExpPoints = getExperiencePointsForGallery('gallery-08');

  const areLocationPinsVisible = getLocationPinsVisible();

  // Scale factors for Gallery 06 & 07 in normal view
  const s6 = g06Dim?.scale || 1;
  const s7 = g07Dim?.scale || 1;

  // Animation Progress state (0 -> 1)
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

  // Fixed Focal Centers in Shared World-Space:
  // - Gallery 06 center in world space: (544.58 / 2, 650 / 2) = (272.29, 325.0)
  // - Gallery 07 center in world space: (-218.78 + (501.5 * 1.18) / 2, 328.51 + (642.18 * 1.18) / 2) = (77.105, 707.396)
  const g06CenterWorldX = G06_MAP_WIDTH / 2; // 272.29
  const g06CenterWorldY = G06_MAP_HEIGHT / 2; // 325.0

  const g07CenterWorldX = G07_WORLD_X + (G07_MAP_WIDTH * G07_WORLD_SCALE) / 2; // 77.105
  const g07CenterWorldY = G07_WORLD_Y + (G07_MAP_HEIGHT * G07_WORLD_SCALE) / 2; // 707.396

  // Camera scale factors for matching standalone map views
  const camScaleG06 = s6;
  const camScaleG07 = s7 / G07_WORLD_SCALE;

  // Start & End Camera Positions
  const startCamX = isReverse ? g07CenterWorldX : g06CenterWorldX;
  const startCamY = isReverse ? g07CenterWorldY : g06CenterWorldY;
  const startCamScale = isReverse ? camScaleG07 : camScaleG06;

  const endCamX = isReverse ? g06CenterWorldX : g07CenterWorldX;
  const endCamY = isReverse ? g06CenterWorldY : g07CenterWorldY;
  const endCamScale = isReverse ? camScaleG06 : camScaleG07;

  // Interpolated Camera State
  const currentCamX = startCamX + (endCamX - startCamX) * animationProgress;
  const currentCamY = startCamY + (endCamY - startCamY) * animationProgress;
  const currentCamScale = startCamScale + (endCamScale - startCamScale) * animationProgress;

  // Map Opacities
  const g06Opacity = isReverse
    ? Math.min(1, animationProgress * 1.5)
    : Math.max(0, 1 - animationProgress * 1.2);

  const g07Opacity = isReverse
    ? Math.max(0, 1 - animationProgress * 1.2)
    : Math.min(1, animationProgress * 1.5);

  return (
    <div
      id="gallery-06-to-07-transition-root"
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
              {animationProgress > 0.5 ? 'آونگ زمان' : 'گذر از برون به درون'}
            </span>
            <span className="text-[10px] sm:text-xs text-[#8c827a] font-mono-custom tracking-tight">
              {animationProgress > 0.5 ? 'گالری ۰۷' : 'گالری ۰۶'}
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
          {/* ==================== GALLERY 06 MAP ==================== */}
          <div
            data-transition-layer="g06"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${G06_MAP_WIDTH}px`,
              height: `${G06_MAP_HEIGHT}px`,
              opacity: g06Opacity,
              ['--map-point-scale' as any]: (G06_MAP_WIDTH / 360).toFixed(4),
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

          {/* ==================== GALLERY 07 MAP ==================== */}
          <div
            data-transition-layer="g07"
            style={{
              position: 'absolute',
              left: `${G07_WORLD_X}px`,
              top: `${G07_WORLD_Y}px`,
              width: `${G07_MAP_WIDTH * G07_WORLD_SCALE}px`,
              height: `${G07_MAP_HEIGHT * G07_WORLD_SCALE}px`,
              opacity: g07Opacity,
              ['--map-point-scale' as any]: ((G07_MAP_WIDTH * G07_WORLD_SCALE) / 360).toFixed(4),
            }}
            className="relative flex items-center justify-center shrink-0 select-none overflow-visible pointer-events-none"
          >
            <Gallery08MapSvg className="w-full h-full object-contain pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none">
              {/* G07 Navigation Arrows */}
              {g07Arrows.map((arrow) => {
                const isEnabled = isArrowVisibleToPlayer(arrow);
                const leftPercent = (arrow.x / G07_MAP_WIDTH) * 100;
                const topPercent = (arrow.y / G07_MAP_HEIGHT) * 100;
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

              {/* G07 Icon Points */}
              {g07IconPoints
                .filter((ip) => ip.iconType === 'preset-question' || areLocationPinsVisible)
                .map((iconPoint) => {
                  const leftPercent = (iconPoint.x / G07_MAP_WIDTH) * 100;
                  const topPercent = (iconPoint.y / G07_MAP_HEIGHT) * 100;
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

              {/* G07 Star Points */}
              {g07ColPoints
                .filter((cp) => (cp as any).pointType === 'star')
                .map((artwork) => (
                  <StarPoint
                    key={artwork.id}
                    id={artwork.id}
                    starId={artwork.starId || artwork.id}
                    x={artwork.x}
                    y={artwork.y}
                    title={artwork.title}
                    galleryId="gallery-08"
                    mapWidth={G07_MAP_WIDTH}
                    mapHeight={G07_MAP_HEIGHT}
                    onOpenDiscoveryModal={() => {}}
                  />
                ))}

              {/* G07 Experience Points */}
              {g07ExpPoints.map((exp) => (
                <ExperiencePoint
                  key={exp.id}
                  id={exp.id}
                  experienceId={exp.experienceId}
                  galleryId="gallery_08"
                  x={exp.x}
                  y={exp.y}
                  iconId={exp.iconId}
                  label={exp.labelFa}
                  title={exp.title}
                  mapWidth={G07_MAP_WIDTH}
                  mapHeight={G07_MAP_HEIGHT}
                  onOpenModal={() => {}}
                />
              ))}

              {/* G07 Puzzle Points */}
              {g07PuzzlePoints.map((puzzlePoint) => (
                <PuzzlePoint
                  key={puzzlePoint.id}
                  puzzlePoint={puzzlePoint}
                  galleryId="gallery-08"
                  mapWidth={G07_MAP_WIDTH}
                  mapHeight={G07_MAP_HEIGHT}
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
