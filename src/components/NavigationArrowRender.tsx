import React from 'react';
import { AdminArrowPoint } from '../types/admin';

interface NavigationArrowRenderProps {
  arrow: AdminArrowPoint;
  isSelected?: boolean;
  isInteractive?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
}

/**
 * Renders an independent navigation arrow asset.
 * Displays ONLY the arrow itself (no circles, cards, backgrounds, or markers).
 * Proportions are preserved, rotated by `arrow.rotation`, sized by `arrow.size`.
 */
export const NavigationArrowRender: React.FC<NavigationArrowRenderProps> = ({
  arrow,
  isSelected = false,
  isInteractive = true,
  className = '',
  onClick,
}) => {
  const isActionable = arrow.destination && arrow.destination !== 'none';

  return (
    <div
      role={isInteractive && isActionable ? 'button' : undefined}
      tabIndex={isInteractive && isActionable ? 0 : -1}
      aria-label={arrow.title || `Navigation Arrow to ${arrow.destination}`}
      onClick={onClick}
      style={{
        width: `${arrow.size}px`,
        height: `${arrow.size}px`,
        transform: `rotate(${arrow.rotation}deg)`,
      }}
      className={`group relative inline-flex items-center justify-center select-none transition-transform duration-150 origin-center ${
        isInteractive && isActionable
          ? 'cursor-pointer hover:scale-110 active:scale-95'
          : isInteractive
          ? 'cursor-pointer'
          : 'pointer-events-none'
      } ${className}`}
    >
      {/* Selected Indicator Halo for Admin Mode */}
      {isSelected && (
        <span
          className="absolute -inset-2 border-2 border-dashed border-[#ef4444] rounded-sm pointer-events-none animate-pulse"
          style={{ transform: `rotate(${-arrow.rotation}deg)` }}
        />
      )}

      {/* Pure SVG Arrow Icon Asset with continuous directional pointing animation */}
      <div className="w-full h-full animate-arrow-pointing pointer-events-none flex items-center justify-center">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible pointer-events-none"
          style={{
            filter: isSelected
              ? 'drop-shadow(2.5px 2.5px 0px #1e1b18)'
              : 'drop-shadow(2px 2px 0px #1e1b18)',
          }}
        >
          {/* Main Refined Arrow Silhouette with softened rounded corners & museum gold fill */}
          <path
            d="M 22.2 6.5 Q 24 4.5 25.8 6.5 L 37.2 20.8 Q 38.8 22.4 37.4 23.8 L 28.6 21.6 Q 27.2 21.4 27.2 23.2 L 27.2 40.5 Q 27.2 42.6 25.4 43 L 24 43.3 L 22.6 43 Q 20.8 42.6 20.8 40.5 L 20.8 23.2 Q 20.8 21.4 19.4 21.6 L 10.6 23.8 Q 9.2 22.4 10.8 20.8 L 22.2 6.5 Z"
            fill={isSelected ? '#ef4444' : '#fbbf24'}
            stroke="#1e1b18"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-colors group-hover:fill-[#f59e0b]"
          />

          {/* Left Flank Specular Highlight for subtle museum token depth */}
          <path
            d="M 23.8 7.5 L 12.4 20.5 Q 11.6 21.5 12.8 22.2 L 19 20.5 Q 21.2 20.2 21.2 22.8 L 21.2 40.5 Q 21.2 42 22.4 42.4 L 23.8 42.5 Z"
            fill="#ffffff"
            opacity="0.45"
            className="pointer-events-none"
          />
        </svg>
      </div>
    </div>
  );
};

