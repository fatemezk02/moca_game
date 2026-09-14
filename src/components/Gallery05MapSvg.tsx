import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery05MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 05.
 * Tight coordinate space around actual visible artwork (viewBox="0 0 682.05 729.06").
 */
export const Gallery05MapSvg = forwardRef<SVGSVGElement, Gallery05MapSvgProps>(
  ({ className = '', children, mapMode, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 682.05 729.06"
        style={{ enableBackground: 'new 0 0 682.05 729.06' }}
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
                .cls-4{fill:url(#linear-gradient-3);}
                .cls-5{opacity:0.2;}
                .cls-6{fill:#2a2623;}
                .cls-7{fill:#998f56;stroke:#353329;stroke-miterlimit:10;}
                .cls-8{opacity:0.63;}
              `}
            </style>
            <linearGradient
              id="linear-gradient"
              x1="176.03"
              y1="511.81"
              x2="241.52"
              y2="446.31"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.11" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.21" stopColor="#fff" stopOpacity="0.02" />
              <stop offset="0.32" stopColor="#fefefd" stopOpacity="0.07" />
              <stop offset="0.44" stopColor="#fefcfb" stopOpacity="0.16" />
              <stop offset="0.56" stopColor="#fdfaf8" stopOpacity="0.29" />
              <stop offset="0.69" stopColor="#fcf8f5" stopOpacity="0.45" />
              <stop offset="0.81" stopColor="#faf5f0" stopOpacity="0.65" />
              <stop offset="0.94" stopColor="#f9f1eb" stopOpacity="0.88" />
              <stop offset="1" stopColor="#f8efe8" />
            </linearGradient>
            <linearGradient
              id="linear-gradient-2"
              x1="454.86"
              y1="728.34"
              x2="454.86"
              y2="647.41"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.32" stopColor="#fdf9f7" stopOpacity="0.36" />
              <stop offset="0.65" stopColor="#faf4ef" stopOpacity="0.7" />
              <stop offset="0.89" stopColor="#f9f0ea" stopOpacity="0.92" />
              <stop offset="1" stopColor="#f8efe8" />
            </linearGradient>
            <linearGradient
              id="linear-gradient-3"
              x1="27.94"
              y1="218.42"
              x2="92.28"
              y2="218.42"
              xlinkHref="#linear-gradient-2"
              href="#linear-gradient-2"
            />
          </defs>
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <path
                className="cls-1"
                d="M676.55,430.1c0,46.09-46.75,51.55-62.56,52.08H506.86V648.83H403.48V482.18H275.37l-70.43-69.71V265H92.28V73.21H193.83S190.45,5.5,245.91,5.5,298,73.21,298,73.21H403.52S400.14,5.5,455.61,5.5c38.52,0,48.66,32.65,51.25,52.61v15.1h102v99h4.87c15.53.48,62.84,5.72,62.84,52.09,0,55.47-67.71,52.09-67.71,52.09V378S676.55,374.64,676.55,430.1Z"
              />
              <polygon
                className="cls-2"
                points="275.57 482.23 275.57 508.01 178.8 508.34 179.57 412.52 205.14 412.52 275.57 482.23"
              />
              <rect className="cls-3" x="408.65" y="647.41" width="92.42" height="80.93" />
              <rect className="cls-4" x="27.94" y="177.57" width="64.34" height="81.7" />
              <g className="cls-5">
                <path
                  className="cls-6"
                  d="M611.34,654.33H506.86v-11h93.48a3,3,0,0,0,3-3V482.19h11V651.33A3,3,0,0,1,611.34,654.33Z"
                />
              </g>
              <path
                className="cls-6"
                d="M70.48,270.5h126a3,3,0,0,1,3,3V398.16a3,3,0,0,1-3,3H181.82a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3h25.62a3,3,0,0,0,3-3V262.5a3,3,0,0,0-3-3h-137a3,3,0,0,0-3,3v5A3,3,0,0,0,70.48,270.5Z"
              />
              <path
                className="cls-6"
                d="M278,508.32h5a3,3,0,0,0,3-3V490.68a3,3,0,0,1,3-3H395a3,3,0,0,1,3,3V661.51a3,3,0,0,0,3,3h5a3,3,0,0,0,3-3V479.68a3,3,0,0,0-3-3H278a3,3,0,0,0-3,3v25.64A3,3,0,0,0,278,508.32Z"
              />
              <path
                className="cls-6"
                d="M614.34,369.66V284.78a3,3,0,0,1,2.82-3c12.09-.74,34.25-4.13,49.37-18.51,10.3-9.8,15.52-22.9,15.52-38.94,0-21.76-9.88-38.41-28.56-48.13-12.92-6.73-27.28-8.74-36.33-9.3a3,3,0,0,1-2.82-3V70.71a3,3,0,0,0-3-3H516a3,3,0,0,1-3-2.82c-.13-2.2-.36-4.73-.72-7.49-1.3-10-4.64-24.49-13.14-36.29C489.09,7.1,474.43,0,455.61,0c-16,0-29.15,5.22-38.94,15.52-14.38,15.11-17.78,37.28-18.51,49.37a3,3,0,0,1-3,2.82H306.35a3,3,0,0,1-3-2.82c-.74-12.09-4.13-34.25-18.51-49.37C275.05,5.22,262,0,245.91,0S216.81,5.21,207,15.47c-14.37,15.07-17.79,37.31-18.54,49.42a3,3,0,0,1-3,2.82H89.78a3,3,0,0,0-3,3v93a3,3,0,0,1-3,3H70.48a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H201.94a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3H100.78a3,3,0,0,1-3-3v-82a3,3,0,0,1,3-3h95.67a3,3,0,0,0,3-3.14L199.32,73c0-.32-1.32-32.09,15.66-49.89,7.63-8,18-12.06,30.93-12.06s23.3,4.06,30.94,12.07c17,17.8,15.67,49.55,15.66,49.87v99.27l0,2.53a3,3,0,0,0,3,3H405.64a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3H306.5a3,3,0,0,1-3-3v-82a3,3,0,0,1,3-3h99.65a3,3,0,0,0,3-3.15L409,72.94c0-.32-1.39-32,15.63-49.84,7.64-8,18.06-12.1,31-12.1,32.72,0,43,26,45.8,47.82a89.46,89.46,0,0,1,.79,14.11v96.28a3,3,0,0,0,3,3h5a3,3,0,0,0,3-3V81.71a3,3,0,0,1,3-3h84.15a3,3,0,0,1,3,3v93a3,3,0,0,0,3,3h2.75c.18,0,1.82-.07,4.45,0,17.29.53,57.51,6.14,57.51,46.59,0,12.9-4.06,23.3-12.07,30.94-17.8,17-49.56,15.67-49.87,15.66H505.23a3,3,0,0,0-3,3V380a3,3,0,0,0,3,3h5a3,3,0,0,0,3-3V284.93a3,3,0,0,1,3-3h84.11a3,3,0,0,1,3,3v95.7a3,3,0,0,0,3.14,3l2.63-.13c.31,0,32.07-1.31,49.88,15.67,8,7.63,12.06,18,12.06,30.93,0,40.31-40,46-57.25,46.58-2.89.1-4.67,0-4.68,0H505.23a3,3,0,0,0-3,3V661.51a3,3,0,0,0,3,3h5a3,3,0,0,0,3-3V490.69a3,3,0,0,1,3-3h92.49c.56,0,2.54.09,5.45,0,15.93-.54,67.88-6.27,67.88-57.58,0-16-5.22-29.14-15.51-38.93-15.12-14.39-37.29-17.78-49.38-18.52A3,3,0,0,1,614.34,369.66Z"
              />
              <g className="cls-5">
                <path
                  className="cls-6"
                  d="M403.48,654.33H306.69a3,3,0,0,1-3-3v-5a3,3,0,0,1,3-3h96.79Z"
                />
              </g>
              <rect className="cls-7" x="397.98" y="676.93" width="11" height="24.46" rx="3" />
              <rect className="cls-6" x="397.98" y="713.44" width="11" height="15.62" rx="3" />
              <rect className="cls-7" x="502.23" y="676.93" width="11" height="24.46" rx="3" />
              <rect className="cls-6" x="502.23" y="713.44" width="11" height="15.62" rx="3" />
              <rect className="cls-7" x="27.68" y="166.72" width="24.46" height="11" rx="3" />
              <rect className="cls-6" y="166.72" width="15.62" height="11" rx="3" />
              <rect className="cls-7" x="27.68" y="259.5" width="24.46" height="11" rx="3" />
              <rect className="cls-6" y="259.5" width="15.62" height="11" rx="3" />
              <g className="cls-8">
                <rect
                  className="cls-6"
                  x="216.37"
                  y="401.31"
                  width="3"
                  height="36.56"
                  rx="1.5"
                  transform="translate(-232.88 276.95) rotate(-45)"
                />
              </g>
              <g className="cls-8">
                <rect
                  className="cls-6"
                  x="266.04"
                  y="450.98"
                  width="3"
                  height="36.56"
                  rx="1.5"
                  transform="translate(-253.46 326.62) rotate(-45)"
                />
              </g>
            </g>
          </g>
        {children}
      </svg>
    );
  }
);

Gallery05MapSvg.displayName = 'Gallery05MapSvg';

