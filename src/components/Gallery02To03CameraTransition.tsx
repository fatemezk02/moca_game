import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Map } from 'lucide-react';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import { AdminCollectionPoint, AdminIconPoint, AdminPuzzlePoint } from '../types/admin';
import { Gallery03MapSvg } from './Gallery03MapSvg';
import { Gallery04MapSvg } from './Gallery04MapSvg';
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

interface Gallery02To03CameraTransitionProps {
  direction?: 'forward' | 'reverse';
  onComplete: () => void;
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

const G02_MAP_WIDTH = 561.28;
const G02_MAP_HEIGHT = 851.79;

const G03_MAP_WIDTH = 498.55;
const G03_MAP_HEIGHT = 851.79;

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

export const Gallery02To03CameraTransition: React.FC<Gallery02To03CameraTransitionProps> = ({
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
  const [g02Dim, setG02Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G02_MAP_WIDTH, G02_MAP_HEIGHT)
  );
  const [g03Dim, setG03Dim] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(G03_MAP_WIDTH, G03_MAP_HEIGHT)
  );

  // Measure the single shared viewport container for BOTH Gallery 02 and Gallery 03
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

    const s2 = Math.min(availWidth / G02_MAP_WIDTH, availHeight / G02_MAP_HEIGHT);
    const s3 = Math.min(availWidth / G03_MAP_WIDTH, availHeight / G03_MAP_HEIGHT);

    const fW2 = Math.floor(G02_MAP_WIDTH * s2 * 10) / 10;
    const fH2 = Math.floor(G02_MAP_HEIGHT * s2 * 10) / 10;
    const fW3 = Math.floor(G03_MAP_WIDTH * s3 * 10) / 10;
    const fH3 = Math.floor(G03_MAP_HEIGHT * s3 * 10) / 10;

    setG02Dim({ width: fW2, height: fH2, scale: s2 });
    setG03Dim({ width: fW3, height: fH3, scale: s3 });
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

  // Gallery 02 Data (gallery-03 in database)
  const g02Points = getGalleryPoints('gallery-03');
  const g02Arrows = getGalleryArrows('gallery-03');
  const g02ColPoints = g02Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g02IconPoints = g02Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g02PuzzlePoints = g02Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g02ExpPoints = getExperiencePointsForGallery('gallery-02');

  // Gallery 03 Data (gallery-04 in database)
  const g03Points = getGalleryPoints('gallery-04');
  const g03Arrows = getGalleryArrows('gallery-04');
  const g03ColPoints = g03Points.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
  const g03IconPoints = g03Points.filter((p) => p.type === 'icon') as AdminIconPoint[];
  const g03PuzzlePoints = g03Points.filter((p) => p.type === 'puzzle') as AdminPuzzlePoint[];
  const g03ExpPoints = [
    ...getExperiencePointsForGallery('gallery-03'),
    ...getExperiencePointsForGallery('gallery-04'),
  ];

  const areLocationPinsVisible = getLocationPinsVisible();

  // Anchor-based World-Space Alignment:
  // Outgoing Connection Point on Gallery 02: x: 532, y: 229
  // Incoming Connection Point on Gallery 03: x: 28, y: 645
  const g02H = g02Dim?.height || 500;
  const g02W = g02Dim?.width || 340;
  const g03H = g03Dim?.height || 500;
  const g03W = g03Dim?.width || 320;

  const s2 = g02Dim?.scale || (g02W / G02_MAP_WIDTH);
  const s3 = g03Dim?.scale || (g03W / G03_MAP_WIDTH);
  const avgScale = (s2 + s3) / 2;

  // Transformed map bounds in local panel space:
  // Gallery 02 has canonical translateX(2.2%)
  const g02Tx = 0.022 * g02W;
  const g03Tx = 0;

  const g02ArrowRelX = g02Tx + ((532 / G02_MAP_WIDTH) - 0.5) * g02W;
  const g02ArrowRelY = ((229 / G02_MAP_HEIGHT) - 0.5) * g02H;

  const g03ArrowRelX = g03Tx + ((28 / G03_MAP_WIDTH) - 0.5) * g03W;
  const g03ArrowRelY = ((645 / G03_MAP_HEIGHT) - 0.5) * g03H;

  // 1. Align connection points on the horizontal travel axis:
  const targetOffsetY = g02ArrowRelY - g03ArrowRelY;

  // 2. Position destination map in shared world-space so actual transformed map bounds do NOT intersect:
  // Small consistent clearance in shared world space ensures visible map boundaries never collide
  const CLEARANCE_SVG = 12;
  const clearanceX = CLEARANCE_SVG * avgScale;
  const map2Right = g02Tx + (g02W / 2);
  const map3Left = g03Tx - (g03W / 2);
  const targetOffsetX = (map2Right - map3Left) + clearanceX;

  // 3. Geometry-based Corridor Opening Matching:
  // Outgoing corridor opening on Gallery 02 (East): height = 87.91 SVG units
  // Incoming corridor opening on Gallery 03 (West): rect height = 84.31 SVG units
  const G02_OUTGOING_CORRIDOR_OPENING_SVG = 87.91;
  const G03_INCOMING_CORRIDOR_OPENING_SVG = 84.31;

  const g02CorridorScreen = G02_OUTGOING_CORRIDOR_OPENING_SVG * s2;
  const g03CorridorScreen = G03_INCOMING_CORRIDOR_OPENING_SVG * s3;

  // Scale ratio derived directly from actual rendered corridor opening geometry:
  const forwardScale = g02CorridorScreen / g03CorridorScreen;
  const reverseScale = g03CorridorScreen / g02CorridorScreen;

  const initialStageX = isReverse ? -reverseScale * targetOffsetX : 0;
  const initialStageY = isReverse ? -reverseScale * targetOffsetY : 0;
  const initialStageScale = isReverse ? reverseScale : forwardScale;

  const targetStageX = isReverse ? 0 : -targetOffsetX;
  const targetStageY = isReverse ? 0 : -targetOffsetY;
  const targetStageScale = 1;

  // Header Title Cross-Fade at transition midpoint (400ms)
  const [headerTitle, setHeaderTitle] = useState(() =>
    isReverse ? 'گالری ۰۳' : 'گالری ۰۲'
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeaderTitle(isReverse ? 'گالری ۰۲' : 'گالری ۰۳');
    }, 400);
    return () => clearTimeout(timer);
  }, [isReverse]);

  return (
    <div className="user-facing-app h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom">
      {/* Top Header */}
      <header className="user-header shrink-0 z-30 px-3 py-2 bg-[#fbf9f9] border-b-2 border-[#1e1b18] shadow-[0_2px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto flex items-center justify-between h-11">
          {/* Back Button */}
          <button
            onClick={onNavigateBack}
            aria-label="بازگشت به نقشه اصلی"
            title="بازگشت به نقشه اصلی"
            className="border-2 border-[#1e1b18] rounded-xl bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] p-2 shadow-[1.5px_1.5px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none inline-flex items-center justify-center cursor-pointer transition-all duration-150"
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
            className="rounded-full cursor-pointer inline-flex items-center justify-center shrink-0"
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

      {/* Main Floor Plan Canvas Viewport */}
      <main
        ref={containerRef}
        id="camera-transition-canvas-area"
        className="flex-1 min-h-0 relative overflow-hidden flex items-center justify-center p-2 sm:p-2.5 mb-[calc(64px+env(safe-area-inset-bottom,0px))] sm:mb-[calc(68px+env(safe-area-inset-bottom,0px))]"
      >
        {/* Virtual Museum Map Stage
            Forward Transition: Camera moves from Gallery 02 (0, 0) to Gallery 03 (targetOffsetX, targetOffsetY),
            smoothly zooming so corridor openings match seamlessly at the connection, landing at 100% scale.
            Reverse Transition: Camera moves from Gallery 03 (targetOffsetX, targetOffsetY) back to Gallery 02 (0, 0).
            Both maps stay in their fixed world-space positions.
        */}
        <motion.div
          id="camera-virtual-stage"
          initial={{ x: initialStageX, y: initialStageY, scale: initialStageScale }}
          animate={{ x: targetStageX, y: targetStageY, scale: targetStageScale }}
          transition={{
            duration: 0.96,
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
          {/* Panel 1: Gallery 02 Map & Markers (Fixed Origin: 0, 0)
              If forward (G02 -> G03), G02 softly fades out during the final ~240ms of easing.
              If reverse (G03 -> G02), G02 is the destination and remains 100% visible throughout.
          */}
          <motion.div
            id="panel-gallery-02"
            initial={{ opacity: 1 }}
            animate={isReverse ? { opacity: 1 } : { opacity: [1, 1, 0] }}
            transition={
              isReverse
                ? { duration: 0.96 }
                : { duration: 0.96, times: [0, 0.72, 1], ease: 'easeOut' }
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

                {/* G02 Star Points */}
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

                {/* G02 Puzzle Points */}
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

          {/* Panel 2: Gallery 03 Map & Markers
              Fixed world position: exactly opposite the Gallery 02 forward arrow.
              If forward (G02 -> G03), G03 is the destination and remains 100% visible throughout.
              During G02 -> G03, G03 starts at 101.3% (scale: 1.013) and smoothly scales down to 100% (scale: 1.0)
              anchored to its center so that the corridor connection matches visually.
              If reverse (G03 -> G02), G03 softly fades out during the final ~240ms of easing.
          */}
          <motion.div
            id="panel-gallery-03"
            initial={{ opacity: 1 }}
            animate={isReverse ? { opacity: [1, 1, 0] } : { opacity: 1 }}
            transition={
              isReverse
                ? { duration: 0.96, times: [0, 0.72, 1], ease: 'easeOut' }
                : { duration: 0.96 }
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
            <motion.div
              initial={isReverse ? { scale: 1 } : { scale: 1.013 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.85,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              style={{
                ...(g03Dim
                  ? { width: `${g03Dim.width}px`, height: `${g03Dim.height}px` }
                  : { width: '100%', height: 'auto' }),
                aspectRatio: `${G03_MAP_WIDTH} / ${G03_MAP_HEIGHT}`,
                maxWidth: '100%',
                maxHeight: '100%',
                transformOrigin: 'center center',
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
                      galleryId="gallery_04"
                      mapWidth={G03_MAP_WIDTH}
                      mapHeight={G03_MAP_HEIGHT}
                      scaleFactor={1.12}
                      onOpenDiscoveryModal={() => {}}
                    />
                  ))}

                {/* G03 Experience Points */}
                {g03ExpPoints.map((exp) => (
                  <ExperiencePoint
                    key={exp.id}
                    id={exp.id}
                    experienceId={exp.experienceId}
                    galleryId={exp.galleryId || 'gallery_04'}
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
            </motion.div>
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
