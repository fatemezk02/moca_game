import React from 'react';
import { formatGalleryLabelFa } from './NavigationLight';
import { normalizeGalleryId } from '../services/content/mappers';

interface GalleryLockIndicatorProps {
  mapX: number; // Percentage (0 - 100)
  mapY: number; // Percentage (0 - 100)
  galleryId: string;
  title?: string;
  className?: string;
  scale?: number;
}

/**
 * GalleryLockIndicator
 *
 * Renders a locked padlock at the position of a gallery that the user
 * has not yet reached ("اونهایی که در آینده بهش قرار برسه").
 *
 * Design matches the museum floor plan visual language:
 * - Signature #1e1b18 dark outline with 1.5px solid offset shadow
 * - Antique brass vector padlock with keyhole
 */
export const GalleryLockIndicator: React.FC<GalleryLockIndicatorProps> = ({
  mapX,
  mapY,
  galleryId,
  title,
  className = '',
  scale,
}) => {
  const displayLabel = formatGalleryLabelFa(galleryId);
  const tooltipText = title || `${displayLabel} — هنوز باز نشده است`;
  const canonGalleryId = normalizeGalleryId(galleryId);
  const isGallery07 = canonGalleryId === 'gallery_07';
  const isGallery08 = canonGalleryId === 'gallery_08';

  // Custom scale: gallery 07 is 30% smaller (0.7 scale), gallery 08 is 10% smaller (0.9 scale)
  const effectiveScale =
    scale !== undefined
      ? scale
      : isGallery07
      ? 0.7
      : isGallery08
      ? 0.9
      : 1.0;
  const lockSize = Math.round(22 * effectiveScale * 10) / 10;

  return (
    <div
      id={`lock-indicator-${galleryId}`}
      style={{
        left: `${mapX}%`,
        top: `${mapY}%`,
        transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
        transformOrigin: 'center center',
      }}
      className={`absolute z-35 pointer-events-auto select-none ${className}`}
      title={tooltipText}
    >
      <div
        id={`lock-medallion-${galleryId}`}
        className="relative flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-70 hover:opacity-95 cursor-default"
      >
        {/* Pure Museum Vector Padlock */}
        <svg
          width={lockSize}
          height={lockSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible drop-shadow-[1px_1px_0px_#1e1b18]"
        >
          {/* Padlock Shackle */}
          <path
            d="M7.5 10.5V7C7.5 4.51472 9.51472 2.5 12 2.5C14.4853 2.5 16.5 4.51472 16.5 7V10.5"
            stroke="#1e1b18"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Padlock Body with antique warm brass fill */}
          <rect
            x="4.5"
            y="10"
            width="15"
            height="11.5"
            rx="2.5"
            fill="#d97706"
            stroke="#1e1b18"
            strokeWidth="1.8"
          />
          {/* Specular Highlight on Padlock Body */}
          <rect
            x="6.5"
            y="11.5"
            width="11"
            height="2"
            rx="1"
            fill="#fbbf24"
            opacity="0.6"
          />
          {/* Keyhole */}
          <circle cx="12" cy="15" r="1.3" fill="#1e1b18" />
          <path
            d="M12 16.3V18.5"
            stroke="#1e1b18"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

