import React, { forwardRef } from 'react';

interface Gallery01MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 01 — Architectural Hall.
 * Styled in the rich neo-architectural comic palette:
 * - Walls: #2a2623 & #45240c
 * - Accents / Portals: #da985f
 * - Floor base: #f8efe8
 */
export const Gallery01MapSvg = forwardRef<SVGSVGElement, Gallery01MapSvgProps>(
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
              .g01-wall {
                fill: #2a2623;
                stroke: #1e1b18;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-width: 2.5px;
              }
              .g01-accent {
                fill: #da985f;
                stroke: #2a2623;
                stroke-width: 1.5px;
              }
              .g01-floor {
                fill: #f8efe8;
              }
              .g01-detail {
                fill: #45240c;
              }
            `}
          </style>
        </defs>

        {/* Ambient Hall Floor (#f8efe8) */}
        <path
          className="g01-floor"
          d="M125,115 L733,115 L733,1079 L547,1079 L547,1181 L125,1181 Z"
        />

        {/* North Peristyle & Main Hall Boundaries */}
        <path
          className="g01-wall"
          d="M733.69,250v11h-225.69v-11h199V115h-194.3c-1.51,0-2.76-1.18-2.83-2.69-.05-1.12-.13-2.22-.3-3.32-1.58-10-4.77-19.16-9.44-27.65-3.06-5.57-6.77-10.85-11.07-15.89-21.57-25.23-61.92-37.38-95.59-22.51-31.15,13.77-49.53,36.33-52.94,69.49-.15,1.47-1.41,2.57-2.88,2.57h-194.65v135h119.02v109h-119.02v709.49s160.43.01,160.43.01v112.76h-11v-101.77h-159.45l-.06-731.2h118.1v-87.29h-118.1l-.42-151.5c-.13-5.35.03-5.5,5.5-5.5l188.5-.02c1.89,0,3.96.73,4.57-2.47,2.58-13.44,8.15-25.57,16.41-36.52,13.49-17.9,30.81-30.06,52.5-36.05,2.75-.76,5.51-1.32,8.29-1.77,11.03-1.75,22.29-1.84,33.31-.02,5.9.97,11.72,2.46,17.46,4.75,31.24,12.46,50.81,35.16,59.75,67.16,1.15,4.09,2.44,5,6.21,5,62.17-.08,124.33-.02,186.5-.11,6.9-.01,6.01,1.16,6.01,6.05v140h16.18Z"
        />

        {/* East Portals and Masonry Columns (#da985f & #45240c) */}
        <rect className="g01-accent" x="745.74" y="250" width="16.18" height="11" rx="2" />
        <rect className="g01-detail" x="773.97" y="250" width="27.57" height="11" rx="2" />
        <rect className="g01-accent" x="813.37" y="250" width="17.87" height="11" rx="2" />
        <rect className="g01-detail" x="773.97" y="347.99" width="27.57" height="11" rx="2" />
        <rect className="g01-accent" x="813.37" y="347.99" width="17.87" height="11" rx="2" />

        {/* South & West Hall Corridors */}
        <polygon
          className="g01-wall"
          points="733.69 347.99 733.69 358.99 717.51 358.99 717.49 1079.62 558.15 1079.62 558.15 1181.26 547.15 1181.26 547.15 1068.62 707 1068.62 707 359 508 359 508 348.29 577.88 348.19 717.51 347.99 733.69 347.99"
        />
        <rect className="g01-accent" x="745.74" y="347.99" width="16.18" height="11" rx="2" />

        {children}
      </svg>
    );
  }
);

Gallery01MapSvg.displayName = 'Gallery01MapSvg';
