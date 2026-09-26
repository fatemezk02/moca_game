import React from 'react';
import { toPersianDigits, formatTwoDigitPersian } from '../services/content/mappers';

export type LocationMarkerIconType =
  | 'coffee'
  | 'shop'
  | 'frame'
  | 'artwork'
  | 'exhibit'
  | 'info'
  | 'star'
  | 'tree'
  | 'wc'
  | 'restroom'
  | 'library'
  | 'entrance'
  | 'door'
  | 'cinema'
  | 'gallery'
  | 'general';

export interface LocationPointMarkerProps {
  iconType?: LocationMarkerIconType;
  galleryNumber?: number | string;
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
  galleryNumber,
  isSelected = false,
  size = 32,
  className = '',
  title = 'موقعیت مکانی',
  onClick,
}) => {
  // 1:1 square aspect ratio
  const height = size;
  const rawNum =
    galleryNumber !== undefined && galleryNumber !== null && galleryNumber !== ''
      ? (typeof galleryNumber === 'number' ? galleryNumber : (parseInt(String(galleryNumber), 10) || galleryNumber))
      : 1;
  const persianNumber = toPersianDigits(rawNum);

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      title={title}
      className={`group relative inline-flex items-center justify-center select-none transition-transform duration-200 origin-center ${
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
          fill={isSelected ? '#ef4444' : iconType === 'gallery' ? '#84e89f' : '#fbbf24'}
          stroke="#1e1b18"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          className={`transition-colors ${iconType === 'gallery' ? 'group-hover:fill-[#6ee7a0]' : 'group-hover:fill-[#f59e0b]'}`}
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
          r={iconType === 'gallery' ? 7.2 : 8.085}
          fill={
            iconType === 'frame' || iconType === 'artwork' || iconType === 'exhibit'
              ? '#1e1b18'
              : '#ffffff'
          }
          stroke={iconType === 'gallery' ? '#1e1b18' : undefined}
          strokeWidth={iconType === 'gallery' ? 1.2 : undefined}
          className="pointer-events-none"
        />

        {/* Inner Glyph: Frame / Square with White Outline & Corner Reflection Lines */}
        {(iconType === 'frame' || iconType === 'artwork' || iconType === 'exhibit') && (
          <g id="glyph-display-frame" className="pointer-events-none">
            {/* Outer Perspective/Trapezoid Frame with White Outline */}
            <path
              d="M 12.2 9.8
                 L 19.8 9.8
                 L 21.0 17.2
                 L 11.0 17.2
                 Z"
              fill="#1e1b18"
              stroke="#ffffff"
              strokeWidth="1.15"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Top-Left Inner Corner Line (┌) */}
            <path
              d="M 12.8 13.0
                 L 12.8 11.2
                 L 15.6 11.2"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Bottom-Right Inner Corner Line (┘) */}
            <path
              d="M 19.2 14.0
                 L 19.2 15.8
                 L 16.4 15.8"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* Inner Glyph (Coffee Cup - Enlarged & Centered without steam) */}
        {iconType === 'coffee' && (
          <g id="glyph-coffee-cup" className="pointer-events-none">
            {/* Coffee Cup Handle */}
            <path
              d="M 19.0 11.2 C 21.6 11.2, 21.6 15.0, 19.0 15.0"
              stroke="#1e1b18"
              strokeWidth="1.25"
              strokeLinecap="round"
              fill="none"
            />

            {/* Coffee Cup Body */}
            <path
              d="M 11.4 10.0
                 H 19.0
                 V 13.6
                 C 19.0 15.6, 17.8 16.6, 16.2 16.6
                 H 14.2
                 C 12.6 16.6, 11.4 15.6, 11.4 13.6
                 Z"
              fill="#451a03"
              stroke="#1e1b18"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Coffee Surface Accent */}
            <ellipse
              cx="15.2"
              cy="10.2"
              rx="3.4"
              ry="0.75"
              fill="#c5a059"
            />

            {/* Saucer Base */}
            <path
              d="M 10.6 17.0 H 19.8"
              stroke="#1e1b18"
              strokeWidth="1.2"
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

        {/* Inner Glyph: Simple Minimalist Tree */}
        {iconType === 'tree' && (
          <g id="glyph-tree" className="pointer-events-none">
            {/* Trunk */}
            <rect
              x="15.1"
              y="14.6"
              width="1.8"
              height="2.8"
              rx="0.3"
              fill="#78350f"
              stroke="#1e1b18"
              strokeWidth="0.9"
            />
            {/* Simple Crisp Tree Crown */}
            <path
              d="M 12.2 14.6
                 C 11.0 14.6 10.2 13.4 10.6 12.2
                 C 10.1 11.0 11.3 9.8 12.5 10.0
                 C 13.2 8.6 15.0 8.2 16.0 8.9
                 C 17.0 8.2 18.8 8.6 19.5 10.0
                 C 20.7 9.8 21.9 11.0 21.4 12.2
                 C 21.8 13.4 21.0 14.6 19.8 14.6
                 Z"
              fill="#16a34a"
              stroke="#1e1b18"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            {/* Minimalist leaf / inner accent branch */}
            <path
              d="M 16.0 10.4 V 13.5"
              stroke="#14532d"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <path
              d="M 16.0 11.8 L 14.5 11.0"
              stroke="#14532d"
              strokeWidth="0.75"
              strokeLinecap="round"
            />
            <path
              d="M 16.0 12.6 L 17.5 11.8"
              stroke="#14532d"
              strokeWidth="0.75"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Inner Glyph: Restroom / WC */}
        {(iconType === 'wc' || iconType === 'restroom') && (
          <g id="glyph-wc" className="pointer-events-none">
            <text
              x="16"
              y="14.3"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#1e1b18"
              stroke="#1e1b18"
              strokeWidth="0.35"
              strokeLinejoin="round"
              paintOrder="stroke fill"
              fontSize="6.8"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.15"
            >
              WC
            </text>
          </g>
        )}

        {/* Inner Glyph: Library (Open Book) */}
        {iconType === 'library' && (
          <g id="glyph-library" className="pointer-events-none">
            <svg
              x={10.6}
              y={9.82}
              width={10.8}
              height={7.36}
              viewBox="0 0 1415.41 964.6"
              fill="#1e1b18"
            >
              <g id="Layer_2" data-name="Layer 2">
                <g id="Layer_1-2" data-name="Layer 1">
                  <path d="M1415.41,947.83c0,13.43-3.89,16.8-16.93,16.77Q1100,964,801.53,964.3c-4.2,0-8.41-.4-12.61-.62C824.65,937.78,864,920.57,905,907c64.51-21.32,130.8-33.58,198.35-40.56,65.21-6.74,130.38-6.92,195.67-3.56,21.09,1.08,34.38-11.77,34.42-34.83q.22-106,.06-212c0-143.71.15-287.43-.3-431.14,0-12.5,2.79-17,15.82-16.12a369,369,0,0,0,50.43,0c13-.88,16,3.69,15.94,16.19-.45,125.92-.27,251.86-.27,377.79C1415.1,691.16,1414.9,819.5,1415.41,947.83Z" />
                  <path d="M628.05,961.66c-6.82,4.11-12.19,2.64-17.25,2.64q-295.68.12-591.37,0C.05,964.34,0,964.32,0,944.83Q0,566.21,0,187.6c0-18.4,0-18.43,18.84-18.46,17.31,0,34.62.3,51.92-.12,8.18-.2,11.47,2.78,10.62,10.89-.4,3.81-.07,7.69-.07,11.53q0,315.17,0,630.32c0,33.17,10.27,41.36,43.79,40,137.25-5.42,272.67,5,403.24,51.57C562.62,925.6,595.66,941,628.05,961.66Z" />
                  <path d="M1274.41,786.08c.06,13.69-4,16.16-17,15.91-131.43-2.61-260.78,10.4-385.75,54.09a599.39,599.39,0,0,0-121.71,58.4c-3.49,2.2-6.86,7.1-11.2,5-4.52-2.17-2.32-7.74-2.32-11.77q-.15-372-.25-744.09c0-8.82,2.79-15.56,8.31-22.11C784.77,93.76,837.34,65,894.92,44c111.24-40.45,226.82-46.73,343.6-42.91,35.55,1.17,35.53,1.49,35.53,36.56V404h0C1274.1,531.33,1273.88,658.7,1274.41,786.08Z" />
                  <path d="M678.5,911.53c.49,9.92-2.69,10.47-10.56,5.35-35.13-22.81-72.65-40.84-111.81-55.74-57.21-21.78-116.28-36-176.63-45.33A1207,1207,0,0,0,152.67,802.1c-12.81.44-12.59-5.63-12.58-14.58q.16-192.46.07-384.94c0-127.36.32-254.72-.34-382.08-.08-14.95,4.8-18.49,18.59-19C224.74-.85,291-1.38,357,6.86c97.58,12.19,191.58,35.21,272.32,95.65,2.69,2,5.24,4.21,8,6.17,31.19,22.27,42.44,50.71,42.09,90.61-2,233.07-.94,466.18-.9,699.27C678.48,902.88,678.29,907.22,678.5,911.53Z" />
                </g>
              </g>
            </svg>
          </g>
        )}

        {/* Inner Glyph: Enter / Entrance */}
        {(iconType === 'entrance' || iconType === 'door') && (
          <g id="glyph-entrance" className="pointer-events-none">
            <svg
              x={10.8}
              y={8.3}
              width={10.4}
              height={10.4}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1e1b18"
              strokeWidth="2.71"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" x2="3" y1="12" y2="12" />
            </svg>
          </g>
        )}

        {/* Inner Glyph: Cinema Clapperboard */}
        {iconType === 'cinema' && (
          <g id="glyph-cinema" className="pointer-events-none">
            {/* Clapperboard bottom body */}
            <rect
              x="11.8"
              y="12.4"
              width="8.4"
              height="5.0"
              rx="0.5"
              fill="#1e1b18"
              stroke="#1e1b18"
              strokeWidth="0.8"
            />
            {/* Mini film play symbol on body */}
            <polygon points="15.2,13.9 17.4,14.9 15.2,15.9" fill="#fbbf24" />
            {/* Clapper top bar */}
            <rect
              x="11.8"
              y="9.8"
              width="8.4"
              height="2.2"
              rx="0.4"
              fill="#1e1b18"
              stroke="#1e1b18"
              strokeWidth="0.8"
            />
            {/* Diagonal white slashes on clapper bar */}
            <line x1="13.6" y1="9.8" x2="14.8" y2="12.0" stroke="#ffffff" strokeWidth="0.9" />
            <line x1="16.6" y1="9.8" x2="17.8" y2="12.0" stroke="#ffffff" strokeWidth="0.9" />
          </g>
        )}

        {/* Inner Glyph: Gallery Number directly on the white circle (no frame) */}
        {iconType === 'gallery' && (
          <g id="glyph-gallery-number" className="pointer-events-none">
            <text
              x="16.0"
              y="13.7"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#1e1b18"
              stroke="#1e1b18"
              strokeWidth="0.45"
              strokeLinejoin="round"
              strokeLinecap="round"
              paintOrder="stroke fill"
              fontSize="10"
              fontWeight="900"
              style={{ fontWeight: 900 }}
              fontFamily="Vazirmatn, sans-serif"
            >
              {persianNumber}
            </text>
          </g>
        )}

        {/* Fallback general glyph */}
        {iconType !== 'coffee' &&
          iconType !== 'shop' &&
          iconType !== 'tree' &&
          iconType !== 'frame' &&
          iconType !== 'artwork' &&
          iconType !== 'exhibit' &&
          iconType !== 'wc' &&
          iconType !== 'restroom' &&
          iconType !== 'library' &&
          iconType !== 'entrance' &&
          iconType !== 'door' &&
          iconType !== 'cinema' &&
          iconType !== 'gallery' && (
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
