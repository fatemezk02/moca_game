import React, { useRef, useState } from 'react';
import { ArtworkFrameConfig } from '../types/admin';
import { Upload, RotateCcw, Trash2, ZoomIn, Move, Image as ImageIcon } from 'lucide-react';

interface ArtworkFrameEditorProps {
  frame: ArtworkFrameConfig;
  frameIndex: number;
  totalFrames: number;
  onUpdate: (updated: ArtworkFrameConfig) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ArtworkFrameEditor: React.FC<ArtworkFrameEditorProps> = ({
  frame,
  frameIndex,
  totalFrames,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialFrameX: 0, initialFrameY: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdate({
        ...frame,
        image: dataUrl,
        imageName: file.name,
        x: 0,
        y: 0,
        scale: 1,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDownOnFrame = (e: React.MouseEvent) => {
    if (!frame.image) return;
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialFrameX: frame.x,
      initialFrameY: frame.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingImage || !frameContainerRef.current) return;
    const rect = frameContainerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    const newX = Math.round(dragStart.initialFrameX + deltaXPercent);
    const newY = Math.round(dragStart.initialFrameY + deltaYPercent);

    onUpdate({
      ...frame,
      x: Math.max(-100, Math.min(100, newX)),
      y: Math.max(-100, Math.min(100, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  const handleResetPosition = () => {
    onUpdate({
      ...frame,
      x: 0,
      y: 0,
      scale: 1,
    });
  };

  const handleRemoveImage = () => {
    onUpdate({
      ...frame,
      image: undefined,
      imageName: undefined,
      x: 0,
      y: 0,
      scale: 1,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="p-3 bg-white border border-[#0e0f0f]/30 rounded-none shadow-xs space-y-3"
    >
      {/* Frame Header & Controls */}
      <div className="flex items-center justify-between border-b border-[#0e0f0f]/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-[#0e0f0f] text-white font-mono-custom text-[11px] font-bold flex items-center justify-center">
            {frameIndex + 1}
          </span>
          <span className="text-xs font-bold font-sans-custom uppercase tracking-wide">
            قاب شماره {frameIndex + 1} (Frame {frameIndex + 1})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onMoveUp && frameIndex > 0 && (
            <button
              onClick={onMoveUp}
              title="انتقال به بالا"
              className="p-1 hover:bg-[#eae7e7] text-xs font-mono-custom border border-[#0e0f0f]/20 cursor-pointer"
            >
              ▲
            </button>
          )}
          {onMoveDown && frameIndex < totalFrames - 1 && (
            <button
              onClick={onMoveDown}
              title="انتقال به پایین"
              className="p-1 hover:bg-[#eae7e7] text-xs font-mono-custom border border-[#0e0f0f]/20 cursor-pointer"
            >
              ▼
            </button>
          )}
          <button
            onClick={onDelete}
            title="حذف این قاب"
            className="p-1 hover:bg-red-50 text-red-600 border border-red-200 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Preview Canvas / Viewport */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#747878] font-mono-custom">
          <span>پیش‌نمایش داخل قاب (Viewport Preview)</span>
          {frame.image && (
            <span className="text-[10px] text-[#0e0f0f] font-bold">
              X: {frame.x}% | Y: {frame.y}% | مقیاس: {frame.scale.toFixed(2)}x
            </span>
          )}
        </div>

        <div
          ref={frameContainerRef}
          onMouseDown={handleMouseDownOnFrame}
          className={`relative w-full h-36 bg-[#f5f4f4] border-2 border-[#0e0f0f] overflow-hidden flex items-center justify-center select-none ${
            frame.image ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          }`}
          onClick={() => {
            if (!frame.image) {
              fileInputRef.current?.click();
            }
          }}
        >
          {/* Subtle frame architectural grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

          {/* Museum Frame Corner Ornaments */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#0e0f0f] pointer-events-none" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[#0e0f0f] pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[#0e0f0f] pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#0e0f0f] pointer-events-none" />

          {frame.image ? (
            <div
              style={{
                transform: `translate(${frame.x}%, ${frame.y}%) scale(${frame.scale})`,
                transition: isDraggingImage ? 'none' : 'transform 0.1s ease-out',
              }}
              className="relative w-full h-full flex items-center justify-center pointer-events-none"
            >
              <img
                src={frame.image}
                alt={`Frame ${frameIndex + 1}`}
                className="max-w-full max-h-full object-contain pointer-events-none"
                draggable={false}
              />
            </div>
          ) : (
            <div className="text-center p-4">
              <ImageIcon className="w-8 h-8 text-[#0e0f0f]/40 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-[#0e0f0f]">کلیک برای بارگذاری تصویر اثر</p>
              <p className="text-[10px] text-[#747878] font-mono-custom mt-0.5">Click to upload artwork (PNG, JPG, SVG)</p>
            </div>
          )}

          {frame.image && (
            <div className="absolute bottom-1.5 right-1.5 bg-[#0e0f0f]/80 text-white text-[9px] font-mono-custom px-1.5 py-0.5 rounded-none pointer-events-none flex items-center gap-1">
              <Move className="w-2.5 h-2.5" />
              <span>بکشید برای جابجایی (Drag to pan)</span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.svg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Upload and Reset buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-1.5 px-2 bg-white border border-[#0e0f0f] hover:bg-[#0e0f0f] hover:text-white transition-colors text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{frame.image ? 'تغییر تصویر' : 'بارگذاری تصویر'}</span>
        </button>

        {frame.image && (
          <>
            <button
              onClick={handleResetPosition}
              title="بازنشانی موقعیت و مقیاس"
              className="py-1.5 px-2 bg-white border border-[#0e0f0f]/40 hover:bg-[#eae7e7] text-xs font-mono-custom flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ریست</span>
            </button>
            <button
              onClick={handleRemoveImage}
              title="حذف تصویر"
              className="py-1.5 px-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-mono-custom flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Fine-Tuning Sliders (X, Y, Scale) */}
      {frame.image && (
        <div className="space-y-2 pt-1 border-t border-[#0e0f0f]/10 text-xs">
          {/* Scale Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-mono-custom">
              <span className="flex items-center gap-1 font-bold text-[#0e0f0f]">
                <ZoomIn className="w-3 h-3" /> مقیاس / بزرگنمایی (Scale)
              </span>
              <span>{frame.scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="3.0"
              step="0.05"
              value={frame.scale}
              onChange={(e) => onUpdate({ ...frame, scale: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#eae7e7] accent-[#0e0f0f] cursor-pointer"
            />
          </div>

          {/* X Offset Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-mono-custom">
              <span className="font-bold text-[#0e0f0f]">موقعیت افقی (Offset X)</span>
              <span>{frame.x}%</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={frame.x}
              onChange={(e) => onUpdate({ ...frame, x: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-[#eae7e7] accent-[#0e0f0f] cursor-pointer"
            />
          </div>

          {/* Y Offset Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-mono-custom">
              <span className="font-bold text-[#0e0f0f]">موقعیت عمودی (Offset Y)</span>
              <span>{frame.y}%</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={frame.y}
              onChange={(e) => onUpdate({ ...frame, y: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-[#eae7e7] accent-[#0e0f0f] cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
