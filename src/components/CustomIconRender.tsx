import React from 'react';
import { AdminIconPoint } from '../types/admin';
import { HelpCircle, LogIn, Star, Info } from 'lucide-react';
import { LocationPointMarker } from './LocationPointMarker';

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

    case 'preset-question':
      return (
        <div
          style={{ width: point.width, height: point.height }}
          className={`relative group flex items-center justify-center ${className}`}
        >
          {/* Real-time animated border ring */}
          <span className="absolute -inset-1 border border-[#0e0f0f]/30 rounded-xs animate-ping opacity-30 pointer-events-none" />
          <span className="absolute -inset-0.5 border border-[#0e0f0f]/40 rounded-xs animate-pulse opacity-50 pointer-events-none" />
          <span className="relative w-full h-full bg-white border border-[#0e0f0f] shadow-xs flex items-center justify-center">
            <span className="font-mono-custom text-sm font-bold text-[#0e0f0f] leading-none select-none">
              ?
            </span>
          </span>
        </div>
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
