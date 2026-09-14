import React, { useMemo } from 'react';

interface MuseumExplorerBadgeProps {
  className?: string;
  size?: number | string;
}

/**
 * MuseumExplorerBadge:
 * An authentic museum honor seal / explorer insignia designed in the app's signature
 * neo-brutalist, Iranian modernist architectural visual style.
 *
 * It is stamped directly onto the parchment paper — without any outer card box or generic icon.
 */
export const MuseumExplorerBadge: React.FC<MuseumExplorerBadgeProps> = ({
  className = 'w-24 h-28 sm:w-28 sm:h-32',
  size,
}) => {
  // Generate mathematically perfect 24-scallop rosette star perimeter
  const rosettePath = useMemo(() => {
    const cx = 60;
    const cy = 48;
    const points = 24;
    let d = '';
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? 44 : 39.5;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      d += (i === 0 ? 'M ' : 'L ') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
    }
    return d + 'Z';
  }, []);

  return (
    <svg
      id="museum-explorer-seal-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 128"
      className={`${className} select-none drop-shadow-[2px_3px_0px_rgba(30,27,24,0.18)]`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="نشان رسمی کاشف موزه"
      role="img"
    >
      <defs>
        {/* Top curved arc path for Persian typography */}
        <path
          id="badge-text-arc-top"
          d="M 28,48 A 32,32 0 0,1 92,48"
          fill="none"
        />
        {/* Bottom curved arc path */}
        <path
          id="badge-text-arc-bottom"
          d="M 90,52 A 30,30 0 0,1 30,52"
          fill="none"
        />

        {/* Subtle radial paper-ink wash for authentic stamped document texture */}
        <radialGradient id="badge-gold-radial" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>

        <linearGradient id="badge-ribbon-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="badge-ribbon-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* 1. HANGING RIBBON TAILS (Directly on paper, under the seal) */}
      <g id="badge-ribbons">
        {/* Left Ribbon Tail with swallowtail notch */}
        <path
          d="M 44,70 L 32,118 L 48,107 L 62,118 L 56,70 Z"
          fill="url(#badge-ribbon-left)"
          stroke="#1e1b18"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Inner stitch accent */}
        <path
          d="M 40,76 L 36,110 L 48,102 L 56,110 L 52,76"
          fill="none"
          stroke="#fef3c7"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          opacity="0.85"
        />

        {/* Right Ribbon Tail with swallowtail notch */}
        <path
          d="M 64,70 L 58,118 L 72,107 L 88,118 L 76,70 Z"
          fill="url(#badge-ribbon-right)"
          stroke="#1e1b18"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Inner stitch accent */}
        <path
          d="M 68,76 L 64,110 L 72,102 L 84,110 L 80,76"
          fill="none"
          stroke="#fef3c7"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          opacity="0.85"
        />
      </g>

      {/* 2. ROSETTE MEDALLION BODY */}
      <g id="badge-medallion">
        {/* Outer 24-point Scalloped Star Perimeter */}
        <path
          d={rosettePath}
          fill="url(#badge-gold-radial)"
          stroke="#1e1b18"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Inner concentric ring with fine dark border */}
        <circle
          cx="60"
          cy="48"
          r="36.5"
          fill="#fef9ee"
          stroke="#1e1b18"
          strokeWidth="1.5"
        />

        {/* Dotted seal impression ring */}
        <circle
          cx="60"
          cy="48"
          r="33.8"
          fill="none"
          stroke="#b45309"
          strokeWidth="1.4"
          strokeDasharray="2.2 2"
        />

        {/* Core cream seal disc */}
        <circle
          cx="60"
          cy="48"
          r="28"
          fill="#ffffff"
          stroke="#1e1b18"
          strokeWidth="1.8"
        />

        {/* Top curved Persian inscription: نشان رسمی افتخار */}
        <text className="font-sans-custom">
          <textPath
            href="#badge-text-arc-top"
            startOffset="50%"
            textAnchor="middle"
            fill="#92400e"
            fontSize="5.8"
            fontWeight="900"
            letterSpacing="0.4"
          >
            ★ نـشـان رسـمـی افـتـخـار ★
          </textPath>
        </text>

        {/* 3. CENTER ARCHITECTURAL MOTIF: TEHRAN MoCA SKYLIGHTS */}
        <g id="badge-museum-architecture">
          {/* Symmetrical Laurel Leaves Flanking the Center */}
          <path
            d="M 38,44 C 36,41 37,36 40,35 C 41,38 39,42 38,44 Z"
            fill="#b45309"
          />
          <path
            d="M 39,37 C 38,34 40,30 43,30 C 44,33 41,36 39,37 Z"
            fill="#b45309"
          />
          <path
            d="M 43,32 C 43,29 46,26 49,27 C 49,30 46,32 43,32 Z"
            fill="#b45309"
          />

          <path
            d="M 82,44 C 84,41 83,36 80,35 C 79,38 81,42 82,44 Z"
            fill="#b45309"
          />
          <path
            d="M 81,37 C 82,34 80,30 77,30 C 76,33 79,36 81,37 Z"
            fill="#b45309"
          />
          <path
            d="M 77,32 C 77,29 74,26 71,27 C 71,30 74,32 77,32 Z"
            fill="#b45309"
          />

          {/* Left Skylight Tower (Kamran Diba modern architecture) */}
          <path
            d="M 48,46 C 48,37 55,32 59,32 L 59,46 Z"
            fill="#1e1b18"
            stroke="#1e1b18"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <path
            d="M 50,44 C 50,38 54,34 57.5,33.5 L 57.5,44 Z"
            fill="#f59e0b"
          />

          {/* Right Skylight Tower */}
          <path
            d="M 61,46 L 61,32 C 65,32 72,37 72,46 Z"
            fill="#1e1b18"
            stroke="#1e1b18"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <path
            d="M 62.5,44 L 62.5,33.5 C 66,34 70,38 70,44 Z"
            fill="#fbbf24"
          />

          {/* Golden 8-pointed star / shamseh above the towers */}
          <path
            d="M 60,24 L 61.3,27.5 L 65,28.8 L 61.3,30.1 L 60,33.6 L 58.7,30.1 L 55,28.8 L 58.7,27.5 Z"
            fill="#fbbf24"
            stroke="#1e1b18"
            strokeWidth="0.8"
          />
        </g>

        {/* 4. PROMINENT RIBBON BANNER ACROSS LOWER CENTER */}
        <g id="badge-banner">
          {/* Banner folded corner tails */}
          <path
            d="M 30,52 L 35,48 L 35,59 L 30,56 Z"
            fill="#92400e"
            stroke="#1e1b18"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M 90,52 L 85,48 L 85,59 L 90,56 Z"
            fill="#92400e"
            stroke="#1e1b18"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Main Dark Horizontal Plate */}
          <path
            d="M 33,48 Q 60,51 87,48 L 86,60 Q 60,63 34,60 Z"
            fill="#1e1b18"
            stroke="#1e1b18"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Bold Persian Calligraphic Title: کاشف موزه */}
          <text
            x="60"
            y="56"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fef08a"
            fontSize="8"
            fontWeight="900"
            letterSpacing="0.2"
            className="font-sans-custom"
          >
            کاشف موزه
          </text>
        </g>

        {/* 5. LOWER ARCH / CODE / LATIN ACCENT */}
        <text
          x="60"
          y="68"
          textAnchor="middle"
          fill="#92400e"
          fontSize="5.2"
          fontWeight="900"
          fontFamily="monospace"
          letterSpacing="0.8"
        >
          • TMoCA EXPLORER •
        </text>
      </g>
    </svg>
  );
};
