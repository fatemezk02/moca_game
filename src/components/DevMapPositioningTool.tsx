import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Move,
  Check,
  X,
  Crosshair,
  Sparkles,
  Compass,
  Save,
  RotateCcw,
  Plus,
  Minus,
  HelpCircle,
  Eye,
  ChevronDown,
  Maximize2,
  Sliders,
  Layers,
} from 'lucide-react';
import {
  getGalleryMapConfig,
  getGalleryPoints,
  getGalleryPuzzlePoints,
  getGalleryArrows,
  saveGalleryPoints,
  saveGalleryPuzzlePoints,
  saveGalleryArrows,
  GALLERIES,
} from '../data/mapConfig';
import {
  getExperiencePointsForGallery,
  saveExperiencePointPosition,
} from '../data/experiencePointsConfig';
import {
  getAllGalleryLamps,
  saveGalleryLampPosition,
} from '../data/galleryAreasStore';
import {
  getCuratorFrameConfig,
  saveCuratorFrameConfig,
  resetCuratorFrameConfig,
  CURATOR_VIRTUAL_WIDTH,
  CURATOR_VIRTUAL_HEIGHT,
  CuratorFrameConfig,
} from '../data/curatorWallStore';
import { contentService } from '../services/content/contentService';
import {
  AdminMapPoint,
  AdminCollectionPoint,
  AdminPuzzlePoint,
  AdminArrowPoint,
} from '../types/admin';

export interface PanelPositionResult {
  x: number;
  y: number;
  placement: 'above' | 'below' | 'left' | 'right';
}

/**
 * Calculates a guaranteed in-viewport position for the temporary positioning controls panel.
 * Requirements:
 * - Always remain fully inside the visible viewport.
 * - Never cover or block the selected point or frame.
 * - If near the bottom: place ABOVE the point.
 * - If near the top: place BELOW the point.
 * - If near the left edge: shift toward the right.
 * - If near the right edge: shift toward the left.
 * - Safe margins from all viewport edges.
 * - If point is outside visible viewport (due to pan/scroll), anchor to nearest visible area.
 */
export function calculateSafePanelPosition({
  pointScreenX,
  pointScreenY,
  panelWidth = 310,
  panelHeight = 280,
  viewportWidth,
  viewportHeight,
  safeMargin = 12,
  pointClearance = 42,
}: {
  pointScreenX: number;
  pointScreenY: number;
  panelWidth?: number;
  panelHeight?: number;
  viewportWidth: number;
  viewportHeight: number;
  safeMargin?: number;
  pointClearance?: number;
}): PanelPositionResult {
  // 1. Clamp reference point to visible screen bounds if point is partially/completely outside
  const clampedRefX = Math.max(safeMargin + 20, Math.min(pointScreenX, viewportWidth - safeMargin - 20));
  const clampedRefY = Math.max(safeMargin + 20, Math.min(pointScreenY, viewportHeight - safeMargin - 20));

  const spaceAbove = clampedRefY - pointClearance - safeMargin;
  const spaceBelow = viewportHeight - (clampedRefY + pointClearance) - safeMargin;
  const spaceLeft = clampedRefX - pointClearance - safeMargin;
  const spaceRight = viewportWidth - (clampedRefX + pointClearance) - safeMargin;

  // 2. Decide vertical placement strategy:
  // If point is in the lower half of screen (near bottom) -> prefer ABOVE.
  // Otherwise (near top) -> prefer BELOW.
  const preferAbove = clampedRefY > viewportHeight * 0.5;

  let chosenPlacement: 'above' | 'below' | 'left' | 'right' = preferAbove ? 'above' : 'below';

  if (preferAbove) {
    if (spaceAbove < panelHeight && spaceBelow >= panelHeight) {
      chosenPlacement = 'below';
    } else if (spaceAbove < panelHeight && spaceBelow < panelHeight) {
      // Very short screen/landscape: fallback to horizontal placement
      if (spaceRight >= panelWidth) {
        chosenPlacement = 'right';
      } else if (spaceLeft >= panelWidth) {
        chosenPlacement = 'left';
      } else {
        chosenPlacement = spaceAbove >= spaceBelow ? 'above' : 'below';
      }
    }
  } else {
    // preferBelow
    if (spaceBelow < panelHeight && spaceAbove >= panelHeight) {
      chosenPlacement = 'above';
    } else if (spaceBelow < panelHeight && spaceAbove < panelHeight) {
      if (spaceRight >= panelWidth) {
        chosenPlacement = 'right';
      } else if (spaceLeft >= panelWidth) {
        chosenPlacement = 'left';
      } else {
        chosenPlacement = spaceBelow >= spaceAbove ? 'below' : 'above';
      }
    }
  }

  let finalX = 0;
  let finalY = 0;

  if (chosenPlacement === 'above') {
    finalY = clampedRefY - pointClearance - panelHeight;
    // Align horizontally with point center, but shift if near edges
    const idealX = clampedRefX - panelWidth / 2;
    finalX = Math.max(safeMargin, Math.min(idealX, viewportWidth - panelWidth - safeMargin));
    finalY = Math.max(safeMargin, Math.min(finalY, viewportHeight - panelHeight - safeMargin));
  } else if (chosenPlacement === 'below') {
    finalY = clampedRefY + pointClearance;
    const idealX = clampedRefX - panelWidth / 2;
    finalX = Math.max(safeMargin, Math.min(idealX, viewportWidth - panelWidth - safeMargin));
    finalY = Math.max(safeMargin, Math.min(finalY, viewportHeight - panelHeight - safeMargin));
  } else if (chosenPlacement === 'right') {
    finalX = clampedRefX + pointClearance;
    const idealY = clampedRefY - panelHeight / 2;
    finalY = Math.max(safeMargin, Math.min(idealY, viewportHeight - panelHeight - safeMargin));
    finalX = Math.max(safeMargin, Math.min(finalX, viewportWidth - panelWidth - safeMargin));
  } else {
    // 'left'
    finalX = clampedRefX - pointClearance - panelWidth;
    const idealY = clampedRefY - panelHeight / 2;
    finalY = Math.max(safeMargin, Math.min(idealY, viewportHeight - panelHeight - safeMargin));
    finalX = Math.max(safeMargin, Math.min(finalX, viewportWidth - panelWidth - safeMargin));
  }

  return {
    x: Math.round(finalX),
    y: Math.round(finalY),
    placement: chosenPlacement,
  };
}

/**
 * ============================================================================
 * DEVELOPMENT-ONLY POSITIONING MODE TOOL
 * ============================================================================
 * Allows selecting, dragging, and resizing elements in:
 * 1. LIVE Map Views: Star Points, Puzzle Points, Arrows, Experience Points, Lamps
 * 2. Curator / Collection Wall: Artwork Frames (Position, Width, Height, Scale)
 *
 * To disable or remove this tool when positioning work is complete,
 * simply change IS_DEV_POSITIONING_ENABLED to false or remove this component.
 * ============================================================================
 */
export const IS_DEV_POSITIONING_ENABLED = true;

export interface DevMapPositioningToolProps {
  currentGalleryId: string;
  activeTab?: 'map' | 'collection' | 'tasks' | 'curator';
}

interface EditableElement {
  id: string;
  type: 'star' | 'puzzle' | 'arrow' | 'experience' | 'lamp' | 'curator-frame';
  title: string;
  originalX: number;
  originalY: number;
  currentX: number;
  currentY: number;
  originalWidth?: number;
  originalHeight?: number;
  currentWidth?: number;
  currentHeight?: number;
  aspectRatio?: number; // width / height
  subType?: string;
  extra?: any;
}

export const DevMapPositioningTool: React.FC<DevMapPositioningToolProps> = ({
  currentGalleryId,
  activeTab,
}) => {
  // Main toggle for positioning mode
  const [isActive, setIsActive] = useState<boolean>(false);

  // Selected element ID
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // In-progress dragged/edited coordinates & size for selected element
  const [dragCoords, setDragCoords] = useState<{
    x: number;
    y: number;
    width?: number;
    height?: number;
  } | null>(null);

  // Currently loaded elements for the active gallery / curator wall
  const [elements, setElements] = useState<EditableElement[]>([]);

  // Feedback notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Reference to map / curator container element in DOM
  const [mapContainerEl, setMapContainerEl] = useState<HTMLElement | null>(null);

  // Dragging & resizing state refs
  const isDraggingRef = useRef<boolean>(false);
  const isResizingRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
  const resizeStartRef = useRef<{
    clientX: number;
    clientY: number;
    startWidth: number;
    startHeight: number;
    aspectRatio: number;
  } | null>(null);

  // Detect whether we are currently targeting the Curator Exhibition Wall
  const isCuratorMode = useMemo(() => {
    if (activeTab === 'curator') return true;
    if (typeof document !== 'undefined') {
      return (
        !!document.querySelector('#museum-salon-wall') ||
        !!document.querySelector('#curator-collection-single-screen-view')
      );
    }
    return false;
  }, [activeTab, mapContainerEl]);

  // Gallery map configuration for map views
  const galleryConfig = useMemo(() => {
    return getGalleryMapConfig(currentGalleryId);
  }, [currentGalleryId]);

  // Dynamic virtual dimensions for curator wall mode
  const [curatorVirtualDims, setCuratorVirtualDims] = useState<{ width: number; height: number }>({
    width: CURATOR_VIRTUAL_WIDTH,
    height: CURATOR_VIRTUAL_HEIGHT,
  });

  useEffect(() => {
    if (!isCuratorMode || !mapContainerEl) return;
    const updateDimensions = () => {
      const vw = parseFloat(mapContainerEl.dataset.virtualWidth || '');
      const vh = parseFloat(mapContainerEl.dataset.virtualHeight || '');
      if (vw > 0 && vh > 0) {
        setCuratorVirtualDims((prev) =>
          prev.width === vw && prev.height === vh ? prev : { width: vw, height: vh }
        );
      }
    };
    updateDimensions();
    const observer = new MutationObserver(updateDimensions);
    observer.observe(mapContainerEl, {
      attributes: true,
      attributeFilter: ['data-virtual-width', 'data-virtual-height'],
    });
    window.addEventListener('resize', updateDimensions);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isCuratorMode, mapContainerEl]);

  const mapWidth = useMemo(() => {
    if (isCuratorMode) {
      return curatorVirtualDims.width || CURATOR_VIRTUAL_WIDTH;
    }
    if (mapContainerEl?.id === 'museum-map-transform-container' || currentGalleryId === 'gallery-00') {
      return 604.8;
    }
    return galleryConfig?.width || 848;
  }, [isCuratorMode, curatorVirtualDims.width, mapContainerEl, currentGalleryId, galleryConfig]);

  const mapHeight = useMemo(() => {
    if (isCuratorMode) {
      return curatorVirtualDims.height || CURATOR_VIRTUAL_HEIGHT;
    }
    if (mapContainerEl?.id === 'museum-map-transform-container' || currentGalleryId === 'gallery-00') {
      return 844.86;
    }
    return galleryConfig?.height || 1264;
  }, [isCuratorMode, curatorVirtualDims.height, mapContainerEl, currentGalleryId, galleryConfig]);

  // 1. Locate the container in the live DOM
  useEffect(() => {
    if (!isActive) {
      setMapContainerEl(null);
      return;
    }

    const findContainer = () => {
      // 1. Check for Curator salon wall
      if (activeTab === 'curator' || document.querySelector('#curator-collection-single-screen-view')) {
        const salonWall = document.querySelector<HTMLElement>('#museum-salon-wall');
        if (salonWall) {
          setMapContainerEl(salonWall);
          return;
        }
      }

      // 2. Look for known map container IDs or styles
      const g00Container = document.querySelector<HTMLElement>('#museum-map-transform-container');
      if (g00Container) {
        setMapContainerEl(g00Container);
        return;
      }

      // Check for canvas areas with aspect ratio
      const canvasArea = document.querySelector<HTMLElement>(
        `#${currentGalleryId}-canvas-area > div, main > div[style*="aspect-ratio"], main > div[style*="aspectRatio"]`
      );
      if (canvasArea) {
        setMapContainerEl(canvasArea);
        return;
      }

      // Fallback: parent of main SVG
      const mainSvg =
        document.querySelector<SVGSVGElement>('main svg') ||
        document.querySelector<SVGSVGElement>('#map-svg-element');
      if (mainSvg && mainSvg.parentElement) {
        setMapContainerEl(mainSvg.parentElement);
        return;
      }
    };

    findContainer();
    const interval = setInterval(findContainer, 400);
    return () => clearInterval(interval);
  }, [isActive, currentGalleryId, activeTab]);

  // 2. Load existing elements for this gallery or curator wall
  const refreshElements = useCallback(() => {
    const list: EditableElement[] = [];

    // CURATOR EXHIBITION WALL MODE
    if (isCuratorMode) {
      const desiredGalleryOrder = [
        'gallery-01',
        'gallery-03',
        'gallery-04',
        'gallery-05',
        'gallery-06',
        'gallery-08',
        'gallery-09',
        'gallery-07',
      ];

      desiredGalleryOrder.forEach((gid, idx) => {
        const gObj = GALLERIES.find((g) => g.id === gid);
        const puzzleArtwork = contentService.getGalleryPuzzleArtwork(gid);
        const config = getCuratorFrameConfig(gid, undefined, idx);
        const artworkTitle = puzzleArtwork?.title || gObj?.nameFa || gid;

        list.push({
          id: gid,
          type: 'curator-frame',
          title: `قاب ${gObj?.nameFa || gid} (${artworkTitle})`,
          originalX: config.x,
          originalY: config.y,
          currentX: config.x,
          currentY: config.y,
          originalWidth: config.width,
          originalHeight: config.height,
          currentWidth: config.width,
          currentHeight: config.height,
          aspectRatio: config.aspectRatio,
          subType: gid,
          extra: {
            galleryId: gid,
            artworkId: config.artworkId,
            artworkTitle,
            galleryNameFa: gObj?.nameFa,
            scaleMultiplier: config.scaleMultiplier,
          },
        });
      });

      setElements(list);
      return;
    }

    // MAP VIEW MODE
    // A. Star Points (from collection points with pointType === 'star')
    const allPoints = getGalleryPoints(currentGalleryId);
    const starPoints = allPoints.filter(
      (p) => p.type === 'collection' && (p as AdminCollectionPoint).pointType === 'star'
    ) as AdminCollectionPoint[];

    // Special fallback for Gallery 00 collection points
    if (currentGalleryId === 'gallery-00') {
      const g00Collections = allPoints.filter((p) => p.type === 'collection') as AdminCollectionPoint[];
      for (const col of g00Collections) {
        list.push({
          id: col.id,
          type: 'star',
          title: col.title || `مجموعه ${col.id}`,
          originalX: col.x,
          originalY: col.y,
          currentX: col.x,
          currentY: col.y,
          subType: col.pointType,
        });
      }
    } else {
      for (const sp of starPoints) {
        list.push({
          id: sp.id,
          type: 'star',
          title: sp.title || `نقطه ستاره ${sp.id}`,
          originalX: sp.x,
          originalY: sp.y,
          currentX: sp.x,
          currentY: sp.y,
          subType: 'star',
        });
      }
    }

    // B. Puzzle Points
    const puzzlePoints = getGalleryPuzzlePoints(currentGalleryId);
    for (const pp of puzzlePoints) {
      if (!list.some((item) => item.id === pp.id)) {
        list.push({
          id: pp.id,
          type: 'puzzle',
          title: pp.title || `معمای ${pp.id}`,
          originalX: pp.x,
          originalY: pp.y,
          currentX: pp.x,
          currentY: pp.y,
          subType: pp.puzzlePieceId,
        });
      }
    }

    // C. Arrows
    const arrows = getGalleryArrows(currentGalleryId);
    for (const arrow of arrows) {
      list.push({
        id: arrow.id,
        type: 'arrow',
        title: arrow.title || `فلش به ${arrow.destination}`,
        originalX: arrow.x,
        originalY: arrow.y,
        currentX: arrow.x,
        currentY: arrow.y,
        subType: arrow.destination,
      });
    }

    // D. Experience Points
    const expPoints = getExperiencePointsForGallery(currentGalleryId);
    for (const exp of expPoints) {
      if (!list.some((item) => item.id === exp.id)) {
        list.push({
          id: exp.id,
          type: 'experience',
          title: exp.title || exp.labelFa || `نقطه تجربه ${exp.id}`,
          originalX: exp.x,
          originalY: exp.y,
          currentX: exp.x,
          currentY: exp.y,
          subType: exp.icon_id || exp.iconId,
          extra: {
            id: exp.id,
            experienceId: exp.experienceId,
            galleryId: exp.galleryId,
            icon_id: exp.icon_id || exp.iconId,
            iconId: exp.iconId || exp.icon_id,
            x: exp.x,
            y: exp.y,
          },
        });
      }
    }

    // E. Gallery Location Lamps on Master Map
    const isMasterMap =
      currentGalleryId === 'gallery-00' ||
      currentGalleryId === 'gallery-01' ||
      currentGalleryId === 'gallery_01' ||
      mapContainerEl?.id === 'museum-map-transform-container' ||
      (typeof document !== 'undefined' && !!document.querySelector('#museum-map-transform-container'));

    if (isMasterMap) {
      const galleryLamps = getAllGalleryLamps();
      for (const lamp of galleryLamps) {
        if (!list.some((item) => item.id === lamp.id)) {
          list.push({
            id: lamp.id,
            type: 'lamp',
            title: lamp.title,
            originalX: lamp.x,
            originalY: lamp.y,
            currentX: lamp.x,
            currentY: lamp.y,
            subType: lamp.galleryId,
            extra: {
              galleryId: lamp.galleryId,
            },
          });
        }
      }
    }

    setElements(list);
  }, [isCuratorMode, currentGalleryId, mapContainerEl]);

  useEffect(() => {
    refreshElements();
    const handleUpdate = () => refreshElements();

    const handleDevSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ galleryId: string }>;
      if (customEvent.detail?.galleryId) {
        setSelectedId(customEvent.detail.galleryId);
      }
    };

    window.addEventListener('museum_points_updated', handleUpdate);
    window.addEventListener('museum_arrows_updated', handleUpdate);
    window.addEventListener('museum_puzzle_progress_updated', handleUpdate);
    window.addEventListener('museum_experience_points_updated', handleUpdate);
    window.addEventListener('museum_lamp_position_updated', handleUpdate);
    window.addEventListener('museum_gallery_areas_updated', handleUpdate);
    window.addEventListener('curator_wall_config_updated', handleUpdate);
    window.addEventListener('dev_select_curator_frame', handleDevSelect);

    return () => {
      window.removeEventListener('museum_points_updated', handleUpdate);
      window.removeEventListener('museum_arrows_updated', handleUpdate);
      window.removeEventListener('museum_puzzle_progress_updated', handleUpdate);
      window.removeEventListener('museum_experience_points_updated', handleUpdate);
      window.removeEventListener('museum_lamp_position_updated', handleUpdate);
      window.removeEventListener('museum_gallery_areas_updated', handleUpdate);
      window.removeEventListener('curator_wall_config_updated', handleUpdate);
      window.removeEventListener('dev_select_curator_frame', handleDevSelect);
    };
  }, [refreshElements]);

  // When selection changes, initialize drag coordinates & size
  useEffect(() => {
    if (selectedId) {
      const el = elements.find((e) => e.id === selectedId);
      if (el) {
        setDragCoords({
          x: el.currentX,
          y: el.currentY,
          width: el.currentWidth ?? el.originalWidth,
          height: el.currentHeight ?? el.originalHeight,
        });
      }
    } else {
      setDragCoords(null);
    }
  }, [selectedId, elements]);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // 3. Screen coordinates to container viewBox conversion
  const convertScreenToSvg = (clientX: number, clientY: number): { x: number; y: number } => {
    if (!mapContainerEl) return { x: 0, y: 0 };

    if (!isCuratorMode) {
      // Try native SVG coordinate conversion if SVG element exists
      const svg = mapContainerEl.querySelector<SVGSVGElement>('svg');
      if (svg && svg.getScreenCTM) {
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const pt = svg.createSVGPoint();
          pt.x = clientX;
          pt.y = clientY;
          const transformed = pt.matrixTransform(ctm.inverse());

          const vb = svg.viewBox?.baseVal;
          if (vb && vb.width > 0 && vb.height > 0) {
            if (Math.abs(vb.width - mapWidth) < 5 && Math.abs(vb.height - mapHeight) < 5) {
              return {
                x: Math.round(Math.max(0, Math.min(mapWidth, transformed.x))),
                y: Math.round(Math.max(0, Math.min(mapHeight, transformed.y))),
              };
            } else {
              const scaleX = mapWidth / vb.width;
              const scaleY = mapHeight / vb.height;
              return {
                x: Math.round(Math.max(0, Math.min(mapWidth, transformed.x * scaleX))),
                y: Math.round(Math.max(0, Math.min(mapHeight, transformed.y * scaleY))),
              };
            }
          }
        }
      }
    }

    // Direct container projection (Used for Curator wall 720x580 and fallback map)
    const rect = mapContainerEl.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const clampedY = Math.max(0, Math.min(rect.height, clientY - rect.top));

    return {
      x: Math.round((clampedX / rect.width) * mapWidth),
      y: Math.round((clampedY / rect.height) * mapHeight),
    };
  };

  const selectedElement = elements.find((e) => e.id === selectedId);
  const activeX = dragCoords && selectedElement ? dragCoords.x : selectedElement?.currentX ?? 0;
  const activeY = dragCoords && selectedElement ? dragCoords.y : selectedElement?.currentY ?? 0;
  const activeWidth =
    dragCoords?.width ?? selectedElement?.currentWidth ?? selectedElement?.originalWidth ?? 140;
  const activeHeight =
    dragCoords?.height ?? selectedElement?.currentHeight ?? selectedElement?.originalHeight ?? 180;
  const activeAspectRatio =
    selectedElement?.aspectRatio || activeWidth / Math.max(1, activeHeight);

  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<PanelPositionResult>({
    x: 16,
    y: 80,
    placement: 'below',
  });

  const getSelectedPointScreenPos = useCallback((): { x: number; y: number } | null => {
    if (!selectedId || !mapContainerEl) return null;

    // For Curator Frame: Check if frame overlay element exists in DOM
    if (selectedElement?.type === 'curator-frame') {
      const frameEl = document.getElementById(`dev-curator-frame-${selectedId}`);
      if (frameEl) {
        const fRect = frameEl.getBoundingClientRect();
        if (fRect.width > 0 && fRect.height > 0) {
          return {
            x: fRect.left + fRect.width / 2,
            y: fRect.top + fRect.height / 2,
          };
        }
      }

      const mRect = mapContainerEl.getBoundingClientRect();
      const posX = dragCoords && selectedElement ? dragCoords.x : selectedElement?.currentX ?? 0;
      const posY = dragCoords && selectedElement ? dragCoords.y : selectedElement?.currentY ?? 0;
      const fW = dragCoords?.width ?? selectedElement?.currentWidth ?? 140;
      const fH = dragCoords?.height ?? selectedElement?.currentHeight ?? 180;

      return {
        x: mRect.left + ((posX + fW / 2) / mapWidth) * mRect.width,
        y: mRect.top + ((posY + fH / 2) / mapHeight) * mRect.height,
      };
    }

    const handleEl = document.getElementById(`dev-handle-${selectedId}`);
    if (handleEl) {
      const hRect = handleEl.getBoundingClientRect();
      if (hRect.width > 0 && hRect.height > 0) {
        return {
          x: hRect.left + hRect.width / 2,
          y: hRect.top + hRect.height / 2,
        };
      }
    }

    const mRect = mapContainerEl.getBoundingClientRect();
    const posX = dragCoords && selectedElement ? dragCoords.x : selectedElement?.currentX ?? 0;
    const posY = dragCoords && selectedElement ? dragCoords.y : selectedElement?.currentY ?? 0;

    return {
      x: mRect.left + (posX / mapWidth) * mRect.width,
      y: mRect.top + (posY / mapHeight) * mRect.height,
    };
  }, [selectedId, mapContainerEl, dragCoords, selectedElement, mapWidth, mapHeight]);

  const updatePanelPlacement = useCallback(
    (customScreenX?: number, customScreenY?: number) => {
      if (!selectedId) return;

      let sx = customScreenX;
      let sy = customScreenY;

      if (sx === undefined || sy === undefined) {
        const pt = getSelectedPointScreenPos();
        if (!pt) return;
        sx = pt.x;
        sy = pt.y;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const panelW = panelRef.current?.offsetWidth || Math.min(320, vw - 24);
      const panelH = panelRef.current?.offsetHeight || 300;

      // Calculate dynamic clearance so panel NEVER covers the frame or point
      let dynamicClearance = 38;
      if (selectedElement?.type === 'curator-frame' && mapContainerEl) {
        const frameScreenH =
          (activeHeight / mapHeight) * mapContainerEl.getBoundingClientRect().height;
        dynamicClearance = Math.max(38, Math.round(frameScreenH / 2 + 14));
      }

      const newPos = calculateSafePanelPosition({
        pointScreenX: sx,
        pointScreenY: sy,
        panelWidth: panelW,
        panelHeight: panelH,
        viewportWidth: vw,
        viewportHeight: vh,
        safeMargin: 12,
        pointClearance: dynamicClearance,
      });

      setPanelPos(newPos);
    },
    [selectedId, getSelectedPointScreenPos, selectedElement, activeHeight, mapHeight, mapContainerEl]
  );

  useEffect(() => {
    if (selectedId) {
      requestAnimationFrame(() => {
        updatePanelPlacement();
      });
    }
  }, [selectedId, updatePanelPlacement]);

  useEffect(() => {
    if (!isActive || !selectedId) return;

    const handleScrollOrResize = () => {
      updatePanelPlacement();
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    };
  }, [isActive, selectedId, updatePanelPlacement]);

  // 4. Handle pointer events for dragging
  const handlePointerDown = (elementId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setSelectedId(elementId);
    isDraggingRef.current = true;
    activePointerIdRef.current = e.pointerId;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    const el = elements.find((item) => item.id === elementId);

    if (el?.type === 'curator-frame' && mapContainerEl) {
      const rect = mapContainerEl.getBoundingClientRect();
      const pointerCanvasX = ((e.clientX - rect.left) / rect.width) * mapWidth;
      const pointerCanvasY = ((e.clientY - rect.top) / rect.height) * mapHeight;

      const currentPosX = dragCoords?.x ?? el.currentX;
      const currentPosY = dragCoords?.y ?? el.currentY;

      dragOffsetRef.current = {
        offsetX: pointerCanvasX - currentPosX,
        offsetY: pointerCanvasY - currentPosY,
      };

      updatePanelPlacement(e.clientX, e.clientY);
      return;
    }

    const newCoords = convertScreenToSvg(e.clientX, e.clientY);
    setDragCoords(newCoords);

    setElements((prev) =>
      prev.map((item) =>
        item.id === elementId ? { ...item, currentX: newCoords.x, currentY: newCoords.y } : item
      )
    );

    updatePanelPlacement(e.clientX, e.clientY);
  };

  // Corner resize handler for curator frames (preserves aspect ratio)
  const handleResizePointerDown = (elementId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setSelectedId(elementId);
    isResizingRef.current = true;
    activePointerIdRef.current = e.pointerId;

    const el = elements.find((item) => item.id === elementId);
    const curW = dragCoords?.width ?? el?.currentWidth ?? el?.originalWidth ?? 140;
    const curH = dragCoords?.height ?? el?.currentHeight ?? el?.originalHeight ?? 180;
    const ratio = el?.aspectRatio || curW / Math.max(1, curH);

    resizeStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startWidth: curW,
      startHeight: curH,
      aspectRatio: ratio,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Resizing curator frame
    if (isResizingRef.current && resizeStartRef.current && selectedElement && mapContainerEl) {
      e.stopPropagation();
      e.preventDefault();

      const rect = mapContainerEl.getBoundingClientRect();
      const deltaScreenX = e.clientX - resizeStartRef.current.clientX;
      const scaleFactor = mapWidth / rect.width;
      const deltaCanvasX = deltaScreenX * scaleFactor;

      const startW = resizeStartRef.current.startWidth;
      const ratio = resizeStartRef.current.aspectRatio;

      // Minimum width 40, max 550
      const nextW = Math.max(40, Math.min(550, Math.round(startW + deltaCanvasX)));
      // STRICT ASPECT RATIO PRESERVATION:
      const nextH = Math.max(30, Math.min(550, Math.round(nextW / ratio)));

      setDragCoords((prev) => ({
        x: prev?.x ?? selectedElement.currentX,
        y: prev?.y ?? selectedElement.currentY,
        width: nextW,
        height: nextH,
      }));

      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedId
            ? { ...el, currentWidth: nextW, currentHeight: nextH }
            : el
        )
      );

      // Instant live preview event for the wall
      window.dispatchEvent(
        new CustomEvent('curator_frame_live_drag', {
          detail: {
            galleryId: selectedElement.id,
            coords: {
              x: dragCoords?.x ?? selectedElement.currentX,
              y: dragCoords?.y ?? selectedElement.currentY,
              width: nextW,
              height: nextH,
            },
          },
        })
      );

      updatePanelPlacement(e.clientX, e.clientY);
      return;
    }

    // 2. Dragging curator frame position
    if (isDraggingRef.current && selectedId && selectedElement && mapContainerEl) {
      e.stopPropagation();
      e.preventDefault();

      if (selectedElement.type === 'curator-frame') {
        const rect = mapContainerEl.getBoundingClientRect();
        const pointerCanvasX = ((e.clientX - rect.left) / rect.width) * mapWidth;
        const pointerCanvasY = ((e.clientY - rect.top) / rect.height) * mapHeight;

        const targetX = Math.round(pointerCanvasX - dragOffsetRef.current.offsetX);
        const targetY = Math.round(pointerCanvasY - dragOffsetRef.current.offsetY);

        const currentW = dragCoords?.width ?? selectedElement.currentWidth ?? 140;
        const currentH = dragCoords?.height ?? selectedElement.currentHeight ?? 180;

        const clampedX = Math.max(0, Math.min(mapWidth - currentW, targetX));
        const clampedY = Math.max(0, Math.min(mapHeight - currentH, targetY));

        setDragCoords((prev) => ({
          x: clampedX,
          y: clampedY,
          width: currentW,
          height: currentH,
        }));

        setElements((prev) =>
          prev.map((el) =>
            el.id === selectedId
              ? { ...el, currentX: clampedX, currentY: clampedY }
              : el
          )
        );

        window.dispatchEvent(
          new CustomEvent('curator_frame_live_drag', {
            detail: {
              galleryId: selectedElement.id,
              coords: {
                x: clampedX,
                y: clampedY,
                width: currentW,
                height: currentH,
              },
            },
          })
        );

        updatePanelPlacement(e.clientX, e.clientY);
        return;
      }

      // Map Point dragging
      const newCoords = convertScreenToSvg(e.clientX, e.clientY);
      setDragCoords(newCoords);

      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedId ? { ...el, currentX: newCoords.x, currentY: newCoords.y } : el
        )
      );

      updatePanelPlacement(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isResizingRef.current || isDraggingRef.current) {
      isResizingRef.current = false;
      isDraggingRef.current = false;
      activePointerIdRef.current = null;
      resizeStartRef.current = null;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }

      window.dispatchEvent(new CustomEvent('curator_frame_live_drag_end'));
    }
  };

  // 5. Nudge position coordinates by offset
  const handleNudge = (axis: 'x' | 'y', delta: number) => {
    if (!selectedId || !selectedElement) return;

    const curX = dragCoords?.x ?? selectedElement.currentX;
    const curY = dragCoords?.y ?? selectedElement.currentY;
    const curW = dragCoords?.width ?? selectedElement.currentWidth ?? 140;
    const curH = dragCoords?.height ?? selectedElement.currentHeight ?? 180;

    const nextCoords = {
      x: axis === 'x' ? Math.max(0, Math.min(mapWidth - (selectedElement.type === 'curator-frame' ? curW : 0), curX + delta)) : curX,
      y: axis === 'y' ? Math.max(0, Math.min(mapHeight - (selectedElement.type === 'curator-frame' ? curH : 0), curY + delta)) : curY,
      width: curW,
      height: curH,
    };

    setDragCoords(nextCoords);
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId ? { ...el, currentX: nextCoords.x, currentY: nextCoords.y } : el
      )
    );

    if (selectedElement.type === 'curator-frame') {
      window.dispatchEvent(
        new CustomEvent('curator_frame_live_drag', {
          detail: {
            galleryId: selectedElement.id,
            coords: nextCoords,
          },
        })
      );
    }

    requestAnimationFrame(() => updatePanelPlacement());
  };

  // 6. Resizing control for curator frames (preserves aspect ratio)
  const handleResizeStep = (deltaWidth: number) => {
    if (!selectedId || !selectedElement || selectedElement.type !== 'curator-frame') return;

    const curW = dragCoords?.width ?? selectedElement.currentWidth ?? selectedElement.originalWidth ?? 140;
    const ratio = selectedElement.aspectRatio || 1;

    const nextW = Math.max(40, Math.min(550, curW + deltaWidth));
    const nextH = Math.max(30, Math.min(550, Math.round(nextW / ratio)));

    const nextCoords = {
      x: dragCoords?.x ?? selectedElement.currentX,
      y: dragCoords?.y ?? selectedElement.currentY,
      width: nextW,
      height: nextH,
    };

    setDragCoords(nextCoords);
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId
          ? { ...el, currentWidth: nextW, currentHeight: nextH }
          : el
      )
    );

    window.dispatchEvent(
      new CustomEvent('curator_frame_live_drag', {
        detail: {
          galleryId: selectedElement.id,
          coords: nextCoords,
        },
      })
    );

    requestAnimationFrame(() => updatePanelPlacement());
  };

  const handleScaleStepPercent = (percentChange: number) => {
    if (!selectedId || !selectedElement || selectedElement.type !== 'curator-frame') return;

    const curW = dragCoords?.width ?? selectedElement.currentWidth ?? selectedElement.originalWidth ?? 140;
    const ratio = selectedElement.aspectRatio || 1;

    const multiplier = 1 + percentChange / 100;
    const nextW = Math.max(40, Math.min(550, Math.round(curW * multiplier)));
    const nextH = Math.max(30, Math.min(550, Math.round(nextW / ratio)));

    const nextCoords = {
      x: dragCoords?.x ?? selectedElement.currentX,
      y: dragCoords?.y ?? selectedElement.currentY,
      width: nextW,
      height: nextH,
    };

    setDragCoords(nextCoords);
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId
          ? { ...el, currentWidth: nextW, currentHeight: nextH }
          : el
      )
    );

    window.dispatchEvent(
      new CustomEvent('curator_frame_live_drag', {
        detail: {
          galleryId: selectedElement.id,
          coords: nextCoords,
        },
      })
    );

    requestAnimationFrame(() => updatePanelPlacement());
  };

  // 7. Save Position and Size to persistent database
  const handleSavePosition = (targetId?: string) => {
    const idToSave = targetId || selectedId;
    if (!idToSave) return;

    const el = elements.find((e) => e.id === idToSave);
    if (!el) return;

    const finalX = dragCoords && el.id === selectedId ? dragCoords.x : el.currentX;
    const finalY = dragCoords && el.id === selectedId ? dragCoords.y : el.currentY;

    // CURATOR ARTWORK FRAME SAVE
    if (el.type === 'curator-frame') {
      const finalW = dragCoords?.width ?? el.currentWidth ?? el.originalWidth ?? 140;
      const finalH = dragCoords?.height ?? el.currentHeight ?? el.originalHeight ?? 180;
      const scaleMult = finalW / Math.max(1, el.originalWidth || 140);

      saveCuratorFrameConfig({
        galleryId: el.id,
        artworkId: el.extra?.artworkId,
        title: el.extra?.artworkTitle || el.title,
        x: finalX,
        y: finalY,
        width: finalW,
        height: finalH,
        scaleMultiplier: scaleMult,
      });

      setElements((prev) =>
        prev.map((item) =>
          item.id === idToSave
            ? {
                ...item,
                originalX: finalX,
                originalY: finalY,
                currentX: finalX,
                currentY: finalY,
                originalWidth: finalW,
                originalHeight: finalH,
                currentWidth: finalW,
                currentHeight: finalH,
              }
            : item
        )
      );

      showToast(
        `موقعیت و اندازه «${el.title}» ذخیره شد: X: ${finalX} , Y: ${finalY} (${finalW}×${finalH})`,
        'success'
      );
      return;
    }

    // MAP VIEW POINTS SAVE
    if (el.type === 'arrow') {
      const currentArrows = getGalleryArrows(currentGalleryId);
      const updated = currentArrows.map((a) =>
        a.id === idToSave ? { ...a, x: finalX, y: finalY } : a
      );
      saveGalleryArrows(currentGalleryId, updated);
    } else if (el.type === 'puzzle') {
      const currentPuzzles = getGalleryPuzzlePoints(currentGalleryId);
      const updated = currentPuzzles.map((p) =>
        p.id === idToSave ? { ...p, x: finalX, y: finalY } : p
      );
      saveGalleryPuzzlePoints(currentGalleryId, updated);
    } else if (el.type === 'experience') {
      saveExperiencePointPosition(idToSave, finalX, finalY, currentGalleryId);
    } else if (el.type === 'lamp') {
      const targetGalleryId = el.extra?.galleryId || el.subType || el.id.replace('lamp-', '');
      saveGalleryLampPosition(targetGalleryId, finalX, finalY);
    } else {
      // Star / Collection Point
      const currentPoints = getGalleryPoints(currentGalleryId);
      const updated = currentPoints.map((p) =>
        p.id === idToSave ? { ...p, x: finalX, y: finalY } : p
      );
      saveGalleryPoints(currentGalleryId, updated);
    }

    // Dispatch update events for live map components and admin
    window.dispatchEvent(new CustomEvent('museum_points_updated', { detail: { galleryId: currentGalleryId } }));
    window.dispatchEvent(new CustomEvent('museum_arrows_updated', { detail: { galleryId: currentGalleryId } }));
    window.dispatchEvent(new CustomEvent('museum_map_config_updated', { detail: { galleryId: currentGalleryId } }));
    window.dispatchEvent(new CustomEvent('museum_puzzle_progress_updated', { detail: { galleryId: currentGalleryId } }));
    window.dispatchEvent(new CustomEvent('museum_experience_points_updated', { detail: { galleryId: currentGalleryId } }));
    window.dispatchEvent(new CustomEvent('museum_lamp_position_updated', { detail: { galleryId: currentGalleryId, x: finalX, y: finalY } }));
    window.dispatchEvent(new CustomEvent('museum_player_location_updated'));

    setElements((prev) =>
      prev.map((item) =>
        item.id === idToSave
          ? { ...item, originalX: finalX, originalY: finalY, currentX: finalX, currentY: finalY }
          : item
      )
    );

    showToast(`موقعیت «${el.title}» ذخیره شد: X: ${finalX} , Y: ${finalY}`, 'success');
  };

  // Reset selected element to original position/size
  const handleResetPosition = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;

    if (el.type === 'curator-frame') {
      setDragCoords({
        x: el.originalX,
        y: el.originalY,
        width: el.originalWidth,
        height: el.originalHeight,
      });
      setElements((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                currentX: item.originalX,
                currentY: item.originalY,
                currentWidth: item.originalWidth,
                currentHeight: item.originalHeight,
              }
            : item
        )
      );
      window.dispatchEvent(
        new CustomEvent('curator_frame_live_drag', {
          detail: {
            galleryId: el.id,
            coords: {
              x: el.originalX,
              y: el.originalY,
              width: el.originalWidth,
              height: el.originalHeight,
            },
          },
        })
      );
      showToast(`موقعیت و اندازه «${el.title}» به حالت اولیه بازگردانده شد`, 'info');
      return;
    }

    setDragCoords({ x: el.originalX, y: el.originalY });
    setElements((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, currentX: item.originalX, currentY: item.originalY } : item
      )
    );
    showToast(`موقعیت «${el.title}» به حالت قبلی بازگردانده شد`, 'info');
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. FIXED DEVELOPMENT FLOATING TOGGLE BUTTON
          ───────────────────────────────────────────────────────────── */}
      <div
        id="dev-positioning-controls-anchor"
        className="fixed top-3 left-4 z-[9999] flex flex-col gap-2 select-none"
        dir="rtl"
      >
        <button
          id="btn-toggle-dev-positioning"
          type="button"
          onClick={() => {
            setIsActive((prev) => !prev);
            if (isActive) setSelectedId(null);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans-custom font-medium shadow-2xl transition-all border backdrop-blur-md cursor-pointer ${
            isActive
              ? 'bg-amber-500 text-stone-950 border-amber-300 ring-2 ring-amber-400/50 scale-105'
              : 'bg-stone-900/90 text-amber-300 border-amber-500/40 hover:bg-stone-800 hover:border-amber-400'
          }`}
          title="تنظیم موقعیت و اندازه (حالت توسعه)"
        >
          <Move className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
          <span>{isActive ? '✕ بستن تنظیم نقاط' : 'تنظیم نقاط'}</span>
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-stone-950 animate-ping" />
          )}
        </button>

        {/* Quick info chip when active */}
        {isActive && (
          <div className="bg-stone-950/90 text-stone-300 text-[11px] px-3 py-1.5 rounded-lg border border-amber-500/30 backdrop-blur-sm flex items-center gap-2 font-mono-custom shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              {isCuratorMode
                ? `دیوار کیوریتور • ابعاد مجازی: ${mapWidth} × ${mapHeight}`
                : `${galleryConfig?.nameFa || currentGalleryId} • SVG: ${mapWidth} × ${mapHeight}`}
            </span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOAST NOTIFICATION
          ───────────────────────────────────────────────────────────── */}
      {notification && (
        <div
          dir="rtl"
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-sans-custom flex items-center gap-2 border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/60'
              : 'bg-stone-900/95 text-stone-200 border-stone-600'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE DEVELOPMENT TOOLBAR (QUICK PICKER)
          ───────────────────────────────────────────────────────────── */}
      {isActive && !selectedId && (
        <div
          dir="rtl"
          id="dev-positioning-bottom-toolbar"
          className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[9990] bg-stone-950/95 text-stone-100 border border-amber-500/40 rounded-2xl shadow-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md max-w-2xl w-full"
        >
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-medium text-amber-300 font-sans-custom">
              {isCuratorMode
                ? 'تنظیم موقعیت و اندازه آثار کیوریتور'
                : 'حالت تنظیم موقعیت نقاط نقشه'}
            </span>
            <span className="text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded font-mono-custom">
              {elements.length} عنصر موجود
            </span>
          </div>

          {/* Quick select dropdown for elements */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] justify-end">
            <select
              id="dev-element-quick-picker"
              value={selectedId || ''}
              onChange={(e) => setSelectedId(e.target.value || null)}
              className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-sans-custom cursor-pointer"
            >
              <option value="">-- انتخاب عنصر جهت جابه‌جایی --</option>
              {isCuratorMode ? (
                <optgroup label="🖼️ قاب‌های آثار کیوریتور (Curator Frames)">
                  {elements.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} (X:{e.currentX} Y:{e.currentY} | {e.currentWidth}×{e.currentHeight})
                    </option>
                  ))}
                </optgroup>
              ) : (
                <>
                  <optgroup label="⭐️ نقاط ستاره (Star Points)">
                    {elements
                      .filter((e) => e.type === 'star')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} (X: {e.currentX}, Y: {e.currentY})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🧩 نقاط معما (Puzzle Points)">
                    {elements
                      .filter((e) => e.type === 'puzzle')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} (X: {e.currentX}, Y: {e.currentY})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🧭 فلش‌های راهنما (Arrows)">
                    {elements
                      .filter((e) => e.type === 'arrow')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} (X: {e.currentX}, Y: {e.currentY})
                        </option>
                      ))}
                  </optgroup>
                  {elements.some((e) => e.type === 'experience') && (
                    <optgroup label="✨ نقاط تجربه (Experience Points)">
                      {elements
                        .filter((e) => e.type === 'experience')
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title} (X: {e.currentX}, Y: {e.currentY})
                          </option>
                        ))}
                    </optgroup>
                  )}
                  {elements.some((e) => e.type === 'lamp') && (
                    <optgroup label="💡 چراغ‌های موقعیت گالری (Gallery Lamps)">
                      {elements
                        .filter((e) => e.type === 'lamp')
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title} (X: {e.currentX}, Y: {e.currentY})
                          </option>
                        ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE POSITIONING OVERLAY PORTAL INSIDE MAP / SALON CONTAINER
          ───────────────────────────────────────────────────────────── */}
      {isActive &&
        mapContainerEl &&
        createPortal(
          <div
            id="dev-map-positioning-layer"
            onClick={(e) => {
              if (isDraggingRef.current || isResizingRef.current || !selectedId) return;
              if (e.target === e.currentTarget && !isCuratorMode) {
                const coords = convertScreenToSvg(e.clientX, e.clientY);
                setDragCoords(coords);
                setElements((prev) =>
                  prev.map((el) => (el.id === selectedId ? { ...el, currentX: coords.x, currentY: coords.y } : el))
                );
                updatePanelPlacement(e.clientX, e.clientY);
              }
            }}
            className={`absolute inset-0 z-[60] select-none ${
              selectedId ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
            }`}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Render interactive handles/bounding boxes for all existing elements */}
            {elements.map((item) => {
              const isSelected = item.id === selectedId;
              const posX = isSelected && dragCoords ? dragCoords.x : item.currentX;
              const posY = isSelected && dragCoords ? dragCoords.y : item.currentY;

              // CURATOR FRAME RENDERING
              if (item.type === 'curator-frame') {
                const fW = isSelected && dragCoords?.width ? dragCoords.width : (item.currentWidth || 140);
                const fH = isSelected && dragCoords?.height ? dragCoords.height : (item.currentHeight || 180);

                const leftPct = (posX / mapWidth) * 100;
                const topPct = (posY / mapHeight) * 100;
                const widthPct = (fW / mapWidth) * 100;
                const heightPct = (fH / mapHeight) * 100;

                return (
                  <div
                    key={item.id}
                    id={`dev-curator-frame-${item.id}`}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                    }}
                    onPointerDown={(e) => handlePointerDown(item.id, e)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className={`absolute pointer-events-auto transition-all rounded ${
                      isSelected
                        ? 'z-50 outline outline-2 outline-amber-400 -outline-offset-2 ring-2 ring-black/40 cursor-grab active:cursor-grabbing'
                        : 'z-30 border-0 bg-transparent hover:outline hover:outline-1 hover:outline-amber-400/60 hover:-outline-offset-1 cursor-pointer'
                    }`}
                  >
                    {/* Frame Badge Header - Only visible when frame is actively selected to prevent clutter and duplicate frames */}
                    {isSelected && (
                      <div
                        className={`absolute ${
                          posY < 35 ? '-bottom-7' : '-top-7'
                        } right-0 whitespace-nowrap px-2.5 py-0.5 rounded text-[10px] font-mono-custom flex items-center gap-1.5 shadow-lg pointer-events-none transition-all bg-amber-400 text-stone-950 font-bold opacity-100 z-50 border border-stone-900`}
                      >
                        <span>🖼️</span>
                        <span>{item.extra?.galleryNameFa || item.id}</span>
                        <span className="text-[9px] bg-stone-950/15 px-1 py-0.2 rounded font-sans-custom">
                          ({fW}×{fH})
                        </span>
                      </div>
                    )}

                    {/* Interactive Corner Resize Handle when selected (preserves aspect ratio) */}
                    {isSelected && (
                      <>
                        {/* Bottom-Right Resize Handle */}
                        <div
                          id={`dev-resize-handle-se-${item.id}`}
                          onPointerDown={(e) => handleResizePointerDown(item.id, e)}
                          className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-amber-400 border-2 border-stone-950 shadow-lg cursor-nwse-resize flex items-center justify-center pointer-events-auto hover:scale-125 transition-transform z-50"
                          title="تغییر اندازه (حفظ نسبت ابعاد)"
                        >
                          <div className="w-2 h-2 rounded-full bg-stone-950" />
                        </div>

                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-stone-950 pointer-events-none" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-stone-950 pointer-events-none" />
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-stone-950 pointer-events-none" />

                        {/* Center Drag Icon */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                          <Move className="w-6 h-6 text-amber-400" />
                        </div>
                      </>
                    )}
                  </div>
                );
              }

              // MAP POINT RENDERING
              const leftPct = (posX / mapWidth) * 100;
              const topPct = (posY / mapHeight) * 100;

              return (
                <div
                  key={item.id}
                  id={`dev-handle-${item.id}`}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onPointerDown={(e) => handlePointerDown(item.id, e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform ${
                    isSelected ? 'z-50 scale-110' : 'z-40 hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-2 border-dashed border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.5)] ring-4 ring-amber-400/20'
                        : item.type === 'experience'
                        ? 'border border-dashed border-purple-400/70 bg-purple-950/40 hover:border-purple-300 hover:bg-purple-900/50'
                        : item.type === 'lamp'
                        ? 'border border-dashed border-yellow-400/90 bg-yellow-950/50 hover:border-yellow-300 hover:bg-yellow-900/60 shadow-[0_0_12px_rgba(250,204,21,0.35)]'
                        : 'border border-dashed border-stone-400/60 bg-stone-900/30 hover:border-amber-300/80 hover:bg-stone-900/50'
                    }`}
                  >
                    {item.type === 'lamp' ? (
                      <div className="relative flex items-center justify-center pointer-events-none">
                        <span className="text-base select-none leading-none">💡</span>
                        <div className="absolute -inset-1 rounded-full bg-yellow-400/30 blur-[2px] pointer-events-none" />
                      </div>
                    ) : (
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isSelected
                            ? 'bg-amber-400 ring-2 ring-stone-950'
                            : item.type === 'experience'
                            ? 'bg-purple-300'
                            : 'bg-stone-200/80'
                        }`}
                      />
                    )}
                  </div>

                  {/* Tiny identifier chip above marker */}
                  <div
                    className={`absolute -top-6 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-mono-custom tracking-tight pointer-events-none transition-opacity ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold opacity-100 shadow-md'
                        : item.type === 'lamp'
                        ? 'bg-yellow-950/90 text-yellow-300 border border-yellow-500/50 opacity-95'
                        : 'bg-stone-900/80 text-stone-300 opacity-80'
                    }`}
                  >
                    {item.type === 'star' && '⭐️ '}
                    {item.type === 'puzzle' && '🧩 '}
                    {item.type === 'arrow' && '🧭 '}
                    {item.type === 'experience' && '✨ '}
                    {item.type === 'lamp' && '💡 '}
                    {item.id}
                  </div>
                </div>
              );
            })}
          </div>,
          mapContainerEl
        )}

      {/* ─────────────────────────────────────────────────────────────
          5. VIEWPORT-AWARE FLOATING POSITIONING CONTROLS PANEL
          ───────────────────────────────────────────────────────────── */}
      {isActive && selectedElement && (
        <div
          ref={panelRef}
          dir="rtl"
          id="dev-selected-coordinate-badge"
          style={{
            position: 'fixed',
            left: `${panelPos.x}px`,
            top: `${panelPos.y}px`,
            zIndex: 99999,
          }}
          className="pointer-events-auto bg-stone-950/95 text-stone-100 border-2 border-amber-400/90 rounded-2xl shadow-2xl p-3 sm:p-3.5 w-[min(320px,calc(100vw-24px))] backdrop-blur-xl flex flex-col gap-2.5 font-sans-custom transition-[left,top] duration-75 select-none"
        >
          {/* Title and Element Type Header with Close Button */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Crosshair className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-300 truncate">
                {selectedElement.type === 'curator-frame'
                  ? 'تنظیم موقعیت و اندازه قاب اثر'
                  : 'تنظیم موقعیت نقاط (توسعه)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setDragCoords(null);
              }}
              className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors cursor-pointer"
              title="بستن پنجره"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick element selector dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-400 shrink-0 font-medium">عنصر:</span>
            <select
              value={selectedId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedId(nextId || null);
                setDragCoords(null);
              }}
              className="flex-1 bg-stone-900 text-stone-200 text-xs rounded-lg border border-stone-700/80 px-2 py-1 outline-none truncate font-sans-custom focus:border-amber-400 cursor-pointer"
            >
              {isCuratorMode ? (
                <optgroup label="🖼️ قاب‌های آثار کیوریتور">
                  {elements.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} (X:{e.currentX} Y:{e.currentY} | {e.currentWidth}×{e.currentHeight})
                    </option>
                  ))}
                </optgroup>
              ) : (
                <>
                  <optgroup label="⭐️ نقاط ستاره (Star Points)">
                    {elements
                      .filter((e) => e.type === 'star')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} (X: {e.currentX}, Y: {e.currentY})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🧩 نقاط معما (Puzzle Points)">
                    {elements
                      .filter((e) => e.type === 'puzzle')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} (X: {e.currentX}, Y: {e.currentY})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🧭 فلش‌های راهنما (Arrows)">
                    {elements
                      .filter((e) => e.type === 'arrow')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} (X: {e.currentX}, Y: {e.currentY})
                        </option>
                      ))}
                  </optgroup>
                  {elements.some((e) => e.type === 'experience') && (
                    <optgroup label="✨ نقاط تجربه (Experience Points)">
                      {elements
                        .filter((e) => e.type === 'experience')
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title} (X: {e.currentX}, Y: {e.currentY})
                          </option>
                        ))}
                    </optgroup>
                  )}
                  {elements.some((e) => e.type === 'lamp') && (
                    <optgroup label="💡 چراغ‌های موقعیت گالری (Gallery Lamps)">
                      {elements
                        .filter((e) => e.type === 'lamp')
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title} (X: {e.currentX}, Y: {e.currentY})
                          </option>
                        ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>

          {/* Coordinates readout */}
          <div className="bg-stone-900/90 rounded-xl p-2 border border-stone-800 flex items-center justify-around font-mono-custom text-center">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">
                {isCuratorMode ? 'موقعیت X' : 'SVG X'}
              </span>
              <span className="text-sm font-bold text-amber-400">{activeX}</span>
              {isCuratorMode && (
                <span className="text-[9px] text-stone-400">
                  {((activeX / mapWidth) * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="w-[1px] h-7 bg-stone-800" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">
                {isCuratorMode ? 'موقعیت Y' : 'SVG Y'}
              </span>
              <span className="text-sm font-bold text-amber-400">{activeY}</span>
              {isCuratorMode && (
                <span className="text-[9px] text-stone-400">
                  {((activeY / mapHeight) * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="w-[1px] h-7 bg-stone-800" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-stone-500 uppercase">
                {isCuratorMode ? 'پایه بوم' : 'viewBox'}
              </span>
              <span className="text-[10px] text-stone-300">
                {mapWidth}×{mapHeight}
              </span>
            </div>
          </div>

          {/* Precision Position Nudge Controls */}
          <div className="flex items-center justify-between text-[11px] text-stone-300 bg-stone-900/50 p-1.5 rounded-lg border border-stone-800/60">
            <div className="flex items-center gap-1 font-mono-custom">
              <span className="text-[10px] text-stone-400">X:</span>
              <button
                type="button"
                onClick={() => handleNudge('x', -5)}
                className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="-5px"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleNudge('x', -1)}
                className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="-1px"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleNudge('x', 1)}
                className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="+1px"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleNudge('x', 5)}
                className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="+5px"
              >
                +5
              </button>
            </div>

            <div className="flex items-center gap-1 font-mono-custom">
              <span className="text-[10px] text-stone-400">Y:</span>
              <button
                type="button"
                onClick={() => handleNudge('y', -5)}
                className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="-5px"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleNudge('y', -1)}
                className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="-1px"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleNudge('y', 1)}
                className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="+1px"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleNudge('y', 5)}
                className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="+5px"
              >
                +5
              </button>
            </div>
          </div>

          {/* CURATOR FRAME SIZE CONTROLS (Preserves Aspect Ratio) */}
          {selectedElement.type === 'curator-frame' && (
            <div className="bg-stone-900/70 p-2 rounded-xl border border-stone-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Maximize2 className="w-3 h-3" />
                  <span>اندازه و مقیاس قاب:</span>
                </div>
                <div className="font-mono-custom text-stone-300 text-[10px] flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">{activeWidth} × {activeHeight}</span>
                  <span className="text-stone-400">
                    ({((activeWidth / (selectedElement.originalWidth || 140)) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* Aspect ratio lock indicator */}
              <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono-custom px-1">
                <span>نسبت ابعاد ثابت: {activeAspectRatio.toFixed(2)}:1</span>
                <span>(عرض / ارتفاع)</span>
              </div>

              {/* Scale step buttons */}
              <div className="flex items-center justify-between gap-1 pt-0.5 font-mono-custom text-[10px]">
                <span className="text-[10px] text-stone-400">مقیاس:</span>
                <button
                  type="button"
                  onClick={() => handleScaleStepPercent(-10)}
                  className="px-1.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  title="-10%"
                >
                  -10%
                </button>
                <button
                  type="button"
                  onClick={() => handleScaleStepPercent(-2)}
                  className="px-1.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  title="-2%"
                >
                  -2%
                </button>
                <button
                  type="button"
                  onClick={() => handleScaleStepPercent(2)}
                  className="px-1.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  title="+2%"
                >
                  +2%
                </button>
                <button
                  type="button"
                  onClick={() => handleScaleStepPercent(10)}
                  className="px-1.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  title="+10%"
                >
                  +10%
                </button>
              </div>

              {/* Precise pixel width step buttons */}
              <div className="flex items-center justify-between gap-1 font-mono-custom text-[10px]">
                <span className="text-[10px] text-stone-400">عرض (W):</span>
                <button
                  type="button"
                  onClick={() => handleResizeStep(-5)}
                  className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  title="-5px"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleResizeStep(-1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  title="-1px"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleResizeStep(1)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  title="+1px"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleResizeStep(5)}
                  className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  title="+5px"
                >
                  +5
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons: Save Position & Reset */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => handleSavePosition()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{selectedElement.type === 'curator-frame' ? 'ذخیره موقعیت و اندازه' : 'ذخیره موقعیت'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetPosition}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:border-stone-700 transition-colors cursor-pointer"
              title="بازگرداندن به موقعیت قبلی"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
