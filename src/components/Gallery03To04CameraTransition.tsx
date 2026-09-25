import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Map } from 'lucide-react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import {
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
} from '../types/admin';
import { Gallery04MapSvg } from './Gallery04MapSvg';
import { Gallery05MapSvg } from './Gallery05MapSvg';
import { StarPoint } from './StarPoint';
import { ExperiencePoint } from './ExperiencePoint';
import { PuzzlePoint } from './PuzzlePoint';
import { NavigationArrowRender } from './NavigationArrowRender';
import { CustomIconRender } from './CustomIconRender';
import { ProfileAvatar } from './ProfileAvatar';
import { PlayerStatusBar } from './PlayerStatusBar';
import { BottomNavBar } from './BottomNavBar';
import { GalleryFloatingActions } from './GalleryFloatingActions';
import { getUserProfile, UserProfile } from '../data/userProfileStore';
import { isArrowVisibleToPlayer } from '../data/arrowConditionsStore';
import { getLocationPinsVisible } from '../data/locationPinsVisibilityStore';
import { getExperiencePointsForGallery } from '../data/experiencePointsConfig';
import { usePlayerStats } from '../hooks/usePlayerStats';

interface Gallery03To04CameraTransitionProps {
  direction?: 'forward' | 'reverse'; // forward: Gallery 03 -> Gallery 04, reverse: Gallery 04 -> Gallery 03
  onComplete: () => void;
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

// Canonical Map Dimensions matching SharedGalleryPageLayout & SVGs
const G03_MAP_WIDTH = 498.55;
const G03_MAP_HEIGHT = 851.79;
const G04_MAP_WIDTH = 682.05;
const G04_MAP_HEIGHT = 729.06;

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
 * High-performance Camera-Travel Transition between Gallery 03 and Gallery 04.
 * - Constant map scale throughout the entire camera movement (no size jumps).
 * - Fixed world-space attachment for Experience Points (each stays on its own gallery).
 * - Pixel-perfect layout synchronization with SharedGalleryPageLayout.
 * - Arrow alignment ensures the two corridor portals face each other directly.
 * - Smooth camera travel and easing with soft departing map cleanup.
 */
export const Gallery03To04CameraTransition: React.FC<Gallery03To04CameraTransitionProps> = ({
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
  const [g03Dim, setG03Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G03_MAP_WIDTH, G03_MAP_HEIGHT)
  );
  const [g04Dim, setG04Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G04_MAP_WIDTH, G04_MAP_HEIGHT)
  );

  // Measure the single shared viewport container for BOTH Gallery 03 and Gallery 04
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

    const s3 = Math.min(availWidth / G03_MAP_WIDTH, availHeight / G03_MAP_HEIGHT);
    const s4 = Math.min(availWidth / G04_MAP_WIDTH, availHeight / G04_MAP_HEIGHT);

    const fW3 = Math.floor(G03_MAP_WIDTH * s3 * 10) / 10;
    const fH3 = Math.floor(G03_MAP_HEIGHT * s3 * 10) / 10;
    const fW4 = Math.floor(G04_MAP_WIDTH * s4 * 10) / 10;
    const fH4 = Math.floor(G04_MAP_HEIGHT * s4 * 10) / 10;

    setG03Dim((prev) => {
      if (
        prev &&
        Math.abs(prev.width - fW3) < 0.5 &&
        Math.abs(prev.height - fH3) < 0.5 &&
        Math.abs(prev.scale - s3) < 0.001
      ) {
        return prev;
      }
      return { width: fW3, height: fH3, scale: s3 };
    });

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

  // Gallery 03 Data (gallery-04 in database) — strictly Gallery 03 points only
  const g03Points = getGalleryPoints('gallery-04');
  const g03Arrows = getGalleryArrows('gallery-04');
  const g03ColPoints = g03Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g03IconPoints = g03Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g03PuzzlePoints = g03Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g03ExpPoints = getExperiencePointsForGallery('gallery-04');

  // Gallery 04 Data (gallery-05 in database) — strictly Gallery 04 points only
  const g04Points = getGalleryPoints('gallery-05');
  const g04Arrows = getGalleryArrows('gallery-05');
  const g04ColPoints = g04Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g04IconPoints = g04Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g04PuzzlePoints = g04Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g04ExpPoints = getExperiencePointsForGallery('gallery-05');

  const areLocationPinsVisible = getLocationPinsVisible();

  // Anchor-based World-Space Alignment:
  // Outgoing Connection Point on Gallery 03: x: 462.55, y: 640
  // Incoming Connection Point on Gallery 04: x: 64, y: 227
  const g03H = g03Dim?.height || 500;
  const g03W = g03Dim?.width || 320;
  const g04H = g04Dim?.height || 500;
  const g04W = g04Dim?.width || 380;

  const s3 = g03Dim?.scale || (g03W / G03_MAP_WIDTH);
  const s4 = g04Dim?.scale || (g04W / G04_MAP_WIDTH);
  const avgScale = (s3 + s4) / 2;

  // Transformed map bounds in local panel space (neither map has horizontal translation):
  const g03Tx = 0;
  const g04Tx = 0;

  const g03ArrowRelX = g03Tx + ((462.55 / G03_MAP_WIDTH) - 0.5) * g03W;
  const g03ArrowRelY = ((640 / G03_MAP_HEIGHT) - 0.5) * g03H;

  const g04ArrowRelX = g04Tx + ((64 / G04_MAP_WIDTH) - 0.5) * g04W;
  const g04ArrowRelY = ((227 / G04_MAP_HEIGHT) - 0.5) * g04H;

  // 1. Align connection points on the horizontal travel axis:
  const targetOffsetY = g03ArrowRelY - g04ArrowRelY;

  // 2. Position destination map in shared world-space so actual transformed map bounds do NOT intersect:
  // Small consistent clearance in shared world space ensures visible map boundaries never collide
  const CLEARANCE_SVG = 12;
  const clearanceX = CLEARANCE_SVG * avgScale;
  const map3Right = g03Tx + (g03W / 2);
  const map4Left = g04Tx - (g04W / 2);
  const targetOffsetX = (map3Right - map4Left) + clearanceX;

  // 3. Geometry-based Corridor Opening Matching:
  // Outgoing corridor opening on Gallery 03 (East): rect height = 84.31 SVG units
  // Incoming corridor opening on Gallery 04 (West): rect height = 81.7 SVG units
  const G03_OUTGOING_CORRIDOR_OPENING_SVG = 84.31;
  const G04_INCOMING_CORRIDOR_OPENING_SVG = 81.7;

  const g03CorridorScreen = G03_OUTGOING_CORRIDOR_OPENING_SVG * s3;
  const g04CorridorScreen = G04_INCOMING_CORRIDOR_OPENING_SVG * s4;

  // Scale ratio derived directly from actual rendered corridor opening geometry:
  const forwardScale = g03CorridorScreen / g04CorridorScreen;
  const reverseScale = g04CorridorScreen / g03CorridorScreen;

  const initialStageX = isReverse ? -targetOffsetX : 0;
  const initialStageY = isReverse ? -targetOffsetY : 0;
  const initialStageScale = 1;

  const targetStageX = isReverse ? 0 : -targetOffsetX;
  const targetStageY = isReverse ? 0 : -targetOffsetY;
  const targetStageScale = 1;

  // Header Title Cross-Fade at transition midpoint (400ms)
  const [headerTitle, setHeaderTitle] = useState(() =>
    isReverse ? 'گالری ۰۴' : 'گالری ۰۳'
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeaderTitle(isReverse ? 'گالری ۰۳' : 'گالری ۰۴');
    }, 400);
    return () => clearTimeout(timer);
  }, [isReverse]);

  return (
    <div className="user-facing-app h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom">
      {/* Top App Bar Header */}
      <header
        id="transition-top-bar"
        dir="ltr"
        className="bg-[#ffffff] border-b-[1.25px] border-[#1e1b18] shadow-[0px_2px_0px_#1e1b18] flex flex-col w-full z-40 relative select-none pt-safe shrink-0 pointer-events-auto"
      >
        <div className="h-[5px] w-full bg-[#f59e0b] border-b border-[#1e1b18]" />
        <div className="flex justify-between items-center px-3.5 sm:px-6 h-[56px] sm:h-[60px]">
          <button
            onClick={onNavigateBack}
            aria-label="بازگشت به نقشه اصلی"
            title="بازگشت به نقشه اصلی"
            className="border-2 border-[#1e1b18] rounded-xl bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] p-2 shadow-[1.5px_1.5px_0px_#1e1b18] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none inline-flex items-center justify-center cursor-pointer transition-all duration-150"
          >
            <ArrowLeft className="w-5 h-5 text-[#1e1b18]" />
          </button>

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

      {/* Compact Player Status Bar - Ensures exactly identical available map height */}
      <PlayerStatusBar puzzles={playerStats.completedPuzzles} stars={playerStats.stars} coins={playerStats.coins} />

      {/* Main Map Viewport & Virtual Camera Viewport */}
      <main
        ref={containerRef}
        id="camera-transition-canvas-area"
        className="flex-1 min-h-0 relative overflow-hidden flex items-center justify-center p-2 sm:p-2.5 mb-[calc(64px+env(safe-area-inset-bottom,0px))] sm:mb-[calc(68px+env(safe-area-inset-bottom,0px))] touch-none select-none"
      >
        {/*
            Virtual Camera Stage:
            Forward Transition: Camera moves from Gallery 03 (0, 0) to Gallery 04 (targetOffsetX, targetOffsetY),
            smoothly zooming so corridor openings match seamlessly at the connection, landing at 100% scale.
            Reverse Transition: Camera moves from Gallery 04 (targetOffsetX, targetOffsetY) back to Gallery 03 (0, 0).
            Both maps stay in their fixed world-space positions.
        */}
        <motion.div
          id="camera-virtual-stage"
          initial={{ x: initialStageX, y: initialStageY, scale: initialStageScale }}
          animate={{ x: targetStageX, y: targetStageY, scale: targetStageScale }}
          transition={{
            duration: 1.18,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={onComplete}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transformOrigin: 'center center',
          }}
          className="will-change-transform pointer-events-none"
        >
          {/* Panel 1: Gallery 03 Map & Markers (Fixed Origin: 0, 0)
              If forward (G03 -> G04), G03 softly fades out during the final ~240ms of easing.
              If reverse (G04 -> G03), G03 is the destination and remains 100% visible throughout.
              Constant scale throughout entire movement.
          */}
          <motion.div
            id="panel-gallery-03"
            initial={{ opacity: 1 }}
            animate={isReverse ? { opacity: 1 } : { opacity: [1, 1, 0] }}
            transition={
              isReverse
                ? { duration: 1.18 }
                : { duration: 1.18, times: [0, 0.72, 1], ease: 'easeOut' }
            }
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: 'translate3d(0px, 0px, 0)',
            }}
            className="flex items-center justify-center"
          >
            <div
              style={{
                ...(g03Dim
                  ? { width: `${g03Dim.width}px`, height: `${g03Dim.height}px` }
                  : { width: '100%', height: 'auto' }),
                aspectRatio: `${G03_MAP_WIDTH} / ${G03_MAP_HEIGHT}`,
                maxWidth: '100%',
                maxHeight: '100%',
                ['--map-point-scale' as any]: g03Dim ? (g03Dim.width / 360).toFixed(4) : '1',
              }}
              className="relative mx-auto flex items-center justify-center shrink-0 select-none overflow-visible"
            >
              <Gallery04MapSvg className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none" />

              <div className="absolute inset-0 pointer-events-none">
                {/* G03 Arrows */}
                {g03Arrows.map((arrow) => {
                  const isEnabled = isArrowVisibleToPlayer(arrow);
                  const leftPercent = (arrow.x / G03_MAP_WIDTH) * 100;
                  const topPercent = (arrow.y / G03_MAP_HEIGHT) * 100;
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

                {/* G03 Custom Icons */}
                {g03IconPoints
                  .filter((ip) => ip.iconType === 'preset-question' || areLocationPinsVisible)
                  .map((iconPoint) => {
                    const leftPercent = (iconPoint.x / G03_MAP_WIDTH) * 100;
                    const topPercent = (iconPoint.y / G03_MAP_HEIGHT) * 100;
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

                {/* G03 Star Points */}
                {g03ColPoints
                  .filter((cp) => (cp as any).pointType === 'star')
                  .map((artwork) => (
                    <StarPoint
                      key={artwork.id}
                      id={artwork.id}
                      starId={artwork.starId || artwork.id}
                      x={artwork.x}
                      y={artwork.y}
                      title={artwork.title}
                      galleryId="gallery-04"
                      mapWidth={G03_MAP_WIDTH}
                      mapHeight={G03_MAP_HEIGHT}
                      scaleFactor={1.12}
                      onOpenDiscoveryModal={() => {}}
                    />
                  ))}

                {/* G03 Experience Points (Gallery 03 / gallery_04 strictly) */}
                {g03ExpPoints.map((exp) => (
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
                    mapWidth={G03_MAP_WIDTH}
                    mapHeight={G03_MAP_HEIGHT}
                    onOpenModal={() => {}}
                  />
                ))}

                {/* G03 Puzzle Points */}
                {g03PuzzlePoints.map((puzzlePoint) => (
                  <PuzzlePoint
                    key={puzzlePoint.id}
                    puzzlePoint={puzzlePoint}
                    galleryId="gallery-04"
                    mapWidth={G03_MAP_WIDTH}
                    mapHeight={G03_MAP_HEIGHT}
                    scaleFactor={1.12}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Panel 2: Gallery 04 Map & Markers
              Fixed world position: exactly opposite the Gallery 03 forward arrow.
              If forward (G03 -> G04), G04 is the destination and remains 100% visible throughout.
              If reverse (G04 -> G03), G04 softly fades out during the final ~240ms of easing.
              Constant scale throughout entire movement.
          */}
          <motion.div
            id="panel-gallery-04"
            initial={{ opacity: 1 }}
            animate={isReverse ? { opacity: [1, 1, 0] } : { opacity: 1 }}
            transition={
              isReverse
                ? { duration: 1.18, times: [0, 0.72, 1], ease: 'easeOut' }
                : { duration: 1.18 }
            }
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: `translate3d(${targetOffsetX}px, ${targetOffsetY}px, 0)`,
            }}
            className="flex items-center justify-center"
          >
            <div
              style={{
                ...(g04Dim
                  ? { width: `${g04Dim.width}px`, height: `${g04Dim.height}px` }
                  : { width: '100%', height: 'auto' }),
                aspectRatio: `${G04_MAP_WIDTH} / ${G04_MAP_HEIGHT}`,
                maxWidth: '100%',
                maxHeight: '100%',
                transformOrigin: 'center center',
                ['--map-point-scale' as any]: g04Dim ? (g04Dim.width / 360).toFixed(4) : '1',
              }}
              className="relative mx-auto flex items-center justify-center shrink-0 select-none overflow-visible"
            >
              <Gallery05MapSvg className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none" />

              <div className="absolute inset-0 pointer-events-none">
                {/* G04 Arrows */}
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

                {/* G04 Custom Icons */}
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

                {/* G04 Experience Points (Gallery 04 / gallery_05 strictly) */}
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
          </motion.div>
        </motion.div>
      </main>

      {/* Bottom Left Floating Action Button (Gallery 02 through Gallery 09 / transition) */}
      <div className="pointer-events-auto">
        <GalleryFloatingActions galleryId={isReverse ? 'gallery-03' : 'gallery-04'} />
      </div>

      {/* Bottom Right Floating Controls */}
      <div
        id="transition-floating-controls"
        className="absolute bottom-20 right-4 sm:right-6 z-30 flex items-center justify-center select-none pointer-events-auto"
      >
        {/* Gallery Toggle Button to return to Gallery 00 */}
        <button
          id="btn-transition-toggle-map"
          onClick={onNavigateBack}
          aria-label="بازگشت به نقشه اصلی (گالری ۰۰)"
          title="بازگشت به نقشه اصلی (گالری ۰۰)"
          className="w-13 h-13 rounded-2xl border-[2.5px] border-[#1e1b18] bg-[#f59e0b] hover:bg-[#d97706] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
        >
          <Map className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="map" onSelectTab={onSelectTab} />
    </div>
  );
};
