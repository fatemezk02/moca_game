import React, { useState, useEffect } from 'react';
import { ZoomIn, Map, MapPin } from 'lucide-react';
import {
  getLocationPinsVisible,
  toggleLocationPinsVisible,
} from '../data/locationPinsVisibilityStore';

interface MapControlsProps {
  currentView?: 'gallery-00' | 'gallery-01' | 'gallery-03' | string;
  associatedGallery?: string;
  onToggleGallery?: () => void;
  galleryName?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  currentView = 'gallery-00',
  associatedGallery = 'gallery-01',
  onToggleGallery,
  galleryName = 'GALLERY 00',
}) => {
  const [isPinsVisible, setIsPinsVisible] = useState<boolean>(() => getLocationPinsVisible());
  const [isPinAnimating, setIsPinAnimating] = useState(false);
  const isMainMap = currentView === 'gallery-00';
  const getTargetLabel = (gid: string) => {
    const norm = gid.toLowerCase().replace('_', '-');
    if (norm.includes('09')) return 'گالری ۰۹';
    if (norm.includes('08')) return 'گالری ۰۸';
    if (norm.includes('07')) return 'گالری ۰۷';
    if (norm.includes('06')) return 'گالری ۰۶';
    if (norm.includes('05')) return 'گالری ۰۵';
    if (norm.includes('04')) return 'گالری ۰۴';
    if (norm.includes('03')) return 'گالری ۰۳';
    return 'گالری ۰۲';
  };
  const targetLabel = isMainMap ? getTargetLabel(associatedGallery) : 'گالری ۰۰';

  useEffect(() => {
    const handleVisUpdate = (e: any) => {
      if (typeof e?.detail?.visible === 'boolean') {
        setIsPinsVisible(e.detail.visible);
      } else {
        setIsPinsVisible(getLocationPinsVisible());
      }
    };
    window.addEventListener('museum_location_pins_visibility_changed', handleVisUpdate);
    return () => window.removeEventListener('museum_location_pins_visibility_changed', handleVisUpdate);
  }, []);

  const handleToggleLocationPins = () => {
    setIsPinAnimating(true);
    setTimeout(() => setIsPinAnimating(false), 500);
    const nextState = toggleLocationPinsVisible();
    setIsPinsVisible(nextState);
  };

  return (
    <>
      {/* Bottom Right Floating Controls */}
      <div
        id="map-floating-controls"
        className="absolute bottom-4 sm:bottom-5 right-4 sm:right-6 z-30 flex flex-col items-center gap-2.5 select-none"
      >
        {/* Location Pin Toggle Button (Above Gallery Toggle) */}
        <button
          id="btn-location-pins-trigger"
          type="button"
          onClick={handleToggleLocationPins}
          aria-label={isPinsVisible ? 'پنهان‌سازی آیکون‌های لوکیشن' : 'نمایش آیکون‌های لوکیشن'}
          title={isPinsVisible ? 'پنهان‌سازی آیکون‌های لوکیشن' : 'نمایش آیکون‌های لوکیشن'}
          className={`w-13 h-13 rounded-2xl border-[2.5px] border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none ${
            isPinsVisible
              ? 'bg-[#fbbf24] hover:bg-[#f59e0b] ring-2 ring-[#d97706]/40'
              : 'bg-[#ffffff] hover:bg-[#fef3c7]'
          } ${isPinAnimating ? 'scale-110' : ''}`}
        >
          <MapPin
            className={`w-6 h-6 stroke-[2.2] transition-transform ${
              isPinsVisible
                ? 'text-[#451a03] fill-[#ffffff]'
                : 'text-[#b45309] fill-[#fbbf24]'
            } ${isPinAnimating ? 'scale-125' : ''}`}
          />
        </button>

        {/* Gallery Toggle Button */}
        <button
          id="btn-gallery-toggle"
          onClick={onToggleGallery}
          aria-label={`تغییر به ${targetLabel}`}
          title={`تغییر به ${targetLabel}`}
          className="w-13 h-13 rounded-2xl border-[2.5px] border-[#1e1b18] bg-[#f59e0b] hover:bg-[#d97706] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
        >
          {isMainMap ? (
            <ZoomIn className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <Map className="w-6 h-6 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Map Badge (Gallery Title / Level in Bottom Left) */}
      <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 z-20 pointer-events-none select-none">
        <div className="font-sans-custom text-[12px] font-bold text-[#1e1b18] bg-[#ffffff] border-2 border-[#1e1b18] rounded-xl px-3 py-1.5 shadow-[3px_3px_0px_#1e1b18] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-[#1e1b18] inline-block"></span>
          <span>{galleryName === 'GALLERY 00' ? 'گالری ۰۰' : galleryName}</span>
          <span className="text-[#cbd5e1]">|</span>
          <span className="text-[#64748b] text-[11px]">۹ بخش فعال</span>
        </div>
      </div>
    </>
  );
};


