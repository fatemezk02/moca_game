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
  // 1. دختر با موی شینیون بالای سر (تصویر دوم)
  {
    id: 'female_01',
    gender: 'female',
    nameFa: 'سارا',
    titleFa: 'موی شینیون بالای سر',
    bgGradient: 'from-white to-white',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
  },
  // 2. دختر با چتری مواج و موی بلند (تصویر سوم سمت چپ)
  {
    id: 'female_02',
    gender: 'female',
    nameFa: 'مریم',
    titleFa: 'چتری مواج و موی بلند',
    bgGradient: 'from-white to-white',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
  },
  // 3. دختر با موهای پشت گوش و پیشانی باز (تصویر سوم سمت راست)
  {
    id: 'female_03',
    gender: 'female',
    nameFa: 'نیلوفر',
    titleFa: 'موی صاف پشت گوش',
    bgGradient: 'from-white to-white',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
  },
  // 4. پسر با موی کوتاه بغل زده و لبخند ملایم (تصویر اول سمت چپ)
  {
    id: 'male_01',
    gender: 'male',
    nameFa: 'آرش',
    titleFa: 'موی کوتاه بغل زده',
    bgGradient: 'from-white to-white',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
  },
  // 5. پسر با موهای پرپشت موج‌دار و لبخند باز (تصویر اول وسط)
  {
    id: 'male_02',
    gender: 'male',
    nameFa: 'کیان',
    titleFa: 'موی پرپشت موج‌دار',
    bgGradient: 'from-white to-white',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
  },
  // 6. پسر عینکی با موی شانه زده بالا (تصویر اول سمت راست)
  {
    id: 'male_03',
    gender: 'male',
    nameFa: 'کاوه',
    titleFa: 'عینک فریم مستطیلی',
    bgGradient: 'from-white to-white',
    borderColor: '#1e1b18',
    accentColor: '#1e1b18',
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
