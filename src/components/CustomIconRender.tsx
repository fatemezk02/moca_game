import React from 'react';
import { AdminIconPoint } from '../types/admin';
import { HelpCircle, LogIn, Star, Info } from 'lucide-react';
import { LocationPointMarker } from './LocationPointMarker';
import { GuidePaperMarker } from './GuidePaperMarker';

interface CustomIconRenderProps {
  point?: AdminIconPoint;
  iconPoint?: AdminIconPoint;
  className?: string;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const CustomIconRender: React.FC<CustomIconRenderProps> = ({
  point: pointProp,
  iconPoint,
  className = '',
  isSelected = false,
  onClick,
}) => {
  const point = pointProp || iconPoint;
  if (!point) return null;

  // If custom uploaded SVG or image data URI is present
  if (point.iconData) {
    if (point.iconData.startsWith('data:image') || point.iconData.startsWith('http') || point.iconData.startsWith('/')) {
      return (
        <img
          src={point.iconData}
          alt={point.title || 'Icon'}
          style={{ width: point.width || 32, height: point.height || 32 }}
          className={`object-contain select-none pointer-events-none ${className}`}
          onClick={onClick}
        />
      );
    }
    // If raw SVG string
    if (point.iconData.includes('<svg')) {
      return (
        <div
          style={{ width: point.width || 32, height: point.height || 32 }}
          className={`flex items-center justify-center ${className}`}
          dangerouslySetInnerHTML={{ __html: point.iconData }}
          onClick={onClick}
        />
      );
    }
  }

  // Preset types
  switch (point.iconType) {
    case 'preset-location-coffee':
      return (
        <LocationPointMarker
          iconType="coffee"
          size={point.width || 32}
          isSelected={isSelected}
          title={point.title}
          className={className}
        />
      );

    case 'preset-location-shop':
      return (
        <LocationPointMarker
          iconType="shop"
          size={point.width || 32}
          isSelected={isSelected}
          title={point.title}
          className={className}
        />
      );

    case 'preset-location-frame':
      return (
        <LocationPointMarker
          iconType="frame"
          size={point.width || 32}
          isSelected={isSelected}
          title={point.title}
          className={className}
        />
      );

    case 'preset-location-tree':
      return (
        <LocationPointMarker
          iconType="tree"
          size={point.width || 32}
          isSelected={isSelected}
          title={point.title}
          className={className}
        />
      );

    case 'preset-location-wc':
      return (
        <LocationPointMarker
          iconType="wc"
          size={point.width || 32}
          isSelected={isSelected}
          title={point.title}
          className={className}
        />
      );

    case 'preset-location-library':
      return (
        <LocationPointMarker
          iconType="library"
          size={point.width || 32}
          isSelected={isSelected}
          title={point.title}
          className={className}
        />
      );

    case 'preset-location-entrance':
      return (
        <LocationPointMarker
          iconType="entrance"
          size={point.width || 32}
          isSelected={isSelected}
          title={point.title}
          className={className}
        />
      );

    case 'preset-location-cinema':
      return (
        <LocationPointMarker
          iconType="cinema"
          size={point.width || 32}
          isSelected={isSelected}
          title={point.title}
          className={className}
        />
      );

    case 'preset-location-gallery':
    case 'preset-location-gallery-1':
    case 'preset-location-gallery-2':
    case 'preset-location-gallery-3':
    case 'preset-location-gallery-4':
    case 'preset-location-gallery-5':
    case 'preset-location-gallery-6':
    case 'preset-location-gallery-7':
    case 'preset-location-gallery-8':
    case 'preset-location-gallery-9': {
      let gNum: number | string = point.galleryNumber || 1;
      if (point.iconType.startsWith('preset-location-gallery-')) {
        const parsed = parseInt(point.iconType.replace('preset-location-gallery-', ''), 10);
        if (!isNaN(parsed)) {
          gNum = parsed;
        }
      }
      const isGallery7 =
        gNum === 7 ||
        point.iconType === 'preset-location-gallery-7' ||
        point.id === 'icon-g00-gallery-7' ||
        point.id === 'icon-g00-to-g07';
      const baseSize = point.width || 32;
      const finalSize = isGallery7
        ? (baseSize <= 26 ? baseSize : Math.round(baseSize * 0.8))
        : baseSize;

      return (
        <LocationPointMarker
          iconType="gallery"
          galleryNumber={gNum}
          size={finalSize}
          isSelected={isSelected}
          title={point.title}
          className={className}
        />
      );
    }

    case 'preset-question':
      return (
        <GuidePaperMarker
          size={point.width ? Math.round(point.width * 0.8) : 28}
          width={point.width ? Math.min(Math.round(point.width * 0.8), 30) : 28}
          height={point.height ? Math.round(Math.min(Math.round((point.width || 36) * 0.8), 30) * 1.15) : undefined}
          isSelected={isSelected}
          className={className}
        />
      );

    case 'preset-door':
      return (
        <div
          style={{ width: point.width, height: point.height }}
          className={`relative flex items-center justify-center ${className}`}
        >
          <span className="absolute -inset-1.5 rounded-full border border-[#c5a059]/40 animate-pulse" />
          <div className="w-full h-full rounded-full border border-[#c5a059] bg-white flex items-center justify-center shadow-sm">
            <LogIn className="w-4 h-4 text-[#0e0f0f]" />
          </div>
        </div>
      );

    case 'preset-star':
      return (
        <div
          style={{ width: point.width, height: point.height }}
          className={`flex items-center justify-center ${className}`}
        >
          <Star className="w-full h-full text-[#c5a059] fill-[#c5a059]" />
        </div>
      );

    case 'preset-info':
    default:
      return (
        <div
          style={{ width: point.width, height: point.height }}
          className={`flex items-center justify-center ${className}`}
        >
          <Info className="w-full h-full text-[#0e0f0f]" />
        </div>
      );
  }
};
