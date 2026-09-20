import React from 'react';
import { Check } from 'lucide-react';
import { isPuzzlePointCompleted } from '../data/puzzleProgressStore';

export interface PuzzlePointMarkerProps {
  isSelected?: boolean;
  isCollected?: boolean;
  isActive?: boolean;
  pointId?: string;
  galleryId?: string;
  puzzlePieceId?: string;
}

export const PuzzlePointMarker: React.FC<PuzzlePointMarkerProps> = ({
  isSelected = false,
  isCollected: explicitCollected,
  isActive = true,
  pointId,
  galleryId,
  puzzlePieceId,
}) => {
  const isCollected =
    explicitCollected !== undefined
      ? explicitCollected
      : (pointId || puzzlePieceId)
      ? isPuzzlePointCompleted(pointId || '', galleryId, puzzlePieceId)
      : false;

  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-200 ${
        isSelected ? 'scale-115' : 'hover:scale-110 active:scale-95'
      } ${!isActive ? 'opacity-50 grayscale' : ''}`}
    >
      {/* Outer SVG Container with crisp drop-shadow */}
      <svg
        viewBox="0 0 28 28"
        className="w-[28px] h-[28px] overflow-visible"
        style={{
          filter: isSelected
            ? 'drop-shadow(2.5px 2.5px 0px #1e1b18)'
            : 'drop-shadow(2px 2px 0px #1e1b18)',
        }}
      >
        {/* Puzzle piece custom geometric vector path with 10% taller protrusions */}
        <path
          d="M 5 5.5 
             C 5 4.75, 5.75 4, 6.5 4 
             L 10.8 4 
             C 10.2 2.0, 11.2 -0.1, 14 -0.1 
             C 16.8 -0.1, 17.8 2.0, 17.2 4 
             L 21.5 4 
             C 22.25 4, 23 4.75, 23 5.5 
             L 23 10.8 
             C 25.0 10.2, 27.2 11.2, 27.2 14 
             C 27.2 16.8, 25.0 17.8, 23 17.2 
             L 23 21.5 
             C 23 22.25, 22.25 23, 21.5 23 
             L 17 23 
             C 17 21.0, 15.5 19.7, 14 19.7 
             C 12.5 19.7, 11 21.0, 11 23 
             L 6.5 23 
             C 5.75 23, 5 22.25, 5 21.5 
             L 5 17 
             C 7.0 17, 8.3 15.5, 8.3 14 
             C 8.3 12.5, 7.0 11, 5 11 
             Z"
          fill={
            isSelected
              ? '#ef4444'
              : '#a78bfa'
          }
          stroke="#1e1b18"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="transition-colors group-hover:fill-[#c4b5fd]"
        />

        {/* Subtle internal emboss line */}
        <path
          d="M 6.5 5.5 L 10.8 5.5 M 21.5 5.5 L 21.5 10.8"
          stroke="#ffffff"
          strokeWidth="0.9"
          strokeOpacity="0.75"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Tiny check badge when collected */}
      {isCollected && (
        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#22c55e] text-white rounded-full border border-[#1e1b18] flex items-center justify-center shadow-xs">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      )}
    </div>
  );
};
