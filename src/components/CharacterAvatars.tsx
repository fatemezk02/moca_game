import React from 'react';

interface CharacterAvatarProps {
  id: string;
  className?: string;
}

/**
 * CharacterAvatarSVG:
 * High-fidelity vector representations matching the 6 cartoon line-art avatar images:
 * - male_01: Boy with white backwards cap & open white shirt over black inner t-shirt
 * - female_03: Girl with chic black bob, pearl earrings, white blazer
 * - female_01: Girl with topknot bun, side wisps, white hoodie with drawstrings
 * - male_03: Boy with glasses, parted hair, sweater with striped collar
 * - male_02: Boy with wavy fluffy dark hair, solid black crewneck t-shirt
 * - female_02: Girl with long cascading wavy dark hair, white v-neck shirt
 */
export const CharacterAvatarSVG: React.FC<CharacterAvatarProps> = ({
  id,
  className = 'w-full h-full',
}) => {
  const normId = (id || 'male_01').toLowerCase().replace('-', '_');

  switch (normId) {
    // =========================================================================
    // 1. MALE 01: Backwards Cap, Open Collar Shirt (Image 1)
    // =========================================================================
    case 'male_01':
    case 'cap':
    case 'arash':
      return (
        <svg viewBox="0 0 200 200" className={`${className} select-none`} xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#d96c60" />
          <path d="M 55,200 L 65,160 L 78,145 L 122,145 L 135,160 L 145,200 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 80,145 L 85,190 C 95,195 105,195 115,190 L 120,145 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="4" />
          <path d="M 78,145 L 60,178 L 86,170 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 122,145 L 140,178 L 114,170 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 60,178 L 52,200" stroke="#1e1b18" strokeWidth="4" strokeLinecap="round" />
          <path d="M 140,178 L 148,200" stroke="#1e1b18" strokeWidth="4" strokeLinecap="round" />
          <path d="M 80,115 L 80,148 C 90,154 110,154 120,148 L 120,115 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 56,88 C 44,88 44,115 56,115" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 52,98 C 50,102 54,106 56,104" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 144,88 C 156,88 156,115 144,115" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 148,98 C 150,102 146,106 144,104" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 56,85 C 56,128 72,143 100,143 C 128,143 144,128 144,85 C 144,45 128,45 100,45 C 72,45 56,45 56,85 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 54,78 C 54,92 56,102 65,98 C 65,88 67,82 72,82 C 78,82 79,88 88,85 C 93,83 98,86 104,85 C 112,85 118,82 128,82 C 133,82 135,88 135,98 C 144,102 146,92 146,78 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="2" />
          <path d="M 54,76 C 52,25 148,25 146,76 C 146,78 54,78 54,76 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 82,64 C 82,46 118,46 118,64 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="4" />
          <path d="M 83,57 L 117,57" stroke="#ffffff" strokeWidth="8" strokeLinecap="square" />
          <circle cx="90" cy="57" r="1.5" fill="#1e1b18" />
          <circle cx="96" cy="57" r="1.5" fill="#1e1b18" />
          <circle cx="104" cy="57" r="1.5" fill="#1e1b18" />
          <circle cx="110" cy="57" r="1.5" fill="#1e1b18" />
          <path d="M 82,57 L 118,57" fill="none" stroke="#1e1b18" strokeWidth="2.5" />
          <path d="M 52,75 C 48,72 152,72 148,75" fill="none" stroke="#1e1b18" strokeWidth="4" strokeLinecap="round" />
          <path d="M 68,85 Q 80,82 89,86" fill="none" stroke="#1e1b18" strokeWidth="4" strokeLinecap="round" />
          <path d="M 111,86 Q 120,82 132,85" fill="none" stroke="#1e1b18" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="79" cy="97" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="121" cy="97" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="100" cy="113" rx="1.5" ry="2" fill="#1e1b18" />
          <path d="M 94,124 L 106,124" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    // =========================================================================
    // 2. FEMALE 03: Short Bob, Earrings, White Blazer (Image 2)
    // =========================================================================
    case 'female_03':
    case 'bob':
    case 'niloofar':
      return (
        <svg viewBox="0 0 200 200" className={`${className} select-none`} xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#d96c60" />
          <path d="M 46,95 C 40,115 42,138 60,146 C 70,150 82,152 100,152 C 118,152 130,150 140,146 C 158,138 160,115 154,95 C 158,55 145,28 100,28 C 55,28 42,55 46,95 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 50,200 L 60,165 L 82,148 L 118,148 L 140,165 L 150,200 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 80,148 L 84,192 C 94,195 106,195 116,192 L 120,148 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="4" />
          <path d="M 82,148 L 62,175 L 84,185 L 82,200" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 118,148 L 138,175 L 116,185 L 118,200" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 82,118 L 82,150 C 92,155 108,155 118,150 L 118,118 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 58,92 C 48,92 48,114 58,114" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="58" cy="113" r="3.5" fill="#ffffff" stroke="#1e1b18" strokeWidth="2.5" />
          <path d="M 142,92 C 152,92 152,114 142,114" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="142" cy="113" r="3.5" fill="#ffffff" stroke="#1e1b18" strokeWidth="2.5" />
          <path d="M 58,90 C 58,130 74,144 100,144 C 126,144 142,130 142,90 C 142,45 126,45 100,45 C 74,45 58,45 58,90 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 46,90 C 44,52 60,30 100,30 C 140,30 156,52 154,90 C 154,102 148,114 144,118 C 144,95 138,82 130,80 C 118,78 114,84 102,80 C 92,76 88,84 76,82 C 68,80 62,94 56,118 C 52,114 46,102 46,90 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="2" />
          <path d="M 82,46 C 94,40 106,42 118,50" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M 88,56 C 96,52 104,54 112,60" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <path d="M 70,88 Q 80,84 88,88" fill="none" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 112,88 Q 120,84 130,88" fill="none" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="79" cy="98" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="121" cy="98" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="100" cy="113" rx="1.5" ry="2" fill="#1e1b18" />
          <path d="M 94,124 L 106,124" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    // =========================================================================
    // 3. FEMALE 01: Topknot Bun, Hoodie (Image 3)
    // =========================================================================
    case 'female_01':
    case 'bun':
    case 'sara':
      return (
        <svg viewBox="0 0 200 200" className={`${className} select-none`} xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#d96c60" />
          <ellipse cx="100" cy="30" rx="22" ry="20" fill="#1e1b18" stroke="#1e1b18" strokeWidth="4.5" />
          <path d="M 86,44 C 92,41 108,41 114,44 C 114,48 86,48 86,44 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="3" strokeLinejoin="round" />
          <path d="M 90,26 C 94,18 106,18 110,26" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 50,200 L 58,168 L 76,150 L 124,150 L 142,168 L 150,200 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 76,150 C 76,180 124,180 124,150" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 88,168 L 88,198" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="88" cy="198" r="2.5" fill="#1e1b18" />
          <path d="M 112,168 L 112,198" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="112" cy="198" r="2.5" fill="#1e1b18" />
          <path d="M 82,118 L 82,150 C 92,155 108,155 118,150 L 118,118 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 58,92 C 48,92 48,114 58,114" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 54,100 C 52,103 55,106 58,105" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 142,92 C 152,92 152,114 142,114" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 146,100 C 148,103 145,106 142,105" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 56,92 Q 48,110 50,126" fill="none" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 144,92 Q 152,110 150,126" fill="none" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 58,90 C 58,130 74,144 100,144 C 126,144 142,130 142,90 C 142,45 126,45 100,45 C 74,45 58,45 58,90 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 52,90 C 48,52 64,44 100,44 C 136,44 152,52 148,90 C 146,82 140,75 132,74 C 122,72 116,80 102,78 C 94,76 86,72 74,74 C 64,75 58,82 52,90 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="2" />
          <path d="M 80,56 C 92,50 108,50 120,56" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M 70,88 Q 80,84 88,88" fill="none" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 112,88 Q 120,84 130,88" fill="none" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="79" cy="98" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="121" cy="98" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="100" cy="113" rx="1.5" ry="2" fill="#1e1b18" />
          <path d="M 94,124 L 106,124" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    // =========================================================================
    // 4. MALE 03: Glasses & Sweater (Image 4)
    // =========================================================================
    case 'male_03':
    case 'glasses':
    case 'kaveh':
      return (
        <svg viewBox="0 0 200 200" className={`${className} select-none`} xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#d96c60" />
          <path d="M 50,200 L 60,165 L 78,148 L 122,148 L 140,165 L 150,200 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 78,148 C 78,168 122,168 122,148" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 85,152 L 85,160" stroke="#1e1b18" strokeWidth="2" strokeLinecap="round" />
          <path d="M 91,154 L 91,163" stroke="#1e1b18" strokeWidth="2" strokeLinecap="round" />
          <path d="M 97,155 L 97,164" stroke="#1e1b18" strokeWidth="2" strokeLinecap="round" />
          <path d="M 103,155 L 103,164" stroke="#1e1b18" strokeWidth="2" strokeLinecap="round" />
          <path d="M 109,154 L 109,163" stroke="#1e1b18" strokeWidth="2" strokeLinecap="round" />
          <path d="M 115,152 L 115,160" stroke="#1e1b18" strokeWidth="2" strokeLinecap="round" />
          <path d="M 82,118 L 82,150 C 92,155 108,155 118,150 L 118,118 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 58,90 C 46,90 46,115 58,115" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 54,98 C 52,102 55,106 58,105" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 142,90 C 154,90 154,115 142,115" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 146,98 C 148,102 145,106 142,105" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 58,88 C 58,130 74,144 100,144 C 126,144 142,130 142,88 C 142,45 126,45 100,45 C 74,45 58,45 58,88 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 54,88 C 48,46 64,30 100,30 C 136,30 152,46 146,88 C 144,78 136,68 126,66 C 114,64 108,72 96,70 C 86,68 76,64 64,68 C 58,70 55,78 54,88 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="2" />
          <path d="M 74,44 C 84,38 95,38 102,44" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M 112,42 C 122,38 132,42 138,48" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M 68,78 Q 80,74 90,78" fill="none" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 110,78 Q 120,74 132,78" fill="none" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <rect x="65" y="86" width="28" height="24" rx="9" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" />
          <rect x="107" y="86" width="28" height="24" rx="9" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" />
          <path d="M 93,96 C 96,93 104,93 107,96" fill="none" stroke="#1e1b18" strokeWidth="4" strokeLinecap="round" />
          <path d="M 65,96 L 56,95" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 135,96 L 144,95" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="79" cy="98" rx="4.5" ry="5.5" fill="#1e1b18" />
          <ellipse cx="121" cy="98" rx="4.5" ry="5.5" fill="#1e1b18" />
          <ellipse cx="100" cy="116" rx="1.5" ry="2" fill="#1e1b18" />
          <path d="M 94,126 L 106,126" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    // =========================================================================
    // 5. MALE 02: Wavy Hair & Black T-Shirt (Image 5)
    // =========================================================================
    case 'male_02':
    case 'wavy_male':
    case 'kian':
      return (
        <svg viewBox="0 0 200 200" className={`${className} select-none`} xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#d96c60" />
          <path d="M 50,200 L 60,165 L 78,148 L 122,148 L 140,165 L 150,200 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 78,148 C 78,165 122,165 122,148" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 82,118 L 82,150 C 92,155 108,155 118,150 L 118,118 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 58,90 C 46,90 46,115 58,115" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 54,98 C 52,102 55,106 58,105" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 142,90 C 154,90 154,115 142,115" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 146,98 C 148,102 145,106 142,105" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 58,88 C 58,130 74,144 100,144 C 126,144 142,130 142,88 C 142,45 126,45 100,45 C 74,45 58,45 58,88 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 52,88 C 42,70 44,45 62,32 C 78,20 122,20 138,32 C 156,45 158,70 148,88 C 146,78 138,68 126,64 C 114,60 108,68 96,65 C 84,62 76,60 64,65 C 58,68 55,76 52,88 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="2" />
          <path d="M 74,42 C 84,35 94,37 98,46" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M 108,38 C 118,35 128,40 130,48" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M 86,58 C 96,52 106,54 114,60" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <path d="M 68,85 Q 80,82 89,86" fill="none" stroke="#1e1b18" strokeWidth="4" strokeLinecap="round" />
          <path d="M 111,86 Q 120,82 132,85" fill="none" stroke="#1e1b18" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="79" cy="97" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="121" cy="97" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="100" cy="113" rx="1.5" ry="2" fill="#1e1b18" />
          <path d="M 94,124 L 106,124" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    // =========================================================================
    // 6. FEMALE 02: Long Wavy Hair, V-Neck (Image 6)
    // =========================================================================
    case 'female_02':
    case 'wavy_female':
    case 'maryam':
    default:
      return (
        <svg viewBox="0 0 200 200" className={`${className} select-none`} xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#d96c60" />
          <path d="M 44,95 C 32,120 30,150 42,185 C 46,195 56,200 68,200 C 66,175 62,150 64,135 C 64,115 64,100 64,95 C 64,48 76,28 100,28 C 124,28 136,48 136,95 C 136,100 136,115 136,135 C 138,150 134,175 132,200 C 144,200 154,195 158,185 C 170,150 168,120 156,95 C 160,50 145,28 100,28 C 55,28 40,50 44,95 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 50,200 L 60,165 L 78,148 L 122,148 L 140,165 L 150,200 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 80,148 L 100,180 L 120,148" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 82,118 L 82,150 C 92,155 108,155 118,150 L 118,118 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 58,92 C 48,92 48,114 58,114" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 54,100 C 52,103 55,106 58,105" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 142,92 C 152,92 152,114 142,114" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 146,100 C 148,103 145,106 142,105" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
          <path d="M 58,90 C 58,130 74,144 100,144 C 126,144 142,130 142,90 C 142,45 126,45 100,45 C 74,45 58,45 58,90 Z" fill="#ffffff" stroke="#1e1b18" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M 44,92 C 40,54 58,30 100,30 C 142,30 160,54 156,92 C 154,115 142,140 146,165 C 148,175 144,182 136,180 C 132,160 136,130 134,105 C 134,88 126,80 116,78 C 106,76 102,84 94,80 C 86,76 80,78 72,82 C 64,88 64,105 66,130 C 64,160 68,160 64,180 C 56,182 52,175 54,165 C 58,140 46,115 44,92 Z" fill="#1e1b18" stroke="#1e1b18" strokeWidth="2" />
          <path d="M 82,42 C 94,36 108,36 118,42" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M 88,52 C 98,46 106,48 112,54" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <path d="M 52,115 C 46,135 50,155 48,172" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <path d="M 148,115 C 154,135 150,155 152,172" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <path d="M 70,88 Q 80,84 88,88" fill="none" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 112,88 Q 120,84 130,88" fill="none" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="79" cy="98" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="121" cy="98" rx="5" ry="6" fill="#1e1b18" />
          <ellipse cx="100" cy="113" rx="1.5" ry="2" fill="#1e1b18" />
          <path d="M 94,124 L 106,124" stroke="#1e1b18" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
  }
};
