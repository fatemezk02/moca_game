import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  Move,
  Layers,
  Info,
  Compass,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { GALLERIES } from '../data/mapConfig';
import { GalleryAreaConfig, GalleryAreaPoint } from '../types/galleryArea';
import {
  getGalleryAreas,
  saveGalleryAreas,
  resetGalleryAreas,
  createNewGalleryArea,
  DEFAULT_GALLERY_AREAS,
} from '../data/galleryAreasStore';
import {
  getCurrentGalleryId,
  setCurrentGalleryId,
} from '../data/playerLocationStore';
import { Gallery00MapSvg } from './Gallery00MapSvg';
import { formatGalleryLabelFa } from './NavigationLight';

export const AdminGalleryAreasEditor: React.FC = () => {
  const [areas, setAreas] = useState<GalleryAreaConfig[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activePlayerLoc, setActivePlayerLoc] = useState<string>(() => getCurrentGalleryId());

  // Canvas zoom & pan state
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging states
  const [draggingVertexIndex, setDraggingVertexIndex] = useState<number | null>(null);
  const [isDraggingLamp, setIsDraggingLamp] = useState<boolean>(false);
  const [isDraggingPolygon, setIsDraggingPolygon] = useState<boolean>(false);
  const polygonDragStartRef = useRef<{
    startX: number;
    startY: number;
    initialPoints: GalleryAreaPoint[];
  } | null>(null);

  // Gallery 00 Master Map dimensions
  const vbWidth = 604.8;
  const vbHeight = 844.86;

  // Load areas on mount
  useEffect(() => {
    const loaded = getGalleryAreas();
    setAreas(loaded);
    if (loaded.length > 0) {
      setSelectedAreaId(loaded[0].id);
    }
  }, []);

  // Listen to player location updates for test sync
  useEffect(() => {
    const handleLoc = () => setActivePlayerLoc(getCurrentGalleryId());
    window.addEventListener('museum_player_location_updated', handleLoc);
    return () => window.removeEventListener('museum_player_location_updated', handleLoc);
  }, []);

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || null;

  // Save changes
  const handleSave = () => {
    saveGalleryAreas(areas);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Reset to defaults
  const handleReset = () => {
    if (
      window.confirm(
        'آیا مطمئن هستید که می‌خواهید تمام محدوده‌ها و موقعیت‌های لامپ را به تنظیمات اولیه بازنشانی کنید؟'
      )
    ) {
      const def = resetGalleryAreas();
      setAreas(def);
      if (def.length > 0) setSelectedAreaId(def[0].id);
      else setSelectedAreaId(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  // Convert client/screen pointer coordinates to SVG viewBox coordinates (0 - 604.8, 0 - 844.86)
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

  // Update selected area helper
  const updateSelectedArea = (updater: (prev: GalleryAreaConfig) => GalleryAreaConfig) => {
    if (!selectedAreaId) return;
    setAreas((prev) =>
      prev.map((area) => (area.id === selectedAreaId ? updater(area) : area))
    );
  };

  // Add new area for a gallery
  const handleAddArea = (targetGalleryId: string) => {
    const galleryMeta = GALLERIES.find((g) => g.id === targetGalleryId);
    const title = galleryMeta ? galleryMeta.nameFa : targetGalleryId;
    const newArea = createNewGalleryArea(targetGalleryId, title);
    const updated = [...areas, newArea];
    setAreas(updated);
    setSelectedAreaId(newArea.id);
    saveGalleryAreas(updated);
  };

  // Delete area
  const handleDeleteArea = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('آیا از حذف این محدوده گالری اطمینان دارید؟')) {
      const updated = areas.filter((a) => a.id !== id);
      setAreas(updated);
      saveGalleryAreas(updated);
      if (selectedAreaId === id) {
        setSelectedAreaId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  // Add vertex to selected area polygon
  const handleAddPointToPolygon = () => {
    if (!selectedArea) return;
    const pts = selectedArea.area.points;
    let newPt: GalleryAreaPoint;
    if (pts.length >= 2) {
      // Add point midpoint between last point and first point
      const last = pts[pts.length - 1];
      const first = pts[0];
      newPt = {
        x: Math.round((last.x + first.x) / 2),
        y: Math.round((last.y + first.y) / 2),
      };
    } else {
      newPt = { x: 300, y: 400 };
    }
    updateSelectedArea((prev) => ({
      ...prev,
      area: {
        ...prev.area,
        points: [...prev.area.points, newPt],
      },
    }));
  };

  // Remove vertex from polygon
  const handleRemovePointFromPolygon = (index: number) => {
    if (!selectedArea) return;
    if (selectedArea.area.points.length <= 3) {
      alert('حداقل ۳ نقطه برای تشکیل چندضلعی لازم است.');
      return;
    }
    updateSelectedArea((prev) => ({
      ...prev,
      area: {
        ...prev.area,
        points: prev.area.points.filter((_, i) => i !== index),
      },
    }));
  };

  // Edit vertex coordinates directly
  const handlePointCoordChange = (index: number, axis: 'x' | 'y', value: number) => {
    updateSelectedArea((prev) => ({
      ...prev,
      area: {
        ...prev.area,
        points: prev.area.points.map((p, i) =>
          i === index ? { ...p, [axis]: value } : p
        ),
      },
    }));
  };

  // Edit lamp coordinates directly
  const handleLampCoordChange = (axis: 'x' | 'y', value: number) => {
    updateSelectedArea((prev) => ({
      ...prev,
      lampPosition: {
        ...prev.lampPosition,
        [axis]: value,
      },
    }));
  };

  // Pointer event handlers on SVG
  const handlePointerDown = (e: React.PointerEvent) => {
    if (
      e.target === containerRef.current ||
      (e.target as HTMLElement).tagName === 'svg' ||
      (e.target as HTMLElement).tagName === 'path'
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Dragging a polygon vertex
    if (draggingVertexIndex !== null && selectedArea) {
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (coords) {
        handlePointCoordChange(draggingVertexIndex, 'x', coords.x);
        handlePointCoordChange(draggingVertexIndex, 'y', coords.y);
      }
      return;
    }

    // Dragging the lamp
    if (isDraggingLamp && selectedArea) {
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (coords) {
        handleLampCoordChange('x', coords.x);
        handleLampCoordChange('y', coords.y);
      }
      return;
    }

    // Dragging the whole polygon
    if (isDraggingPolygon && polygonDragStartRef.current && selectedArea) {
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (coords) {
        const deltaX = coords.x - polygonDragStartRef.current.startX;
        const deltaY = coords.y - polygonDragStartRef.current.startY;
        const init = polygonDragStartRef.current.initialPoints;
        updateSelectedArea((prev) => ({
          ...prev,
          area: {
            ...prev.area,
            points: init.map((pt) => ({
              x: Math.round(Math.max(0, Math.min(vbWidth, pt.x + deltaX))),
              y: Math.round(Math.max(0, Math.min(vbHeight, pt.y + deltaY))),
            })),
          },
        }));
      }
      return;
    }

    // Canvas panning
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingVertexIndex !== null || isDraggingLamp || isDraggingPolygon) {
      saveGalleryAreas(areas);
      setDraggingVertexIndex(null);
      setIsDraggingLamp(false);
      setIsDraggingPolygon(false);
      polygonDragStartRef.current = null;
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

  // Start dragging a polygon vertex
  const handleVertexPointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggingVertexIndex(index);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Start dragging the lamp
  const handleLampPointerDown = (areaId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedAreaId(areaId);
    setIsDraggingLamp(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Start dragging the whole polygon
  const handlePolygonPointerDown = (areaId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedAreaId(areaId);
    const coords = getSvgCoordinates(e.clientX, e.clientY);
    const target = areas.find((a) => a.id === areaId);
    if (coords && target) {
      setIsDraggingPolygon(true);
      polygonDragStartRef.current = {
        startX: coords.x,
        startY: coords.y,
        initialPoints: [...target.area.points],
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  // Available galleries list
  const availableGalleries = GALLERIES.filter((g) => g.id !== 'gallery-00');
  const configuredGalleryIds = new Set(areas.map((a) => a.galleryId));
  const unconfiguredGalleries = availableGalleries.filter(
    (g) => !configuredGalleryIds.has(g.id)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f2f0]">
      {/* Sub-Header Toolbar for Gallery Areas Management */}
      <div className="h-12 bg-[#faf9f6] border-b border-[#0e0f0f] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#1e1b18] uppercase tracking-wider">
            <Compass className="w-4 h-4 text-[#c5a059]" />
            محدوده‌های گالری روی نقشه جامع (Gallery Areas)
          </span>
          <span className="text-[11px] font-mono text-[#7a746e] px-2 py-0.5 bg-[#f0eee9] rounded border border-[#0e0f0f]">
            نقشه مبنا: گالری ۰۰ (604.8 × 844.86)
          </span>
        </div>

        {/* Action Buttons: Save & Reset */}
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              ذخیره شد!
            </span>
          )}
          <button
            id="btn-save-gallery-areas"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1b18] text-[#f4f2f0] text-xs font-medium rounded hover:bg-[#322d28] transition-colors cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            ذخیره تغییرات
          </button>
          <button
            id="btn-reset-gallery-areas"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f0eee9] text-[#7a746e] hover:text-[#1e1b18] text-xs rounded border border-[#0e0f0f] transition-colors cursor-pointer"
            title="بازنشانی به پیش‌فرض"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Right Sidebar: Area list and Area configuration form */}
        <div className="w-96 bg-[#faf9f6] border-l border-[#0e0f0f] flex flex-col shrink-0 overflow-y-auto z-20 shadow-sm">
          {/* Top Info Banner */}
          <div className="p-3 bg-[#fdfcf9] border-b border-[#0e0f0f] text-[11px] text-[#554f47] leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1e1b18] mb-0.5">
                راهنمای سیستم موقعیت بازیکن (Player Location)
              </p>
              <p>
                روی نقشه گالری ۰۰، محدوده فیزیکی هر گالری (چندضلعی) و محل قرارگیری لامپ را مشخص کنید. هنگام حضور بازیکن در هر گالری، لامپ در موقعیت تنظیم‌شده ظاهر می‌شود.
              </p>
            </div>
          </div>

          {/* Configured Gallery Areas List */}
          <div className="p-3 border-b border-[#0e0f0f]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider">
                محدوده‌های پیکربندی‌شده ({areas.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {areas.map((area) => {
                const isSelected = area.id === selectedAreaId;
                const isCurrentPlayerArea = activePlayerLoc === area.galleryId;
                return (
                  <div
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`p-2.5 rounded border transition-all cursor-pointer text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#f0eee9] border-[#c5a059] ring-1 ring-[#c5a059]/40 shadow-xs'
                        : 'bg-white border-[#0e0f0f] hover:border-[#7a746e]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          isSelected ? 'bg-[#c5a059]' : 'bg-[#7a746e]/40'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-[#1e1b18] flex items-center gap-1.5">
                          {area.title || area.galleryId}
                          {isCurrentPlayerArea && (
                            <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-900 rounded font-semibold border border-amber-300">
                              موقعیت فعلی بازیکن
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#7a746e] font-mono mt-0.5 flex items-center gap-2">
                          <span>{area.area.points.length} رأس چندضلعی</span>
                          <span>•</span>
                          <span>لامپ: ({area.lampPosition.x}, {area.lampPosition.y})</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteArea(area.id, e)}
                      className="p-1 text-[#7a746e] hover:text-red-600 rounded transition-colors"
                      title="حذف محدوده"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {areas.length === 0 && (
                <div className="p-4 text-center text-xs text-[#7a746e] border border-dashed border-[#0e0f0f] rounded">
                  هیچ محدوده‌ای هنوز پیکربندی نشده است.
                </div>
              )}
            </div>
          </div>

          {/* Unconfigured Galleries Section */}
          {unconfiguredGalleries.length > 0 && (
            <div className="p-3 border-b border-[#0e0f0f] bg-[#f7f5f2]">
              <div className="text-[11px] font-bold text-[#7a746e] uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#c5a059]" />
                گالری‌های تنظیم‌نشده ({unconfiguredGalleries.length})
              </div>
              <div className="space-y-1.5">
                {unconfiguredGalleries.map((ug) => (
                  <div
                    key={ug.id}
                    className="p-2 bg-white rounded border border-[#0e0f0f] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-[#1e1b18]">{ug.nameFa}</span>
                      <span className="block text-[10px] text-[#7a746e] font-mono">{ug.id}</span>
                    </div>
                    <button
                      onClick={() => handleAddArea(ug.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-[#1e1b18] text-[#f4f2f0] text-[11px] font-medium rounded hover:bg-[#322d28] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      افزودن به نقشه
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Form for Selected Area */}
          {selectedArea ? (
            <div className="p-3 flex-1 space-y-4">
              <div className="border-b border-[#0e0f0f] pb-2">
                <span className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider block">
                  تنظیمات: {selectedArea.title || selectedArea.galleryId}
                </span>
                <span className="text-[10px] text-[#7a746e] font-mono">شناسه: {selectedArea.galleryId}</span>
              </div>

              {/* Lamp Position Setting */}
              <div className="space-y-2 bg-[#f4f2f0] p-3 rounded border border-[#0e0f0f]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1e1b18] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                    موقعیت لامپ روی نقشه جامع (SVG)
                  </span>
                  <span className="text-[10px] text-[#7a746e]">درگ یا ویرایش عدد</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-[#7a746e] mb-1 font-mono">مختصات X (عرض):</label>
                    <input
                      type="number"
                      value={selectedArea.lampPosition.x}
                      onChange={(e) => handleLampCoordChange('x', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-[#0e0f0f] rounded font-mono text-xs focus:outline-none focus:border-[#c5a059]"
                      min="0"
                      max={vbWidth}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#7a746e] mb-1 font-mono">مختصات Y (ارتفاع):</label>
                    <input
                      type="number"
                      value={selectedArea.lampPosition.y}
                      onChange={(e) => handleLampCoordChange('y', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-[#0e0f0f] rounded font-mono text-xs focus:outline-none focus:border-[#c5a059]"
                      min="0"
                      max={vbHeight}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#7a746e] italic">
                  * همچنین می‌توانید نشانگر لامپ زرد رنگ را مستقیماً روی نقشه درگ کنید.
                </p>
              </div>

              {/* Polygon Area Points Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1e1b18] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
                    رئوس چندضلعی محدوده ({selectedArea.area.points.length} نقطه)
                  </span>
                  <button
                    onClick={handleAddPointToPolygon}
                    className="flex items-center gap-1 px-2 py-1 bg-[#1e1b18] text-[#f4f2f0] text-[10px] rounded hover:bg-[#322d28] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    افزودن رأس
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
                  {selectedArea.area.points.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-white border border-[#0e0f0f] rounded text-xs flex items-center justify-between gap-2"
                    >
                      <span className="font-mono text-[11px] font-bold text-[#7a746e] shrink-0 w-6">
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-[10px] text-[#7a746e] font-mono">X:</span>
                          <input
                            type="number"
                            value={pt.x}
                            onChange={(e) => handlePointCoordChange(idx, 'x', Number(e.target.value))}
                            className="w-full px-1.5 py-0.5 bg-[#fdfcf9] border border-[#0e0f0f] rounded font-mono text-[11px]"
                            min="0"
                            max={vbWidth}
                          />
                        </div>
                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-[10px] text-[#7a746e] font-mono">Y:</span>
                          <input
                            type="number"
                            value={pt.y}
                            onChange={(e) => handlePointCoordChange(idx, 'y', Number(e.target.value))}
                            className="w-full px-1.5 py-0.5 bg-[#fdfcf9] border border-[#0e0f0f] rounded font-mono text-[11px]"
                            min="0"
                            max={vbHeight}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePointFromPolygon(idx)}
                        className="p-1 text-[#7a746e] hover:text-red-600 rounded"
                        title="حذف این رأس"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#7a746e] italic">
                  * می‌توانید نقاط آبی‌رنگ را مستقیماً روی نقشه درگ کنید یا با درگ بدنه چندضلعی کل محدوده را جابجا کنید.
                </p>
              </div>

              {/* Player Location Simulation Controls for Testing */}
              <div className="pt-2 border-t border-[#0e0f0f]">
                <span className="text-[11px] font-bold text-[#1e1b18] uppercase tracking-wider block mb-1">
                  تست سریع موقعیت بازیکن (Test Simulation)
                </span>
                <p className="text-[10px] text-[#7a746e] mb-2">
                  برای راستی‌آزمایی، بازیکن را به این گالری ببرید تا تست کنید:
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentGalleryId(selectedArea.galleryId);
                      setActivePlayerLoc(selectedArea.galleryId);
                    }}
                    className={`flex-1 py-1 px-2 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                      activePlayerLoc === selectedArea.galleryId
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                        : 'bg-white border-[#0e0f0f] text-[#1e1b18] hover:bg-[#f0eee9]'
                    }`}
                  >
                    انتقال موقعیت بازیکن به این گالری
                  </button>
                  <button
                    onClick={() => {
                      setCurrentGalleryId('gallery-00');
                      setActivePlayerLoc('gallery-00');
                    }}
                    className="py-1 px-2 text-[10px] bg-white border border-[#0e0f0f] rounded hover:bg-[#f0eee9] text-[#7a746e]"
                    title="بازگشت به گالری ۰۰ (ورودی)"
                  >
                    گالری ۰۰
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#7a746e] flex flex-col items-center justify-center flex-1">
              <Compass className="w-8 h-8 text-[#7a746e]/40 mb-2" />
              یک محدوده گالری را از لیست بالا انتخاب کنید تا تنظیمات آن نمایش داده شود.
            </div>
          )}
        </div>

        {/* Right Canvas: Gallery 00 Master Map */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex-1 relative overflow-hidden bg-[#e8e4de] flex items-center justify-center cursor-crosshair select-none"
        >
          {/* Zoom & Pan Controls Floating Widget */}
          <div className="absolute top-4 left-4 z-40 flex flex-col gap-1 bg-[#faf9f6] border border-[#0e0f0f] rounded p-1 shadow-md">
            <button
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
              className="p-1.5 hover:bg-[#f0eee9] rounded text-[#1e1b18] transition-colors"
              title="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
              className="p-1.5 hover:bg-[#f0eee9] rounded text-[#1e1b18] transition-colors"
              title="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 hover:bg-[#f0eee9] rounded text-[#1e1b18] transition-colors"
              title="تنظیم مجدد اندازه"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Coordinate Display Overlay */}
          <div className="absolute bottom-4 left-4 z-40 bg-[#faf9f6]/95 border border-[#0e0f0f] rounded px-3 py-1.5 text-[11px] font-mono text-[#554f47] shadow-sm flex items-center gap-3">
            <span>مقیاس: {Math.round(zoom * 100)}%</span>
            <span>•</span>
            <span>ابعاد SVG: {vbWidth} × {vbHeight}</span>
            {selectedArea && (
              <>
                <span>•</span>
                <span className="text-[#c5a059] font-bold">
                  لامپ: ({selectedArea.lampPosition.x}, {selectedArea.lampPosition.y})
                </span>
              </>
            )}
          </div>

          {/* Interactive Scaled & Panned SVG Map Canvas */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            }}
            className="relative"
          >
            {/* Gallery 00 Base SVG */}
            <div className="relative pointer-events-none" style={{ width: `${vbWidth}px`, height: `${vbHeight}px` }}>
              <Gallery00MapSvg
                width="100%"
                height="100%"
                className="w-full h-full filter drop-shadow-md"
              />
            </div>

            {/* Interactive SVG Overlay Layer for Polygons, Vertices, and Lamps */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${vbWidth} ${vbHeight}`}
              className="absolute inset-0 w-full h-full pointer-events-auto"
              style={{ width: `${vbWidth}px`, height: `${vbHeight}px` }}
            >
              <defs>
                {/* Subtle radial glow filter for the admin lamp indicator */}
                <radialGradient id="adminLampGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Render ALL configured Gallery Areas (polygons) */}
              {areas.map((area) => {
                const isSelected = area.id === selectedAreaId;
                const pointsStr = area.area.points.map((p) => `${p.x},${p.y}`).join(' ');

                return (
                  <g key={area.id} id={`group-${area.id}`}>
                    {/* Polygon Area Fill and Border */}
                    <polygon
                      points={pointsStr}
                      fill={isSelected ? 'rgba(197, 160, 89, 0.28)' : 'rgba(30, 27, 24, 0.14)'}
                      stroke={isSelected ? '#c5a059' : '#554f47'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeDasharray={isSelected ? 'none' : '4 3'}
                      className="cursor-move transition-colors"
                      onPointerDown={(e) => handlePolygonPointerDown(area.id, e)}
                    />

                    {/* Area Label inside polygon */}
                    {area.area.points.length > 0 && (() => {
                      const avgX = area.area.points.reduce((sum, p) => sum + p.x, 0) / area.area.points.length;
                      const avgY = area.area.points.reduce((sum, p) => sum + p.y, 0) / area.area.points.length;
                      return (
                        <text
                          x={avgX}
                          y={avgY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isSelected ? '#1e1b18' : '#7a746e'}
                          fontSize="11"
                          fontWeight="bold"
                          pointerEvents="none"
                          className="select-none font-sans"
                        >
                          {area.title || area.galleryId}
                        </text>
                      );
                    })()}

                    {/* If this area is selected, render interactive vertex handles */}
                    {isSelected &&
                      area.area.points.map((pt, idx) => (
                        <g key={idx}>
                          {/* Vertex Touch target */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={8}
                            fill="#0284c7"
                            stroke="#ffffff"
                            strokeWidth={2}
                            className="cursor-grab active:cursor-grabbing transition-transform hover:scale-125"
                            onPointerDown={(e) => handleVertexPointerDown(idx, e)}
                          />
                          {/* Vertex Label number */}
                          <text
                            x={pt.x}
                            y={pt.y - 12}
                            textAnchor="middle"
                            fill="#0284c7"
                            fontSize="9"
                            fontWeight="bold"
                            pointerEvents="none"
                          >
                            #{idx + 1}
                          </text>
                        </g>
                      ))}

                    {/* Lamp indicator and draggable handle for each configured area */}
                    <g
                      transform={`translate(${area.lampPosition.x}, ${area.lampPosition.y})`}
                      className="cursor-grab active:cursor-grabbing"
                      onPointerDown={(e) => handleLampPointerDown(area.id, e)}
                    >
                      {/* Outer Glow Halo */}
                      <circle cx={0} cy={0} r={18} fill="url(#adminLampGlow)" pointerEvents="none" />

                      {/* Connection Line from lamp to polygon center if selected */}
                      {isSelected && area.area.points.length > 0 && (() => {
                        const avgX = area.area.points.reduce((sum, p) => sum + p.x, 0) / area.area.points.length;
                        const avgY = area.area.points.reduce((sum, p) => sum + p.y, 0) / area.area.points.length;
                        return (
                          <line
                            x1={0}
                            y1={0}
                            x2={avgX - area.lampPosition.x}
                            y2={avgY - area.lampPosition.y}
                            stroke="#f59e0b"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                            pointerEvents="none"
                          />
                        );
                      })()}

                      {/* Stylized Lamp Shape Icon - Sized up slightly with refined thin outline */}
                      <circle
                        cx={0}
                        cy={-2}
                        r={9}
                        fill="#fbbf24"
                        stroke="#1e1b18"
                        strokeWidth={1.25}
                      />
                      <rect
                        x={-3}
                        y={6}
                        width={6}
                        height={4.5}
                        fill="#78350f"
                        stroke="#1e1b18"
                        strokeWidth={1.1}
                        rx={0.5}
                      />

                      {/* Label badge for the lamp - matching section points style */}
                      {/* Badge drop shadow */}
                      <rect
                        x={-25.5}
                        y={13.5}
                        width={51}
                        height={14}
                        rx={3}
                        fill="#1e1b18"
                        pointerEvents="none"
                      />
                      {/* Badge white card */}
                      <rect
                        x={-27}
                        y={12}
                        width={51}
                        height={14}
                        rx={3}
                        fill="#ffffff"
                        stroke="#1e1b18"
                        strokeWidth={1.5}
                        pointerEvents="none"
                      />
                      <text
                        x={-1.5}
                        y={22}
                        textAnchor="middle"
                        fill="#1e1b18"
                        fontSize="8"
                        fontWeight="900"
                        fontFamily="Tanha, Vazirmatn, sans-serif"
                        pointerEvents="none"
                      >
                        {formatGalleryLabelFa(area.galleryId)}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
