/**
 * Avatar Configuration & Definitions
 * Stable IDs for 3 female and 3 male character avatars.
 * Supports easily replacing asset paths or using rich SVG vectors.
 */

export interface AvatarOption {
  id: string;
  gender: 'female' | 'male';
  nameFa: string;
  titleFa: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  imageSrc?: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  // 1. پسر با کلاه برعکس و پیراهن سفید روی تی‌شرت مشکی (تصویر ۱)
  {
    id: 'male_01',
    gender: 'male',
    nameFa: 'آرش',
    titleFa: 'کلاه برعکس',
    bgGradient: 'from-[#dbe896] to-[#dbe896]',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
    imageSrc: '/avatars/avatar_cap_male.svg',
  },
  // 2. دختر با موهای کوتاه باب، گوشواره و کت سفید (تصویر ۲)
  {
    id: 'female_03',
    gender: 'female',
    nameFa: 'نیلوفر',
    titleFa: 'موی کوتاه و گوشواره',
    bgGradient: 'from-[#dbe896] to-[#dbe896]',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
    imageSrc: '/avatars/avatar_bob_female.svg',
  },
  // 3. دختر با موی شینیون گوجه‌ای و هودی سفید (تصویر ۳)
  {
    id: 'female_01',
    gender: 'female',
    nameFa: 'سارا',
    titleFa: 'شینیون گوجه‌ای و هودی',
    bgGradient: 'from-[#dbe896] to-[#dbe896]',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
    imageSrc: '/avatars/avatar_bun_female.svg',
  },
  // 4. پسر عینکی با پلیور سفید یقه راه‌راه (تصویر ۴)
  {
    id: 'male_03',
    gender: 'male',
    nameFa: 'کاوه',
    titleFa: 'عینک فریم‌دار',
    bgGradient: 'from-[#dbe896] to-[#dbe896]',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
    imageSrc: '/avatars/avatar_glasses_male.svg',
  },
  // 5. پسر با موی پرپشت موج‌دار و تی‌شرت مشکی (تصویر ۵)
  {
    id: 'male_02',
    gender: 'male',
    nameFa: 'کیان',
    titleFa: 'موی پرپشت موج‌دار',
    bgGradient: 'from-[#dbe896] to-[#dbe896]',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
    imageSrc: '/avatars/avatar_wavy_male.svg',
  },
  // 6. دختر با موهای بلند موج‌دار و لباس یقه هفت (تصویر ۶)
  {
    id: 'female_02',
    gender: 'female',
    nameFa: 'مریم',
    titleFa: 'موی بلند موج‌دار',
    bgGradient: 'from-[#dbe896] to-[#dbe896]',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
    imageSrc: '/avatars/avatar_wavy_female.svg',
  },
];

export const DEFAULT_AVATAR_ID = 'female_01';

export function getAvatarById(avatarId?: string): AvatarOption {
  if (!avatarId) return AVATAR_OPTIONS[0];
  const norm = avatarId.toLowerCase().replace('-', '_');
  const found = AVATAR_OPTIONS.find((a) => a.id === norm);
  if (found) return found;

  // Fallback for aliases:
  if (norm === 'avatar_01' || norm === 'ponytail') return AVATAR_OPTIONS[0];
  if (norm === 'avatar_02' || norm === 'wavy') return AVATAR_OPTIONS[1];
  if (norm === 'avatar_03' || norm === 'goatee') return AVATAR_OPTIONS[2];
  if (norm === 'avatar_04' || norm === 'glasses') return AVATAR_OPTIONS[3];
  if (norm === 'avatar_05' || norm === 'hoodie') return AVATAR_OPTIONS[4];
  if (norm === 'avatar_06' || norm === 'bun') return AVATAR_OPTIONS[5];

  return AVATAR_OPTIONS[0];
}
