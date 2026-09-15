import React from 'react';

export interface ArtworkFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fillContainer?: boolean;
  aspectRatio?: number;
  wallScale?: number;
  frameWidth?: number;
  frameHeight?: number;
}

/**
 * Museum-inspired Decorative Artwork Frame
 * Wraps tightly around the artwork image, preserving its aspect ratio and proportions.
 * Features a refined layered museum moulding, subtle brass/gold inlay, and restrained corner ornaments.
 * Frame border and padding scale proportionally with frame size to prevent choking or empty areas.
 * Mathematical inner aperture strictly preserves the target aspect ratio.
 */
export const ArtworkFrame: React.FC<ArtworkFrameProps> = ({
  children,
  className = '',
  style = {},
  fillContainer = false,
  aspectRatio,
  wallScale = 1,
  frameWidth,
  frameHeight,
}) => {
  const isFull = fillContainer || className.includes('w-full') || className.includes('h-full');

  const safeRatio = Math.max(0.2, Math.min(5, aspectRatio || 1));
  const fw = frameWidth || (140 * (wallScale || 1));
  const fh = frameHeight || (fw / safeRatio);
  const minDim = Math.min(fw, fh);

  // Proportional outer border (scaled to min dimension, min 1px)
  const outerBorderWidth = Math.max(1, Math.round(minDim * 0.018 * 10) / 10);

  // Proportional mat / moulding padding:
  // 3.8% of frame width horizontally, 3.8% of frame height vertically.
  // Because horizontal padding is p * width and vertical padding is p * height,
  // the inner aperture aspect ratio (fw - 2*padX)/(fh - 2*padY)
  // strictly equals fw / fh = safeRatio, eliminating any letterboxing or empty space.
  const padX = Math.max(1.5, Math.round(fw * 0.038 * 10) / 10);
  const padY = Math.max(1.5, Math.round(fh * 0.038 * 10) / 10);

  // Proportional inner metallic fillet padding (1.2% of width and height)
  const filletPadX = Math.max(0.8, Math.round(fw * 0.012 * 10) / 10);
  const filletPadY = Math.max(0.8, Math.round(fh * 0.012 * 10) / 10);

  // Proportional corner ornament size
  const cornerSize = Math.max(5, Math.min(18, Math.round(minDim * 0.11)));

  return (
    <div
      id="museum-artwork-frame"
      className={`relative ${
        isFull ? 'w-full h-full flex' : 'inline-flex'
      } items-center justify-center bg-[#f6f4f0] select-none box-border ${className}`}
      style={{
        borderWidth: `${outerBorderWidth}px`,
        borderStyle: 'solid',
        borderColor: '#1c1d1d',
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
        className="absolute top-0.5 left-0.5 pointer-events-none text-[#c5a059] z-10"
        style={{ width: `${cornerSize}px`, height: `${cornerSize}px` }}
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 11V1H11" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="3" cy="3" r="1" fill="currentColor" />
      </svg>
      {/* Top-Right */}
      <svg
        className="absolute top-0.5 right-0.5 pointer-events-none text-[#c5a059] z-10"
        style={{ width: `${cornerSize}px`, height: `${cornerSize}px` }}
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M11 11V1H1" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="9" cy="3" r="1" fill="currentColor" />
      </svg>
      {/* Bottom-Left */}
      <svg
        className="absolute bottom-0.5 left-0.5 pointer-events-none text-[#c5a059] z-10"
        style={{ width: `${cornerSize}px`, height: `${cornerSize}px` }}
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 1V11H11" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="3" cy="9" r="1" fill="currentColor" />
      </svg>
      {/* Bottom-Right */}
      <svg
        className="absolute bottom-0.5 right-0.5 pointer-events-none text-[#c5a059] z-10"
        style={{ width: `${cornerSize}px`, height: `${cornerSize}px` }}
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
        {/* Inner Sight Edge Border around the Artwork Aperture (clean transparent/warm backing, never black) */}
        <div
          className={`relative ${
            isFull ? 'w-full h-full flex' : 'flex'
          } items-center justify-center border border-[#1c1d1d] overflow-hidden bg-transparent box-border`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
