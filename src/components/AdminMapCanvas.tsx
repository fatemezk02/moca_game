import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  AdminMapPoint,
  GalleryConfig,
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
} from '../types/admin';
import { CustomIconRender } from './CustomIconRender';
import { CollectionPointMarker } from './CollectionPointMarker';
import { PuzzlePointMarker } from './PuzzlePointMarker';
import { Gallery00MapSvg } from './Gallery00MapSvg';
import { Gallery01MapSvg } from './Gallery01MapSvg';
import { Gallery03MapSvg } from './Gallery03MapSvg';
import { ZoomIn, ZoomOut, RotateCcw, Move, Crosshair } from 'lucide-react';

interface AdminMapCanvasProps {
  gallery: GalleryConfig;
  points: AdminMapPoint[];
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  onPointMove: (id: string, newX: number, newY: number) => void;
}

export const AdminMapCanvas: React.FC<AdminMapCanvasProps> = ({
  gallery,
  points,
  selectedPointId,
  onSelectPoint,
  onPointMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging point state
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null);

  const [vbX, vbY, vbWidth, vbHeight] = gallery.viewBox.split(' ').map(Number);

  // Convert client pointer event (screen coords) to SVG coordinate space
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

  // Handle Point dragging
  const handlePointPointerDown = (pointId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    onSelectPoint(pointId);
    setDraggingPointId(pointId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingPointId) {
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (coords) {
        onPointMove(draggingPointId, coords.x, coords.y);
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
    if (draggingPointId) {
      setDraggingPointId(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture already released
      }
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Background map pan handler
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // Left click on background deselects or starts pan
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'path') {
      onSelectPoint(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-full bg-[#f4f2f0] overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
    >
      {/* Grid Pattern Background for visual alignment */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#0e0f0f 1px, transparent 1px), linear-gradient(90deg, #0e0f0f 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Canvas Controls */}
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
          onClick={handleReset}
          title="Reset View"
          className="p-1.5 hover:bg-[#0e0f0f] hover:text-[#fbf9f9] text-[#0e0f0f] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="font-mono-custom text-[10px] px-2 py-0.5 border-l border-[#0e0f0f] text-[#0e0f0f] font-bold">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Transform Container with Zoom & Pan */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning || draggingPointId ? 'none' : 'transform 0.15s ease-out',
        }}
        className="relative max-h-[90%] max-w-[90%] flex items-center justify-center"
      >
        {/* SVG Floor Plan Canvas */}
        <div
          style={{
            aspectRatio: `${vbWidth} / ${vbHeight}`,
            width: gallery.id === 'gallery-01' || gallery.id === 'gallery-03' ? '460px' : '560px',
            maxWidth: '100%',
          }}
          className="relative bg-[#fbf9f9] border border-[#0e0f0f] shadow-xl p-4"
        >
          {gallery.id === 'gallery-01' ? (
            /* Gallery 01 Architectural SVG Plan */
            <Gallery01MapSvg
              ref={svgRef}
              className="w-full h-full object-contain pointer-events-auto"
            />
          ) : gallery.id === 'gallery-03' ? (
            /* Gallery 03 Architectural SVG Plan */
            <Gallery03MapSvg
              ref={svgRef}
              className="w-full h-full object-contain pointer-events-auto"
            />
          ) : (
            /* Gallery 00 Architectural SVG Plan */
            <Gallery00MapSvg
              ref={svgRef}
              className="w-full h-full object-contain pointer-events-auto"
            />
          )}

          {/* Interactive Points Overlay (Anchored exactly in SVG coordinate percentage space) */}
          <div className="absolute inset-4 pointer-events-none">
            {points.map((pt, idx) => {
              const leftPercent = (pt.x / vbWidth) * 100;
              const topPercent = (pt.y / vbHeight) * 100;
              const isSelected = selectedPointId === pt.id;
              const isDragging = draggingPointId === pt.id;

              return (
                <div
                  key={pt.id}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-30 touch-none"
                >
                  <div
                    onPointerDown={(e) => handlePointPointerDown(pt.id, e)}
                    className={`relative cursor-grab active:cursor-grabbing group p-1 flex items-center justify-center transition-transform ${
                      isSelected ? 'scale-125 z-40' : 'hover:scale-115'
                    }`}
                  >
                    {/* Selected Halo / Target Indicator */}
                    {isSelected && (
                      <span className="absolute -inset-2 border-2 border-dashed border-[#c5a059] rounded-full animate-spin [animation-duration:8s] pointer-events-none" />
                    )}

                    {pt.type === 'collection' ? (
                      /* Collection Point (Type A) Marker */
                      <CollectionPointMarker
                        pointType={(pt as AdminCollectionPoint).pointType || 'normal'}
                        isSelected={isSelected}
                        showPulse={false}
                      />
                    ) : pt.type === 'puzzle' ? (
                      /* Puzzle Point Marker */
                      <PuzzlePointMarker
                        isSelected={isSelected}
                        isActive={(pt as AdminPuzzlePoint).isActive !== false}
                      />
                    ) : (
                      /* Custom Icon Point (Type B) Marker */
                      <div
                        className={`p-0.5 transition-all ${
                          isSelected
                            ? 'ring-2 ring-[#c5a059] ring-offset-2 ring-offset-[#fbf9f9]'
                            : ''
                        }`}
                      >
                        <CustomIconRender point={pt as AdminIconPoint} />
                      </div>
                    )}

                    {/* Point Label / Coords Tooltip */}
                    <div
                      className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#0e0f0f] text-[#fbf9f9] text-[9px] font-mono-custom whitespace-nowrap pointer-events-none rounded shadow-sm z-50 transition-opacity ${
                        isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="font-bold truncate max-w-[120px]">{pt.title}</div>
                      <div className="text-[8px] text-[#c5a059]">
                        X: {pt.x}, Y: {pt.y}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Helper Footer Hint */}
      <div className="absolute bottom-3 left-4 z-30 bg-[#0e0f0f]/80 backdrop-blur-xs text-[#fbf9f9] text-[10px] font-mono-custom px-2.5 py-1 rounded flex items-center gap-2">
        <Move className="w-3 h-3 text-[#c5a059]" />
        <span>بکشید و رها کنید (Drag to position) • مختصات دقیق SVG</span>
      </div>
    </div>
  );
};
