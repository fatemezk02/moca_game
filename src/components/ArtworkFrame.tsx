import React from 'react';

interface ArtworkFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Museum-inspired Decorative Artwork Frame
 * Wraps tightly around the artwork image, preserving its aspect ratio and proportions.
 * Features a refined layered museum moulding, subtle brass/gold inlay, and restrained corner ornaments.
 */
export const ArtworkFrame: React.FC<ArtworkFrameProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      id="museum-artwork-frame"
      className={`relative inline-flex items-center justify-center p-2.5 sm:p-3.5 bg-[#f6f4f0] border-2 border-[#1c1d1d] select-none max-w-full max-h-full ${className}`}
      style={{
        boxShadow:
          '0 0 0 1px #2d2e2e, inset 0 0 0 1px #3a3b3b, 0 8px 24px -4px rgba(0, 0, 0, 0.14)',
      }}
    >
      {/* Decorative Corner Ornaments */}
      {/* Top-Left */}
      <svg
        className="absolute top-1 left-1 w-3 h-3 pointer-events-none text-[#c5a059]"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 11V1H11" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="3" cy="3" r="1" fill="currentColor" />
      </svg>
      {/* Top-Right */}
      <svg
        className="absolute top-1 right-1 w-3 h-3 pointer-events-none text-[#c5a059]"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M11 11V1H1" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="9" cy="3" r="1" fill="currentColor" />
      </svg>
      {/* Bottom-Left */}
      <svg
        className="absolute bottom-1 left-1 w-3 h-3 pointer-events-none text-[#c5a059]"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 1V11H11" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="3" cy="9" r="1" fill="currentColor" />
      </svg>
      {/* Bottom-Right */}
      <svg
        className="absolute bottom-1 right-1 w-3 h-3 pointer-events-none text-[#c5a059]"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M11 1V11H1" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
      </svg>

      {/* Inner Metallic Fillet / Accent Inlay */}
      <div
        className="relative flex items-center justify-center p-1 sm:p-1.5 border border-[#c5a059]/80 bg-[#edeae4] overflow-hidden"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(197, 160, 89, 0.45)',
        }}
      >
        {/* Inner Sight Edge Border around the Artwork */}
        <div className="relative flex items-center justify-center border border-[#1c1d1d] overflow-hidden bg-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};
