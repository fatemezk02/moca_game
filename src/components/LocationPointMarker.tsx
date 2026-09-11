import React from 'react';

export type LocationMarkerIconType = 'coffee' | 'shop' | 'info' | 'star' | 'general';

export interface LocationPointMarkerProps {
  iconType?: LocationMarkerIconType;
  isSelected?: boolean;
  size?: number; // Visual width (default: 32px)
  className?: string;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Reusable Location-Style Marker Component
 * Follows the museum game visual language:
 * - Clean, elegant map pin silhouette with rounded corners
 * - Signature #1e1b18 outline with 2px solid drop shadow
 * - High-contrast circular center hosting a recognizable glyph
 * - Specular highlight and playful museum aesthetic
 */
export const LocationPointMarker: React.FC<LocationPointMarkerProps> = ({
  iconType = 'coffee',
  isSelected = false,
  size = 32,
  className = '',
  title = 'موقعیت مکانی',
  onClick,
}) => {
  // 1:1 square aspect ratio
  const height = size;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      title={title}
      className={`group relative inline-flex items-center justify-center select-none transition-transform duration-200 origin-bottom ${
        onClick ? 'cursor-pointer hover:scale-110 active:scale-95' : 'pointer-events-none'
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${height}px`,
      }}
    >
      {/* Selection / Active Halo for Admin Mode or Focus */}
      {isSelected && (
        <span
          className="absolute -inset-2 border-2 border-dashed border-[#ef4444] rounded-full pointer-events-none animate-pulse"
        />
      )}

      {/* Main Vector Location Pin (1:1 Ratio with rounded, non-sharp bottom) */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible pointer-events-none"
        style={{
          filter: isSelected
            ? 'drop-shadow(2.5px 2.5px 0px #1e1b18)'
            : 'drop-shadow(2px 2px 0px #1e1b18)',
        }}
      >
        {/* Outer Pin Body Silhouette - Shorter, rounded 1:1 pin */}
        <path
          d="M 14.3 28.5
             Q 16 30.2 17.7 28.5
             C 20.3 25.4 27 19.6 27 13.5
             C 27 7.4 22.1 2.5 16 2.5
             C 9.9 2.5 5 7.4 5 13.5
             C 5 19.6 11.7 25.4 14.3 28.5
             Z"
          fill={isSelected ? '#ef4444' : '#fbbf24'}
          stroke="#1e1b18"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="transition-colors group-hover:fill-[#f59e0b]"
        />

        {/* Specular Highlight Arc on Pin Head */}
        <path
          d="M 8.5 10 C 9.8 6.5 12.5 4.5 16 4.5"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
          className="pointer-events-none"
        />

        {/* Inner Circular Center Disk */}
        <circle
          cx="16"
          cy="13.5"
          r="7.2"
          fill="#ffffff"
          stroke="#1e1b18"
          strokeWidth="1.2"
          className="pointer-events-none"
        />

        {/* Inner Glyph (Coffee Cup or other Location Types) */}
        {iconType === 'coffee' && (
          <g id="glyph-coffee-cup" className="pointer-events-none">
            {/* Subtle Steam Wisps */}
            <path
              d="M 14.2 10.8 C 13.9 10.0, 14.6 9.4, 14.2 8.6"
              stroke="#b45309"
              strokeWidth="0.85"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M 16.8 10.4 C 16.5 9.6, 17.2 9.0, 16.8 8.2"
              stroke="#b45309"
              strokeWidth="0.85"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />

            {/* Coffee Cup Handle */}
            <path
              d="M 18.4 12.8 C 19.8 12.8, 19.8 15.3, 18.4 15.3"
              stroke="#1e1b18"
              strokeWidth="1.1"
              strokeLinecap="round"
              fill="none"
            />

            {/* Coffee Cup Body */}
            <path
              d="M 12.4 12.2
                 H 18.4
                 V 14.7
                 C 18.4 15.8, 17.5 16.7, 16.3 16.7
                 H 14.5
                 C 13.3 16.7, 12.4 15.8, 12.4 14.7
                 Z"
              fill="#451a03"
              stroke="#1e1b18"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />

            {/* Coffee Surface Accent */}
            <ellipse
              cx="15.4"
              cy="12.4"
              rx="2.5"
              ry="0.65"
              fill="#c5a059"
            />

            {/* Small Saucer Base */}
            <path
              d="M 12.0 17.5 H 18.8"
              stroke="#1e1b18"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Inner Glyph: Square Minimalist Shopping Bag */}
        {iconType === 'shop' && (
          <g id="glyph-shopping-bag" className="pointer-events-none">
            {/* Clean Curved Handle */}
            <path
              d="M 14.0 11.5 C 14.0 8.8, 18.0 8.8, 18.0 11.5"
              stroke="#1e1b18"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Square Clean Bag Body */}
            <rect
              x="12.2"
              y="11.5"
              width="7.6"
              height="6.2"
              rx="0.6"
              fill="#292524"
              stroke="#1e1b18"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* Fallback general glyph */}
        {iconType !== 'coffee' && iconType !== 'shop' && (
          <circle
            cx="16"
            cy="13.5"
            r="3"
            fill="#1e1b18"
            className="pointer-events-none"
          />
        )}
      </svg>
    </div>
  );
};
