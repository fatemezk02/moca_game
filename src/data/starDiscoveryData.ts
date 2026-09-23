import { contentService, extractCanonicalStarNumber } from "../services/content/contentService";
import { StarContent } from "../services/content/types";
import { normalizeGalleryId } from "../services/content/mappers";

const DEFAULT_ARTWORK_IMAGES: Record<number, string> = {
  1: "",
  2: "",
  3: "https://www.olo.pics/images/2026/09/05/1934-012.webp",
  4: "https://www.olo.pics/images/2026/09/05/1931-004.webp",
  5: "https://www.olo.pics/images/2026/09/05/1932-012.webp",
  6: "https://www.olo.pics/images/2026/09/05/970329_15.webp",
  7: "https://www.olo.pics/images/2026/09/05/--d9a6a2eaf8714280.webp",
  8: "https://www.olo.pics/images/2026/09/05/--1.webp",
  9: "https://www.olo.pics/images/2026/09/05/--1f6195121b7d6b63d.webp",
  10: "https://www.olo.pics/images/2026/09/05/---3.webp",
  11: "https://www.olo.pics/images/2026/09/05/---366d438db1b218973.webp",
  12: "https://www.olo.pics/images/2026/09/05/-999c72cccab1b6dd.webp",
  13: "https://www.olo.pics/images/2026/09/05/-35dfde515ce07c18.webp",
  14: "https://www.olo.pics/images/2026/09/05/-8aa237cd0f17935e.webp",
  15: "https://www.olo.pics/images/2026/09/05/--4.webp",
  16: "https://www.olo.pics/images/2026/09/05/--3.webp",
  17: "https://www.olo.pics/images/2026/09/05/WhatsApp-Image-2026-01-04-at-17.11.24.webp",
  18: "https://www.olo.pics/images/2026/09/05/b1.webp",
  19: "https://www.olo.pics/images/2026/09/05/-63194900692934fb.webp",
  23: "https://www.olo.pics/images/2026/09/05/daniel_spoerri_tableau_piege_1972062939.webp",
  24: "https://www.olo.pics/images/2026/09/05/-0c51e1b3fad442d7.webp",
  25: "https://www.olo.pics/images/2026/09/05/------3.webp",
  26: "https://www.olo.pics/images/2026/09/05/48c38c3c6749921f613ae365670cab62.webp",
  27: "https://www.olo.pics/images/2026/09/05/--1ef8b4c193afb080d.webp",
  28: "https://www.olo.pics/images/2026/09/05/W1siZiIsIjUzNTM3MiJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MTQ0MFx1MDAzZSJdXQ.webp",
};

export interface StarPointQuestion {
  question: string;
  textFa?: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  correctReward: number;
  wrongReward: number;
  explanation?: string;
}

export interface StarPointInformation {
  image: string;
  textFa: string;
  textEn: string;
}

export interface StarDiscoveryItem {
  id: string;
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
  labelTextFa: string;
  titleFa: string;
  introFa: string;
  discoveryCost: number;
  informationCost: number;
  discoveryQuestion: StarPointQuestion;
  question: StarPointQuestion;
  discoveryArtwork: StarPointInformation;
  information: StarPointInformation;
}

export function mapStarContentToDiscoveryItem(
  star: StarContent,
  starPointId: string
): StarDiscoveryItem {
  const gallery = contentService.getGalleryById(star.galleryId);
  const rawQid =
    star.questionId ||
    (star.id && star.id.startsWith("star-q-")
      ? star.id
      : `star-q-${(star.id || "").replace(/^star[-_]?/i, "").padStart(2, "0")}`);

  const targetNum =
    extractCanonicalStarNumber(star.starNumber) ??
    extractCanonicalStarNumber(star.starId) ??
    extractCanonicalStarNumber(star.id) ??
    extractCanonicalStarNumber(starPointId);

  const formattedNumKey = targetNum !== null ? `star-${String(targetNum).padStart(2, "0")}` : null;

  const fallback: StarDiscoveryItem | undefined =
    (formattedNumKey && DEFAULT_STAR_DISCOVERIES[formattedNumKey]) ||
    (star.starId && DEFAULT_STAR_DISCOVERIES[star.starId]) ||
    (star.id && DEFAULT_STAR_DISCOVERIES[star.id]) ||
    (DEFAULT_STAR_DISCOVERIES[starPointId]);

  const fallbackQ = fallback?.question || fallback?.discoveryQuestion;
  const rawQText = (star.questionText || "").trim();
  const questionText = rawQText || fallbackQ?.question || "درباره این اثر هنری چه نکته‌ای را به خاطر می‌سپارید؟";

  const options =
    star.questionOptions && star.questionOptions.length > 0
      ? star.questionOptions
      : fallbackQ?.options && fallbackQ.options.length > 0
      ? fallbackQ.options
      : ["گزینه الف", "گزینه ب", "گزینه ج"];

  const correctAnswer = (star.correctAnswer || "").trim() || fallbackQ?.correctAnswer || options[0] || "";
  const explanation = (star.explanation || "").trim() || fallbackQ?.explanation || "";

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

  let resolvedImageUrl = "";
  if (star.artworkId) {
    const artwork = contentService.getArtworkById(star.artworkId);
    if (artwork && artwork.imageUrl && artwork.imageUrl.trim()) {
      resolvedImageUrl = artwork.imageUrl.trim();
    }
  }
  if (!resolvedImageUrl && star.artworkImageUrl && star.artworkImageUrl.trim()) {
    resolvedImageUrl = star.artworkImageUrl.trim();
  }
  if (!resolvedImageUrl && targetNum !== null && DEFAULT_ARTWORK_IMAGES[targetNum]) {
    resolvedImageUrl = DEFAULT_ARTWORK_IMAGES[targetNum];
  }
  if (!resolvedImageUrl && fallback) {
    resolvedImageUrl = fallback.information?.image || fallback.discoveryArtwork?.image || "";
  }

  const rawTextFa = (star.artworkTextFa || "").trim();
  const fallbackInfo = fallback?.information || fallback?.discoveryArtwork;
  const isGenericPlaceholder = rawTextFa === "اطلاعات و تاریخچه این شاهکار هنری در گالری ثبت شده است.";
  const informationTextFa =
    (!rawTextFa || isGenericPlaceholder) && fallbackInfo?.textFa
      ? fallbackInfo.textFa
      : rawTextFa || fallbackInfo?.textFa || "اطلاعات و تاریخچه این شاهکار هنری در گالری ثبت شده است.";
  const informationTextEn = (star.artworkTextEn || "").trim() || fallbackInfo?.textEn || "";

  const information: StarPointInformation = {
    image: resolvedImageUrl,
    textFa: informationTextFa,
    textEn: informationTextEn,
  };

  const rawStarNum = targetNum !== null ? String(targetNum) : star.starNumber || "1";
  const titleFa = (star.titleFa || "").trim() || fallback?.titleFa || `ستاره کشف ${rawStarNum}`;
  const introFa = (star.introFa || "").trim() || fallback?.introFa || titleFa;
  const labelTextFa = (star.labelTextFa || "").trim() || fallback?.labelTextFa || introFa;

  return {
    id: starPointId,
    starId: star.starId || star.id || (formattedNumKey ?? "star-01"),
    starNumber: rawStarNum,
    questionId: rawQid,
    galleryId: star.galleryId || fallback?.galleryId || "gallery-01",
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
 * Offline initial fallback dictionary strictly containing the 25 official Star Points.
 */
export const DEFAULT_STAR_DISCOVERIES: Record<string, StarDiscoveryItem> = {
  "star-01": {
    id: "star-01",
    starId: "star-01",
    starNumber: "1",
    questionId: "star-q-01",
    galleryId: "gallery_01",
    galleryNumber: "1",
    galleryNameFa: "کیمیای نور",
    galleryNameEn: "Gallery 01 Name",
    labelTextFa: "ردپای عکاسی را در گذر زمان دنبال کن!",
    titleFa: "تایم‌لاین عکاسی",
    introFa: "سال‌های مهمی از شکل‌گیری و تحول عکاسی را دنبال کن.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "سال ۱۸۴۱ را پیدا کن. چه اتفاقی در این سال برای عکاسی افتاد؟",
      textFa: "سال ۱۸۴۱ را پیدا کن. چه اتفاقی در این سال برای عکاسی افتاد؟",
      options: ["داگروتیپ معرفی شد.","کالوتایپ معرفی شد.","نخستین عکس رنگی ثبت شد."],
      correctAnswer: "کالوتایپ معرفی شد.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "سال ۱۸۴۱ را پیدا کن. چه اتفاقی در این سال برای عکاسی افتاد؟",
      textFa: "سال ۱۸۴۱ را پیدا کن. چه اتفاقی در این سال برای عکاسی افتاد؟",
      options: ["داگروتیپ معرفی شد.","کالوتایپ معرفی شد.","نخستین عکس رنگی ثبت شد."],
      correctAnswer: "کالوتایپ معرفی شد.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "",
      textFa: "کالوتایپ؛ نگاتیوی که امکان تکثیر تصویر را داد:\nکالوتایپ روشی بود که ویلیام هنری فاکس تالبوت در سال ۱۸۴۱ به ثبت رساند. در این روش، کاغذ با مواد شیمیایی حساس به نور آماده می‌شد و درون دوربین قرار می‌گرفت.\nنور، تصویری نامرئی یا کم‌رنگ روی کاغذ ایجاد می‌کرد که بعد با فرایند شیمیایی آشکار می‌شد و به یک نگاتیو تبدیل می‌شد.\nاهمیت اصلی کالوتایپ در همین نگاتیو بود: از یک نگاتیو می‌شد چندین نسخه مثبت از یک تصویر ساخت. این ویژگی، آن را از داگروتیپ متمایز می‌کرد؛ داگروتیپ معمولاً تصویری یگانه بود و امکان تکثیر مستقیم نداشت.\nکالوتایپ در عین حال کیفیتی متفاوت از داگروتیپ داشت. بافت کاغذ باعث می‌شد جزئیات تصویر نرم‌تر و سایه‌روشن‌ها گسترده‌تر باشند؛ ویژگی‌ای که بعدها برای برخی عکاسان، بخشی از ارزش هنری این روش شد.\nدر یک جمله:\nکالوتایپ فقط راه تازه‌ای برای گرفتن عکس نبود؛ با تبدیل تصویر به نگاتیو، امکان تکثیر و انتشار عکس را فراهم کرد و مسیر عکاسی را به‌عنوان یک رسانه تغییر داد.",
      textEn: "Invented and patented by William Henry Fox Talbot in 1841.",
    },
    information: {
      image: "",
      textFa: "کالوتایپ؛ نگاتیوی که امکان تکثیر تصویر را داد:\nکالوتایپ روشی بود که ویلیام هنری فاکس تالبوت در سال ۱۸۴۱ به ثبت رساند. در این روش، کاغذ با مواد شیمیایی حساس به نور آماده می‌شد و درون دوربین قرار می‌گرفت.\nنور، تصویری نامرئی یا کم‌رنگ روی کاغذ ایجاد می‌کرد که بعد با فرایند شیمیایی آشکار می‌شد و به یک نگاتیو تبدیل می‌شد.\nاهمیت اصلی کالوتایپ در همین نگاتیو بود: از یک نگاتیو می‌شد چندین نسخه مثبت از یک تصویر ساخت. این ویژگی، آن را از داگروتیپ متمایز می‌کرد؛ داگروتیپ معمولاً تصویری یگانه بود و امکان تکثیر مستقیم نداشت.\nکالوتایپ در عین حال کیفیتی متفاوت از داگروتیپ داشت. بافت کاغذ باعث می‌شد جزئیات تصویر نرم‌تر و سایه‌روشن‌ها گسترده‌تر باشند؛ ویژگی‌ای که بعدها برای برخی عکاسان، بخشی از ارزش هنری این روش شد.\nدر یک جمله:\nکالوتایپ فقط راه تازه‌ای برای گرفتن عکس نبود؛ با تبدیل تصویر به نگاتیو، امکان تکثیر و انتشار عکس را فراهم کرد و مسیر عکاسی را به‌عنوان یک رسانه تغییر داد.",
      textEn: "Invented and patented by William Henry Fox Talbot in 1841.",
    },
  },
  "star-02": {
    id: "star-02",
    starId: "star-02",
    starNumber: "2",
    questionId: "star-q-02",
    galleryId: "gallery_01",
    galleryNumber: "1",
    galleryNameFa: "کیمیای نور",
    galleryNameEn: "Gallery 01 Name",
    labelTextFa: "عکاسی چگونه به دنیای هنر نزدیک شد!",
    titleFa: "مجله‌های Camera Work",
    introFa: "این نشریه یکی از مهم‌ترین نمونه‌های تلاش برای تثبیت عکاسی به‌عنوان یک هنر بود.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "Camera Work بیشتر در کدام مورد اهمیت داشت؟",
      textFa: "Camera Work بیشتر در کدام مورد اهمیت داشت؟",
      options: ["معرفی و مطرح کردن عکاسی به‌عنوان یک هنر","آموزش استفاده از دوربین","فروش دوربین و مواد عکاسی"],
      correctAnswer: "معرفی و مطرح کردن عکاسی به‌عنوان یک هنر",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "Camera Work بیشتر در کدام مورد اهمیت داشت؟",
      textFa: "Camera Work بیشتر در کدام مورد اهمیت داشت؟",
      options: ["معرفی و مطرح کردن عکاسی به‌عنوان یک هنر","آموزش استفاده از دوربین","فروش دوربین و مواد عکاسی"],
      correctAnswer: "معرفی و مطرح کردن عکاسی به‌عنوان یک هنر",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "",
      textFa: "Camera Work؛ وقتی عکاسی می‌خواست هنر باشد:\nCamera Work مجله‌ای بود که آلفرد استیگلیتز از سال ۱۹۰۳ تا ۱۹۱۷ منتشر می‌کرد. این مجله فقط مجموعه‌ای از عکس‌ها نبود؛ فضایی بود برای نمایش آثار عکاسان و بحث درباره‌ی جایگاه عکاسی در هنر.\nتصاویر با کیفیت بسیار بالا و به شیوه‌ی فتوگراوور چاپ می‌شدند و در کنار عکس‌ها، مقاله‌ها، نقدها و مطالبی درباره‌ی هنر منتشر می‌شد.\nاین روش می‌توانست جزئیات و ظرافت‌های عکس را با کیفیت بالایی بازتولید کند و به همین دلیل برای چاپ عکس‌های هنری بسیار ارزشمند بود.\nبه‌تدریج، Camera Work ارتباط عکاسی با نقاشی و هنر مدرن را هم پررنگ‌تر کرد و آثاری از هنرمندان دیگر را در کنار عکس‌ها معرفی کرد. به این ترتیب، مجله به یکی از ابزارهای مهم برای دفاع از عکاسی به‌عنوان یک هنر مستقل تبدیل شد.\nنکته:\nعکاسی برای پذیرفته‌شدن در دنیای هنر، فقط به گرفتن عکس‌های متفاوت نیاز نداشت؛ باید نشان می‌داد که دوربین هم می‌تواند وسیله‌ای برای آفرینش هنری باشد.",
      textEn: "A quarterly journal published by Alfred Stieglitz from 1903 to 1917.",
    },
    information: {
      image: "",
      textFa: "Camera Work؛ وقتی عکاسی می‌خواست هنر باشد:\nCamera Work مجله‌ای بود که آلفرد استیگلیتز از سال ۱۹۰۳ تا ۱۹۱۷ منتشر می‌کرد. این مجله فقط مجموعه‌ای از عکس‌ها نبود؛ فضایی بود برای نمایش آثار عکاسان و بحث درباره‌ی جایگاه عکاسی در هنر.\nتصاویر با کیفیت بسیار بالا و به شیوه‌ی فتوگراوور چاپ می‌شدند و در کنار عکس‌ها، مقاله‌ها، نقدها و مطالبی درباره‌ی هنر منتشر می‌شد.\nاین روش می‌توانست جزئیات و ظرافت‌های عکس را با کیفیت بالایی بازتولید کند و به همین دلیل برای چاپ عکس‌های هنری بسیار ارزشمند بود.\nبه‌تدریج، Camera Work ارتباط عکاسی با نقاشی و هنر مدرن را هم پررنگ‌تر کرد و آثاری از هنرمندان دیگر را در کنار عکس‌ها معرفی کرد. به این ترتیب، مجله به یکی از ابزارهای مهم برای دفاع از عکاسی به‌عنوان یک هنر مستقل تبدیل شد.\nنکته:\nعکاسی برای پذیرفته‌شدن در دنیای هنر، فقط به گرفتن عکس‌های متفاوت نیاز نداشت؛ باید نشان می‌داد که دوربین هم می‌تواند وسیله‌ای برای آفرینش هنری باشد.",
      textEn: "A quarterly journal published by Alfred Stieglitz from 1903 to 1917.",
    },
  },
  "star-03": {
    id: "star-03",
    starId: "star-03",
    starNumber: "3",
    questionId: "star-q-03",
    galleryId: "gallery_02",
    artworkId: "2",
    galleryNumber: "2",
    galleryNameFa: "آلبوم‌های دیپلماتیک",
    galleryNameEn: "Gallery 03 Name",
    labelTextFa: "آدم‌هایی را ببین که با مهارتشان شناخته می‌شدند.",
    titleFa: "در جست‌وجوی فن و فضیلت",
    introFa: "این آلبوم، چهره‌هایی از گروه‌های مختلف را کنار هم قرار داده است؛ از شاهزادگان و رجال سیاسی تا دانشجویان، استادان، باغبانان و هنرمندان.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "کدام ویژگی این آلبوم، آن را از یک آلبوم صرفاً اشرافی متفاوت می‌کند؟",
      textFa: "کدام ویژگی این آلبوم، آن را از یک آلبوم صرفاً اشرافی متفاوت می‌کند؟",
      options: ["فقط عکس پادشاهان و شاهزادگان در آن دیده می‌شود.","افراد به دلیل حرفه، مهارت و جایگاه اجتماعی‌شان نیز وارد جهان تصویر شده‌اند.","تمام عکس‌ها در ایران گرفته شده‌اند."],
      correctAnswer: "افراد به دلیل حرفه، مهارت و جایگاه اجتماعی‌شان نیز وارد جهان تصویر شده‌اند.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "کدام ویژگی این آلبوم، آن را از یک آلبوم صرفاً اشرافی متفاوت می‌کند؟",
      textFa: "کدام ویژگی این آلبوم، آن را از یک آلبوم صرفاً اشرافی متفاوت می‌کند؟",
      options: ["فقط عکس پادشاهان و شاهزادگان در آن دیده می‌شود.","افراد به دلیل حرفه، مهارت و جایگاه اجتماعی‌شان نیز وارد جهان تصویر شده‌اند.","تمام عکس‌ها در ایران گرفته شده‌اند."],
      correctAnswer: "افراد به دلیل حرفه، مهارت و جایگاه اجتماعی‌شان نیز وارد جهان تصویر شده‌اند.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/1934-012.webp",
      textFa: "وقتی حرفه هم وارد قاب شد:\nآلبوم ۱۹۳۴ فقط مجموعه‌ای از چهره‌های قدرتمند نیست. در آن، افرادی مانند باغبان، دبّاغ، دانشجو و هنرمند در کنار چهره‌های مشهور دیده می‌شوند.\nاین تغییر مهم است؛ زیرا نشان می‌دهد عکاسی فقط برای ثبت اشراف و صاحبان قدرت به کار نمی‌رفت. حرفه و تخصص نیز می‌توانست بخشی از هویت یک فرد شود.\nاز طرف دیگر، حضور خوانندگان اپرا و هنرمندان مشهور در کنار دانشجویان ایرانی، تصویری از زندگی فرهنگی و اجتماعی ایرانیان در اروپا به دست می‌دهد.",
      textEn: "Diplomatic and professional portraits album.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/1934-012.webp",
      textFa: "وقتی حرفه هم وارد قاب شد:\nآلبوم ۱۹۳۴ فقط مجموعه‌ای از چهره‌های قدرتمند نیست. در آن، افرادی مانند باغبان، دبّاغ، دانشجو و هنرمند در کنار چهره‌های مشهور دیده می‌شوند.\nاین تغییر مهم است؛ زیرا نشان می‌دهد عکاسی فقط برای ثبت اشراف و صاحبان قدرت به کار نمی‌رفت. حرفه و تخصص نیز می‌توانست بخشی از هویت یک فرد شود.\nاز طرف دیگر، حضور خوانندگان اپرا و هنرمندان مشهور در کنار دانشجویان ایرانی، تصویری از زندگی فرهنگی و اجتماعی ایرانیان در اروپا به دست می‌دهد.",
      textEn: "Diplomatic and professional portraits album.",
    },
  },
  "star-04": {
    id: "star-04",
    starId: "star-04",
    starNumber: "4",
    questionId: "star-q-04",
    galleryId: "gallery_02",
    galleryNumber: "2",
    galleryNameFa: "آلبوم‌های دیپلماتیک",
    galleryNameEn: "Gallery 03 Name",
    labelTextFa: "عکاس چهره‌های مشهور فرانسه که بود؟",
    titleFa: "نخبگان فرانسه و عصر بناپارتیسم",
    introFa: "در این آلبوم، چهره‌های سیاسی، نظامی، سلطنتی، هنرمندان و زنان مشهور در کنار یکدیگر قرار گرفته‌اند.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "دیزدری با رواج عکس‌های «کارت ویزیت» چه تغییری در فرهنگ پرتره ایجاد کرد؟",
      textFa: "دیزدری با رواج عکس‌های «کارت ویزیت» چه تغییری در فرهنگ پرتره ایجاد کرد؟",
      options: ["پرتره را کوچک‌تر، قابل تکثیرتر و قابل جمع‌آوری کرد.","عکس را به یک تصویر یگانه و غیرقابل تکثیر تبدیل کرد.","باعث شد عکس فقط برای خاندان سلطنتی قابل استفاده باشد."],
      correctAnswer: "پرتره را کوچک‌تر، قابل تکثیرتر و قابل جمع‌آوری کرد.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "دیزدری با رواج عکس‌های «کارت ویزیت» چه تغییری در فرهنگ پرتره ایجاد کرد؟",
      textFa: "دیزدری با رواج عکس‌های «کارت ویزیت» چه تغییری در فرهنگ پرتره ایجاد کرد؟",
      options: ["پرتره را کوچک‌تر، قابل تکثیرتر و قابل جمع‌آوری کرد.","عکس را به یک تصویر یگانه و غیرقابل تکثیر تبدیل کرد.","باعث شد عکس فقط برای خاندان سلطنتی قابل استفاده باشد."],
      correctAnswer: "پرتره را کوچک‌تر، قابل تکثیرتر و قابل جمع‌آوری کرد.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/1931-004.webp",
      textFa: "کارت ویزیت؛ پرتره‌ای که دست‌به‌دست شد.\nابداع و رواج «کارت ویزیت» باعث شد پرترهٔ عکاسانه از قالب تصویر بزرگ و گران‌قیمت فاصله بگیرد.\nافراد می‌توانستند چندین نسخه از تصویر خود داشته باشند و آن را به دوستان، آشنایان و دیگران هدیه کنند.\nبه این ترتیب، عکس از یک تصویر شخصی به چیزی تبدیل شد که می‌شد آن را جمع کرد، هدیه داد و به اشتراک گذاشت.",
      textEn: "Disdéri popularized carte-de-visite portraits of prominent figures in 19th-century France.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/1931-004.webp",
      textFa: "کارت ویزیت؛ پرتره‌ای که دست‌به‌دست شد.\nابداع و رواج «کارت ویزیت» باعث شد پرترهٔ عکاسانه از قالب تصویر بزرگ و گران‌قیمت فاصله بگیرد.\nافراد می‌توانستند چندین نسخه از تصویر خود داشته باشند و آن را به دوستان، آشنایان و دیگران هدیه کنند.\nبه این ترتیب، عکس از یک تصویر شخصی به چیزی تبدیل شد که می‌شد آن را جمع کرد، هدیه داد و به اشتراک گذاشت.",
      textEn: "Disdéri popularized carte-de-visite portraits of prominent figures in 19th-century France.",
    },
  },
  "star-05": {
    id: "star-05",
    starId: "star-05",
    starNumber: "5",
    questionId: "star-q-05",
    galleryId: "gallery_02",
    artworkId: "5",
    galleryNumber: "2",
    galleryNameFa: "آلبوم‌های دیپلماتیک",
    galleryNameEn: "Gallery 03 Name",
    labelTextFa: "یک سفر تصویری به ژاپن قرن نوزدهم.",
    titleFa: "یادگاری از دوران باکوماتسو تا می‌جی",
    introFa: "این آلبوم، خیابان‌ها، مردم، پوشش، معماری، مناظر و شیوهٔ زندگی ژاپنی را نشان می‌دهد.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "یکی از ویژگی‌های مهم این آلبوم چیست؟",
      textFa: "یکی از ویژگی‌های مهم این آلبوم چیست؟",
      options: ["تمام عکس‌ها فقط پرترهٔ امپراتور ژاپن هستند.","همهٔ عکس‌ها به‌صورت سیاه‌وسفید و بدون تغییر باقی مانده‌اند.","بسیاری از عکس‌ها به‌صورت دستی رنگ‌آمیزی شده‌اند تا تصویری دیدنی و جذاب از ژاپن ارائه کنند."],
      correctAnswer: "بسیاری از عکس‌ها به‌صورت دستی رنگ‌آمیزی شده‌اند تا تصویری دیدنی و جذاب از ژاپن ارائه کنند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "یکی از ویژگی‌های مهم این آلبوم چیست؟",
      textFa: "یکی از ویژگی‌های مهم این آلبوم چیست؟",
      options: ["تمام عکس‌ها فقط پرترهٔ امپراتور ژاپن هستند.","همهٔ عکس‌ها به‌صورت سیاه‌وسفید و بدون تغییر باقی مانده‌اند.","بسیاری از عکس‌ها به‌صورت دستی رنگ‌آمیزی شده‌اند تا تصویری دیدنی و جذاب از ژاپن ارائه کنند."],
      correctAnswer: "بسیاری از عکس‌ها به‌صورت دستی رنگ‌آمیزی شده‌اند تا تصویری دیدنی و جذاب از ژاپن ارائه کنند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/1932-012.webp",
      textFa: "ژاپن؛ تصویری برای مسافر\nدر قرن نوزدهم، عکس‌های ژاپن بخشی از بازار سوغات و گردشگری شدند. آلبوم‌هایی با جلدهای تزئینی و عکس‌های دستی‌رنگ‌شده، تصویری دیدنی از زندگی، معماری و طبیعت ژاپن به مسافران خارجی ارائه می‌کردند.\nاین عکس‌ها فقط سندی از یک کشور نبودند؛ آن‌ها خودشان بخشی از تجربهٔ سفر و تصویری بودند که جهان از ژاپن می‌ساخت.",
      textEn: "Visual travel album documenting 19th century Japanese culture and traditions.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/1932-012.webp",
      textFa: "ژاپن؛ تصویری برای مسافر\nدر قرن نوزدهم، عکس‌های ژاپن بخشی از بازار سوغات و گردشگری شدند. آلبوم‌هایی با جلدهای تزئینی و عکس‌های دستی‌رنگ‌شده، تصویری دیدنی از زندگی، معماری و طبیعت ژاپن به مسافران خارجی ارائه می‌کردند.\nاین عکس‌ها فقط سندی از یک کشور نبودند؛ آن‌ها خودشان بخشی از تجربهٔ سفر و تصویری بودند که جهان از ژاپن می‌ساخت.",
      textEn: "Visual travel album documenting 19th century Japanese culture and traditions.",
    },
  },
  "star-06": {
    id: "star-06",
    starId: "star-06",
    starNumber: "6",
    questionId: "star-q-06",
    galleryId: "gallery_02",
    artworkId: "6",
    galleryNumber: "2",
    galleryNameFa: "آلبوم‌های دیپلماتیک",
    galleryNameEn: "Gallery 03 Name",
    labelTextFa: "یک چهره، دوازده نگاه.",
    titleFa: "خودنگارهٔ چرخان نادار",
    introFa: "یک چهره، دوازده نگاه.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "در این اثر، نادار چهرهٔ خود را از دوازده زاویهٔ مختلف ثبت کرده است. وقتی این تصاویر پشت سر هم دیده می‌شوند، چه چیزی در ذهن بیننده شکل می‌گیرد؟",
      textFa: "در این اثر، نادار چهرهٔ خود را از دوازده زاویهٔ مختلف ثبت کرده است. وقتی این تصاویر پشت سر هم دیده می‌شوند، چه چیزی در ذهن بیننده شکل می‌گیرد؟",
      options: ["ثبت یک تصویر ثابت و دقیق از چهره، بدون توجه به زاویهٔ دید.","تغییر شکل چهرهٔ نادار برای نشان دادن احساسات مختلف او.","حس حرکت و دیدن چهره از زوایای مختلف؛ گویی دور سوژه حرکت می‌کنیم."],
      correctAnswer: "تغییر شکل چهرهٔ نادار برای نشان دادن احساسات مختلف او.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "در این اثر، نادار چهرهٔ خود را از دوازده زاویهٔ مختلف ثبت کرده است. وقتی این تصاویر پشت سر هم دیده می‌شوند، چه چیزی در ذهن بیننده شکل می‌گیرد؟",
      textFa: "در این اثر، نادار چهرهٔ خود را از دوازده زاویهٔ مختلف ثبت کرده است. وقتی این تصاویر پشت سر هم دیده می‌شوند، چه چیزی در ذهن بیننده شکل می‌گیرد؟",
      options: ["ثبت یک تصویر ثابت و دقیق از چهره، بدون توجه به زاویهٔ دید.","تغییر شکل چهرهٔ نادار برای نشان دادن احساسات مختلف او.","حس حرکت و دیدن چهره از زوایای مختلف؛ گویی دور سوژه حرکت می‌کنیم."],
      correctAnswer: "تغییر شکل چهرهٔ نادار برای نشان دادن احساسات مختلف او.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/970329_15.webp",
      textFa: "فلیکس نادار، از مشهورترین عکاسان پرترهٔ فرانسه در قرن نوزدهم بود. او از بسیاری از چهره‌های مشهور زمانه‌اش عکاسی کرد و خودش نیز بارها مقابل دوربین قرار گرفت.\nدر این اثر، نادار در دوازده نمای پیاپی از زاویه‌های مختلف ثبت شده است.\nهر عکس به‌تنهایی یک تصویر ثابت است؛ اما وقتی این تصاویر پشت سر هم قرار می‌گیرند، به نظر می‌رسد دور نادار می‌چرخیم.\nاین مجموعه بخشی از آزمایش‌های آن دوره برای پیوند دادن عکاسی با درک حجم و شکل انسان بود؛ تلاشی برای اینکه عکاسی فقط به ثبت یک نمای ثابت محدود نماند.\nاینجا چند تصویر ثابت، حس حرکت و حجم را در ذهن ما می‌سازند.",
      textEn: "Nadar's rotating self-portrait series exploring multidirectional views.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/970329_15.webp",
      textFa: "فلیکس نادار، از مشهورترین عکاسان پرترهٔ فرانسه در قرن نوزدهم بود. او از بسیاری از چهره‌های مشهور زمانه‌اش عکاسی کرد و خودش نیز بارها مقابل دوربین قرار گرفت.\nدر این اثر، نادار در دوازده نمای پیاپی از زاویه‌های مختلف ثبت شده است.\nهر عکس به‌تنهایی یک تصویر ثابت است؛ اما وقتی این تصاویر پشت سر هم قرار می‌گیرند، به نظر می‌رسد دور نادار می‌چرخیم.\nاین مجموعه بخشی از آزمایش‌های آن دوره برای پیوند دادن عکاسی با درک حجم و شکل انسان بود؛ تلاشی برای اینکه عکاسی فقط به ثبت یک نمای ثابت محدود نماند.\nاینجا چند تصویر ثابت، حس حرکت و حجم را در ذهن ما می‌سازند.",
      textEn: "Nadar's rotating self-portrait series exploring multidirectional views.",
    },
  },
  "star-07": {
    id: "star-07",
    starId: "star-07",
    starNumber: "7",
    questionId: "star-q-07",
    galleryId: "gallery_03",
    artworkId: "7",
    galleryNumber: "3",
    galleryNameFa: "ثبت دوام ما",
    galleryNameEn: "Gallery 04 Name",
    labelTextFa: "آیا عکاسی می‌تواند شبیه نقاشی باشد؟",
    titleFa: "پیکتوریالیسم",
    introFa: "وقتی عکاسی می‌خواست شبیه نقاشی شود.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "پیکتوریالیست‌ها بیشتر تلاش می‌کردند چه چیزی را نشان دهند؟",
      textFa: "پیکتوریالیست‌ها بیشتر تلاش می‌کردند چه چیزی را نشان دهند؟",
      options: ["اینکه دوربین باید واقعیت را دقیق‌تر و بدون تغییر ثبت کند.","اینکه عکس هم می‌تواند مانند نقاشی، فضایی شاعرانه و هنری خلق کند.","اینکه عکاسی فقط برای ثبت اسناد و اطلاعات مناسب است."],
      correctAnswer: "اینکه عکس هم می‌تواند مانند نقاشی، فضایی شاعرانه و هنری خلق کند.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "پیکتوریالیست‌ها بیشتر تلاش می‌کردند چه چیزی را نشان دهند؟",
      textFa: "پیکتوریالیست‌ها بیشتر تلاش می‌کردند چه چیزی را نشان دهند؟",
      options: ["اینکه دوربین باید واقعیت را دقیق‌تر و بدون تغییر ثبت کند.","اینکه عکس هم می‌تواند مانند نقاشی، فضایی شاعرانه و هنری خلق کند.","اینکه عکاسی فقط برای ثبت اسناد و اطلاعات مناسب است."],
      correctAnswer: "اینکه عکس هم می‌تواند مانند نقاشی، فضایی شاعرانه و هنری خلق کند.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/--d9a6a2eaf8714280.webp",
      textFa: "پیکتوریالیسم؛ وقتی عکس می‌خواست نقاشی باشد:\r\nدر اواخر قرن نوزدهم، گروهی از عکاسان تلاش کردند نشان دهند که عکاسی فقط وسیله‌ای برای ثبت دقیق جهان نیست.\r\nآن‌ها با استفاده از نور نرم، فوکوس کم، چاپ‌های خاص، سایه‌روشن و ترکیب‌بندی‌های حساب‌شده، عکس‌هایی می‌ساختند که گاهی حال‌وهوایی شبیه نقاشی داشتند.\r\nبرای این عکاسان، ارزش عکس فقط در این نبود که «چه چیزی را ثبت کرده است»؛ بلکه مهم بود چگونه آن را نشان می‌دهد.\r\nبه همین دلیل، عکاسی به تدریج وارد گفت‌وگوهای جدی‌تری دربارهٔ هنر شد.\r\nدر یک جمله:\r\nپیکتوریالیسم تلاش کرد ثابت کند که عکس فقط بازتاب واقعیت نیست؛ می‌تواند تصویری ساخته‌شده، احساسی و هنری باشد.",
      textEn: "Pictorialism and the quest for artistic expression in early modern photography.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/--d9a6a2eaf8714280.webp",
      textFa: "پیکتوریالیسم؛ وقتی عکس می‌خواست نقاشی باشد:\r\nدر اواخر قرن نوزدهم، گروهی از عکاسان تلاش کردند نشان دهند که عکاسی فقط وسیله‌ای برای ثبت دقیق جهان نیست.\r\nآن‌ها با استفاده از نور نرم، فوکوس کم، چاپ‌های خاص، سایه‌روشن و ترکیب‌بندی‌های حساب‌شده، عکس‌هایی می‌ساختند که گاهی حال‌وهوایی شبیه نقاشی داشتند.\r\nبرای این عکاسان، ارزش عکس فقط در این نبود که «چه چیزی را ثبت کرده است»؛ بلکه مهم بود چگونه آن را نشان می‌دهد.\r\nبه همین دلیل، عکاسی به تدریج وارد گفت‌وگوهای جدی‌تری دربارهٔ هنر شد.\r\nدر یک جمله:\r\nپیکتوریالیسم تلاش کرد ثابت کند که عکس فقط بازتاب واقعیت نیست؛ می‌تواند تصویری ساخته‌شده، احساسی و هنری باشد.",
      textEn: "Pictorialism and the quest for artistic expression in early modern photography.",
    },
  },
  "star-08": {
    id: "star-08",
    starId: "star-08",
    starNumber: "8",
    questionId: "star-q-08",
    galleryId: "gallery_04",
    artworkId: "8",
    galleryNumber: "4",
    galleryNameFa: "ضرب اهنگ شهر",
    galleryNameEn: "Gallery 05 Name",
    labelTextFa: "وقتی شهر از زاویه‌ای تازه دیده می‌شود.",
    titleFa: "نمایی از پل حمل‌ونقل مارسی",
    introFa: "شهر از زاویه ای تازه",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "موهولی-ناگی از ارتفاع پل حمل‌ونقل مارسی به شهر نگاه کرده است.\nدر این تصویر، سازه‌های شهری بیشتر شبیه خطوط و شکل‌های هندسی دیده می‌شوند.\nچه چیزی باعث شده این منظره‌ی آشنا، به تصویری متفاوت تبدیل شود؟",
      textFa: "موهولی-ناگی از ارتفاع پل حمل‌ونقل مارسی به شهر نگاه کرده است.\nدر این تصویر، سازه‌های شهری بیشتر شبیه خطوط و شکل‌های هندسی دیده می‌شوند.\nچه چیزی باعث شده این منظره‌ی آشنا، به تصویری متفاوت تبدیل شود؟",
      options: ["تغییر زاویه‌ی دید و تبدیل عناصر واقعی شهر به خطوط، شکل‌ها و ترکیب‌بندی‌های تازه.","حذف کامل شهر از تصویر.","استفاده از رنگ برای واقعی‌تر کردن ساختمان‌ها."],
      correctAnswer: "تغییر زاویه‌ی دید و تبدیل عناصر واقعی شهر به خطوط، شکل‌ها و ترکیب‌بندی‌های تازه.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "موهولی-ناگی از ارتفاع پل حمل‌ونقل مارسی به شهر نگاه کرده است.\nدر این تصویر، سازه‌های شهری بیشتر شبیه خطوط و شکل‌های هندسی دیده می‌شوند.\nچه چیزی باعث شده این منظره‌ی آشنا، به تصویری متفاوت تبدیل شود؟",
      textFa: "موهولی-ناگی از ارتفاع پل حمل‌ونقل مارسی به شهر نگاه کرده است.\nدر این تصویر، سازه‌های شهری بیشتر شبیه خطوط و شکل‌های هندسی دیده می‌شوند.\nچه چیزی باعث شده این منظره‌ی آشنا، به تصویری متفاوت تبدیل شود؟",
      options: ["تغییر زاویه‌ی دید و تبدیل عناصر واقعی شهر به خطوط، شکل‌ها و ترکیب‌بندی‌های تازه.","حذف کامل شهر از تصویر.","استفاده از رنگ برای واقعی‌تر کردن ساختمان‌ها."],
      correctAnswer: "تغییر زاویه‌ی دید و تبدیل عناصر واقعی شهر به خطوط، شکل‌ها و ترکیب‌بندی‌های تازه.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/--1.webp",
      textFa: "موهولی-ناگی یکی از چهره‌های مهم عکاسی و هنر آوانگارد قرن بیستم بود. او به‌ویژه به امکان‌های تازه‌ی دیدن علاقه داشت: نگاه از بالا، زاویه‌های غیرمعمول، سایه، نور و ترکیب‌های هندسی.\r\nدر اثر نمایی از پل حمل و نقل مارسی، شهر دیگر مثل یک منظره‌ی معمولی دیده نمی‌شود. سازه‌ی عظیم پل، خطوط و سایه‌ها به عناصر اصلی تصویر تبدیل شده‌اند و چشم ما را وادار می‌کنند شهر را از زاویه‌ای متفاوت ببینیم.\r\nاین نوع نگاه بخشی از تجربه‌ی مدرنیستی بود؛ تلاشی برای پیدا کردن تصویرهایی تازه از جهانی که خودش در حال تغییر بود.",
      textEn: "View from Pont Transbordeur, Marseille by László Moholy-Nagy.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/--1.webp",
      textFa: "موهولی-ناگی یکی از چهره‌های مهم عکاسی و هنر آوانگارد قرن بیستم بود. او به‌ویژه به امکان‌های تازه‌ی دیدن علاقه داشت: نگاه از بالا، زاویه‌های غیرمعمول، سایه، نور و ترکیب‌های هندسی.\r\nدر اثر نمایی از پل حمل و نقل مارسی، شهر دیگر مثل یک منظره‌ی معمولی دیده نمی‌شود. سازه‌ی عظیم پل، خطوط و سایه‌ها به عناصر اصلی تصویر تبدیل شده‌اند و چشم ما را وادار می‌کنند شهر را از زاویه‌ای متفاوت ببینیم.\r\nاین نوع نگاه بخشی از تجربه‌ی مدرنیستی بود؛ تلاشی برای پیدا کردن تصویرهایی تازه از جهانی که خودش در حال تغییر بود.",
      textEn: "View from Pont Transbordeur, Marseille by László Moholy-Nagy.",
    },
  },
  "star-09": {
    id: "star-09",
    starId: "star-09",
    starNumber: "9",
    questionId: "star-q-09",
    galleryId: "gallery_04",
    artworkId: "9",
    galleryNumber: "4",
    galleryNameFa: "ضرب اهنگ شهر",
    galleryNameEn: "Gallery 05 Name",
    labelTextFa: "شهری در حال ناپدید شدن",
    titleFa: "پاریسِ اوژن آتژه",
    introFa: "شهری که در حال ناپدید شدن بود.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "آتژه از خیابان‌ها، ساختمان‌ها، مغازه‌ها و گوشه‌های قدیمی پاریس عکاسی می‌کرد.\nچرا ثبت این فضاها می‌توانست مهم باشد؟",
      textFa: "آتژه از خیابان‌ها، ساختمان‌ها، مغازه‌ها و گوشه‌های قدیمی پاریس عکاسی می‌کرد.\nچرا ثبت این فضاها می‌توانست مهم باشد؟",
      options: ["چون فقط ساختمان‌های مشهور ارزش عکاسی داشتند.","چون عکاسی می‌توانست ردپای بخش‌هایی از شهر را که در حال تغییر یا ناپدید شدن بودند، حفظ کند.","چون عکاسی فقط برای ثبت معماری‌های جدید ساخته شده بود."],
      correctAnswer: "چون عکاسی می‌توانست ردپای بخش‌هایی از شهر را که در حال تغییر یا ناپدید شدن بودند، حفظ کند.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "آتژه از خیابان‌ها، ساختمان‌ها، مغازه‌ها و گوشه‌های قدیمی پاریس عکاسی می‌کرد.\nچرا ثبت این فضاها می‌توانست مهم باشد؟",
      textFa: "آتژه از خیابان‌ها، ساختمان‌ها، مغازه‌ها و گوشه‌های قدیمی پاریس عکاسی می‌کرد.\nچرا ثبت این فضاها می‌توانست مهم باشد؟",
      options: ["چون فقط ساختمان‌های مشهور ارزش عکاسی داشتند.","چون عکاسی می‌توانست ردپای بخش‌هایی از شهر را که در حال تغییر یا ناپدید شدن بودند، حفظ کند.","چون عکاسی فقط برای ثبت معماری‌های جدید ساخته شده بود."],
      correctAnswer: "چون عکاسی می‌توانست ردپای بخش‌هایی از شهر را که در حال تغییر یا ناپدید شدن بودند، حفظ کند.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/--1f6195121b7d6b63d.webp",
      textFa: "عکس‌های آتژه امروز فقط تصاویر معماری نیستند؛ آن‌ها مانند حافظه‌ی تصویری شهری هستند که بخشی از چهره‌ی قدیمی خود را از دست می‌داد.\nبه همین دلیل، دوربین او به جای دنبال کردن فقط بناهای مشهور، به سراغ گوشه‌هایی رفت که ممکن بود خیلی زود دیگر وجود نداشته باشند.",
      textEn: "Eugène Atget documented Paris streets and vanishing architectural heritage.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/--1f6195121b7d6b63d.webp",
      textFa: "عکس‌های آتژه امروز فقط تصاویر معماری نیستند؛ آن‌ها مانند حافظه‌ی تصویری شهری هستند که بخشی از چهره‌ی قدیمی خود را از دست می‌داد.\nبه همین دلیل، دوربین او به جای دنبال کردن فقط بناهای مشهور، به سراغ گوشه‌هایی رفت که ممکن بود خیلی زود دیگر وجود نداشته باشند.",
      textEn: "Eugène Atget documented Paris streets and vanishing architectural heritage.",
    },
  },
  "star-10": {
    id: "star-10",
    starId: "star-10",
    starNumber: "10",
    questionId: "star-q-10",
    galleryId: "gallery_04",
    artworkId: "10",
    galleryNumber: "4",
    galleryNameFa: "ضرب اهنگ شهر",
    galleryNameEn: "Gallery 05 Name",
    labelTextFa: "زندگی روزمره، بخشی از چهره‌ی شهر",
    titleFa: "انسان‌ها و شهر",
    introFa: "زندگی روزمره، بخشی از چهره‌ی شهر است.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "در عکس‌های واکر اونز، آدم‌ها، مغازه‌ها، خانه‌ها و خیابان‌ها در کنار هم قرار می‌گیرند.\nاین تصاویر چه چیزی را نشان می‌دهند؟",
      textFa: "در عکس‌های واکر اونز، آدم‌ها، مغازه‌ها، خانه‌ها و خیابان‌ها در کنار هم قرار می‌گیرند.\nاین تصاویر چه چیزی را نشان می‌دهند؟",
      options: ["شهر از ساختمان‌هایش تشکیل شده است.","زندگی روزمره موضوعی جدا از عکاسی شهری است.","آدم‌ها و شیوه‌ی زندگی آن‌ها هم بخشی از هویت و چهره‌ی یک شهر هستند."],
      correctAnswer: "آدم‌ها و شیوه‌ی زندگی آن‌ها هم بخشی از هویت و چهره‌ی یک شهر هستند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "در عکس‌های واکر اونز، آدم‌ها، مغازه‌ها، خانه‌ها و خیابان‌ها در کنار هم قرار می‌گیرند.\nاین تصاویر چه چیزی را نشان می‌دهند؟",
      textFa: "در عکس‌های واکر اونز، آدم‌ها، مغازه‌ها، خانه‌ها و خیابان‌ها در کنار هم قرار می‌گیرند.\nاین تصاویر چه چیزی را نشان می‌دهند؟",
      options: ["شهر از ساختمان‌هایش تشکیل شده است.","زندگی روزمره موضوعی جدا از عکاسی شهری است.","آدم‌ها و شیوه‌ی زندگی آن‌ها هم بخشی از هویت و چهره‌ی یک شهر هستند."],
      correctAnswer: "آدم‌ها و شیوه‌ی زندگی آن‌ها هم بخشی از هویت و چهره‌ی یک شهر هستند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/---3.webp",
      textFa: "واکر اونز به چیزهایی توجه می‌کرد که ممکن بود در نگاه اول معمولی به نظر برسند: نمای مغازه‌ها، خانه‌ها، خیابان‌ها، تابلوها و آدم‌هایی که در فضاهای عمومی رفت‌وآمد می‌کردند. \nاو تلاش می‌کرد بدون تزئین و اغراق، نشانه‌های زندگی آمریکایی را ثبت کند. در نتیجه، عکس‌هایش فقط درباره‌ی یک فرد یا یک ساختمان نیستند؛ مجموعه‌ای از جزئیات را کنار هم می‌گذارند تا تصویری از یک جامعه و شیوه‌ی زندگی آن بسازند.\nدر این نگاه، شهر چیزی بیشتر از معماری است؛ شهر همان آدم‌ها، فضاها و نشانه‌هایی است که هر روز در کنار هم زندگی می‌کنند.",
      textEn: "Walker Evans and the vernacular visual document of American daily life.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/---3.webp",
      textFa: "واکر اونز به چیزهایی توجه می‌کرد که ممکن بود در نگاه اول معمولی به نظر برسند: نمای مغازه‌ها، خانه‌ها، خیابان‌ها، تابلوها و آدم‌هایی که در فضاهای عمومی رفت‌وآمد می‌کردند. \nاو تلاش می‌کرد بدون تزئین و اغراق، نشانه‌های زندگی آمریکایی را ثبت کند. در نتیجه، عکس‌هایش فقط درباره‌ی یک فرد یا یک ساختمان نیستند؛ مجموعه‌ای از جزئیات را کنار هم می‌گذارند تا تصویری از یک جامعه و شیوه‌ی زندگی آن بسازند.\nدر این نگاه، شهر چیزی بیشتر از معماری است؛ شهر همان آدم‌ها، فضاها و نشانه‌هایی است که هر روز در کنار هم زندگی می‌کنند.",
      textEn: "Walker Evans and the vernacular visual document of American daily life.",
    },
  },
  "star-11": {
    id: "star-11",
    starId: "star-11",
    starNumber: "11",
    questionId: "star-q-11",
    galleryId: "gallery_04",
    artworkId: "11",
    galleryNumber: "4",
    galleryNameFa: "ضرب اهنگ شهر",
    galleryNameEn: "Gallery 05 Name",
    labelTextFa: "تخریب و دگرگونی شهر",
    titleFa: "تقاطع مخروط ها",
    introFa: "تصاویر یک شهر در لحظه‌ی تخریب و دگرگونی.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "این تصاویر، لحظه‌هایی از پروژه‌ی Conical Intersect (تقاطع مخروطی) را نشان می‌دهند؛ اثری که ماتا-کلارک در سال ۱۹۷۵ در پاریس، در دو ساختمان قدیمیِ در آستانه‌ی تخریب اجرا کرد.\nچرا این تصاویر امروز اهمیت دارند؟",
      textFa: "این تصاویر، لحظه‌هایی از پروژه‌ی Conical Intersect (تقاطع مخروطی) را نشان می‌دهند؛ اثری که ماتا-کلارک در سال ۱۹۷۵ در پاریس، در دو ساختمان قدیمیِ در آستانه‌ی تخریب اجرا کرد.\nچرا این تصاویر امروز اهمیت دارند؟",
      options: ["چون فقط ظاهر زیبای ساختمان‌ها را ثبت کرده‌اند.","چون ساختمان‌ها را برای همیشه حفظ کرده‌اند.","چون لحظه‌ای از تغییر و تخریب شهر را ثبت کرده‌اند؛ لحظه‌ای میان چیزی که در حال از بین رفتن است و چیزی که قرار است جای آن را بگیرد."],
      correctAnswer: "چون لحظه‌ای از تغییر و تخریب شهر را ثبت کرده‌اند؛ لحظه‌ای میان چیزی که در حال از بین رفتن است و چیزی که قرار است جای آن را بگیرد.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "این تصاویر، لحظه‌هایی از پروژه‌ی Conical Intersect (تقاطع مخروطی) را نشان می‌دهند؛ اثری که ماتا-کلارک در سال ۱۹۷۵ در پاریس، در دو ساختمان قدیمیِ در آستانه‌ی تخریب اجرا کرد.\nچرا این تصاویر امروز اهمیت دارند؟",
      textFa: "این تصاویر، لحظه‌هایی از پروژه‌ی Conical Intersect (تقاطع مخروطی) را نشان می‌دهند؛ اثری که ماتا-کلارک در سال ۱۹۷۵ در پاریس، در دو ساختمان قدیمیِ در آستانه‌ی تخریب اجرا کرد.\nچرا این تصاویر امروز اهمیت دارند؟",
      options: ["چون فقط ظاهر زیبای ساختمان‌ها را ثبت کرده‌اند.","چون ساختمان‌ها را برای همیشه حفظ کرده‌اند.","چون لحظه‌ای از تغییر و تخریب شهر را ثبت کرده‌اند؛ لحظه‌ای میان چیزی که در حال از بین رفتن است و چیزی که قرار است جای آن را بگیرد."],
      correctAnswer: "چون لحظه‌ای از تغییر و تخریب شهر را ثبت کرده‌اند؛ لحظه‌ای میان چیزی که در حال از بین رفتن است و چیزی که قرار است جای آن را بگیرد.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/---366d438db1b218973.webp",
      textFa: "گوردون ماتا-کلارک، هنرمند و معمار آمریکایی، در سال ۱۹۷۵ برای پروژه‌ی Conical Intersect در پاریس به سراغ دو ساختمان قدیمی رفت که قرار بود تخریب شوند.\nاو به جای ساختن یک بنای تازه، در دل ساختمان‌ها برش‌هایی ایجاد کرد و با این کار، فضای داخلی، لایه‌های معماری و بخش‌هایی از شهر را از زاویه‌ای تازه آشکار کرد. این اثر در چارچوب دوسالانه پاریس شکل گرفت.",
      textEn: "Gordon Matta-Clark and the Conical Intersect project in Paris, 1975.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/---366d438db1b218973.webp",
      textFa: "گوردون ماتا-کلارک، هنرمند و معمار آمریکایی، در سال ۱۹۷۵ برای پروژه‌ی Conical Intersect در پاریس به سراغ دو ساختمان قدیمی رفت که قرار بود تخریب شوند.\nاو به جای ساختن یک بنای تازه، در دل ساختمان‌ها برش‌هایی ایجاد کرد و با این کار، فضای داخلی، لایه‌های معماری و بخش‌هایی از شهر را از زاویه‌ای تازه آشکار کرد. این اثر در چارچوب دوسالانه پاریس شکل گرفت.",
      textEn: "Gordon Matta-Clark and the Conical Intersect project in Paris, 1975.",
    },
  },
  "star-12": {
    id: "star-12",
    starId: "star-12",
    starNumber: "12",
    questionId: "star-q-12",
    galleryId: "gallery_05",
    artworkId: "12",
    galleryNumber: "5",
    galleryNameFa: "در کشاکش تماشا و استیلا",
    galleryNameEn: "Gallery 06 Name",
    labelTextFa: "آیا یک منظره می‌تواند بدون جلوه‌گری، شاعرانه باشد؟",
    titleFa: "خرمن ذرت",
    introFa: "وقتی طبیعت با دقت و سکوت دیده می‌شود.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "ایوانز در عکاسی از طبیعت و معماری به جزئیات، ساختار و کیفیت چاپ اهمیت زیادی می‌داد.\r\nچه چیزی این نگاه را از یک تصویر صرفاً مستند جدا می‌کند؟",
      textFa: "ایوانز در عکاسی از طبیعت و معماری به جزئیات، ساختار و کیفیت چاپ اهمیت زیادی می‌داد.\r\nچه چیزی این نگاه را از یک تصویر صرفاً مستند جدا می‌کند؟",
      options: ["حذف کامل جزئیات برای تبدیل عکس به یک تصویر انتزاعی.","توجه دقیق به فرم، نور، بافت و کیفیت تصویر، بدون نیاز به تقلید مستقیم از نقاشی.","استفاده از رنگ‌های تند برای زیباتر کردن طبیعت."],
      correctAnswer: "توجه دقیق به فرم، نور، بافت و کیفیت تصویر، بدون نیاز به تقلید مستقیم از نقاشی.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "ایوانز در عکاسی از طبیعت و معماری به جزئیات، ساختار و کیفیت چاپ اهمیت زیادی می‌داد.\r\nچه چیزی این نگاه را از یک تصویر صرفاً مستند جدا می‌کند؟",
      textFa: "ایوانز در عکاسی از طبیعت و معماری به جزئیات، ساختار و کیفیت چاپ اهمیت زیادی می‌داد.\r\nچه چیزی این نگاه را از یک تصویر صرفاً مستند جدا می‌کند؟",
      options: ["حذف کامل جزئیات برای تبدیل عکس به یک تصویر انتزاعی.","توجه دقیق به فرم، نور، بافت و کیفیت تصویر، بدون نیاز به تقلید مستقیم از نقاشی.","استفاده از رنگ‌های تند برای زیباتر کردن طبیعت."],
      correctAnswer: "توجه دقیق به فرم، نور، بافت و کیفیت تصویر، بدون نیاز به تقلید مستقیم از نقاشی.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/-999c72cccab1b6dd.webp",
      textFa: "فردریک اچ. ایوانز از چهره‌های مهم عکاسی هنری بریتانیا در آغاز قرن بیستم بود. او برخلاف برخی پیکتوریالیست‌ها که می‌کوشیدند عکس را به نقاشی یا طراحی نزدیک کنند، بر دقت عکاسانه و کیفیت خودِ تصویر تأکید داشت. معماری و منظره در آثار او با نظمی دقیق دیده می‌شوند؛ خطوط، بافت‌ها و تغییرات نور به اندازهٔ موضوع اصلی اهمیت پیدا می‌کنند.\r\nایوانز علاقهٔ ویژه‌ای به چاپ پلاتین داشت؛ فرآیندی که دامنهٔ ظریف و گسترده‌ای از تیرگی‌ها و روشنایی‌ها ایجاد می‌کرد. برای او، منظره فقط چیزی نبود که در برابر دوربین قرار گرفته باشد؛ کیفیت نهایی چاپ نیز بخشی از تجربهٔ دیدن منظره بود. همین توجه به خودِ رسانه، بعدها به یکی از مسیرهای مهم تحول عکاسی منظره تبدیل شد.",
      textEn: "Visual critique and power dynamics in photography.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/-999c72cccab1b6dd.webp",
      textFa: "فردریک اچ. ایوانز از چهره‌های مهم عکاسی هنری بریتانیا در آغاز قرن بیستم بود. او برخلاف برخی پیکتوریالیست‌ها که می‌کوشیدند عکس را به نقاشی یا طراحی نزدیک کنند، بر دقت عکاسانه و کیفیت خودِ تصویر تأکید داشت. معماری و منظره در آثار او با نظمی دقیق دیده می‌شوند؛ خطوط، بافت‌ها و تغییرات نور به اندازهٔ موضوع اصلی اهمیت پیدا می‌کنند.\r\nایوانز علاقهٔ ویژه‌ای به چاپ پلاتین داشت؛ فرآیندی که دامنهٔ ظریف و گسترده‌ای از تیرگی‌ها و روشنایی‌ها ایجاد می‌کرد. برای او، منظره فقط چیزی نبود که در برابر دوربین قرار گرفته باشد؛ کیفیت نهایی چاپ نیز بخشی از تجربهٔ دیدن منظره بود. همین توجه به خودِ رسانه، بعدها به یکی از مسیرهای مهم تحول عکاسی منظره تبدیل شد.",
      textEn: "Visual critique and power dynamics in photography.",
    },
  },
  "star-13": {
    id: "star-13",
    starId: "star-13",
    starNumber: "13",
    questionId: "star-q-13",
    galleryId: "gallery_05",
    artworkId: "13",
    galleryNumber: "5",
    galleryNameFa: "در کشاکش تماشا و استیلا",
    galleryNameEn: "Gallery 06 Name",
    labelTextFa: "دوربین در سرزمین های ناشناخته",
    titleFa: "ویرانه‌های باستانی در کنیون دِ شِلی",
    introFa: "منظره، سندی از سرزمین و تاریخ",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "در عکس اُسالیوِن، ویرانه‌ها در دل دیواره‌های عظیم کنیون دیده می‌شوند.\nچرا حضور این عناصر در کنار یکدیگر اهمیت دارد؟",
      textFa: "در عکس اُسالیوِن، ویرانه‌ها در دل دیواره‌های عظیم کنیون دیده می‌شوند.\nچرا حضور این عناصر در کنار یکدیگر اهمیت دارد؟",
      options: ["عکس هم‌زمان مقیاس طبیعت، آثار انسانی و رابطهٔ آن‌ها با یکدیگر را ثبت می‌کند.","چون انسان باید همیشه در مرکز تصویر قرار بگیرد.","چون ویرانه‌ها فقط برای زیباتر کردن منظره به تصویر اضافه شده‌اند."],
      correctAnswer: "عکس هم‌زمان مقیاس طبیعت، آثار انسانی و رابطهٔ آن‌ها با یکدیگر را ثبت می‌کند.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "در عکس اُسالیوِن، ویرانه‌ها در دل دیواره‌های عظیم کنیون دیده می‌شوند.\nچرا حضور این عناصر در کنار یکدیگر اهمیت دارد؟",
      textFa: "در عکس اُسالیوِن، ویرانه‌ها در دل دیواره‌های عظیم کنیون دیده می‌شوند.\nچرا حضور این عناصر در کنار یکدیگر اهمیت دارد؟",
      options: ["عکس هم‌زمان مقیاس طبیعت، آثار انسانی و رابطهٔ آن‌ها با یکدیگر را ثبت می‌کند.","چون انسان باید همیشه در مرکز تصویر قرار بگیرد.","چون ویرانه‌ها فقط برای زیباتر کردن منظره به تصویر اضافه شده‌اند."],
      correctAnswer: "عکس هم‌زمان مقیاس طبیعت، آثار انسانی و رابطهٔ آن‌ها با یکدیگر را ثبت می‌کند.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/-35dfde515ce07c18.webp",
      textFa: "تیموتی اچ. اُسالیوِن پیش از آنکه در پیمایش‌های غرب آمریکا فعالیت کند، در جریان جنگ داخلی آمریکا به‌عنوان عکاس میدانی تجربه اندوخته بود. بعدها به گروه‌هایی پیوست که برای بررسی و شناخت مناطق جنوب‌غربی آمریکا اعزام می‌شدند. دوربین او در این پروژه‌ها فقط برای ثبت زیبایی طبیعت به کار نمی‌رفت؛ عکس‌ها بخشی از فرایند شناخت و مستندسازی سرزمین بودند.\nدر عکس‌های او، صخره‌ها، دره‌ها و ویرانه‌ها در کنار یکدیگر قرار می‌گیرند و به بیننده امکان می‌دهند مقیاس محیط را درک کند. فیگورهای انسانی کوچک در چنین تصاویری اغلب به‌عنوان مقیاس عمل می‌کنند؛ حضورشان کمک می‌کند عظمت جغرافیا دیده شود. همین ویژگی نشان می‌دهد که منظرهٔ عکاسانه از همان ابتدا با شیوهٔ اندازه‌گیری، شناخت و قاب‌بندی سرزمین ارتباط نزدیکی داشته است.",
      textEn: "Cultural critique of visual texts.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/-35dfde515ce07c18.webp",
      textFa: "تیموتی اچ. اُسالیوِن پیش از آنکه در پیمایش‌های غرب آمریکا فعالیت کند، در جریان جنگ داخلی آمریکا به‌عنوان عکاس میدانی تجربه اندوخته بود. بعدها به گروه‌هایی پیوست که برای بررسی و شناخت مناطق جنوب‌غربی آمریکا اعزام می‌شدند. دوربین او در این پروژه‌ها فقط برای ثبت زیبایی طبیعت به کار نمی‌رفت؛ عکس‌ها بخشی از فرایند شناخت و مستندسازی سرزمین بودند.\nدر عکس‌های او، صخره‌ها، دره‌ها و ویرانه‌ها در کنار یکدیگر قرار می‌گیرند و به بیننده امکان می‌دهند مقیاس محیط را درک کند. فیگورهای انسانی کوچک در چنین تصاویری اغلب به‌عنوان مقیاس عمل می‌کنند؛ حضورشان کمک می‌کند عظمت جغرافیا دیده شود. همین ویژگی نشان می‌دهد که منظرهٔ عکاسانه از همان ابتدا با شیوهٔ اندازه‌گیری، شناخت و قاب‌بندی سرزمین ارتباط نزدیکی داشته است.",
      textEn: "Cultural critique of visual texts.",
    },
  },
  "star-14": {
    id: "star-14",
    starId: "star-14",
    starNumber: "14",
    questionId: "star-q-14",
    galleryId: "gallery_05",
    artworkId: "14",
    galleryNumber: "5",
    galleryNameFa: "در کشاکش تماشا و استیلا",
    galleryNameEn: "Gallery 06 Name",
    labelTextFa: "اگر منظره را از اطلاعات اضافی خالی کنیم، چه چیزی باقی می‌ماند؟",
    titleFa: "خلیج تومالِس",
    introFa: "طبیعت به‌عنوان فرم",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "وستِن در عکاسی مدرنیستی خود به فرم، وضوح و ساختار اهمیت زیادی می‌داد.\nدر چنین نگاهی، منظره چگونه تغییر می‌کند؟",
      textFa: "وستِن در عکاسی مدرنیستی خود به فرم، وضوح و ساختار اهمیت زیادی می‌داد.\nدر چنین نگاهی، منظره چگونه تغییر می‌کند؟",
      options: ["منظره باید شبیه یک نقشهٔ جغرافیایی شود.","عکاس باید هرگونه فرم و ساختار را از بین ببرد.","عناصر طبیعی می‌توانند به فرم‌ها، خطوط، بافت‌ها و روابط بصری تبدیل شوند و خودِ تصویر به موضوعی مستقل تبدیل شود."],
      correctAnswer: "عناصر طبیعی می‌توانند به فرم‌ها، خطوط، بافت‌ها و روابط بصری تبدیل شوند و خودِ تصویر به موضوعی مستقل تبدیل شود.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "وستِن در عکاسی مدرنیستی خود به فرم، وضوح و ساختار اهمیت زیادی می‌داد.\nدر چنین نگاهی، منظره چگونه تغییر می‌کند؟",
      textFa: "وستِن در عکاسی مدرنیستی خود به فرم، وضوح و ساختار اهمیت زیادی می‌داد.\nدر چنین نگاهی، منظره چگونه تغییر می‌کند؟",
      options: ["منظره باید شبیه یک نقشهٔ جغرافیایی شود.","عکاس باید هرگونه فرم و ساختار را از بین ببرد.","عناصر طبیعی می‌توانند به فرم‌ها، خطوط، بافت‌ها و روابط بصری تبدیل شوند و خودِ تصویر به موضوعی مستقل تبدیل شود."],
      correctAnswer: "عناصر طبیعی می‌توانند به فرم‌ها، خطوط، بافت‌ها و روابط بصری تبدیل شوند و خودِ تصویر به موضوعی مستقل تبدیل شود.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/-8aa237cd0f17935e.webp",
      textFa: "ادوارد وستِن یکی از چهره‌های مهم مدرنیسم در عکاسی آمریکا بود. او به‌تدریج از شیوه‌های نرم و پیکتوریالیستی فاصله گرفت و به وضوح، فرم و ساختار روی آورد. در این نگاه، عکاس لزوماً نمی‌خواهد منظره را همان‌طور که چشم در یک لحظهٔ معمولی می‌بیند بازسازی کند؛ بلکه می‌تواند ویژگی‌های بصری آن را برجسته کند.\nدر نتیجه، یک خلیج، صخره، گیاه یا تپه می‌تواند در عکس به مجموعه‌ای از شکل‌ها و سطوح تبدیل شود. منظره همچنان از جهان طبیعی آمده است، اما تصویر دیگر فقط دربارهٔ «آن مکان» نیست. نحوهٔ دیدن، انتخاب قاب و تبدیل واقعیت به یک ساختار بصری نیز به بخشی از موضوع عکس تبدیل می‌شود.",
      textEn: "Photography and collective memory formation.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/-8aa237cd0f17935e.webp",
      textFa: "ادوارد وستِن یکی از چهره‌های مهم مدرنیسم در عکاسی آمریکا بود. او به‌تدریج از شیوه‌های نرم و پیکتوریالیستی فاصله گرفت و به وضوح، فرم و ساختار روی آورد. در این نگاه، عکاس لزوماً نمی‌خواهد منظره را همان‌طور که چشم در یک لحظهٔ معمولی می‌بیند بازسازی کند؛ بلکه می‌تواند ویژگی‌های بصری آن را برجسته کند.\nدر نتیجه، یک خلیج، صخره، گیاه یا تپه می‌تواند در عکس به مجموعه‌ای از شکل‌ها و سطوح تبدیل شود. منظره همچنان از جهان طبیعی آمده است، اما تصویر دیگر فقط دربارهٔ «آن مکان» نیست. نحوهٔ دیدن، انتخاب قاب و تبدیل واقعیت به یک ساختار بصری نیز به بخشی از موضوع عکس تبدیل می‌شود.",
      textEn: "Photography and collective memory formation.",
    },
  },
  "star-15": {
    id: "star-15",
    starId: "star-15",
    starNumber: "15",
    questionId: "star-q-15",
    galleryId: "gallery_05",
    artworkId: "15",
    galleryNumber: "5",
    galleryNameFa: "در کشاکش تماشا و استیلا",
    galleryNameEn: "Gallery 06 Name",
    labelTextFa: "آیا خط افق واقعاً همان چیزی است که می‌بینیم؟",
    titleFa: "افق زمین ۱–۱۰",
    introFa: "وقتی دوربین، منظره را دوباره می‌سازد.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "دیبِتس با استفاده از چند تصویر و تغییر زاویهٔ دوربین، خط افق را به شکلی غیرعادی و ساختارمند بازسازی می‌کند.\nاین اثر چه چیزی را زیر سؤال می‌برد؟",
      textFa: "دیبِتس با استفاده از چند تصویر و تغییر زاویهٔ دوربین، خط افق را به شکلی غیرعادی و ساختارمند بازسازی می‌کند.\nاین اثر چه چیزی را زیر سؤال می‌برد؟",
      options: ["وجود واقعی طبیعت.","این تصور که عکس فقط واقعیت را ثبت می‌کند و هیچ نقشی در ساختن تصویر ندارد.","اهمیت نور و زاویهٔ دید در عکاسی."],
      correctAnswer: "این تصور که عکس فقط واقعیت را ثبت می‌کند و هیچ نقشی در ساختن تصویر ندارد.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "دیبِتس با استفاده از چند تصویر و تغییر زاویهٔ دوربین، خط افق را به شکلی غیرعادی و ساختارمند بازسازی می‌کند.\nاین اثر چه چیزی را زیر سؤال می‌برد؟",
      textFa: "دیبِتس با استفاده از چند تصویر و تغییر زاویهٔ دوربین، خط افق را به شکلی غیرعادی و ساختارمند بازسازی می‌کند.\nاین اثر چه چیزی را زیر سؤال می‌برد؟",
      options: ["وجود واقعی طبیعت.","این تصور که عکس فقط واقعیت را ثبت می‌کند و هیچ نقشی در ساختن تصویر ندارد.","اهمیت نور و زاویهٔ دید در عکاسی."],
      correctAnswer: "این تصور که عکس فقط واقعیت را ثبت می‌کند و هیچ نقشی در ساختن تصویر ندارد.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/--4.webp",
      textFa: "یان دیبِتس از هنرمندانی بود که در دهه‌های ۱۹۶۰ و ۱۹۷۰ امکانات عکاسی را به‌عنوان یک رسانهٔ مستقل بررسی کردند. در مجموعه‌های مربوط به افق، منظره دیگر فقط موضوعی برای ثبت کردن نیست؛ خودِ فرایند دیدن و ساختن تصویر به موضوع اثر تبدیل می‌شود.\nبا تغییر زاویهٔ دوربین و کنار هم قرار دادن نماها، چیزی که در طبیعت یک خط ساده و آشنا به نظر می‌رسد، در عکس به ساختاری ساخته‌شده تبدیل می‌شود. اینجا دوربین دیگر یک پنجرهٔ کاملاً خنثی به جهان نیست. انتخاب زاویه، قاب، زمان و ترتیب تصاویر نشان می‌دهد که هر منظرهٔ عکاسانه تا حدی نتیجهٔ تصمیم‌های عکاس و امکانات رسانه است.",
      textEn: "Visual literacy in the contemporary media age.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/--4.webp",
      textFa: "یان دیبِتس از هنرمندانی بود که در دهه‌های ۱۹۶۰ و ۱۹۷۰ امکانات عکاسی را به‌عنوان یک رسانهٔ مستقل بررسی کردند. در مجموعه‌های مربوط به افق، منظره دیگر فقط موضوعی برای ثبت کردن نیست؛ خودِ فرایند دیدن و ساختن تصویر به موضوع اثر تبدیل می‌شود.\nبا تغییر زاویهٔ دوربین و کنار هم قرار دادن نماها، چیزی که در طبیعت یک خط ساده و آشنا به نظر می‌رسد، در عکس به ساختاری ساخته‌شده تبدیل می‌شود. اینجا دوربین دیگر یک پنجرهٔ کاملاً خنثی به جهان نیست. انتخاب زاویه، قاب، زمان و ترتیب تصاویر نشان می‌دهد که هر منظرهٔ عکاسانه تا حدی نتیجهٔ تصمیم‌های عکاس و امکانات رسانه است.",
      textEn: "Visual literacy in the contemporary media age.",
    },
  },
  "star-16": {
    id: "star-16",
    starId: "star-16",
    starNumber: "16",
    questionId: "star-q-16",
    galleryId: "gallery_05",
    artworkId: "16",
    galleryNumber: "5",
    galleryNameFa: "در کشاکش تماشا و استیلا",
    galleryNameEn: "Gallery 06 Name",
    labelTextFa: "اصفهان، نیویورک",
    titleFa: "اصفهان، نیویورک",
    introFa: "منظره‌ای میان دو جغرافیا",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "فرید با کنار هم قرار دادن تصاویر اصفهان و نیویورک، یک منظرهٔ واقعی و یک مکان خیالی را به وجود می‌آورد.\nاین روش چه چیزی را نشان می‌دهد؟",
      textFa: "فرید با کنار هم قرار دادن تصاویر اصفهان و نیویورک، یک منظرهٔ واقعی و یک مکان خیالی را به وجود می‌آورد.\nاین روش چه چیزی را نشان می‌دهد؟",
      options: ["عکس همیشه فقط باید یک مکان واقعی را ثبت کند.","معماری و منظره هیچ ارتباطی با خاطره و هویت ندارند.","منظره می‌تواند حاصل ترکیب جغرافیا، حافظه، هویت و تجربهٔ شخصی باشد."],
      correctAnswer: "منظره می‌تواند حاصل ترکیب جغرافیا، حافظه، هویت و تجربهٔ شخصی باشد.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "فرید با کنار هم قرار دادن تصاویر اصفهان و نیویورک، یک منظرهٔ واقعی و یک مکان خیالی را به وجود می‌آورد.\nاین روش چه چیزی را نشان می‌دهد؟",
      textFa: "فرید با کنار هم قرار دادن تصاویر اصفهان و نیویورک، یک منظرهٔ واقعی و یک مکان خیالی را به وجود می‌آورد.\nاین روش چه چیزی را نشان می‌دهد؟",
      options: ["عکس همیشه فقط باید یک مکان واقعی را ثبت کند.","معماری و منظره هیچ ارتباطی با خاطره و هویت ندارند.","منظره می‌تواند حاصل ترکیب جغرافیا، حافظه، هویت و تجربهٔ شخصی باشد."],
      correctAnswer: "منظره می‌تواند حاصل ترکیب جغرافیا، حافظه، هویت و تجربهٔ شخصی باشد.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/--3.webp",
      textFa: "هِرمین فرید در آثار خود به رابطهٔ میان تصویر، حافظه و هویت علاقه داشت. در «اصفهان نیویورک»، دو فضای شهری که از نظر جغرافیا و تاریخ با یکدیگر فاصله دارند، در یک تصویر با هم برخورد می‌کنند. معماری سنتی اصفهان در کنار ساختارهای شهری مدرن نیویورک قرار می‌گیرد و مرز میان یک مکان واقعی و تصویری ذهنی را کم‌رنگ می‌کند.\nدر اینجا منظره دیگر فقط چیزی نیست که در برابر دوربین قرار گرفته باشد. تجربهٔ زیستن میان فرهنگ‌ها و مکان‌های مختلف نیز می‌تواند به بخشی از منظره تبدیل شود. تصویر، هم‌زمان یک شهر، یک خاطره و یک تجربهٔ شخصی را در خود نگه می‌دارد.",
      textEn: "Isfahan, New York conceptual photographic juxtaposition.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/--3.webp",
      textFa: "هِرمین فرید در آثار خود به رابطهٔ میان تصویر، حافظه و هویت علاقه داشت. در «اصفهان نیویورک»، دو فضای شهری که از نظر جغرافیا و تاریخ با یکدیگر فاصله دارند، در یک تصویر با هم برخورد می‌کنند. معماری سنتی اصفهان در کنار ساختارهای شهری مدرن نیویورک قرار می‌گیرد و مرز میان یک مکان واقعی و تصویری ذهنی را کم‌رنگ می‌کند.\nدر اینجا منظره دیگر فقط چیزی نیست که در برابر دوربین قرار گرفته باشد. تجربهٔ زیستن میان فرهنگ‌ها و مکان‌های مختلف نیز می‌تواند به بخشی از منظره تبدیل شود. تصویر، هم‌زمان یک شهر، یک خاطره و یک تجربهٔ شخصی را در خود نگه می‌دارد.",
      textEn: "Isfahan, New York conceptual photographic juxtaposition.",
    },
  },
  "star-17": {
    id: "star-17",
    starId: "star-17",
    starNumber: "17",
    questionId: "star-q-17",
    galleryId: "gallery_05",
    artworkId: "17",
    galleryNumber: "5",
    galleryNameFa: "در کشاکش تماشا و استیلا",
    galleryNameEn: "Gallery 06 Name",
    labelTextFa: "اگر خودِ منظره را تغییر بدهیم، اثر هنری کجاست؟",
    titleFa: "پیشنهاد برای تغییر زمین",
    introFa: "وقتی منظره به محل اجرای اثر تبدیل می‌شود.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "در این اثر، عکس‌ها، نقشه‌ها و یک مدل کوچک در کنار هم قرار گرفته‌اند.\nچرا چنین مجموعه‌ای می‌تواند یک اثر هنری مستقل باشد؟",
      textFa: "در این اثر، عکس‌ها، نقشه‌ها و یک مدل کوچک در کنار هم قرار گرفته‌اند.\nچرا چنین مجموعه‌ای می‌تواند یک اثر هنری مستقل باشد؟",
      options: ["چون ماکت فقط نسخهٔ کوچک یک مجسمهٔ بزرگ است.","چون عکس‌ها فقط برای تزئین ماکت استفاده شده‌اند.","چون در هنر زمین، ایدهٔ مداخله در یک مکان، نقشه، عکس و مدل می‌توانند بخشی از خودِ اثر و شیوهٔ تصور کردن آن باشند."],
      correctAnswer: "چون در هنر زمین، ایدهٔ مداخله در یک مکان، نقشه، عکس و مدل می‌توانند بخشی از خودِ اثر و شیوهٔ تصور کردن آن باشند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "در این اثر، عکس‌ها، نقشه‌ها و یک مدل کوچک در کنار هم قرار گرفته‌اند.\nچرا چنین مجموعه‌ای می‌تواند یک اثر هنری مستقل باشد؟",
      textFa: "در این اثر، عکس‌ها، نقشه‌ها و یک مدل کوچک در کنار هم قرار گرفته‌اند.\nچرا چنین مجموعه‌ای می‌تواند یک اثر هنری مستقل باشد؟",
      options: ["چون ماکت فقط نسخهٔ کوچک یک مجسمهٔ بزرگ است.","چون عکس‌ها فقط برای تزئین ماکت استفاده شده‌اند.","چون در هنر زمین، ایدهٔ مداخله در یک مکان، نقشه، عکس و مدل می‌توانند بخشی از خودِ اثر و شیوهٔ تصور کردن آن باشند."],
      correctAnswer: "چون در هنر زمین، ایدهٔ مداخله در یک مکان، نقشه، عکس و مدل می‌توانند بخشی از خودِ اثر و شیوهٔ تصور کردن آن باشند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/WhatsApp-Image-2026-01-04-at-17.11.24.webp",
      textFa: "دنیس اوپنهایم از هنرمندان مهم هنر زمین و هنر مفهومی بود و از اواخر دههٔ ۱۹۶۰ بسیاری از پروژه‌های خود را به جای فضای معمول گالری، در ارتباط مستقیم با زمین و محیط طراحی کرد. بخشی از این پروژه‌ها بسیار بزرگ، موقتی یا دور از دسترس بودند؛ بنابراین عکس‌ها، نقشه‌ها، متن‌ها و مدل‌ها به ابزارهای مهمی برای ثبت و انتقال ایدهٔ اثر تبدیل شدند.\nدر مجموعهٔ «Proposals» او حتی خودِ ماکت می‌تواند یک اثر مستقل باشد: پیشنهادی برای اینکه چگونه یک ساختار یا مداخله می‌تواند در یک سرزمین قرار بگیرد. در چنین آثاری، گالری دیگر فقط محل نمایش یک شیء نیست؛ به جایی تبدیل می‌شود که در آن می‌توان یک مکان دور، یک پروژهٔ اجراشده یا حتی یک پروژهٔ هنوز اجرا‌نشده را تصور کرد. موزهٔ متروپولیتن نیز در توضیح آثار او نشان می‌دهد که مدل و نقشه می‌توانند فاصلهٔ میان فضای گالری و محل واقعی مداخله را از میان بردارند.",
      textEn: "Proposal for land alteration documentation and maps.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/WhatsApp-Image-2026-01-04-at-17.11.24.webp",
      textFa: "دنیس اوپنهایم از هنرمندان مهم هنر زمین و هنر مفهومی بود و از اواخر دههٔ ۱۹۶۰ بسیاری از پروژه‌های خود را به جای فضای معمول گالری، در ارتباط مستقیم با زمین و محیط طراحی کرد. بخشی از این پروژه‌ها بسیار بزرگ، موقتی یا دور از دسترس بودند؛ بنابراین عکس‌ها، نقشه‌ها، متن‌ها و مدل‌ها به ابزارهای مهمی برای ثبت و انتقال ایدهٔ اثر تبدیل شدند.\nدر مجموعهٔ «Proposals» او حتی خودِ ماکت می‌تواند یک اثر مستقل باشد: پیشنهادی برای اینکه چگونه یک ساختار یا مداخله می‌تواند در یک سرزمین قرار بگیرد. در چنین آثاری، گالری دیگر فقط محل نمایش یک شیء نیست؛ به جایی تبدیل می‌شود که در آن می‌توان یک مکان دور، یک پروژهٔ اجراشده یا حتی یک پروژهٔ هنوز اجرا‌نشده را تصور کرد. موزهٔ متروپولیتن نیز در توضیح آثار او نشان می‌دهد که مدل و نقشه می‌توانند فاصلهٔ میان فضای گالری و محل واقعی مداخله را از میان بردارند.",
      textEn: "Proposal for land alteration documentation and maps.",
    },
  },
  "star-18": {
    id: "star-18",
    starId: "star-18",
    starNumber: "18",
    questionId: "star-q-18",
    galleryId: "gallery_05",
    artworkId: "18",
    galleryNumber: "5",
    galleryNameFa: "در کشاکش تماشا و استیلا",
    galleryNameEn: "Gallery 06 Name",
    labelTextFa: "یک دهه در ده تصویر؟",
    titleFa: "بازخوانی دههٔ ۱۹۶۰",
    introFa: "ده تصویر از یک دههٔ پرآشوب",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "رابرت ایندیانا در مجموعهٔ «دهه» (The Decade)، ده اثر را به ده سالِ دههٔ ۱۹۶۰ پیوند می‌دهد؛ از «رؤیای آمریکایی» (The American Dream) در سال ۱۹۶۰ تا «تِرِ هوت، شمارهٔ ۲» (Terre Haute, No. 2) در سال ۱۹۶۹.\r\nدر این مجموعه، کلمه، عدد، نشانه، خاطره و رویدادهای اجتماعی در کنار هم قرار می‌گیرند. این مجموعه چه چیزی را نشان می‌دهد؟",
      textFa: "رابرت ایندیانا در مجموعهٔ «دهه» (The Decade)، ده اثر را به ده سالِ دههٔ ۱۹۶۰ پیوند می‌دهد؛ از «رؤیای آمریکایی» (The American Dream) در سال ۱۹۶۰ تا «تِرِ هوت، شمارهٔ ۲» (Terre Haute, No. 2) در سال ۱۹۶۹.\r\nدر این مجموعه، کلمه، عدد، نشانه، خاطره و رویدادهای اجتماعی در کنار هم قرار می‌گیرند. این مجموعه چه چیزی را نشان می‌دهد؟",
      options: ["یک هنرمند می‌تواند تجربهٔ شخصی و رویدادهای اجتماعی و تاریخی یک دوره را به زبان ساده و نمادینِ کلمه، عدد و تصویر تبدیل کند.","ایندیانا در این مجموعه تلاش کرده بود اتفاقات تاریخی را بدون استفاده از نشانه‌های تصویری بیان کند.","آثار هنری دههٔ ۱۹۶۰ فقط به زندگی شخصی هنرمند مربوط بودند."],
      correctAnswer: "یک هنرمند می‌تواند تجربهٔ شخصی و رویدادهای اجتماعی و تاریخی یک دوره را به زبان ساده و نمادینِ کلمه، عدد و تصویر تبدیل کند.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "رابرت ایندیانا در مجموعهٔ «دهه» (The Decade)، ده اثر را به ده سالِ دههٔ ۱۹۶۰ پیوند می‌دهد؛ از «رؤیای آمریکایی» (The American Dream) در سال ۱۹۶۰ تا «تِرِ هوت، شمارهٔ ۲» (Terre Haute, No. 2) در سال ۱۹۶۹.\r\nدر این مجموعه، کلمه، عدد، نشانه، خاطره و رویدادهای اجتماعی در کنار هم قرار می‌گیرند. این مجموعه چه چیزی را نشان می‌دهد؟",
      textFa: "رابرت ایندیانا در مجموعهٔ «دهه» (The Decade)، ده اثر را به ده سالِ دههٔ ۱۹۶۰ پیوند می‌دهد؛ از «رؤیای آمریکایی» (The American Dream) در سال ۱۹۶۰ تا «تِرِ هوت، شمارهٔ ۲» (Terre Haute, No. 2) در سال ۱۹۶۹.\r\nدر این مجموعه، کلمه، عدد، نشانه، خاطره و رویدادهای اجتماعی در کنار هم قرار می‌گیرند. این مجموعه چه چیزی را نشان می‌دهد؟",
      options: ["یک هنرمند می‌تواند تجربهٔ شخصی و رویدادهای اجتماعی و تاریخی یک دوره را به زبان ساده و نمادینِ کلمه، عدد و تصویر تبدیل کند.","ایندیانا در این مجموعه تلاش کرده بود اتفاقات تاریخی را بدون استفاده از نشانه‌های تصویری بیان کند.","آثار هنری دههٔ ۱۹۶۰ فقط به زندگی شخصی هنرمند مربوط بودند."],
      correctAnswer: "یک هنرمند می‌تواند تجربهٔ شخصی و رویدادهای اجتماعی و تاریخی یک دوره را به زبان ساده و نمادینِ کلمه، عدد و تصویر تبدیل کند.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/b1.webp",
      textFa: "مجموعهٔ The Decade در سال ۱۹۷۱ منتشر شد و شامل ده اثر سیلک‌اسکرین است که هرکدام به یکی از سال‌های دههٔ ۱۹۶۰ مربوط می‌شوند. ایندیانا در این آثار از واژه‌ها، اعداد، نشانه‌ها و ارجاعات فرهنگی استفاده می‌کند تا تصویری فشرده از تجربهٔ یک دهه بسازد؛ دهه‌ای که با تغییرات اجتماعی، سیاسی و فرهنگی گسترده‌ای در آمریکا همراه بود.\r\nمسیر این مجموعه از The American Dream آغاز می‌شود؛ اثری که رؤیای آمریکایی را با زبان گرافیکی و رنگ‌های درخشان بازخوانی می‌کند. در ادامه، موضوعاتی مانند فرهنگ بومی، صلح، ادبیات، پل بروکلین، مبارزه با نژادپرستی، هویت ملی، خاطرات خانوادگی و مارتین لوتر کینگ جونیور وارد آثار می‌شوند.\r\nدر اینجا عدد و کلمه فقط عناصر بصری نیستند. آن‌ها حامل خاطره، تاریخ و تجربه‌اند. ایندیانا با استفاده از زبان ساده و قابل‌شناسایی پاپ‌آرت، اتفاقات یک دهه را به مجموعه‌ای از نشانه‌ها تبدیل می‌کند؛ نشانه‌هایی که هم به زندگی شخصی او مربوط‌اند و هم به تجربهٔ جمعی جامعهٔ آمریکا.",
      textEn: "Robert Indiana — The Decade portfolio graphic symbols.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/b1.webp",
      textFa: "مجموعهٔ The Decade در سال ۱۹۷۱ منتشر شد و شامل ده اثر سیلک‌اسکرین است که هرکدام به یکی از سال‌های دههٔ ۱۹۶۰ مربوط می‌شوند. ایندیانا در این آثار از واژه‌ها، اعداد، نشانه‌ها و ارجاعات فرهنگی استفاده می‌کند تا تصویری فشرده از تجربهٔ یک دهه بسازد؛ دهه‌ای که با تغییرات اجتماعی، سیاسی و فرهنگی گسترده‌ای در آمریکا همراه بود.\r\nمسیر این مجموعه از The American Dream آغاز می‌شود؛ اثری که رؤیای آمریکایی را با زبان گرافیکی و رنگ‌های درخشان بازخوانی می‌کند. در ادامه، موضوعاتی مانند فرهنگ بومی، صلح، ادبیات، پل بروکلین، مبارزه با نژادپرستی، هویت ملی، خاطرات خانوادگی و مارتین لوتر کینگ جونیور وارد آثار می‌شوند.\r\nدر اینجا عدد و کلمه فقط عناصر بصری نیستند. آن‌ها حامل خاطره، تاریخ و تجربه‌اند. ایندیانا با استفاده از زبان ساده و قابل‌شناسایی پاپ‌آرت، اتفاقات یک دهه را به مجموعه‌ای از نشانه‌ها تبدیل می‌کند؛ نشانه‌هایی که هم به زندگی شخصی او مربوط‌اند و هم به تجربهٔ جمعی جامعهٔ آمریکا.",
      textEn: "Robert Indiana — The Decade portfolio graphic symbols.",
    },
  },
  "star-19": {
    id: "star-19",
    starId: "star-19",
    starNumber: "19",
    questionId: "star-q-19",
    galleryId: "gallery_06",
    artworkId: "19",
    galleryNumber: "6",
    galleryNameFa: "گذر از برون به درون",
    galleryNameEn: "Gallery 07 Name",
    labelTextFa: "اگر واقعیت را از چند زاویه ببینیم، هنوز همان واقعیت است؟",
    titleFa: "دگردیسی",
    introFa: "وقتی واقعیت از نو ساخته می‌شود",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "چه چیزی در چنین تصویری از نگاه معمول به جهان فاصله می‌گیرد؟",
      textFa: "چه چیزی در چنین تصویری از نگاه معمول به جهان فاصله می‌گیرد؟",
      options: ["ترکیب چند عنصر و تغییر رابطهٔ میان آن‌ها برای ساختن یک فضای تصویری تازه.","حذف کامل هرگونه معنا از تصویر.","بازگشت به شیوه‌های سنتی نقاشی منظره."],
      correctAnswer: "ترکیب چند عنصر و تغییر رابطهٔ میان آن‌ها برای ساختن یک فضای تصویری تازه.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "چه چیزی در چنین تصویری از نگاه معمول به جهان فاصله می‌گیرد؟",
      textFa: "چه چیزی در چنین تصویری از نگاه معمول به جهان فاصله می‌گیرد؟",
      options: ["ترکیب چند عنصر و تغییر رابطهٔ میان آن‌ها برای ساختن یک فضای تصویری تازه.","حذف کامل هرگونه معنا از تصویر.","بازگشت به شیوه‌های سنتی نقاشی منظره."],
      correctAnswer: "ترکیب چند عنصر و تغییر رابطهٔ میان آن‌ها برای ساختن یک فضای تصویری تازه.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/-63194900692934fb.webp",
      textFa: "هربرت بایر، هنرمند و طراح وابسته به باوهاوس، در آثار تصویری خود بارها مرز میان عکاسی، طراحی، تایپوگرافی و تصویرسازی را جابه‌جا کرد. در Metamorphosis نیز عناصر آشنا در کنار یکدیگر قرار می‌گیرند، اما رابطهٔ معمولشان با جهان واقعی تغییر می‌کند. نتیجه، تصویری نیست که بخواهد صرفاً چیزی را که در برابر دوربین وجود داشته ثبت کند؛ بلکه جهانی تصویری است که از ترکیب، جابه‌جایی و تغییر شکل ساخته شده است. این رویکرد با یکی از ویژگی‌های مهم آوانگارد قرن بیستم همراه است: تصویر دیگر فقط پنجره‌ای به جهان نیست، بلکه می‌تواند خودش جهانی مستقل بسازد.",
      textEn: "Herbert Bayer — Metamorphosis (1936)",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/-63194900692934fb.webp",
      textFa: "هربرت بایر، هنرمند و طراح وابسته به باوهاوس، در آثار تصویری خود بارها مرز میان عکاسی، طراحی، تایپوگرافی و تصویرسازی را جابه‌جا کرد. در Metamorphosis نیز عناصر آشنا در کنار یکدیگر قرار می‌گیرند، اما رابطهٔ معمولشان با جهان واقعی تغییر می‌کند. نتیجه، تصویری نیست که بخواهد صرفاً چیزی را که در برابر دوربین وجود داشته ثبت کند؛ بلکه جهانی تصویری است که از ترکیب، جابه‌جایی و تغییر شکل ساخته شده است. این رویکرد با یکی از ویژگی‌های مهم آوانگارد قرن بیستم همراه است: تصویر دیگر فقط پنجره‌ای به جهان نیست، بلکه می‌تواند خودش جهانی مستقل بسازد.",
      textEn: "Herbert Bayer — Metamorphosis (1936)",
    },
  },
  "star-20": {
    id: "star-20",
    starId: "star-20",
    starNumber: "20",
    questionId: "star-q-20",
    galleryId: "gallery_07",
    artworkId: "20",
    galleryNumber: "7",
    galleryNameFa: "آونگ زمان",
    galleryNameEn: "Gallery 07 — Pendulum of Time",
    labelTextFa: "q",
    titleFa: "q",
    introFa: "q",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "q",
      textFa: "q",
      options: ["q", "q", "q"],
      correctAnswer: "q",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "q",
      textFa: "q",
      options: ["q", "q", "q"],
      correctAnswer: "q",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "",
      textFa: "q",
      textEn: "",
    },
    information: {
      image: "",
      textFa: "q",
      textEn: "",
    },
  },
  "star-21": {
    id: "star-21",
    starId: "star-21",
    starNumber: "21",
    questionId: "star-q-21",
    galleryId: "gallery_07",
    artworkId: "21",
    galleryNumber: "7",
    galleryNameFa: "آونگ زمان",
    galleryNameEn: "Gallery 07 — Pendulum of Time",
    labelTextFa: "q",
    titleFa: "q",
    introFa: "q",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "q",
      textFa: "q",
      options: ["q", "q", "q"],
      correctAnswer: "q",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "q",
      textFa: "q",
      options: ["q", "q", "q"],
      correctAnswer: "q",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "",
      textFa: "q",
      textEn: "",
    },
    information: {
      image: "",
      textFa: "q",
      textEn: "",
    },
  },
  "star-22": {
    id: "star-22",
    starId: "star-22",
    starNumber: "22",
    questionId: "star-q-22",
    galleryId: "gallery_07",
    artworkId: "22",
    galleryNumber: "7",
    galleryNameFa: "آونگ زمان",
    galleryNameEn: "Gallery 07 — Pendulum of Time",
    labelTextFa: "q",
    titleFa: "q",
    introFa: "q",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "q",
      textFa: "q",
      options: ["q", "q", "q"],
      correctAnswer: "q",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "q",
      textFa: "q",
      options: ["q", "q", "q"],
      correctAnswer: "q",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "",
      textFa: "q",
      textEn: "",
    },
    information: {
      image: "",
      textFa: "q",
      textEn: "",
    },
  },
  "star-23": {
    id: "star-23",
    starId: "star-23",
    starNumber: "23",
    questionId: "star-q-23",
    galleryId: "gallery_08",
    artworkId: "20",
    galleryNumber: "8",
    galleryNameFa: "تلاقی رسانه‌ها",
    galleryNameEn: "Gallery 09 Name",
    labelTextFa: "تبدیل میز به اثر هنری",
    titleFa: "تابلوی دام",
    introFa: "اگر یک میز معمولی را همان‌طور که هست نگه داریم، می‌تواند تبدیل به اثر هنری شود؟",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "اسپوری به‌جای اینکه فقط از یک میز و اشیای روی آن عکس بگیرد، خودِ آن موقعیت واقعی را به بخشی از اثر تبدیل می‌کند.\nاین کار چه چیزی را تغییر می‌دهد؟",
      textFa: "اسپوری به‌جای اینکه فقط از یک میز و اشیای روی آن عکس بگیرد، خودِ آن موقعیت واقعی را به بخشی از اثر تبدیل می‌کند.\nاین کار چه چیزی را تغییر می‌دهد؟",
      options: ["عکس را به یک سند ساده از زندگی روزمره تبدیل می‌کند.","باعث می‌شود اشیای روزمره دیگر نقشی در اثر نداشته باشند.","مرز میان یک موقعیت واقعی و یک اثر هنری را کم‌رنگ می‌کند."],
      correctAnswer: "مرز میان یک موقعیت واقعی و یک اثر هنری را کم‌رنگ می‌کند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "اسپوری به‌جای اینکه فقط از یک میز و اشیای روی آن عکس بگیرد، خودِ آن موقعیت واقعی را به بخشی از اثر تبدیل می‌کند.\nاین کار چه چیزی را تغییر می‌دهد؟",
      textFa: "اسپوری به‌جای اینکه فقط از یک میز و اشیای روی آن عکس بگیرد، خودِ آن موقعیت واقعی را به بخشی از اثر تبدیل می‌کند.\nاین کار چه چیزی را تغییر می‌دهد؟",
      options: ["عکس را به یک سند ساده از زندگی روزمره تبدیل می‌کند.","باعث می‌شود اشیای روزمره دیگر نقشی در اثر نداشته باشند.","مرز میان یک موقعیت واقعی و یک اثر هنری را کم‌رنگ می‌کند."],
      correctAnswer: "مرز میان یک موقعیت واقعی و یک اثر هنری را کم‌رنگ می‌کند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/daniel_spoerri_tableau_piege_1972062939.webp",
      textFa: "اسپوری در مجموعهٔ Tableaux pièges به موقعیت‌هایی از زندگی روزمره توجه می‌کند؛ میزهایی که پس از یک وعدهٔ غذا با ظرف‌ها و اشیای باقی‌مانده همان‌طور رها شده‌اند.\nاما همین موقعیت عادی، با انتخاب هنرمند و ثبت عکاسانه، به اثر تبدیل می‌شود.\nدر اینجا عکس فقط چیزی را که وجود دارد ثبت نمی‌کند. انتخابِ موقعیت و نحوهٔ قرار گرفتن آن در برابر مخاطب، بخشی از ساختن اثر است.\nبه این ترتیب، مرز میان زندگی روزمره و اثر هنری، و میان ثبت کردن و ساختن، کم‌کم از بین می‌رود.",
      textEn: "Freezing time and historic continuity in photography.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/daniel_spoerri_tableau_piege_1972062939.webp",
      textFa: "اسپوری در مجموعهٔ Tableaux pièges به موقعیت‌هایی از زندگی روزمره توجه می‌کند؛ میزهایی که پس از یک وعدهٔ غذا با ظرف‌ها و اشیای باقی‌مانده همان‌طور رها شده‌اند.\nاما همین موقعیت عادی، با انتخاب هنرمند و ثبت عکاسانه، به اثر تبدیل می‌شود.\nدر اینجا عکس فقط چیزی را که وجود دارد ثبت نمی‌کند. انتخابِ موقعیت و نحوهٔ قرار گرفتن آن در برابر مخاطب، بخشی از ساختن اثر است.\nبه این ترتیب، مرز میان زندگی روزمره و اثر هنری، و میان ثبت کردن و ساختن، کم‌کم از بین می‌رود.",
      textEn: "Freezing time and historic continuity in photography.",
    },
  },
  "star-24": {
    id: "star-24",
    starId: "star-24",
    starNumber: "24",
    questionId: "star-q-24",
    galleryId: "gallery_08",
    artworkId: "21",
    galleryNumber: "8",
    galleryNameFa: "تلاقی رسانه‌ها",
    galleryNameEn: "Gallery 09 Name",
    labelTextFa: "عکس، شیء و کلمه",
    titleFa: "سوپ داگر",
    introFa: "وقتی عکس، شیء و کلمه کنار هم قرار بگیرند، معنای اثر از کجا شکل می‌گیرد؟",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "در این اثر، معنای اصلی از کجا شکل می‌گیرد؟",
      textFa: "در این اثر، معنای اصلی از کجا شکل می‌گیرد؟",
      options: ["فقط از خودِ عکس.","فقط از اشیای موجود در اثر.","از رابطه و برخورد میان رسانه‌ها و عناصر مختلف اثر."],
      correctAnswer: "از رابطه و برخورد میان رسانه‌ها و عناصر مختلف اثر.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "در این اثر، معنای اصلی از کجا شکل می‌گیرد؟",
      textFa: "در این اثر، معنای اصلی از کجا شکل می‌گیرد؟",
      options: ["فقط از خودِ عکس.","فقط از اشیای موجود در اثر.","از رابطه و برخورد میان رسانه‌ها و عناصر مختلف اثر."],
      correctAnswer: "از رابطه و برخورد میان رسانه‌ها و عناصر مختلف اثر.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/-0c51e1b3fad442d7.webp",
      textFa: "بروتارس در آثارش مرز میان تصویر، شیء، متن و مفهوم را به هم نزدیک می‌کند.\nدر چنین آثاری، عکس به‌تنهایی حامل معنای اثر نیست. عنوان، شیء، تصویر و اشاره‌های تاریخی در کنار هم قرار می‌گیرند و تجربهٔ مخاطب را شکل می‌دهند.\nاینجا خودِ رابطهٔ میان رسانه‌ها بخشی از اثر است؛ معنایی که نه در یک تصویر، بلکه در گفت‌وگوی میان چند عنصر شکل می‌گیرد",
      textEn: "Material degradation and traces of time.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/-0c51e1b3fad442d7.webp",
      textFa: "بروتارس در آثارش مرز میان تصویر، شیء، متن و مفهوم را به هم نزدیک می‌کند.\nدر چنین آثاری، عکس به‌تنهایی حامل معنای اثر نیست. عنوان، شیء، تصویر و اشاره‌های تاریخی در کنار هم قرار می‌گیرند و تجربهٔ مخاطب را شکل می‌دهند.\nاینجا خودِ رابطهٔ میان رسانه‌ها بخشی از اثر است؛ معنایی که نه در یک تصویر، بلکه در گفت‌وگوی میان چند عنصر شکل می‌گیرد",
      textEn: "Material degradation and traces of time.",
    },
  },
  "star-25": {
    id: "star-25",
    starId: "star-25",
    starNumber: "25",
    questionId: "star-q-25",
    galleryId: "gallery_08",
    artworkId: "22",
    galleryNumber: "8",
    galleryNameFa: "تلاقی رسانه‌ها",
    galleryNameEn: "Gallery 09 Name",
    labelTextFa: "فقط یک عکس؟",
    titleFa: "عکس‌ها و اچینگ‌ها",
    introFa: "وقتی عکس و حکاکی کنار هم قرار می‌گیرند، تصویر دیگر فقط یک عکس است؟",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟",
      textFa: "در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟",
      options: ["یکی جایگزین دیگری می‌شود.","هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.","عکس فقط برای ثبت اچینگ استفاده شده است."],
      correctAnswer: "هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟",
      textFa: "در این اثر، عکس و اچینگ چگونه با یکدیگر کار می‌کنند؟",
      options: ["یکی جایگزین دیگری می‌شود.","هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.","عکس فقط برای ثبت اچینگ استفاده شده است."],
      correctAnswer: "هر دو رسانه در کنار هم قرار می‌گیرند و معنای تصویر را گسترش می‌دهند.",
      correctIndex: 1,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/------3.webp",
      textFa: "عکس و اچینگ دو زبان تصویری متفاوت دارند.\nعکاسی با ثبت، قاب‌بندی و واقعیتِ پیش روی دوربین سروکار دارد؛ اچینگ با خط، سطح و ردّ دست.\nوقتی این دو در کنار هم قرار می‌گیرند، مخاطب فقط به موضوع تصویر نگاه نمی‌کند؛ بلکه متوجه می‌شود تصویر چگونه ساخته شده و هر رسانه چه چیزی به تجربهٔ دیدن اضافه می‌کند.\nاچینگ (Etching) یک روش چاپ هنری است. هنرمند روی یک صفحهٔ فلزی (معمولاً مس) با ماده‌ای اسیدی شیار ایجاد می‌کند. بعد داخل این شیارها جوهر می‌ماند و صفحه روی کاغذ فشرده می‌شود؛ در نتیجه خطوط روی کاغذ چاپ می‌شوند.",
      textEn: "Photography and etching juxtaposition.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/------3.webp",
      textFa: "عکس و اچینگ دو زبان تصویری متفاوت دارند.\nعکاسی با ثبت، قاب‌بندی و واقعیتِ پیش روی دوربین سروکار دارد؛ اچینگ با خط، سطح و ردّ دست.\nوقتی این دو در کنار هم قرار می‌گیرند، مخاطب فقط به موضوع تصویر نگاه نمی‌کند؛ بلکه متوجه می‌شود تصویر چگونه ساخته شده و هر رسانه چه چیزی به تجربهٔ دیدن اضافه می‌کند.\nاچینگ (Etching) یک روش چاپ هنری است. هنرمند روی یک صفحهٔ فلزی (معمولاً مس) با ماده‌ای اسیدی شیار ایجاد می‌کند. بعد داخل این شیارها جوهر می‌ماند و صفحه روی کاغذ فشرده می‌شود؛ در نتیجه خطوط روی کاغذ چاپ می‌شوند.",
      textEn: "Photography and etching juxtaposition.",
    },
  },
  "star-26": {
    id: "star-26",
    starId: "star-26",
    starNumber: "26",
    questionId: "star-q-26",
    galleryId: "gallery_08",
    artworkId: "23",
    galleryNumber: "8",
    galleryNameFa: "تلاقی رسانه‌ها",
    galleryNameEn: "Gallery 09 Name",
    labelTextFa: "تصویری برای ثبت شدن",
    titleFa: "سگ سه پا",
    introFa: "اگر تصویر برای دوربین ساخته شده باشد، هنوز هم فقط یک ثبت است؟",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "در این اثر، عکس چه چیزی را ثبت می‌کند؟",
      textFa: "در این اثر، عکس چه چیزی را ثبت می‌کند؟",
      options: ["نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.","یک اتفاق کاملاً تصادفی.","تصویری که هنرمند هیچ نقشی در شکل‌گیری آن نداشته است."],
      correctAnswer: "نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "در این اثر، عکس چه چیزی را ثبت می‌کند؟",
      textFa: "در این اثر، عکس چه چیزی را ثبت می‌کند؟",
      options: ["نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.","یک اتفاق کاملاً تصادفی.","تصویری که هنرمند هیچ نقشی در شکل‌گیری آن نداشته است."],
      correctAnswer: "نتیجهٔ یک موقعیت و ایده‌ای که برای ساختن تصویر شکل گرفته است.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/48c38c3c6749921f613ae365670cab62.webp",
      textFa: "در آثار وگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.\nدوربین در پایان این فرایند حضور پیدا می‌کند و نتیجه را ثبت می‌کند.\nدر اینجا عکس دیگر فقط شاهد یک اتفاق نیست؛ می‌تواند نتیجهٔ یک موقعیت ساخته‌شده و بخشی از یک فرایند هنری باشد.\nمرز میان «ثبت کردن» و «ساختن» دوباره جابه‌جا می‌شود.",
      textEn: "William Wegman — Three-legged dog staging and capture.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/48c38c3c6749921f613ae365670cab62.webp",
      textFa: "در آثار وگمن، موقعیت، بدن و ایده می‌توانند پیش از حضور دوربین شکل بگیرند.\nدوربین در پایان این فرایند حضور پیدا می‌کند و نتیجه را ثبت می‌کند.\nدر اینجا عکس دیگر فقط شاهد یک اتفاق نیست؛ می‌تواند نتیجهٔ یک موقعیت ساخته‌شده و بخشی از یک فرایند هنری باشد.\nمرز میان «ثبت کردن» و «ساختن» دوباره جابه‌جا می‌شود.",
      textEn: "William Wegman — Three-legged dog staging and capture.",
    },
  },
  "star-27": {
    id: "star-27",
    starId: "star-27",
    starNumber: "27",
    questionId: "star-q-27",
    galleryId: "gallery_07",
    artworkId: "24",
    galleryNumber: "7",
    galleryNameFa: "آونگ زمان",
    galleryNameEn: "Pendulum of Time",
    labelTextFa: "محمدعلی کلی",
    titleFa: "پروژهٔ محمد علی کلی",
    introFa: "در اینجا عکس نه به‌عنوان اثری مستقل، بلکه به‌عنوان بخشی از یک پروژهٔ هنری گسترده‌تر عمل می‌کند.",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "تصویر محمدعلی در اینجا فقط یک پرتره نیست. چه چیزی آن را به یک اثر هنری تبدیل می‌کند؟",
      textFa: "تصویر محمدعلی در اینجا فقط یک پرتره نیست. چه چیزی آن را به یک اثر هنری تبدیل می‌کند؟",
      options: ["فقط شهرت محمدعلی.","فقط فضای ورزشی تصویر.","شخصیت، موقعیت، عکاسی و ایده در کنار هم قرار می‌گیرند."],
      correctAnswer: "شخصیت، موقعیت، عکاسی و ایده در کنار هم قرار می‌گیرند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "تصویر محمدعلی در اینجا فقط یک پرتره نیست. چه چیزی آن را به یک اثر هنری تبدیل می‌کند؟",
      textFa: "تصویر محمدعلی در اینجا فقط یک پرتره نیست. چه چیزی آن را به یک اثر هنری تبدیل می‌کند؟",
      options: ["فقط شهرت محمدعلی.","فقط فضای ورزشی تصویر.","شخصیت، موقعیت، عکاسی و ایده در کنار هم قرار می‌گیرند."],
      correctAnswer: "شخصیت، موقعیت، عکاسی و ایده در کنار هم قرار می‌گیرند.",
      correctIndex: 2,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/--1ef8b4c193afb080d.webp",
      textFa: "در پروژهٔ راجر ولش، تصویر محمدعلی فقط برای ثبت چهرهٔ یک قهرمان ورزشی به کار نمی‌رود.\nشخصیت، فضای تمرین، حضور دوربین و ساختار پروژه در کنار هم قرار می‌گیرند و معنای اثر را شکل می‌دهند.\nدر چنین رویکردی، عکس می‌تواند بخشی از یک فرایند بزرگ‌تر باشد؛ فرایندی که در آن موقعیت و ایده به اندازهٔ خود تصویر اهمیت دارند.",
      textEn: "New media bridging vision with worlds beyond the static frame.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/--1ef8b4c193afb080d.webp",
      textFa: "در پروژهٔ راجر ولش، تصویر محمدعلی فقط برای ثبت چهرهٔ یک قهرمان ورزشی به کار نمی‌رود.\nشخصیت، فضای تمرین، حضور دوربین و ساختار پروژه در کنار هم قرار می‌گیرند و معنای اثر را شکل می‌دهند.\nدر چنین رویکردی، عکس می‌تواند بخشی از یک فرایند بزرگ‌تر باشد؛ فرایندی که در آن موقعیت و ایده به اندازهٔ خود تصویر اهمیت دارند.",
      textEn: "New media bridging vision with worlds beyond the static frame.",
    },
  },
  "star-28": {
    id: "star-28",
    starId: "star-28",
    starNumber: "28",
    questionId: "star-q-28",
    galleryId: "gallery_07",
    artworkId: "25",
    galleryNumber: "7",
    galleryNameFa: "آونگ زمان",
    galleryNameEn: "Pendulum of Time",
    labelTextFa: "کتاب خیابان",
    titleFa: "تمام ساختمان های خیابان سان ست",
    introFa: "اگر یک خیابان را به کتاب تبدیل کنیم، عکس چه شکلی می‌شود؟",
    discoveryCost: 30,
    informationCost: 30,
    discoveryQuestion: {
      question: "روسچا در این اثر، عکس‌های ساختمان‌های خیابان سان‌ست را به‌صورت یک کتاب ارائه می‌کند. با این کار، کتاب چه نقشی در تجربهٔ اثر پیدا می‌کند؟",
      textFa: "روسچا در این اثر، عکس‌های ساختمان‌های خیابان سان‌ست را به‌صورت یک کتاب ارائه می‌کند. با این کار، کتاب چه نقشی در تجربهٔ اثر پیدا می‌کند؟",
      options: ["کتاب فقط محل نگهداری عکس‌ها نیست؛ ورق‌زدن و دنبال کردن تصاویر، بخشی از تجربهٔ حرکت در امتداد خیابان می‌شود.","کتاب فقط برای مرتب کردن و بایگانی عکس‌ها استفاده می‌شود و در تجربهٔ اثر نقشی ندارد.","کتاب باعث می‌شود عکس‌ها از فضای شهری جدا شوند و فقط به تصاویر مستقل از ساختمان‌ها تبدیل شوند."],
      correctAnswer: "کتاب فقط محل نگهداری عکس‌ها نیست؛ ورق‌زدن و دنبال کردن تصاویر، بخشی از تجربهٔ حرکت در امتداد خیابان می‌شود.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    question: {
      question: "روسچا در این اثر، عکس‌های ساختمان‌های خیابان سان‌ست را به‌صورت یک کتاب ارائه می‌کند. با این کار، کتاب چه نقشی در تجربهٔ اثر پیدا می‌کند؟",
      textFa: "روسچا در این اثر، عکس‌های ساختمان‌های خیابان سان‌ست را به‌صورت یک کتاب ارائه می‌کند. با این کار، کتاب چه نقشی در تجربهٔ اثر پیدا می‌کند؟",
      options: ["کتاب فقط محل نگهداری عکس‌ها نیست؛ ورق‌زدن و دنبال کردن تصاویر، بخشی از تجربهٔ حرکت در امتداد خیابان می‌شود.","کتاب فقط برای مرتب کردن و بایگانی عکس‌ها استفاده می‌شود و در تجربهٔ اثر نقشی ندارد.","کتاب باعث می‌شود عکس‌ها از فضای شهری جدا شوند و فقط به تصاویر مستقل از ساختمان‌ها تبدیل شوند."],
      correctAnswer: "کتاب فقط محل نگهداری عکس‌ها نیست؛ ورق‌زدن و دنبال کردن تصاویر، بخشی از تجربهٔ حرکت در امتداد خیابان می‌شود.",
      correctIndex: 0,
      correctReward: 50,
      wrongReward: 0,
      explanation: "",
    },
    discoveryArtwork: {
      image: "https://www.olo.pics/images/2026/09/05/W1siZiIsIjUzNTM3MiJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MTQ0MFx1MDAzZSJdXQ.webp",
      textFa: "در Every Building on the Sunset Strip، روسچا ساختمان‌های دو سوی خیابان سانست در لس‌آنجلس را در امتداد یک نوار تصویری ثبت می‌کند و آن را در قالب یک کتاب هنرمند ارائه می‌دهد.\nدر نتیجه، مخاطب با یک عکس منفرد روبه‌رو نیست. تصاویر در طول کتاب ادامه پیدا می‌کنند و عمل ورق زدن، بخشی از حرکت در میان شهر می‌شود.\nکتاب دیگر فقط جایی برای نگهداری عکس‌ها نیست؛ خودش به بخشی از زبان اثر تبدیل می‌شود.\nعکاسی اینجا از قاب معمول خود بیرون می‌آید و با توالی، صفحه، کتاب و حرکت پیوند می‌خورد.",
      textEn: "Art is no longer merely to be seen, but an environment to be lived and experienced.",
    },
    information: {
      image: "https://www.olo.pics/images/2026/09/05/W1siZiIsIjUzNTM3MiJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MTQ0MFx1MDAzZSJdXQ.webp",
      textFa: "در Every Building on the Sunset Strip، روسچا ساختمان‌های دو سوی خیابان سانست در لس‌آنجلس را در امتداد یک نوار تصویری ثبت می‌کند و آن را در قالب یک کتاب هنرمند ارائه می‌دهد.\nدر نتیجه، مخاطب با یک عکس منفرد روبه‌رو نیست. تصاویر در طول کتاب ادامه پیدا می‌کنند و عمل ورق زدن، بخشی از حرکت در میان شهر می‌شود.\nکتاب دیگر فقط جایی برای نگهداری عکس‌ها نیست؛ خودش به بخشی از زبان اثر تبدیل می‌شود.\nعکاسی اینجا از قاب معمول خود بیرون می‌آید و با توالی، صفحه، کتاب و حرکت پیوند می‌خورد.",
      textEn: "Art is no longer merely to be seen, but an environment to be lived and experienced.",
    },
  },
};

export function getStarDiscovery(
  starPointId: string,
  galleryId: string = "gallery-01",
  starId?: string
): StarDiscoveryItem | null {
  // 1. Resolve known alias / collection point mappings
  let resolvedStarId = starId;
  if (!resolvedStarId && starPointId) {
    const knownMappings: Record<string, string> = {
      "col-8549": "star-16",
      "col-6925": "star-17",
      "col-0594": "star-18",
      "col-g09-01": "star-23",
      "col-g09-02": "star-24",
      "col-g09-03": "star-25",
      "col-g09-04": "star-26",
      "artwork-01": "star-01",
      "artwork-g03-star": "star-03",
    };
    if (knownMappings[starPointId]) {
      resolvedStarId = knownMappings[starPointId];
    }
  }

  // 2. Resolve star from content service (authoritative Google Sheets / Cache)
  const star = contentService.getStarForStarPoint(starPointId, galleryId, resolvedStarId);
  if (star) {
    return mapStarContentToDiscoveryItem(star, starPointId);
  }

  // 3. Fallback from DEFAULT_STAR_DISCOVERIES (exactly 28 stars, strictly matched by identity)
  const targetNum =
    extractCanonicalStarNumber(resolvedStarId) ??
    extractCanonicalStarNumber(starId) ??
    extractCanonicalStarNumber(starPointId);

  const formattedKey = targetNum !== null ? `star-${String(targetNum).padStart(2, "0")}` : null;

  const fallback =
    (formattedKey && DEFAULT_STAR_DISCOVERIES[formattedKey]) ||
    (resolvedStarId && DEFAULT_STAR_DISCOVERIES[resolvedStarId]) ||
    (starId && DEFAULT_STAR_DISCOVERIES[starId]) ||
    (starPointId && DEFAULT_STAR_DISCOVERIES[starPointId]) ||
    null;

  if (fallback) {
    return {
      ...fallback,
      id: starPointId || fallback.id,
      galleryId: galleryId || fallback.galleryId,
    };
  }

  console.warn(`[getStarDiscovery] No StarDiscoveryItem found for point: "${starPointId}", starId: "${starId}"`);
  return null;
}