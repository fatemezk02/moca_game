import React from 'react';
import { ArrowLeft, Map } from 'lucide-react';
import { BottomNavBar } from './BottomNavBar';
import { PlayerStatusBar } from './PlayerStatusBar';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useFitMapDimensions } from '../hooks/useFitMapDimensions';
import { contentService } from '../services/content/contentService';
import { formatTwoDigitPersian } from '../services/content/mappers';

export interface SharedGalleryPageLayoutProps {
  galleryId: string;
  galleryNumberPersian?: string;
  galleryNamePersian?: string;
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
  onClickOutside?: () => void;
  mapSvg: React.ReactNode;
  mapWidth?: number;
  mapHeight?: number;
  children?: React.ReactNode;
  modals?: React.ReactNode;
}

/**
 * Shared reusable visual layout shell for all individual museum gallery pages.
 * Enforces unified:
 * - background styling (#fbf9f9)
 * - header with back button, gallery number, and badge
 * - compact player status bar
 * - centered responsive map container with consistent aspect ratio
 * - floating circular map toggle button
 * - persistent bottom navigation bar
 */
export const SharedGalleryPageLayout: React.FC<SharedGalleryPageLayoutProps> = ({
  galleryId,
  galleryNumberPersian,
  galleryNamePersian,
  onNavigateBack,
  onSelectTab,
  onClickOutside,
  mapSvg,
  mapWidth = 848,
  mapHeight = 1264,
  children,
  modals,
}) => {
  const playerStats = usePlayerStats();
  const galleryRecord = contentService.getGalleryById(galleryId);
  const { containerRef, dimensions } = useFitMapDimensions(mapWidth, mapHeight, 1.4);

  const numFa =
    galleryNumberPersian ||
    formatTwoDigitPersian(
      galleryRecord?.galleryNumber || (galleryId ? galleryId.replace('gallery-', '') : '01')
    );
  const nameFa = galleryNamePersian || galleryRecord?.nameFa?.trim() || '';

  return (
    <div
      id={`${galleryId}-view-root`}
      className="user-facing-app h-screen w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom select-none"
      onClick={onClickOutside}
    >
      {/* Top App Bar Header */}
      <header
        id={`${galleryId}-top-bar`}
        dir="ltr"
        className="bg-gradient-to-b from-[#fdfcfb] to-[#f7f4ee] border-b border-[#e2dcd2] shadow-xs flex justify-between items-center px-4 sm:px-6 py-3 z-40 relative select-none shrink-0"
      >
        {/* Left Action (Back Arrow to Gallery 00) */}
        <button
          id={`${galleryId}-back-btn`}
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
            گالری {numFa}
          </h1>
          {nameFa && (
            <span className="font-mono-custom text-[9px] px-2 py-0.5 bg-[#fef9c3] text-[#854d0e] border border-[#fde68a] tracking-wider rounded-md font-bold">
              {nameFa}
            </span>
          )}
        </div>

        {/* Right Spacer to keep center alignment */}
        <div className="w-9 h-9" aria-hidden="true" />
      </header>

      {/* Compact Player Status Bar */}
      <PlayerStatusBar stars={playerStats.stars} coins={playerStats.coins} />

      {/* Main Floor Plan Canvas - Available Viewport between Header and Bottom Nav */}
      <main
        ref={containerRef}
        id={`${galleryId}-canvas-area`}
        className="flex-1 min-h-0 relative overflow-hidden flex items-center justify-center p-3 sm:p-5 mb-16 sm:mb-[68px]"
      >
        <div
          style={{
            ...(dimensions
              ? { width: `${dimensions.width}px`, height: `${dimensions.height}px` }
              : { width: '100%', height: '100%' }),
            aspectRatio: `${mapWidth} / ${mapHeight}`,
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

      {/* Bottom Right Floating Circular Toggle Button to return to Gallery 00 */}
      <div
        id={`${galleryId}-floating-controls`}
        className="absolute bottom-20 right-4 sm:right-6 z-30 flex items-center justify-center select-none"
      >
        <button
          id={`btn-${galleryId}-toggle-map`}
          onClick={onNavigateBack}
          aria-label="بازگشت به نقشه اصلی (گالری ۰۰)"
          title="بازگشت به نقشه اصلی (گالری ۰۰)"
          className="w-12 h-12 rounded-full border border-[#0e0f0f] bg-[#fbf9f9] text-[#0e0f0f] hover:bg-[#0e0f0f] hover:text-[#fbf9f9] active:scale-95 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none"
        >
          <Map className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
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

      {/* Modals & Popups */}
      {modals}
    </div>
  );
};
