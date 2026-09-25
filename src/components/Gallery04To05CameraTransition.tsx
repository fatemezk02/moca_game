import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import {
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
} from '../types/admin';
import { Gallery05MapSvg } from './Gallery05MapSvg';
import { Gallery06MapSvg } from './Gallery06MapSvg';
import { StarPoint } from './StarPoint';
import { ExperiencePoint } from './ExperiencePoint';
import { PuzzlePoint } from './PuzzlePoint';
import { NavigationArrowRender } from './NavigationArrowRender';
import { CustomIconRender } from './CustomIconRender';
import { ProfileAvatar } from './ProfileAvatar';
import { PlayerStatusBar } from './PlayerStatusBar';
import { BottomNavBar } from './BottomNavBar';
import { getUserProfile, UserProfile } from '../data/userProfileStore';
import { isArrowVisibleToPlayer } from '../data/arrowConditionsStore';
import { getLocationPinsVisible } from '../data/locationPinsVisibilityStore';
import { getExperiencePointsForGallery } from '../data/experiencePointsConfig';
import { usePlayerStats } from '../hooks/usePlayerStats';

interface Gallery04To05CameraTransitionProps {
  direction?: 'forward' | 'reverse'; // forward: Gallery 04 -> Gallery 05, reverse: Gallery 05 -> Gallery 04
  onComplete: () => void;
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

// Canonical Map SVG Dimensions matching original SVG viewBoxes
// Gallery 04 map SVG (Gallery05MapSvg): viewBox="0 0 682.05 729.06"
const G04_MAP_WIDTH = 682.05;
const G04_MAP_HEIGHT = 729.06;

// Gallery 05 map SVG (Gallery06MapSvg): viewBox="0 0 486.92 793.01"
const G05_MAP_WIDTH = 486.92;
const G05_MAP_HEIGHT = 793.01;

// Exact Architectural Corridor Geometry derived from visible SVG paths:
// - Gallery 04 outgoing corridor (bottom, South):
//   Corridor rect x="408.65" y="647.41" width="92.42" height="80.93"
//   Corridor width = 92.42
//   Corridor center X = 408.65 + 92.42 / 2 = 454.86
//   Corridor connection Y = 729.06
const G04_CORRIDOR_WIDTH = 92.42;
const G04_CORRIDOR_CENTER_X = 454.86;
const G04_CORRIDOR_ANCHOR_Y = 729.06;

// - Gallery 05 incoming corridor (top, North):
//   Corridor rect x="285.99" width="105.43" height="95.05"
//   Corridor width = 105.43
//   Corridor center X = 285.99 + 105.43 / 2 = 338.705
//   Corridor connection Y = 0.0
const G05_CORRIDOR_WIDTH = 105.43;
const G05_CORRIDOR_CENTER_X = 338.705;
const G05_CORRIDOR_ANCHOR_Y = 0.0;

// Mathematically derived temporary scale to match corridor openings:
// G05_SCALE = G04_CORRIDOR_WIDTH / G05_CORRIDOR_WIDTH = 92.42 / 105.43 ≈ 0.8765996
const G05_SCALE = G04_CORRIDOR_WIDTH / G05_CORRIDOR_WIDTH;

// Shared World-Space Positioning for Gallery 05 relative to Gallery 04 at (0, 0):
// - Horizontally: G05 corridor center aligns with G04 corridor center (X = 454.86)
//   G05_WORLD_X + G05_CORRIDOR_CENTER_X * G05_SCALE = G04_CORRIDOR_CENTER_X
const G05_WORLD_X = G04_CORRIDOR_CENTER_X - G05_CORRIDOR_CENTER_X * G05_SCALE; // ~157.952
// - Vertically: G05 top corridor meets G04 bottom corridor with zero gap
const G05_WORLD_Y = G04_CORRIDOR_ANCHOR_Y - G05_CORRIDOR_ANCHOR_Y * G05_SCALE; // 729.06

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
 * Camera-Travel Transition between Gallery 04 and Gallery 05.
 * - Single continuous virtual world containing Gallery 04 and Gallery 05.
 * - Real SVG corridor geometry ensures the two corridor openings match with zero gap.
 * - Gallery 05 stays at constant world scale G05_SCALE throughout.
 * - Camera moves and zooms in smoothly, landing at native destination framing.
 */
export const Gallery04To05CameraTransition: React.FC<Gallery04To05CameraTransitionProps> = ({
  direction = 'forward',
  onComplete,
  onNavigateBack,
  onSelectTab,
}) => {
  const isReverse = direction === 'reverse';
  const containerRef = useRef<HTMLElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => getUserProfile());
  const playerStats = usePlayerStats();

  // Synchronously compute initial estimated dimensions to prevent any first-frame flash/jump
  const [g04Dim, setG04Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G04_MAP_WIDTH, G04_MAP_HEIGHT)
  );
  const [g05Dim, setG05Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G05_MAP_WIDTH, G05_MAP_HEIGHT)
  );

  // Measure the single shared viewport container for BOTH Gallery 04 and Gallery 05
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

    const s4 = Math.min(availWidth / G04_MAP_WIDTH, availHeight / G04_MAP_HEIGHT);
    const s5 = Math.min(availWidth / G05_MAP_WIDTH, availHeight / G05_MAP_HEIGHT);

    const fW4 = Math.floor(G04_MAP_WIDTH * s4 * 10) / 10;
    const fH4 = Math.floor(G04_MAP_HEIGHT * s4 * 10) / 10;
    const fW5 = Math.floor(G05_MAP_WIDTH * s5 * 10) / 10;
    const fH5 = Math.floor(G05_MAP_HEIGHT * s5 * 10) / 10;

    setG04Dim((prev) => {
      if (
        prev &&
        Math.abs(prev.width - fW4) < 0.5 &&
        Math.abs(prev.height - fH4) < 0.5 &&
        Math.abs(prev.scale - s4) < 0.001
      ) {
        return prev;
      }
      return { width: fW4, height: fH4, scale: s4 };
    });

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

  // Sync profile
  useEffect(() => {
    const handleProfileUpdate = () => setProfile(getUserProfile());
    window.addEventListener('museum_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('museum_user_profile_updated', handleProfileUpdate);
  }, []);

  // Gallery 04 Data (gallery-05 in database)
  const g04Points = getGalleryPoints('gallery-05');
  const g04Arrows = getGalleryArrows('gallery-05');
  const g04ColPoints = g04Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g04IconPoints = g04Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g04PuzzlePoints = g04Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g04ExpPoints = getExperiencePointsForGallery('gallery-05');

  // Gallery 05 Data (gallery-06 in database)
  const g05Points = getGalleryPoints('gallery-06');
  const g05Arrows = getGalleryArrows('gallery-06');
  const g05ColPoints = g05Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g05IconPoints = g05Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g05PuzzlePoints = g05Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g05ExpPoints = getExperiencePointsForGallery('gallery-06');

  const areLocationPinsVisible = getLocationPinsVisible();

  // Scale factors for Gallery 04 & 05 in normal view
  const s4 = g04Dim?.scale || 1;
  const s5 = g05Dim?.scale || 1;

  // Focal Centers in Shared World-Space:
  // - Gallery 04 center in world-space: (682.05 / 2, 729.06 / 2) = (341.025, 364.53)
  const g04CenterWorldX = G04_MAP_WIDTH / 2;
  const g04CenterWorldY = G04_MAP_HEIGHT / 2;

  // - Gallery 05 center in world-space:
  const g05CenterWorldX = G05_WORLD_X + (G05_MAP_WIDTH * G05_SCALE) / 2;
  const g05CenterWorldY = G05_WORLD_Y + (G05_MAP_HEIGHT * G05_SCALE) / 2;

  const camScale4 = s4;
  const camScale5 = s5 / G05_SCALE;

  // Start & End Camera Positions
  const startCamX = isReverse ? g05CenterWorldX : g04CenterWorldX;
  const startCamY = isReverse ? g05CenterWorldY : g04CenterWorldY;
  const startCamScale = isReverse ? camScale5 : camScale4;

  const endCamX = isReverse ? g04CenterWorldX : g05CenterWorldX;
  const endCamY = isReverse ? g04CenterWorldY : g05CenterWorldY;
  const endCamScale = isReverse ? camScale4 : camScale5;

  // Animation Trigger
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    const DURATION = 850; // 0.85 seconds transition

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

  // Map Opacities
  const g04Opacity = isReverse
    ? Math.min(1, animationProgress * 1.5)
    : Math.max(0, 1 - animationProgress * 1.2);

  const g05Opacity = isReverse
    ? Math.max(0, 1 - animationProgress * 1.2)
    : Math.min(1, animationProgress * 1.5);

  // Header Title Cross-Fade at transition midpoint (400ms)
  const [headerTitle, setHeaderTitle] = useState(() =>
    isReverse ? 'گالری ۰۵' : 'گالری ۰۴'
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeaderTitle(isReverse ? 'گالری ۰۴' : 'گالری ۰۵');
    }, 400);
    return () => clearTimeout(timer);
  }, [isReverse]);

  return (
    <div
      id="g04-to-g05-transition-root"
      className="user-facing-app h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom select-none pointer-events-none"
    >
      {/* Top App Bar Header - Pixel-perfect match with SharedGalleryPageLayout */}
      <header
        id="transition-top-bar"
        dir="ltr"
        className="bg-[#ffffff] border-b-[1.25px] border-[#1e1b18] shadow-[0px_2px_0px_#1e1b18] flex flex-col w-full z-40 relative select-none pt-safe shrink-0 pointer-events-auto"
      >
        <div className="h-[5px] w-full bg-[#f59e0b] border-b border-[#1e1b18]" />
        <div className="flex justify-between items-center px-3.5 sm:px-6 h-[56px] sm:h-[60px]">
          {/* Back Button */}
          <button
            onClick={onNavigateBack}
            aria-label="بازگشت به نقشه اصلی"
            title="بازگشت به نقشه اصلی"
            className="border-2 border-[#1e1b18] rounded-xl bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] p-2 shadow-[1.5px_1.5px_0px_#1e1b18] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none inline-flex items-center justify-center cursor-pointer transition-all duration-150"
          >
            <ArrowLeft className="w-5 h-5 text-[#1e1b18]" />
          </button>

          {/* Center Title */}
          <div className="flex items-center justify-center h-full relative px-2 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={headerTitle}
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center text-center max-w-[220px] sm:max-w-xs"
              >
                <h1 className="font-sans-custom font-bold text-[#1e1b18] tracking-tight truncate text-[18px] sm:text-[20px]">
                  {headerTitle}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Profile Avatar */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('museum_open_profile'))}
            aria-label="پروفایل کاربری"
            title="پروفایل کاربری"
            className="active:scale-95 transition-all duration-150 rounded-full cursor-pointer inline-flex items-center justify-center shrink-0"
          >
            <ProfileAvatar avatarId={profile?.avatarId} size="md" className="scale-[1.04]" />
          </button>
        </div>
      </header>

      {/* Compact Player Status Bar */}
      <PlayerStatusBar puzzles={playerStats.completedPuzzles} stars={playerStats.stars} coins={playerStats.coins} />

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
          {/* ==================== GALLERY 04 MAP ==================== */}
          <div
            data-transition-layer="g04"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${G04_MAP_WIDTH}px`,
              height: `${G04_MAP_HEIGHT}px`,
              opacity: g04Opacity,
              ['--map-point-scale' as any]: (G04_MAP_WIDTH / 360).toFixed(4),
            }}
            className="relative flex items-center justify-center shrink-0 select-none overflow-visible pointer-events-none"
          >
            <Gallery05MapSvg className="w-full h-full object-contain pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none">
              {/* G04 Navigation Arrows */}
              {g04Arrows.map((arrow) => {
                const isEnabled = isArrowVisibleToPlayer(arrow);
                const leftPercent = (arrow.x / G04_MAP_WIDTH) * 100;
                const topPercent = (arrow.y / G04_MAP_HEIGHT) * 100;
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

              {/* G04 Icon Points */}
              {g04IconPoints
                .filter((ip) => ip.iconType === 'preset-question' || areLocationPinsVisible)
                .map((iconPoint) => {
                  const leftPercent = (iconPoint.x / G04_MAP_WIDTH) * 100;
                  const topPercent = (iconPoint.y / G04_MAP_HEIGHT) * 100;
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

              {/* G04 Star Points */}
              {g04ColPoints
                .filter((cp) => (cp as any).pointType === 'star')
                .map((artwork) => (
                  <StarPoint
                    key={artwork.id}
                    id={artwork.id}
                    starId={artwork.starId || artwork.id}
                    x={artwork.x}
                    y={artwork.y}
                    title={artwork.title}
                    galleryId="gallery-05"
                    mapWidth={G04_MAP_WIDTH}
                    mapHeight={G04_MAP_HEIGHT}
                    onOpenDiscoveryModal={() => {}}
                  />
                ))}

              {/* G04 Experience Points */}
              {g04ExpPoints.map((exp) => (
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
                  mapWidth={G04_MAP_WIDTH}
                  mapHeight={G04_MAP_HEIGHT}
                  onOpenModal={() => {}}
                />
              ))}

              {/* G04 Puzzle Points */}
              {g04PuzzlePoints.map((puzzlePoint) => (
                <PuzzlePoint
                  key={puzzlePoint.id}
                  puzzlePoint={puzzlePoint}
                  galleryId="gallery-05"
                  mapWidth={G04_MAP_WIDTH}
                  mapHeight={G04_MAP_HEIGHT}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>

          {/* ==================== GALLERY 05 MAP ==================== */}
          <div
            data-transition-layer="g05"
            style={{
              position: 'absolute',
              left: `${G05_WORLD_X}px`,
              top: `${G05_WORLD_Y}px`,
              width: `${G05_MAP_WIDTH * G05_SCALE}px`,
              height: `${G05_MAP_HEIGHT * G05_SCALE}px`,
              opacity: g05Opacity,
              ['--map-point-scale' as any]: ((G05_MAP_WIDTH * G05_SCALE) / 360).toFixed(4),
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
                    galleryId="gallery_06"
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
        </div>
      </main>

      {/* Persistent Bottom Nav Bar */}
      <footer id="transition-bottom-nav" className="shrink-0 z-40 relative pointer-events-auto">
        <BottomNavBar activeTab="map" onSelectTab={onSelectTab} />
      </footer>
    </div>
  );
};
