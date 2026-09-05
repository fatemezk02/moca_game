import React from 'react';

interface ThreePartProgressGraphicProps {
  // completedStep: 1, 2, or 3
  completedStep: number;
  className?: string;
}

export const ThreePartProgressGraphic: React.FC<ThreePartProgressGraphicProps> = ({
  completedStep,
  className = 'w-64 sm:w-72 h-auto',
}) => {
  return (
    <svg
      viewBox="0 0 300 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <pattern
          id="hatch-pattern"
          width="8"
          height="8"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="#0e0f0f" strokeWidth="1.5" strokeOpacity="0.25" />
        </pattern>
      </defs>

      {/* Frame boundary */}
      <rect
        x="10"
        y="10"
        width="280"
        height="100"
        stroke="#0e0f0f"
        strokeWidth="2"
        fill="#fbf9f9"
      />

      {/* Part 1 */}
      <g id="part-1">
        <rect
          x="16"
          y="16"
          width="85"
          height="88"
          fill={completedStep >= 1 ? "#0e0f0f" : "url(#hatch-pattern)"}
          stroke="#0e0f0f"
          strokeWidth="1.5"
          className="transition-colors duration-300"
        />
        <text
          x="58.5"
          y="65"
          textAnchor="middle"
          fill={completedStep >= 1 ? "#fbf9f9" : "#0e0f0f"}
          fontFamily="monospace"
          fontSize="16"
          fontWeight="bold"
        >
          1/3
        </text>
      </g>

      {/* Part 2 */}
      <g id="part-2">
        <rect
          x="107"
          y="16"
          width="85"
          height="88"
          fill={completedStep >= 2 ? "#0e0f0f" : "url(#hatch-pattern)"}
          stroke="#0e0f0f"
          strokeWidth="1.5"
          className="transition-colors duration-300"
        />
        <text
          x="149.5"
          y="65"
          textAnchor="middle"
          fill={completedStep >= 2 ? "#fbf9f9" : "#0e0f0f"}
          fontFamily="monospace"
          fontSize="16"
          fontWeight="bold"
        >
          2/3
        </text>
      </g>

      {/* Part 3 */}
      <g id="part-3">
        <rect
          x="198"
          y="16"
          width="85"
          height="88"
          fill={completedStep >= 3 ? "#0e0f0f" : "url(#hatch-pattern)"}
          stroke="#0e0f0f"
          strokeWidth="1.5"
          className="transition-colors duration-300"
        />
        <text
          x="240.5"
          y="65"
          textAnchor="middle"
          fill={completedStep >= 3 ? "#fbf9f9" : "#0e0f0f"}
          fontFamily="monospace"
          fontSize="16"
          fontWeight="bold"
        >
          3/3
        </text>
      </g>
    </svg>
  );
};
