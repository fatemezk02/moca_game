import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery08MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 08.
 * Tight coordinate space around actual visible artwork (viewBox="0 0 501.5 642.18").
 */
export const Gallery08MapSvg = forwardRef<SVGSVGElement, Gallery08MapSvgProps>(
  ({ className = '', children, mapMode, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 501.5 642.18"
        style={{ enableBackground: 'new 0 0 501.5 642.18' }}
        xmlSpace="preserve"
        className={className}
        {...props}
      >
        <defs>
          <style>
              {`
                .g08-cls-1{fill:url(#linear-gradient);}
                .g08-cls-2{fill:#f8efe8;}
                .g08-cls-3{fill:url(#linear-gradient-2);}
                .g08-cls-4,.g08-cls-5{fill:none;stroke:#2a2623;stroke-width:11px;}
                .g08-cls-4,.g08-cls-5,.g08-cls-6{stroke-miterlimit:10;}
                .g08-cls-5{opacity:0.2;}
                .g08-cls-6{fill:#998f56;stroke:#353329;}
                .g08-cls-7{fill:#2a2623;}
              `}
            </style>
            <linearGradient
              id="linear-gradient"
              x1="227.28"
              y1="687.12"
              x2="227.28"
              y2="509.46"
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
              x1="445.16"
              y1="176.64"
              x2="445.16"
              y2="17.25"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#f8efe8" />
              <stop offset="0.11" stopColor="#f9f0ea" stopOpacity="0.92" />
              <stop offset="0.35" stopColor="#faf4ef" stopOpacity="0.7" />
              <stop offset="0.68" stopColor="#fdf9f7" stopOpacity="0.36" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <rect className="g08-cls-1" x="180.22" y="483.91" width="94.11" height="158.27" />
              <rect className="g08-cls-2" x="403.38" y="176.64" width="86.62" height="90.77" />
              <rect className="g08-cls-3" x="400.32" y="34.65" width="89.68" height="141.99" />
              <rect className="g08-cls-2" x="394.31" y="176.64" width="35.79" height="94.77" />
              <path
                className="g08-cls-2"
                d="M394.31,73.21V271.4H279.83V490.47H73.21v-212S5.5,281.82,5.5,226.37s67.56-52.09,67.71-52.09V73.21H174.72S171.35,5.5,226.81,5.5s52.09,67.56,52.08,67.71Z"
              />
              <path
                className="g08-cls-4"
                d="M279.83,173.24H394.31v-100H278.89c0-.15,3.33-67.71-52.08-67.71s-52.09,67.67-52.09,67.71H73.21V174.28c-.15,0-67.71-3.32-67.71,52.09s67.71,52.09,67.71,52.09v212H174.72v31"
              />
              <line className="g08-cls-4" x1="174.72" y1="73.21" x2="174.72" y2="173.24" />
              <line className="g08-cls-4" x1="174.72" y1="271.4" x2="174.72" y2="413.87" />
              <line className="g08-cls-4" x1="73.21" y1="381.66" x2="174.72" y2="381.66" />
              <line className="g08-cls-4" x1="174.72" y1="490.47" x2="174.72" y2="462.97" />
              <polyline className="g08-cls-5" points="279.83 490.47 394.31 490.47 394.31 590.81" />
              <polyline className="g08-cls-4" points="394.31 271.4 279.83 271.4 279.83 490.47 279.83 521.49" />
              <line className="g08-cls-5" x1="394.31" y1="424.53" x2="394.31" y2="271.4" />
              <polyline className="g08-cls-4" points="394.31 271.4 495.5 271.4 495.5 242.28" />
              <rect className="g08-cls-6" x="490" y="204.31" width="11" height="24.46" rx="3" />
              <rect className="g08-cls-6" x="490" y="140.12" width="11" height="24.46" rx="3" />
              <rect className="g08-cls-7" x="490" y="176.64" width="11" height="15.62" rx="3" />
              <rect className="g08-cls-6" x="274.33" y="533.93" width="11" height="24.46" rx="3" />
              <rect className="g08-cls-7" x="274.33" y="570.45" width="11" height="15.62" rx="3" />
              <rect className="g08-cls-6" x="169.22" y="533.93" width="11" height="24.46" rx="3" />
              <rect className="g08-cls-7" x="169.22" y="570.45" width="11" height="15.62" rx="3" />
            </g>
          </g>
        {children}
      </svg>
    );
  }
);

Gallery08MapSvg.displayName = 'Gallery08MapSvg';

