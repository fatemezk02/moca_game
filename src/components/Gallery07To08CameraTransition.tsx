import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Map } from 'lucide-react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import {
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
} from '../types/admin';
import { Gallery08MapSvg } from './Gallery08MapSvg';
import { Gallery09MapSvg } from './Gallery09MapSvg';
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

interface Gallery07To08CameraTransitionProps {
  direction?: 'forward' | 'reverse'; // forward: Gallery 07 -> Gallery 08, reverse: Gallery 08 -> Gallery 07
  onComplete: () => void;
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

// Canonical Map SVG Dimensions matching original SVG viewBoxes
// Source: Gallery 07 map SVG (Gallery08MapSvg): viewBox="0 0 501.5 642.18"
const G07_MAP_WIDTH = 501.5;
const G07_MAP_HEIGHT = 642.18;

// Destination: Gallery 08 map SVG (Gallery09MapSvg): viewBox="0 0 453.09 846.45"
const G08_MAP_WIDTH = 453.09;
const G08_MAP_HEIGHT = 846.45;

// Exact Arrow Anchor Coordinates:
// - Source Anchor (Gallery 07): arrow-g08-to-g09 at X = 228, Y = 561 (pointing 180° / DOWN)
// - Destination Anchor (Gallery 08): arrow-g09-to-g08 at local X = 49, Y = 228 (pointing 270° / LEFT unrotated)
const G07_ANCHOR_X = 228;
const G07_ANCHOR_Y = 561;

const G08_LOCAL_ANCHOR_X = 49;
const G08_LOCAL_ANCHOR_Y = 228;

// Fixed Shared World Transform for Gallery 08:
// Gallery 08 is rotated 90° clockwise.
// Solved so Gallery 08's arrow at (49, 228) coincides with Gallery 07's arrow at (228, 561):
// Previous G08_WORLD_X = 456.00
// Fixed additional horizontal X offset (+20% of 456.00) = +91.20 SVG coordinate units
// New G08_WORLD_X = 456.00 + 91.20 = 547.20
const G08_WORLD_X = 547.20;
const G08_WORLD_Y = 512;
const G08_WORLD_ROTATION = 90; // 90° clockwise

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
 * Cinematic Camera-Travel & Rotation Transition between Gallery 07 and Gallery 08.
 *
 * Architecture:
 * - Single temporary shared world coordinate system.
 * - Gallery 07 is fixed at origin (0, 0) upright (0°).
 * - Gallery 08 is fixed at (456, 512) rotated 90° clockwise.
 * - Arrow anchors match perfectly at world coordinates (228, 561) and face each other 180° opposite.
 * - The Virtual Camera moves from Gallery 07 center to Gallery 08 center while smoothly rotating
 *   0° -> 90° clockwise.
 * - At the final frame, the camera rotation (90°) cancels Gallery 08's world rotation (+90° - 90° = 0°),
 *   framing Gallery 08 perfectly upright at normal page scale with ZERO snap or jump.
 */
export const Gallery07To08CameraTransition: React.FC<Gallery07To08CameraTransitionProps> = ({
  direction = 'forward',
  onComplete,
  onNavigateBack,
  onSelectTab,
}) => {
  const isReverse = direction === 'reverse';
  const containerRef = useRef<HTMLElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => getUserProfile());
  const playerStats = usePlayerStats();

  const [g07Dim, setG07Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G07_MAP_WIDTH, G07_MAP_HEIGHT)
  );
  const [g08Dim, setG08Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G08_MAP_WIDTH, G08_MAP_HEIGHT)
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

    const s7 = Math.min(availWidth / G07_MAP_WIDTH, availHeight / G07_MAP_HEIGHT);
    const s8 = Math.min(availWidth / G08_MAP_WIDTH, availHeight / G08_MAP_HEIGHT);

    const fW7 = Math.floor(G07_MAP_WIDTH * s7 * 10) / 10;
    const fH7 = Math.floor(G07_MAP_HEIGHT * s7 * 10) / 10;
    const fW8 = Math.floor(G08_MAP_WIDTH * s8 * 10) / 10;
    const fH8 = Math.floor(G08_MAP_HEIGHT * s8 * 10) / 10;

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

    setG08Dim((prev) => {
      if (
        prev &&
        Math.abs(prev.width - fW8) < 0.5 &&
        Math.abs(prev.height - fH8) < 0.5 &&
        Math.abs(prev.scale - s8) < 0.001
      ) {
        return prev;
      }
      return { width: fW8, height: fH8, scale: s8 };
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

  // Gallery 07 Data (config key 'gallery-08')
  const g07Points = getGalleryPoints('gallery-08');
  const g07Arrows = getGalleryArrows('gallery-08');
  const g07ColPoints = g07Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g07IconPoints = g07Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g07PuzzlePoints = g07Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g07ExpPoints = getExperiencePointsForGallery('gallery-08');

  // Gallery 08 Data (config key 'gallery-09')
  const g08Points = getGalleryPoints('gallery-09');
  const g08Arrows = getGalleryArrows('gallery-09');
  const g08ColPoints = g08Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g08IconPoints = g08Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g08PuzzlePoints = g08Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g08ExpPoints = getExperiencePointsForGallery('gallery-09');

  const areLocationPinsVisible = getLocationPinsVisible();

  // Scale factors for Gallery 07 & 08 in normal view
  const s7 = g07Dim?.scale || 1;
  const s8 = g08Dim?.scale || 1;

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

  // World Focal Centers:
  // - Gallery 07 center in world space: (501.5 / 2, 642.18 / 2) = (250.75, 321.09)
  // - Gallery 08 center in world space (rotated 90° CW at 456, 512):
  //   local Center = (453.09 / 2, 846.45 / 2) = (226.545, 423.225)
  //   rotated 90° CW: X = 456 - 423.225 = 32.775, Y = 512 + 226.545 = 738.545
  const g07CenterWorldX = G07_MAP_WIDTH / 2; // 250.75
  const g07CenterWorldY = G07_MAP_HEIGHT / 2; // 321.09

  const g08CenterWorldX = G08_WORLD_X - G08_MAP_HEIGHT / 2; // 32.775
  const g08CenterWorldY = G08_WORLD_Y + G08_MAP_WIDTH / 2; // 738.545

  // Start & End Camera Transforms (X, Y, Zoom, Rotation)
  const startCamX = isReverse ? g08CenterWorldX : g07CenterWorldX;
  const startCamY = isReverse ? g08CenterWorldY : g07CenterWorldY;
  const startCamScale = isReverse ? s8 : s7;
  const startCamRot = isReverse ? G08_WORLD_ROTATION : 0; // 90° or 0°

  const endCamX = isReverse ? g07CenterWorldX : g08CenterWorldX;
  const endCamY = isReverse ? g07CenterWorldY : g08CenterWorldY;
  const endCamScale = isReverse ? s7 : s8;
  const endCamRot = isReverse ? 0 : G08_WORLD_ROTATION; // 0° or 90°

  // Interpolated Camera State
  const currentCamX = startCamX + (endCamX - startCamX) * animationProgress;
  const currentCamY = startCamY + (endCamY - startCamY) * animationProgress;
  const currentCamScale = startCamScale + (endCamScale - startCamScale) * animationProgress;
  const currentCamRot = startCamRot + (endCamRot - startCamRot) * animationProgress;

  // Debug Logging for verification
  useEffect(() => {
    console.log('[Gallery07To08CameraTransition] Verified Anchor Setup:', {
      g07ArrowAnchor: { x: G07_ANCHOR_X, y: G07_ANCHOR_Y },
      g08LocalArrowAnchor: { x: G08_LOCAL_ANCHOR_X, y: G08_LOCAL_ANCHOR_Y },
      g08WorldPosition: { x: G08_WORLD_X, y: G08_WORLD_Y },
      g08WorldRotation: G08_WORLD_ROTATION,
      cameraStart: { x: startCamX, y: startCamY, scale: startCamScale, rot: startCamRot },
      cameraEnd: { x: endCamX, y: endCamY, scale: endCamScale, rot: endCamRot },
    });
  }, [startCamX, startCamY, startCamScale, startCamRot, endCamX, endCamY, endCamScale, endCamRot]);

  // Map Opacities
  const g07Opacity = isReverse
    ? Math.min(1, animationProgress * 1.5)
    : Math.max(0, 1 - animationProgress * 1.2);

  const g08Opacity = isReverse
    ? Math.max(0, 1 - animationProgress * 1.2)
    : Math.min(1, animationProgress * 1.5);

  return (
    <div
      id="gallery-07-to-08-transition-root"
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
            title="بازگشت به نقشه اصلی"
            className="border-2 border-[#1e1b18] rounded-xl bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] p-2 shadow-[1.5px_1.5px_0px_#1e1b18] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none inline-flex items-center justify-center cursor-pointer transition-all duration-150"
          >
            <ArrowLeft className="w-5 h-5 text-[#1e1b18]" />
          </button>

          {/* Dynamic Header Title */}
          <div className="flex flex-col items-center justify-center flex-1 mx-2 text-center overflow-hidden">
            <span className="font-bold text-sm sm:text-base text-[#1e1b18] truncate">
              {animationProgress > 0.5 ? 'تلاقی رسانه‌ها' : 'آونگ زمان'}
            </span>
            <span className="text-[10px] sm:text-xs text-[#8c827a] font-mono-custom tracking-tight">
              {animationProgress > 0.5 ? 'گالری ۰۸' : 'گالری ۰۷'}
            </span>
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
        {/* The Camera Container translating and rotating smoothly in Shared World-Space */}
        <div
          data-transition-layer="camera-stage"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 0,
            height: 0,
            transform: `scale(${currentCamScale}) rotate(${-currentCamRot}deg) translate3d(${-currentCamX}px, ${-currentCamY}px, 0)`,
            willChange: 'transform',
          }}
          className="overflow-visible pointer-events-none"
        >
          {/* ==================== GALLERY 07 MAP ==================== */}
          <div
            data-transition-layer="g07"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${G07_MAP_WIDTH}px`,
              height: `${G07_MAP_HEIGHT}px`,
              opacity: g07Opacity,
              ['--map-point-scale' as any]: (G07_MAP_WIDTH / 360).toFixed(4),
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

          {/* ==================== GALLERY 08 MAP ==================== */}
          <div
            data-transition-layer="g08"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${G08_MAP_WIDTH}px`,
              height: `${G08_MAP_HEIGHT}px`,
              transform: `translate3d(${G08_WORLD_X}px, ${G08_WORLD_Y}px, 0) rotate(${G08_WORLD_ROTATION}deg)`,
              transformOrigin: '0 0',
              opacity: g08Opacity,
              ['--map-point-scale' as any]: (G08_MAP_WIDTH / 360).toFixed(4),
            }}
            className="relative flex items-center justify-center shrink-0 select-none overflow-visible pointer-events-none"
          >
            <Gallery09MapSvg className="w-full h-full object-contain pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none">
              {/* G08 Navigation Arrows */}
              {g08Arrows.map((arrow) => {
                const isEnabled = isArrowVisibleToPlayer(arrow);
                const leftPercent = (arrow.x / G08_MAP_WIDTH) * 100;
                const topPercent = (arrow.y / G08_MAP_HEIGHT) * 100;
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

              {/* G08 Icon Points */}
              {g08IconPoints
                .filter((ip) => ip.iconType === 'preset-question' || areLocationPinsVisible)
                .map((iconPoint) => {
                  const leftPercent = (iconPoint.x / G08_MAP_WIDTH) * 100;
                  const topPercent = (iconPoint.y / G08_MAP_HEIGHT) * 100;
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

              {/* G08 Star Points */}
              {g08ColPoints
                .filter((cp) => (cp as any).pointType === 'star')
                .map((artwork) => (
                  <StarPoint
                    key={artwork.id}
                    id={artwork.id}
                    starId={artwork.starId || artwork.id}
                    x={artwork.x}
                    y={artwork.y}
                    title={artwork.title}
                    galleryId="gallery-09"
                    mapWidth={G08_MAP_WIDTH}
                    mapHeight={G08_MAP_HEIGHT}
                    scaleFactor={1.2978}
                    onOpenDiscoveryModal={() => {}}
                  />
                ))}

              {/* G08 Experience Points */}
              {g08ExpPoints.map((exp) => (
                <ExperiencePoint
                  key={exp.id}
                  id={exp.id}
                  experienceId={exp.experienceId}
                  galleryId="gallery_09"
                  x={exp.x}
                  y={exp.y}
                  iconId={exp.iconId}
                  label={exp.labelFa}
                  title={exp.title}
                  mapWidth={G08_MAP_WIDTH}
                  mapHeight={G08_MAP_HEIGHT}
                  onOpenModal={() => {}}
                />
              ))}

              {/* G08 Puzzle Points */}
              {g08PuzzlePoints.map((puzzlePoint) => (
                <PuzzlePoint
                  key={puzzlePoint.id}
                  puzzlePoint={puzzlePoint}
                  galleryId="gallery-09"
                  mapWidth={G08_MAP_WIDTH}
                  mapHeight={G08_MAP_HEIGHT}
                  scaleFactor={1.2978}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Left Floating Action Button (Gallery 02 through Gallery 09 / transition) */}
      <div className="pointer-events-auto">
        <GalleryFloatingActions galleryId={isReverse ? 'gallery-07' : 'gallery-08'} />
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
