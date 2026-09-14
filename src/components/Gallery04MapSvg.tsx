import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery04MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 04 — Recording Our Endurance.
 * Tight coordinate space around actual visible artwork (viewBox="0 0 498.55 851.79").
 */
export const Gallery04MapSvg = forwardRef<SVGSVGElement, Gallery04MapSvgProps>(
  ({ className = '', children, mapMode, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 498.55 851.79"
        style={{ enableBackground: 'new 0 0 498.55 851.79' }}
        xmlSpace="preserve"
        className={className}
        {...props}
      >
        <defs>
            <style>
              {`
                .cls-1{fill:#f8efe8;}
                .cls-2{fill:url(#linear-gradient);}
                .cls-3{fill:url(#linear-gradient-2);}
                .cls-4{fill:#998f56;stroke:#353329;stroke-miterlimit:10;}
                .cls-5{fill:#2a2623;}
              `}
            </style>
            <linearGradient
              id="linear-gradient"
              x1="12.28"
              y1="639.17"
              x2="87.16"
              y2="639.17"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.1" stopColor="#fefcfb" stopOpacity="0.16" />
              <stop offset="0.29" stopColor="#fcf8f6" stopOpacity="0.41" />
              <stop offset="0.47" stopColor="#fbf5f1" stopOpacity="0.62" />
              <stop offset="0.63" stopColor="#faf2ed" stopOpacity="0.78" />
              <stop offset="0.78" stopColor="#f9f1ea" stopOpacity="0.9" />
              <stop offset="0.91" stopColor="#f8efe9" stopOpacity="0.97" />
              <stop offset="1" stopColor="#f8efe8" />
            </linearGradient>
            <linearGradient
              id="linear-gradient-2"
              x1="394.59"
              y1="639.17"
              x2="469.48"
              y2="639.17"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#f8efe8" />
              <stop offset="0.09" stopColor="#f8efe9" stopOpacity="0.97" />
              <stop offset="0.22" stopColor="#f9f1ea" stopOpacity="0.9" />
              <stop offset="0.37" stopColor="#faf2ed" stopOpacity="0.78" />
              <stop offset="0.53" stopColor="#fbf5f1" stopOpacity="0.62" />
              <stop offset="0.71" stopColor="#fcf8f6" stopOpacity="0.41" />
              <stop offset="0.9" stopColor="#fefcfb" stopOpacity="0.16" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <path
                className="cls-1"
                d="M394.59,67.1V785.63H297.87c-.07,4.23-2.15,60.66-57.51,60.66s-57.43-56.41-57.51-60.66H87.16V67.1h67.63v-.69h28.06s0-60.91,57.51-60.91,57.52,60.91,57.52,60.91h29v.69Z"
              />
              <rect className="cls-2" x="12.28" y="597.01" width="74.89" height="84.31" />
              <rect className="cls-3" x="394.59" y="597.01" width="74.89" height="84.31" />
              <rect className="cls-4" x="27.68" y="681.32" width="24.46" height="11" rx="3" />
              <rect className="cls-5" y="681.32" width="15.62" height="11" rx="3" />
              <rect className="cls-4" x="27.68" y="586.01" width="24.46" height="11" rx="3" />
              <rect className="cls-5" y="586.01" width="15.62" height="11" rx="3" />
              <path
                className="cls-5"
                d="M431.72,586.35H399.83l.26-519.25V63.91a3,3,0,0,0-3-3H305.72a3,3,0,0,1-3-2.61,84.41,84.41,0,0,0-7.08-24.7C288.42,18.27,273,0,240.36,0s-48.06,18.27-55.3,33.6A85,85,0,0,0,178,58.3a3,3,0,0,1-3,2.61H84.66a3,3,0,0,0-3,3V586.35H67a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H173.3a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3H95.66a3,3,0,0,1-3-3V74.91a3,3,0,0,1,3-3h89.69a3,3,0,0,0,3-3v-2.5A74.21,74.21,0,0,1,195,38.3C203.56,20.18,218.82,11,240.36,11c51.24,0,52,53.15,52,55.41v2.5a3,3,0,0,0,3,3h90.7a3,3,0,0,1,3,3l-.27,508.43a3,3,0,0,1-3,3H308.45a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H431.72a3,3,0,0,0,3-3v-5A3,3,0,0,0,431.72,586.35Z"
              />
              <path
                className="cls-5"
                d="M431.72,681.39H308.45a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H386a3,3,0,0,1,3,3l.12,81.49a3,3,0,0,1-3,3h-88.2l-2.49-.1a3,3,0,0,0-3.11,3.12l.1,2.43v.21A73.81,73.81,0,0,1,285,815.05c-8.7,17.08-23.7,25.74-44.59,25.74-49.4,0-51.89-49.32-52-55.22v-2.69a3,3,0,0,0-3-3H95.66a3,3,0,0,1-3-3V695.39a3,3,0,0,1,3-3H173.3a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3H67a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H81.66v95.49a3,3,0,0,0,3,3H175a3,3,0,0,1,3,2.6,83.34,83.34,0,0,0,8,26.57c7.37,14.48,22.79,31.74,54.38,31.74s47-17.27,54.39-31.75a83.25,83.25,0,0,0,8-26.56,3,3,0,0,1,3-2.6H397.1a3,3,0,0,0,3-3L400,692.39h31.76a3,3,0,0,0,3-3v-5A3,3,0,0,0,431.72,681.39Z"
              />
              <rect className="cls-4" x="446.41" y="681.32" width="24.46" height="11" rx="3" />
              <rect className="cls-5" x="482.93" y="681.32" width="15.62" height="11" rx="3" />
              <rect className="cls-4" x="446.41" y="586.01" width="24.46" height="11" rx="3" />
              <rect className="cls-5" x="482.93" y="586.01" width="15.62" height="11" rx="3" />
            </g>
          </g>
        {children}
      </svg>
    );
  }
);

Gallery04MapSvg.displayName = 'Gallery04MapSvg';

