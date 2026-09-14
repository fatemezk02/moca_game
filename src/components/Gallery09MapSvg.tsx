import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery09MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 09.
 * Tight coordinate space around actual visible artwork (viewBox="0 0 453.09 846.45").
 */
export const Gallery09MapSvg = forwardRef<SVGSVGElement, Gallery09MapSvgProps>(
  ({ className = '', children, mapMode, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        id="Layer_1"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 453.09 846.45"
        style={{ enableBackground: 'new 0 0 453.09 846.45' }}
        xmlSpace="preserve"
        className={className}
        {...props}
      >
        {/* Nested SVG positioned at 0, 0 preserving exact updated asset geometry and viewBox (453.09 x 846.45) */}
        <svg
          x="0"
          y="0"
          width="453.09"
          height="846.45"
          viewBox="0 0 453.09 846.45"
          overflow="visible"
        >
          <defs>
            <style>
              {`
                .cls-1{fill:url(#linear-gradient);}
                .cls-2{fill:url(#linear-gradient-2);}
                .cls-3{fill:#f8efe8;}
                .cls-4{fill:none;}
                .cls-5{fill:#2a2623;}
                .cls-6{fill:#998f56;stroke:#353329;stroke-miterlimit:10;}
              `}
            </style>
            <linearGradient
              id="linear-gradient"
              x1="26.57"
              y1="267.93"
              x2="106.12"
              y2="267.93"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.32" stopColor="#fdf9f7" stopOpacity="0.36" />
              <stop offset="0.65" stopColor="#faf4ef" stopOpacity="0.7" />
              <stop offset="0.89" stopColor="#f9f0ea" stopOpacity="0.92" />
              <stop offset="1" stopColor="#f8efe8" />
            </linearGradient>
            <linearGradient
              id="linear-gradient-2"
              x1="249.23"
              y1="872.19"
              x2="249.23"
              y2="757.11"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.32" stopColor="#fdf9f7" stopOpacity="0.36" />
              <stop offset="0.65" stopColor="#faf4ef" stopOpacity="0.7" />
              <stop offset="0.89" stopColor="#f9f0ea" stopOpacity="0.92" />
              <stop offset="1" stopColor="#f8efe8" />
            </linearGradient>
          </defs>
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <rect className="cls-1" x="26.57" y="164.72" width="79.55" height="206.43" />
              <rect className="cls-2" x="168.66" y="731.38" width="161.15" height="115.07" />
              <path
                className="cls-3"
                d="M447.59,218.67c0,51.48-57.26,53.79-57.26,53.79V731.38H106.12V62.75h90.23c0-.39,2.68-57.25,54-57.25,51.44,0,53.79,57.18,53.79,57.25h86.23v102S447.59,167.23,447.59,218.67Z"
              />
              <line className="cls-4" x1="352.89" y1="731.38" x2="329.81" y2="731.38" />
              <path
                className="cls-5"
                d="M97.62,365.65H42.48a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H97.62a3,3,0,0,1,3,3V733.88a3,3,0,0,0,3,3h56.54a3,3,0,0,1,3,3v26.64a3,3,0,0,0,3,3h5a3,3,0,0,0,3-3V728.88a3,3,0,0,0-3-3H114.62a3,3,0,0,1-3-3V281a3,3,0,0,1,3-3h78.73a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3H103.62a3,3,0,0,0-3,3v92.69A3,3,0,0,1,97.62,365.65Z"
              />
              <path
                className="cls-5"
                d="M421.41,167.47a85.49,85.49,0,0,0-23.09-7.31,3,3,0,0,1-2.49-3V60.25a3,3,0,0,0-3-3H311.66a3,3,0,0,1-3-2.51,84.34,84.34,0,0,0-7.27-23.06C294.34,17.23,279.72,0,250.31,0c-23.16,0-40.82,10.86-51.07,31.41a85.18,85.18,0,0,0-7.47,23.34,3,3,0,0,1-3,2.5h-85.2a3,3,0,0,0-3,3v96a3,3,0,0,1-3,3H69.34a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3h124a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3H114.62a3,3,0,0,1-3-3v-85a3,3,0,0,1,3-3h84.11a3,3,0,0,0,3-2.86l.11-2.37c.11-2.13,3.08-52,48.47-52,45,0,48.13,48.68,48.29,51.87v2.38a3,3,0,0,0,3,3h80.23a3,3,0,0,1,3,3v85a3,3,0,0,1-3,3h-74a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H390.2c3.28.17,51.89,3.52,51.89,48.45S393.4,266.8,390.2,267H307.81a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3h74a3,3,0,0,1,3,3V722.88a3,3,0,0,1-3,3H327.31a3,3,0,0,0-3,3v37.64a3,3,0,0,0,3,3h5a3,3,0,0,0,3-3V739.88a3,3,0,0,1,3-3h54.52a3,3,0,0,0,3-3V280a3,3,0,0,1,2.5-3,84.92,84.92,0,0,0,23.05-7.24c14.46-7.09,31.71-21.71,31.71-51.14C453.09,195.4,442.13,177.69,421.41,167.47Z"
              />
              <rect className="cls-6" x="0.5" y="159.22" width="24.46" height="11" rx="3" />
              <rect className="cls-5" x="37.02" y="159.22" width="15.62" height="11" rx="3" />
              <rect className="cls-6" x="163.16" y="810.02" width="11" height="24.46" rx="3" />
              <rect className="cls-5" x="163.16" y="782.34" width="11" height="15.62" rx="3" />
              <rect className="cls-6" x="324.31" y="810.02" width="11" height="24.46" rx="3" />
              <rect className="cls-5" x="324.31" y="782.34" width="11" height="15.62" rx="3" />
            </g>
          </g>
        </svg>
        {children}
      </svg>
    );
  }
);

Gallery09MapSvg.displayName = 'Gallery09MapSvg';

