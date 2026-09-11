import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery04MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Exact Architectural SVG Map for Gallery 04 — Recording Our Endurance.
 * Uses exact user-provided SVG specification with viewBox="0 0 695.3 1147.2".
 */
export const Gallery04MapSvg = forwardRef<SVGSVGElement, Gallery04MapSvgProps>(
  ({ className = '', children, mapMode, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 695.3 1147.2"
        style={{ enableBackground: 'new 0 0 695.3 1147.2' }}
        xmlSpace="preserve"
        className={className}
        {...props}
      >
        <style type="text/css">
          {`
            .st0{fill:#F8EFE8;}
            .st1{fill:#2A2623;}
            .st2{fill:url(#SVGID_1_);}
            .st3{fill:url(#SVGID_00000003077381882208186730000006198446482533589383_);}
            .st4{fill:#C9AC59;stroke:#2D2824;stroke-miterlimit:10;}
            .st5{fill:url(#SVGID_00000081635960161472392220000007610437837563885741_);}
            .st6{fill:url(#SVGID_00000134212879223036108980000016072033920059475090_);}
            .st7{fill:#998F56;stroke:#353329;stroke-miterlimit:10;}
            .st8{fill:url(#SVGID_00000074425971501687500620000012301635249881346440_);}
            .st9{fill:url(#SVGID_00000164508372239392928310000012677442397498627211_);}
          `}
        </style>
        <g>
          <g>
            <path
              className="st0"
              d="M493,200.1v718.5h-96.7c-0.1,4.2-2.1,60.7-57.5,60.7c-55.3,0-57.4-56.4-57.5-60.7h-95.7V200.1h67.6v-0.7h28.1
                c0,0,0-60.9,57.5-60.9c57.5,0,57.5,60.9,57.5,60.9h29v0.7H493z"
            />
            <linearGradient
              id="SVGID_1_"
              gradientUnits="userSpaceOnUse"
              x1="110.6492"
              y1="772.2039"
              x2="185.5359"
              y2="772.2039"
            >
              <stop offset="1.704893e-07" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
              <stop offset="0.5675" style={{ stopColor: '#FAF3EE', stopOpacity: 0.5675 }} />
              <stop offset="1" style={{ stopColor: '#F8EFE8' }} />
            </linearGradient>
            <rect x="110.6" y="730" className="st2" width="74.9" height="84.3" />

            <linearGradient
              id="SVGID_00000020367024049725928220000015029731771869278370_"
              gradientUnits="userSpaceOnUse"
              x1="492.967"
              y1="772.2039"
              x2="567.8536"
              y2="772.2039"
            >
              <stop offset="0" style={{ stopColor: '#F8EFE8' }} />
              <stop offset="0.4325" style={{ stopColor: '#FAF3EE', stopOpacity: 0.5675 }} />
              <stop offset="1" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
            </linearGradient>

            <rect
              x="493"
              y="730"
              style={{ fill: 'url(#SVGID_00000020367024049725928220000015029731771869278370_)' }}
              width="74.9"
              height="84.3"
            />
          </g>
          <g>
            <path
              className="st7"
              d="M147.5,814.4h-18.5c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3h18.5c1.7,0,3-1.3,3-3v-5
                C150.5,815.7,149.2,814.4,147.5,814.4z"
            />
            <path
              className="st1"
              d="M111,814.4h-9.6c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3h9.6c1.7,0,3-1.3,3-3v-5C114,815.7,112.6,814.4,111,814.4
                z"
            />
            <path
              className="st7"
              d="M147.5,719h-18.5c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3h18.5c1.7,0,3-1.3,3-3v-5
                C150.5,720.4,149.2,719,147.5,719z"
            />
            <path
              className="st1"
              d="M111,719h-9.6c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3h9.6c1.7,0,3-1.3,3-3v-5C114,720.4,112.6,719,111,719z"
            />
            <path
              className="st1"
              d="M530.1,719.4h-31.9l0.3-519.2v-3.2c0-1.7-1.3-3-3-3h-91.4c-1.5,0-2.8-1.1-3-2.6c-0.8-6.3-2.7-15.5-7.1-24.7
                c-7.2-15.3-22.7-33.6-55.3-33.6c-32.6,0-48.1,18.3-55.3,33.6c-4.3,9.2-6.2,18.4-7.1,24.7c-0.2,1.5-1.5,2.6-3,2.6H183
                c-1.7,0-3,1.3-3,3v522.4h-14.7c-1.7,0-3,1.3-3,3v5c0,1.6,1.3,3,3,3h106.3c1.7,0,3-1.4,3-3v-5c0-1.7-1.3-3-3-3H194
                c-1.7,0-3-1.4-3-3V207.9c0-1.7,1.3-3,3-3h89.7c1.7,0,3-1.4,3-3v-2.5c0-0.1,0.1-14.2,6.7-28.1c8.5-18.1,23.8-27.3,45.3-27.3
                c51.2,0,52,53.2,52,55.4v2.5c0,1.6,1.3,3,3,3h90.7c1.7,0,3,1.3,3,3l-0.3,508.4c0,1.7-1.3,3-3,3h-77.4c-1.7,0-3,1.3-3,3v5
                c0,1.6,1.3,3,3,3h123.3c1.7,0,3-1.4,3-3v-5C533.1,720.7,531.8,719.4,530.1,719.4z"
            />
            <path
              className="st1"
              d="M530.1,814.4H406.8c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3h77.5c1.7,0,3,1.3,3,3l0.1,81.5c0,1.7-1.3,3-3,3h-88.2
                l-2.5-0.1c-1.7-0.1-3.2,1.4-3.1,3.1l0.1,2.4l0,0.2c0,1.6-0.5,15.8-7.4,29.5c-8.7,17.1-23.7,25.7-44.6,25.7
                c-49.4,0-51.9-49.3-52-55.2v-2.7c0-1.7-1.3-3-3-3H194c-1.7,0-3-1.3-3-3v-81.5c0-1.7,1.3-3,3-3h77.6c1.7,0,3-1.3,3-3v-5
                c0-1.7-1.3-3-3-3H165.4c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3H180v95.5c0,1.7,1.3,3,3,3h90.3c1.5,0,2.8,1.1,3,2.6
                c0.9,6.7,3,16.7,8,26.6c7.4,14.5,22.8,31.7,54.4,31.7c31.6,0,47-17.3,54.4-31.8c5-9.9,7.1-19.8,8-26.6c0.2-1.5,1.5-2.6,3-2.6h91.4
                c1.7,0,3-1.3,3-3l-0.1-95.5h0.2h31.6c1.7,0,3-1.4,3-3v-5C533.1,815.8,531.8,814.4,530.1,814.4z"
            />
            <path
              className="st7"
              d="M547.8,814.4h18.5c1.7,0,3,1.3,3,3v5c0,1.7,1.3,3,3,3h-18.5c-1.7,0-3-1.3-3-3v-5
                C544.8,815.7,546.1,814.4,547.8,814.4z"
            />
            <path
              className="st1"
              d="M584.3,814.4h9.6c1.7,0,3,1.3,3,3v5c0,1.7,1.3,3,3,3h-9.6c-1.7,0-3-1.3-3-3v-5
                C581.3,815.7,582.6,814.4,584.3,814.4z"
            />
            <path
              className="st7"
              d="M547.8,719h18.5c1.7,0,3,1.3,3,3v5c0,1.7,1.3,3,3,3h-18.5c-1.7,0-3-1.3-3-3v-5
                C544.8,720.4,546.1,719,547.8,719z"
            />
            <path
              className="st1"
              d="M584.3,719h9.6c1.7,0,3,1.3,3,3v5c0,1.7,1.3,3,3,3h-9.6c-1.7,0-3-1.3-3-3v-5C581.3,720.4,582.6,719,584.3,719
                z"
            />
          </g>
        </g>
        {children}
      </svg>
    );
  }
);

Gallery04MapSvg.displayName = 'Gallery04MapSvg';
