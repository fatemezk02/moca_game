import React, { forwardRef } from 'react';
import type { MapDisplayMode } from '../types';

interface Gallery07MapSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  mapMode?: MapDisplayMode;
  children?: React.ReactNode;
}

/**
 * Architectural SVG Map for Gallery 07.
 * Exact SVG specification as provided.
 * viewBox="0 0 762.8 1147.2"
 */
export const Gallery07MapSvg = forwardRef<SVGSVGElement, Gallery07MapSvgProps>(
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
              .st3{fill:url(#SVGID_00000172398364156074066990000004622648179613710470_);}
              .st4{fill:#C9AC59;stroke:#2D2824;stroke-miterlimit:10;}
              .st5{fill:url(#SVGID_00000163060464727160157610000007026159422613786810_);}
              .st6{fill:url(#SVGID_00000166668537994168116360000018098216320223333307_);}
              .st7{fill:#998F56;stroke:#353329;stroke-miterlimit:10;}
              .st8{fill:url(#SVGID_00000101820553200556348940000003149980365673938067_);}
              .st9{fill:url(#SVGID_00000113317454367976034390000008223501484951444620_);}
              .st10{fill:none;stroke:#2A2623;stroke-width:11;stroke-miterlimit:10;}
              .st11{fill:url(#SVGID_00000146491605490781359870000009554546789047233203_);}
              .st12{fill:url(#SVGID_00000000214080840697913210000015972952452919288482_);}
              .st13{fill:url(#SVGID_00000076569951431895398400000005142088920715684283_);}
              .st14{opacity:0.2;}
              .st15{opacity:0.63;}
              .st16{fill:url(#SVGID_00000091720911467263242450000015843169510173177474_);}
              .st17{fill:url(#SVGID_00000055670061027954298500000013404225279330074253_);}
              .st18{opacity:0.2;fill:#2A2623;}
              .st19{fill:url(#SVGID_00000049183693978550441160000000028337020762281089_);}
              .st20{fill:url(#SVGID_00000047020194766290732730000003167067973914565812_);}
            `}
          </style>
        </defs>
        <g>
          <linearGradient
            id="SVGID_1_"
            gradientUnits="userSpaceOnUse"
            x1="674.7337"
            y1="843.0026"
            x2="390.1988"
            y2="843.0026"
            gradientTransform="matrix(-1 0 0 1 757.0693 0)"
          >
            <stop offset="1.704893e-07" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
            <stop offset="9.146164e-02" style={{ stopColor: '#FEFDFD', stopOpacity: 0.09146148 }} />
            <stop offset="1" style={{ stopColor: '#F8EFE8' }} />
          </linearGradient>
          <polygon className="st2" points="476.7,894.2 192.1,894.2 192.1,791.8 476.7,791.8" />
          
          <linearGradient
            id="SVGID_00000177480768397065743580000004174824145808390582_"
            gradientUnits="userSpaceOnUse"
            x1="467.7732"
            y1="357.6993"
            x2="596.1552"
            y2="107.8369"
          >
            <stop offset="0" style={{ stopColor: '#F8EFE8' }} />
            <stop offset="0.5503" style={{ stopColor: '#FDFAF8', stopOpacity: 0.4497 }} />
            <stop offset="1" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
          </linearGradient>
          <path
            style={{ fill: 'url(#SVGID_00000177480768397065743580000004174824145808390582_)' }}
            d="M653.7,376.6H356.2c0,0-1-0.1-2.8-0.4 l0.2-1.6c-0.2,0-14.4-1.7-28.3-9.6c-17.7-10.1-26.7-25.4-26.7-45.4c0-47.2,50.7-52.5,54.7-52.9l300.5,0V376.6z"
          />
          <rect x="353" y="373.6" className="st0" width="129.4" height="418.2" />
          <g>
            <g>
              <path
                className="st1"
                d="M484.9,905.2H310.5c-1.7,0-3-1.3-3-3v-5c0-1.7,1.3-3,3-3h163.4c1.7,0,3-1.3,3-3c0-68.1,0-511.1,0-511.1v-2.5 c0-1.7,1.3-3,3-3h22c1.7,0,3,1.3,3,3v5c0,1.7-1.3,3-3,3h-11c-1.7,0-3,1.3-3,3c0,66.4,0,499.3,0,511.1l0,2.5 C487.9,903.9,486.5,905.2,484.9,905.2z"
              />
            </g>
            <g className="st14">
              <path
                className="st1"
                d="M353,669v5.5c0,0,0,2,0,5.5H231.2c-1.5,0-2.8-1.2-3-2.7l-0.2-2.2c0-0.2-1.9-16.2-10-31.8 c-10.4-20.1-25.8-30.2-45.9-30.2c-47.2,0-51.8,50.8-52,54.7v121.9c0,1.7-1.3,3-3,3h-5c-1.7,0-3-1.3-3-3V667.3l0-0.2 c0-0.7,1.1-16.3,9.2-32.2c11-21.6,29.6-33,53.9-33s43.5,12.6,55.8,36.5c5.5,10.7,8.4,21.3,9.8,28.1c0.3,1.4,1.5,2.4,2.9,2.4H353z"
              />
            </g>
            <g>
              <path
                className="st1"
                d="M355.5,792.6h-45c-1.7,0-3-1.3-3-3v-5c0-1.7,1.3-3,3-3h34c1.7,0,3-1.3,3-3l0-391.4c0-1.4-1-2.6-2.3-2.9 c-3.9-0.9-9-2.3-14.4-4.5c-1.6-0.6-2.3-2.4-1.6-4l2-4.6c0.6-1.5,2.4-2.2,3.9-1.6c9.2,3.6,16.9,4.8,18.3,5h2.2c1.7,0,3,1.3,3,3 v412C358.5,791.2,357.2,792.6,355.5,792.6z"
              />
            </g>
            <g className="st14">
              <path
                className="st1"
                d="M589.8,258.7v5c0,1.7-1.3,3-3,3l-233.6,0c-4,0.4-54.7,5.7-54.7,52.9c0,20,9,35.3,26.7,45.4 c13.9,7.9,28.2,9.6,28.3,9.6l-0.2,1.6l-0.4,3.7v5.7c-0.1,0-16.1-1.5-32.7-10.8c-21.4-12-32.8-31.1-32.8-55.3 c0-24.2,11.4-43,32.9-54.3c15.8-8.3,31.5-9.5,32.1-9.6l0.4,0l233.8,0C588.5,255.7,589.8,257,589.8,258.7z"
              />
            </g>
          </g>
          <g>
            <path
              className="st1"
              d="M531.4,374.6h-9.6c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3h9.6c1.7,0,3-1.3,3-3v-5 C534.4,376,533.1,374.6,531.4,374.6z"
            />
            <path
              className="st7"
              d="M568,374.6h-18.5c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3H568c1.7,0,3-1.3,3-3v-5C571,376,569.6,374.6,568,374.6z"
            />
            <path
              className="st1"
              d="M595.6,374.6H586c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3h9.6c1.7,0,3-1.3,3-3v-5 C598.6,376,597.3,374.6,595.6,374.6z"
            />
          </g>
          <g>
            <path
              className="st1"
              d="M255.5,894.2h-9.6c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3h9.6c1.7,0,3-1.3,3-3v-5 C258.5,895.5,257.1,894.2,255.5,894.2z"
            />
            <path
              className="st7"
              d="M292,894.2h-18.5c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3H292c1.7,0,3-1.3,3-3v-5 C295,895.5,293.6,894.2,292,894.2z"
            />
          </g>
          <g>
            <path
              className="st1"
              d="M255.5,781.6h-9.6c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3h9.6c1.7,0,3-1.3,3-3v-5 C258.5,782.9,257.1,781.6,255.5,781.6z"
            />
            <path
              className="st7"
              d="M292,781.6h-18.5c-1.7,0-3,1.3-3,3v5c0,1.7,1.3,3,3,3H292c1.7,0,3-1.3,3-3v-5 C295,782.9,293.6,781.6,292,781.6z"
            />
          </g>
          <g>
            <path
              className="st1"
              d="M290.3,300.7c-1.1,2.7-1.5,6-1.8,9.5c-0.3,1.6,0.8,3.2,2.4,3.5l4.9,0.9c1.6,0.3,3.2-0.8,3.5-2.4 c0.1-3.3,0.7-6.5,1.8-9.5c0.3-1.6-0.8-3.2-2.4-3.5l-4.9-0.9C292.1,298,290.6,299,290.3,300.7z"
            />
            <path
              className="st7"
              d="M303.8,342.2c-2.4-5-4.1-10.8-4.8-17.8c-0.4-1.6-2.1-2.5-3.7-2.1l-4.8,1.3c-1.6,0.4-2.5,2.1-2.1,3.7 c0.9,7.1,2.6,12.8,4.8,17.8c0.4,1.6,2.1,2.5,3.7,2.1l4.8-1.3C303.3,345.5,304.2,343.8,303.8,342.2z"
            />
            <path
              className="st1"
              d="M317.7,359.7c-3-2.2-5.4-4.4-7-6.6c-1.2-1.1-3.1-1.1-4.2,0.1l-3.4,3.7c-1.1,1.2-1.1,3.1,0.1,4.2 c2,2.5,4.3,4.7,7,6.6c1.2,1.1,3.1,1.1,4.2-0.1l3.4-3.7C318.9,362.7,318.9,360.8,317.7,359.7z"
            />
          </g>
        </g>
        {children}
      </svg>
    );
  }
);

Gallery07MapSvg.displayName = 'Gallery07MapSvg';
