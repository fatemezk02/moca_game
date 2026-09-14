import React from 'react';

export interface GuidePaperMarkerProps {
  size?: number;
  width?: number;
  height?: number;
  isSelected?: boolean;
  className?: string;
  showPulse?: boolean;
}

/**
 * Reusable Paper Question Mark Icon for Gallery Guide Cards.
 * Unified with the museum app's signature visual identity:
 * - Refined parchment sheet with signature #1e1b18 outline & 2px solid drop shadow
 * - Warm museum gold dog-eared top-right corner fold
 * - Crisp, high-contrast question mark glyph
 * - Scaled down 20% to fit harmoniously into the map layout
 */
export const GuidePaperMarker: React.FC<GuidePaperMarkerProps> = ({
  size = 28,
  width,
  height,
  isSelected = false,
  className = '',
  showPulse = true,
}) => {
  const w = width || size;
  const h = height ? Math.round(height * 0.9) : Math.round(w * 1.15); // Length/height reduced by 10%

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-200 ${
        isSelected ? 'scale-110' : 'hover:scale-110 active:scale-95'
      } ${className}`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      {/* Subtle beacon effect */}
      {showPulse && (
        <span
          className="absolute -inset-1 rounded-sm border border-[#1e1b18]/20 animate-ping opacity-20 pointer-events-none"
          style={{ animationDuration: '3.5s' }}
        />
      )}

      <svg
        viewBox="0 0 36 41.5"
        className="w-full h-full overflow-visible select-none pointer-events-none"
        style={{
          filter: isSelected
            ? 'drop-shadow(2.5px 2.5px 0px #1e1b18)'
            : 'drop-shadow(2px 2px 0px #1e1b18)',
        }}
      >
        <defs>
          {/* Subtle paper gradient */}
          <linearGradient id="guide-paper-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f7f3ee" />
          </linearGradient>

          {/* Museum Gold Gradient for Question Mark & Fold */}
          <linearGradient id="guide-qmark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Main Paper Sheet with Folded Top-Right Corner (height reduced by 10%) */}
        <path
          d="M 6 3
             L 24 3
             L 33 12
             L 33 37.5
             A 2.5 2.5 0 0 1 30.5 40
             L 5.5 40
             A 2.5 2.5 0 0 1 3 37.5
             L 3 6
             A 2.5 2.5 0 0 1 5.5 3.5
             Z"
          fill={isSelected ? '#fee2e2' : 'url(#guide-paper-bg)'}
          stroke="#1e1b18"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Top-Right Dog-Ear Fold Flap (Golden Amber fill matching app theme) */}
        <path
          d="M 24 3.5
             L 24 12
             L 32.5 12
             Z"
          fill={isSelected ? '#ef4444' : '#fbbf24'}
          stroke="#1e1b18"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Inner Crease Line for the folded corner */}
        <line
          x1="24"
          y1="3.5"
          x2="32.5"
          y2="12"
          stroke="#1e1b18"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Custom User-Provided Question Mark (scaled down 25%) */}
        <svg
          x="10.87"
          y="13.5"
          width="14.25"
          height="21"
          viewBox="0 0 252.56 426.34"
          className="overflow-visible select-none pointer-events-none"
        >
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <path
                fill={isSelected ? '#ef4444' : '#f16b95'}
                stroke="#000000"
                strokeMiterlimit="10"
                strokeWidth="28px"
                d="M126.24,3.62C183,5.73,239.74,35.2,248,96.48a108.81,108.81,0,0,1-2.92,44.09c-7.49,26.45-23.31,46.74-43.75,64.19-14.6,12.46-29.7,24.36-43.69,37.52-12.72,12-27.09,25.86-29.4,44.12-.82,6.46-2,14.38-6.17,19.61-5.6,6.95-14.7,4.92-18.85-2.64-1.92-3.5-2.67-7.49-3.4-11.41-4.32-23.18-8.88-48.19,1.59-70.44,7.84-16.66,20.42-31.24,31.84-46,13.88-18,26.61-32.9,31.08-55.84,3.82-19.58,3.45-41.82-7.06-59.4C145.49,40.5,117.55,27.81,95.18,35.65c-10.51,3.68-16.81,13-14.93,25.07s5.52,23.93,8.37,35.89c8.21,34.44-23.86,57.87-56.19,45.53C9.18,133.26,1.15,109.33,4.08,86.06,6.91,63.59,22.3,45.31,38.92,31A111.68,111.68,0,0,1,98.72,4.75,176.19,176.19,0,0,1,126.24,3.62Z"
              />
              <circle
                fill={isSelected ? '#ef4444' : '#f16b95'}
                stroke="#000000"
                strokeMiterlimit="10"
                strokeWidth="28px"
                cx="115.68"
                cy="382.58"
                r="40.26"
              />
            </g>
          </g>
        </svg>
      </svg>
    </div>
  );
};
