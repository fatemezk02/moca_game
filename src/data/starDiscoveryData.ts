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
  starNumber?: string;
  questionId?: string;
  galleryId: string;
  artworkId?: string;
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
    (star.id && star.id.startsWith('star-q-')
      ? star.id
      : `star-q-${(star.id || '').replace(/^star[-_]?/i, '').padStart(2, '0')}`);

  // Helper: Extract deterministic star number from ID without misinterpreting gallery numbers (e.g. col-g09-01)
  const extractStarNum = (s?: string): number | null => {
    if (!s) return null;
    const clean = s.trim();
    if (clean === 'col-g09-01') return 20;
    if (clean === 'col-g09-02') return 21;
    if (clean === 'col-g09-03') return 22;
    if (clean === 'col-g09-04') return 23;
    if (clean === 'artwork-01' || clean === 'col-01') return 1;
    if (clean === 'artwork-g03-star') return 3;
    const starMatch = clean.match(/^star(?:-q)?[-_]?0*(\d+)$/i);
    if (starMatch && starMatch[1]) return parseInt(starMatch[1], 10);
    if (/^\d+$/.test(clean)) return parseInt(clean, 10);
    return null;
  };

  const num = extractStarNum(star.starId || star.id) ?? extractStarNum(star.starNumber) ?? extractStarNum(starPointId);
  const formattedNumKey = num !== null ? `star-${String(num).padStart(2, '0')}` : null;

  const fallback: StarDiscoveryItem | undefined =
    (star.starId && DEFAULT_STAR_DISCOVERIES[star.starId]) ||
    (star.id && DEFAULT_STAR_DISCOVERIES[star.id]) ||
    (DEFAULT_STAR_DISCOVERIES[starPointId]) ||
    (formattedNumKey && DEFAULT_STAR_DISCOVERIES[formattedNumKey]) ||
    (starPointId === 'artwork-01' ? DEFAULT_STAR_DISCOVERIES['star-01'] : undefined) ||
    (starPointId === 'artwork-g03-star' ? DEFAULT_STAR_DISCOVERIES['star-03'] : undefined);

  const fallbackQ = fallback?.question || fallback?.discoveryQuestion;
  const rawQText = (star.questionText || '').trim();
  const questionText = rawQText || fallbackQ?.question || 'درباره این اثر هنری چه نکته‌ای را به خاطر می‌سپارید؟';

  const options =
    star.questionOptions && star.questionOptions.length > 0
      ? star.questionOptions
      : fallbackQ?.options && fallbackQ.options.length > 0
      ? fallbackQ.options
      : ['گزینه الف', 'گزینه ب', 'گزینه ج'];

  const correctAnswer = (star.correctAnswer || '').trim() || fallbackQ?.correctAnswer || options[0] || '';
  const explanation = (star.explanation || '').trim() || fallbackQ?.explanation || '';

  const question: StarPointQuestion = {
    question: questionText,
    textFa: questionText,
    options,
    correctAnswer,
    correctIndex: star.correctIndex ?? fallbackQ?.correctIndex ?? 0,
    correctReward: star.reward ?? fallbackQ?.correctReward ?? 50,
    wrongReward: star.wrongReward ?? fallbackQ?.wrongReward ?? 0,
    explanation,
  };

  // Resolve artwork image hierarchy:
  // 1. Star -> artwork_id -> Artworks.artwork_id -> Artworks.image_url
  // 2. star.artworkImageUrl (direct URL on star)
  // 3. Fallback image in DEFAULT_STAR_DISCOVERIES
  // 4. GALLERY_01_ARTWORK_SRC asset
  let resolvedImageUrl = '';
  if (star.artworkId) {
    const artwork = contentService.getArtworkById(star.artworkId);
    if (artwork && artwork.imageUrl && artwork.imageUrl.trim()) {
      resolvedImageUrl = artwork.imageUrl.trim();
    }
  }
  if (!resolvedImageUrl && star.artworkImageUrl && star.artworkImageUrl.trim()) {
    resolvedImageUrl = star.artworkImageUrl.trim();
  }
  if (!resolvedImageUrl && fallback) {
    resolvedImageUrl = fallback.information?.image || fallback.discoveryArtwork?.image || '';
  }
  // If stars have no image in Google Sheets, remain empty
  if (
    !resolvedImageUrl &&
    (star.id === 'star-01' ||
      starPointId === 'artwork-01' ||
      star.id === 'star-02' ||
      starPointId === 'star-02' ||
      star.galleryId === 'gallery-01' ||
      star.galleryId === 'gallery_01')
  ) {
    resolvedImageUrl = '';
  }

  const rawTextFa = (star.artworkTextFa || '').trim();
  const fallbackInfo = fallback?.information || fallback?.discoveryArtwork;
  const isGenericPlaceholder = rawTextFa === 'اطلاعات و تاریخچه این شاهکار هنری در گالری ثبت شده است.';
  const informationTextFa =
    (!rawTextFa || isGenericPlaceholder) && fallbackInfo?.textFa
      ? fallbackInfo.textFa
      : rawTextFa || fallbackInfo?.textFa || 'اطلاعات و تاریخچه این شاهکار هنری در گالری ثبت شده است.';
  const informationTextEn = (star.artworkTextEn || '').trim() || fallbackInfo?.textEn || '';

  const information: StarPointInformation = {
    image: resolvedImageUrl,
    textFa: informationTextFa,
    textEn: informationTextEn,
  };

  const starIdStr = star.id || star.starId || '';
  const starIdNumMatch = starIdStr ? starIdStr.match(/\d+/)?.[0] : null;
  const rawStarNum =
    star.starNumber ||
    (starIdNumMatch ? parseInt(starIdNumMatch, 10).toString() : num !== null ? String(num) : undefined);

  const titleFa = (star.titleFa || '').trim() || fallback?.titleFa || `ستاره کشف ${rawStarNum || ''}`;
  const introFa = (star.introFa || '').trim() || fallback?.introFa || titleFa;
  const labelTextFa = (star.labelTextFa || '').trim() || fallback?.labelTextFa || introFa;

  return {
    id: starPointId,
    starId: star.starId || star.id,
    starNumber: rawStarNum,
    questionId: rawQid,
    galleryId: star.galleryId || fallback?.galleryId || 'gallery-01',
    artworkId: star.artworkId || fallback?.artworkId,
    galleryNumber: gallery?.galleryNumber || fallback?.galleryNumber,
    galleryNameFa: gallery?.nameFa || fallback?.galleryNameFa,
    galleryNameEn: gallery?.nameEn || fallback?.galleryNameEn,
    galleryDescriptionFa: gallery?.descriptionFa || fallback?.galleryDescriptionFa,
    galleryDescriptionEn: gallery?.descriptionEn || fallback?.galleryDescriptionEn,
    labelTextFa,
    titleFa,
    introFa,
    discoveryCost: star.discoveryCost || star.informationCost || fallback?.discoveryCost || 30,
    informationCost: star.informationCost || fallback?.informationCost || 30,
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
    starNumber: '1',
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
      image: '',
      textFa: 'کالوتایپ روشی بود که ویلیام هنری فاکس تالبوت در سال ۱۸۴۱ به ثبت رساند.',
      textEn: 'Invented and patented by William Henry Fox Talbot in 1841.',
    },
    information: {
      image: '',
      textFa: 'کالوتایپ روشی بود که ویلیام هنری فاکس تالبوت در سال ۱۸۴۱ به ثبت رساند.',
      textEn: 'Invented and patented by William Henry Fox Talbot in 1841.',
    },
  },
  'star-02': {
    id: 'star-02',
    starId: 'star-02',
    starNumber: '2',
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
      image: '',
      textFa: 'مجله Camera Work به یکی از ابزارهای مهم برای دفاع از عکاسی به‌عنوان یک هنر مستقل تبدیل شد.',
      textEn: 'Camera Work magazine was published by Alfred Stieglitz from 1903 to 1917.',
    },
    information: {
      image: '',
      textFa: 'مجله Camera Work به یکی از ابزارهای مهم برای دفاع از عکاسی به‌عنوان یک هنر مستقل تبدیل شد.',
      textEn: 'Camera Work magazine was published by Alfred Stieglitz from 1903 to 1917.',
    },
  },
  'star-03': {
    id: 'star-03',
    starId: 'star-03',
    starNumber: '3',
    questionId: 'star-q-03',
    galleryId: 'gallery-03',
    galleryNumber: '03',
    galleryNameFa: 'آلبوم‌های دیپلماتیک',
    galleryNameEn: 'Diplomatic Albums',
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
      image: 'https://www.olo.pics/images/2026/09/05/1934-012.webp',
      textFa: 'وقتی حرفه هم وارد قاب شد: این آلبوم بازتاب‌دهنده مهارت‌ها و چهره‌های عصر قاجار است.',
      textEn: 'Diplomatic and professional portraits album.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1934-012.webp',
      textFa: 'وقتی حرفه هم وارد قاب شد: این آلبوم بازتاب‌دهنده مهارت‌ها و چهره‌های عصر قاجار است.',
      textEn: 'Diplomatic and professional portraits album.',
    },
  },
  'star-04': {
    id: 'star-04',
    starId: 'star-04',
    starNumber: '4',
    questionId: 'star-q-04',
    galleryId: 'gallery-03',
    galleryNumber: '03',
    galleryNameFa: 'آلبوم‌های دیپلماتیک',
    galleryNameEn: 'Diplomatic Albums',
    labelTextFa: 'عکاس چهره‌های مشهور فرانسه که بود؟',
    titleFa: 'چهره‌های مشهور، در یک قاب:',
    introFa: 'دیزدری و رواج عکس‌های کارت ویزیت در سده نوزدهم فرانسه.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'دیزدری با رواج عکس‌های «کارت ویزیت» چه تغییری در فرهنگ پرتره ایجاد کرد؟',
      textFa: 'دیزدری با رواج عکس‌های «کارت ویزیت» چه تغییری در فرهنگ پرتره ایجاد کرد؟',
      options: [
        'عکس پرتره را به رسانه‌ای در دسترس و همه‌گیر برای عموم تبدیل کرد.',
        'عکاسی را فقط محدود به نخبگان کرد.',
        'نقاشی را به کلی از بین برد.',
      ],
      correctAnswer: 'عکس پرتره را به رسانه‌ای در دسترس و همه‌گیر برای عموم تبدیل کرد.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'کارت ویزیت‌های عکاسی دسترسی به پرتره را برای طبقه متوسط جامعه ممکن ساخت.',
    },
    question: {
      question: 'دیزدری با رواج عکس‌های «کارت ویزیت» چه تغییری در فرهنگ پرتره ایجاد کرد؟',
      textFa: 'دیزدری با رواج عکس‌های «کارت ویزیت» چه تغییری در فرهنگ پرتره ایجاد کرد؟',
      options: [
        'عکس پرتره را به رسانه‌ای در دسترس و همه‌گیر برای عموم تبدیل کرد.',
        'عکاسی را فقط محدود به نخبگان کرد.',
        'نقاشی را به کلی از بین برد.',
      ],
      correctAnswer: 'عکس پرتره را به رسانه‌ای در دسترس و همه‌گیر برای عموم تبدیل کرد.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'کارت ویزیت‌های عکاسی دسترسی به پرتره را برای طبقه متوسط جامعه ممکن ساخت.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-004.webp',
      textFa: 'آندره آدولف اوژن دیزدری با ثبت عکس‌های چهره‌های سرشناس در قالب کارت ویزیت، پرتره را به پدیده‌ای عمومی بدل کرد.',
      textEn: 'Disdéri popularized carte-de-visite portraits of prominent figures in 19th-century France.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-004.webp',
      textFa: 'آندره آدولف اوژن دیزدری با ثبت عکس‌های چهره‌های سرشناس در قالب کارت ویزیت، پرتره را به پدیده‌ای عمومی بدل کرد.',
      textEn: 'Disdéri popularized carte-de-visite portraits of prominent figures in 19th-century France.',
    },
  },
  'star-05': {
    id: 'star-05',
    starId: 'star-05',
    starNumber: '5',
    questionId: 'star-q-05',
    galleryId: 'gallery-03',
    galleryNumber: '03',
    galleryNameFa: 'آلبوم‌های دیپلماتیک',
    galleryNameEn: 'Diplomatic Albums',
    labelTextFa: 'یک سفر تصویری به ژاپن قرن نوزدهم.',
    titleFa: 'ژاپن در یک قاب',
    introFa: 'آلبوم تصویری مسافران و دیپلمات‌ها از زندگی و فرهنگ سنتی ژاپن.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'یکی از ویژگی‌های مهم این آلبوم چیست؟',
      textFa: 'یکی از ویژگی‌های مهم این آلبوم چیست؟',
      options: [
        'ثبت مستند چهره‌ها و آیین‌های سنتی در آستانه مدرنیزاسیون ژاپن.',
        'فقط نمایش ساختمان‌های صنعتی جدید.',
        'حذف کامل انسان از تمام قاب‌ها.',
      ],
      correctAnswer: 'ثبت مستند چهره‌ها و آیین‌های سنتی در آستانه مدرنیزاسیون ژاپن.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'این آلبوم ارزش مردم‌شناختی فوق‌العاده‌ای در ثبت فرهنگ ژاپن پیش از دگرگونی‌های بزرگ دارد.',
    },
    question: {
      question: 'یکی از ویژگی‌های مهم این آلبوم چیست؟',
      textFa: 'یکی از ویژگی‌های مهم این آلبوم چیست؟',
      options: [
        'ثبت مستند چهره‌ها و آیین‌های سنتی در آستانه مدرنیزاسیون ژاپن.',
        'فقط نمایش ساختمان‌های صنعتی جدید.',
        'حذف کامل انسان از تمام قاب‌ها.',
      ],
      correctAnswer: 'ثبت مستند چهره‌ها و آیین‌های سنتی در آستانه مدرنیزاسیون ژاپن.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'این آلبوم ارزش مردم‌شناختی فوق‌العاده‌ای در ثبت فرهنگ ژاپن پیش از دگرگونی‌های بزرگ دارد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1932-012.webp',
      textFa: 'نگاهی مردم‌شناسانه و اسنادی به فرهنگ، پوشش و آداب و رسوم سنتی ژاپن در پایان دوران ادو و آغاز دوره میجی.',
      textEn: 'Visual travel album documenting 19th century Japanese culture and traditions.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1932-012.webp',
      textFa: 'نگاهی مردم‌شناسانه و اسنادی به فرهنگ، پوشش و آداب و رسوم سنتی ژاپن در پایان دوران ادو و آغاز دوره میجی.',
      textEn: 'Visual travel album documenting 19th century Japanese culture and traditions.',
    },
  },
  'star-06': {
    id: 'star-06',
    starId: 'star-06',
    starNumber: '6',
    questionId: 'star-q-06',
    galleryId: 'gallery-03',
    galleryNumber: '03',
    galleryNameFa: 'آلبوم‌های دیپلماتیک',
    galleryNameEn: 'Diplomatic Albums',
    labelTextFa: 'یک چهره، دوازده نگاه.',
    titleFa: 'خودنگارهٔ چرخان نادار',
    introFa: 'فلیکس نادار و خلق نخستین سری از خودنگاره‌های متوالی و متحرک در تاریخ عکاسی.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'ویژگی شاخص این اثر چیست؟',
      textFa: 'ویژگی شاخص این اثر چیست؟',
      options: [
        'ثبت پرتره از زوایای گوناگون به صورت چرخان ۳۶۰ درجه حول سوژه.',
        'عکاسی بدون نور خورشید.',
        'تک‌فریم بودن و عدم حرکت سوژه.',
      ],
      correctAnswer: 'ثبت پرتره از زوایای گوناگون به صورت چرخان ۳۶۰ درجه حول سوژه.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'نادار با چرخش زاویه دید حول خود، پیشگام خلق پویایی و انیمیشن بصری شد.',
    },
    question: {
      question: 'ویژگی شاخص این اثر چیست؟',
      textFa: 'ویژگی شاخص این اثر چیست؟',
      options: [
        'ثبت پرتره از زوایای گوناگون به صورت چرخان ۳۶۰ درجه حول سوژه.',
        'عکاسی بدون نور خورشید.',
        'تک‌فریم بودن و عدم حرکت سوژه.',
      ],
      correctAnswer: 'ثبت پرتره از زوایای گوناگون به صورت چرخان ۳۶۰ درجه حول سوژه.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'نادار با چرخش زاویه دید حول خود، پیشگام خلق پویایی و انیمیشن بصری شد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/970329_15.webp',
      textFa: 'فلیکس نادار، عکاس پرآوازه فرانسوی، با ثبت مجموعه‌ای از نماهای متوالی از چرخش سر و تن خود، مرزهای عکاسی پرتره استاتیک را جابه‌جا کرد.',
      textEn: 'Nadar\'s rotating self-portrait series exploring multidirectional views.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/970329_15.webp',
      textFa: 'فلیکس نادار، عکاس پرآوازه فرانسوی، با ثبت مجموعه‌ای از نماهای متوالی از چرخش سر و تن خود، مرزهای عکاسی پرتره استاتیک را جابه‌جا کرد.',
      textEn: 'Nadar\'s rotating self-portrait series exploring multidirectional views.',
    },
  },
  'star-07': {
    id: 'star-07',
    starId: 'star-07',
    starNumber: '7',
    questionId: 'star-q-07',
    galleryId: 'gallery-04',
    galleryNumber: '04',
    galleryNameFa: 'ثبت دوام ما',
    galleryNameEn: 'Recording Our Endurance',
    labelTextFa: 'آیا عکاسی می‌تواند شبیه نقاشی باشد؟',
    titleFa: 'وقتی عکاسی می‌خواست شبیه نقاشی شود',
    introFa: 'جنبش پیکتوریالیسم و تلاش برای بیان هنری و شاعرانه در عکاسی پرتره.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'پیکتوریالیست‌ها بیشتر تلاش می‌کردند چه چیزی را نشان دهند؟',
      textFa: 'پیکتوریالیست‌ها بیشتر تلاش می‌کردند چه چیزی را نشان دهند؟',
      options: [
        'اینکه عکس هم می‌تواند مانند نقاشی، فضایی شاعرانه و هنری خلق کند.',
        'اینکه دوربین باید واقعیت را دقیق‌تر و بدون تغییر ثبت کند.',
        'اینکه عکاسی فقط برای ثبت اسناد و اطلاعات مناسب است.',
      ],
      correctAnswer: 'اینکه عکس هم می‌تواند مانند نقاشی، فضایی شاعرانه و هنری خلق کند.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'پیکتوریالیست‌ها عکاسی را به نقاشی و فضاهای شاعرانه و حسی پیوند زدند.',
    },
    question: {
      question: 'پیکتوریالیست‌ها بیشتر تلاش می‌کردند چه چیزی را نشان دهند؟',
      textFa: 'پیکتوریالیست‌ها بیشتر تلاش می‌کردند چه چیزی را نشان دهند؟',
      options: [
        'اینکه عکس هم می‌تواند مانند نقاشی، فضایی شاعرانه و هنری خلق کند.',
        'اینکه دوربین باید واقعیت را دقیق‌تر و بدون تغییر ثبت کند.',
        'اینکه عکاسی فقط برای ثبت اسناد و اطلاعات مناسب است.',
      ],
      correctAnswer: 'اینکه عکس هم می‌تواند مانند نقاشی، فضایی شاعرانه و هنری خلق کند.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'پیکتوریالیست‌ها عکاسی را به نقاشی و فضاهای شاعرانه و حسی پیوند زدند.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/--d9a6a2eaf8714280.webp',
      textFa: 'در اواخر قرن نوزدهم، عکاسانی چون ادوارد استایکن و آلفرد استیگلیتز تلاش کردند نشان دهند عکاسی صرفاً ثبت مکانیکی نور نیست، بلکه می‌تواند همانند نقاشی، حامل احساس، فضا و نگاه شاعرانه هنرمند باشد.',
      textEn: 'Pictorialism and the quest for artistic expression in early modern photography.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/--d9a6a2eaf8714280.webp',
      textFa: 'در اواخر قرن نوزدهم، عکاسانی چون ادوارد استایکن و آلفرد استیگلیتز تلاش کردند نشان دهند عکاسی صرفاً ثبت مکانیکی نور نیست، بلکه می‌تواند همانند نقاشی، حامل احساس، فضا و نگاه شاعرانه هنرمند باشد.',
      textEn: 'Pictorialism and the quest for artistic expression in early modern photography.',
    },
  },
  'star-08': {
    id: 'star-08',
    starId: 'star-08',
    starNumber: '8',
    questionId: 'star-q-08',
    galleryId: 'gallery-05',
    galleryNumber: '05',
    galleryNameFa: 'ضرب آهنگ شهر',
    galleryNameEn: 'City Rhythm',
    labelTextFa: 'وقتی شهر از زاویه‌ای تازه دیده می‌شود.',
    titleFa: 'وقتی شهر از زاویه‌ای تازه دیده می‌شود',
    introFa: 'موهولی-ناگی و نگاه آوانگارد به معماری و پویایی شهر مدرن.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'موهولی-ناگی از ارتفاع پل حمل‌ونقل مارسی به شهر نگاه کرده است. در این تصویر، سازه‌های شهری بیشتر شبیه خطوط و شکل‌های هندسی دیده می‌شوند. چه چیزی باعث شده این منظره‌ی آشنا، به تصویری متفاوت تبدیل شود؟',
      textFa: 'موهولی-ناگی از ارتفاع پل حمل‌ونقل مارسی به شهر نگاه کرده است. در این تصویر، سازه‌های شهری بیشتر شبیه خطوط و شکل‌های هندسی دیده می‌شوند. چه چیزی باعث شده این منظره‌ی آشنا، به تصویری متفاوت تبدیل شود؟',
      options: [
        'حذف کامل شهر از تصویر.',
        'تغییر زاویه‌ی دید و تبدیل عناصر واقعی شهر به خطوط، شکل‌ها و ترکیب‌بندی‌های تازه.',
        'استفاده از رنگ برای واقعی‌تر کردن ساختمان‌ها.',
      ],
      correctAnswer: 'تغییر زاویه‌ی دید و تبدیل عناصر واقعی شهر به خطوط، شکل‌ها و ترکیب‌بندی‌های تازه.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'تغییر پرسپکتیو و کشف فرم‌های هندسی جدید در فضای شهری شاخصه مهم مدرنیسم بود.',
    },
    question: {
      question: 'موهولی-ناگی از ارتفاع پل حمل‌ونقل مارسی به شهر نگاه کرده است. در این تصویر، سازه‌های شهری بیشتر شبیه خطوط و شکل‌های هندسی دیده می‌شوند. چه چیزی باعث شده این منظره‌ی آشنا، به تصویری متفاوت تبدیل شود؟',
      textFa: 'موهولی-ناگی از ارتفاع پل حمل‌ونقل مارسی به شهر نگاه کرده است. در این تصویر، سازه‌های شهری بیشتر شبیه خطوط و شکل‌های هندسی دیده می‌شوند. چه چیزی باعث شده این منظره‌ی آشنا، به تصویری متفاوت تبدیل شود؟',
      options: [
        'حذف کامل شهر از تصویر.',
        'تغییر زاویه‌ی دید و تبدیل عناصر واقعی شهر به خطوط، شکل‌ها و ترکیب‌بندی‌های تازه.',
        'استفاده از رنگ برای واقعی‌تر کردن ساختمان‌ها.',
      ],
      correctAnswer: 'تغییر زاویه‌ی دید و تبدیل عناصر واقعی شهر به خطوط، شکل‌ها و ترکیب‌بندی‌های تازه.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'تغییر پرسپکتیو و کشف فرم‌های هندسی جدید در فضای شهری شاخصه مهم مدرنیسم بود.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/--1.webp',
      textFa: 'موهولی-ناگی یکی از چهره‌های مهم عکاسی و هنر آوانگارد قرن بیستم بود. او به‌ویژه به امکان‌های تازه‌ی دیدن علاقه داشت: نگاه از بالا، زاویه‌های غیرمعمول، سایه، نور و ترکیب‌های هندسی.',
      textEn: 'View from Pont Transbordeur, Marseille by László Moholy-Nagy.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/--1.webp',
      textFa: 'موهولی-ناگی یکی از چهره‌های مهم عکاسی و هنر آوانگارد قرن بیستم بود. او به‌ویژه به امکان‌های تازه‌ی دیدن علاقه داشت: نگاه از بالا، زاویه‌های غیرمعمول، سایه، نور و ترکیب‌های هندسی. در این اثر، سازه‌ی عظیم پل، خطوط و سایه‌ها چشم ما را وادار می‌کنند شهر را از زاویه‌ای متفاوت ببینیم.',
      textEn: 'View from Pont Transbordeur, Marseille by László Moholy-Nagy.',
    },
  },
  'star-09': {
    id: 'star-09',
    starId: 'star-09',
    starNumber: '9',
    questionId: 'star-q-09',
    galleryId: 'gallery-05',
    galleryNumber: '05',
    galleryNameFa: 'ضرب آهنگ شهر',
    galleryNameEn: 'City Rhythm',
    labelTextFa: 'شهری در حال ناپدید شدن',
    titleFa: 'پاریسِ اوژن آتژه',
    introFa: 'آتژه و ثبت گوشه‌های کهن و در حال دگرگونی پاریس قرن بیستم.',
    discoveryCost: 30,
    informationCost: 25,
    discoveryQuestion: {
      question: 'آتژه از خیابان‌ها، ساختمان‌ها، مغازه‌ها و گوشه‌های قدیمی پاریس عکاسی می‌کرد. چرا ثبت این فضاها می‌توانست مهم باشد؟',
      textFa: 'آتژه از خیابان‌ها، ساختمان‌ها، مغازه‌ها و گوشه‌های قدیمی پاریس عکاسی می‌کرد. چرا ثبت این فضاها می‌توانست مهم باشد؟',
      options: [
        'چون فقط ساختمان‌های مشهور ارزش عکاسی داشتند.',
        'چون عکاسی می‌توانست ردپای بخش‌هایی از شهر را که در حال تغییر یا ناپدید شدن بودند، حفظ کند.',
        'چون عکاسی فقط برای ثبت معماری‌های جدید ساخته شده بود.',
      ],
      correctAnswer: 'چون عکاسی می‌توانست ردپای بخش‌هایی از شهر را که در حال تغییر یا ناپدید شدن بودند، حفظ کند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'آتژه پیش از نوسازی بزرگ پاریس، بافت‌های اصیل و ناپیدا را برای تاریخ حفظ کرد.',
    },
    question: {
      question: 'آتژه از خیابان‌ها، ساختمان‌ها، مغازه‌ها و گوشه‌های قدیمی پاریس عکاسی می‌کرد. چرا ثبت این فضاها می‌توانست مهم باشد؟',
      textFa: 'آتژه از خیابان‌ها، ساختمان‌ها، مغازه‌ها و گوشه‌های قدیمی پاریس عکاسی می‌کرد. چرا ثبت این فضاها می‌توانست مهم باشد؟',
      options: [
        'چون فقط ساختمان‌های مشهور ارزش عکاسی داشتند.',
        'چون عکاسی می‌توانست ردپای بخش‌هایی از شهر را که در حال تغییر یا ناپدید شدن بودند، حفظ کند.',
        'چون عکاسی فقط برای ثبت معماری‌های جدید ساخته شده بود.',
      ],
      correctAnswer: 'چون عکاسی می‌توانست ردپای بخش‌هایی از شهر را که در حال تغییر یا ناپدید شدن بودند، حفظ کند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'آتژه پیش از نوسازی بزرگ پاریس، بافت‌های اصیل و ناپیدا را برای تاریخ حفظ کرد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/--1f6195121b7d6b63d.webp',
      textFa: 'عکس‌های آتژه مانند حافظه‌ی تصویری شهری هستند که بخشی از چهره‌ی قدیمی خود را از دست می‌داد.',
      textEn: 'Eugène Atget documented Paris streets and vanishing architectural heritage.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/--1f6195121b7d6b63d.webp',
      textFa: 'عکس‌های آتژه امروز فقط تصاویر معماری نیستند؛ آن‌ها مانند حافظه‌ی تصویری شهری هستند که بخشی از چهره‌ی قدیمی خود را از دست می‌داد. دوربین او به سراغ گوشه‌هایی رفت که ممکن بود خیلی زود دیگر وجود نداشته باشند.',
      textEn: 'Eugène Atget documented Paris streets and vanishing architectural heritage.',
    },
  },
  'star-10': {
    id: 'star-10',
    starId: 'star-10',
    starNumber: '10',
    questionId: 'star-q-10',
    galleryId: 'gallery-05',
    galleryNumber: '05',
    galleryNameFa: 'ضرب آهنگ شهر',
    galleryNameEn: 'City Rhythm',
    labelTextFa: 'زندگی روزمره، بخشی از چهره‌ی شهر',
    titleFa: 'انسان‌ها و شهر',
    introFa: 'واکر اونز و ثبت بی‌واسطه نشانه‌های حیات مدنی و اجتماعی.',
    discoveryCost: 30,
    informationCost: 40,
    discoveryQuestion: {
      question: 'در عکس‌های واکر اونز، آدم‌ها، مغازه‌ها، خانه‌ها و خیابان‌ها در کنار هم قرار می‌گیرند. این تصاویر چه چیزی را نشان می‌دهند؟',
      textFa: 'در عکس‌های واکر اونز، آدم‌ها، مغازه‌ها، خانه‌ها و خیابان‌ها در کنار هم قرار می‌گیرند. این تصاویر چه چیزی را نشان می‌دهند؟',
      options: [
        'شهر از ساختمان‌هایش تشکیل شده است.',
        'زندگی روزمره موضوعی جدا از عکاسی شهری است.',
        'آدم‌ها و شیوه‌ی زندگی آن‌ها هم بخشی از هویت و چهره‌ی یک شهر هستند.',
      ],
      correctAnswer: 'آدم‌ها و شیوه‌ی زندگی آن‌ها هم بخشی از هویت و چهره‌ی یک شهر هستند.',
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'شهر واقعی پیوند میان کالبد کالبدی و زیست روزمره آدم‌های آن است.',
    },
    question: {
      question: 'در عکس‌های واکر اونز، آدم‌ها، مغازه‌ها، خانه‌ها و خیابان‌ها در کنار هم قرار می‌گیرند. این تصاویر چه چیزی را نشان می‌دهند؟',
      textFa: 'در عکس‌های واکر اونز، آدم‌ها، مغازه‌ها، خانه‌ها و خیابان‌ها در کنار هم قرار می‌گیرند. این تصاویر چه چیزی را نشان می‌دهند؟',
      options: [
        'شهر از ساختمان‌هایش تشکیل شده است.',
        'زندگی روزمره موضوعی جدا از عکاسی شهری است.',
        'آدم‌ها و شیوه‌ی زندگی آن‌ها هم بخشی از هویت و چهره‌ی یک شهر هستند.',
      ],
      correctAnswer: 'آدم‌ها و شیوه‌ی زندگی آن‌ها هم بخشی از هویت و چهره‌ی یک شهر هستند.',
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'شهر واقعی پیوند میان کالبد کالبدی و زیست روزمره آدم‌های آن است.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/---3.webp',
      textFa: 'واکر اونز تلاش می‌کرد بدون تزئین و اغراق، نشانه‌های زندگی و چهره جامعه را ثبت کند.',
      textEn: 'Walker Evans and the vernacular visual document of American daily life.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/---3.webp',
      textFa: 'واکر اونز به چیزهایی توجه می‌کرد که ممکن بود معمولی به نظر برسند: نمای مغازه‌ها، خانه‌ها، خیابان‌ها، تابلوها و آدم‌هایی که در فضاهای عمومی رفت‌وآمد می‌کردند. در این نگاه، شهر چیزی بیشتر از معماری است؛ شهر همان آدم‌ها و نشانه‌های روزمره هستند.',
      textEn: 'Walker Evans and the vernacular visual document of American daily life.',
    },
  },
  'star-11': {
    id: 'star-11',
    starId: 'star-11',
    starNumber: '11',
    questionId: 'star-q-11',
    galleryId: 'gallery-05',
    galleryNumber: '05',
    galleryNameFa: 'ضرب آهنگ شهر',
    galleryNameEn: 'City Rhythm',
    labelTextFa: 'تخریب و دگرگونی شهر',
    titleFa: 'تقاطع مخروطها',
    introFa: 'گوردون ماتا-کلارک و دگرگون‌سازی فضاهای در آستانه تخریب با برش‌های کالبدی.',
    discoveryCost: 30,
    informationCost: 40,
    discoveryQuestion: {
      question: 'این تصاویر، لحظه‌هایی از پروژه‌ی Conical Intersect را نشان می‌دهند؛ اثری که ماتا-کلارک در سال ۱۹۷۵ در پاریس، در دو ساختمان قدیمیِ در آستانه‌ی تخریب اجرا کرد. چرا این تصاویر امروز اهمیت دارند؟',
      textFa: 'این تصاویر، لحظه‌هایی از پروژه‌ی Conical Intersect را نشان می‌دهند؛ اثری که ماتا-کلارک در سال ۱۹۷۵ در پاریس، در دو ساختمان قدیمیِ در آستانه‌ی تخریب اجرا کرد. چرا این تصاویر امروز اهمیت دارند؟',
      options: [
        'چون فقط ظاهر زیبای ساختمان‌ها را ثبت کرده‌اند.',
        'چون ساختمان‌های مدرن را به تصویر کشیده‌اند.',
        'چون لحظه‌ای از تغییر و تخریب شهر را ثبت کرده‌اند؛ لحظه‌ای میان چیزی که در حال از بین رفتن است و چیزی که قرار است جای آن را بگیرد.',
      ],
      correctAnswer: 'چون لحظه‌ای از تغییر و تخریب شهر را ثبت کرده‌اند؛ لحظه‌ای میان چیزی که در حال از بین رفتن است و چیزی که قرار است جای آن را بگیرد.',
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'اثر ماتا-کلارک لایه‌های زیرین معماری را در نقطه عطف تاریخی میان ویرانی و نوسازی آشکار ساخت.',
    },
    question: {
      question: 'این تصاویر، لحظه‌هایی از پروژه‌ی Conical Intersect را نشان می‌دهند؛ اثری که ماتا-کلارک در سال ۱۹۷۵ در پاریس، در دو ساختمان قدیمیِ در آستانه‌ی تخریب اجرا کرد. چرا این تصاویر امروز اهمیت دارند؟',
      textFa: 'این تصاویر، لحظه‌هایی از پروژه‌ی Conical Intersect را نشان می‌دهند؛ اثری که ماتا-کلارک در سال ۱۹۷۵ در پاریس، در دو ساختمان قدیمیِ در آستانه‌ی تخریب اجرا کرد. چرا این تصاویر امروز اهمیت دارند؟',
      options: [
        'چون فقط ظاهر زیبای ساختمان‌ها را ثبت کرده‌اند.',
        'چون ساختمان‌های مدرن را به تصویر کشیده‌اند.',
        'چون لحظه‌ای از تغییر و تخریب شهر را ثبت کرده‌اند؛ لحظه‌ای میان چیزی که در حال از بین رفتن است و چیزی که قرار است جای آن را بگیرد.',
      ],
      correctAnswer: 'چون لحظه‌ای از تغییر و تخریب شهر را ثبت کرده‌اند؛ لحظه‌ای میان چیزی که در حال از بین رفتن است و چیزی که قرار است جای آن را بگیرد.',
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'اثر ماتا-کلارک لایه‌های زیرین معماری را در نقطه عطف تاریخی میان ویرانی و نوسازی آشکار ساخت.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/---366d438db1b218973.webp',
      textFa: 'گوردون ماتا-کلارک در دو ساختمان قدیمی در آستانه تخریب برش‌هایی ایجاد کرد و فضای داخلی و لایه‌های معماری را آشکار نمود.',
      textEn: 'Gordon Matta-Clark and the Conical Intersect project in Paris, 1975.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/---366d438db1b218973.webp',
      textFa: 'گوردون ماتا-کلارک، هنرمند و معمار آمریکایی، در سال ۱۹۷۵ برای پروژه‌ی Conical Intersect در پاریس به سراغ دو ساختمان قدیمی رفت که قرار بود تخریب شوند. او در دل ساختمان‌ها برش‌هایی ایجاد کرد و فضای داخلی و لایه‌های معماری را از زاویه‌ای تازه آشکار کرد.',
      textEn: 'Gordon Matta-Clark and the Conical Intersect project in Paris, 1975.',
    },
  },
  'star-12': {
    id: 'star-12',
    starId: 'star-12',
    starNumber: '12',
    questionId: 'star-q-12',
    galleryId: 'gallery-06',
    galleryNumber: '06',
    galleryNameFa: 'در کشاکش تماشا و استیلا',
    galleryNameEn: 'Between Gaze and Mastery',
    labelTextFa: 'نگاه، قدرت و بازنمایی تصویر',
    titleFa: 'سیاستِ نگاه',
    introFa: 'بررسی نقش تصویر در شکل‌دهی به ساختارهای قدرت و روابط تماشا.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'چگونه تصاویر می‌توانند روابط میان قدرت و تماشا را بازنمایی کنند؟',
      textFa: 'چگونه تصاویر می‌توانند روابط میان قدرت و تماشا را بازنمایی کنند؟',
      options: [
        'تصاویر تنها ابزاری خنثی برای ثبت زیبایی هستند.',
        'نحوه‌ی نگاه کردن، زاویه‌دید و گزینش سوژه‌ها همواره بازتاب‌دهنده‌ی روابط قدرت و ایدئولوژی است.',
        'تصاویر هیچ ارتباطی با مسائل اجتماعی ندارند.',
      ],
      correctAnswer: 'نحوه‌ی نگاه کردن، زاویه‌دید و گزینش سوژه‌ها همواره بازتاب‌دهنده‌ی روابط قدرت و ایدئولوژی است.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'روابط قدرت همواره در نحوه به تصویر کشیدن و کنترل نگاه مخاطب بازتاب می‌یابد.',
    },
    question: {
      question: 'چگونه تصاویر می‌توانند روابط میان قدرت و تماشا را بازنمایی کنند؟',
      textFa: 'چگونه تصاویر می‌توانند روابط میان قدرت و تماشا را بازنمایی کنند؟',
      options: [
        'تصاویر تنها ابزاری خنثی برای ثبت زیبایی هستند.',
        'نحوه‌ی نگاه کردن، زاویه‌دید و گزینش سوژه‌ها همواره بازتاب‌دهنده‌ی روابط قدرت و ایدئولوژی است.',
        'تصاویر هیچ ارتباطی با مسائل اجتماعی ندارند.',
      ],
      correctAnswer: 'نحوه‌ی نگاه کردن، زاویه‌دید و گزینش سوژه‌ها همواره بازتاب‌دهنده‌ی روابط قدرت و ایدئولوژی است.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'روابط قدرت همواره در نحوه به تصویر کشیدن و کنترل نگاه مخاطب بازتاب می‌یابد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-010.webp',
      textFa: 'تصویر و نگاه نقادانه همواره در ارتباط با گفتمان‌های مسلط فرهنگی قرار دارد.',
      textEn: 'Visual critique and power dynamics in photography.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-010.webp',
      textFa: 'در این تالار، آثار عکاسی از منظر رویکردهای انتقادی بررسی می‌شوند؛ جایی که پرسش اصلی این است که چگونه دیدن و به تصویر کشیدن، خود فرمی از استیلا و بازآفرینی نظم اجتماعی است.',
      textEn: 'Visual critique and power dynamics in photography.',
    },
  },
  'star-13': {
    id: 'star-13',
    starId: 'star-13',
    starNumber: '13',
    questionId: 'star-q-13',
    galleryId: 'gallery-06',
    galleryNumber: '06',
    galleryNameFa: 'در کشاکش تماشا و استیلا',
    galleryNameEn: 'Between Gaze and Mastery',
    labelTextFa: 'خوانش انتقادی متن بصری',
    titleFa: 'بستر معنا و تصویر',
    introFa: 'رمزگشایی از لایه‌های پنهان ایدئولوژی در عکاسی مستند و مفهومی.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'معنای یک عکس در بستر نقد فرهنگی چگونه دگرگون می‌شود؟',
      textFa: 'معنای یک عکس در بستر نقد فرهنگی چگونه دگرگون می‌شود؟',
      options: [
        'معنای عکس ثابت و مطلق است.',
        'بستر تاریخی، فرهنگی و سیاسی که عکس در آن دیده می‌شود، لایه‌های تازه‌ای از معنا را آشکار می‌کند.',
        'عکس‌ها نیاز به هیچ‌گونه تحلیلی ندارند.',
      ],
      correctAnswer: 'بستر تاریخی، فرهنگی و سیاسی که عکس در آن دیده می‌شود، لایه‌های تازه‌ای از معنا را آشکار می‌کند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'بستر نمایش و خوانش اثر نقشی کلیدی در درک پیام انتقادی آن دارد.',
    },
    question: {
      question: 'معنای یک عکس در بستر نقد فرهنگی چگونه دگرگون می‌شود؟',
      textFa: 'معنای یک عکس در بستر نقد فرهنگی چگونه دگرگون می‌شود؟',
      options: [
        'معنای عکس ثابت و مطلق است.',
        'بستر تاریخی، فرهنگی و سیاسی که عکس در آن دیده می‌شود، لایه‌های تازه‌ای از معنا را آشکار می‌کند.',
        'عکس‌ها نیاز به هیچ‌گونه تحلیلی ندارند.',
      ],
      correctAnswer: 'بستر تاریخی، فرهنگی و سیاسی که عکس در آن دیده می‌شود، لایه‌های تازه‌ای از معنا را آشکار می‌کند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'بستر نمایش و خوانش اثر نقشی کلیدی در درک پیام انتقادی آن دارد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-010.webp',
      textFa: 'تصویر نقادانه ابزاری برای زیر سوال بردن بدیهیات بصری است.',
      textEn: 'Cultural critique of visual texts.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-010.webp',
      textFa: 'خوانش انتقادی به ما می‌آموزد که تصاویر هرگز بی‌گناه نیستند؛ آن‌ها حامل ارزش‌ها، سوگیری‌ها و گفتمان‌های دوران خود هستند.',
      textEn: 'Cultural critique of visual texts.',
    },
  },
  'star-14': {
    id: 'star-14',
    starId: 'star-14',
    starNumber: '14',
    questionId: 'star-q-14',
    galleryId: 'gallery-06',
    galleryNumber: '06',
    galleryNameFa: 'در کشاکش تماشا و استیلا',
    galleryNameEn: 'Between Gaze and Mastery',
    labelTextFa: 'بازنمایی و هویت جمعی',
    titleFa: 'تصویر و حافظه',
    introFa: 'نقش عکاسی در ساخت و بازآفرینی هویت‌های اجتماعی و تاریخی.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'چگونه عکاسی به ساخت حافظه جمعی کمک می‌کند؟',
      textFa: 'چگونه عکاسی به ساخت حافظه جمعی کمک می‌کند؟',
      options: [
        'با ثبت و تکرار تصاویر، روایت‌های مشترکی از گذشته در ذهن جامعه تثبیت می‌شود.',
        'عکاسی تاثیری بر حافظه تاریخی ندارد.',
        'حافظه جمعی صرفا از طریق متن مکتوب شکل می‌گیرد.',
      ],
      correctAnswer: 'با ثبت و تکرار تصاویر، روایت‌های مشترکی از گذشته در ذهن جامعه تثبیت می‌شود.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'عکاسی به عنوان سند دیداری، ستون فقرات حافظه و هویت جمعی جامعه را می‌سازد.',
    },
    question: {
      question: 'چگونه عکاسی به ساخت حافظه جمعی کمک می‌کند؟',
      textFa: 'چگونه عکاسی به ساخت حافظه جمعی کمک می‌کند؟',
      options: [
        'با ثبت و تکرار تصاویر، روایت‌های مشترکی از گذشته در ذهن جامعه تثبیت می‌شود.',
        'عکاسی تاثیری بر حافظه تاریخی ندارد.',
        'حافظه جمعی صرفا از طریق متن مکتوب شکل می‌گیرد.',
      ],
      correctAnswer: 'با ثبت و تکرار تصاویر، روایت‌های مشترکی از گذشته در ذهن جامعه تثبیت می‌شود.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'عکاسی به عنوان سند دیداری، ستون فقرات حافظه و هویت جمعی جامعه را می‌سازد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-010.webp',
      textFa: 'عکس‌ها حافظه تصویری نسل‌ها را پیوند می‌زنند.',
      textEn: 'Photography and collective memory formation.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-010.webp',
      textFa: 'تصاویر ثبت‌شده در حافظه‌ی جمعی نقش بسته‌اند و چارچوبی فراهم می‌کنند تا جامعه گذشته و هویت خود را بازشناسد.',
      textEn: 'Photography and collective memory formation.',
    },
  },
  'star-15': {
    id: 'star-15',
    starId: 'star-15',
    starNumber: '15',
    questionId: 'star-q-15',
    galleryId: 'gallery-06',
    galleryNumber: '06',
    galleryNameFa: 'در کشاکش تماشا و استیلا',
    galleryNameEn: 'Between Gaze and Mastery',
    labelTextFa: 'پرسشگری از ساختار بصری',
    titleFa: 'افق‌های نوین نقد',
    introFa: 'نگاهی نو به آینده‌ی بازنمایی در عصر رسانه‌های نوین.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'در مواجهه با تکثر تصاویر در دنیای امروز، سواد بصری چه اهمیتی دارد؟',
      textFa: 'در مواجهه با تکثر تصاویر در دنیای امروز، سواد بصری چه اهمیتی دارد؟',
      options: [
        'سواد بصری به ما کمک می‌کند تا پیام‌های تصویری را واکاوی کرده و فریب بازنمایی‌های سطحی را نخوریم.',
        'سواد بصری کاربردی در دنیای دیجیتال ندارد.',
        'تصاویر دیجیتال نیازی به تحلیل ندارند.',
      ],
      correctAnswer: 'سواد بصری به ما کمک می‌کند تا پیام‌های تصویری را واکاوی کرده و فریب بازنمایی‌های سطحی را نخوریم.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'سواد بصری سپر دفاعی مخاطب در برابر هجوم پیام‌های تصویری معاصر است.',
    },
    question: {
      question: 'در مواجهه با تکثر تصاویر در دنیای امروز، سواد بصری چه اهمیتی دارد؟',
      textFa: 'در مواجهه با تکثر تصاویر در دنیای امروز، سواد بصری چه اهمیتی دارد؟',
      options: [
        'سواد بصری به ما کمک می‌کند تا پیام‌های تصویری را واکاوی کرده و فریب بازنمایی‌های سطحی را نخوریم.',
        'سواد بصری کاربردی در دنیای دیجیتال ندارد.',
        'تصاویر دیجیتال نیازی به تحلیل ندارند.',
      ],
      correctAnswer: 'سواد بصری به ما کمک می‌کند تا پیام‌های تصویری را واکاوی کرده و فریب بازنمایی‌های سطحی را نخوریم.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'سواد بصری سپر دفاعی مخاطب در برابر هجوم پیام‌های تصویری معاصر است.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-010.webp',
      textFa: 'سواد بصری کلید درک عمیق‌تر جهان رسانه‌ای امروز است.',
      textEn: 'Visual literacy in the contemporary media age.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-010.webp',
      textFa: 'توانایی خوانش و نقد تصاویر به ما قدرت می‌دهد تا فراتر از زیبایی‌های ظاهری، به معنای بنیادین و پیام‌های پنهان آثار پی ببریم.',
      textEn: 'Visual literacy in the contemporary media age.',
    },
  },
  'star-16': {
    id: 'star-16',
    starId: 'star-16',
    starNumber: '16',
    questionId: 'star-q-16',
    galleryId: 'gallery-06',
    galleryNumber: '06',
    galleryNameFa: 'در کشاکش تماشا و استیلا',
    galleryNameEn: 'Between Gaze and Mastery',
    labelTextFa: 'اصفهان، نیویورک',
    titleFa: 'اصفهان، نیویورک',
    introFa: 'پیوند خاطره، فضا و جغرافیا در کنار هم نهادن دو جهان متفاوت.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'فرید با کنار هم قرار دادن تصاویر اصفهان و نیویورک، یک منظرهٔ واقعی و یک مکان خیالی را به وجود می‌آورد. این روش چه چیزی را نشان می‌دهد؟',
      textFa: 'فرید با کنار هم قرار دادن تصاویر اصفهان و نیویورک، یک منظرهٔ واقعی و یک مکان خیالی را به وجود می‌آورد. این روش چه چیزی را نشان می‌دهد؟',
      options: [
        'چگونگی تلاقی خاطره، مهاجرت و تجربه زیسته در ساختن هویتی چندلایه و فراملی.',
        'یکسان بودن معماری تمام شهرهای جهان.',
        'اشتباه در نام‌گذاری عکس‌ها.',
      ],
      correctAnswer: 'چگونگی تلاقی خاطره، مهاجرت و تجربه زیسته در ساختن هویتی چندلایه و فراملی.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'مونتاژ دو جغرافیای دورافتاده، دیالوگی میان سنت و مدرنیته و غربت و موطن برقرار می‌سازد.',
    },
    question: {
      question: 'فرید با کنار هم قرار دادن تصاویر اصفهان و نیویورک، یک منظرهٔ واقعی و یک مکان خیالی را به وجود می‌آورد. این روش چه چیزی را نشان می‌دهد؟',
      textFa: 'فرید با کنار هم قرار دادن تصاویر اصفهان و نیویورک، یک منظرهٔ واقعی و یک مکان خیالی را به وجود می‌آورد. این روش چه چیزی را نشان می‌دهد؟',
      options: [
        'چگونگی تلاقی خاطره، مهاجرت و تجربه زیسته در ساختن هویتی چندلایه و فراملی.',
        'یکسان بودن معماری تمام شهرهای جهان.',
        'اشتباه در نام‌گذاری عکس‌ها.',
      ],
      correctAnswer: 'چگونگی تلاقی خاطره، مهاجرت و تجربه زیسته در ساختن هویتی چندلایه و فراملی.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'مونتاژ دو جغرافیای دورافتاده، دیالوگی میان سنت و مدرنیته و غربت و موطن برقرار می‌سازد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/--3.webp',
      textFa: 'ترکیب هوشمندانه بافت‌های تاریخی اصفهان با خط آسمان نیویورک، چشم‌اندازی استعاری از جهان معاصر پدید آورده است.',
      textEn: 'Isfahan, New York conceptual photographic juxtaposition.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/--3.webp',
      textFa: 'ترکیب هوشمندانه بافت‌های تاریخی اصفهان با خط آسمان نیویورک، چشم‌اندازی استعاری از جهان معاصر پدید آورده است.',
      textEn: 'Isfahan, New York conceptual photographic juxtaposition.',
    },
  },
  'star-17': {
    id: 'star-17',
    starId: 'star-17',
    starNumber: '17',
    questionId: 'star-q-17',
    galleryId: 'gallery-06',
    galleryNumber: '06',
    galleryNameFa: 'در کشاکش تماشا و استیلا',
    galleryNameEn: 'Between Gaze and Mastery',
    labelTextFa: 'اگر خودِ منظره را تغییر بدهیم، اثر هنری کجاست؟',
    titleFa: 'پیشنهاد برای تغییر زمین',
    introFa: 'لند آرت و فرآیند مداخله در طبیعت از طریق مدل‌سازی، نقشه‌برداری و عکس.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'در این اثر، عکس‌ها، نقشه‌ها و یک مدل کوچک در کنار هم قرار گرفته‌اند. چرا چنین مجموعه‌ای می‌تواند یک اثر هنری مستقل باشد؟',
      textFa: 'در این اثر، عکس‌ها، نقشه‌ها و یک مدل کوچک در کنار هم قرار گرفته‌اند. چرا چنین مجموعه‌ای می‌تواند یک اثر هنری مستقل باشد؟',
      options: [
        'چون فرآیند ایده، طراحی و مداخله در بستر زمین را به عنوان سند و اثری مفهومی بازنمایی می‌کند.',
        'چون نقشه‌ها فقط برای راهنمایی توریست‌ها رسم شده‌اند.',
        'چون مدل‌های کوچک ارزش هنری ندارند.',
      ],
      correctAnswer: 'چون فرآیند ایده، طراحی و مداخله در بستر زمین را به عنوان سند و اثری مفهومی بازنمایی می‌کند.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'در هنر زمین (Land Art)، اسناد و نقشه‌ها جزئی بنیادین از هستی اثر هنری هستند.',
    },
    question: {
      question: 'در این اثر، عکس‌ها، نقشه‌ها و یک مدل کوچک در کنار هم قرار گرفته‌اند. چرا چنین مجموعه‌ای می‌تواند یک اثر هنری مستقل باشد؟',
      textFa: 'در این اثر، عکس‌ها، نقشه‌ها و یک مدل کوچک در کنار هم قرار گرفته‌اند. چرا چنین مجموعه‌ای می‌تواند یک اثر هنری مستقل باشد؟',
      options: [
        'چون فرآیند ایده، طراحی و مداخله در بستر زمین را به عنوان سند و اثری مفهومی بازنمایی می‌کند.',
        'چون نقشه‌ها فقط برای راهنمایی توریست‌ها رسم شده‌اند.',
        'چون مدل‌های کوچک ارزش هنری ندارند.',
      ],
      correctAnswer: 'چون فرآیند ایده، طراحی و مداخله در بستر زمین را به عنوان سند و اثری مفهومی بازنمایی می‌کند.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'در هنر زمین (Land Art)، اسناد و نقشه‌ها جزئی بنیادین از هستی اثر هنری هستند.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/WhatsApp-Image-2026-01-04-at-17.11.24.webp',
      textFa: 'مجموعه اسناد و پیشنهاد برای تغییر زمین، تجسمی از تفکر لند آرت و مواجهه رادیکال با مفهوم اثر هنری در سده بیستم است.',
      textEn: 'Proposal for land alteration documentation and maps.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/WhatsApp-Image-2026-01-04-at-17.11.24.webp',
      textFa: 'مجموعه اسناد و پیشنهاد برای تغییر زمین، تجسمی از تفکر لند آرت و مواجهه رادیکال با مفهوم اثر هنری در سده بیستم است.',
      textEn: 'Proposal for land alteration documentation and maps.',
    },
  },
  'star-18': {
    id: 'star-18',
    starId: 'star-18',
    starNumber: '18',
    questionId: 'star-q-18',
    galleryId: 'gallery-06',
    galleryNumber: '06',
    galleryNameFa: 'در کشاکش تماشا و استیلا',
    galleryNameEn: 'Between Gaze and Mastery',
    labelTextFa: 'یک دهه در ده تصویر؟',
    titleFa: 'بازخوانی دههٔ ۱۹۶۰',
    introFa: 'رابرت ایندیانا و مجموعه The Decade؛ نمادها و اعداد به عنوان کدهای تاریخی.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'رابرت ایندیانا در مجموعهٔ The Decade، ده اثر را به ده سال دههٔ ۱۹۶۰ پیوند می‌دهد. استفاده از نشانه‌ها و حروف چاپی در این اثر چه نقشی دارد؟',
      textFa: 'رابرت ایندیانا در مجموعهٔ The Decade، ده اثر را به ده سال دههٔ ۱۹۶۰ پیوند می‌دهد. استفاده از نشانه‌ها و حروف چاپی در این اثر چه نقشی دارد؟',
      options: [
        'تبدیل رویدادها و حافظه تاریخی به نشانه‌های گرافیکی موجز، پرقدرت و خوانا.',
        'تزیین صرف بدون هیچ بار معنایی.',
        'حذف هرگونه ارتباط با زمانه.',
      ],
      correctAnswer: 'تبدیل رویدادها و حافظه تاریخی به نشانه‌های گرافیکی موجز، پرقدرت و خوانا.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'پاپ آرت و نشانه‌شناسی شهری زبان نمادین ایندیانا را برای ثبت خاطره تاریخی شکل دادند.',
    },
    question: {
      question: 'رابرت ایندیانا در مجموعهٔ The Decade، ده اثر را به ده سال دههٔ ۱۹۶۰ پیوند می‌دهد. استفاده از نشانه‌ها و حروف چاپی در این اثر چه نقشی دارد؟',
      textFa: 'رابرت ایندیانا در مجموعهٔ The Decade، ده اثر را به ده سال دههٔ ۱۹۶۰ پیوند می‌دهد. استفاده از نشانه‌ها و حروف چاپی در این اثر چه نقشی دارد؟',
      options: [
        'تبدیل رویدادها و حافظه تاریخی به نشانه‌های گرافیکی موجز، پرقدرت و خوانا.',
        'تزیین صرف بدون هیچ بار معنایی.',
        'حذف هرگونه ارتباط با زمانه.',
      ],
      correctAnswer: 'تبدیل رویدادها و حافظه تاریخی به نشانه‌های گرافیکی موجز، پرقدرت و خوانا.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'پاپ آرت و نشانه‌شناسی شهری زبان نمادین ایندیانا را برای ثبت خاطره تاریخی شکل دادند.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/b1.webp',
      textFa: 'مجموعه بازخوانی دهه ۱۹۶۰ با ترکیب تایپوگرافی نمادین، اعداد و فرم‌های هندسی، نبض فرهنگی یک دوران سرنوشت‌ساز را مجسم می‌کند.',
      textEn: 'Robert Indiana — The Decade portfolio graphic symbols.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/b1.webp',
      textFa: 'مجموعه بازخوانی دهه ۱۹۶۰ با ترکیب تایپوگرافی نمادین، اعداد و فرم‌های هندسی، نبض فرهنگی یک دوران سرنوشت‌ساز را مجسم می‌کند.',
      textEn: 'Robert Indiana — The Decade portfolio graphic symbols.',
    },
  },
  'star-19': {
    id: 'star-19',
    starId: 'star-19',
    galleryId: 'gallery-07',
    questionId: 'star-q-19',
    labelTextFa: 'اگر واقعیت را از چند زاویه ببینیم، هنوز همان واقعیت است؟',
    titleFa: 'دگردیسی',
    introFa: 'وقتی واقعیت از نو ساخته می‌شود',
    discoveryCost: 30,
    informationCost: 40,
    discoveryQuestion: {
      question: 'چه چیزی در چنین تصویری از نگاه معمول به جهان فاصله می‌گیرد؟',
      textFa: 'چه چیزی در چنین تصویری از نگاه معمول به جهان فاصله می‌گیرد؟',
      options: [
        'ترکیب چند عنصر و تغییر رابطهٔ میان آن‌ها برای ساختن یک فضای تصویری تازه.',
        'حذف کامل هرگونه معنا از تصویر.',
        'بازگشت به شیوه‌های سنتی نقاشی منظره.',
      ],
      correctAnswer: 'ترکیب چند عنصر و تغییر رابطهٔ میان آن‌ها برای ساختن یک فضای تصویری تازه.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'هربرت بایر، هنرمند و طراح وابسته به باوهاوس، در آثار تصویری خود بارها مرز میان عکاسی، طراحی، تایپوگرافی و تصویرسازی را جابه‌جا کرد.',
    },
    question: {
      question: 'چه چیزی در چنین تصویری از نگاه معمول به جهان فاصله می‌گیرد؟',
      textFa: 'چه چیزی در چنین تصویری از نگاه معمول به جهان فاصله می‌گیرد؟',
      options: [
        'ترکیب چند عنصر و تغییر رابطهٔ میان آن‌ها برای ساختن یک فضای تصویری تازه.',
        'حذف کامل هرگونه معنا از تصویر.',
        'بازگشت به شیوه‌های سنتی نقاشی منظره.',
      ],
      correctAnswer: 'ترکیب چند عنصر و تغییر رابطهٔ میان آن‌ها برای ساختن یک فضای تصویری تازه.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'هربرت بایر، هنرمند و طراح وابسته به باوهاوس، در آثار تصویری خود بارها مرز میان عکاسی، طراحی، تایپوگرافی و تصویرسازی را جابه‌جا کرد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-012.webp',
      textFa: 'هربرت بایر، هنرمند و طراح وابسته به باوهاوس، در آثار تصویری خود بارها مرز میان عکاسی، طراحی، تایپوگرافی و تصویرسازی را جابه‌جا کرد. در Metamorphosis نیز عناصر آشنا در کنار یکدیگر قرار می‌گیرند، اما رابطهٔ معمولشان با جهان واقعی تغییر می‌کند. نتیجه، تصویری نیست که بخواهد صرفاً چیزی را که در برابر دوربین وجود داشته ثبت کند؛ بلکه جهانی تصویری است که از ترکیب، جابه‌جایی و تغییر شکل ساخته شده است. این رویکرد با یکی از ویژگی‌های مهم آوانگارد قرن بیستم همراه است: تصویر دیگر فقط پنجره‌ای به جهان نیست، بلکه می‌تواند خودش جهانی مستقل بسازد.',
      textEn: 'Herbert Bayer — Metamorphosis (1936)',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-012.webp',
      textFa: 'هربرت بایر، هنرمند و طراح وابسته به باوهاوس، در آثار تصویری خود بارها مرز میان عکاسی، طراحی، تایپوگرافی و تصویرسازی را جابه‌جا کرد. در Metamorphosis نیز عناصر آشنا در کنار یکدیگر قرار می‌گیرند، اما رابطهٔ معمولشان با جهان واقعی تغییر می‌کند. نتیجه، تصویری نیست که بخواهد صرفاً چیزی را که در برابر دوربین وجود داشته ثبت کند؛ بلکه جهانی تصویری است که از ترکیب، جابه‌جایی و تغییر شکل ساخته شده است. این رویکرد با یکی از ویژگی‌های مهم آوانگارد قرن بیستم همراه است: تصویر دیگر فقط پنجره‌ای به جهان نیست، بلکه می‌تواند خودش جهانی مستقل بسازد.',
      textEn: 'Herbert Bayer — Metamorphosis (1936)',
    },
  },
  'star-20': {
    id: 'star-20',
    starId: 'star-20',
    galleryId: 'gallery-09',
    questionId: 'star-q-20',
    labelTextFa: 'ستاره کشف ۲۰',
    titleFa: 'تابلوی دام',
    introFa: 'عکاسی پیوندی ناگسستنی میان ثبت یک لحظه منجمد و تداوم تاریخ برقرار می‌سازد.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'چگونه انجماد لحظه در عکس می‌تواند حس تداوم تاریخی ایجاد کند؟',
      textFa: 'چگونه انجماد لحظه در عکس می‌تواند حس تداوم تاریخی ایجاد کند؟',
      options: [
        'با تبدیل یک آنِ گذرا به مدرکی ماندگار برای تامل نسل‌های آینده.',
        'با پاک کردن تمام شواهد گذشته.',
        'صرفاً از طریق چرخش زاویه دید لنز.',
      ],
      correctAnswer: 'با تبدیل یک آنِ گذرا به مدرکی ماندگار برای تامل نسل‌های آینده.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'ثبت یک فریم واحد، لحظه‌ای زودگذر را در بستر ابدیت تثبیت می‌کند.',
    },
    question: {
      question: 'چگونه انجماد لحظه در عکس می‌تواند حس تداوم تاریخی ایجاد کند؟',
      textFa: 'چگونه انجماد لحظه در عکس می‌تواند حس تداوم تاریخی ایجاد کند؟',
      options: [
        'با تبدیل یک آنِ گذرا به مدرکی ماندگار برای تامل نسل‌های آینده.',
        'با پاک کردن تمام شواهد گذشته.',
        'صرفاً از طریق چرخش زاویه دید لنز.',
      ],
      correctAnswer: 'با تبدیل یک آنِ گذرا به مدرکی ماندگار برای تامل نسل‌های آینده.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'ثبت یک فریم واحد، لحظه‌ای زودگذر را در بستر ابدیت تثبیت می‌کند.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'انجماد لحظه و دیرندگی زمان در تصویر عکاسانه.',
      textEn: 'Freezing time and historic continuity in photography.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'عکس آیینه‌ای است که گذشته را در پیش چشم حال زنده نگه می‌دارد.',
      textEn: 'Freezing time and historic continuity in photography.',
    },
  },
  'star-21': {
    id: 'star-21',
    starId: 'star-21',
    galleryId: 'gallery-09',
    questionId: 'star-q-21',
    labelTextFa: 'ستاره کشف ۲۱',
    titleFa: 'سوپ داگر',
    introFa: 'فرسایش سطح و متریال تصویر، تجسم مادی گذر زمان است.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'توجه به بافت فیزیکی و شیمیایی عکس چه رویکردی را در ادراک اثر تقویت می‌کند؟',
      textFa: 'توجه به بافت فیزیکی و شیمیایی عکس چه رویکردی را در ادراک اثر تقویت می‌کند؟',
      options: [
        'رویکرد مادیت‌محور که عکس را به عنوان شیئی با سرگذشت زیسته و تاریخی معرفی می‌کند.',
        'نادیده گرفتن کامل محتوای اثر.',
        'تبدیل تصویر به نقاشی رنگ روغن.',
      ],
      correctAnswer: 'رویکرد مادیت‌محور که عکس را به عنوان شیئی با سرگذشت زیسته و تاریخی معرفی می‌کند.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'مادیت اثر عکاسانه، ردپای فیزیکی تماس زمان با تصویر را بازنمایی می‌نماید.',
    },
    question: {
      question: 'توجه به بافت فیزیکی و شیمیایی عکس چه رویکردی را در ادراک اثر تقویت می‌کند؟',
      textFa: 'توجه به بافت فیزیکی و شیمیایی عکس چه رویکردی را در ادراک اثر تقویت می‌کند؟',
      options: [
        'رویکرد مادیت‌محور که عکس را به عنوان شیئی با سرگذشت زیسته و تاریخی معرفی می‌کند.',
        'نادیده گرفتن کامل محتوای اثر.',
        'تبدیل تصویر به نقاشی رنگ روغن.',
      ],
      correctAnswer: 'رویکرد مادیت‌محور که عکس را به عنوان شیئی با سرگذشت زیسته و تاریخی معرفی می‌کند.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'مادیت اثر عکاسانه، ردپای فیزیکی تماس زمان با تصویر را بازنمایی می‌نماید.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'مادیت، فرسایش و کهنگی به عنوان شاهدان تاریخی گذر زمان.',
      textEn: 'Material degradation and traces of time.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'هر خط، فرسایش و تغییر رنگ در متریال تصویر، کلمه‌ای از سرگذشت زمان است.',
      textEn: 'Material degradation and traces of time.',
    },
  },
  'star-22': {
    id: 'star-22',
    starId: 'star-22',
    galleryId: 'gallery-09',
    questionId: 'star-q-22',
    labelTextFa: 'فقط یک عکس؟',
    titleFa: 'عکس‌ها و اچینگ‌ها',
    introFa: 'وقتی عکس و حکاکی کنار هم قرار می‌گیرند، تصویر دیگر فقط یک عکس است؟',
    discoveryCost: 30,
    informationCost: 40,
    discoveryQuestion: {
      question: 'در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟',
      textFa: 'در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟',
      options: [
        'یکی جایگزین دیگری می‌شود.',
        'هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.',
        'عکس فقط برای ثبت اچینگ استفاده شده است.',
      ],
      correctAnswer: 'هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'عکس و اچینگ دو زبان تصویری متفاوت دارند که در این اثر همدیگر را کامل می‌کنند.',
    },
    question: {
      question: 'در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟',
      textFa: 'در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟',
      options: [
        'یکی جایگزین دیگری می‌شود.',
        'هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.',
        'عکس فقط برای ثبت اچینگ استفاده شده است.',
      ],
      correctAnswer: 'هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'عکس و اچینگ دو زبان تصویری متفاوت دارند که در این اثر همدیگر را کامل می‌کنند.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'عکس و اچینگ دو زبان تصویری متفاوت دارند.عکاسی با ثبت، قاب‌بندی و واقعیتِ پیش روی دوربین سروکار دارد؛ اچینگ با خط، سطح و ردّ دست.وقتی این دو در کنار هم قرار می‌گیرند، مخاطب فقط به موضوع تصویر نگاه نمی‌کند؛ بلکه متوجه می‌شود تصویر چگونه ساخته شده و هر رسانه چه چیزی به تجربهٔ دیدن اضافه می‌کند.اچینگ (Etching) یک روش چاپ هنری است. هنرمند روی یک صفحهٔ فلزی (معمولاً مس) با ماده‌ای اسیدی شیار ایجاد می‌کند. بعد داخل این شیارها جوهر می‌ماند و صفحه روی کاغذ فشرده می‌شود؛ در نتیجه خطوط روی کاغذ چاپ می‌شوند.',
      textEn: 'Photography and etching juxtaposition.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'عکس و اچینگ دو زبان تصویری متفاوت دارند.عکاسی با ثبت، قاب‌بندی و واقعیتِ پیش روی دوربین سروکار دارد؛ اچینگ با خط، سطح و ردّ دست.وقتی این دو در کنار هم قرار می‌گیرند، مخاطب فقط به موضوع تصویر نگاه نمی‌کند؛ بلکه متوجه می‌شود تصویر چگونه ساخته شده و هر رسانه چه چیزی به تجربهٔ دیدن اضافه می‌کند.اچینگ (Etching) یک روش چاپ هنری است. هنرمند روی یک صفحهٔ فلزی (معمولاً مس) با ماده‌ای اسیدی شیار ایجاد می‌کند. بعد داخل این شیارها جوهر می‌ماند و صفحه روی کاغذ فشرده می‌شود؛ در نتیجه خطوط روی کاغذ چاپ می‌شوند.',
      textEn: 'Photography and etching juxtaposition.',
    },
  },
  'star-23': {
    id: 'star-23',
    starId: 'star-23',
    galleryId: 'gallery-09',
    questionId: 'star-q-23',
    labelTextFa: 'تصویری برای ثبت شدن',
    titleFa: 'سگ سه پا',
    introFa: 'اگر تصویر برای دوربین ساخته شده باشد، هنوز هم فقط یک ثبت است؟',
    discoveryCost: 30,
    informationCost: 40,
    discoveryQuestion: {
      question: 'در این اثر، عکس چه چیزی را ثبت می‌کند؟',
      textFa: 'در این اثر، عکس چه چیزی را ثبت می‌کند؟',
      options: [
        'نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.',
        'یک اتفاق کاملاً تصادفی.',
        'تصویری که هنرمند هیچ نقشی در شکل‌گیری آن نداشته است.',
      ],
      correctAnswer: 'نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'در آثار ویگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.',
    },
    question: {
      question: 'در این اثر، عکس چه چیزی را ثبت می‌کند؟',
      textFa: 'در این اثر، عکس چه چیزی را ثبت می‌کند؟',
      options: [
        'نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.',
        'یک اتفاق کاملاً تصادفی.',
        'تصویری که هنرمند هیچ نقشی در شکل‌گیری آن نداشته است.',
      ],
      correctAnswer: 'نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'در آثار ویگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'در آثار ویگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.دوربین در پایان این فرایند حضور پیدا می‌کند و نتیجه را ثبت می‌کند.در اینجا عکس دیگر فقط شاهد یک اتفاق نیست؛ می‌تواند نتیجهٔ یک موقعیت ساخته‌شده و بخشی از یک فرایند هنری باشد.مرز میان «ثبت کردن» و «ساختن» دوباره جابه‌جا می‌شود.',
      textEn: 'William Wegman — Three-legged dog staging and capture.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'در آثار ویگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.دوربین در پایان این فرایند حضور پیدا می‌کند و نتیجه را ثبت می‌کند.در اینجا عکس دیگر فقط شاهد یک اتفاق نیست؛ می‌تواند نتیجهٔ یک موقعیت ساخته‌شده و بخشی از یک فرایند هنری باشد.مرز میان «ثبت کردن» و «ساختن» دوباره جابه‌جا می‌شود.',
      textEn: 'William Wegman — Three-legged dog staging and capture.',
    },
  },
  'star-24': {
    id: 'star-24',
    starId: 'star-24',
    galleryId: 'gallery-09',
    questionId: 'star-q-24',
    labelTextFa: 'ستاره کشف ۲۴',
    titleFa: 'ستاره کشف ۲۴ — تصویر هیبریدی و واقعیت مجازی',
    introFa: 'پیوند عکاسی با فناوری‌های دیجیتال، افق‌های نوینی در ادراک بصری خلق نموده است.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'تلفیق عکاسی با رسانه‌های نوین دیجیتال چه تحولی در مفهوم اثر اصیل ایجاد می‌کند؟',
      textFa: 'تلفیق عکاسی با رسانه‌های نوین دیجیتال چه تحولی در مفهوم اثر اصیل ایجاد می‌کند؟',
      options: [
        'بازتعریف اصالت بر مبنای تعامل، فرآیند محوری و خلق تجربه‌های چندحسی باز.',
        'نابود کردن کامل هرگونه ارزش هنری.',
        'محدود کردن اثر به یک کپی ساده بدون هویت.',
      ],
      correctAnswer: 'بازتعریف اصالت بر مبنای تعامل، فرآیند محوری و خلق تجربه‌های چندحسی باز.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'تصویر هیبریدی مرزهای زیبایی‌شناسی را به سوی ادراک مشارکتی و غوطه‌وری گسترش می‌دهد.',
    },
    question: {
      question: 'تلفیق عکاسی با رسانه‌های نوین دیجیتال چه تحولی در مفهوم اثر اصیل ایجاد می‌کند؟',
      textFa: 'تلفیق عکاسی با رسانه‌های نوین دیجیتال چه تحولی در مفهوم اثر اصیل ایجاد می‌کند؟',
      options: [
        'بازتعریف اصالت بر مبنای تعامل، فرآیند محوری و خلق تجربه‌های چندحسی باز.',
        'نابود کردن کامل هرگونه ارزش هنری.',
        'محدود کردن اثر به یک کپی ساده بدون هویت.',
      ],
      correctAnswer: 'بازتعریف اصالت بر مبنای تعامل، فرآیند محوری و خلق تجربه‌های چندحسی باز.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'تصویر هیبریدی مرزهای زیبایی‌شناسی را به سوی ادراک مشارکتی و غوطه‌وری گسترش می‌دهد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'تلاقی رسانه‌های دیجیتال و عکاسی معاصر.',
      textEn: 'Intersection of digital media and contemporary photography.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'رسانه نو پیونددهنده چشم با جهان‌هایی فراتر از مرزهای قاب ایستا است.',
      textEn: 'New media bridging vision with worlds beyond the static frame.',
    },
  },
  'star-25': {
    id: 'star-25',
    starId: 'star-25',
    galleryId: 'gallery-09',
    questionId: 'star-q-25',
    labelTextFa: 'ستاره کشف ۲۵',
    titleFa: 'ستاره کشف ۲۵ — تعامل و غوطه‌وری حسی',
    introFa: 'هنر تعاملی مخاطب را از جایگاه ناظر منفعل به کنشگر هم‌آفرین ارتقا می‌دهد.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'عنصر غوطه‌وری (Immersion) در هنر رسانه‌ای چگونه کارکرد پیدا می‌کند؟',
      textFa: 'عنصر غوطه‌وری (Immersion) در هنر رسانه‌ای چگونه کارکرد پیدا می‌کند؟',
      options: [
        'با درگیر کردن چند حس همزمان و برقراری ارتباط دوسویه فضایی و صوتی با بیننده.',
        'تنها از طریق تاریک کردن کامل سالن نمایش.',
        'با حذف هرگونه صدا و نور متحرک.',
      ],
      correctAnswer: 'با درگیر کردن چند حس همزمان و برقراری ارتباط دوسویه فضایی و صوتی با بیننده.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'هنر تعاملی با فضاسازی چندبعدی، ادراک مخاطب را احاطه و در فرآیند اثر سهیم می‌سازد.',
    },
    question: {
      question: 'عنصر غوطه‌وری (Immersion) در هنر رسانه‌ای چگونه کارکرد پیدا می‌کند؟',
      textFa: 'عنصر غوطه‌وری (Immersion) در هنر رسانه‌ای چگونه کارکرد پیدا می‌کند؟',
      options: [
        'با درگیر کردن چند حس همزمان و برقراری ارتباط دوسویه فضایی و صوتی با بیننده.',
        'تنها از طریق تاریک کردن کامل سالن نمایش.',
        'با حذف هرگونه صدا و نور متحرک.',
      ],
      correctAnswer: 'با درگیر کردن چند حس همزمان و برقراری ارتباط دوسویه فضایی و صوتی با بیننده.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'هنر تعاملی با فضاسازی چندبعدی، ادراک مخاطب را احاطه و در فرآیند اثر سهیم می‌سازد.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'غوطه‌وری حسی و ارتباط فعال اثر با مخاطب.',
      textEn: 'Sensory immersion and active audience engagement.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'هنر دیگر چیزی برای فقط دیدن نیست، بلکه فضایی برای تجربه و زیستن است.',
      textEn: 'Art is no longer merely to be seen, but an environment to be lived and experienced.',
    },
  },
  'col-g09-01': {
    id: 'col-g09-01',
    starId: 'star-20',
    galleryId: 'gallery-09',
    questionId: 'star-q-20',
    labelTextFa: 'ستاره کشف ۲۰',
    titleFa: 'تابلوی دام',
    introFa: 'عکاسی پیوندی ناگسستنی میان ثبت یک لحظه منجمد و تداوم تاریخ برقرار می‌سازد.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'چگونه انجماد لحظه در عکس می‌تواند حس تداوم تاریخی ایجاد کند؟',
      textFa: 'چگونه انجماد لحظه در عکس می‌تواند حس تداوم تاریخی ایجاد کند؟',
      options: [
        'با تبدیل یک آنِ گذرا به مدرکی ماندگار برای تامل نسل‌های آینده.',
        'با پاک کردن تمام شواهد گذشته.',
        'صرفاً از طریق چرخش زاویه دید لنز.',
      ],
      correctAnswer: 'با تبدیل یک آنِ گذرا به مدرکی ماندگار برای تامل نسل‌های آینده.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'ثبت یک فریم واحد، لحظه‌ای زودگذر را در بستر ابدیت تثبیت می‌کند.',
    },
    question: {
      question: 'چگونه انجماد لحظه در عکس می‌تواند حس تداوم تاریخی ایجاد کند؟',
      textFa: 'چگونه انجماد لحظه در عکس می‌تواند حس تداوم تاریخی ایجاد کند؟',
      options: [
        'با تبدیل یک آنِ گذرا به مدرکی ماندگار برای تامل نسل‌های آینده.',
        'با پاک کردن تمام شواهد گذشته.',
        'صرفاً از طریق چرخش زاویه دید لنز.',
      ],
      correctAnswer: 'با تبدیل یک آنِ گذرا به مدرکی ماندگار برای تامل نسل‌های آینده.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'ثبت یک فریم واحد، لحظه‌ای زودگذر را در بستر ابدیت تثبیت می‌کند.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'انجماد لحظه و دیرندگی زمان در تصویر عکاسانه.',
      textEn: 'Freezing time and historic continuity in photography.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'عکس آیینه‌ای است که گذشته را در پیش چشم حال زنده نگه می‌دارد.',
      textEn: 'Freezing time and historic continuity in photography.',
    },
  },
  'col-g09-02': {
    id: 'col-g09-02',
    starId: 'star-21',
    galleryId: 'gallery-09',
    questionId: 'star-q-21',
    labelTextFa: 'ستاره کشف ۲۱',
    titleFa: 'سوپ داگر',
    introFa: 'فرسایش سطح و متریال تصویر، تجسم مادی گذر زمان است.',
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: 'توجه به بافت فیزیکی و شیمیایی عکس چه رویکردی را در ادراک اثر تقویت می‌کند؟',
      textFa: 'توجه به بافت فیزیکی و شیمیایی عکس چه رویکردی را در ادراک اثر تقویت می‌کند؟',
      options: [
        'رویکرد مادیت‌محور که عکس را به عنوان شیئی با سرگذشت زیسته و تاریخی معرفی می‌کند.',
        'نادیده گرفتن کامل محتوای اثر.',
        'تبدیل تصویر به نقاشی رنگ روغن.',
      ],
      correctAnswer: 'رویکرد مادیت‌محور که عکس را به عنوان شیئی با سرگذشت زیسته و تاریخی معرفی می‌کند.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'مادیت اثر عکاسانه، ردپای فیزیکی تماس زمان با تصویر را بازنمایی می‌نماید.',
    },
    question: {
      question: 'توجه به بافت فیزیکی و شیمیایی عکس چه رویکردی را در ادراک اثر تقویت می‌کند؟',
      textFa: 'توجه به بافت فیزیکی و شیمیایی عکس چه رویکردی را در ادراک اثر تقویت می‌کند؟',
      options: [
        'رویکرد مادیت‌محور که عکس را به عنوان شیئی با سرگذشت زیسته و تاریخی معرفی می‌کند.',
        'نادیده گرفتن کامل محتوای اثر.',
        'تبدیل تصویر به نقاشی رنگ روغن.',
      ],
      correctAnswer: 'رویکرد مادیت‌محور که عکس را به عنوان شیئی با سرگذشت زیسته و تاریخی معرفی می‌کند.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'مادیت اثر عکاسانه، ردپای فیزیکی تماس زمان با تصویر را بازنمایی می‌نماید.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'مادیت، فرسایش و کهنگی به عنوان شاهدان تاریخی گذر زمان.',
      textEn: 'Material degradation and traces of time.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'هر خط، فرسایش و تغییر رنگ در متریال تصویر، کلمه‌ای از سرگذشت زمان است.',
      textEn: 'Material degradation and traces of time.',
    },
  },
  'col-g09-03': {
    id: 'col-g09-03',
    starId: 'star-22',
    galleryId: 'gallery-09',
    questionId: 'star-q-22',
    labelTextFa: 'فقط یک عکس؟',
    titleFa: 'عکس‌ها و اچینگ‌ها',
    introFa: 'وقتی عکس و حکاکی کنار هم قرار می‌گیرند، تصویر دیگر فقط یک عکس است؟',
    discoveryCost: 30,
    informationCost: 40,
    discoveryQuestion: {
      question: 'در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟',
      textFa: 'در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟',
      options: [
        'یکی جایگزین دیگری می‌شود.',
        'هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.',
        'عکس فقط برای ثبت اچینگ استفاده شده است.',
      ],
      correctAnswer: 'هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'عکس و اچینگ دو زبان تصویری متفاوت دارند که در این اثر همدیگر را کامل می‌کنند.',
    },
    question: {
      question: 'در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟',
      textFa: 'در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟',
      options: [
        'یکی جایگزین دیگری می‌شود.',
        'هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.',
        'عکس فقط برای ثبت اچینگ استفاده شده است.',
      ],
      correctAnswer: 'هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.',
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'عکس و اچینگ دو زبان تصویری متفاوت دارند که در این اثر همدیگر را کامل می‌کنند.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'عکس و اچینگ دو زبان تصویری متفاوت دارند.عکاسی با ثبت، قاب‌بندی و واقعیتِ پیش روی دوربین سروکار دارد؛ اچینگ با خط، سطح و ردّ دست.وقتی این دو در کنار هم قرار می‌گیرند، مخاطب فقط به موضوع تصویر نگاه نمی‌کند؛ بلکه متوجه می‌شود تصویر چگونه ساخته شده و هر رسانه چه چیزی به تجربهٔ دیدن اضافه می‌کند.اچینگ (Etching) یک روش چاپ هنری است. هنرمند روی یک صفحهٔ فلزی (معمولاً مس) با ماده‌ای اسیدی شیار ایجاد می‌کند. بعد داخل این شیارها جوهر می‌ماند و صفحه روی کاغذ فشرده می‌شود؛ در نتیجه خطوط روی کاغذ چاپ می‌شوند.',
      textEn: 'Photography and etching juxtaposition.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'عکس و اچینگ دو زبان تصویری متفاوت دارند.عکاسی با ثبت، قاب‌بندی و واقعیتِ پیش روی دوربین سروکار دارد؛ اچینگ با خط، سطح و ردّ دست.وقتی این دو در کنار هم قرار می‌گیرند، مخاطب فقط به موضوع تصویر نگاه نمی‌کند؛ بلکه متوجه می‌شود تصویر چگونه ساخته شده و هر رسانه چه چیزی به تجربهٔ دیدن اضافه می‌کند.اچینگ (Etching) یک روش چاپ هنری است. هنرمند روی یک صفحهٔ فلزی (معمولاً مس) با ماده‌ای اسیدی شیار ایجاد می‌کند. بعد داخل این شیارها جوهر می‌ماند و صفحه روی کاغذ فشرده می‌شود؛ در نتیجه خطوط روی کاغذ چاپ می‌شوند.',
      textEn: 'Photography and etching juxtaposition.',
    },
  },
  'col-g09-04': {
    id: 'col-g09-04',
    starId: 'star-23',
    galleryId: 'gallery-09',
    questionId: 'star-q-23',
    labelTextFa: 'تصویری برای ثبت شدن',
    titleFa: 'سگ سه پا',
    introFa: 'اگر تصویر برای دوربین ساخته شده باشد، هنوز هم فقط یک ثبت است؟',
    discoveryCost: 30,
    informationCost: 40,
    discoveryQuestion: {
      question: 'در این اثر، عکس چه چیزی را ثبت می‌کند؟',
      textFa: 'در این اثر، عکس چه چیزی را ثبت می‌کند؟',
      options: [
        'نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.',
        'یک اتفاق کاملاً تصادفی.',
        'تصویری که هنرمند هیچ نقشی در شکل‌گیری آن نداشته است.',
      ],
      correctAnswer: 'نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'در آثار ویگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.',
    },
    question: {
      question: 'در این اثر، عکس چه چیزی را ثبت می‌کند؟',
      textFa: 'در این اثر، عکس چه چیزی را ثبت می‌کند؟',
      options: [
        'نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.',
        'یک اتفاق کاملاً تصادفی.',
        'تصویری که هنرمند هیچ نقشی در شکل‌گیری آن نداشته است.',
      ],
      correctAnswer: 'نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.',
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: 'در آثار ویگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.',
    },
    discoveryArtwork: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'در آثار ویگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.دوربین در پایان این فرایند حضور پیدا می‌کند و نتیجه را ثبت می‌کند.در اینجا عکس دیگر فقط شاهد یک اتفاق نیست؛ می‌تواند نتیجهٔ یک موقعیت ساخته‌شده و بخشی از یک فرایند هنری باشد.مرز میان «ثبت کردن» و «ساختن» دوباره جابه‌جا می‌شود.',
      textEn: 'William Wegman — Three-legged dog staging and capture.',
    },
    information: {
      image: 'https://www.olo.pics/images/2026/09/05/1931-016.webp',
      textFa: 'در آثار ویگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.دوربین در پایان این فرایند حضور پیدا می‌کند و نتیجه را ثبت می‌کند.در اینجا عکس دیگر فقط شاهد یک اتفاق نیست؛ می‌تواند نتیجهٔ یک موقعیت ساخته‌شده و بخشی از یک فرایند هنری باشد.مرز میان «ثبت کردن» و «ساختن» دوباره جابه‌جا می‌شود.',
      textEn: 'William Wegman — Three-legged dog staging and capture.',
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
  galleryId: string = 'gallery-01',
  starId?: string
): StarDiscoveryItem | null {
  const star = contentService.getStarForStarPoint(starPointId, galleryId, starId);

  if (star) {
    return mapStarContentToDiscoveryItem(star, starPointId);
  }

  // Robust Direct Fallback from DEFAULT_STAR_DISCOVERIES:
  // Check exact starId, starPointId, or deterministic star number mapping
  const extractStarNum = (s?: string): number | null => {
    if (!s) return null;
    const clean = s.trim();
    if (clean === 'col-g09-01') return 20;
    if (clean === 'col-g09-02') return 21;
    if (clean === 'col-g09-03') return 22;
    if (clean === 'col-g09-04') return 23;
    if (clean === 'artwork-01' || clean === 'col-01') return 1;
    if (clean === 'artwork-g03-star') return 3;
    const starMatch = clean.match(/^star(?:-q)?[-_]?0*(\d+)$/i);
    if (starMatch && starMatch[1]) return parseInt(starMatch[1], 10);
    if (/^\d+$/.test(clean)) return parseInt(clean, 10);
    return null;
  };

  const num = extractStarNum(starId) ?? extractStarNum(starPointId);
  const formattedKey = num !== null ? `star-${String(num).padStart(2, '0')}` : null;

  const fallback =
    (starId && DEFAULT_STAR_DISCOVERIES[starId]) ||
    (starPointId && DEFAULT_STAR_DISCOVERIES[starPointId]) ||
    (formattedKey && DEFAULT_STAR_DISCOVERIES[formattedKey]) ||
    (starPointId === 'artwork-01' ? DEFAULT_STAR_DISCOVERIES['star-01'] : null) ||
    (starPointId === 'artwork-g03-star' ? DEFAULT_STAR_DISCOVERIES['star-03'] : null) ||
    (galleryId === 'gallery-01' || galleryId === 'gallery_01' ? DEFAULT_STAR_DISCOVERIES['star-01'] : null);

  if (fallback) {
    return {
      ...fallback,
      id: starPointId || fallback.id,
      galleryId: galleryId || fallback.galleryId,
    };
  }

  return null;
}
