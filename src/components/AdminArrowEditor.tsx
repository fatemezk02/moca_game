import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AdminArrowPoint,
  ArrowDestination,
  GalleryConfig,
  ArrowVisibilityCondition,
  ArrowConditionType,
} from '../types/admin';
import {
  GALLERIES,
  getGalleryArrows,
  saveGalleryArrows,
  resetGalleryArrows,
  createNewArrow,
  getAllGalleryMapConfigs,
} from '../data/mapConfig';
import {
  evaluateArrowConditions,
  isConditionSatisfied,
  isArrowUsed,
} from '../data/arrowConditionsStore';
import { NavigationArrowRender } from './NavigationArrowRender';
import { Gallery00MapSvg } from './Gallery00MapSvg';
import { Gallery03MapSvg } from './Gallery03MapSvg';
import {
  Navigation,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Compass,
  CheckCircle,
  Move,
  Maximize2,
  ExternalLink,
  Sliders,
  ChevronRight,
  Info,
  Eye,
  Lock,
  Unlock,
  HelpCircle,
  Puzzle,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface AdminArrowEditorProps {
  initialGalleryId?: string;
}

export const AdminArrowEditor: React.FC<AdminArrowEditorProps> = ({
  initialGalleryId = 'gallery-00',
}) => {
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>(initialGalleryId);
  const [arrows, setArrows] = useState<AdminArrowPoint[]>([]);
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Canvas zoom & pan state
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingArrowId, setDraggingArrowId] = useState<string | null>(null);

  const currentGallery: GalleryConfig =
    GALLERIES.find((g) => g.id === selectedGalleryId) || GALLERIES[0];
  const [vbX, vbY, vbWidth, vbHeight] = currentGallery.viewBox.split(' ').map(Number);

  // Load arrows for current gallery
  useEffect(() => {
    const loaded = getGalleryArrows(selectedGalleryId);
    setArrows(loaded);
    if (loaded.length > 0) {
      setSelectedArrowId(loaded[0].id);
    } else {
      setSelectedArrowId(null);
    }
  }, [selectedGalleryId]);

  // Selected arrow object
  const selectedArrow = arrows.find((a) => a.id === selectedArrowId) || null;

  // Save changes
  const handleSave = () => {
    saveGalleryArrows(selectedGalleryId, arrows);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Reset to defaults
  const handleReset = () => {
    if (
      window.confirm(
        'آیا مطمئن هستید که می‌خواهید تمام فلش‌های این گالری را به حالت پیش‌فرض بازنشانی کنید؟'
      )
    ) {
      const def = resetGalleryArrows(selectedGalleryId);
      setArrows(def);
      if (def.length > 0) setSelectedArrowId(def[0].id);
      else setSelectedArrowId(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  // Add new arrow
  const handleAddArrow = () => {
    const defaultX = Math.round(vbWidth / 2);
    const defaultY = Math.round(vbHeight / 2);
    const newArrow = createNewArrow(selectedGalleryId, defaultX, defaultY);
    const updated = [...arrows, newArrow];
    setArrows(updated);
    setSelectedArrowId(newArrow.id);
    saveGalleryArrows(selectedGalleryId, updated);
  };

  // Delete selected arrow
  const handleDeleteArrow = (arrowId: string) => {
    const arrowToDelete = arrows.find((a) => a.id === arrowId);
    const title = arrowToDelete?.title || 'این فلش';
    if (window.confirm(`آیا از حذف "${title}" مطمئن هستید؟`)) {
      const updated = arrows.filter((a) => a.id !== arrowId);
      setArrows(updated);
      saveGalleryArrows(selectedGalleryId, updated);
      if (selectedArrowId === arrowId) {
        setSelectedArrowId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  // Update specific arrow property
  const handleUpdateArrow = (
    arrowId: string,
    updates: Partial<AdminArrowPoint>,
    autoPersist = false
  ) => {
    setArrows((prev) => {
      const next = prev.map((a) => (a.id === arrowId ? { ...a, ...updates } : a));
      if (autoPersist) {
        saveGalleryArrows(selectedGalleryId, next);
      }
      return next;
    });
  };

  // Add a new visibility condition to the arrow
  const handleAddCondition = (arrowId: string) => {
    const arrow = arrows.find((a) => a.id === arrowId);
    if (!arrow) return;
    const currentConditions = arrow.visibilityConditions || [];
    const newCondition: ArrowVisibilityCondition = {
      id: `cond-${Date.now().toString(36)}`,
      type: 'questionAnswered',
      questionId: selectedGalleryId === 'gallery-01' ? 'gallery01-puzzle-q03' : 'gallery01-q01',
    };
    const updatedConditions = [...currentConditions, newCondition];
    handleUpdateArrow(arrowId, { visibilityConditions: updatedConditions }, true);
  };

  // Remove a visibility condition
  const handleRemoveCondition = (arrowId: string, index: number) => {
    const arrow = arrows.find((a) => a.id === arrowId);
    if (!arrow || !arrow.visibilityConditions) return;
    const updatedConditions = arrow.visibilityConditions.filter((_, i) => i !== index);
    handleUpdateArrow(arrowId, { visibilityConditions: updatedConditions }, true);
  };

  // Update a specific condition
  const handleUpdateCondition = (
    arrowId: string,
    index: number,
    updates: Partial<ArrowVisibilityCondition>
  ) => {
    const arrow = arrows.find((a) => a.id === arrowId);
    if (!arrow || !arrow.visibilityConditions) return;
    const updatedConditions = arrow.visibilityConditions.map((cond, i) =>
      i === index ? { ...cond, ...updates } : cond
    );
    handleUpdateArrow(arrowId, { visibilityConditions: updatedConditions }, true);
  };

  // Set arrow to always visible (remove conditions)
  const handleSetAlwaysVisible = (arrowId: string) => {
    handleUpdateArrow(arrowId, { visibilityConditions: [] }, true);
  };

  // SVG coordinate transformation
  const getSvgCoordinates = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;

      const ctm = svg.getScreenCTM();
      if (!ctm) return null;

      const point = svg.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      const transformed = point.matrixTransform(ctm.inverse());

      return {
        x: Math.round(Math.max(0, Math.min(vbWidth, transformed.x))),
        y: Math.round(Math.max(0, Math.min(vbHeight, transformed.y))),
      };
    },
    [vbWidth, vbHeight]
  );

  // Dragging arrow on canvas
  const handleArrowPointerDown = (arrowId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedArrowId(arrowId);
    setDraggingArrowId(arrowId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingArrowId) {
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (coords) {
        handleUpdateArrow(draggingArrowId, { x: coords.x, y: coords.y });
      }
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingArrowId) {
      // Auto-save on drag end
      saveGalleryArrows(selectedGalleryId, arrows);
      setDraggingArrowId(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (
      e.target === containerRef.current ||
      (e.target as HTMLElement).tagName === 'svg' ||
      (e.target as HTMLElement).tagName === 'path'
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f2f0]">
      {/* Sub-Header Toolbar for Arrow Management */}
      <div className="h-12 bg-[#faf9f6] border-b border-[#0e0f0f] px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left: Gallery Selector & Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-xs text-[#0e0f0f]">
            <Navigation className="w-4 h-4 text-[#c5a059]" />
            <span className="font-mono-custom uppercase tracking-wider">انتخاب گالری:</span>
          </div>

          <select
            value={selectedGalleryId}
            onChange={(e) => setSelectedGalleryId(e.target.value)}
            className="bg-white border border-[#0e0f0f] px-2.5 py-1 text-xs font-bold font-sans-custom cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0e0f0f]"
          >
            {GALLERIES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameFa} ({g.name})
              </option>
            ))}
          </select>

          <span className="text-[11px] font-mono-custom text-[#747878] hidden sm:inline">
            ({arrows.length} فلش در این گالری)
          </span>
        </div>

        {/* Right: Actions (Add, Reset, Save) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddArrow}
            className="px-3 py-1 bg-white border border-[#0e0f0f] hover:bg-[#eae7e7] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>+ افزودن فلش جدید (Add Arrow)</span>
          </button>

          <div className="h-5 w-px bg-[#0e0f0f]/20 mx-1" />

          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-red-50 text-red-700 border border-red-200 text-xs font-mono-custom transition-colors cursor-pointer"
            title="بازنشانی فلش‌ها به حالت اولیه"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSave}
            className={`px-3 py-1 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isSaved
                ? 'bg-emerald-600 text-white border border-emerald-700'
                : 'bg-[#0e0f0f] text-white hover:bg-[#2a2b2b] border border-[#0e0f0f]'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>ذخیره شد!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>ذخیره فلش‌ها</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 3-Column Workspace (Sidebar - Canvas - Properties) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Arrows List */}
        <aside className="w-60 md:w-68 bg-white border-r border-[#0e0f0f] flex flex-col shrink-0 z-20">
          <div className="p-3 border-b border-[#0e0f0f]/20 bg-[#faf9f6] flex items-center justify-between">
            <span className="text-xs font-bold font-mono-custom uppercase tracking-wider text-[#0e0f0f]">
              لیست فلش‌ها (ARROWS)
            </span>
            <span className="text-[10px] font-mono-custom text-[#747878]">
              {arrows.length} مورد
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {arrows.length === 0 ? (
              <div className="p-6 text-center text-[#747878] space-y-2">
                <Navigation className="w-8 h-8 mx-auto text-[#747878]/50" />
                <p className="text-xs font-sans-custom">هیچ فلشی در این گالری وجود ندارد.</p>
                <button
                  onClick={handleAddArrow}
                  className="px-2.5 py-1 bg-[#0e0f0f] text-white text-xs font-bold hover:bg-[#2a2b2b] cursor-pointer"
                >
                  + افزودن اولین فلش
                </button>
              </div>
            ) : (
              arrows.map((arrow, idx) => {
                const isSelected = selectedArrowId === arrow.id;
                return (
                  <div
                    key={arrow.id}
                    onClick={() => setSelectedArrowId(arrow.id)}
                    className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'border-[#0e0f0f] bg-[#f5f1e8] shadow-xs'
                        : 'border-[#0e0f0f]/10 bg-white hover:border-[#0e0f0f]/40 hover:bg-[#fbf9f9]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Mini arrow thumbnail showing actual rotation */}
                      <div className="w-7 h-7 bg-[#0e0f0f]/5 border border-[#0e0f0f]/20 flex items-center justify-center shrink-0">
                        <Navigation
                          className="w-4 h-4 text-[#0e0f0f]"
                          style={{ transform: `rotate(${arrow.rotation}deg)` }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-sans-custom text-[#0e0f0f] truncate">
                          {arrow.title || `Arrow ${idx + 1}`}
                        </div>
                        <div className="text-[10px] font-mono-custom text-[#747878] flex items-center gap-1.5">
                          <span>
                            X:{arrow.x} Y:{arrow.y}
                          </span>
                          <span>•</span>
                          <span>{arrow.rotation}°</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[9px] font-mono-custom px-1.5 py-0.5 border ${
                          arrow.destination && arrow.destination !== 'none'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {arrow.destination === 'gallery-03'
                          ? 'G03'
                          : arrow.destination === 'gallery-03-questions'
                          ? 'G03-Q'
                          : arrow.destination === 'gallery-01'
                          ? 'G01'
                          : arrow.destination === 'gallery-00'
                          ? 'G00'
                          : arrow.destination === 'gallery-01-questions'
                          ? 'Quiz'
                          : arrow.destination === 'none'
                          ? 'No Link'
                          : arrow.destination}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArrow(arrow.id);
                        }}
                        className="p-1 text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-opacity cursor-pointer"
                        title="حذف فلش"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Center: Interactive Map Canvas with Real SVG */}
        <main
          ref={containerRef}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex-1 relative bg-[#f4f2f0] overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
        >
          {/* Blueprint Grid Pattern */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#0e0f0f 1px, transparent 1px), linear-gradient(90deg, #0e0f0f 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Floating Zoom Controls */}
          <div className="absolute top-4 right-4 z-40 bg-[#fbf9f9] border border-[#0e0f0f] shadow-md flex items-center p-1 gap-1">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 hover:bg-[#0e0f0f] hover:text-[#fbf9f9] text-[#0e0f0f] transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 hover:bg-[#0e0f0f] hover:text-[#fbf9f9] text-[#0e0f0f] transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset View"
              className="p-1.5 hover:bg-[#0e0f0f] hover:text-[#fbf9f9] text-[#0e0f0f] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="font-mono-custom text-[10px] px-2 py-0.5 border-l border-[#0e0f0f] text-[#0e0f0f] font-bold">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Coordinate Indicator */}
          <div className="absolute bottom-4 left-4 z-40 bg-white/90 border border-[#0e0f0f] px-2.5 py-1 text-[10px] font-mono-custom font-bold text-[#0e0f0f] shadow-xs">
            SVG VIEWBOX: {currentGallery.viewBox} • فلش‌های فعال: {arrows.length}
          </div>

          {/* Transform Map Container */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning || draggingArrowId ? 'none' : 'transform 0.15s ease-out',
            }}
            className="relative max-h-[90%] max-w-[90%] flex items-center justify-center"
          >
            {/* SVG Floor Plan Canvas */}
            <div
              style={{
                aspectRatio: `${vbWidth} / ${vbHeight}`,
                width: currentGallery.id === 'gallery-01' || currentGallery.id === 'gallery-03' ? '460px' : '560px',
                maxWidth: '100%',
              }}
              className="relative bg-[#fbf9f9] border border-[#0e0f0f] shadow-xl p-4"
            >
              {currentGallery.id === 'gallery-01' ? (
                <svg
                  ref={svgRef}
                  viewBox={currentGallery.viewBox}
                  className="w-full h-full object-contain pointer-events-auto"
                >
                  <defs>
                    <style>
                      {`
                        .admin-arrow-map-cls {
                          fill: none;
                          stroke: #0e0f0f;
                          stroke-linecap: round;
                          stroke-linejoin: round;
                          stroke-width: 2.5px;
                        }
                      `}
                    </style>
                  </defs>
                  <path
                    className="admin-arrow-map-cls"
                    d="M733.69,250v11h-225.69v-11h199V115h-194.3c-1.51,0-2.76-1.18-2.83-2.69-.05-1.12-.13-2.22-.3-3.32-1.58-10-4.77-19.16-9.44-27.65-3.06-5.57-6.77-10.85-11.07-15.89-21.57-25.23-61.92-37.38-95.59-22.51-31.15,13.77-49.53,36.33-52.94,69.49-.15,1.47-1.41,2.57-2.88,2.57h-194.65v135h119.02v109h-119.02v709.49s160.43.01,160.43.01v112.76h-11v-101.77h-159.45l-.06-731.2h118.1v-87.29h-118.1l-.42-151.5c-.13-5.35.03-5.5,5.5-5.5l188.5-.02c1.89,0,3.96.73,4.57-2.47,2.58-13.44,8.15-25.57,16.41-36.52,13.49-17.9,30.81-30.06,52.5-36.05,2.75-.76,5.51-1.32,8.29-1.77,11.03-1.75,22.29-1.84,33.31-.02,5.9.97,11.72,2.46,17.46,4.75,31.24,12.46,50.81,35.16,59.75,67.16,1.15,4.09,2.44,5,6.21,5,62.17-.08,124.33-.02,186.5-.11,6.9-.01,6.01,1.16,6.01,6.05v140h16.18Z"
                  />
                  <rect className="admin-arrow-map-cls" x="745.74" y="250" width="16.18" height="11" />
                  <rect className="admin-arrow-map-cls" x="773.97" y="250" width="27.57" height="11" />
                  <rect className="admin-arrow-map-cls" x="813.37" y="250" width="17.87" height="11" />
                  <rect className="admin-arrow-map-cls" x="773.97" y="347.99" width="27.57" height="11" />
                  <rect className="admin-arrow-map-cls" x="813.37" y="347.99" width="17.87" height="11" />
                  <polygon
                    className="admin-arrow-map-cls"
                    points="733.69 347.99 733.69 358.99 717.51 358.99 717.49 1079.62 558.15 1079.62 558.15 1181.26 547.15 1181.26 547.15 1068.62 707 1068.62 707 359 508 359 508 348.29 577.88 348.19 717.51 347.99 733.69 347.99"
                  />
                  <rect className="admin-arrow-map-cls" x="745.74" y="347.99" width="16.18" height="11" />
                </svg>
              ) : currentGallery.id === 'gallery-03' ? (
                <Gallery03MapSvg
                  ref={svgRef}
                  className="w-full h-full object-contain pointer-events-auto"
                />
              ) : (
                <Gallery00MapSvg
                  ref={svgRef}
                  className="w-full h-full object-contain pointer-events-auto"
                />
              )}

              {/* Arrow Overlay Layer (SVG ViewBox Coordinate System) */}
              <div className="absolute inset-4 pointer-events-none">
                {arrows.map((arrow) => {
                  const leftPercent = (arrow.x / vbWidth) * 100;
                  const topPercent = (arrow.y / vbHeight) * 100;
                  const isSelected = selectedArrowId === arrow.id;

                  return (
                    <div
                      key={arrow.id}
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-30 touch-none"
                    >
                      <div
                        onPointerDown={(e) => handleArrowPointerDown(arrow.id, e)}
                        className={`cursor-grab active:cursor-grabbing p-1 flex items-center justify-center ${
                          isSelected ? 'z-40' : 'hover:scale-105'
                        }`}
                      >
                        <NavigationArrowRender
                          arrow={arrow}
                          isSelected={isSelected}
                          isInteractive={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Right Side: Arrow Properties Panel */}
        <aside className="w-72 md:w-84 bg-white border-l border-[#0e0f0f] flex flex-col shrink-0 z-20 overflow-y-auto">
          <div className="p-3 border-b border-[#0e0f0f]/20 bg-[#faf9f6] flex items-center justify-between">
            <span className="text-xs font-bold font-mono-custom uppercase tracking-wider text-[#0e0f0f]">
              مشخصات فلش (PROPERTIES)
            </span>
            {selectedArrow && (
              <span className="text-[10px] font-mono-custom px-1.5 py-0.5 bg-[#0e0f0f] text-white font-bold">
                ACTIVE
              </span>
            )}
          </div>

          {selectedArrow ? (
            <div className="p-4 space-y-5">
              {/* Arrow Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold font-mono-custom uppercase text-[#747878]">
                  عنوان فلش (Title)
                </label>
                <input
                  type="text"
                  value={selectedArrow.title || ''}
                  onChange={(e) =>
                    handleUpdateArrow(selectedArrow.id, { title: e.target.value }, true)
                  }
                  placeholder="مثلاً: فلش راهنما به گالری ۰۱"
                  className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0e0f0f]"
                />
              </div>

              {/* Destination Selector */}
              <div className="space-y-1 bg-[#faf9f6] p-3 border border-[#0e0f0f]/10">
                <label className="text-[11px] font-bold font-mono-custom uppercase text-[#0e0f0f] flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>مقصد ناوبری (Destination)</span>
                </label>
                <select
                  value={selectedArrow.destination}
                  onChange={(e) =>
                    handleUpdateArrow(
                      selectedArrow.id,
                      { destination: e.target.value as ArrowDestination },
                      true
                    )
                  }
                  className="w-full bg-white border border-[#0e0f0f] px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0e0f0f] cursor-pointer"
                >
                  <option value="none">بدون مقصد (No Destination / بدون کلیک)</option>
                  <option value="gallery-00">گالری ۰۰ (ورودی و تالار مرکزی)</option>
                  <option value="gallery-01">گالری ۰۱ (Gallery 01)</option>
                  <option value="gallery-01-questions">پرسش‌های گالری ۰۱ (Gallery 01 Questions)</option>
                  <option value="gallery-03">گالری ۰۳ (Gallery 03)</option>
                  <option value="gallery-03-questions">پرسش‌های گالری ۰۳ (Gallery 03 Questions)</option>
                  <option value="collection">صفحه کلکسیون (Collection)</option>
                  <option value="tasks">وظایف و آزمون (Tasks)</option>
                  <option value="curator">یادداشت کیوریتور (Curator)</option>
                </select>
                <p className="text-[10px] text-[#747878] font-sans-custom">
                  با کلیک کاربر روی فلش در نقشه، به این صفحه منتقل شده و فلش یک‌بارمصرف پنهان می‌شود.
                </p>
              </div>

              {/* Visibility Conditions Section (شرایط نمایش فلش) */}
              <div className="space-y-3 bg-[#faf9f6] p-3 border border-[#0e0f0f]/10 rounded-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold font-mono-custom uppercase text-[#0e0f0f] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>شرایط نمایش فلش (Visibility Conditions)</span>
                  </label>
                  {(!selectedArrow.visibilityConditions ||
                    selectedArrow.visibilityConditions.length === 0) && (
                    <span className="text-[10px] font-mono-custom px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xs font-bold flex items-center gap-1">
                      <Unlock className="w-2.5 h-2.5" />
                      همیشه قابل مشاهده
                    </span>
                  )}
                </div>

                {/* If arrow has no conditions (Always Visible) */}
                {(!selectedArrow.visibilityConditions ||
                  selectedArrow.visibilityConditions.length === 0) ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-[#747878] font-sans-custom">
                      این فلش هیچ شرطی ندارد و از ابتدا برای کاربر نمایش داده می‌شود.
                    </p>
                    <button
                      onClick={() => handleAddCondition(selectedArrow.id)}
                      className="w-full py-1.5 bg-white hover:bg-[#f3eee4] text-[#0e0f0f] border border-[#0e0f0f] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-[1px_1px_0px_#0e0f0f]"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>افزودن شرط نمایش (Add Condition)</span>
                    </button>
                  </div>
                ) : (
                  /* Condition List with AND Logic */
                  <div className="space-y-2.5">
                    {selectedArrow.visibilityConditions.map((cond, idx) => {
                      const isCondMet = isConditionSatisfied(cond);

                      return (
                        <div key={cond.id || `cond-${idx}`} className="space-y-1.5">
                          {/* AND Divider between conditions */}
                          {idx > 0 && (
                            <div className="flex items-center gap-2 py-1 select-none">
                              <div className="h-px bg-[#0e0f0f]/20 flex-1" />
                              <span className="text-[9px] font-black font-mono-custom bg-[#0e0f0f] text-[#c5a059] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                AND / و (هر دو باید برقرار باشند)
                              </span>
                              <div className="h-px bg-[#0e0f0f]/20 flex-1" />
                            </div>
                          )}

                          {/* Individual Condition Card */}
                          <div className="bg-white p-2.5 border border-[#0e0f0f] space-y-2 shadow-[1px_1px_0px_#0e0f0f]">
                            {/* Header & Delete */}
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-[#0e0f0f] flex items-center gap-1">
                                <span className="w-4 h-4 rounded-full bg-[#f3eee4] border border-[#0e0f0f] flex items-center justify-center text-[10px] font-mono-custom">
                                  {idx + 1}
                                </span>
                                <span>شرط شماره {idx + 1}</span>
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[9px] font-mono-custom px-1.5 py-0.2 border rounded-xs ${
                                    isCondMet
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : 'bg-amber-50 text-amber-700 border-amber-300'
                                  }`}
                                >
                                  {isCondMet ? 'وضعیت: برقرار' : 'وضعیت: در انتظار'}
                                </span>
                                <button
                                  onClick={() => handleRemoveCondition(selectedArrow.id, idx)}
                                  aria-label="حذف این شرط"
                                  title="حذف این شرط"
                                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Condition Type Selector */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono-custom text-[#747878] block">
                                نوع شرط (Condition Type):
                              </span>
                              <select
                                value={cond.type}
                                onChange={(e) =>
                                  handleUpdateCondition(selectedArrow.id, idx, {
                                    type: e.target.value as ArrowConditionType,
                                    questionId:
                                      e.target.value === 'questionAnswered'
                                        ? cond.questionId || 'gallery01-puzzle-q03'
                                        : undefined,
                                    puzzlePieceId:
                                      e.target.value === 'puzzlePieceCollected'
                                        ? cond.puzzlePieceId || 'gallery01-piece-03'
                                        : undefined,
                                    arrowId:
                                      e.target.value === 'arrowUsed'
                                        ? cond.arrowId || 'arrow-g00-to-g01'
                                        : undefined,
                                  })
                                }
                                className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-bold focus:outline-none cursor-pointer"
                              >
                                <option value="questionAnswered">
                                  پاسخ به سؤال (Question Answered)
                                </option>
                                <option value="puzzlePieceCollected">
                                  جمع‌آوری قطعه پازل (Puzzle Piece Collected)
                                </option>
                                <option value="arrowUsed">
                                  استفاده از فلش قبلی (Arrow Used)
                                </option>
                                <option value="alwaysVisible">
                                  همیشه قابل مشاهده (Always Visible)
                                </option>
                              </select>
                            </div>

                            {/* Question Selector (If questionAnswered) */}
                            {cond.type === 'questionAnswered' && (
                              <div className="space-y-1 bg-[#fcfbf9] p-2 border border-[#0e0f0f]/15">
                                <span className="text-[10px] font-bold text-[#0e0f0f] flex items-center gap-1">
                                  <HelpCircle className="w-3 h-3 text-[#c5a059]" />
                                  انتخاب شناسه سؤال (Question ID):
                                </span>
                                <select
                                  value={cond.questionId || ''}
                                  onChange={(e) =>
                                    handleUpdateCondition(selectedArrow.id, idx, {
                                      questionId: e.target.value,
                                    })
                                  }
                                  className="w-full bg-white border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold cursor-pointer"
                                >
                                  <option value="gallery01-puzzle-q03">
                                    gallery01-puzzle-q03 (سؤال پازل ۳ گالری ۰۱)
                                  </option>
                                  <option value="gallery01-puzzle-q01">
                                    gallery01-puzzle-q01 (سؤال پازل ۱ گالری ۰۱)
                                  </option>
                                  <option value="gallery01-puzzle-q02">
                                    gallery01-puzzle-q02 (سؤال پازل ۲ گالری ۰۱)
                                  </option>
                                  <option value="gallery01-q03">
                                    gallery01-q03 (سؤال ۳ کوئیز گالری ۰۱)
                                  </option>
                                  <option value="gallery01-q02">
                                    gallery01-q02 (سؤال ۲ کوئیز گالری ۰۱)
                                  </option>
                                  <option value="gallery01-q01">
                                    gallery01-q01 (سؤال ۱ کوئیز گالری ۰۱)
                                  </option>
                                  <option value="gallery03-q03">
                                    gallery03-q03 (سؤال ۳ کوئیز گالری ۰۳)
                                  </option>
                                  <option value="gallery03-q02">
                                    gallery03-q02 (سؤال ۲ کوئیز گالری ۰۳)
                                  </option>
                                  <option value="gallery03-q01">
                                    gallery03-q01 (سؤال ۱ کوئیز گالری ۰۳)
                                  </option>
                                </select>
                                <input
                                  type="text"
                                  value={cond.questionId || ''}
                                  onChange={(e) =>
                                    handleUpdateCondition(selectedArrow.id, idx, {
                                      questionId: e.target.value,
                                    })
                                  }
                                  placeholder="یا وارد کردن دستی Question ID..."
                                  className="w-full bg-white border border-[#0e0f0f]/30 px-2 py-0.5 text-[11px] font-mono-custom focus:outline-none"
                                />
                              </div>
                            )}

                            {/* Puzzle Piece Selector (If puzzlePieceCollected) */}
                            {cond.type === 'puzzlePieceCollected' && (
                              <div className="space-y-1 bg-[#fcfbf9] p-2 border border-[#0e0f0f]/15">
                                <span className="text-[10px] font-bold text-[#0e0f0f] flex items-center gap-1">
                                  <Puzzle className="w-3 h-3 text-[#c5a059]" />
                                  انتخاب شناسه قطعه پازل (Puzzle Piece ID):
                                </span>
                                <select
                                  value={cond.puzzlePieceId || ''}
                                  onChange={(e) =>
                                    handleUpdateCondition(selectedArrow.id, idx, {
                                      puzzlePieceId: e.target.value,
                                    })
                                  }
                                  className="w-full bg-white border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold cursor-pointer"
                                >
                                  <option value="gallery01-piece-03">
                                    gallery01-piece-03 (قطعه ۳ پازل گالری ۰۱)
                                  </option>
                                  <option value="gallery01-piece-01">
                                    gallery01-piece-01 (قطعه ۱ پازل گالری ۰۱)
                                  </option>
                                  <option value="gallery01-piece-02">
                                    gallery01-piece-02 (قطعه ۲ پازل گالری ۰۱)
                                  </option>
                                  <option value="gallery03-piece-01">
                                    gallery03-piece-01 (قطعه ۱ پازل گالری ۰۳)
                                  </option>
                                  <option value="gallery03-piece-02">
                                    gallery03-piece-02 (قطعه ۲ پازل گالری ۰۳)
                                  </option>
                                  <option value="gallery03-piece-03">
                                    gallery03-piece-03 (قطعه ۳ پازل گالری ۰۳)
                                  </option>
                                </select>
                                <input
                                  type="text"
                                  value={cond.puzzlePieceId || ''}
                                  onChange={(e) =>
                                    handleUpdateCondition(selectedArrow.id, idx, {
                                      puzzlePieceId: e.target.value,
                                    })
                                  }
                                  placeholder="یا وارد کردن دستی Piece ID..."
                                  className="w-full bg-white border border-[#0e0f0f]/30 px-2 py-0.5 text-[11px] font-mono-custom focus:outline-none"
                                />
                              </div>
                            )}

                            {/* Previous Arrow Selector (If arrowUsed) */}
                            {cond.type === 'arrowUsed' && (
                              <div className="space-y-1 bg-[#fcfbf9] p-2 border border-[#0e0f0f]/15">
                                <span className="text-[10px] font-bold text-[#0e0f0f] flex items-center gap-1">
                                  <Navigation className="w-3 h-3 text-[#c5a059]" />
                                  انتخاب فلش قبلی (Arrow ID):
                                </span>
                                <input
                                  type="text"
                                  value={cond.arrowId || ''}
                                  onChange={(e) =>
                                    handleUpdateCondition(selectedArrow.id, idx, {
                                      arrowId: e.target.value,
                                    })
                                  }
                                  placeholder="مثلاً: arrow-g00-to-g01"
                                  className="w-full bg-white border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Action buttons: Add another condition / Reset to always visible */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAddCondition(selectedArrow.id)}
                        className="flex-1 py-1.5 bg-white hover:bg-[#f3eee4] text-[#0e0f0f] border border-[#0e0f0f] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-[1px_1px_0px_#0e0f0f]"
                      >
                        <Plus className="w-3 h-3 text-[#c5a059]" />
                        <span>+ شرط دیگر (AND)</span>
                      </button>
                      <button
                        onClick={() => handleSetAlwaysVisible(selectedArrow.id)}
                        className="py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-[#747878] hover:text-[#0e0f0f] border border-neutral-300 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        همیشه نمایان
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Coordinates: X & Y */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-mono-custom uppercase text-[#747878] flex items-center gap-1">
                    <Move className="w-3.5 h-3.5 text-[#c5a059]" />
                    موقعیت در نقشه (SVG Coordinates)
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateArrow(
                        selectedArrow.id,
                        {
                          x: Math.round(vbWidth / 2),
                          y: Math.round(vbHeight / 2),
                        },
                        true
                      )
                    }
                    className="text-[10px] font-mono-custom text-[#c5a059] hover:underline cursor-pointer"
                  >
                    مرکز گالری
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono-custom text-[#747878]">X (0-{vbWidth})</span>
                    <input
                      type="number"
                      min={0}
                      max={vbWidth}
                      value={selectedArrow.x}
                      onChange={(e) =>
                        handleUpdateArrow(
                          selectedArrow.id,
                          { x: Math.max(0, Math.min(vbWidth, Number(e.target.value) || 0)) },
                          true
                        )
                      }
                      className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono-custom text-[#747878]">Y (0-{vbHeight})</span>
                    <input
                      type="number"
                      min={0}
                      max={vbHeight}
                      value={selectedArrow.y}
                      onChange={(e) =>
                        handleUpdateArrow(
                          selectedArrow.id,
                          { y: Math.max(0, Math.min(vbHeight, Number(e.target.value) || 0)) },
                          true
                        )
                      }
                      className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Rotation Controls (Degrees, Slider & Presets) */}
              <div className="space-y-2 border-t border-[#0e0f0f]/10 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold font-mono-custom uppercase text-[#747878] flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
                    زاویه چرخش (Rotation)
                  </label>
                  <span className="text-xs font-mono-custom font-bold text-[#0e0f0f]">
                    {selectedArrow.rotation}°
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={selectedArrow.rotation}
                    onChange={(e) =>
                      handleUpdateArrow(selectedArrow.id, { rotation: Number(e.target.value) }, true)
                    }
                    className="flex-1 accent-[#0e0f0f] cursor-pointer"
                  />
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={selectedArrow.rotation}
                    onChange={(e) => {
                      const val = ((Number(e.target.value) % 360) + 360) % 360;
                      handleUpdateArrow(selectedArrow.id, { rotation: val }, true);
                    }}
                    className="w-16 bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold text-center"
                  />
                </div>

                {/* Quick Angle Presets */}
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => handleUpdateArrow(selectedArrow.id, { rotation: deg }, true)}
                      className={`py-1 text-[10px] font-mono-custom font-bold border transition-colors cursor-pointer ${
                        selectedArrow.rotation === deg
                          ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                          : 'bg-white text-[#0e0f0f] border-[#0e0f0f]/20 hover:bg-[#eae7e7]'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Controls */}
              <div className="space-y-2 border-t border-[#0e0f0f]/10 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold font-mono-custom uppercase text-[#747878] flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-[#c5a059]" />
                    اندازه فلش (Size)
                  </label>
                  <span className="text-xs font-mono-custom font-bold text-[#0e0f0f]">
                    {selectedArrow.size}px
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={24}
                    max={120}
                    step={2}
                    value={selectedArrow.size}
                    onChange={(e) =>
                      handleUpdateArrow(selectedArrow.id, { size: Number(e.target.value) }, true)
                    }
                    className="flex-1 accent-[#0e0f0f] cursor-pointer"
                  />
                  <input
                    type="number"
                    min={24}
                    max={120}
                    value={selectedArrow.size}
                    onChange={(e) =>
                      handleUpdateArrow(
                        selectedArrow.id,
                        { size: Math.max(24, Math.min(120, Number(e.target.value) || 48)) },
                        true
                      )
                    }
                    className="w-16 bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold text-center"
                  />
                </div>

                {/* Quick Size Presets */}
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[32, 48, 64, 80].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleUpdateArrow(selectedArrow.id, { size: sz }, true)}
                      className={`py-1 text-[10px] font-mono-custom font-bold border transition-colors cursor-pointer ${
                        selectedArrow.size === sz
                          ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                          : 'bg-white text-[#0e0f0f] border-[#0e0f0f]/20 hover:bg-[#eae7e7]'
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete Arrow */}
              <div className="border-t border-[#0e0f0f]/10 pt-4">
                <button
                  onClick={() => handleDeleteArrow(selectedArrow.id)}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف این فلش (Delete Arrow)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-[#747878] space-y-2">
              <Info className="w-8 h-8 mx-auto text-[#747878]/50" />
              <p className="text-xs font-sans-custom">
                یک فلش را از لیست یا روی نقشه انتخاب کنید تا ویژگی‌های آن نمایش داده شود.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
