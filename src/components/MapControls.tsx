import React from 'react';
import { ZoomIn, Map } from 'lucide-react';

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
  const isMainMap = currentView === 'gallery-00';
  const targetLabel = isMainMap
    ? (associatedGallery === 'gallery-06' ? 'گالری ۰۶' : associatedGallery === 'gallery-05' ? 'گالری ۰۵' : associatedGallery === 'gallery-04' ? 'گالری ۰۴' : associatedGallery === 'gallery-03' ? 'گالری ۰۳' : 'گالری ۰۱')
    : 'گالری ۰۰';

  return (
    <>
      {/* Bottom Right Floating Circular Toggle Button */}
      <div
        id="map-floating-controls"
        className="absolute bottom-22 right-4 sm:right-6 z-30 flex items-center justify-center select-none"
      >
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
      <div className="absolute bottom-22 left-4 sm:left-6 z-20 pointer-events-none select-none">
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


