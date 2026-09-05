import React, { forwardRef } from 'react';

interface Gallery03MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 03 — Modern Hall.
 * Styled in the rich neo-architectural comic palette:
 * - Walls: #2a2623 & #45240c
 * - Accents / Portals: #da985f
 * - Floor base: #f8efe8
 */
export const Gallery03MapSvg = forwardRef<SVGSVGElement, Gallery03MapSvgProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        id="Layer_1"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 848 1264"
        className={className}
        {...props}
      >
        <defs>
          <style>
            {`
              .g03-wall {
                fill: #2a2623;
                stroke: #1e1b18;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-width: 2.5px;
              }
              .g03-accent {
                fill: #da985f;
                stroke: #2a2623;
                stroke-width: 1.5px;
              }
              .g03-floor {
                fill: #f8efe8;
              }
              .g03-detail {
                fill: #45240c;
              }
            `}
          </style>
        </defs>

        {/* Ambient Gallery 03 Walkway Floor (#f8efe8) */}
        <path
          className="g03-floor"
          d="M152,93 L716,93 L716,921 L510,921 L510,1025 L744,1025 L744,1176 L125,1176 L125,921 L152,921 Z"
        />

        {/* Outer and Inner Wall Architecture */}
        <g>
          {/* Main East Gallery Outer Wing Line */}
          <polyline
            className="g03-wall"
            points="534.76 82.43 726.56 82.33 726.58 331.47 749.4 331.86 749.23 342.97 726.58 342.74 726.62 932.53 510.52 932.53 510.52 921.82 716.54 921.82 716.53 93.33 522.46 93.37"
          />

          {/* South Rotunda Pavilion & Entrance Atrium */}
          <path
            className="g03-wall"
            d="M744.22,1025.82v11h-17.57s.39,140.5.39,140.5c.13,5.35-.03,5.5-5.5,5.5l-188.5.02c-1.89,0-3.96-.73-4.57,2.47-2.58,13.44-8.15,25.57-16.41,36.52-13.49,17.9-30.81,30.06-52.5,36.05-2.75.76-5.51,1.32-8.29,1.77-11.03,1.75-22.29,1.84-33.31.02-5.9-.97-11.72-2.46-17.46-4.75-31.24-12.46-50.81-35.16-59.75-67.16-1.15-4.09-2.44-5-6.21-5-62.17.08-124.33.02-186.5.11-6.9.01-6.01-1.16-6.01-6.05v-140h-16.18v-11h223.69v11h-197v135h194.3c1.51,0,2.76,1.18,2.83,2.69.05,1.12.13,2.22.3,3.32,1.58,10,4.77,19.16,9.44,27.65,3.06,5.57,6.77,10.85,11.07,15.89,21.57,25.23,61.92,37.38,95.59,22.51,31.15-13.77,49.53-36.33,52.94-69.49.15-1.47,1.41-2.57,2.88-2.57h194.65v-135h-206.02v-11h233.7Z"
          />

          {/* Niches & Decorative Capitals (#da985f) */}
          <rect className="g03-accent" x="97.62" y="1025.82" width="16.18" height="11" rx="2" />
          <rect className="g03-detail" x="58" y="1025.82" width="27.57" height="11" rx="2" />
          <rect className="g03-accent" x="28.3" y="1025.82" width="17.87" height="11" rx="2" />
          <rect className="g03-detail" x="58" y="921.83" width="27.57" height="11" rx="2" />
          <rect className="g03-accent" x="28.3" y="921.83" width="17.87" height="11" rx="2" />

          {/* West Gallery Corridor Wall */}
          <polyline
            className="g03-wall"
            points="347.41 93.37 152.54 93.2 152.54 921.82 316.54 921.82 316.54 932.53 281.66 932.63 142.03 932.83 125.85 932.83 125.85 921.83 142.03 921.83 142.05 82.2 338.54 82.35"
          />
          <rect className="g03-accent" x="97.62" y="921.83" width="16.18" height="11" rx="2" />
        </g>

        {/* North Apse Curvature */}
        <path
          className="g03-wall"
          d="M340.83,79.88c2.58-13.44,8.15-25.57,16.41-36.52,13.49-17.9,30.81-30.06,52.5-36.05,2.75-.76,5.51-1.32,8.29-1.77,11.03-1.75,22.29-1.84,33.31-.02,5.9.97,11.72,2.46,17.46,4.75,31.24,12.46,50.81,35.16,59.75,67.16,1.15,4.09,2.44,5,6.21,5"
        />
        <path className="g03-wall" d="M336.26,82.35c1.89,0,3.96.73,4.57-2.47" />
        <path
          className="g03-wall"
          d="M522.46,93.37c-1.51,0-2.76-1.18-2.83-2.69-.05-1.12-.13-2.22-.3-3.32-1.58-10-4.77-19.16-9.44-27.65-3.06-5.57-6.77-10.85-11.07-15.89-21.57-25.23-61.92-37.38-95.59-22.51-31.15,13.77-49.53,36.33-52.94,69.49-.15,1.47-1.41,2.57-2.88,2.57"
        />

        {/* East Portals & Masonry Accents */}
        <rect className="g03-accent" x="756.27" y="1025.82" width="16.18" height="11" rx="2" />
        <rect className="g03-detail" x="784.5" y="1025.82" width="27.57" height="11" rx="2" />
        <rect className="g03-accent" x="823.9" y="1025.82" width="17.87" height="11" rx="2" />
        <rect className="g03-accent" x="761.77" y="331.97" width="15.18" height="11" rx="2" />
        <rect className="g03-detail" x="788.99" y="331.97" width="27.57" height="11" rx="2" />
        <rect className="g03-accent" x="828.4" y="331.97" width="17.87" height="11" rx="2" />

        {children}
      </svg>
    );
  }
);

Gallery03MapSvg.displayName = 'Gallery03MapSvg';
