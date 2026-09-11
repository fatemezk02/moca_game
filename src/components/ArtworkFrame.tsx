import React from 'react';

export interface ArtworkFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fillContainer?: boolean;
  aspectRatio?: number;
}

/**
 * Museum-inspired Decorative Artwork Frame
 * Wraps tightly around the artwork image, preserving its aspect ratio and proportions.
 * Features a refined layered museum moulding, subtle brass/gold inlay, and restrained corner ornaments.
 * When fillContainer is true, fills 100% of the parent dimensions seamlessly.
 * Frame container and inner image container are mathematically bound to the same aspect ratio.
 */
export const ArtworkFrame: React.FC<ArtworkFrameProps> = ({
  children,
  className = '',
  style = {},
  fillContainer = false,
  aspectRatio,
}) => {
  const isFull = fillContainer || className.includes('w-full') || className.includes('h-full');

  // Calculate proportional border/moulding padding to ensure the inner aperture
  // has the exact same aspect ratio as the outer frame container:
  // padX / padY === aspectRatio, so (W - 2*padX) / (H - 2*padY) === W / H === aspectRatio
  const safeRatio = Math.max(0.2, Math.min(5, aspectRatio || 1));
  const baseBorder = 7;
  const sqrtR = Math.sqrt(safeRatio);
  const padX = Math.round(baseBorder * sqrtR * 10) / 10;
  const padY = Math.round((baseBorder / sqrtR) * 10) / 10;

  const filletPadX = Math.max(1, Math.round(padX * 0.25 * 10) / 10);
  const filletPadY = Math.max(1, Math.round(padY * 0.25 * 10) / 10);

  return (
    <div
      id="museum-artwork-frame"
      className={`relative ${
        isFull ? 'w-full h-full flex' : 'inline-flex'
      } items-center justify-center bg-[#f6f4f0] border-2 border-[#1c1d1d] select-none box-border ${className}`}
      style={{
        paddingTop: `${padY}px`,
        paddingBottom: `${padY}px`,
        paddingLeft: `${padX}px`,
        paddingRight: `${padX}px`,
        boxShadow:
          '0 0 0 1px #2d2e2e, inset 0 0 0 1px #3a3b3b, 0 8px 24px -4px rgba(0, 0, 0, 0.18)',
        ...style,
      }}
    >
      {/* Decorative Corner Ornaments */}
      {/* Top-Left */}
      <svg
        className="absolute top-1 left-1 w-2.5 h-2.5 sm:w-3 sm:h-3 pointer-events-none text-[#c5a059] z-10"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 11V1H11" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="3" cy="3" r="1" fill="currentColor" />
      </svg>
      {/* Top-Right */}
      <svg
        className="absolute top-1 right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 pointer-events-none text-[#c5a059] z-10"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M11 11V1H1" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="9" cy="3" r="1" fill="currentColor" />
      </svg>
      {/* Bottom-Left */}
      <svg
        className="absolute bottom-1 left-1 w-2.5 h-2.5 sm:w-3 sm:h-3 pointer-events-none text-[#c5a059] z-10"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 1V11H11" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="3" cy="9" r="1" fill="currentColor" />
      </svg>
      {/* Bottom-Right */}
      <svg
        className="absolute bottom-1 right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 pointer-events-none text-[#c5a059] z-10"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M11 1V11H1" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
      </svg>

      {/* Inner Metallic Fillet / Accent Inlay */}
      <div
        className={`relative ${
          isFull ? 'w-full h-full flex' : 'flex'
        } items-center justify-center border border-[#c5a059]/80 bg-[#edeae4] overflow-hidden box-border`}
        style={{
          paddingTop: `${filletPadY}px`,
          paddingBottom: `${filletPadY}px`,
          paddingLeft: `${filletPadX}px`,
          paddingRight: `${filletPadX}px`,
          boxShadow: 'inset 0 0 0 1px rgba(197, 160, 89, 0.45)',
        }}
      >
        {/* Inner Sight Edge Border around the Artwork Aperture */}
        <div
          className={`relative ${
            isFull ? 'w-full h-full flex' : 'flex'
          } items-center justify-center border border-[#1c1d1d] overflow-hidden bg-[#121314] box-border`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
