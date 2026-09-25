import React, { useState, useRef, useCallback } from 'react';
import {
  Crosshair,
  Copy,
  Check,
  X,
  RotateCcw,
  Target,
  Maximize2,
  Minimize2,
  Sliders,
  Move,
  Scaling,
  Eye
} from 'lucide-react';
import { Gallery07MapSvg } from './Gallery07MapSvg';
import { Gallery08MapSvg } from './Gallery08MapSvg';

interface Gallery06To07TransitionEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Canonical Map SVG Dimensions
const G06_MAP_WIDTH = 544.58;
const G06_MAP_HEIGHT = 650;

const G07_MAP_WIDTH = 501.5;
const G07_MAP_HEIGHT = 642.18;

// Initial Default Values
const DEFAULT_G06_ANCHOR = { x: 227.28, y: 638.5 };
const DEFAULT_G07_ANCHOR = { x: 445.16, y: 34.65 };
const DEFAULT_G07_POS = { x: -240.14, y: 602.12 };
const DEFAULT_G07_SCALE = 1.05;

/**
 * Visual Positioning Canvas for Gallery 06 -> Gallery 07 Transition.
 *
 * Features:
 * - Real Gallery 06 & Gallery 07 SVG artwork rendered simultaneously.
 * - Dynamic SVG viewBox framing so both maps are ALWAYS fully visible without clipping.
 * - Click & Drag Gallery 07 map directly anywhere on canvas.
 * - Visual scale corner handle to resize Gallery 07 relative to Gallery 06.
 * - Draggable anchor crosshairs for both maps with live SVG coordinate badges.
 * - Connecting alignment guide line.
 * - Numeric precision controls & clipboard export.
 */
export const Gallery06To07TransitionEditor: React.FC<Gallery06To07TransitionEditorProps> = ({
  isOpen,
  onClose,
}) => {
  // Gallery 07 Transform State (in G06 SVG space)
  const [g07X, setG07X] = useState<number>(DEFAULT_G07_POS.x);
  const [g07Y, setG07Y] = useState<number>(DEFAULT_G07_POS.y);
  const [g07Scale, setG07Scale] = useState<number>(DEFAULT_G07_SCALE);

  // Anchor Coordinates (in respective map SVG space)
  const [g06Anchor, setG06Anchor] = useState(DEFAULT_G06_ANCHOR);
  const [g07Anchor, setG07Anchor] = useState(DEFAULT_G07_ANCHOR);

  // UI State
  const [copied, setCopied] = useState(false);
  const [ghostOpacity, setGhostOpacity] = useState(0.6);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [activeDragTarget, setActiveDragTarget] = useState<
    'g07-map' | 'g07-scale-handle' | 'g06-anchor' | 'g07-anchor' | null
  >(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    pageX: number;
    pageY: number;
    initialX: number;
    initialY: number;
    initialScale: number;
    initialAnchorX: number;
    initialAnchorY: number;
  }>({
    pageX: 0,
    pageY: 0,
    initialX: 0,
    initialY: 0,
    initialScale: 1,
    initialAnchorX: 0,
    initialAnchorY: 0,
  });

  // Calculate G07 Anchor position in G06 world coordinates
  const g07AnchorWorldX = g07X + g07Anchor.x * g07Scale;
  const g07AnchorWorldY = g07Y + g07Anchor.y * g07Scale;

  // Alignment check
  const anchorDistance = Math.hypot(g06Anchor.x - g07AnchorWorldX, g06Anchor.y - g07AnchorWorldY);
  const anchorsCoincide = anchorDistance < 2.5;

  // Dynamic Bounding Box for Shared Canvas ViewBox
  // Encompasses both Gallery 06 and Gallery 07 with safety padding so NO portion is clipped
  const worldMinX = Math.min(-150, Math.min(0, g07X) - 60);
  const worldMaxX = Math.max(700, Math.max(G06_MAP_WIDTH, g07X + G07_MAP_WIDTH * g07Scale) + 60);
  const worldMinY = Math.min(-100, Math.min(0, g07Y) - 60);
  const worldMaxY = Math.max(800, Math.max(G06_MAP_HEIGHT, g07Y + G07_MAP_HEIGHT * g07Scale) + 60);

  const worldWidth = worldMaxX - worldMinX;
  const worldHeight = worldMaxY - worldMinY;

  // Helper to convert screen pointer delta into SVG map coordinates
  const getSvgScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 1;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 1;
    return worldWidth / rect.width;
  }, [worldWidth]);

  // Pointer Down Handlers
  const handlePointerDown = (
    e: React.PointerEvent,
    target: 'g07-map' | 'g07-scale-handle' | 'g06-anchor' | 'g07-anchor'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setActiveDragTarget(target);

    dragStartRef.current = {
      pageX: e.clientX,
      pageY: e.clientY,
      initialX: g07X,
      initialY: g07Y,
      initialScale: g07Scale,
      initialAnchorX: target === 'g06-anchor' ? g06Anchor.x : g07Anchor.x,
      initialAnchorY: target === 'g06-anchor' ? g06Anchor.y : g07Anchor.y,
    };
  };

  // Pointer Move Handler
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragTarget) return;

    const svgScale = getSvgScale();
    const dx = (e.clientX - dragStartRef.current.pageX) * svgScale;
    const dy = (e.clientY - dragStartRef.current.pageY) * svgScale;

    if (activeDragTarget === 'g07-map') {
      setG07X(Math.round((dragStartRef.current.initialX + dx) * 100) / 100);
      setG07Y(Math.round((dragStartRef.current.initialY + dy) * 100) / 100);
    } else if (activeDragTarget === 'g07-scale-handle') {
      // Scale based on dragging corner handle
      const newWidth = G07_MAP_WIDTH * dragStartRef.current.initialScale + dx;
      const newScale = Math.max(0.4, Math.min(2.5, newWidth / G07_MAP_WIDTH));
      setG07Scale(Math.round(newScale * 1000) / 1000);
    } else if (activeDragTarget === 'g06-anchor') {
      const newX = Math.max(0, Math.min(G06_MAP_WIDTH, dragStartRef.current.initialAnchorX + dx));
      const newY = Math.max(0, Math.min(G06_MAP_HEIGHT, dragStartRef.current.initialAnchorY + dy));
      setG06Anchor({
        x: Math.round(newX * 100) / 100,
        y: Math.round(newY * 100) / 100,
      });
    } else if (activeDragTarget === 'g07-anchor') {
      const dxLocal = dx / g07Scale;
      const dyLocal = dy / g07Scale;
      const newX = Math.max(0, Math.min(G07_MAP_WIDTH, dragStartRef.current.initialAnchorX + dxLocal));
      const newY = Math.max(0, Math.min(G07_MAP_HEIGHT, dragStartRef.current.initialAnchorY + dyLocal));
      setG07Anchor({
        x: Math.round(newX * 100) / 100,
        y: Math.round(newY * 100) / 100,
      });
    }
  };

  // Pointer Up Handler
  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragTarget) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setActiveDragTarget(null);
    }
  };

  // Snap G07 Position so G07 Anchor aligns with G06 Anchor
  const handleSnapAnchors = () => {
    const alignedX = g06Anchor.x - g07Anchor.x * g07Scale;
    const alignedY = g06Anchor.y - g07Anchor.y * g07Scale;
    setG07X(Math.round(alignedX * 100) / 100);
    setG07Y(Math.round(alignedY * 100) / 100);
  };

  // Reset to default coordinates
  const handleReset = () => {
    setG07X(DEFAULT_G07_POS.x);
    setG07Y(DEFAULT_G07_POS.y);
    setG07Scale(DEFAULT_G07_SCALE);
    setG06Anchor(DEFAULT_G06_ANCHOR);
    setG07Anchor(DEFAULT_G07_ANCHOR);
  };

  // Export report to plain text
  const generateReportText = () => {
    return `Source Gallery: gallery-06\nDestination Gallery: gallery-07\n\nGallery 06 Anchor:\nx = ${g06Anchor.x}\ny = ${g06Anchor.y}\n\nGallery 07 Anchor:\nx = ${g07Anchor.x}\ny = ${g07Anchor.y}\n\nGallery 07 Position:\nx = ${g07X}\ny = ${g07Y}\n\nGallery 07 Scale:\nscale = ${g07Scale}`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 shadow-lg shrink-0">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Sliders className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm sm:text-base text-amber-300">
            بوم بصری تنظیم موقعیت انطباق گالری ۰۶ ← گالری ۰۷
          </span>
          <span className="hidden lg:inline-block text-[11px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">
            Canvas World: {Math.round(worldWidth)} × {Math.round(worldHeight)}
          </span>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={handleCopyReport}
            className="flex items-center space-x-1.5 space-x-reverse px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'کپی شد!' : 'کپی خروجی'}</span>
          </button>

          <button
            onClick={handleReset}
            title="بازنشانی"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas + Control Panel Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* VISUAL MAP CANVAS */}
        <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden">
          <div
            ref={containerRef}
            className="relative w-full h-full max-w-full max-h-full border border-slate-800 bg-[#fbf9f9] rounded-2xl shadow-2xl overflow-hidden touch-none flex items-center justify-center"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Shared World SVG Render Engine */}
            <svg
              viewBox={`${worldMinX} ${worldMinY} ${worldWidth} ${worldHeight}`}
              className="w-full h-full object-contain overflow-visible"
            >
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect
                x={worldMinX}
                y={worldMinY}
                width={worldWidth}
                height={worldHeight}
                fill="url(#grid)"
              />

              {/* 1. Gallery 06 (Fixed Base Map) */}
              <g id="g06-fixed-base" transform="translate(0, 0)">
                <foreignObject width={G06_MAP_WIDTH} height={G06_MAP_HEIGHT}>
                  <div className="w-full h-full relative">
                    <Gallery07MapSvg className="w-full h-full object-contain" />
                  </div>
                </foreignObject>
              </g>

              {/* 2. Gallery 07 (Draggable Ghost Map) */}
              <g id="g07-draggable-ghost" transform={`translate(${g07X}, ${g07Y}) scale(${g07Scale})`}>
                <foreignObject width={G07_MAP_WIDTH} height={G07_MAP_HEIGHT}>
                  <div
                    style={{ opacity: ghostOpacity }}
                    className="w-full h-full relative border-2 border-cyan-500/60 rounded-lg shadow-xl"
                  >
                    <Gallery08MapSvg className="w-full h-full object-contain" />
                  </div>
                </foreignObject>

                {/* Direct Draggable Capture Overlay for Gallery 07 Map */}
                <rect
                  x="0"
                  y="0"
                  width={G07_MAP_WIDTH}
                  height={G07_MAP_HEIGHT}
                  fill="rgba(6, 182, 212, 0.08)"
                  stroke="#06b6d4"
                  strokeWidth={2 / g07Scale}
                  strokeDasharray="6 6"
                  className="pointer-events-auto cursor-grab active:cursor-grabbing hover:fill-cyan-500/20 transition-colors"
                  onPointerDown={(e) => handlePointerDown(e, 'g07-map')}
                />

                {/* Corner Scale Drag Handle */}
                <g
                  transform={`translate(${G07_MAP_WIDTH}, ${G07_MAP_HEIGHT})`}
                  className="pointer-events-auto cursor-nwse-resize"
                  onPointerDown={(e) => handlePointerDown(e, 'g07-scale-handle')}
                >
                  <circle r={14 / g07Scale} fill="#06b6d4" stroke="#ffffff" strokeWidth={2 / g07Scale} />
                  <rect
                    x={-8 / g07Scale}
                    y={-8 / g07Scale}
                    width={16 / g07Scale}
                    height={16 / g07Scale}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={1.5 / g07Scale}
                  />
                  <text
                    x={18 / g07Scale}
                    y={5 / g07Scale}
                    fill="#06b6d4"
                    fontSize={11 / g07Scale}
                    fontWeight="bold"
                    className="select-none font-mono"
                  >
                    Scale: {g07Scale.toFixed(2)}
                  </text>
                </g>
              </g>

              {/* 3. Connecting Alignment Guide Line */}
              <line
                x1={g06Anchor.x}
                y1={g06Anchor.y}
                x2={g07AnchorWorldX}
                y2={g07AnchorWorldY}
                stroke={anchorsCoincide ? '#10b981' : '#f59e0b'}
                strokeWidth={anchorsCoincide ? 3 : 2}
                strokeDasharray={anchorsCoincide ? 'none' : '5 5'}
              />

              {/* 4. Gallery 06 Anchor Marker (Amber Target) */}
              <g
                transform={`translate(${g06Anchor.x}, ${g06Anchor.y})`}
                className="pointer-events-auto cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => handlePointerDown(e, 'g06-anchor')}
              >
                <circle r="16" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#f59e0b" strokeWidth="2.5" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke="#f59e0b" strokeWidth="2.5" />
                <circle r="4" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" />
                <rect x="20" y="-18" width="130" height="20" rx="4" fill="#0f172a" fillOpacity="0.85" />
                <text x="25" y="-4" fill="#f59e0b" fontSize="11" fontWeight="bold" className="font-mono">
                  G06 ({g06Anchor.x}, {g06Anchor.y})
                </text>
              </g>

              {/* 5. Gallery 07 Anchor Marker (Cyan Target) */}
              <g
                transform={`translate(${g07AnchorWorldX}, ${g07AnchorWorldY})`}
                className="pointer-events-auto cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => handlePointerDown(e, 'g07-anchor')}
              >
                <circle r="16" fill="#06b6d4" fillOpacity="0.3" stroke="#06b6d4" strokeWidth="2" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#06b6d4" strokeWidth="2.5" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke="#06b6d4" strokeWidth="2.5" />
                <circle r="4" fill="#ffffff" stroke="#06b6d4" strokeWidth="1.5" />
                <rect x="20" y="4" width="130" height="20" rx="4" fill="#0f172a" fillOpacity="0.85" />
                <text x="25" y="18" fill="#06b6d4" fontSize="11" fontWeight="bold" className="font-mono">
                  G07 ({g07Anchor.x}, {g07Anchor.y})
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* BOTTOM / SIDE NUMERIC CONTROL PANEL */}
        <div
          className={`w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex flex-col p-4 space-y-4 overflow-y-auto shrink-0 text-xs transition-all duration-200 ${
            isPanelCollapsed ? 'max-h-12 md:w-12 overflow-hidden' : 'max-h-[45vh] md:max-h-full'
          }`}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
              <Sliders className="w-4 h-4 text-amber-400" />
              کنترل‌های عددی دقیق
            </span>
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="p-1 text-slate-400 hover:text-white"
            >
              {isPanelCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>

          {!isPanelCollapsed && (
            <>
              {/* Alignment Status Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  anchorsCoincide
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Target className={`w-4 h-4 ${anchorsCoincide ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span className="font-medium text-xs">
                    {anchorsCoincide
                      ? '✓ انکورها انطباق دارند'
                      : `فاصله انکورها: ${anchorDistance.toFixed(1)} px`}
                  </span>
                </div>
                {!anchorsCoincide && (
                  <button
                    onClick={handleSnapAnchors}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] transition-colors shadow"
                  >
                    انطباق آنی
                  </button>
                )}
              </div>

              {/* Gallery 07 Position & Scale */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between font-bold text-cyan-400 text-xs">
                  <span className="flex items-center gap-1">
                    <Move className="w-3.5 h-3.5" /> موقعیت گالری ۰۷
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">G07 Pos</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">X (افقی)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={g07X}
                      onChange={(e) => setG07X(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-mono text-center focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Y (عمودی)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={g07Y}
                      onChange={(e) => setG07Y(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-mono text-center focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Scaling className="w-3 h-3 text-cyan-400" /> مقیاس (Scale)
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{g07Scale.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.0"
                    step="0.005"
                    value={g07Scale}
                    onChange={(e) => setG07Scale(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Gallery 06 Anchor Inputs */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-400 text-xs">
                  <span>انکور گالری ۰۶</span>
                  <span className="font-mono text-[10px] text-slate-500">G06 Anchor</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Anchor X</label>
                    <input
                      type="number"
                      step="0.1"
                      value={g06Anchor.x}
                      onChange={(e) =>
                        setG06Anchor((prev) => ({ ...prev, x: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-mono text-center focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Anchor Y</label>
                    <input
                      type="number"
                      step="0.1"
                      value={g06Anchor.y}
                      onChange={(e) =>
                        setG06Anchor((prev) => ({ ...prev, y: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-mono text-center focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Gallery 07 Anchor Inputs */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between font-bold text-cyan-400 text-xs">
                  <span>انکور گالری ۰۷</span>
                  <span className="font-mono text-[10px] text-slate-500">G07 Anchor</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Anchor X</label>
                    <input
                      type="number"
                      step="0.1"
                      value={g07Anchor.x}
                      onChange={(e) =>
                        setG07Anchor((prev) => ({ ...prev, x: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-mono text-center focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Anchor Y</label>
                    <input
                      type="number"
                      step="0.1"
                      value={g07Anchor.y}
                      onChange={(e) =>
                        setG07Anchor((prev) => ({ ...prev, y: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-mono text-center focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ghost Layer Opacity Slider */}
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> شفافیت لایه روح گالری ۰۷
                  </span>
                  <span className="font-mono">{Math.round(ghostOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={ghostOpacity}
                  onChange={(e) => setGhostOpacity(parseFloat(e.target.value))}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>

              {/* Output Preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 whitespace-pre-wrap select-all leading-relaxed overflow-x-auto shadow-inner">
                {generateReportText()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
