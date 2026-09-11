import React from 'react';
import { ExperienceIconType } from '../services/content/types';
import { ExperienceIcon } from './ExperienceIcon';

interface ExperiencePointMarkerProps {
  iconId: ExperienceIconType | string;
  isSelected?: boolean;
  className?: string;
  title?: string;
}

export const ExperiencePointMarker: React.FC<ExperiencePointMarkerProps> = ({
  iconId,
  isSelected = false,
  className = '',
  title,
}) => {
  return (
    <div
      title={title || 'نقطه تجربه'}
      className={`relative flex items-center justify-center transition-transform duration-200 cursor-pointer select-none group ${
        isSelected ? 'scale-120' : 'hover:scale-115 active:scale-95'
      } ${className}`}
    >
      {/* Standalone Experience Icon directly on the map (no circle, no badge, no frame container) */}
      <div
        className="relative flex items-center justify-center transition-transform duration-200"
        style={{
          filter: isSelected
            ? 'drop-shadow(2px 2px 0px #1e1b18)'
            : 'drop-shadow(1.5px 1.5px 0px #1e1b18)',
        }}
      >
        <ExperienceIcon
          iconId={iconId}
          isSelected={isSelected}
          className="w-[39.8px] h-[39.8px] transition-transform duration-200"
        />
      </div>
    </div>
  );
};

