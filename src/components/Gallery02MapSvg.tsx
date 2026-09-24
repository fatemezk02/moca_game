import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

export interface Gallery02MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 02.
 * ViewBox: 0 0 524.2 822.62
 */
export const Gallery02MapSvg = forwardRef<SVGSVGElement, Gallery02MapSvgProps>(
  ({ className = '', children, mapMode, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 524.2 822.62"
        className={className}
        {...props}
      >
        <defs>
          <style>
            {`.g02-cls-1{fill:#f8efe8;}.g02-cls-2{fill:url(#g02-linear-gradient);}.g02-cls-3{fill:url(#g02-linear-gradient-2);}.g02-cls-4{fill:#2a2623;}.g02-cls-5{fill:#998f56;stroke:#353329;stroke-miterlimit:10;}.g02-cls-6{fill:none;}`}
          </style>
          <linearGradient
            id="g02-linear-gradient"
            x1="347.17"
            y1="213.02"
            x2="524.2"
            y2="213.02"
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
          <linearGradient
            id="g02-linear-gradient-2"
            x1="546.12"
            y1="1153.46"
            x2="627.18"
            y2="1153.46"
            gradientTransform="translate(1357.51 195.44) rotate(90)"
            xlinkHref="#g02-linear-gradient"
            href="#g02-linear-gradient"
          />
        </defs>
        <g id="Layer_2" data-name="Layer 2">
          <g id="Layer_1-2" data-name="Layer 1">
            <path
              className="g02-cls-1"
              d="M263.43,60V53.28a3,3,0,0,1-1.32-2.09,59.27,59.27,0,0,0-117.44,0,3,3,0,0,1-3,2.58H128.62V60H56.44v74.42h-5.5v20a3,3,0,0,1-2.57,3,56.43,56.43,0,0,0,0,111.71,3,3,0,0,1,2.57,3v55.41h5.5V747.21H355.83V60Z"
            />
            <polyline
              className="g02-cls-2"
              points="347.18 264.74 524.2 264.74 524.2 161.31 347.18 161.31"
            />
            <polyline
              className="g02-cls-3"
              points="115.57 741.55 115.57 822.62 292.53 822.62 292.53 741.55"
            />
            <path
              className="g02-cls-4"
              d="M393.29,156.81H358.83a3,3,0,0,1-3-3v-97a3,3,0,0,0-3-3H265.07a2.9,2.9,0,0,1-1.64-.49,3,3,0,0,1-1.32-2.09,59.27,59.27,0,0,0-117.44,0,3,3,0,0,1-3,2.58H53.94a3,3,0,0,0-3,3v97.66a3,3,0,0,1-2.57,3,56.43,56.43,0,0,0,0,111.71,3,3,0,0,1,2.57,3v480.4a3,3,0,0,0,3,3h53.14a3,3,0,0,1,3,3c0,11.27,0,31.36,0,45.07a3,3,0,0,0,3,3h5a3,3,0,0,0,3-3V747.46a1.06,1.06,0,0,0,0-.25,3,3,0,0,0-3-2.75H64.94a3,3,0,0,1-3-3V272.74a3,3,0,0,1,3-3h89a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3h-38a3,3,0,0,1-3-3V170.81a3,3,0,0,1,3-3h38a3,3,0,0,0,3-3v-5a3,3,0,0,0-3-3h-89a3,3,0,0,1-3-3v-86a3,3,0,0,1,3-3h87.18a3,3,0,0,0,3-3V60c0-26.41,20.92-48.52,47.34-49a48.33,48.33,0,0,1,49.2,48.26v2.5a3,3,0,0,0,3,3h87.17a3,3,0,0,1,3,3v86a3,3,0,0,1-3,3H259.94a3,3,0,0,0-3,3v5a3,3,0,0,0,3,3H393.29a3,3,0,0,0,3-3v-5A3,3,0,0,0,393.29,156.81ZM101.87,255.74a3,3,0,0,1-3,3H89.78a56.94,56.94,0,0,0,12.09-12.07Zm-3-87.93a3,3,0,0,1,3,3v9a57,57,0,0,0-12-12Zm3,45.43a45.49,45.49,0,0,1-44.42,45.43h-1a45.44,45.44,0,1,1,0-90.87h1A45.48,45.48,0,0,1,101.87,213.24Z"
            />
            <path
              className="g02-cls-4"
              d="M396.29,261.68v5a3,3,0,0,1-3,3H358.83a3,3,0,0,0-3,3V752.46a3,3,0,0,1-3,3H300.94a3,3,0,0,0-3,3v45.06a3,3,0,0,1-3,3h-5a3,3,0,0,1-3-3V747.46a3,3,0,0,1,3-3h51.89a3,3,0,0,0,3-3V272.68a3,3,0,0,0-3-3H260a3,3,0,0,1-3-3v-5a3,3,0,0,1,3-3H393.29A3,3,0,0,1,396.29,261.68Z"
            />
            <rect
              className="g02-cls-4"
              x="408.01"
              y="156.81"
              width="15.62"
              height="11"
              rx="3"
            />
            <rect
              className="g02-cls-5"
              x="435.69"
              y="156.81"
              width="24.46"
              height="11"
              rx="3"
            />
            <rect
              className="g02-cls-4"
              x="472.21"
              y="156.81"
              width="15.62"
              height="11"
              rx="3"
            />
            <rect
              className="g02-cls-4"
              x="408.01"
              y="258.68"
              width="15.62"
              height="11"
              rx="3"
            />
            <rect
              className="g02-cls-5"
              x="435.69"
              y="258.68"
              width="24.46"
              height="11"
              rx="3"
            />
            <rect
              className="g02-cls-4"
              x="472.21"
              y="258.68"
              width="15.62"
              height="11"
              rx="3"
            />
            <line
              className="g02-cls-6"
              x1="141.77"
              y1="764.54"
              x2="141.77"
              y2="761.64"
            />
          </g>
        </g>
        {children}
      </svg>
    );
  }
);

Gallery02MapSvg.displayName = 'Gallery02MapSvg';
