import React, { useState, useEffect } from 'react';
import { MuseumCollection, MapDisplayMode } from '../types';
import { NavigationLight } from './NavigationLight';
import { getGalleryPoints, getGalleryArrows } from '../data/mapConfig';
import { AdminIconPoint, AdminCollectionPoint, AdminArrowPoint } from '../types/admin';
import { CustomIconRender } from './CustomIconRender';
import { CollectionPointMarker } from './CollectionPointMarker';
import { NavigationArrowRender } from './NavigationArrowRender';
import { Gallery00MapSvg } from './Gallery00MapSvg';
import { StarPoint } from './StarPoint';
import { isArrowVisibleToPlayer, markArrowUsed } from '../data/arrowConditionsStore';
import { getCurrentGalleryId, setCurrentGalleryId } from '../data/playerLocationStore';
import { getLampPositionForGallery } from '../data/galleryAreasStore';
import { useFitMapDimensions } from '../hooks/useFitMapDimensions';

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
  const [adminPoints, setAdminPoints] = useState(() => getGalleryPoints('gallery-00'));
  const [adminArrows, setAdminArrows] = useState(() => getGalleryArrows('gallery-00'));
  const [playerGalleryId, setPlayerGalleryId] = useState<string>(() => getCurrentGalleryId());
  const [galleryAreasVer, setGalleryAreasVer] = useState(0);

  // Listen to point updates from Admin
  useEffect(() => {
    const handleUpdate = () => {
      setAdminPoints(getGalleryPoints('gallery-00'));
    };
    window.addEventListener('museum_points_updated', handleUpdate);
    return () => window.removeEventListener('museum_points_updated', handleUpdate);
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

    return () => {
      window.removeEventListener('museum_player_location_updated', handleLocUpdate);
      window.removeEventListener('museum_gallery_areas_updated', handleAreasUpdate);
      window.removeEventListener('museum_lamp_position_updated', handleAreasUpdate);
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

  // Handle click on dynamic arrow overlay
  const handleArrowClick = (arrow: AdminArrowPoint, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
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
        }}
        className="relative mx-auto flex items-center justify-center shrink-0 select-none overflow-visible"
      >
        {/* Precise Architectural Floor Plan SVG */}
        <Gallery00MapSvg
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

        {/* Dynamic Player Location Lamp Indicator (Resolves to player's current gallery area) */}
        {(() => {
          const activeLampPos = getLampPositionForGallery(playerGalleryId);
          const lampMapX = (activeLampPos.x / 604.8) * 100;
          const lampMapY = (activeLampPos.y / 844.86) * 100;
          return (
            <NavigationLight
              mapX={lampMapX}
              mapY={lampMapY}
              galleryId={playerGalleryId}
              destinationName={playerGalleryId}
              isLocationIndicator={true}
            />
          );
        })()}

        {/* Dynamic Navigation Arrows Layer (Configured in Admin Editor) */}
        {adminArrows.filter(isArrowVisibleToPlayer).map((arrow) => {
          const posX = (arrow.x / 604.8) * 100;
          const posY = (arrow.y / 844.86) * 100;

          return (
            <div
              key={arrow.id}
              id={`arrow-${arrow.id}`}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-30 pointer-events-auto"
            >
              <NavigationArrowRender
                arrow={arrow}
                isInteractive={true}
                onClick={(e) => handleArrowClick(arrow, e)}
              />
            </div>
          );
        })}

        {/* Custom Icon & Location Points Layer (Coordinates relative to 604.8 x 844.86 SVG map) */}
        {adminPoints
          .filter((p): p is AdminIconPoint => p.type === 'icon')
          .filter((p) => p.id !== 'icon-g00-to-g01') // Entrance to g01 is rendered by NavigationLight
          .map((iconPoint) => {
            const posX = (iconPoint.x / 604.8) * 100;
            const posY = (iconPoint.y / 844.86) * 100;
            const isLocationPin = iconPoint.iconType?.startsWith('preset-location-');

            return (
              <div
                key={iconPoint.id}
                id={`icon-point-${iconPoint.id}`}
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: isLocationPin ? 'translate(-50%, -100%)' : 'translate(-50%, -50%)',
                }}
                className="absolute z-30 pointer-events-auto"
              >
                <button
                  onClick={(e) => handleIconPointClick(iconPoint, e)}
                  aria-label={iconPoint.title}
                  title={iconPoint.title}
                  className="relative group flex items-center justify-center cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <CustomIconRender point={iconPoint} />
                </button>
              </div>
            );
          })}

        {/* Clickable Marker Nodes Layer */}
        {collections.map((col) => {
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
                  setSelectedStarPointId(col.id);
                }}
                onOpenDiscoveryModal={(starId) => {
                  onClearSelection();
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
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-30 pointer-events-auto"
            >
              {/* Touch Target Expander (44x44px for accessibility) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
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
    </div>
  );
};
