import React from 'react';
import { ExperienceIconType } from '../services/content/types';

interface ExperienceIconProps {
  iconId: ExperienceIconType | string;
  className?: string;
  size?: number;
  isSelected?: boolean;
}

export const ExperienceIcon: React.FC<ExperienceIconProps> = ({
  iconId,
  className = 'w-6 h-6',
  size,
  isSelected = false,
}) => {
  const cleanId = (iconId || '').toLowerCase().replace(/_/g, '-');
  const style = size ? { width: size, height: size } : undefined;

  // Resolve icon type based on iconId or aliases
  let resolvedType: ExperienceIconType = 'frame';
  if (cleanId.includes('shadow') || cleanId.includes('silhouette') || cleanId.includes('سایه')) {
    resolvedType = 'shadow-silhouette';
  } else if (cleanId.includes('mirror-selfie') || cleanId.includes('selfie') || cleanId.includes('سلفی')) {
    resolvedType = 'mirror-selfie';
  } else if (cleanId.includes('mirror') || cleanId.includes('آینه') || cleanId.includes('اینه')) {
    resolvedType = 'mirror';
  } else if (cleanId.includes('camera') || cleanId.includes('vintage') || cleanId.includes('دوربین')) {
    resolvedType = 'vintage-camera';
  } else if (cleanId.includes('darkroom') || cleanId.includes('تاریک') || cleanId.includes('ظهور')) {
    resolvedType = 'darkroom';
  } else if (cleanId.includes('frame') || cleanId.includes('قاب')) {
    resolvedType = 'frame';
  }

  const strokeColor = '#1e1b18';

  switch (resolvedType) {
    case 'frame':
      // 1. Gallery 03: frame (Reference 1)
      // Baroque ornate frame (1.1x scaled) with a completely hollow/empty inner opening
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} overflow-visible`}
          style={style}
        >
          <g transform="translate(16 16) scale(1.1) translate(-16 -16)">
            {/* Top hanger loop */}
            <path
              d="M13.5 4.5 Q16 1.8 18.5 4.5"
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            {/* Baroque ornate frame with empty/hollow inner cutout - 1.09x thicker moulding */}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16 4.6
                 C19.2 4.6 21.8 5.1 23.8 6.2
                 C25.9 5.1 27.5 6.7 27 8.8
                 C26.3 10.4 27.3 12.4 27.3 15.5
                 C27.3 18.6 26.3 20.6 27 22.2
                 C27.5 24.3 25.9 25.9 23.8 24.8
                 C21.8 25.9 19.2 26.4 16 26.4
                 C12.8 26.4 10.2 25.9 8.2 24.8
                 C6.1 25.9 4.5 24.3 5 22.2
                 C5.7 20.6 4.7 18.6 4.7 15.5
                 C4.7 12.4 5.7 10.4 5 8.8
                 C4.5 6.7 6.1 5.1 8.2 6.2
                 C10.2 5.1 12.8 4.6 16 4.6 Z
                 M9.8 8.1 H22.2 C22.8 8.1 23.3 8.6 23.3 9.2 V21.8 C23.3 22.4 22.8 22.9 22.2 22.9 H9.8 C9.2 22.9 8.7 22.4 8.7 21.8 V9.2 C8.7 8.6 9.2 8.1 9.8 8.1 Z"
              fill={isSelected ? '#ef4444' : '#fbbf24'}
              stroke={strokeColor}
              strokeWidth="0.98"
              strokeLinejoin="round"
              className="transition-colors"
            />
          </g>
        </svg>
      );

    case 'shadow-silhouette':
      // 2. Gallery 03: shadow-silhouette (Reference 2)
      // Single human profile shadow silhouette (pure black/charcoal silhouette)
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} overflow-visible`}
          style={style}
        >
          {/* Profile face shadow silhouette */}
          <path
            d="M17 4
               C13.7 4 11.6 6.3 11 8.3
               C10.4 10.3 10 11.1 7.4 13.4
               C8.4 14.2 9.4 14.4 9.6 14.9
               C8.9 15.7 8.8 16.3 9 16.8
               C9.4 17.3 9.8 17.5 9.9 17.9
               C9.2 18.7 8.4 19.5 8.6 20.4
               C8.9 21.4 10.7 22.4 12.4 23
               L13.2 28.3
               H20.2
               C21.4 25.6 23.4 22.6 24.4 19
               C25.4 15.4 25 10.4 23 7
               C21.4 4.6 19.4 4 17 4 Z"
            fill={isSelected ? '#ef4444' : '#1e1b18'}
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinejoin="round"
            className="transition-colors"
          />
        </svg>
      );

    case 'mirror':
      // 3. Gallery 04: mirror (Reference 3)
      // Standing floor mirror with sky blue reflective glass and light glints
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} overflow-visible`}
          style={style}
        >
          {/* Main mirror wooden frame */}
          <rect
            x="6.5"
            y="3"
            width="19"
            height="26"
            rx="3.5"
            fill={isSelected ? '#ef4444' : '#f59e0b'}
            stroke={strokeColor}
            strokeWidth="0.9"
            strokeLinejoin="round"
            className="transition-colors"
          />
          {/* Frame top rim shine */}
          <path
            d="M9.5 4.8 H22.5"
            stroke="#fef08a"
            strokeWidth="0.6"
            strokeLinecap="round"
          />
          {/* Inner reflective mirror glass */}
          <rect
            x="9"
            y="5.5"
            width="14"
            height="21"
            rx="2"
            fill="#bae6fd"
            stroke={strokeColor}
            strokeWidth="0.65"
          />
          {/* Diagonal reflective light glare streaks */}
          <line
            x1="11.5"
            y1="9"
            x2="19"
            y2="16.5"
            stroke="#ffffff"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="16.5"
            x2="19"
            y2="23.5"
            stroke="#ffffff"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'vintage-camera':
      // 4. Gallery 05: vintage-camera (Reference 4)
      // Vintage camera with top carrying handle, viewfinder, lens hood, mounted on 3-legged tripod
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} overflow-visible`}
          style={style}
        >
          {/* Top carrying handle */}
          <path
            d="M11.5 3.5 H18.5"
            stroke={strokeColor}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <line x1="13" y1="3.5" x2="13" y2="6" stroke={strokeColor} strokeWidth="0.8" />
          <line x1="17" y1="3.5" x2="17" y2="6" stroke={strokeColor} strokeWidth="0.8" />
          {/* Top reel / dial accent */}
          <circle cx="21" cy="4.5" r="1.4" fill="#fbbf24" stroke={strokeColor} strokeWidth="0.65" />
          {/* Camera body */}
          <rect
            x="7"
            y="6"
            width="14"
            height="10"
            rx="2"
            fill={isSelected ? '#ef4444' : '#0d9488'}
            stroke={strokeColor}
            strokeWidth="0.9"
            strokeLinejoin="round"
            className="transition-colors"
          />
          {/* Viewfinder window */}
          <rect
            x="9.5"
            y="8.5"
            width="4.5"
            height="4.5"
            rx="0.8"
            fill="#fef3c7"
            stroke={strokeColor}
            strokeWidth="0.6"
          />
          <circle cx="11.75" cy="10.75" r="1.2" fill="#0d9488" />
          {/* Outward flaring lens hood on right */}
          <path
            d="M21 8.5 L27 6.5 V15.5 L21 13.5 Z"
            fill="#1e1b18"
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Lens glass reflection */}
          <ellipse
            cx="27"
            cy="11"
            rx="1"
            ry="4.5"
            fill="#38bdf8"
            stroke={strokeColor}
            strokeWidth="0.6"
          />
          {/* Tripod mount head */}
          <rect
            x="12"
            y="16"
            width="4"
            height="2.2"
            rx="0.5"
            fill="#fbbf24"
            stroke={strokeColor}
            strokeWidth="0.75"
          />
          {/* 3 Tripod legs */}
          <line x1="13" y1="18.2" x2="5.5" y2="29.5" stroke={strokeColor} strokeWidth="1.0" strokeLinecap="round" />
          <line x1="14" y1="18.2" x2="14" y2="29.5" stroke={strokeColor} strokeWidth="1.0" strokeLinecap="round" />
          <line x1="15" y1="18.2" x2="22.5" y2="29.5" stroke={strokeColor} strokeWidth="1.0" strokeLinecap="round" />
          {/* Tripod stabilizer strut bar */}
          <line x1="9.5" y1="24.5" x2="18.5" y2="24.5" stroke={strokeColor} strokeWidth="0.75" strokeLinecap="round" />
        </svg>
      );

    case 'mirror-selfie':
      // 5. Gallery 05: mirror-selfie (Reference 5)
      // Clean standalone vertical smartphone with portrait/selfie avatar on screen
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} overflow-visible`}
          style={style}
        >
          {/* Smartphone body */}
          <rect
            x="8.5"
            y="4"
            width="15"
            height="24"
            rx="3"
            fill={isSelected ? '#ef4444' : '#6366f1'}
            stroke={strokeColor}
            strokeWidth="0.9"
            strokeLinejoin="round"
            className="transition-colors"
          />
          {/* Smartphone top speaker */}
          <line x1="14.5" y1="5.8" x2="17.5" y2="5.8" stroke="#ffffff" strokeWidth="0.6" strokeLinecap="round" />

          {/* Smartphone screen */}
          <rect
            x="10"
            y="7.5"
            width="12"
            height="17.2"
            rx="1.6"
            fill="#e0f2fe"
            stroke={strokeColor}
            strokeWidth="0.65"
          />
          {/* Screen portrait avatar: head */}
          <circle cx="16" cy="12.6" r="2.5" fill="#1e1b18" />
          {/* Screen portrait avatar: shoulders */}
          <path
            d="M12.2 20.5 C12.2 17.5 13.8 16.5 16 16.5 C18.2 16.5 19.8 17.5 19.8 20.5 Z"
            fill="#1e1b18"
          />
        </svg>
      );

    case 'darkroom':
      // 6. Gallery 08: darkroom (Reference 6)
      // 35mm film canister with stepped-down film leader and sprocket perforations
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} overflow-visible`}
          style={style}
        >
          {/* Top spool hub nub */}
          <rect x="6.5" y="3" width="4" height="2.5" rx="0.6" fill={strokeColor} />
          {/* Top canister rim cap */}
          <rect
            x="4.5"
            y="5.5"
            width="8"
            height="3"
            rx="1"
            fill={isSelected ? '#ef4444' : '#ea580c'}
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Canister cylinder body */}
          <rect
            x="5"
            y="8.5"
            width="7"
            height="15"
            rx="0.6"
            fill={isSelected ? '#fca5a5' : '#fef3c7'}
            stroke={strokeColor}
            strokeWidth="0.9"
            strokeLinejoin="round"
            className="transition-colors"
          />
          {/* Canister gold highlight stripe */}
          <line x1="8" y1="10" x2="8" y2="22" stroke="#f59e0b" strokeWidth="0.7" strokeLinecap="round" />
          {/* Bottom canister rim cap */}
          <rect
            x="4.5"
            y="23.5"
            width="8"
            height="3"
            rx="1"
            fill={isSelected ? '#ef4444' : '#ea580c'}
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Bottom spool hub nub */}
          <rect x="6.5" y="26.5" width="4" height="2.5" rx="0.6" fill={strokeColor} />
          {/* Extended film leader strip with 35mm step-down tongue curve */}
          <path
            d="M12 9 H16 C18 9 19.5 10.5 20.2 12.5 C20.8 14.5 22 15 24 15 H29 C29.6 15 30 15.4 30 16 V22.5 C30 23.1 29.6 23.5 29 23.5 H12 Z"
            fill="#831843"
            stroke={strokeColor}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          {/* Bottom sprocket perforations */}
          <rect x="13.5" y="19.5" width="2" height="2.2" rx="0.4" fill="#ffffff" stroke={strokeColor} strokeWidth="0.4" />
          <rect x="17.5" y="19.5" width="2" height="2.2" rx="0.4" fill="#ffffff" stroke={strokeColor} strokeWidth="0.4" />
          <rect x="21.5" y="19.5" width="2" height="2.2" rx="0.4" fill="#ffffff" stroke={strokeColor} strokeWidth="0.4" />
          <rect x="25.5" y="19.5" width="2" height="2.2" rx="0.4" fill="#ffffff" stroke={strokeColor} strokeWidth="0.4" />
          {/* Top sprocket perforation before step-down */}
          <rect x="13.5" y="10.8" width="2" height="2.2" rx="0.4" fill="#ffffff" stroke={strokeColor} strokeWidth="0.4" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 32 32"
          className={`${className} overflow-visible`}
          style={style}
        >
          <path
            d="M16 3 L19.5 12.5 L29 16 L19.5 19.5 L16 29 L12.5 19.5 L3 16 L12.5 12.5 Z"
            fill={isSelected ? '#ef4444' : '#fbbf24'}
            stroke={strokeColor}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};

