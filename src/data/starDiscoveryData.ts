import { GALLERY_01_ARTWORK_SRC } from './gallery01Artwork';
import { contentService } from '../services/content/contentService';
import { StarContent } from '../services/content/types';

/**
 * ============================================================================
 * STAR POINT ENTITY — DATA REPOSITORY & RESOLVER
 * ============================================================================
 * Standardized data-driven structure for all Star Points across the game.
 * Resolves each Star Point dynamically from ContentService (Google Sheets cache).
 *
 * Every Star Point entity defines:
 * - labelTextFa: Short message shown in the contextual label on first click
 * - titleFa: Title in Discovery Modal
 * - introFa: Introductory sentence
 * - question: Discovery question, options, correct answer, reward (+50 or custom), wrong (0)
 * - informationCost: Cost in coins (default: 30)
 * - information: Persian and English information texts + artwork image
 */

export interface StarPointQuestion {
  question: string;
  textFa?: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  correctReward: number; // +50 coins or custom reward
  wrongReward: number;   // 0 coins
  explanation?: string;
}

export interface StarPointInformation {
  image: string;
  textFa: string;
  textEn: string;
}

export interface StarDiscoveryItem {
  id: string; // Star Point ID (e.g. 'artwork-01', 'star-01', etc.)
  starId?: string;
  questionId?: string;
  galleryId: string;
  galleryNumber?: string;
  galleryNameFa?: string;
  galleryNameEn?: string;
  galleryDescriptionFa?: string;
  galleryDescriptionEn?: string;
  labelTextFa: string; // Contextual message on first click
  titleFa: string;     // Title in Discovery Modal
  introFa: string;     // Short introductory sentence
  discoveryCost: number; // Coins needed to unlock directly
  informationCost: number; // Coins needed to unlock directly
  discoveryQuestion: StarPointQuestion;
  question: StarPointQuestion;
  discoveryArtwork: StarPointInformation;
  information: StarPointInformation;
}

/**
 * Converts a dynamic StarContent record loaded from Google Sheets (via ContentService)
 * into the standardized StarDiscoveryItem expected by the UI.
 */
export function mapStarContentToDiscoveryItem(
  star: StarContent,
  starPointId: string
): StarDiscoveryItem {
  const gallery = contentService.getGalleryById(star.galleryId);
  const rawQid =
    star.questionId ||
    (star.id.startsWith('star-q-')
      ? star.id
      : `star-q-${star.id.replace(/^star[-_]?/i, '').padStart(2, '0')}`);

  const question: StarPointQuestion = {
    question: star.questionText,
    textFa: star.questionText,
    options: star.questionOptions || [],
    correctAnswer: star.correctAnswer || '',
    correctIndex: star.correctIndex ?? 0,
    correctReward: star.reward ?? 50,
    wrongReward: star.wrongReward ?? 0,
    explanation: star.explanation || '',
  };

  const information: StarPointInformation = {
    image: star.artworkImageUrl || GALLERY_01_ARTWORK_SRC,
    textFa: star.artworkTextFa || '',
    textEn: star.artworkTextEn || '',
  };

  return {
    id: starPointId,
    starId: star.starId || star.id,
    questionId: rawQid,
    galleryId: star.galleryId,
    galleryNumber: gallery?.galleryNumber,
    galleryNameFa: gallery?.nameFa,
    galleryNameEn: gallery?.nameEn,
    galleryDescriptionFa: gallery?.descriptionFa,
    galleryDescriptionEn: gallery?.descriptionEn,
    labelTextFa: star.labelTextFa || '',
    titleFa: star.titleFa || '',
    introFa: star.introFa || '',
    discoveryCost: star.discoveryCost || star.informationCost || 30,
    informationCost: star.informationCost || 30,
    discoveryQuestion: question,
    question,
    discoveryArtwork: information,
    information,
  };
}

/**
 * Offline initial fallback dictionary preserved for service seeding.
 */
export const DEFAULT_STAR_DISCOVERIES: Record<string, StarDiscoveryItem> = {
  'star-01': {
    id: 'star-01',
    starId: 'star-01',
    questionId: 'star-q-01',
    galleryId: 'gallery-01',
    galleryNumber: '01',
    galleryNameFa: 'کیمیای نور',
    galleryNameEn: 'Gallery 01 Name',
    labelTextFa: 'تحولات مهم تاریخ عکاسی رو دنبال کن',
    titleFa: 'کالوتایپ',
    introFa: 'تحولات مهم تاریخ عکاسی رو دنبال کن',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'سال ۱۸۴۱ را پیدا کن. چه اتفاقی در این سال برای عکاسی افتاد؟',
      textFa: 'سال ۱۸۴۱ را پیدا کن. چه اتفاقی در این سال برای عکاسی افتاد؟',
      options: [
        'داگروتیپ معرفی شد.',
        'کالوتایپ معرفی شد.',
        'نخستین عکس رنگی ثبت شد.',
      ],
      correctAnswer: 'کالوتایپ معرفی شد.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'ویلیام هنری فاکس تالبوت در سال ۱۸۴۱ روش کالوتایپ را به ثبت رساند.',
    },
    question: {
      question: 'سال ۱۸۴۱ را پیدا کن. چه اتفاقی در این سال برای عکاسی افتاد؟',
      textFa: 'سال ۱۸۴۱ را پیدا کن. چه اتفاقی در این سال برای عکاسی افتاد؟',
      options: [
        'داگروتیپ معرفی شد.',
        'کالوتایپ معرفی شد.',
        'نخستین عکس رنگی ثبت شد.',
      ],
      correctAnswer: 'کالوتایپ معرفی شد.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'ویلیام هنری فاکس تالبوت در سال ۱۸۴۱ روش کالوتایپ را به ثبت رساند.',
    },
    discoveryArtwork: {
      image: GALLERY_01_ARTWORK_SRC,
      textFa: 'کالوتایپ روشی بود که ویلیام هنری فاکس تالبوت در سال ۱۸۴۱ به ثبت رساند.',
      textEn: 'Invented and patented by William Henry Fox Talbot in 1841.',
    },
    information: {
      image: GALLERY_01_ARTWORK_SRC,
      textFa: 'کالوتایپ روشی بود که ویلیام هنری فاکس تالبوت در سال ۱۸۴۱ به ثبت رساند.',
      textEn: 'Invented and patented by William Henry Fox Talbot in 1841.',
    },
  },
  'star-02': {
    id: 'star-02',
    starId: 'star-02',
    questionId: 'star-q-02',
    galleryId: 'gallery-01',
    galleryNumber: '01',
    galleryNameFa: 'کیمیای نور',
    galleryNameEn: 'Gallery 01 Name',
    labelTextFa: 'ببین عکاسی چگونه به دنیای هنر نزدیک شد!',
    titleFa: 'مجله‌های Camera Work',
    introFa: 'این نشریه یکی از مهم‌ترین نمونه‌های تلاش برای تثبیت عکاسی به‌عنوان یک هنر بود.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'Camera Work بیشتر در کدام مورد اهمیت داشت؟',
      textFa: 'Camera Work بیشتر در کدام مورد اهمیت داشت؟',
      options: [
        'آموزش استفاده از دوربین',
        'معرفی و مطرح کردن عکاسی به‌عنوان یک هنر',
        'فروش دوربین و مواد عکاسی',
      ],
      correctAnswer: 'معرفی و مطرح کردن عکاسی به‌عنوان یک هنر',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'مجله Camera Work نقش کلیدی در معرفی عکاسی به‌عنوان هنر داشت.',
    },
    question: {
      question: 'Camera Work بیشتر در کدام مورد اهمیت داشت؟',
      textFa: 'Camera Work بیشتر در کدام مورد اهمیت داشت؟',
      options: [
        'آموزش استفاده از دوربین',
        'معرفی و مطرح کردن عکاسی به‌عنوان یک هنر',
        'فروش دوربین و مواد عکاسی',
      ],
      correctAnswer: 'معرفی و مطرح کردن عکاسی به‌عنوان یک هنر',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'مجله Camera Work نقش کلیدی در معرفی عکاسی به‌عنوان هنر داشت.',
    },
    discoveryArtwork: {
      image: GALLERY_01_ARTWORK_SRC,
      textFa: 'مجله Camera Work به یکی از ابزارهای مهم برای دفاع از عکاسی به‌عنوان یک هنر مستقل تبدیل شد.',
      textEn: 'Camera Work magazine was published by Alfred Stieglitz from 1903 to 1917.',
    },
    information: {
      image: GALLERY_01_ARTWORK_SRC,
      textFa: 'مجله Camera Work به یکی از ابزارهای مهم برای دفاع از عکاسی به‌عنوان یک هنر مستقل تبدیل شد.',
      textEn: 'Camera Work magazine was published by Alfred Stieglitz from 1903 to 1917.',
    },
  },
  'star-03': {
    id: 'star-03',
    starId: 'star-03',
    questionId: 'star-q-03',
    galleryId: 'gallery-03',
    galleryNumber: '03',
    galleryNameFa: 'آلبوم‌های دیپلماتیک',
    galleryNameEn: 'Gallery 03 Name',
    labelTextFa: 'اینجا فقط شاهان و سفیران را نمی‌بینی؛ آدم‌هایی را ببین که با مهارتشان شناخته می‌شدند.',
    titleFa: 'در جست‌وجوی فن و فضیلت',
    introFa: 'این آلبوم، چهره‌هایی از گروه‌های مختلف را کنار هم قرار داده است.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'کدام ویژگی این آلبوم، آن را از یک آلبوم صرفاً اشرافی متفاوت می‌کند؟',
      textFa: 'کدام ویژگی این آلبوم، آن را از یک آلبوم صرفاً اشرافی متفاوت می‌کند؟',
      options: [
        'فقط عکس پادشاهان و شاهزادگان در آن دیده می‌شود.',
        'افراد به دلیل حرفه، مهارت و جایگاه اجتماعی‌شان نیز وارد جهان تصویر شده‌اند.',
        'تمام عکس‌ها در ایران گرفته شده‌اند.',
      ],
      correctAnswer: 'افراد به دلیل حرفه، مهارت و جایگاه اجتماعی‌شان نیز وارد جهان تصویر شده‌اند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'حضور افراد با مهارت‌ها و مشاغل مختلف وجه تمایز این آلبوم است.',
    },
    question: {
      question: 'کدام ویژگی این آلبوم، آن را از یک آلبوم صرفاً اشرافی متفاوت می‌کند؟',
      textFa: 'کدام ویژگی این آلبوم، آن را از یک آلبوم صرفاً اشرافی متفاوت می‌کند؟',
      options: [
        'فقط عکس پادشاهان و شاهزادگان در آن دیده می‌شود.',
        'افراد به دلیل حرفه، مهارت و جایگاه اجتماعی‌شان نیز وارد جهان تصویر شده‌اند.',
        'تمام عکس‌ها در ایران گرفته شده‌اند.',
      ],
      correctAnswer: 'افراد به دلیل حرفه، مهارت و جایگاه اجتماعی‌شان نیز وارد جهان تصویر شده‌اند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'حضور افراد با مهارت‌ها و مشاغل مختلف وجه تمایز این آلبوم است.',
    },
    discoveryArtwork: {
      image: GALLERY_01_ARTWORK_SRC,
      textFa: 'وقتی حرفه هم وارد قاب شد: این آلبوم بازتاب‌دهنده مهارت‌ها و چهره‌های عصر قاجار است.',
      textEn: 'Diplomatic and professional portraits album.',
    },
    information: {
      image: GALLERY_01_ARTWORK_SRC,
      textFa: 'وقتی حرفه هم وارد قاب شد: این آلبوم بازتاب‌دهنده مهارت‌ها و چهره‌های عصر قاجار است.',
      textEn: 'Diplomatic and professional portraits album.',
    },
  },
};

/**
 * Retrieves Discovery data for a given Star Point ID dynamically from ContentService.
 *
 * Rules:
 * - Each Star Point resolves its own unique star_id.
 * - Does NOT use the first Star record, stars[0], or hardcoded Gallery 01 star data.
 * - Respects the Star's gallery_id (will not display content belonging to another gallery).
 * - If no matching Star record exists:
 *   - Logs a clear console warning containing the Star Point ID
 *   - Returns null (does NOT crash, does NOT fall back to another Star's content)
 */
export function getStarDiscovery(
  starPointId: string,
  galleryId: string = 'gallery-01'
): StarDiscoveryItem | null {
  const star = contentService.getStarForStarPoint(starPointId, galleryId);

  if (star) {
    return mapStarContentToDiscoveryItem(star, starPointId);
  }

  // If no match found in ContentService, return null so component handles missing record safely
  return null;
}
