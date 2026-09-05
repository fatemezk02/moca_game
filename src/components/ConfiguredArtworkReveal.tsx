import React from 'react';
import { ArtworkFrameConfig } from '../types/admin';
import { Gallery01ArtworkSvg } from './Gallery01ArtworkSvg';

interface ConfiguredArtworkRevealProps {
  frames?: ArtworkFrameConfig[];
  className?: string;
}

export const ConfiguredArtworkReveal: React.FC<ConfiguredArtworkRevealProps> = ({
  frames = [],
  className = '',
}) => {
  // If no frames or default frames without custom uploaded images and exactly 3 frames, use the authentic SVG
  const hasCustomImages = frames.some((f) => !!f.image);
  if (!hasCustomImages && frames.length === 3) {
    return <Gallery01ArtworkSvg className={`w-full h-full object-contain filter drop-shadow-none ${className}`} />;
  }

  // If empty, fallback
  const frameList = frames.length > 0 ? frames : [{ id: 'f-1', order: 1, x: 0, y: 0, scale: 1 }];

  return (
    <div className={`flex items-center gap-2 sm:gap-3 p-1.5 bg-transparent ${className}`}>
      {frameList.map((frame, idx) => (
        <div
          key={frame.id || idx}
          className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 bg-[#fff6ee] border-2 border-[#2e3552] shadow-[3px_3px_0px_#2e3552] flex items-center justify-center overflow-hidden shrink-0"
        >
          {/* Inner Frame Inset Border */}
          <div className="absolute inset-1 border border-[#2e3552]/40 pointer-events-none z-10" />

          {frame.image ? (
            <div
              style={{
                transform: `translate(${frame.x}%, ${frame.y}%) scale(${frame.scale})`,
              }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <img
                src={frame.image}
                alt={`Artwork Frame ${idx + 1}`}
                className="max-w-full max-h-full object-contain pointer-events-none"
                draggable={false}
              />
            </div>
          ) : (
            /* Classical architectural line-art geometry placeholder if no custom image */
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <div className="w-full h-full border border-dashed border-[#2e3552]/30 flex flex-col items-center justify-center">
                <span className="font-mono-custom text-[10px] sm:text-xs font-bold text-[#2e3552]">
                  {idx + 1}
                </span>
                <span className="text-[7px] font-mono-custom text-[#2e3552]/60 uppercase">
                  FRAME
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
