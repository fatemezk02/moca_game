import React, { useState, useEffect } from 'react';
import { MuseumCollection, MapDisplayMode } from '../types';
import { NavigationLight, formatGalleryLabelFa } from './NavigationLight';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import { AdminIconPoint, AdminCollectionPoint, AdminArrowPoint } from '../types/admin';
import { CustomIconRender } from './CustomIconRender';
import { CollectionPointMarker } from './CollectionPointMarker';
import { NavigationArrowRender } from './NavigationArrowRender';
import { Gallery00MapSvg } from './Gallery00MapSvg';
import { StarPoint, StarLabel } from './StarPoint';
import { isArrowVisibleToPlayer, markArrowUsed, isArrowUsed } from '../data/arrowConditionsStore';
import { getCurrentGalleryId, setCurrentGalleryId } from '../data/playerLocationStore';
import { getLocationPinsVisible } from '../data/locationPinsVisibilityStore';
import { getLampPositionForGallery, getAllGalleryLamps, getAllGalleryLocks, getLockPositionForGallery, DEFAULT_GALLERY_LOCKS } from '../data/galleryAreasStore';
import { isGalleryReached, markGalleryReached, isGalleryManuallyUnlocked } from '../data/reachedGalleriesStore';
import { isGalleryPuzzleCompleted } from '../data/puzzleProgressStore';
import { GalleryLockIndicator } from './GalleryLockIndicator';
import { GalleryLockModal } from './GalleryLockModal';
import { normalizeGalleryId, formatTwoDigitPersian } from '../services/content/mappers';
import { useFitMapDimensions } from '../hooks/useFitMapDimensions';
import { LocationInfoModal } from './LocationInfoModal';
import { contentService } from '../services/content/contentService';
import { LocationContent } from '../services/content/types';

interface MuseumFloorPlanProps {
  collections: MuseumCollection[];
  selectedCollection: MuseumCollection | null;
  onSelectCollection: (collection: MuseumCollection) => void;
  onClearSelection: () => void;
  zoomScale: number;
  onZoomChange: (newScale: number) => void;
  onNavigateToGallery01?: () => void;
  onNavigateToQuestions?: () => void;
  onNavigateToGallery?: (
    galleryId: 'gallery-00' | 'gallery-01' | 'gallery-03' | 'gallery-01-questions' | 'gallery-03-questions'
  ) => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
  mapMode?: MapDisplayMode;
  onOpenStarDiscovery?: (starPointId: string) => void;
}

export const MuseumFloorPlan: React.FC<MuseumFloorPlanProps> = ({
  collections,
  selectedCollection,
  onSelectCollection,
  onClearSelection,
  zoomScale,
  onZoomChange,
  onNavigateToGallery01,
  onNavigateToQuestions,
  onNavigateToGallery,
  onSelectTab,
  mapMode = 'normal',
  onOpenStarDiscovery,
}) => {
  const { containerRef, dimensions } = useFitMapDimensions(604.8, 844.86);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [selectedStarPointId, setSelectedStarPointId] = useState<string | null>(null);
  const [selectedLocationPinId, setSelectedLocationPinId] = useState<string | null>(null);
  const [selectedLockGallery, setSelectedLockGallery] = useState<{ galleryId: string; title: string } | null>(null);
  const [selectedLocationModalData, setSelectedLocationModalData] = useState<LocationContent | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [adminPoints, setAdminPoints] = useState(() => getGalleryPoints('gallery-00'));
  const [adminArrows, setAdminArrows] = useState(() => getGalleryArrows('gallery-00'));
  const [playerGalleryId, setPlayerGalleryId] = useState<string>(() => getCurrentGalleryId());
  const [galleryAreasVer, setGalleryAreasVer] = useState(0);
  const [areLocationPinsVisible, setAreLocationPinsVisible] = useState<boolean>(() => getLocationPinsVisible());
  const [locationAnimKey, setLocationAnimKey] = useState(0);

  const handleLockClick = (galleryId: string, title?: string) => {
    setSelectedLockGallery({ galleryId, title: title || formatGalleryLabelFa(galleryId) });
  };

  // Listen to point updates from Admin
  useEffect(() => {
    const handleUpdate = () => {
      setAdminPoints(getGalleryPoints('gallery-00'));
    };
    window.addEventListener('museum_points_updated', handleUpdate);
    return () => window.removeEventListener('museum_points_updated', handleUpdate);
  }, []);

  // Listen to location pin visibility toggle event
  useEffect(() => {
    const handleVisUpdate = (e: any) => {
      const isVis = typeof e?.detail?.visible === 'boolean' ? e.detail.visible : getLocationPinsVisible();
      setAreLocationPinsVisible(isVis);
      if (isVis) {
        setLocationAnimKey(Date.now());
      }
    };
    window.addEventListener('museum_location_pins_visibility_changed', handleVisUpdate);
    return () => window.removeEventListener('museum_location_pins_visibility_changed', handleVisUpdate);
  }, []);

  // Listen to player location and gallery area updates
  useEffect(() => {
    const handleLocUpdate = (e: any) => {
      if (e?.detail?.currentGalleryId) {
        setPlayerGalleryId(e.detail.currentGalleryId);
      } else {
        setPlayerGalleryId(getCurrentGalleryId());
      }
    };
    const handleAreasUpdate = () => {
      setGalleryAreasVer((v) => v + 1);
    };

    window.addEventListener('museum_player_location_updated', handleLocUpdate);
    window.addEventListener('museum_gallery_areas_updated', handleAreasUpdate);
    window.addEventListener('museum_lamp_position_updated', handleAreasUpdate);
    window.addEventListener('museum_lock_position_updated', handleAreasUpdate);
    window.addEventListener('museum_gallery_reached', handleAreasUpdate);
    window.addEventListener('museum_game_fully_reset', handleAreasUpdate);
    window.addEventListener('museum_player_progress_updated', handleAreasUpdate);
    window.addEventListener('museum_puzzle_progress_updated', handleAreasUpdate);
    window.addEventListener('museum_completed_gallery_puzzles_updated', handleAreasUpdate);

    return () => {
      window.removeEventListener('museum_player_location_updated', handleLocUpdate);
      window.removeEventListener('museum_gallery_areas_updated', handleAreasUpdate);
      window.removeEventListener('museum_lamp_position_updated', handleAreasUpdate);
      window.removeEventListener('museum_lock_position_updated', handleAreasUpdate);
      window.removeEventListener('museum_gallery_reached', handleAreasUpdate);
      window.removeEventListener('museum_game_fully_reset', handleAreasUpdate);
      window.removeEventListener('museum_player_progress_updated', handleAreasUpdate);
      window.removeEventListener('museum_puzzle_progress_updated', handleAreasUpdate);
      window.removeEventListener('museum_completed_gallery_puzzles_updated', handleAreasUpdate);
    };
  }, []);

  // Listen to arrow and progress updates
  useEffect(() => {
    const handleArrowsUpdate = () => {
      setAdminArrows(getGalleryArrows('gallery-00'));
    };
    window.addEventListener('museum_arrows_updated', handleArrowsUpdate);
    window.addEventListener('museum_used_arrows_updated', handleArrowsUpdate);
    window.addEventListener('museum_player_progress_updated', handleArrowsUpdate);
    window.addEventListener('museum_puzzle_progress_updated', handleArrowsUpdate);
    window.addEventListener('museum_answered_questions_updated', handleArrowsUpdate);

    return () => {
      window.removeEventListener('museum_arrows_updated', handleArrowsUpdate);
      window.removeEventListener('museum_used_arrows_updated', handleArrowsUpdate);
      window.removeEventListener('museum_player_progress_updated', handleArrowsUpdate);
      window.removeEventListener('museum_puzzle_progress_updated', handleArrowsUpdate);
      window.removeEventListener('museum_answered_questions_updated', handleArrowsUpdate);
    };
  }, []);

  // Reset pan when scale resets
  useEffect(() => {
    if (zoomScale === 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoomScale]);

  // Touch / Mouse Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if left click on background
    if (e.button !== 0) return;
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // Cap pan limits based on zoom
    const maxPan = (zoomScale - 1) * 450 + 250;
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY)),
    });
    setHasMoved(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setHasMoved(false);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    const maxPan = (zoomScale - 1) * 450 + 250;
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY)),
    });
    setHasMoved(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Helper to resolve standard Location Pin labels
  const getLocationPinLabel = (point: { id?: string; iconType?: string; title?: string }): string => {
    // Check if dynamic content from Location table exists
    const locData =
      (point.id ? contentService.getLocationById(point.id) : null) ||
      (point.iconType ? contentService.getLocationById(point.iconType) : null);
    if (locData?.name?.trim()) {
      return locData.name.trim();
    }

    const iconType = point.iconType || '';
    const id = (point.id || '').toLowerCase();
    const title = (point.title || '').toLowerCase();

    // Location labels:
    // - Cafe → "کافه"
    // - Museum Shop → "فروشگاه"
    // - Sculpture Garden → "باغ مجسمه ها"
    // - Oil Pool → "حوض روغن"
    if (id === 'icon-g00-entrance-to-g01' || id === 'icon-g00-to-g01' || title.includes('Entrance to Gallery 01') || title.includes('ورودی گالری ۰۱')) {
      return 'ورودی گالری ۰۱';
    }
    if (iconType === 'preset-location-coffee' || id.includes('cafe') || id.includes('coffee') || title.includes('کافه')) {
      return 'کافه';
    }
    if (iconType === 'preset-location-shop' || id.includes('shop') || title.includes('فروشگاه')) {
      return 'فروشگاه';
    }
    if (iconType === 'preset-location-tree' || id.includes('tree') || id.includes('garden') || title.includes('باغ')) {
      return 'باغ مجسمه ها';
    }
    if (iconType === 'preset-location-frame' || id.includes('frame') || id.includes('oil') || id.includes('pool') || title.includes('روغن')) {
      return 'قاب معرفی آثار';
    }
    if (iconType === 'preset-location-wc' || id.includes('wc') || title.includes('دسشویی') || title.includes('دستشویی') || title.includes('بهداشتی')) {
      return 'سرویس بهداشتی (WC)';
    }
    if (iconType === 'preset-location-library' || id.includes('library') || title.includes('کتابخانه')) {
      return 'کتابخانه تخصصی';
    }
    if (iconType === 'preset-location-entrance' || id.includes('entrance') || title.includes('ورود') || title.includes('ورودی')) {
      return 'درب ورودی';
    }
    if (iconType === 'preset-location-cinema' || id.includes('cinema') || title.includes('سینما')) {
      return 'سینماتک';
    }
    if (iconType.startsWith('preset-location-gallery-')) {
      const num = parseInt(iconType.replace('preset-location-gallery-', ''), 10);
      return !isNaN(num) ? `گالری ${formatTwoDigitPersian(num)}` : 'گالری';
    }
    if (iconType === 'preset-location-gallery') {
      return point.title || 'گالری';
    }

    return point.title || '';
  };

  // Close location info popup and reset selection
  const handleCloseLocationModal = () => {
    setIsLocationModalOpen(false);
    setSelectedLocationModalData(null);
    setSelectedLocationPinId(null);
  };

  // Handle click on dynamic arrow overlay
  const handleArrowClick = (arrow: AdminArrowPoint, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setSelectedLocationPinId(null);
    if (!isArrowVisibleToPlayer(arrow) || isArrowUsed(arrow.id)) {
      return;
    }
    if (!arrow.destination || arrow.destination === 'none') {
      return;
    }

    // Mark arrow as used so it disappears from source map
    markArrowUsed(arrow.id);

    if (arrow.destination === 'gallery-01') {
      setCurrentGalleryId('gallery-01');
      if (onNavigateToGallery) {
        onNavigateToGallery('gallery-01');
      } else {
        onNavigateToGallery01?.();
      }
    } else if (arrow.destination === 'gallery-03') {
      setCurrentGalleryId('gallery-03');
      onNavigateToGallery?.('gallery-03');
    } else if (arrow.destination === 'gallery-00') {
      // Stay on Gallery 00
      setCurrentGalleryId('gallery-00');
      return;
    } else if (arrow.destination === 'gallery-01-questions') {
      setCurrentGalleryId('gallery-01');
      if (onNavigateToGallery) {
        onNavigateToGallery('gallery-01-questions');
      } else {
        onNavigateToQuestions?.();
      }
    } else if (arrow.destination === 'gallery-03-questions') {
      setCurrentGalleryId('gallery-03');
      onNavigateToGallery?.('gallery-03-questions');
    } else if (
      arrow.destination === 'collection' ||
      arrow.destination === 'tasks' ||
      arrow.destination === 'curator'
    ) {
      onSelectTab?.(arrow.destination);
    }
  };

  // Handle click on dynamic icon point
  const handleIconPointClick = (iconPoint: AdminIconPoint, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const isLocationPin = iconPoint.iconType?.startsWith('preset-location-') || iconPoint.type === 'icon';
    if (isLocationPin) {
      onClearSelection();
      setSelectedStarPointId(null);

      const targetLocId = iconPoint.locationId || iconPoint.id;
      console.log('[LOCATION TAP] location id:', targetLocId);

      // SECOND CONSECUTIVE TAP ON THE SAME LOCATION POINT:
      if (selectedLocationPinId === iconPoint.id) {
        console.log('[LOCATION TAP] second consecutive tap:', targetLocId);
        // Query Location table from ContentService
        const locData =
          (iconPoint.locationId ? contentService.getLocationById(iconPoint.locationId) : null) ||
          contentService.getLocationById(iconPoint.id) ||
          contentService.getLocationById(iconPoint.iconType || '') ||
          contentService.getLocationById(iconPoint.title || '');

        console.log('[LOCATION DATA] matched row:', locData);
        console.log('[LOCATION DATA] active:', locData?.active);

        if (locData && locData.active !== false && (locData.name || locData.description)) {
          console.log('[LOCATION MODAL] opening:', locData.name);
          setSelectedLocationModalData(locData);
          setIsLocationModalOpen(true);
          return;
        }

        // If no matching active row exists in the Location table, keep existing Location Point behavior
        if (iconPoint.destination && iconPoint.destination !== 'gallery-00') {
          setSelectedLocationPinId(null);
          handleLampClick(iconPoint.destination);
          return;
        }
        if (iconPoint.iconType?.startsWith('preset-location-gallery-')) {
          const num = parseInt(iconPoint.iconType.replace('preset-location-gallery-', ''), 10);
          if (!isNaN(num) && num >= 1 && num <= 9) {
            setSelectedLocationPinId(null);
            handleLampClick(`gallery-0${num}`);
            return;
          }
        }
        setSelectedLocationPinId(null);
      } else {
        // FIRST TAP ON THIS LOCATION POINT:
        console.log('[LOCATION TAP] first tap:', targetLocId);
        // Keep existing behavior, do not open popup, preserve label/feedback
        setSelectedLocationPinId(iconPoint.id);
      }
      return;
    }
    setSelectedLocationPinId(null);
    if (!iconPoint.destination || iconPoint.destination === 'gallery-00') {
      // Stay on current view / active tap response
      return;
    }
    if (iconPoint.destination === 'gallery-01') {
      setCurrentGalleryId('gallery-01');
      if (onNavigateToGallery) {
        onNavigateToGallery('gallery-01');
      } else {
        onNavigateToGallery01?.();
      }
    } else if (iconPoint.destination === 'gallery-03') {
      setCurrentGalleryId('gallery-03');
      onNavigateToGallery?.('gallery-03');
    } else if (iconPoint.destination === 'gallery-01-questions') {
      setCurrentGalleryId('gallery-01');
      if (onNavigateToGallery) {
        onNavigateToGallery('gallery-01-questions');
      } else {
        onNavigateToQuestions?.();
      }
    } else if (iconPoint.destination === 'gallery-03-questions') {
      setCurrentGalleryId('gallery-03');
      onNavigateToGallery?.('gallery-03-questions');
    } else if (
      iconPoint.destination === 'collection' ||
      iconPoint.destination === 'tasks' ||
      iconPoint.destination === 'curator'
    ) {
      onSelectTab?.(iconPoint.destination);
    }
  };

  // Handle click on navigation light / lamp to enter the gallery
  const handleLampClick = (galleryId: string) => {
    if (!galleryId) return;
    const canon = normalizeGalleryId(galleryId);
    if (canon === 'gallery_00' || galleryId === 'gallery-00') return;

    let targetGid: any = 'gallery-01';
    if (canon === 'gallery_01') {
      targetGid = 'gallery-01';
    } else if (canon === 'gallery_02') {
      targetGid = 'gallery-03';
    } else if (canon === 'gallery_03') {
      targetGid = 'gallery-04';
    } else if (canon === 'gallery_04') {
      targetGid = 'gallery-05';
    } else if (canon === 'gallery_05') {
      targetGid = 'gallery-06';
    } else if (canon === 'gallery_06') {
      targetGid = 'gallery-07';
    } else if (canon === 'gallery_07') {
      targetGid = 'gallery-08';
    } else if (canon === 'gallery_08' || canon === 'gallery_09') {
      targetGid = 'gallery-09';
    } else {
      targetGid = galleryId.replace('_', '-');
    }

    setCurrentGalleryId(targetGid);
    if (onNavigateToGallery) {
      onNavigateToGallery(targetGid);
    } else if (targetGid === 'gallery-01') {
      onNavigateToGallery01?.();
    }
  };

  // Click on background closes preview unless dragging
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (hasMoved) return;
    // If target is the SVG background or container, clear selection
    const target = e.target as HTMLElement | SVGElement;
    if (
      target.id === 'museum-map-bg' ||
      target.id === 'map-svg-element' ||
      target.tagName === 'svg' ||
      target.getAttribute('data-bg') === 'true'
    ) {
      onClearSelection();
      setSelectedStarPointId(null);
      setSelectedLocationPinId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      id="museum-map-viewport"
      data-bg="true"
      onClick={handleBackgroundClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      {/* Background blueprint subtle coordinate lines */}
      <div
        data-bg="true"
        className="absolute inset-0 blueprint-grid opacity-50 pointer-events-none"
      />

      {/* Center Framing Guides */}
      <div className="absolute top-4 left-6 pointer-events-none font-mono-custom text-[10px] text-[#747878] tracking-widest hidden sm:block">
        GRID: ARCHIVE-01 / SECT-00
      </div>
      <div className="absolute top-4 right-6 pointer-events-none font-mono-custom text-[10px] text-[#747878] tracking-widest hidden sm:block">
        SCALE: 1:250 • ORIENTATION: 00° N
      </div>

      {/* Main Scalable & Pannable Container */}
      <div
        id="museum-map-transform-container"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomScale})`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
          transformOrigin: 'center center',
          ...(dimensions
            ? { width: `${dimensions.width}px`, height: `${dimensions.height}px` }
            : { width: '100%', height: '100%' }),
          aspectRatio: '604.8 / 844.86',
          maxWidth: '100%',
          maxHeight: '100%',
          ['--map-point-scale' as any]: dimensions
            ? (dimensions.width / 360).toFixed(4)
            : '1',
        }}
        className="relative mx-auto flex items-center justify-center shrink-0 select-none overflow-visible"
      >
        {/* Precise Architectural Floor Plan SVG */}
        <Gallery00MapSvg
          className="w-full h-full pointer-events-auto"
          width="100%"
          height="100%"
          style={{ transform: 'scale(1.22)', transformOrigin: 'center' }}
          mapMode={mapMode}
        >
          {/* Active Laser Guideline connecting active marker to interior */}
          {selectedCollection && (
            <g>
              <line
                x1={(selectedCollection.mapX / 100) * 604.8}
                y1={(selectedCollection.mapY / 100) * 844.86}
                x2={
                  selectedCollection.direction === 'left'
                    ? (selectedCollection.mapX / 100) * 604.8 + 40
                    : selectedCollection.direction === 'right'
                    ? (selectedCollection.mapX / 100) * 604.8 - 40
                    : (selectedCollection.mapX / 100) * 604.8
                }
                y2={
                  selectedCollection.direction === 'top'
                    ? (selectedCollection.mapY / 100) * 844.86 + 40
                    : selectedCollection.direction === 'bottom'
                    ? (selectedCollection.mapY / 100) * 844.86 - 40
                    : (selectedCollection.mapY / 100) * 844.86
                }
                stroke="#c5a059"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <circle
                cx={
                  selectedCollection.direction === 'left'
                    ? (selectedCollection.mapX / 100) * 604.8 + 40
                    : selectedCollection.direction === 'right'
                    ? (selectedCollection.mapX / 100) * 604.8 - 40
                    : (selectedCollection.mapX / 100) * 604.8
                }
                cy={
                  selectedCollection.direction === 'top'
                    ? (selectedCollection.mapY / 100) * 844.86 + 40
                    : selectedCollection.direction === 'bottom'
                    ? (selectedCollection.mapY / 100) * 844.86 - 40
                    : (selectedCollection.mapY / 100) * 844.86
                }
                r="3"
                fill="#c5a059"
              />
            </g>
          )}
        </Gallery00MapSvg>

        {/* Gallery Lamp & Lock Indicators (Hidden when Location Points are ON) */}
        {!areLocationPinsVisible && (() => {
          // Standard museum galleries 01 to 08
          const standardGalleries = [
            'gallery_01',
            'gallery_02',
            'gallery_03',
            'gallery_04',
            'gallery_05',
            'gallery_06',
            'gallery_07',
            'gallery_08',
          ];

          // 1. Determine Current Player Gallery (map player location to canonical gallery_01 .. gallery_08)
          const rawCurrent = playerGalleryId || getCurrentGalleryId();
          const normCurrent = normalizeGalleryId(rawCurrent);

          let canonPlayerId = 'gallery_01';
          if (rawCurrent === 'gallery-00' || normCurrent === 'gallery_00') {
            canonPlayerId = 'gallery_00';
          } else if (rawCurrent === 'gallery-01' || rawCurrent === 'gallery_01' || normCurrent === 'gallery_01') {
            canonPlayerId = 'gallery_01';
          } else if (rawCurrent === 'gallery-03' || rawCurrent === 'gallery-02' || rawCurrent === 'gallery_02' || normCurrent === 'gallery_02') {
            canonPlayerId = 'gallery_02';
          } else if (rawCurrent === 'gallery-04' || rawCurrent === 'gallery_03' || normCurrent === 'gallery_03') {
            canonPlayerId = 'gallery_03';
          } else if (rawCurrent === 'gallery-05' || rawCurrent === 'gallery_04' || normCurrent === 'gallery_04') {
            canonPlayerId = 'gallery_04';
          } else if (rawCurrent === 'gallery-06' || rawCurrent === 'gallery_05' || normCurrent === 'gallery_05') {
            canonPlayerId = 'gallery_05';
          } else if (rawCurrent === 'gallery-07' || rawCurrent === 'gallery_06' || normCurrent === 'gallery_06') {
            canonPlayerId = 'gallery_06';
          } else if (rawCurrent === 'gallery-08' || rawCurrent === 'gallery_07' || normCurrent === 'gallery_07') {
            canonPlayerId = 'gallery_07';
          } else if (rawCurrent === 'gallery-09' || rawCurrent === 'gallery_08' || normCurrent === 'gallery_08' || normCurrent === 'gallery_09') {
            canonPlayerId = 'gallery_08';
          }

          const isCompleted = (gid: string) => {
            const canon = normalizeGalleryId(gid);
            return (
              isGalleryPuzzleCompleted(gid) ||
              isGalleryPuzzleCompleted(canon) ||
              isGalleryPuzzleCompleted(gid.replace('_', '-'))
            );
          };

          const isReached = (gid: string) => {
            if (gid === 'gallery_01') return true;
            if (gid === 'gallery_02') {
              return isCompleted('gallery_01') || isGalleryManuallyUnlocked('gallery_02') || isGalleryManuallyUnlocked('gallery-02') || isGalleryManuallyUnlocked('gallery-01');
            }
            if (gid === 'gallery_03') {
              return isCompleted('gallery_02') || isGalleryManuallyUnlocked('gallery_03') || isGalleryManuallyUnlocked('gallery-03');
            }
            if (gid === 'gallery_04') {
              return isCompleted('gallery_03') || isGalleryManuallyUnlocked('gallery_04') || isGalleryManuallyUnlocked('gallery-04');
            }
            if (gid === 'gallery_05') {
              return isCompleted('gallery_04') || isGalleryManuallyUnlocked('gallery_05') || isGalleryManuallyUnlocked('gallery-05');
            }
            if (gid === 'gallery_06') {
              return isCompleted('gallery_05') || isGalleryManuallyUnlocked('gallery_06') || isGalleryManuallyUnlocked('gallery-06');
            }
            if (gid === 'gallery_07') {
              return isCompleted('gallery_06') || isGalleryManuallyUnlocked('gallery_07') || isGalleryManuallyUnlocked('gallery-07');
            }
            if (gid === 'gallery_08') {
              return isCompleted('gallery_07') || isGalleryManuallyUnlocked('gallery_08') || isGalleryManuallyUnlocked('gallery-08');
            }
            return false;
          };

          return (
            <>
              {standardGalleries.map((gid) => {
                const isCurrent = gid === canonPlayerId;
                const completed = isCompleted(gid);

                // CASE 1 — CURRENT GALLERY:
                // Regardless of complete or incomplete: show existing lit location indicator lamp (never green)
                if (isCurrent) {
                  const lampPos = getLampPositionForGallery(gid);
                  const lampMapX = (lampPos.x / 604.8) * 100;
                  const lampMapY = (lampPos.y / 844.86) * 100;
                  return (
                    <NavigationLight
                      key={`current-lit-lamp-${gid}`}
                      mapX={lampMapX}
                      mapY={lampMapY}
                      galleryId={gid}
                      destinationName={gid}
                      isLocationIndicator={true}
                      isUnlocked={false}
                      onNavigate={() => handleLampClick(gid)}
                    />
                  );
                }

                // CASE 2 — COMPLETED GALLERY (NOT CURRENT):
                // Show green lamp
                if (completed) {
                  const lampPos = getLampPositionForGallery(gid);
                  const lampMapX = (lampPos.x / 604.8) * 100;
                  const lampMapY = (lampPos.y / 844.86) * 100;
                  return (
                    <NavigationLight
                      key={`completed-lamp-${gid}`}
                      mapX={lampMapX}
                      mapY={lampMapY}
                      galleryId={gid}
                      destinationName={gid}
                      isLocationIndicator={false}
                      isUnlocked={true}
                      onNavigate={() => handleLampClick(gid)}
                    />
                  );
                }

                // CASE 3 — NOT CURRENT & NOT COMPLETED:
                // Show Lock (open lock if reached, closed lock if unreached)
                const lockPos = getLockPositionForGallery(gid);
                const lockMapX = (lockPos.x / 604.8) * 100;
                const lockMapY = (lockPos.y / 844.86) * 100;
                const open = isReached(gid);
                const lockDef = DEFAULT_GALLERY_LOCKS.find((l) => l.galleryId === gid);
                const title = lockDef?.title || `قفل ${gid}`;

                return (
                  <GalleryLockIndicator
                    key={`lock-${gid}`}
                    mapX={lockMapX}
                    mapY={lockMapY}
                    galleryId={gid}
                    title={title}
                    isOpen={open}
                    onClick={() => {
                      if (open) {
                        handleLampClick(gid);
                      } else {
                        handleLockClick(gid, title);
                      }
                    }}
                  />
                );
              })}
            </>
          );
        })()}


        {/* Dynamic Navigation Arrows Layer (Configured in Admin Editor) */}
        {adminArrows.map((arrow) => {
          const isEnabled = isArrowVisibleToPlayer(arrow) && !isArrowUsed(arrow.id);
          const posX = (arrow.x / 604.8) * 100;
          const posY = (arrow.y / 844.86) * 100;

          return (
            <div
              key={arrow.id}
              id={`arrow-${arrow.id}`}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
                transformOrigin: 'center center',
              }}
              className={`absolute z-30 ${isEnabled ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <NavigationArrowRender
                arrow={arrow}
                isDisabled={!isEnabled}
                isInteractive={isEnabled}
                onClick={isEnabled ? (e) => handleArrowClick(arrow, e) : undefined}
              />
            </div>
          );
        })}

        {/* Custom Icon & Location Points Layer (Coordinates relative to 604.8 x 844.86 SVG map) */}
        {areLocationPinsVisible && (() => {
          const cafePt = adminPoints.find((p) => p.id === 'icon-g00-cafe');
          const cafeSize = cafePt?.width || 32;

          const rawIcons = adminPoints
            .filter((p): p is AdminIconPoint => p.type === 'icon')
            .filter((p) => p.id !== 'icon-g00-to-g01'); // Entrance to g01 is rendered by NavigationLight

          const isGalleryLocation = (p: AdminIconPoint) =>
            Boolean(
              p.iconType?.startsWith('preset-location-gallery') ||
              (p.galleryNumber !== undefined && p.galleryNumber !== null)
            );

          const getGalleryNum = (p: AdminIconPoint): number => {
            if (typeof p.galleryNumber === 'number') return p.galleryNumber;
            if (p.galleryNumber) {
              const parsed = parseInt(String(p.galleryNumber), 10);
              if (!isNaN(parsed)) return parsed;
            }
            if (p.iconType?.startsWith('preset-location-gallery-')) {
              const parsed = parseInt(p.iconType.replace('preset-location-gallery-', ''), 10);
              if (!isNaN(parsed)) return parsed;
            }
            return 999;
          };

          const galleryIcons = rawIcons
            .filter(isGalleryLocation)
            .sort((a, b) => getGalleryNum(a) - getGalleryNum(b));
          const otherIcons = rawIcons.filter((p) => !isGalleryLocation(p));
          const orderedIcons = [...galleryIcons, ...otherIcons];

          return orderedIcons.map((iconPoint) => {
              const posX = (iconPoint.x / 604.8) * 100;
              const posY = (iconPoint.y / 844.86) * 100;
              const isLocationPin = iconPoint.iconType?.startsWith('preset-location-') || iconPoint.type === 'icon';
              const locationLabel = getLocationPinLabel(iconPoint);
              const isLabelOpen = selectedLocationPinId === iconPoint.id;
              const isGallery = isGalleryLocation(iconPoint);
              const otherIdx = isGallery ? -1 : otherIcons.indexOf(iconPoint);
              const animDelay = isGallery ? 0 : Number((otherIdx * 0.08).toFixed(2));

              return (
                <div
                  key={`${iconPoint.id}-${locationAnimKey}`}
                  id={`icon-point-${iconPoint.id}`}
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
                    transformOrigin: 'center center',
                    zIndex: isLabelOpen ? 60 : 30,
                  }}
                  className={`absolute pointer-events-auto ${isLabelOpen ? 'z-[60]' : 'z-30'}`}
                >
                  <div
                    className={`relative ${
                      locationAnimKey > 0
                        ? isGallery
                          ? 'animate-gallery-pulse origin-center'
                          : 'animate-quick-grow origin-center'
                        : ''
                    }`}
                    style={{
                      animationDelay: locationAnimKey > 0 ? `${animDelay}s` : undefined,
                    }}
                  >
                    {locationAnimKey > 0 && !isGallery && (
                      <span
                        className="absolute inset-0 rounded-full border-2 border-[#f59e0b] animate-location-burst-ring pointer-events-none"
                        style={{
                          animationDelay: `${animDelay}s`,
                        }}
                      />
                    )}
                    <button
                      onClick={(e) => handleIconPointClick(iconPoint, e)}
                      aria-label={locationLabel || iconPoint.title}
                      title={locationLabel || iconPoint.title}
                      className="relative group flex items-center justify-center cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <CustomIconRender
                        point={
                          isLocationPin
                            ? { ...iconPoint, width: cafeSize, height: cafeSize }
                            : iconPoint
                        }
                      />
                    </button>

                    {/* Reused Star label component directly BELOW the Location Pin */}
                    {isLocationPin && !!locationLabel && (
                      <StarLabel
                        id={iconPoint.id}
                        labelText={locationLabel}
                        isOpen={isLabelOpen}
                        placement="bottom"
                        leftPercent={posX}
                        onClick={(e) => {
                          handleIconPointClick(iconPoint, e);
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            });
        })()}

        {/* Clickable Marker Nodes Layer */}
        {collections
          .filter((col) => !['col-02', 'col-04', 'col-05', 'col-07'].includes(col.id))
          .map((col) => {
          const isSelected = selectedCollection?.id === col.id;
          const isCenterMonolith = col.id === 'col-05';
          
          // Match with admin point coordinates if customized
          const adminPt = adminPoints.find((p) => p.id === col.id && p.type === 'collection');

          if (adminPt?.pointType === 'star') {
            const ptX = adminPt ? adminPt.x : (col.mapX / 100) * 604.8;
            const ptY = adminPt ? adminPt.y : (col.mapY / 100) * 844.86;
            return (
              <StarPoint
                key={col.id}
                id={col.id}
                starId={adminPt?.starId || col.id}
                x={ptX}
                y={ptY}
                title={col.title}
                galleryId="gallery-00"
                mapWidth={604.8}
                mapHeight={844.86}
                isSelected={selectedStarPointId === col.id}
                onSelect={() => {
                  onClearSelection();
                  setSelectedLocationPinId(null);
                  setSelectedStarPointId(col.id);
                }}
                onOpenDiscoveryModal={(starId) => {
                  onClearSelection();
                  setSelectedLocationPinId(null);
                  setSelectedStarPointId(null);
                  if (onOpenStarDiscovery) {
                    onOpenStarDiscovery(starId);
                  }
                }}
              />
            );
          }

          const posX = adminPt ? (adminPt.x / 604.8) * 100 : col.mapX;
          const posY = adminPt ? (adminPt.y / 844.86) * 100 : col.mapY;

          return (
            <div
              key={col.id}
              id={`marker-${col.id}`}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
                transformOrigin: 'center center',
              }}
              className="absolute z-30 pointer-events-auto"
            >
              {/* Touch Target Expander (44x44px for accessibility) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLocationPinId(null);
                  onSelectCollection(col);
                }}
                aria-label={`Select ${col.roomCode}: ${col.title}`}
                className="w-11 h-11 -m-3 flex items-center justify-center cursor-pointer group focus:outline-none"
              >
                {isCenterMonolith ? (
                  /* Center Monolith Node (Playful Comic Square with drop shadow) */
                  <div
                    className={`relative w-5 h-5 rounded-md transition-transform duration-200 ${
                      isSelected
                        ? 'scale-125 ring-2 ring-[#f59e0b] shadow-[3px_3px_0px_#1e1b18]'
                        : 'group-hover:scale-110 shadow-[2px_2px_0px_#1e1b18]'
                    } bg-[#fbbf24] border-2 border-[#1e1b18] flex items-center justify-center`}
                  >
                    <div className="w-1.5 h-1.5 rounded-xs bg-[#1e1b18]"></div>
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-lg border-2 border-[#f59e0b] animate-ping opacity-75"></span>
                    )}
                  </div>
                ) : (
                  /* Standard Wing / Wall Markers (Playful Comic Pin Tokens) */
                  <div className="relative flex items-center justify-center">
                    {/* Outer Pin Circle */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 border-[#1e1b18] flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#ef4444] text-white shadow-[3px_3px_0px_#1e1b18] scale-125'
                          : 'bg-[#fef08a] shadow-[2px_2px_0px_#1e1b18] group-hover:bg-[#f59e0b]'
                      }`}
                    >
                      {/* Inner Dot */}
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isSelected
                            ? 'bg-white'
                            : 'bg-[#1e1b18]'
                        }`}
                      />
                    </div>

                    {/* Room Code Badge Pill */}
                    <div
                      className={`absolute top-5.5 font-sans-custom text-[10px] font-black px-1.5 py-0.2 rounded-md border-1.5 border-[#1e1b18] whitespace-nowrap transition-all duration-200 pointer-events-none ${
                        isSelected
                          ? 'bg-[#1e1b18] text-white shadow-[2px_2px_0px_#1e1b18] translate-y-0 opacity-100'
                          : 'bg-[#ffffff] text-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] opacity-90 group-hover:opacity-100 group-hover:bg-[#fef3c7]'
                      }`}
                    >
                      {col.roomCode}
                    </div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Lock Click Popup Modal */}
      <GalleryLockModal
        lockGallery={selectedLockGallery}
        onClose={() => setSelectedLockGallery(null)}
        onUnlockSuccess={(targetId) => {
          setSelectedLockGallery(null);
          handleLampClick(targetId);
        }}
        onNavigateToCurrent={(currentGid) => {
          setSelectedLockGallery(null);
          handleLampClick(currentGid);
        }}
      />

      {/* Location Point Info Popup Modal */}
      <LocationInfoModal
        isOpen={isLocationModalOpen}
        onClose={handleCloseLocationModal}
        location={selectedLocationModalData}
      />
    </div>
  );
};
