import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery07MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 07.
 * Tight coordinate space around actual visible artwork (viewBox="0 0 544.58 650").
 */
export const Gallery07MapSvg = forwardRef<SVGSVGElement, Gallery07MapSvgProps>(
  ({ className = '', children, mapMode, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 544.58 650"
        style={{ enableBackground: 'new 0 0 544.58 650' }}
        xmlSpace="preserve"
        className={className}
        {...props}
      >
        {/* Nested SVG positioned at 0, 0 preserving exact updated asset geometry and viewBox (544.58 x 650) */}
        <svg
          x="0"
          y="0"
          width="544.58"
          height="650"
          viewBox="0 0 544.58 650"
          overflow="visible"
        >
          <defs>
            <style>
              {`
                .g07-cls-1{fill:url(#g07-linear-gradient);}
                .g07-cls-2{fill:url(#g07-linear-gradient-2);}
                .g07-cls-3{fill:#f8efe8;}
                .g07-cls-4{fill:#2a2623;}
                .g07-cls-5{opacity:0.2;}
                .g07-cls-6{fill:#998f56;stroke:#353329;stroke-miterlimit:10;}
              `}
            </style>
            <linearGradient
              id="g07-linear-gradient"
              x1="-4616.89"
              y1="587.3"
              x2="-4901.43"
              y2="587.3"
              gradientTransform="matrix(1, 0, 0, -1, 5094.24, 1174.59)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.32" stopColor="#fdf9f7" stopOpacity="0.36" />
              <stop offset="0.65" stopColor="#faf4ef" stopOpacity="0.7" />
              <stop offset="0.89" stopColor="#f9f0ea" stopOpacity="0.92" />
              <stop offset="1" stopColor="#f8efe8" />
            </linearGradient>
            <linearGradient
              id="g07-linear-gradient-2"
              x1="358.67"
              y1="101.99"
              x2="487.06"
              y2="-147.87"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#f8efe8" />
              <stop offset="0.04" stopColor="#f8f0e9" stopOpacity="0.93" />
              <stop offset="0.25" stopColor="#faf5f0" stopOpacity="0.66" />
              <stop offset="0.44" stopColor="#fcf8f5" stopOpacity="0.42" />
              <stop offset="0.62" stopColor="#fdfbf9" stopOpacity="0.24" />
              <stop offset="0.78" stopColor="#fefdfd" stopOpacity="0.11" />
              <stop offset="0.91" stopColor="#fffffe" stopOpacity="0.03" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <rect
                className="g07-cls-1"
                x="83.02"
                y="536.09"
                width="284.53"
                height="102.41"
                transform="translate(450.58 1174.59) rotate(180)"
              />
              <path
                className="g07-cls-2"
                d="M544.58,120.94H247.1s-1-.11-2.78-.41l.18-1.59a83.34,83.34,0,0,1-28.35-9.63c-17.73-10.1-26.72-25.38-26.72-45.42,0-47.18,50.65-52.5,54.69-52.85l300.46,0Z"
              />
              <rect className="g07-cls-3" x="243.9" y="117.88" width="129.38" height="418.21" />
              <path
                className="g07-cls-4"
                d="M375.78,649.5H201.37a3,3,0,0,1-3-3v-5a3,3,0,0,1,3-3H364.78a3,3,0,0,0,3-3c0-68.11,0-511.09,0-511.09v-2.5a3,3,0,0,1,3-3h22a3,3,0,0,1,3,3v5a3,3,0,0,1-3,3h-11a3,3,0,0,0-3,3c0,66.36,0,499.27,0,511.1v2.5A3,3,0,0,1,375.78,649.5Z"
              />
              <g className="g07-cls-5">
                <path
                  className="g07-cls-4"
                  d="M243.89,413.25v11H122.14a3,3,0,0,1-3-2.67l-.25-2.22a103.65,103.65,0,0,0-10-31.83C98.5,367.47,83.07,357.3,63,357.3c-47.18,0-51.75,50.82-52,54.66V533.88a3,3,0,0,1-3,3H3a3,3,0,0,1-3-3V411.44a90.15,90.15,0,0,1,9.15-32.15c11-21.58,29.63-33,53.87-33s43.53,12.61,55.78,36.46a114.06,114.06,0,0,1,9.79,28.1,3,3,0,0,0,2.93,2.39Z"
                />
              </g>
              <path
                className="g07-cls-4"
                d="M246.4,536.88h-45a3,3,0,0,1-3-3v-5a3,3,0,0,1,3-3h34a3,3,0,0,0,3-3V131.49a3,3,0,0,0-2.33-2.92,99.41,99.41,0,0,1-14.4-4.46,3,3,0,0,1-1.63-4l2-4.58A3,3,0,0,1,225.9,114a84.09,84.09,0,0,0,18.34,5h2.16a3,3,0,0,1,3,3v412A3,3,0,0,1,246.4,536.88Z"
              />
              <g className="g07-cls-5">
                <path
                  className="g07-cls-4"
                  d="M480.73,3V8a3,3,0,0,1-3,3L244.12,11c-4,.35-54.69,5.67-54.69,52.85,0,20,9,35.32,26.72,45.42a83.34,83.34,0,0,0,28.35,9.63l-.18,1.59-.43,3.7v5.68a90.82,90.82,0,0,1-32.68-10.76c-21.44-12-32.78-31.12-32.78-55.26s11.39-43,32.93-54.27A91.09,91.09,0,0,1,243.5.05h.39L477.72,0A3,3,0,0,1,480.73,3Z"
                />
              </g>
              <rect className="g07-cls-4" x="409.72" y="118.91" width="15.62" height="11" rx="3" />
              <rect className="g07-cls-6" x="437.4" y="118.91" width="24.46" height="11" rx="3" />
              <rect className="g07-cls-4" x="473.92" y="118.91" width="15.62" height="11" rx="3" />
              <rect className="g07-cls-4" x="133.74" y="638.5" width="15.62" height="11" rx="3" />
              <rect className="g07-cls-6" x="161.42" y="638.5" width="24.46" height="11" rx="3" />
              <rect className="g07-cls-4" x="133.74" y="525.88" width="15.62" height="11" rx="3" />
              <rect className="g07-cls-6" x="161.42" y="525.88" width="24.46" height="11" rx="3" />
              <path
                className="g07-cls-4"
                d="M181.15,45a32.58,32.58,0,0,0-1.75,9.45,3,3,0,0,0,2.4,3.5l4.91.91a3,3,0,0,0,3.5-2.4A29.4,29.4,0,0,1,192,47a3,3,0,0,0-2.4-3.5l-4.92-.91A3,3,0,0,0,181.15,45Z"
              />
              <path
                className="g07-cls-6"
                d="M194.7,86.54a54.5,54.5,0,0,1-4.84-17.81,3,3,0,0,0-3.69-2.11l-4.82,1.32a3,3,0,0,0-2.11,3.68,62,62,0,0,0,4.84,17.81,3,3,0,0,0,3.69,2.11l4.82-1.32A3,3,0,0,0,194.7,86.54Z"
              />
              <path
                className="g07-cls-4"
                d="M208.56,104a32.62,32.62,0,0,1-7-6.56,3,3,0,0,0-4.25.14l-3.41,3.66a3,3,0,0,0,.15,4.24,31.55,31.55,0,0,0,7,6.56,3,3,0,0,0,4.24-.14l3.42-3.66A3,3,0,0,0,208.56,104Z"
              />
            </g>
          </g>
        </svg>
        {children}
      </svg>
    );
  }
);

Gallery07MapSvg.displayName = 'Gallery07MapSvg';

