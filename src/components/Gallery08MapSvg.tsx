import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery08MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 08.
 * Exact SVG specification as provided.
 * viewBox="0 0 762.8 1147.2"
 */
export const Gallery08MapSvg = forwardRef<SVGSVGElement, Gallery08MapSvgProps>(
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
        viewBox="0 0 762.8 1147.2"
        style={{ enableBackground: 'new 0 0 762.8 1147.2' }}
        xmlSpace="preserve"
        className={className}
        {...props}
      >
        <defs>
          <style type="text/css">
            {`
              .st0{fill:#F8EFE8;}
              .st1{fill:#2A2623;}
              .st2{fill:url(#SVGID_1_);}
              .st3{fill:url(#SVGID_00000132785013793165948160000000332474940824001719_);}
              .st4{fill:#C9AC59;stroke:#2D2824;stroke-miterlimit:10;}
              .st5{fill:url(#SVGID_00000149376631618869257580000015609599305653076362_);}
              .st6{fill:url(#SVGID_00000017498353689431545630000010488042934420510143_);}
              .st7{fill:#998F56;stroke:#353329;stroke-miterlimit:10;}
              .st8{fill:url(#SVGID_00000168831477604003519490000002990206415096436643_);}
              .st9{fill:url(#SVGID_00000052063824641248338480000013339454257444908703_);}
              .st10{fill:none;stroke:#2A2623;stroke-width:11;stroke-miterlimit:10;}
              .st11{fill:url(#SVGID_00000110472741598493684350000014494481887544543125_);}
              .st12{fill:url(#SVGID_00000167359719221346430380000004563121170528340608_);}
              .st13{fill:url(#SVGID_00000065794437998003919180000017889681091819901081_);}
              .st14{opacity:0.2;}
              .st15{opacity:0.63;}
              .st16{fill:url(#SVGID_00000091695911004216431980000015092153661944012684_);}
              .st17{fill:url(#SVGID_00000131349121331487098900000002287721527106099586_);}
              .st18{opacity:0.2;fill:#2A2623;}
              .st19{fill:url(#SVGID_00000058583573331101194560000013360281770290378943_);}
              .st20{fill:url(#SVGID_00000049936095736978907600000000721980303085916808_);}
              .st21{fill:url(#SVGID_00000080899146406035950350000017752558134222539710_);}
              .st22{fill:url(#SVGID_00000072992623117188067020000011773122336511813252_);}
              .st23{opacity:0.2;fill:none;stroke:#2A2623;stroke-width:11;stroke-miterlimit:10;}
            `}
          </style>
        </defs>
        <g>
          <linearGradient
            id="SVGID_1_"
            gradientUnits="userSpaceOnUse"
            x1="358.1684"
            y1="979.3728"
            x2="358.1684"
            y2="801.714"
          >
            <stop offset="1.704893e-07" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
            <stop offset="9.146164e-02" style={{ stopColor: '#FEFDFD', stopOpacity: 0.09146148 }} />
            <stop offset="1" style={{ stopColor: '#F8EFE8' }} />
          </linearGradient>
          <rect x="311.1" y="776.2" className="st2" width="94.1" height="158.3" />
          <rect x="534.3" y="468.9" className="st0" width="86.6" height="90.8" />
          
          <linearGradient
            id="SVGID_00000018209299552265017750000004098641335491345328_"
            gradientUnits="userSpaceOnUse"
            x1="576.0493"
            y1="468.8931"
            x2="576.0493"
            y2="309.5089"
          >
            <stop offset="0" style={{ stopColor: '#F8EFE8' }} />
            <stop offset="0.9085" style={{ stopColor: '#FEFDFD', stopOpacity: 0.09146148 }} />
            <stop offset="1" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
          </linearGradient>
          
          <rect
            x="531.2"
            y="326.9"
            style={{ fill: 'url(#SVGID_00000018209299552265017750000004098641335491345328_)' }}
            width="89.7"
            height="142"
          />
          <rect x="525.2" y="468.9" className="st0" width="35.8" height="94.8" />
          <path
            className="st0"
            d="M525.2,365.5v198.2H410.7v219.1H204.1V673.9c0-52,0-103.2,0-103.2s-67.7,3.4-67.7-52.1
            c0-55.4,67.6-52.1,67.7-52.1V365.5h101.5c0,0-3.4-67.7,52.1-67.7c55.4,0,52.1,67.6,52.1,67.7C409.8,365.5,524.9,365.5,525.2,365.5z"
          />
          <path
            className="st10"
            d="M410.7,465.5h114.5v-100c-0.3,0-115.4,0-115.4,0c0-0.1,3.3-67.7-52.1-67.7c-55.5,0-52.1,67.7-52.1,67.7H204.1
            v101.1c-0.1,0-67.7-3.3-67.7,52.1c0,55.5,67.7,52.1,67.7,52.1s0,211.4,0,212c0,0,101.5,0,101.5,0v31"
          />
          <line className="st10" x1="305.6" y1="365.5" x2="305.6" y2="465.5" />
          <line className="st10" x1="305.6" y1="563.7" x2="305.6" y2="706.1" />
          <line className="st10" x1="204.1" y1="673.9" x2="305.6" y2="673.9" />
          <line className="st10" x1="305.6" y1="782.7" x2="305.6" y2="755.2" />
          <polyline className="st23" points="410.7,782.7 525.2,782.7 525.2,883.1" />
          <polyline className="st10" points="525.2,563.7 410.7,563.7 410.7,782.7 410.7,813.7" />
          <line className="st23" x1="525.2" y1="716.8" x2="525.2" y2="563.7" />
          <polyline className="st10" points="525.2,563.7 626.4,563.7 626.4,534.5" />
          <path
            className="st7"
            d="M631.9,499.6V518c0,1.7-1.3,3-3,3h-5c-1.7,0-3-1.3-3-3v-18.5c0-1.7,1.3-3,3-3h5
            C630.5,496.6,631.9,497.9,631.9,499.6z"
          />
          <path
            className="st7"
            d="M631.9,435.4v18.5c0,1.7-1.3,3-3,3h-5c-1.7,0-3-1.3-3-3v-18.5c0-1.7,1.3-3,3-3h5
            C630.5,432.4,631.9,433.7,631.9,435.4z"
          />
          <path
            className="st1"
            d="M628.9,484.5h-5c-1.7,0-3-1.3-3-3v-9.6c0-1.7,1.3-3,3-3h5c1.7,0,3,1.3,3,3v9.6
            C631.9,483.2,630.5,484.5,628.9,484.5z"
          />
          <path
            className="st7"
            d="M416.2,847.6v-18.5c0-1.7-1.3-3-3-3h-5c-1.7,0-3,1.3-3,3v18.5c0,1.7,1.3,3,3,3h5
            C414.9,850.6,416.2,849.3,416.2,847.6z"
          />
          <path
            className="st1"
            d="M413.2,862.7h-5c-1.7,0-3,1.3-3,3v9.6c0,1.7,1.3,3,3,3h5c1.7,0,3-1.3,3-3v-9.6
            C416.2,864,414.9,862.7,413.2,862.7z"
          />
          <path
            className="st7"
            d="M311.1,847.6v-18.5c0-1.7-1.3-3-3-3h-5c-1.7,0-3,1.3-3,3v18.5c0,1.7,1.3,3,3,3h5
            C309.8,850.6,311.1,849.3,311.1,847.6z"
          />
          <path
            className="st1"
            d="M308.1,862.7h-5c-1.7,0-3,1.3-3,3v9.6c0,1.7,1.3,3,3,3h5c1.7,0,3-1.3,3-3v-9.6
            C311.1,864,309.8,862.7,308.1,862.7z"
          />
        </g>
        {children}
      </svg>
    );
  }
);

Gallery08MapSvg.displayName = 'Gallery08MapSvg';
