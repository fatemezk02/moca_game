import React from 'react';

interface NavigationLightProps {
  /** X position as percentage (0 - 100) within the SVG coordinate space */
  mapX?: number;
  /** Y position as percentage (0 - 100) within the SVG coordinate space */
  mapY?: number;
  /** Label for destination gallery or location name */
  destinationName?: string;
  /** Current gallery ID (e.g. 'gallery-01') */
  galleryId?: string;
  /** Custom badge label underneath the lamp (e.g. "گالری ۰۱") */
  label?: string;
  /** Callback triggered when user taps/clicks the light (optional) */
  onNavigate?: () => void;
  /** Flag indicating this lamp is the player location indicator */
  isLocationIndicator?: boolean;
  /** Optional custom CSS classes */
  className?: string;
}

export function formatGalleryLabelFa(id?: string, customLabel?: string): string {
  if (customLabel) return customLabel;
  if (!id) return 'گالری ۰۱';

  const mapping: Record<string, string> = {
    'gallery-00': 'گالری ۰۰',
    'gallery-01': 'گالری ۰۱',
    'gallery-02': 'گالری ۰۲',
    'gallery-03': 'گالری ۰۳',
    'gallery-04': 'گالری ۰۴',
    'gallery-05': 'گالری ۰۵',
    'gallery-06': 'گالری ۰۶',
  };
  if (mapping[id]) {
    return mapping[id];
  }

  const match = typeof id === 'string' ? id.match(/\d+/) : null;
  if (match) {
    const persianDigits: Record<string, string> = {
      '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
      '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
    };
    const faNum = match[0].split('').map((d) => persianDigits[d] || d).join('');
    return `گالری ${faNum}`;
  }

  return id;
}

export const NavigationLight: React.FC<NavigationLightProps> = ({
  mapX = 50.0,
  mapY = 9.2,
  destinationName = 'گالری کنونی شما',
  galleryId,
  label,
  onNavigate,
  isLocationIndicator = true,
  className = '',
}) => {
  const displayLabel = formatGalleryLabelFa(galleryId || destinationName, label);

  return (
    <div
      id="player-location-nav-light-anchor"
      style={{
        left: `${mapX}%`,
        top: `${mapY}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`absolute z-35 pointer-events-auto select-none ${className}`}
    >
      {/* Touch Target Expander (Min 48x48px hit area) */}
      <div
        id="player-location-lamp-container"
        role={isLocationIndicator ? 'img' : 'button'}
        aria-label={isLocationIndicator ? `موقعیت کنونی شما: ${displayLabel}` : `Enter ${destinationName}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isLocationIndicator && onNavigate) {
            onNavigate();
          }
        }}
        className={`relative w-16 h-16 -m-4 flex items-center justify-center group focus:outline-none ${
          isLocationIndicator ? 'cursor-default pointer-events-none' : 'cursor-pointer'
        }`}
      >
        {/* Outer Gentle Pulsing Glow Halo (Layer 1 - Soft diffuse aura) */}
        <div
          className="absolute w-[51px] h-[51px] rounded-full pointer-events-none transition-transform duration-700 animate-pulse"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 197, 66, 0.45) 0%, rgba(245, 175, 40, 0.22) 45%, rgba(245, 158, 11, 0.08) 70%, transparent 90%)',
            filter: 'blur(2px)',
            animationDuration: '3s',
          }}
        />

        {/* Mid Pulsing Halo Ring (Layer 2 - Subtle breathing glow) */}
        <div
          className="absolute w-[36.5px] h-[36.5px] rounded-full pointer-events-none transition-all duration-500"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 236, 179, 0.9) 0%, rgba(245, 197, 66, 0.6) 45%, rgba(217, 119, 6, 0.2) 80%, transparent 100%)',
            boxShadow: '0 0 14px 4px rgba(245, 197, 66, 0.55)',
            animation: 'lampGlowPulse 2.8s ease-in-out infinite',
          }}
        />

        {/* Inner Glowing Lamp / Beacon Fixture */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Custom Stylized Museum Lightbulb - Scaled 4% smaller (31px) */}
          <div className="relative w-[31px] h-[31px] flex items-center justify-center filter drop-shadow-md group-hover:scale-105 group-active:scale-95 transition-transform duration-200">
            <svg
              viewBox="0 0 24 24"
              className="w-full h-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(1.5px 1.5px 0px #1e1b18)',
              }}
            >
              {/* Glass Bulb Body - Refined thinner stroke matching collection points */}
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z"
                fill="#fbbf24"
                stroke="#1e1b18"
                strokeWidth="1.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="transition-colors group-hover:fill-[#f59e0b]"
              />

              {/* Specular Highlight on Glass (Curved glare reflection) */}
              <path
                d="M8.2 5.8C9.2 4.6 10.6 4 12.2 4"
                stroke="#ffffff"
                strokeWidth="0.9"
                strokeLinecap="round"
                opacity="0.9"
                className="pointer-events-none"
              />

              {/* Minimal Internal Warm Filament */}
              <path
                d="M10 13V10.5C10 9.67 10.9 9 12 9C13.1 9 14 9.67 14 10.5V13"
                stroke="#1e1b18"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.75"
                className="pointer-events-none"
              />

              {/* Lightbulb Screw Base Thread lines - Refined thin outline */}
              <path
                d="M9.5 19.5H14.5"
                stroke="#1e1b18"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
              <path
                d="M10.5 21H13.5"
                stroke="#1e1b18"
                strokeWidth="1.1"
                strokeLinecap="round"
              />

              {/* Screw base contact point */}
              <path
                d="M11 22.2H13"
                stroke="#1e1b18"
                strokeWidth="1.0"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Room Code Badge Pill Underneath - Exactly matching SEC labels */}
          {displayLabel && (
            <div
              id="player-location-lamp-label"
              className="absolute top-7.5 font-sans-custom text-[10px] font-black px-1.5 py-0.2 rounded-md border-1.5 border-[#1e1b18] whitespace-nowrap transition-all duration-200 pointer-events-none bg-[#ffffff] text-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18] opacity-90 group-hover:opacity-100 group-hover:bg-[#fef3c7]"
            >
              {displayLabel}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Keyframe Style for Lamp Glow Pulse */}
      <style>
        {`
          @keyframes lampGlowPulse {
            0%, 100% {
              transform: scale(0.92);
              opacity: 0.75;
              box-shadow: 0 0 10px 2px rgba(245, 197, 66, 0.4);
            }
            50% {
              transform: scale(1.18);
              opacity: 1;
              box-shadow: 0 0 18px 6px rgba(245, 197, 66, 0.75);
            }
          }
        `}
      </style>
    </div>
  );
};
