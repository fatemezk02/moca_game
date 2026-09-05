import React, { useId } from 'react';
import { CollectionPointVisualType } from '../types/admin';

interface CollectionPointMarkerProps {
  pointType?: CollectionPointVisualType;
  isSelected?: boolean;
  className?: string;
  showPulse?: boolean;
}

export const CollectionPointMarker: React.FC<CollectionPointMarkerProps> = ({
  pointType = 'normal',
  isSelected = false,
  className = '',
  showPulse = true,
}) => {
  const isStar = pointType === 'star';
  const rawId = useId();
  const uniqueId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Optional Selected Glow / Animated Pulse Ring ONLY for normal points */}
      {showPulse && isSelected && !isStar && (
        <span className="absolute -inset-2 rounded-full border-2 border-[#f59e0b] animate-ping opacity-75 pointer-events-none" />
      )}

      {isStar ? (
        /* STAR COLLECTION POINT: Completely static star shape with rounded tips, subtle outline and animated internal shine */
        <div
          className={`relative flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? 'scale-125'
              : 'group-hover:scale-115'
          }`}
          title="نقطه اثر ویژه (ستاره‌دار)"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-[27.5px] h-[27.5px] overflow-visible"
            style={{
              filter: isSelected
                ? 'drop-shadow(2.5px 2.5px 0px #1e1b18)'
                : 'drop-shadow(2px 2px 0px #1e1b18)',
            }}
          >
            <defs>
              {/* Star Clip Path with rounded tips so the shine is strictly visible ONLY inside the star */}
              <clipPath id={`star-clip-${uniqueId}`}>
                <path d="M 11.29 3.43 Q 12 2 12.71 3.43 L 14.74 7.54 Q 15.09 8.26 15.88 8.38 L 20.42 9.04 Q 22 9.27 20.85 10.39 L 17.57 13.58 Q 17 14.14 17.14 14.93 L 17.91 19.44 Q 18.18 21.02 16.76 20.27 L 12.71 18.14 Q 12 17.77 11.29 18.14 L 7.24 20.27 Q 5.82 21.02 6.09 19.44 L 6.86 14.93 Q 7 14.14 6.43 13.58 L 3.15 10.39 Q 2 9.27 3.58 9.04 L 8.12 8.38 Q 8.91 8.26 9.26 7.54 Z" />
              </clipPath>

              {/* Expanded bright gradient for the reflection highlight streak */}
              <linearGradient
                id={`sheen-grad-${uniqueId}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="25%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="75%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Static Star Body: 1.4px outline (~20% thinner), rounded vertices, gold fill (red when selected) */}
            <path
              d="M 11.29 3.43 Q 12 2 12.71 3.43 L 14.74 7.54 Q 15.09 8.26 15.88 8.38 L 20.42 9.04 Q 22 9.27 20.85 10.39 L 17.57 13.58 Q 17 14.14 17.14 14.93 L 17.91 19.44 Q 18.18 21.02 16.76 20.27 L 12.71 18.14 Q 12 17.77 11.29 18.14 L 7.24 20.27 Q 5.82 21.02 6.09 19.44 L 6.86 14.93 Q 7 14.14 6.43 13.58 L 3.15 10.39 Q 2 9.27 3.58 9.04 L 8.12 8.38 Q 8.91 8.26 9.26 7.54 Z"
              fill={isSelected ? '#ef4444' : '#fbbf24'}
              stroke="#1e1b18"
              strokeWidth="1.4"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="transition-colors group-hover:fill-[#f59e0b]"
            />

            {/* Clipped Shine Layer: Moving diagonal light streak across the star */}
            <g clipPath={`url(#star-clip-${uniqueId})`} className="pointer-events-none">
              <rect
                x="0"
                y="-18"
                width="10"
                height="60"
                fill={`url(#sheen-grad-${uniqueId})`}
                className="star-shine-streak"
              />
            </g>
          </svg>
        </div>
      ) : (
        /* NORMAL COLLECTION POINT: Exact matching token from Gallery 00 main map (without label) */
        <div
          className={`w-5 h-5 rounded-full border-2 border-[#1e1b18] flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? 'bg-[#ef4444] text-white shadow-[3px_3px_0px_#1e1b18] scale-125'
              : 'bg-[#fef08a] shadow-[2px_2px_0px_#1e1b18] group-hover:bg-[#f59e0b] group-hover:scale-110'
          }`}
          title="نقطه اثر هنری (عادی)"
        >
          {/* Inner Center Dot */}
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isSelected ? 'bg-white' : 'bg-[#1e1b18]'
            }`}
          />
        </div>
      )}
    </div>
  );
};

