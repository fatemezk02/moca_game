import React from 'react';
import { AdminArrowPoint } from '../types/admin';

interface NavigationArrowRenderProps {
  arrow: AdminArrowPoint;
  isSelected?: boolean;
  isInteractive?: boolean;
  isDisabled?: boolean;
  isBack?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
}

/**
 * Checks if an arrow is a return/back arrow to a previous gallery
 */
export function isPreviousGalleryArrow(arrow: AdminArrowPoint): boolean {
  if (!arrow) return false;

  // 1. Explicit ID matches for previous gallery return arrows
  const returnArrowIds = [
    'arrow-g01-to-g00',
    'arrow-g02-to-g00',
    'arrow-g03-to-g02',
    'arrow-g04-to-g03',
    'arrow-g05-to-g04',
    'arrow-g06-to-g05',
    'arrow-g07-to-g06',
    'arrow-g08-to-g07',
    'arrow-g09-to-g08',
  ];
  if (returnArrowIds.includes(arrow.id)) {
    return true;
  }

  // 2. Check title keywords specifically for return to previous gallery
  const title = arrow.title || '';
  if (
    title.includes('بازگشت به گالری') ||
    title.includes('بازگشت به نقشه اصلی') ||
    title.includes('گالری قبلی')
  ) {
    return true;
  }

  // 3. Check numeric gallery progression (destination gallery < source gallery)
  const sourceNumMatch = arrow.galleryId?.match(/\d+/);
  const destNumMatch = arrow.destination?.match(/\d+/);
  if (sourceNumMatch && destNumMatch) {
    const sourceNum = parseInt(sourceNumMatch[0], 10);
    const destNum = parseInt(destNumMatch[0], 10);
    // If destination is previous gallery (e.g. source 4, dest 3, or source 1, dest 0)
    // Exclude source 9 -> dest 0 which is the final exit
    if (destNum < sourceNum && !(sourceNum === 9 && destNum === 0)) {
      return true;
    }
  }

  return false;
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
  isDisabled = false,
  isBack,
  className = '',
  onClick,
}) => {
  const isActionable = arrow.destination && arrow.destination !== 'none';
  const isReturnArrow = isBack ?? isPreviousGalleryArrow(arrow);
  const isClickable = !isDisabled && isInteractive && isActionable;

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDisabled || !isInteractive) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : -1}
      aria-disabled={isDisabled ? true : undefined}
      aria-label={arrow.title || `Navigation Arrow to ${arrow.destination}`}
      onClick={handleClick}
      style={{
        width: `${arrow.size}px`,
        height: `${arrow.size}px`,
        transform: `rotate(${arrow.rotation}deg)`,
      }}
      className={`group relative inline-flex items-center justify-center select-none transition-transform duration-150 origin-center ${
        isClickable
          ? 'cursor-pointer hover:scale-110 active:scale-95 pointer-events-auto'
          : isDisabled
          ? 'cursor-not-allowed pointer-events-none opacity-35 grayscale-[70%]'
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

      {/* Pure SVG Arrow Icon Asset: forward arrows have continuous pointing animation ONLY when active; return arrows or disabled arrows have NO animation */}
      <div
        className={`w-full h-full pointer-events-none flex items-center justify-center ${
          isReturnArrow || isDisabled ? '' : 'animate-arrow-pointing'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible pointer-events-none"
          style={{
            filter: isSelected
              ? 'drop-shadow(2.5px 2.5px 0px #1e1b18)'
              : isDisabled
              ? 'drop-shadow(1.5px 1.5px 0px rgba(30, 27, 24, 0.35))'
              : 'drop-shadow(2px 2px 0px #1e1b18)',
          }}
        >
          {/* Main Refined Arrow Silhouette: Red for back arrows, museum gold for forward arrows */}
          <path
            d="M 22.2 6.5 Q 24 4.5 25.8 6.5 L 37.2 20.8 Q 38.8 22.4 37.4 23.8 L 28.6 21.6 Q 27.2 21.4 27.2 23.2 L 27.2 40.5 Q 27.2 42.6 25.4 43 L 24 43.3 L 22.6 43 Q 20.8 42.6 20.8 40.5 L 20.8 23.2 Q 20.8 21.4 19.4 21.6 L 10.6 23.8 Q 9.2 22.4 10.8 20.8 L 22.2 6.5 Z"
            fill={
              isSelected
                ? '#ef4444'
                : isDisabled
                ? isReturnArrow
                  ? '#b91c1c'
                  : '#d97706'
                : isReturnArrow
                ? '#ef4444'
                : '#fbbf24'
            }
            stroke={isDisabled ? 'rgba(30, 27, 24, 0.6)' : '#1e1b18'}
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
            className={`transition-colors ${
              isDisabled
                ? ''
                : isReturnArrow
                ? 'group-hover:fill-[#dc2626]'
                : 'group-hover:fill-[#f59e0b]'
            }`}
          />

          {/* Left Flank Specular Highlight for subtle museum token depth */}
          <path
            d="M 23.8 7.5 L 12.4 20.5 Q 11.6 21.5 12.8 22.2 L 19 20.5 Q 21.2 20.2 21.2 22.8 L 21.2 40.5 Q 21.2 42 22.4 42.4 L 23.8 42.5 Z"
            fill="#ffffff"
            opacity={isDisabled ? '0.2' : '0.45'}
            className="pointer-events-none"
          />
        </svg>
      </div>
    </div>
  );
};

