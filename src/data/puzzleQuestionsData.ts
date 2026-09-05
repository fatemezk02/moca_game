/**
 * Reusable Puzzle Questions Data Repository
 * Associates Puzzle Points with their respective Questions and Puzzle Pieces.
 */

export interface PuzzleQuestionItem {
  id: string;
  galleryId: string;
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  puzzlePieceId: string;
}

export const DEFAULT_PUZZLE_QUESTIONS: Record<string, PuzzleQuestionItem> = {
  'gallery01-puzzle-q01': {
    id: 'gallery01-puzzle-q01',
    galleryId: 'gallery-01',
    title: 'تالار معماری — پرسش پازل ۱',
    question: 'کدام ویژگی ساختاری در طراحی این طاق و ایوان معماری برجسته است؟',
    options: [
      'تناسبات دقیق هندسی و قوس‌های مونوکروم باربر',
      'تذهیب‌های مینیاتوری زراندود روی پوست آهو',
      'کاشی‌کاری‌های هفت‌رنگ زرین‌فام دوره‌ای',
      'پیکره‌های برنزی اسطرلاب با شاخص‌های چرخان',
    ],
    correctIndex: 0,
    explanation: 'تناسبات دقیق هندسی و سازه‌های قوسی از مشخصه‌های برجسته معماری این تالار است.',
    puzzlePieceId: 'gallery01-piece-01',
  },
  'gallery01-puzzle-q02': {
    id: 'gallery01-puzzle-q02',
    galleryId: 'gallery-01',
    title: 'تالار معماری — پرسش پازل ۲',
    question: 'در نقوش برجسته و پایه‌های تالار، از چه المان‌های نمادینی استفاده شده است؟',
    options: [
      'نقوش گیاهی اسلیمی و کتیبه‌های مقعر سنگی',
      'نگاره‌های انتزاعی کوبیسم مدرن قرن بیستم',
      'منبت‌کاری چوب آبنوس و عاج هندی',
      'تندیس‌های شیشه‌ای دمیده‌شده ونیزی',
    ],
    correctIndex: 0,
    explanation: 'المان‌های اسلیمی و کتیبه‌های سنگی در پایه‌ها و نقوش ستون‌ها بکار رفته است.',
    puzzlePieceId: 'gallery01-piece-02',
  },
  'gallery01-puzzle-q03': {
    id: 'gallery01-puzzle-q03',
    galleryId: 'gallery-01',
    title: 'تالار معماری — پرسش پازل ۳ (قطعه نهایی)',
    question: 'هدف اصلی از چیدمان فضایی و نورگیرهای فوقانی این شاهکار چیست؟',
    options: [
      'هدایت طبیعی نور خورشید به مرکز صحن و ایجاد عمق فضایی',
      'حفظ رطوبت برای نگهداری طومارهای چرمی کهن',
      'انعکاس صوت برای سخنرانی‌های مذهبی گروهی',
      'ایجاد سایه‌روشن مطلق جهت مخفی‌سازی گنجینه‌ها',
    ],
    correctIndex: 0,
    explanation: 'نورگیرهای فوقانی جهت هدایت نور طبیعی و خلق پرسپکتیو ژرف معماری طراحی شده‌اند.',
    puzzlePieceId: 'gallery01-piece-03',
  },
  'gallery03-puzzle-q01': {
    id: 'gallery03-puzzle-q01',
    galleryId: 'gallery-03',
    title: 'تالار معاصر — پرسش پازل ۱',
    question: 'کدام جنبش هنری آغازگر تحول در فرم‌های بصری و ساختارشکنی در تالار معاصر است؟',
    options: [
      'انتزاع هندسی و نئوپلاستی‌سیسم',
      'نقاشی‌های مینیاتور درباری قاجار',
      'نگاره‌های کهن پیشاتاریخی غارها',
      'طبیعت‌گرایی صرف کلاسیک قرن هفدهم',
    ],
    correctIndex: 0,
    explanation: 'هنر انتزاعی و ریتم هندسی شالوده اصلی آثار نوگرای تالار معاصر را شکل می‌دهد.',
    puzzlePieceId: 'gallery03-piece-01',
  },
  'gallery03-puzzle-q02': {
    id: 'gallery03-puzzle-q02',
    galleryId: 'gallery-03',
    title: 'تالار معاصر — پرسش پازل ۲',
    question: 'در ترکیب‌بندی رنگی و ریتم بصری این بخش، چه اصلی بیشترین تاکید را دارد؟',
    options: [
      'کنتراست شدید رنگ‌های مکمل و فضاهای منفی پویا',
      'یکنواختی تک‌رنگ بدون هیچ تمایز بصری',
      'سایه‌روشن‌های تیره خفاشی باروک',
      'عدم تعادل تصادفی بدون چارچوب ترکیبی',
    ],
    correctIndex: 0,
    explanation: 'کنتراست پویا میان فرم‌های مثبت و فضاهای منفی ریتم مدرن اثر را تثبیت می‌کند.',
    puzzlePieceId: 'gallery03-piece-02',
  },
  'gallery03-puzzle-q03': {
    id: 'gallery03-puzzle-q03',
    galleryId: 'gallery-03',
    title: 'تالار معاصر — پرسش پازل ۳ (قطعه نهایی)',
    question: 'پیام محوری چیدمان مجسمه‌ها و تابلوهای این تالار به مخاطب معاصر چیست؟',
    options: [
      'گفتگوی میان سنت، نوگرایی و تامل در فضا',
      'جداسازی کامل هنر از تجربه زیسته انسان',
      'تکرار صرف الگوهای باستانی بدون تغییر',
      'محدودسازی هنر به قاب‌های تزئینی',
    ],
    correctIndex: 0,
    explanation: 'تلفیق نوگرایی با عناصر اصیل مفهومی، جان‌مایه اصلی هنر معاصر است.',
    puzzlePieceId: 'gallery03-piece-03',
  },
};

/**
 * Retrieves a puzzle question by its ID, with sensible fallback
 */
export function getPuzzleQuestion(questionId: string, galleryId: string = 'gallery-01'): PuzzleQuestionItem {
  if (DEFAULT_PUZZLE_QUESTIONS[questionId]) {
    return DEFAULT_PUZZLE_QUESTIONS[questionId];
  }

  // Generic fallback if a new question ID was created
  const pieceNum = questionId.includes('02') || questionId.includes('q2') ? '02' : questionId.includes('03') || questionId.includes('q3') ? '03' : '01';
  return {
    id: questionId,
    galleryId,
    title: `پرسش پازل (${questionId})`,
    question: 'ویژگی اصلی این اثر و قطعه متصل به آن در گالری چیست؟',
    options: [
      'گزینه الف: هماهنگی فرم، ایستایی و قرینگی بصری',
      'گزینه ب: تذهیب و کتاب‌آرایی دست‌نویس',
      'گزینه ج: سفالگری لعابدار ساسانی',
      'گزینه د: قلمزنی فلزی برجسته',
    ],
    correctIndex: 0,
    explanation: 'پاسخ صحیح برای این قطعه پازل ثبت گردید.',
    puzzlePieceId: `${galleryId.replace(/[^a-z0-9]/g, '')}-piece-${pieceNum}`,
  };
}
