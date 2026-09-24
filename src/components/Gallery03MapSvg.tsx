import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery03MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 03 — Modern Hall.
 * Tight coordinate space around actual visible artwork (viewBox="0 0 561.28 851.79").
 */
export const Gallery03MapSvg = forwardRef<SVGSVGElement, Gallery03MapSvgProps>(
  ({ className = '', children, mapMode, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 561.28 851.79"
        style={{ enableBackground: 'new 0 0 561.28 851.79' }}
        xmlSpace="preserve"
        className={className}
        {...props}
      >
        <defs>
            <style>
              {`
                .g03-cls-1{fill:#f8efe8;}
                .g03-cls-2{fill:url(#g03-linear-gradient);}
                .g03-cls-3{fill:url(#g03-linear-gradient-2);}
                .g03-cls-4{fill:#2a2623;}
                .g03-cls-5{fill:#998f56;stroke:#353329;stroke-miterlimit:10;}
              `}
            </style>
            <linearGradient
              id="g03-linear-gradient"
              x1="445.12"
              y1="577.41"
              x2="445.12"
              y2="178.75"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#f8efe8" />
              <stop offset="0.11" stopColor="#f9f0ea" stopOpacity="0.92" />
              <stop offset="0.35" stopColor="#faf4ef" stopOpacity="0.7" />
              <stop offset="0.68" stopColor="#fdf9f7" stopOpacity="0.36" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="g03-linear-gradient-2"
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
          </defs>
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <path
                className="g03-cls-1"
                d="M488.05,571.89H394.59V67.1H326.88v-.69h-29s0-60.91-57.52-60.91-57.51,60.91-57.51,60.91H154.79v.69H87.16V785.63h95.69c.08,4.25,2.17,60.66,57.51,60.66s57.44-56.43,57.51-60.66h96.72V686.89h92.46s60.91,0,60.91-57.51C548,576.22,495.92,572.19,488.05,571.89Z"
              />
              <rect className="g03-cls-2" x="400.14" y="178.75" width="89.96" height="398.66" />
              <rect className="g03-cls-3" x="12.28" y="597.01" width="74.89" height="84.31" />
              <path
                className="g03-cls-4"
                d="M173.3,586.35H95.66a3,3,0,0,1-3-3V74.91a3,3,0,0,1,3-3h89.69a3,3,0,0,0,3-3v-2.5A74.21,74.21,0,0,1,195,38.3C203.57,20.19,218.82,11,240.36,11c51.24,0,52,53.16,52,55.41v2.5a3,3,0,0,0,3,3h90.7a3,3,0,0,1,3,3l-.5,351,.23,157.45a3,3,0,0,1-3,3H308.45a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3h88.38a3,3,0,0,0,3-3l-.25-168.45.35-241.65h39.41a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3H403a3,3,0,0,1-3-3l.14-103.15V63.91a3,3,0,0,0-3-3H305.72a3,3,0,0,1-3-2.61,84.59,84.59,0,0,0-7.08-24.69C288.43,18.28,273,0,240.36,0s-48.05,18.28-55.29,33.61A84.28,84.28,0,0,0,178,58.3a3,3,0,0,1-3,2.61H84.66a3,3,0,0,0-3,3V586.35H67a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H173.3a3,3,0,0,0,3-3v-5A3,3,0,0,0,173.3,586.35Z"
              />
              <path
                className="g03-cls-4"
                d="M493.55,564.2v-281h.66a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3h-8.66a3,3,0,0,0-3,3V574.3a3,3,0,0,0,2.89,3l2.4.1c9.12.34,54.62,4.49,54.62,52,0,51.23-53.15,52-55.41,52H282.47a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H386a3,3,0,0,1,3,3l.12,81.49a3,3,0,0,1-3,3h-88.2l-2.48-.09a3,3,0,0,0-3.12,3.11l.1,2.43v.21A73.44,73.44,0,0,1,285,815.05c-8.69,17.08-23.69,25.74-44.59,25.74-49.39,0-51.89-49.32-52-55.21v-2.7a3,3,0,0,0-3-3H95.66a3,3,0,0,1-3-3V695.39a3,3,0,0,1,3-3H199.27a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3H67a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H81.66v95.49a3,3,0,0,0,3,3H175a3,3,0,0,1,3,2.6,83.6,83.6,0,0,0,8,26.57c7.38,14.48,22.79,31.74,54.38,31.74s47-17.27,54.39-31.75a82.92,82.92,0,0,0,8-26.56,3,3,0,0,1,3-2.6H397.1a3,3,0,0,0,3-3L400,692.39h87.09a84.83,84.83,0,0,0,32.8-7.72c15.34-7.23,33.61-22.7,33.61-55.29,0-48.36-39.59-59.6-57.36-62.22A3,3,0,0,1,493.55,564.2Z"
              />
              <rect className="g03-cls-4" x="454.4" y="173.25" width="15.62" height="11" rx="3" />
              <rect className="g03-cls-5" x="482.08" y="173.25" width="24.46" height="11" rx="3" />
              <rect className="g03-cls-4" x="518.6" y="173.25" width="15.62" height="11" rx="3" />
              <rect className="g03-cls-5" x="509.15" y="272.16" width="24.46" height="11" rx="3" />
              <rect className="g03-cls-4" x="545.66" y="272.16" width="15.62" height="11" rx="3" />
              <rect className="g03-cls-5" x="27.68" y="681.32" width="24.46" height="11" rx="3" />
              <rect className="g03-cls-4" y="681.32" width="15.62" height="11" rx="3" />
              <rect className="g03-cls-5" x="27.68" y="586.01" width="24.46" height="11" rx="3" />
              <rect className="g03-cls-4" y="586.01" width="15.62" height="11" rx="3" />
            </g>
          </g>
        {children}
      </svg>
    );
  }
);

Gallery03MapSvg.displayName = 'Gallery03MapSvg';

