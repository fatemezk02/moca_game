import React, { useState, useEffect } from 'react';
import { ArrowLeft, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNavBar } from './BottomNavBar';
import { PlayerStatusBar } from './PlayerStatusBar';
import { GalleryFloatingActions } from './GalleryFloatingActions';
import { GalleryInfoModal } from './GalleryInfoModal';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFitMapDimensions } from '../hooks/useFitMapDimensions';
import { contentService } from '../services/content/contentService';
import { formatTwoDigitPersian, normalizeGalleryId } from '../services/content/mappers';
import {
  getLocationPinsVisible,
  toggleLocationPinsVisible,
} from '../data/locationPinsVisibilityStore';
import { markCollectionsAsViewed } from '../data/collectionNotificationStore';
import { ProfileAvatar } from './ProfileAvatar';
import { getUserProfile, UserProfile } from '../data/userProfileStore';

export interface SharedGalleryPageLayoutProps {
  galleryId: string;
  galleryNumberPersian?: string;
  galleryNamePersian?: string;
  additionalHeaderTitles?: string[];
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
  onClickOutside?: () => void;
  mapSvg: React.ReactNode;
  mapWidth?: number;
  mapHeight?: number;
  children?: React.ReactNode;
  modals?: React.ReactNode;
  onOpenGuide?: () => void;
  onTriggerNextPuzzle?: () => void;
}

const GALLERY_METADATA_MAP: Record<string, { num: string; name: string }> = {
  'gallery-01': { num: '۰۱', name: 'کیمیای نور' },
  'gallery_01': { num: '۰۱', name: 'کیمیای نور' },
  'gallery-02': { num: '۰۲', name: 'آلبوم‌های دیپلماتیک' },
  'gallery_02': { num: '۰۲', name: 'آلبوم‌های دیپلماتیک' },
  'gallery-03': { num: '۰۳', name: 'ثبت دوام ما' },
  'gallery_03': { num: '۰۳', name: 'ثبت دوام ما' },
  'gallery-04': { num: '۰۴', name: 'ضرب آهنگ شهر' },
  'gallery_04': { num: '۰۴', name: 'ضرب آهنگ شهر' },
  'gallery-05': { num: '۰۵', name: 'در کشاکش تماشا و استیلا' },
  'gallery_05': { num: '۰۵', name: 'در کشاکش تماشا و استیلا' },
  'gallery-06': { num: '۰۶', name: 'گذر از برون به درون' },
  'gallery_06': { num: '۰۶', name: 'گذر از برون به درون' },
  'gallery-07': { num: '۰۷', name: 'آونگ زمان' },
  'gallery_07': { num: '۰۷', name: 'آونگ زمان' },
  'gallery-08': { num: '۰۸', name: 'تلاقی رسانه‌ها' },
  'gallery_08': { num: '۰۸', name: 'تلاقی رسانه‌ها' },
  'gallery-09': { num: '۰۸', name: 'تلاقی رسانه‌ها' },
  'gallery_09': { num: '۰۸', name: 'تلاقی رسانه‌ها' },
};

/**
 * Shared reusable visual layout shell for all individual museum gallery pages.
 * Enforces unified:
 * - App-style top header with amber accent strip & comic-style back button
 * - 5-second alternating title between Gallery Name and Gallery Number
 * - compact player status bar
 * - centered responsive map container with consistent aspect ratio
 * - floating circular map toggle button
 * - persistent bottom navigation bar
 */
export const SharedGalleryPageLayout: React.FC<SharedGalleryPageLayoutProps> = ({
  galleryId,
  galleryNumberPersian,
  galleryNamePersian,
  additionalHeaderTitles,
  onNavigateBack,
  onSelectTab,
  onClickOutside,
  mapSvg,
  mapWidth = 848,
  mapHeight = 1264,
  children,
  modals,
  onOpenGuide,
  onTriggerNextPuzzle,
}) => {
  const playerStats = usePlayerStats();
  const galleryRecord = contentService.getGalleryById(galleryId);
  const { containerRef, dimensions } = useFitMapDimensions(mapWidth, mapHeight);
  const [areLocationPinsVisible, setAreLocationPinsVisible] = useState<boolean>(() => getLocationPinsVisible());

  // Internal fallback state for Gallery Guide modal
  const [isInternalGuideOpen, setIsInternalGuideOpen] = useState<boolean>(false);

  const handleOpenGuide = () => {
    if (onOpenGuide) {
      onOpenGuide();
    } else {
      setIsInternalGuideOpen(true);
    }
  };

  const handleTriggerNextPuzzle = () => {
    if (onTriggerNextPuzzle) {
      onTriggerNextPuzzle();
    } else {
      window.dispatchEvent(
        new CustomEvent('museum_trigger_next_puzzle_blink', {
          detail: { galleryId },
        })
      );
    }
  };

  // Exclude Gallery 01 Master Map (main-map, gallery-00)
  const isMasterMap =
    galleryId === 'gallery-00' ||
    galleryId === 'gallery_00' ||
    galleryId === 'main-map';

  const fallback =
    GALLERY_METADATA_MAP[galleryId] ||
    GALLERY_METADATA_MAP[normalizeGalleryId(galleryId)] || { num: '۰۲', name: 'کیمیای نور' };

  const numFa =
    galleryNumberPersian ||
    (galleryRecord?.galleryNumber
      ? formatTwoDigitPersian(galleryRecord.galleryNumber)
      : fallback.num);

  const nameFa = galleryNamePersian || galleryRecord?.nameFa?.trim() || fallback.name;

  const headerTitles = React.useMemo(() => {
    const list = [nameFa, `گالری ${numFa}`];
    if (additionalHeaderTitles && additionalHeaderTitles.length > 0) {
      list.push(...additionalHeaderTitles);
    } else if (galleryId === 'gallery-08' || galleryId === 'gallery_08') {
      list.push('گذر از برون به درون');
    }
    return list;
  }, [nameFa, numFa, additionalHeaderTitles, galleryId]);

  // 5-second interval state for cycling through header titles
  const [titleIndex, setTitleIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % headerTitles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [headerTitles.length]);

  const [profile, setProfile] = useState<UserProfile | null>(() => getUserProfile());

  useEffect(() => {
    const handleProfileUpdate = (e: any) => setProfile(e.detail);
    window.addEventListener('museum_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('museum_user_profile_updated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const handleVisUpdate = (e: any) => {
      const isVis = typeof e?.detail?.visible === 'boolean' ? e.detail.visible : getLocationPinsVisible();
      setAreLocationPinsVisible(isVis);
    };
    window.addEventListener('museum_location_pins_visibility_changed', handleVisUpdate);
    return () => window.removeEventListener('museum_location_pins_visibility_changed', handleVisUpdate);
  }, []);

  const isGallery01 =
    galleryId === 'gallery-01' ||
    galleryId === 'gallery_01' ||
    numFa === '۰۱';

  const isGallery02 =
    !isGallery01 &&
    (galleryId === 'gallery-02' ||
      galleryId === 'gallery_02' ||
      numFa === '۰۲');

  const isGallery06 =
    galleryId === 'gallery-06' ||
    galleryId === 'gallery_06' ||
    numFa === '۰۶';

  return (
    <div
      id={`${galleryId}-view-root`}
      className="user-facing-app h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom select-none"
      onClick={onClickOutside}
    >
      {/* Top App Bar Header with app visual identity & 5s alternating name/number */}
      <header
        id={`${galleryId}-top-bar`}
        dir="ltr"
        className="bg-[#ffffff] border-b-[1.25px] border-[#1e1b18] shadow-[0px_2px_0px_#1e1b18] flex flex-col w-full z-40 relative select-none pt-safe shrink-0"
      >
        {/* Top phone-style accent bar matching main TopAppBar */}
        <div className="h-[5px] w-full bg-[#f59e0b] border-b border-[#1e1b18]" />

        <div className="flex justify-between items-center px-3.5 sm:px-6 h-[56px] sm:h-[60px]">
          {/* Left Action (Back Arrow to Gallery 00 / Main Floor Plan) */}
          <button
            id={`${galleryId}-back-btn`}
            onClick={onNavigateBack}
            aria-label="بازگشت به نقشه اصلی"
            title="بازگشت به نقشه اصلی"
            className="border-2 border-[#1e1b18] rounded-xl bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] p-2 shadow-[1.5px_1.5px_0px_#1e1b18] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none inline-flex items-center justify-center cursor-pointer transition-all duration-150"
          >
            <ArrowLeft className="w-5 h-5 text-[#1e1b18]" />
          </button>

          {/* Center Title (Alternating every 5s between Header Titles) */}
          <div
            id={`${galleryId}-header-title-container`}
            className="flex items-center justify-center h-full relative px-2 overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`title-${titleIndex}-${headerTitles[titleIndex]}`}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center text-center max-w-[220px] sm:max-w-xs"
              >
                <h1
                  className={`font-sans-custom font-bold text-[#1e1b18] tracking-tight truncate ${
                    headerTitles[titleIndex]?.startsWith('گالری ')
                      ? 'text-[18px] sm:text-[20px]'
                      : 'text-[17px] sm:text-[19px]'
                  }`}
                >
                  {headerTitles[titleIndex]}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Action (Profile Avatar matching main header position and size) */}
          <button
            id={`${galleryId}-profile-btn`}
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

      {/* Main Floor Plan Canvas - Available Viewport between Header and Bottom Nav */}
      <main
        ref={containerRef}
        id={`${galleryId}-canvas-area`}
        className="flex-1 min-h-0 relative overflow-hidden flex items-center justify-center p-2 sm:p-2.5 mb-[calc(64px+env(safe-area-inset-bottom,0px))] sm:mb-[calc(68px+env(safe-area-inset-bottom,0px))]"
      >
        <div
          style={{
            ...(dimensions
              ? { width: `${dimensions.width}px`, height: `${dimensions.height}px` }
              : { width: '100%', height: 'auto' }),
            aspectRatio: `${mapWidth} / ${mapHeight}`,
            maxWidth: '100%',
            maxHeight: '100%',
            ...(isGallery01 ? { transform: 'translateX(6%)' } : {}),
            ...(isGallery02 ? { transform: 'translateX(2.2%)' } : {}),
            ...(isGallery06 ? { transform: 'translateX(-5.5%)' } : {}),
            ['--map-point-scale' as any]: dimensions
              ? (dimensions.width / 360).toFixed(4)
              : '1',
          }}
          className="relative mx-auto flex items-center justify-center shrink-0 select-none overflow-visible"
        >
          {/* Base SVG Architectural Plan */}
          {mapSvg}

          {/* Map Overlay for Interactive Points */}
          <div
            id={`${galleryId}-interactive-layer`}
            className="absolute inset-0 pointer-events-none"
          >
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Left Floating Action Button (Gallery 02 through Gallery 09) */}
      {!isMasterMap && (
        <GalleryFloatingActions
          galleryId={galleryId}
          onOpenGuide={handleOpenGuide}
          onTriggerNextPuzzle={handleTriggerNextPuzzle}
        />
      )}

      {/* Bottom Right Floating Controls */}
      <div
        id={`${galleryId}-floating-controls`}
        className="absolute bottom-20 right-4 sm:right-6 z-30 flex items-center justify-center select-none"
      >
        {/* Gallery Toggle Button to return to Gallery 00 */}
        <button
          id={`btn-${galleryId}-toggle-map`}
          onClick={onNavigateBack}
          aria-label="بازگشت به نقشه اصلی (گالری ۰۰)"
          title="بازگشت به نقشه اصلی (گالری ۰۰)"
          className="w-13 h-13 rounded-2xl border-[2.5px] border-[#1e1b18] bg-[#f59e0b] hover:bg-[#d97706] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
        >
          <Map className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="map"
        onTabChange={(tab) => {
          if (tab === 'map') {
            onNavigateBack();
          } else {
            if (tab === 'collection') {
              markCollectionsAsViewed();
            }
            onSelectTab?.(tab);
            onNavigateBack();
          }
        }}
      />

      {/* Modals & Popups */}
      {modals}

      {/* Fallback Gallery Info Modal if not handled in parent view */}
      {isInternalGuideOpen && (
        <GalleryInfoModal
          galleryId={galleryId}
          isOpen={isInternalGuideOpen}
          onClose={() => setIsInternalGuideOpen(false)}
        />
      )}
    </div>
  );
};
