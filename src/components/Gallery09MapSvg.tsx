import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery09MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 09.
 * Exact SVG specification as provided.
 * viewBox="0 0 762.78 1147.23"
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
        viewBox="0 0 762.78 1147.23"
        className={className}
        {...props}
      >
        <defs>
          <style>
            {`
              .cls-1{fill:url(#linear-gradient-g09);}
              .cls-2{fill:url(#linear-gradient-2-g09);}
              .cls-3{fill:#f8efe8;}
              .cls-4{fill:none;stroke:#2a2623;stroke-width:11px;}
              .cls-4,.cls-5{stroke-miterlimit:10;}
              .cls-5{fill:#998f56;stroke:#353329;}
              .cls-6{fill:#2a2623;}
            `}
          </style>
          <linearGradient
            id="linear-gradient-g09"
            x1="174.15"
            y1="422.67"
            x2="253.7"
            y2="422.67"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.32" stopColor="#fdf9f7" stopOpacity="0.36" />
            <stop offset="0.65" stopColor="#faf4ef" stopOpacity="0.7" />
            <stop offset="0.89" stopColor="#f9f0ea" stopOpacity="0.92" />
            <stop offset="1" stopColor="#f8efe8" />
          </linearGradient>
          <linearGradient
            id="linear-gradient-2-g09"
            x1="396.82"
            y1="1026.93"
            x2="396.82"
            y2="911.85"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.32" stopColor="#fdf9f7" stopOpacity="0.36" />
            <stop offset="0.65" stopColor="#faf4ef" stopOpacity="0.7" />
            <stop offset="0.89" stopColor="#f9f0ea" stopOpacity="0.92" />
            <stop offset="1" stopColor="#f8efe8" />
          </linearGradient>
        </defs>
        <rect className="cls-1" x="174.15" y="319.46" width="79.55" height="206.43" />
        <rect className="cls-2" x="316.24" y="886.12" width="161.15" height="115.07" />
        <path
          className="cls-3"
          d="M595.17,373.41c0,51.48-57.26,53.79-57.26,53.79V886.12H253.7V217.49h90.23c0-.39,2.68-57.25,54-57.25,51.44,0,53.79,57.18,53.79,57.25h86.23v102S595.17,322,595.17,373.41Z"
        />
        <polyline className="cls-4" points="213.93 319.46 253.71 319.46 343.94 319.46" />
        <path
          className="cls-4"
          d="M253.71,319.46v-102h90.23c0-.39,2.68-57.25,54-57.25,51.44,0,53.79,57.18,53.79,57.25h86.23v102"
        />
        <line className="cls-4" x1="253.71" y1="525.89" x2="187.07" y2="525.89" />
        <polyline className="cls-4" points="316.24 924.25 316.24 886.12 253.7 886.12 253.7 427.2 343.93 427.2" />
        <polyline
          className="cls-4"
          points="477.39 924.25 477.39 886.12 537.91 886.12 537.91 476.54 537.91 427.2"
        />
        <path
          className="cls-4"
          d="M452.4,427.2h85.52s57.26-2.31,57.26-53.79-57.22-54-57.26-54H452.4"
        />
        <rect className="cls-5" x="148.09" y="313.96" width="24.46" height="11" rx="3" />
        <rect className="cls-6" x="184.6" y="313.96" width="15.62" height="11" rx="3" />
        <rect className="cls-5" x="310.74" y="964.76" width="11" height="24.46" rx="3" />
        <rect className="cls-6" x="310.74" y="937.08" width="11" height="15.62" rx="3" />
        <rect className="cls-5" x="471.89" y="964.76" width="11" height="24.46" rx="3" />
        <rect className="cls-6" x="471.89" y="937.08" width="11" height="15.62" rx="3" />
        {children}
      </svg>
    );
  }
);

Gallery09MapSvg.displayName = 'Gallery09MapSvg';
