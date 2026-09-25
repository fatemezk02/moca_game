import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery06MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 06.
 * Tight coordinate space around actual visible artwork (viewBox="0 0 486.92 793.01").
 */
export const Gallery06MapSvg = forwardRef<SVGSVGElement, Gallery06MapSvgProps>(
  ({ className = '', children, mapMode, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 486.92 793.01"
        style={{ enableBackground: 'new 0 0 486.92 793.01' }}
        xmlSpace="preserve"
        className={className}
        {...props}
      >
        {/* Nested SVG positioned at 0, 0 preserving exact updated asset geometry and viewBox (486.92 x 793.01) */}
        <svg
          x="0"
          y="0"
          width="486.92"
          height="793.01"
          viewBox="0 0 486.92 793.01"
          overflow="visible"
        >
          <defs>
            <style>
              {`
                .g06-cls-1{fill:#f8efe8;}
                .g06-cls-2{fill:url(#g06-linear-gradient);}
                .g06-cls-3{fill:none;stroke:#2a2623;stroke-width:11px;stroke-miterlimit:10;}
                .g06-cls-4{fill:#2a2623;}
                .g06-cls-5{fill:#998f56;stroke:#353329;stroke-miterlimit:10;}
                .g06-cls-6{fill:url(#g06-linear-gradient-2);}
              `}
            </style>
            <linearGradient
              id="g06-linear-gradient"
              x1="119.42"
              y1="2424"
              x2="119.42"
              y2="2328.94"
              gradientTransform="matrix(1, 0, 0, -1, 0, 2639.5)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#f8efe8" />
              <stop offset="0.11" stopColor="#f9f0ea" stopOpacity="0.92" />
              <stop offset="0.35" stopColor="#faf4ef" stopOpacity="0.7" />
              <stop offset="0.68" stopColor="#fdf9f7" stopOpacity="0.36" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="linear-gradient"
              xlinkHref="#g06-linear-gradient"
              href="#g06-linear-gradient"
            />
            <linearGradient
              id="g06-linear-gradient-2"
              x1="338.7"
              y1="95.05"
              x2="338.7"
              y2="0"
              gradientTransform="matrix(1, 0, 0, 1, 0, 0)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#f8efe8" />
              <stop offset="0.11" stopColor="#f9f0ea" stopOpacity="0.92" />
              <stop offset="0.35" stopColor="#faf4ef" stopOpacity="0.7" />
              <stop offset="0.68" stopColor="#fdf9f7" stopOpacity="0.36" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="linear-gradient-2"
              xlinkHref="#g06-linear-gradient-2"
              href="#g06-linear-gradient-2"
            />
          </defs>
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <path
                className="g06-cls-1"
                d="M481.42,211.28H397.21V92.82H280.49v1.47l-215,0s-60,4.51-60,58.47,60,58.48,60,58.48v4.48H173V727.49H274.54s-1.27,60,52.66,60,52.67-60,52.66-60H481.42Z"
              />
              <rect className="g06-cls-2" x="71.33" y="215.5" width="96.17" height="95.05" />
              <path
                className="g06-cls-3"
                d="M396.82,92.82V207.28h84.6V727.49H379.86c0,.07,1.27,60-52.66,60s-52.66-60-52.66-60H173V211.28H242.1v28.77"
              />
              <path
                className="g06-cls-3"
                d="M65.52,233.63V211.28s-60-4.54-60-58.48,60-58.47,60-58.47l215,0V64.34"
              />
              <rect className="g06-cls-4" x="391.42" y="64.19" width="11" height="15.62" rx="3" />
              <rect className="g06-cls-5" x="391.42" y="27.68" width="11" height="24.46" rx="3" />
              <rect className="g06-cls-4" x="391.42" width="11" height="15.62" rx="3" />
              <rect className="g06-cls-4" x="60.33" y="282.76" width="11" height="15.62" rx="3" />
              <rect className="g06-cls-5" x="60.33" y="246.24" width="11" height="24.46" rx="3" />
              <rect className="g06-cls-5" x="274.99" y="27.68" width="11" height="24.46" rx="3" />
              <rect className="g06-cls-4" x="274.99" width="11" height="15.62" rx="3" />
              <rect className="g06-cls-6" x="285.99" width="105.43" height="95.05" />
            </g>
          </g>
        </svg>
        {children}
      </svg>
    );
  }
);

Gallery06MapSvg.displayName = 'Gallery06MapSvg';

