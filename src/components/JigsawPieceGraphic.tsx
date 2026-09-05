import React, { useId } from 'react';
import { PuzzlePieceConfig } from '../data/galleryPuzzleConfig';

interface JigsawPieceGraphicProps {
  piece: PuzzlePieceConfig;
  artworkSrc: string;
  mode?: 'standalone' | 'assembled';
  className?: string;
  isHighlighted?: boolean;
}

/**
 * JigsawPieceGraphic
 * Renders an authentic jigsaw-shaped puzzle fragment clipped from the gallery artwork image.
 * Uses crisp SVG clipPath and vector path geometry to deliver genuine puzzle tabs/sockets.
 */
export const JigsawPieceGraphic: React.FC<JigsawPieceGraphicProps> = ({
  piece,
  artworkSrc,
  mode = 'standalone',
  className = '',
  isHighlighted = false,
}) => {
  const uniqueClipId = useId().replace(/:/g, '_');
  const clipPathId = `jigsaw-clip-${piece.id}-${uniqueClipId}`;

  if (mode === 'assembled') {
    // Renders in full 1000x1000 coordinate space to fit perfectly in multi-piece assembly
    return (
      <g className={`jigsaw-assembled-piece ${className}`}>
        <defs>
          <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
            <path d={piece.svgPath} />
          </clipPath>
        </defs>

        {/* Clipped Artwork Image */}
        <image
          href={artworkSrc}
          x="0"
          y="0"
          width="1000"
          height="1000"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipPathId})`}
        />

        {/* Jigsaw Vector Seam Outline */}
        <path
          d={piece.svgPath}
          fill="none"
          stroke={isHighlighted ? '#f59e0b' : '#0e0f0f'}
          strokeWidth={isHighlighted ? '4' : '1.5'}
          strokeOpacity={isHighlighted ? '0.9' : '0.4'}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
    );
  }

  // Standalone mode: Renders zoomed in on the piece bounding box with real drop shadow
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        filter: 'drop-shadow(3px 5px 12px rgba(14,15,15,0.22)) drop-shadow(1px 2px 4px rgba(14,15,15,0.15))',
      }}
    >
      <svg
        viewBox={piece.standaloneViewBox}
        className="w-full h-full max-h-56 max-w-56 overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
            <path d={piece.svgPath} />
          </clipPath>
          {/* Subtle inner bevel filter */}
          <linearGradient id={`grad-bevel-${uniqueClipId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Background shadow layer */}
        <path
          d={piece.svgPath}
          fill="#1e1b18"
          opacity="0.1"
          transform="translate(4, 6)"
        />

        {/* Clipped Artwork */}
        <image
          href={artworkSrc}
          x="0"
          y="0"
          width="1000"
          height="1000"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipPathId})`}
        />

        {/* Bevel highlight */}
        <path
          d={piece.svgPath}
          fill="none"
          stroke={`url(#grad-bevel-${uniqueClipId})`}
          strokeWidth="3"
          clipPath={`url(#${clipPathId})`}
        />

        {/* High-contrast dark outer puzzle contour */}
        <path
          d={piece.svgPath}
          fill="none"
          stroke="#0e0f0f"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
