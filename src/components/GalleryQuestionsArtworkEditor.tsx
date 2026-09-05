import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GalleryQuestionsArtworkConfig,
  getGalleryQuestionsArtwork,
  saveGalleryQuestionsArtwork,
  resetGalleryQuestionsArtwork,
} from '../data/galleryQuestionsArtworkStore';
import { GALLERIES } from '../data/mapConfig';
import {
  Upload,
  Image as ImageIcon,
  Save,
  RotateCcw,
  CheckCircle,
  Move,
  Maximize2,
  Minimize2,
  AlertCircle,
  Smartphone,
  Tablet,
  Monitor,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface GalleryQuestionsArtworkEditorProps {
  onBackToMapEditor?: () => void;
}

export const GalleryQuestionsArtworkEditor: React.FC<GalleryQuestionsArtworkEditorProps> = ({
  onBackToMapEditor,
}) => {
  // Gallery selection (Gallery 01 enabled, others not configured)
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('gallery-01');

  // Config state
  const [config, setConfig] = useState<GalleryQuestionsArtworkConfig>(() =>
    getGalleryQuestionsArtwork('gallery-01')
  );

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet'>('mobile');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reload config when gallery changes
  useEffect(() => {
    if (selectedGalleryId === 'gallery-01') {
      setConfig(getGalleryQuestionsArtwork('gallery-01'));
    }
  }, [selectedGalleryId]);

  // Handle Save
  const handleSave = () => {
    if (selectedGalleryId !== 'gallery-01') return;
    saveGalleryQuestionsArtwork(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Handle Reset
  const handleReset = () => {
    if (
      window.confirm(
        'آیا مطمئن هستید که می‌خواهید تصویر و تنظیمات موقعیت را به حالت اولیه بازنشانی کنید؟'
      )
    ) {
      const def = resetGalleryQuestionsArtwork(selectedGalleryId);
      setConfig(def);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  // Handle Image File Upload (JPG, JPEG, PNG, WEBP)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('فرمت فایل نامعتبر است. لطفاً فایلی با فرمت JPG، PNG یا WEBP انتخاب کنید.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setConfig((prev) => ({
        ...prev,
        image: dataUrl,
        imageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-drop on preview canvas for position adjustment
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      startX: e.clientX,
      startY: e.clientY,
      initX: config.x,
      initY: config.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !previewContainerRef.current) return;

      const rect = previewContainerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaX = e.clientX - dragStart.startX;
      const deltaY = e.clientY - dragStart.startY;

      // Convert pixel delta to percentage of preview container
      const percentDeltaX = (deltaX / rect.width) * 100;
      const percentDeltaY = (deltaY / rect.height) * 100;

      // Clamp within reasonable range (-60% to +60%)
      const nextX = Math.round(Math.max(-60, Math.min(60, dragStart.initX + percentDeltaX)));
      const nextY = Math.round(Math.max(-60, Math.min(60, dragStart.initY + percentDeltaY)));

      setConfig((prev) => ({
        ...prev,
        x: nextX,
        y: nextY,
      }));
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch drag support
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      startX: touch.clientX,
      startY: touch.clientY,
      initX: config.x,
      initY: config.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !previewContainerRef.current) return;
    const touch = e.touches[0];
    const rect = previewContainerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = touch.clientX - dragStart.startX;
    const deltaY = touch.clientY - dragStart.startY;

    const percentDeltaX = (deltaX / rect.width) * 100;
    const percentDeltaY = (deltaY / rect.height) * 100;

    const nextX = Math.round(Math.max(-60, Math.min(60, dragStart.initX + percentDeltaX)));
    const nextY = Math.round(Math.max(-60, Math.min(60, dragStart.initY + percentDeltaY)));

    setConfig((prev) => ({
      ...prev,
      x: nextX,
      y: nextY,
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const isGallery01 = selectedGalleryId === 'gallery-01';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f5f4f0] text-[#0e0f0f] select-none font-sans-custom overflow-hidden">
      {/* Sub-header / Gallery Selector Bar */}
      <div className="bg-[#fcfbf9] border-b border-[#0e0f0f]/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-custom font-bold text-[#747878] uppercase">
              انتخاب گالری:
            </span>
            <select
              value={selectedGalleryId}
              onChange={(e) => setSelectedGalleryId(e.target.value)}
              className="bg-white border border-[#0e0f0f] px-3 py-1 text-xs font-bold font-sans-custom cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0e0f0f]"
            >
              <option value="gallery-01">گالری ۰۱ (Gallery 01 - فعال و پیکربندی‌شده)</option>
              <option value="gallery-00">گالری ۰۰ (Gallery 00 - فاقد بخش پرسش)</option>
              <option value="gallery-02">گالری ۰۲ (Gallery 02 - پیکربندی‌نشده)</option>
              <option value="gallery-03">گالری ۰۳ (Gallery 03 - پیکربندی‌نشده)</option>
            </select>
          </div>

          {isGallery01 ? (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono-custom font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              آماده ویرایش
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-mono-custom font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              غیرفعال / در دسترس نیست
            </span>
          )}
        </div>

        {/* Action buttons */}
        {isGallery01 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-2.5 py-1 hover:bg-red-50 text-red-700 border border-red-200 text-xs font-mono-custom flex items-center gap-1.5 transition-colors cursor-pointer"
              title="بازنشانی به حالت اولیه"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی</span>
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
                  <span>ذخیره تنظیمات تصویر</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!isGallery01 ? (
        /* Disabled Gallery Warning */
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md bg-white border border-[#0e0f0f] p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0e0f0f]">
              این بخش در حال حاضر فقط برای گالری ۰۱ فعال است
            </h3>
            <p className="text-xs text-[#747878] leading-relaxed font-sans-custom">
              صفحات پرسش و پاسخ تعاملی برای سایر گالری‌ها هنوز در دسترس نیست. برای مدیریت اثر هنری نهایی، لطفاً «گالری ۰۱» را از منوی بالا انتخاب کنید.
            </p>
            <button
              onClick={() => setSelectedGalleryId('gallery-01')}
              className="px-4 py-2 bg-[#0e0f0f] text-white text-xs font-bold hover:bg-[#2a2b2b] transition-colors cursor-pointer"
            >
              انتقال به گالری ۰۱
            </button>
          </div>
        </div>
      ) : (
        /* Enabled Gallery 01 Workspace (Split Left Controls + Right Live Preview) */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Controls Side Panel (Width ~360px) */}
          <aside className="w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-[#0e0f0f] flex flex-col shrink-0 overflow-y-auto p-4 space-y-5 z-20">
            {/* Header info */}
            <div className="border-b border-[#0e0f0f]/15 pb-3">
              <span className="text-[10px] font-mono-custom font-bold text-[#747878] uppercase tracking-widest block mb-0.5">
                تنظیمات اثر هنری نهایی (Final Artwork)
              </span>
              <h2 className="text-sm font-bold text-[#0e0f0f]">
                تصویر پایان پرسش‌های گالری ۰۱
              </h2>
            </div>

            {/* 1. Artwork Upload Section */}
            <div className="space-y-2.5 p-3.5 bg-[#faf9f6] border border-[#0e0f0f]/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold font-mono-custom uppercase text-[#0e0f0f] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>بارگذاری تصویر (Upload Artwork)</span>
                </label>
                <span className="text-[10px] font-mono-custom text-[#747878]">
                  JPG, PNG, WEBP
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#0e0f0f]/30 hover:border-[#0e0f0f] bg-white p-4 text-center cursor-pointer transition-colors group"
              >
                <ImageIcon className="w-6 h-6 mx-auto text-[#747878] group-hover:text-[#0e0f0f] mb-1.5 transition-colors" />
                <p className="text-xs font-bold text-[#0e0f0f]">
                  برای انتخاب تصویر جدید کلیک کنید
                </p>
                <p className="text-[10px] font-mono-custom text-[#747878] mt-0.5">
                  یا فایل تصویر را به اینجا بکشید
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-custom text-[#747878] bg-white px-2.5 py-1.5 border border-[#0e0f0f]/15">
                <span className="truncate max-w-[180px]" title={config.imageName}>
                  فایل فعال: {config.imageName || 'تصویر پیش‌فرض'}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#0e0f0f] font-bold hover:underline cursor-pointer text-[10px]"
                >
                  تغییر فایل
                </button>
              </div>
            </div>

            {/* 2. Image Size / Scale Control */}
            <div className="space-y-2.5 p-3.5 bg-[#faf9f6] border border-[#0e0f0f]/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold font-mono-custom uppercase text-[#0e0f0f] flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>مقیاس و اندازه (Image Scale)</span>
                </label>
                <span className="text-xs font-mono-custom font-bold text-[#0e0f0f]">
                  {config.scale}%
                </span>
              </div>

              <input
                type="range"
                min="30"
                max="200"
                step="1"
                value={config.scale}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    scale: parseInt(e.target.value, 10) || 100,
                  }))
                }
                className="w-full accent-[#0e0f0f] cursor-pointer"
              />

              {/* Scale Presets */}
              <div className="flex items-center gap-1 text-[10px] font-mono-custom font-bold">
                {[50, 75, 100, 125, 150].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setConfig((prev) => ({ ...prev, scale: preset }))}
                    className={`flex-1 py-1 border transition-colors cursor-pointer ${
                      config.scale === preset
                        ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                        : 'bg-white hover:bg-[#eae7e7] text-[#0e0f0f] border-[#0e0f0f]/20'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#747878] leading-normal font-mono-custom">
                * نسبت تصویر (Aspect Ratio) به‌طور خودکار و دقیق حفظ می‌شود و تصویر دفرمه نخواهد شد.
              </p>
            </div>

            {/* 3. Image Position (X, Y) Coordinates */}
            <div className="space-y-3 p-3.5 bg-[#faf9f6] border border-[#0e0f0f]/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold font-mono-custom uppercase text-[#0e0f0f] flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>موقعیت در صفحه (Position X / Y)</span>
                </label>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, x: 0, y: 0 }))}
                  className="text-[10px] font-mono-custom text-[#0e0f0f] font-bold hover:underline cursor-pointer"
                >
                  مرکز کردن (Center)
                </button>
              </div>

              {/* X Coordinate */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono-custom">
                  <span className="text-[#747878]">موقعیت افقی X (%):</span>
                  <span className="font-bold text-[#0e0f0f]">{config.x}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={config.x}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        x: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="flex-1 accent-[#0e0f0f] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-50"
                    max="50"
                    value={config.x}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        x: Math.max(-50, Math.min(50, parseInt(e.target.value, 10) || 0)),
                      }))
                    }
                    className="w-14 bg-white border border-[#0e0f0f] px-1.5 py-0.5 text-xs font-mono-custom font-bold text-center"
                  />
                </div>
              </div>

              {/* Y Coordinate */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono-custom">
                  <span className="text-[#747878]">موقعیت عمودی Y (%):</span>
                  <span className="font-bold text-[#0e0f0f]">{config.y}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={config.y}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        y: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="flex-1 accent-[#0e0f0f] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-50"
                    max="50"
                    value={config.y}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        y: Math.max(-50, Math.min(50, parseInt(e.target.value, 10) || 0)),
                      }))
                    }
                    className="w-14 bg-white border border-[#0e0f0f] px-1.5 py-0.5 text-xs font-mono-custom font-bold text-center"
                  />
                </div>
              </div>

              <div className="flex items-start gap-1.5 p-2 bg-[#f0eee6] border border-[#0e0f0f]/10 text-[10px] text-[#747878]">
                <Info className="w-3.5 h-3.5 text-[#0e0f0f] shrink-0 mt-0.5" />
                <span>
                  همچنین می‌توانید مستقیماً با کشیدن و رها کردن (Drag & Drop) تصویر در کادر پیش‌نمایش، موقعیت آن را تغییر دهید.
                </span>
              </div>
            </div>

            {/* Bottom Save Trigger */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                className={`w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                  isSaved
                    ? 'bg-emerald-600 text-white border border-emerald-700'
                    : 'bg-[#0e0f0f] text-white hover:bg-[#2a2b2b] border border-[#0e0f0f]'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>تغییرات با موفقیت ذخیره شد!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>ذخیره و اعمال در صفحه پرسش‌ها</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* Live Preview Workspace Area */}
          <main className="flex-1 flex flex-col bg-[#eeebe2] overflow-hidden">
            {/* Preview Toolbar */}
            <div className="h-10 bg-white/90 backdrop-blur-xs border-b border-[#0e0f0f]/20 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-custom font-bold text-[#747878] uppercase">
                  پیش‌نمایش زنده (Live Preview):
                </span>
                <span className="text-[11px] font-bold text-[#0e0f0f]">
                  صفحه نهایی پرسش‌های گالری ۰۱
                </span>
              </div>

              {/* Device Toggle */}
              <div className="flex items-center gap-1 border border-[#0e0f0f]/30 p-0.5 bg-white text-[11px] font-mono-custom">
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-[#0e0f0f] text-white font-bold'
                      : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
                  }`}
                  title="نمای موبایل (Phone 380px)"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>موبایل</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer ${
                    previewDevice === 'tablet'
                      ? 'bg-[#0e0f0f] text-white font-bold'
                      : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
                  }`}
                  title="نمای تبلت (Tablet 520px)"
                >
                  <Tablet className="w-3 h-3" />
                  <span>تبلت</span>
                </button>
              </div>
            </div>

            {/* Preview Canvas Stage */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center">
              {/* Simulated Device Frame */}
              <div
                className={`transition-all duration-300 bg-[#f5f4f0] border-2 border-[#0e0f0f] shadow-2xl flex flex-col relative overflow-hidden ${
                  previewDevice === 'mobile'
                    ? 'w-[360px] sm:w-[380px] h-[640px] max-h-[90vh]'
                    : 'w-[480px] sm:w-[540px] h-[680px] max-h-[90vh]'
                }`}
              >
                {/* Simulated Top Bar */}
                <div className="h-12 bg-white border-b border-[#0e0f0f] px-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#0e0f0f]" />
                    <span className="text-xs font-bold font-sans-custom">گالری ۰۱</span>
                  </div>
                  <span className="text-[10px] font-mono-custom font-bold text-[#747878] uppercase">
                    پرسش‌ها (پایان آزمون)
                  </span>
                </div>

                {/* Simulated Final Artwork View Container */}
                <div className="flex-1 flex flex-col items-center justify-between p-4 min-h-0 overflow-hidden relative">
                  {/* Interactive Drag Viewport */}
                  <div
                    ref={previewContainerRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`flex-1 min-h-0 w-full flex items-center justify-center relative overflow-hidden border border-dashed transition-colors select-none ${
                      isDragging
                        ? 'border-[#c5a059] bg-[#c5a059]/5 cursor-grabbing'
                        : 'border-[#0e0f0f]/20 hover:border-[#0e0f0f]/50 cursor-grab bg-white/40'
                    }`}
                    title="تصویر را بکشید تا موقعیت آن تغییر کند"
                  >
                    {/* Visual Grid Guide */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:20px_20px]" />
                    
                    {/* Center Crosshair Guide */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
                      <div className="w-full h-px bg-[#0e0f0f]" />
                      <div className="h-full w-px bg-[#0e0f0f] absolute" />
                    </div>

                    {/* The Configured Final Artwork Image */}
                    <img
                      src={config.image}
                      alt="Preview Artwork"
                      className="max-h-full max-w-full w-auto h-auto object-contain pointer-events-none transition-transform"
                      style={{
                        transform: `translate(${config.x}%, ${config.y}%) scale(${config.scale / 100})`,
                      }}
                      referrerPolicy="no-referrer"
                    />

                    {/* Drag indicator overlay badge */}
                    <div className="absolute bottom-2 left-2 bg-[#0e0f0f]/80 text-white text-[9px] font-mono-custom px-2 py-0.5 rounded-xs pointer-events-none flex items-center gap-1">
                      <Move className="w-2.5 h-2.5 text-[#c5a059]" />
                      <span>
                        X: {config.x}% | Y: {config.y}% | {config.scale}%
                      </span>
                    </div>
                  </div>

                  {/* Simulated Completion Message Box (Preserved exactly) */}
                  <div className="border border-[#0e0f0f] bg-white p-3.5 w-full text-center mt-3 shrink-0 shadow-xs">
                    <span className="text-[9px] font-mono-custom font-bold text-[#747878] uppercase tracking-widest block mb-0.5">
                      گالری ۰۱
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-[#0e0f0f]">
                      همه ۳ پرسش پاسخ داده شدند
                    </h3>
                  </div>
                </div>

                {/* Simulated Bottom Tab Bar */}
                <div className="h-12 bg-white border-t border-[#0e0f0f] px-4 flex items-center justify-around shrink-0 text-[#747878]">
                  <span className="text-[10px] font-mono-custom font-bold">نقشه</span>
                  <span className="text-[10px] font-mono-custom font-bold">مجموعه‌ها</span>
                  <span className="text-[10px] font-mono-custom font-bold">ماموریت‌ها</span>
                  <span className="text-[10px] font-mono-custom font-bold">کیوریتور</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};
