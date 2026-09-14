import React from 'react';

interface CharacterAvatarProps {
  id: string;
  className?: string;
}

/**
 * CharacterAvatarSVG:
 * Exact vector recreations of the 6 line-art cartoon personas from the user's reference images:
 * - 3 Males (Short side-part hair, Fluffy wavy hair, Combed hair with rectangular glasses)
 * - 3 Females (Top bun/chignon, Wavy scalloped bangs with shoulder hair, Smooth hair behind ears)
 * - Warm skin-tone fill (#fedac2) on face and ears
 * - Pure solid white background (#ffffff)
 * - Jet-black hair (#1e1b18) and clean inking matching the reference illustrations precisely
 */
export const CharacterAvatarSVG: React.FC<CharacterAvatarProps> = ({
  id,
  className = 'w-full h-full',
}) => {
  const normId = id.toLowerCase().replace('-', '_');

  // Skin tone fill
  const skinColor = '#fedac2';
  const inkColor = '#1e1b18';

  switch (normId) {
    // =========================================================================
    // 1. MALE 1: Boy with Short Neat Side-Part Hair & Gentle Smile (Image 1, Left)
    // =========================================================================
    case 'male_01':
    case 'avatar_03':
    case 'arash':
    case 'sidepart':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} select-none`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="clip-m1">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>

          <g clipPath="url(#clip-m1)">
            {/* Pure White Background */}
            <rect width="100" height="100" fill="#ffffff" />

            {/* Left Ear */}
            <ellipse cx="23" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 24,52 C 21,53.5 21,58 24.5,59.5 C 26,60 25.5,57 23.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Right Ear */}
            <ellipse cx="77" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 76,52 C 79,53.5 79,58 75.5,59.5 C 74,60 74.5,57 76.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Face & Rounded Chin */}
            <path
              d="M 26,46 C 26,72 34,82 50,82 C 66,82 74,72 74,46 C 74,32 26,32 26,46 Z"
              fill={skinColor}
              stroke={inkColor}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />

            {/* Short Neat Side-Part Hair */}
            <path
              d="M 23,49 C 21,28 32,18 50,18 C 68,18 78,28 77,49 C 76,43 73,38 69,36 C 65,34 58,35 48,32 C 38,29 30,33 27,41 C 25,44 24,47 23,49 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Eyebrows */}
            <line x1="36" y1="47" x2="45" y2="47" stroke={inkColor} strokeWidth="3.2" strokeLinecap="round" />
            <line x1="55" y1="47" x2="64" y2="47" stroke={inkColor} strokeWidth="3.2" strokeLinecap="round" />

            {/* Eyes */}
            <ellipse cx="40.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />
            <ellipse cx="59.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />

            {/* Nose Curve */}
            <path d="M 48.5,61 C 49.5,62.5 51.5,62.5 52.5,61" fill="none" stroke={inkColor} strokeWidth="2.4" strokeLinecap="round" />

            {/* Pleasant Closed Smile */}
            <path d="M 45,68 Q 50,72.5 55,68" fill="none" stroke={inkColor} strokeWidth="2.8" strokeLinecap="round" />
          </g>

          {/* Outer Border */}
          <circle cx="50" cy="50" r="48.5" fill="none" stroke={inkColor} strokeWidth="3" />
        </svg>
      );

    // =========================================================================
    // 2. MALE 2: Boy with Fluffy Wavy Hair & Open Smile (Image 1, Middle)
    // =========================================================================
    case 'male_02':
    case 'avatar_04':
    case 'kian':
    case 'fluffy':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} select-none`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="clip-m2">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>

          <g clipPath="url(#clip-m2)">
            {/* Pure White Background */}
            <rect width="100" height="100" fill="#ffffff" />

            {/* Left Ear */}
            <ellipse cx="23" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 24,52 C 21,53.5 21,58 24.5,59.5 C 26,60 25.5,57 23.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Right Ear */}
            <ellipse cx="77" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 76,52 C 79,53.5 79,58 75.5,59.5 C 74,60 74.5,57 76.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Face & Rounded Chin */}
            <path
              d="M 26,46 C 26,72 34,82 50,82 C 66,82 74,72 74,46 C 74,32 26,32 26,46 Z"
              fill={skinColor}
              stroke={inkColor}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />

            {/* Fluffy Wavy 3-Lobed Hair */}
            <path
              d="M 24,50 C 20,44 20,33 27,27 C 32,22 38,24 41,20 C 46,15 54,15 59,20 C 62,24 68,22 73,27 C 80,33 80,44 76,50 C 74,44 71,39 67,37 C 62,35 57,37 50,33 C 43,37 38,35 33,37 C 29,39 26,44 24,50 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Eyebrows */}
            <path d="M 36,48 Q 41,45.5 46,47.5" fill="none" stroke={inkColor} strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 54,47.5 Q 59,45.5 64,48" fill="none" stroke={inkColor} strokeWidth="2.8" strokeLinecap="round" />

            {/* Eyes */}
            <ellipse cx="40.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />
            <ellipse cx="59.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />

            {/* Nose Dot */}
            <ellipse cx="50" cy="61" rx="1.4" ry="1.4" fill={inkColor} />

            {/* Open Cheerful Smile */}
            <path
              d="M 44.5,67 Q 50,74 55.5,67 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M 45.5,67.8 Q 50,72 54.5,67.8 Z" fill="#ffffff" />
          </g>

          <circle cx="50" cy="50" r="48.5" fill="none" stroke={inkColor} strokeWidth="3" />
        </svg>
      );

    // =========================================================================
    // 3. MALE 3: Boy with Combed Hair & Rectangular Glasses (Image 1, Right)
    // =========================================================================
    case 'male_03':
    case 'avatar_05':
    case 'kaveh':
    case 'boss':
    case 'glasses':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} select-none`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="clip-m3">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>

          <g clipPath="url(#clip-m3)">
            {/* Pure White Background */}
            <rect width="100" height="100" fill="#ffffff" />

            {/* Left Ear */}
            <ellipse cx="23" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 24,52 C 21,53.5 21,58 24.5,59.5 C 26,60 25.5,57 23.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Right Ear */}
            <ellipse cx="77" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 76,52 C 79,53.5 79,58 75.5,59.5 C 74,60 74.5,57 76.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Face & Rounded Chin */}
            <path
              d="M 26,46 C 26,72 34,82 50,82 C 66,82 74,72 74,46 C 74,32 26,32 26,46 Z"
              fill={skinColor}
              stroke={inkColor}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />

            {/* Tall Combed Hair (Pompadour Volume) */}
            <path
              d="M 23,48 C 21,24 31,16 50,16 C 69,16 79,24 77,48 C 76,41 73,34 68,31 C 61,28 55,29 50,28 C 45,29 39,28 32,31 C 27,34 24,41 23,48 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Eyebrows */}
            <line x1="36" y1="46" x2="45" y2="46" stroke={inkColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="55" y1="46" x2="64" y2="46" stroke={inkColor} strokeWidth="3" strokeLinecap="round" />

            {/* Rectangular Glasses Frames */}
            {/* Bridge */}
            <line x1="47.5" y1="54" x2="52.5" y2="54" stroke={inkColor} strokeWidth="3" strokeLinecap="round" />
            {/* Left Frame */}
            <rect x="31.5" y="49" width="16" height="11.5" rx="3.5" fill="#ffffff" stroke={inkColor} strokeWidth="3" />
            {/* Right Frame */}
            <rect x="52.5" y="49" width="16" height="11.5" rx="3.5" fill="#ffffff" stroke={inkColor} strokeWidth="3" />

            {/* Eyes Centered in Glasses */}
            <ellipse cx="39.5" cy="54.8" rx="2.3" ry="3.5" fill={inkColor} />
            <ellipse cx="60.5" cy="54.8" rx="2.3" ry="3.5" fill={inkColor} />

            {/* Nose Dot */}
            <ellipse cx="50" cy="63" rx="1.3" ry="1.3" fill={inkColor} />

            {/* Open Happy Smile */}
            <ellipse cx="50" cy="69.5" rx="4.8" ry="3.2" fill={inkColor} />
            <ellipse cx="50" cy="69.5" rx="3.6" ry="1.9" fill="#ffffff" />
          </g>

          <circle cx="50" cy="50" r="48.5" fill="none" stroke={inkColor} strokeWidth="3" />
        </svg>
      );

    // =========================================================================
    // 4. FEMALE 1: Girl with Top Bun / Chignon & Open Smile (Image 2)
    // =========================================================================
    case 'female_01':
    case 'avatar_01':
    case 'sara':
    case 'bun':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} select-none`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="clip-f1">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>

          <g clipPath="url(#clip-f1)">
            {/* Pure White Background */}
            <rect width="100" height="100" fill="#ffffff" />

            {/* Top Bun sitting right on top */}
            <ellipse cx="50" cy="18" rx="11.5" ry="9" fill={inkColor} stroke={inkColor} strokeWidth="2" />

            {/* Left Ear */}
            <ellipse cx="23" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 24,52 C 21,53.5 21,58 24.5,59.5 C 26,60 25.5,57 23.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Right Ear */}
            <ellipse cx="77" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 76,52 C 79,53.5 79,58 75.5,59.5 C 74,60 74.5,57 76.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Face & Rounded Chin */}
            <path
              d="M 26,44 C 26,30 74,30 74,44 C 74,72 66,82 50,82 C 34,82 26,72 26,44 Z"
              fill={skinColor}
              stroke={inkColor}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />

            {/* Sleek Hair pulled up to bun with smooth hairline */}
            <path
              d="M 23,48 C 21,28 31,23 50,23 C 69,23 79,28 77,48 C 75,34 68,28 50,28 C 32,28 25,34 23,48 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Arched Eyebrows */}
            <path d="M 36,48 Q 41,45 46,47" fill="none" stroke={inkColor} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 54,47 Q 59,45 64,48" fill="none" stroke={inkColor} strokeWidth="2.6" strokeLinecap="round" />

            {/* Eyes */}
            <ellipse cx="40.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />
            <ellipse cx="59.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />

            {/* Nose Curve */}
            <path d="M 48.5,61 C 49.5,62.5 51.5,62.5 52.5,61" fill="none" stroke={inkColor} strokeWidth="2.4" strokeLinecap="round" />

            {/* Open Happy Smile */}
            <path
              d="M 44.5,67 Q 50,74 55.5,67 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M 45.5,67.8 Q 50,72 54.5,67.8 Z" fill="#ffffff" />
          </g>

          <circle cx="50" cy="50" r="48.5" fill="none" stroke={inkColor} strokeWidth="3" />
        </svg>
      );

    // =========================================================================
    // 5. FEMALE 2: Girl with Scalloped Bangs, Eyelashes & Shoulder Hair (Image 3, Left)
    // =========================================================================
    case 'female_02':
    case 'avatar_02':
    case 'maryam':
    case 'bangs':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} select-none`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="clip-f2">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>

          <g clipPath="url(#clip-f2)">
            {/* Pure White Background */}
            <rect width="100" height="100" fill="#ffffff" />

            {/* Shoulder-length Hair flowing behind face */}
            <path
              d="M 23,45 C 18,62 20,78 28,84 C 33,86 35,80 32,70 C 29,60 28,50 30,42 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M 77,45 C 82,62 80,78 72,84 C 67,86 65,80 68,70 C 71,60 72,50 70,42 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Left Ear */}
            <ellipse cx="23" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 24,52 C 21,53.5 21,58 24.5,59.5 C 26,60 25.5,57 23.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Right Ear */}
            <ellipse cx="77" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 76,52 C 79,53.5 79,58 75.5,59.5 C 74,60 74.5,57 76.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Face & Rounded Chin */}
            <path
              d="M 26,46 C 26,72 34,82 50,82 C 66,82 74,72 74,46 C 74,32 26,32 26,46 Z"
              fill={skinColor}
              stroke={inkColor}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />

            {/* Scalloped Wavy Fringe Bangs & Crown Hair */}
            <path
              d="M 24,48 C 21,26 31,18 50,18 C 69,18 79,26 76,48 C 74,44 71,43 67,42 C 63,45 59,45 55,42 C 51,45 49,45 45,42 C 41,45 37,45 33,42 C 29,43 26,44 24,48 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Arched Eyebrows */}
            <path d="M 36,47 Q 41,44.5 46,46.5" fill="none" stroke={inkColor} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 54,46.5 Q 59,44.5 64,47" fill="none" stroke={inkColor} strokeWidth="2.6" strokeLinecap="round" />

            {/* Eyes with Eyelashes */}
            <g id="eyes-f2">
              <ellipse cx="40.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />
              {/* Left Eyelash Flick */}
              <path d="M 42,51 L 45,49" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

              <ellipse cx="59.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />
              {/* Right Eyelash Flick */}
              <path d="M 61,51 L 64,49" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />
            </g>

            {/* Nose Curve */}
            <path d="M 48.5,61 C 49.5,62.5 51.5,62.5 52.5,61" fill="none" stroke={inkColor} strokeWidth="2.4" strokeLinecap="round" />

            {/* Open Happy Smile */}
            <path
              d="M 44.5,67 Q 50,74 55.5,67 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M 45.5,67.8 Q 50,72 54.5,67.8 Z" fill="#ffffff" />
          </g>

          <circle cx="50" cy="50" r="48.5" fill="none" stroke={inkColor} strokeWidth="3" />
        </svg>
      );

    // =========================================================================
    // 6. FEMALE 3: Girl with Long Hair Tucked Behind Ears & Clean Forehead (Image 3, Right)
    // =========================================================================
    case 'female_03':
    case 'avatar_06':
    case 'niloofar':
    case 'smooth':
    default:
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} select-none`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="clip-f3">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>

          <g clipPath="url(#clip-f3)">
            {/* Pure White Background */}
            <rect width="100" height="100" fill="#ffffff" />

            {/* Long Hair flowing down behind ears */}
            <path
              d="M 24,46 C 20,62 22,76 29,82 C 33,84 34,78 32,68 C 30,58 30,48 31,42 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M 76,46 C 80,62 78,76 71,82 C 67,84 66,78 68,68 C 70,58 70,48 69,42 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Left Ear */}
            <ellipse cx="23" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 24,52 C 21,53.5 21,58 24.5,59.5 C 26,60 25.5,57 23.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Right Ear */}
            <ellipse cx="77" cy="56" rx="5" ry="7.5" fill={skinColor} stroke={inkColor} strokeWidth="3" />
            <path d="M 76,52 C 79,53.5 79,58 75.5,59.5 C 74,60 74.5,57 76.5,57" fill="none" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />

            {/* Face & Rounded Chin */}
            <path
              d="M 26,44 C 26,30 74,30 74,44 C 74,72 66,82 50,82 C 34,82 26,72 26,44 Z"
              fill={skinColor}
              stroke={inkColor}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />

            {/* Smooth Hair Crown revealing clean forehead */}
            <path
              d="M 23,48 C 21,24 31,18 50,18 C 69,18 79,24 77,48 C 75,32 68,26 50,26 C 32,26 25,32 23,48 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Arched Eyebrows */}
            <path d="M 36,47 Q 41,44.5 46,46.5" fill="none" stroke={inkColor} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 54,46.5 Q 59,44.5 64,47" fill="none" stroke={inkColor} strokeWidth="2.6" strokeLinecap="round" />

            {/* Eyes */}
            <ellipse cx="40.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />
            <ellipse cx="59.5" cy="54" rx="2.4" ry="3.8" fill={inkColor} />

            {/* Nose Curve */}
            <path d="M 48.5,61 C 49.5,62.5 51.5,62.5 52.5,61" fill="none" stroke={inkColor} strokeWidth="2.4" strokeLinecap="round" />

            {/* Open Cheerful Smile */}
            <path
              d="M 44.5,67 Q 50,74 55.5,67 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M 45.5,67.8 Q 50,72 54.5,67.8 Z" fill="#ffffff" />
          </g>

          <circle cx="50" cy="50" r="48.5" fill="none" stroke={inkColor} strokeWidth="3" />
        </svg>
      );
  }
};
