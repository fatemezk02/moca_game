import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Map } from 'lucide-react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import { AdminCollectionPoint, AdminIconPoint, AdminPuzzlePoint } from '../types/admin';
import { Gallery02MapSvg } from './Gallery02MapSvg';
import { Gallery03MapSvg } from './Gallery03MapSvg';
import { PuzzlePoint } from './PuzzlePoint';
import { StarPoint } from './StarPoint';
import { ExperiencePoint } from './ExperiencePoint';
import { CustomIconRender } from './CustomIconRender';
import { NavigationArrowRender } from './NavigationArrowRender';
import { PlayerStatusBar } from './PlayerStatusBar';
import { BottomNavBar } from './BottomNavBar';
import { ProfileAvatar } from './ProfileAvatar';
import { getUserProfile, UserProfile } from '../data/userProfileStore';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { MapDimensions } from '../hooks/useFitMapDimensions';
import { getExperiencePointsForGallery } from '../data/experiencePointsConfig';
import { isArrowVisibleToPlayer } from '../data/arrowConditionsStore';
import { getLocationPinsVisible } from '../data/locationPinsVisibilityStore';

interface Gallery01To02CameraTransitionProps {
  direction?: 'forward' | 'reverse';
  onComplete: () => void;
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

const G01_MAP_WIDTH = 524.2;
const G01_MAP_HEIGHT = 822.62;

const G02_MAP_WIDTH = 561.28;
const G02_MAP_HEIGHT = 851.79;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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

export const Gallery01To02CameraTransition: React.FC<Gallery01To02CameraTransitionProps> = ({
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
  const [g01Dim, setG01Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G01_MAP_WIDTH, G01_MAP_HEIGHT)
  );
  const [g02Dim, setG02Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G02_MAP_WIDTH, G02_MAP_HEIGHT)
  );

  // Measure the single shared viewport container for BOTH Gallery 01 and Gallery 02
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

    const s1 = Math.min(availWidth / G01_MAP_WIDTH, availHeight / G01_MAP_HEIGHT);
    const s2 = Math.min(availWidth / G02_MAP_WIDTH, availHeight / G02_MAP_HEIGHT);

    const fW1 = Math.floor(G01_MAP_WIDTH * s1 * 10) / 10;
    const fH1 = Math.floor(G01_MAP_HEIGHT * s1 * 10) / 10;
    const fW2 = Math.floor(G02_MAP_WIDTH * s2 * 10) / 10;
    const fH2 = Math.floor(G02_MAP_HEIGHT * s2 * 10) / 10;

    setG01Dim({ width: fW1, height: fH1, scale: s1 });
    setG02Dim({ width: fW2, height: fH2, scale: s2 });
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

  // Listen to profile updates
  useEffect(() => {
    const handleProfileUpdate = (e: any) => setProfile(e.detail);
    window.addEventListener('museum_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('museum_user_profile_updated', handleProfileUpdate);
  }, []);

  // Gallery 01 Data
  const g01Points = getGalleryPoints('gallery_01');
  const g01Arrows = getGalleryArrows('gallery_01');
  const g01ColPoints = g01Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g01IconPoints = g01Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g01PuzzlePoints = g01Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g01ExpPoints = getExperiencePointsForGallery('gallery-01');

  // Gallery 02 Data
  const g02Points = getGalleryPoints('gallery-03');
  const g02Arrows = getGalleryArrows('gallery-03');
  const g02ColPoints = g02Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g02IconPoints = g02Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g02PuzzlePoints = g02Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g02ExpPoints = getExperiencePointsForGallery('gallery-02');

  const areLocationPinsVisible = getLocationPinsVisible();

  // Anchor-based World-Space Alignment:
  // Outgoing Connection Point on Gallery 01: x: 431, y: 216
  // Incoming Connection Point on Gallery 02: x: 28, y: 645
  const g01H = g01Dim?.height || 500;
  const g01W = g01Dim?.width || 320;
  const g02H = g02Dim?.height || 500;
  const g02W = g02Dim?.width || 340;

  const s1 = g01Dim?.scale || (g01W / G01_MAP_WIDTH);
  const s2 = g02Dim?.scale || (g02W / G02_MAP_WIDTH);
  const avgScale = (s1 + s2) / 2;

  // Transformed map bounds in local panel space:
  // Gallery 01 has canonical translateX(6%)
  const g01Tx = 0.06 * g01W;
  // Gallery 02 has canonical translateX(2.2%)
  const g02Tx = 0.022 * g02W;

  const g01ArrowRelX = g01Tx + ((431 / G01_MAP_WIDTH) - 0.5) * g01W;
  const g01ArrowRelY = ((216 / G01_MAP_HEIGHT) - 0.5) * g01H;

  const g02ArrowRelX = g02Tx + ((28 / G02_MAP_WIDTH) - 0.5) * g02W;
  const g02ArrowRelY = ((645 / G02_MAP_HEIGHT) - 0.5) * g02H;

  // 1. Align connection points on the horizontal travel axis:
  const targetOffsetY = g01ArrowRelY - g02ArrowRelY;

  // 2. Position destination map in shared world-space so actual transformed map bounds do NOT intersect:
  // Small consistent clearance in shared world space ensures visible map boundaries never collide
  const CLEARANCE_SVG = 12;
  const clearanceX = CLEARANCE_SVG * avgScale;
  const map1Right = g01Tx + (g01W / 2);
  const map2Left = g02Tx - (g02W / 2);
  const targetOffsetX = (map1Right - map2Left) + clearanceX;

  // 3. Geometry-based Corridor Opening Matching:
  // Outgoing corridor opening on Gallery 01 (East): polyline height = 103.43 SVG units
  // Incoming corridor opening on Gallery 02 (West): rect height = 84.31 SVG units
  const G01_OUTGOING_CORRIDOR_OPENING_SVG = 103.43;
  const G02_INCOMING_CORRIDOR_OPENING_SVG = 84.31;

  const g01CorridorScreen = G01_OUTGOING_CORRIDOR_OPENING_SVG * s1;
  const g02CorridorScreen = G02_INCOMING_CORRIDOR_OPENING_SVG * s2;

  // Scale ratio derived directly from actual rendered corridor opening geometry:
  const forwardScale = g01CorridorScreen / g02CorridorScreen;
  const reverseScale = g02CorridorScreen / g01CorridorScreen;

  const initialStageX = isReverse ? -targetOffsetX : 0;
  const initialStageY = isReverse ? -targetOffsetY : 0;
  const initialStageScale = 1;

  const targetStageX = isReverse ? 0 : -targetOffsetX;
  const targetStageY = isReverse ? 0 : -targetOffsetY;
  const targetStageScale = 1;

  // Header titles cross-fade during travel
  const [headerTitle, setHeaderTitle] = useState(isReverse ? 'گالری ۰۲' : 'گالری ۰۱');
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeaderTitle(isReverse ? 'گالری ۰۱' : 'گالری ۰۲');
    }, 400);
    return () => clearTimeout(timer);
  }, [isReverse]);

  return (
    <div
      id="g01-to-g02-transition-root"
      className="user-facing-app h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom select-none pointer-events-none"
    >
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
            className="border-2 border-[#1e1b18] rounded-xl bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] p-2 shadow-[1.5px_1.5px_0px_#1e1b18] inline-flex items-center justify-center cursor-pointer"
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
            className="rounded-full cursor-pointer inline-flex items-center justify-center shrink-0"
          >
            <ProfileAvatar avatarId={profile?.avatarId} size="md" className="scale-[1.04]" />
          </button>
        </div>
      </header>

      {/* Player Status Bar */}
      <PlayerStatusBar puzzles={playerStats.completedPuzzles} stars={playerStats.stars} coins={playerStats.coins} />

      {/* Main Floor Plan Canvas Viewport */}
      <main
        ref={containerRef}
        id="camera-transition-canvas-area"
        className="flex-1 min-h-0 relative overflow-hidden flex items-center justify-center p-2 sm:p-2.5 mb-[calc(64px+env(safe-area-inset-bottom,0px))] sm:mb-[calc(68px+env(safe-area-inset-bottom,0px))]"
      >
        {/* Virtual Museum Map Stage
            Forward Transition: Camera moves from Gallery 01 (0, 0) to Gallery 02 (targetOffsetX, targetOffsetY),
            smoothly zooming so corridor openings match seamlessly at the connection, landing at 100% scale.
            Reverse Transition: Camera moves from Gallery 02 (targetOffsetX, targetOffsetY) back to Gallery 01 (0, 0).
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
          {/* Panel 1: Gallery 01 Map & Markers (Fixed Origin: 0, 0)
              If forward (G01 -> G02), G01 softly fades out during the final ~240ms of easing.
              If reverse (G02 -> G01), G01 is the destination and remains 100% visible throughout.
          */}
          <motion.div
            id="panel-gallery-01"
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
                ...(g01Dim
                  ? { width: `${g01Dim.width}px`, height: `${g01Dim.height}px` }
                  : { width: '100%', height: 'auto' }),
                aspectRatio: `${G01_MAP_WIDTH} / ${G01_MAP_HEIGHT}`,
                maxWidth: '100%',
                maxHeight: '100%',
                transform: 'translateX(6%)',
                ['--map-point-scale' as any]: g01Dim ? (g01Dim.width / 360).toFixed(4) : '1',
              }}
              className="relative mx-auto flex items-center justify-center shrink-0 select-none overflow-visible"
            >
              <Gallery02MapSvg className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none" />

              <div className="absolute inset-0 pointer-events-none">
                {/* G01 Arrows */}
                {g01Arrows.map((arrow) => {
                  const isEnabled = isArrowVisibleToPlayer(arrow);
                  const leftPercent = (arrow.x / G01_MAP_WIDTH) * 100;
                  const topPercent = (arrow.y / G01_MAP_HEIGHT) * 100;
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

                {/* G01 Custom Icons */}
                {g01IconPoints
                  .filter((ip) => ip.iconType === 'preset-question' || areLocationPinsVisible)
                  .map((iconPoint) => {
                    const leftPercent = (iconPoint.x / G01_MAP_WIDTH) * 100;
                    const topPercent = (iconPoint.y / G01_MAP_HEIGHT) * 100;
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

                {/* G01 Star Points — directly positioned without redundant outer wrapper */}
                {g01ColPoints
                  .filter((cp) => (cp as any).pointType === 'star')
                  .map((artwork) => (
                    <StarPoint
                      key={artwork.id}
                      id={artwork.id}
                      starId={artwork.starId || artwork.id}
                      x={artwork.x}
                      y={artwork.y}
                      title={artwork.title}
                      galleryId="gallery_01"
                      mapWidth={G01_MAP_WIDTH}
                      mapHeight={G01_MAP_HEIGHT}
                      scaleFactor={1.05}
                      onOpenDiscoveryModal={() => {}}
                    />
                  ))}

                {/* G01 Experience Points */}
                {g01ExpPoints.map((exp) => (
                  <ExperiencePoint
                    key={exp.id}
                    id={exp.id}
                    experienceId={exp.experienceId}
                    galleryId={exp.galleryId || 'gallery_01'}
                    x={exp.x}
                    y={exp.y}
                    iconId={exp.iconId}
                    label={exp.labelFa}
                    title={exp.title}
                    mapWidth={G01_MAP_WIDTH}
                    mapHeight={G01_MAP_HEIGHT}
                    onOpenModal={() => {}}
                  />
                ))}

                {/* G01 Puzzle Points — directly positioned without redundant outer wrapper */}
                {g01PuzzlePoints.map((puzzlePoint) => (
                  <PuzzlePoint
                    key={puzzlePoint.id}
                    puzzlePoint={puzzlePoint}
                    galleryId="gallery-01"
                    mapWidth={G01_MAP_WIDTH}
                    mapHeight={G01_MAP_HEIGHT}
                    scaleFactor={1.05}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Panel 2: Gallery 02 Map & Markers
              Fixed world position: exactly opposite the Gallery 01 forward arrow.
              If forward (G01 -> G02), G02 is the destination and remains 100% visible throughout.
              If reverse (G02 -> G01), G02 softly fades out during the final ~240ms of easing.
          */}
          <motion.div
            id="panel-gallery-02"
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
                ...(g02Dim
                  ? { width: `${g02Dim.width}px`, height: `${g02Dim.height}px` }
                  : { width: '100%', height: 'auto' }),
                aspectRatio: `${G02_MAP_WIDTH} / ${G02_MAP_HEIGHT}`,
                maxWidth: '100%',
                maxHeight: '100%',
                transform: 'translateX(2.2%)',
                ['--map-point-scale' as any]: g02Dim ? (g02Dim.width / 360).toFixed(4) : '1',
              }}
              className="relative mx-auto flex items-center justify-center shrink-0 select-none overflow-visible"
            >
              <Gallery03MapSvg className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none" />

              <div className="absolute inset-0 pointer-events-none">
                {/* G02 Arrows */}
                {g02Arrows.map((arrow) => {
                  const isEnabled = isArrowVisibleToPlayer(arrow);
                  const leftPercent = (arrow.x / G02_MAP_WIDTH) * 100;
                  const topPercent = (arrow.y / G02_MAP_HEIGHT) * 100;
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

                {/* G02 Custom Icons */}
                {g02IconPoints
                  .filter((ip) => ip.iconType === 'preset-question' || areLocationPinsVisible)
                  .map((iconPoint) => {
                    const leftPercent = (iconPoint.x / G02_MAP_WIDTH) * 100;
                    const topPercent = (iconPoint.y / G02_MAP_HEIGHT) * 100;
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

                {/* G02 Star Points — directly positioned with exact map dimensions */}
                {g02ColPoints
                  .filter((cp) => (cp as any).pointType === 'star')
                  .map((artwork) => (
                    <StarPoint
                      key={artwork.id}
                      id={artwork.id}
                      starId={artwork.starId || artwork.id}
                      x={artwork.x}
                      y={artwork.y}
                      title={artwork.title}
                      galleryId="gallery_03"
                      mapWidth={G02_MAP_WIDTH}
                      mapHeight={G02_MAP_HEIGHT}
                      onOpenDiscoveryModal={() => {}}
                    />
                  ))}

                {/* G02 Experience Points */}
                {g02ExpPoints.map((exp) => (
                  <ExperiencePoint
                    key={exp.id}
                    id={exp.id}
                    experienceId={exp.experienceId}
                    galleryId={exp.galleryId || 'gallery_02'}
                    x={exp.x}
                    y={exp.y}
                    iconId={exp.iconId}
                    label={exp.labelFa}
                    title={exp.title}
                    mapWidth={G02_MAP_WIDTH}
                    mapHeight={G02_MAP_HEIGHT}
                    onOpenModal={() => {}}
                  />
                ))}

                {/* G02 Puzzle Points — directly positioned with exact map dimensions */}
                {g02PuzzlePoints.map((puzzlePoint) => (
                  <PuzzlePoint
                    key={puzzlePoint.id}
                    puzzlePoint={puzzlePoint}
                    galleryId="gallery-03"
                    mapWidth={G02_MAP_WIDTH}
                    mapHeight={G02_MAP_HEIGHT}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Bottom Floating Controls */}
      <div className="absolute bottom-20 right-4 sm:right-6 z-30 flex items-center justify-center pointer-events-auto">
        <button
          onClick={onNavigateBack}
          aria-label="بازگشت به نقشه اصلی"
          className="w-13 h-13 rounded-2xl border-[2.5px] border-[#1e1b18] bg-[#f59e0b] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center cursor-pointer"
        >
          <Map className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="pointer-events-auto">
        <BottomNavBar
          activeTab="map"
          onTabChange={(tab) => {
            if (tab === 'map') {
              onNavigateBack();
            } else {
              onSelectTab?.(tab);
            }
          }}
        />
      </div>
    </div>
  );
};
