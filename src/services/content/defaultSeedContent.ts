import { GALLERY_01_QUESTIONS } from '../../data/gallery01Questions';
import { GALLERY_03_QUESTIONS } from '../../data/gallery03Questions';
import { DEFAULT_PUZZLE_QUESTIONS } from '../../data/puzzleQuestionsData';
import { DEFAULT_STAR_DISCOVERIES } from '../../data/starDiscoveryData';
import { GALLERY_01_ARTWORKS } from '../../data/gallery01Artworks';
import { MUSEUM_COLLECTIONS } from '../../data/museumCollections';
import { normalizeGalleryId } from './mappers';
import {
  ArtworkContent,
  ExperienceContent,
  GalleryContent,
  GameContentData,
  LocationContent,
  PopupContent,
  QuestionContent,
  StarContent,
} from './types';

export const DEFAULT_POPUPS: PopupContent[] = [
  {
    id: 'POpup_1',
    popupId: 'POpup_1',
    galleryId: 'gallery_04',
    infoTxt:
      'خسته نباشی\nاگر دوست داری استراحت کنی می تونی به کافه ی موزه سر بزنی و آیتم های جذابش رو امتحان کنی.',
    picture: 'https://www.olo.pics/images/2026/09/25/cafe.webp',
    active: true,
  },
];

export const DEFAULT_LOCATIONS: LocationContent[] = [
  {
    id: 'Location_1',
    locationId: 'Location_1',
    name: 'گالری ۰۱',
    title: 'گالری ها',
    description: 'موزه هنرهای معاصر تهران مجموعه‌ای از ۹ فضای گالری دارد که برای نمایش آثار هنری استفاده می‌شوند. بسته به برنامه موزه، این فضاها می‌توانند میزبان نمایشگاه‌های موقت، آثار مجموعه موزه یا پروژه‌های ویژه باشند. مسیر گالری‌ها به‌صورت پیوسته طراحی شده و بازدیدکننده در جریان حرکت میان آن‌ها به‌تدریج در فضای موزه پیش می‌رود.',
    active: true,
  },
  {
    id: 'Location_2',
    locationId: 'Location_2',
    name: 'گالری ۰۲',
    title: 'گالری ها',
    description: 'موزه هنرهای معاصر تهران مجموعه‌ای از ۹ فضای گالری دارد که برای نمایش آثار هنری استفاده می‌شوند. بسته به برنامه موزه، این فضاها می‌توانند میزبان نمایشگاه‌های موقت، آثار مجموعه موزه یا پروژه‌های ویژه باشند. مسیر گالری‌ها به‌صورت پیوسته طراحی شده و بازدیدکننده در جریان حرکت میان آن‌ها به‌تدریج در فضای موزه پیش می‌رود.',
    active: true,
  },
  {
    id: 'Location_3',
    locationId: 'Location_3',
    name: 'گالری ۰۳',
    title: 'گالری ها',
    description: 'موزه هنرهای معاصر تهران مجموعه‌ای از ۹ فضای گالری دارد که برای نمایش آثار هنری استفاده می‌شوند. بسته به برنامه موزه، این فضاها می‌توانند میزبان نمایشگاه‌های موقت، آثار مجموعه موزه یا پروژه‌های ویژه باشند. مسیر گالری‌ها به‌صورت پیوسته طراحی شده و بازدیدکننده در جریان حرکت میان آن‌ها به‌تدریج در فضای موزه پیش می‌رود.',
    active: true,
  },
  {
    id: 'Location_4',
    locationId: 'Location_4',
    name: 'گالری ۰۴',
    title: 'گالری ها',
    description: 'موزه هنرهای معاصر تهران مجموعه‌ای از ۹ فضای گالری دارد که برای نمایش آثار هنری استفاده می‌شوند. بسته به برنامه موزه، این فضاها می‌توانند میزبان نمایشگاه‌های موقت، آثار مجموعه موزه یا پروژه‌های ویژه باشند. مسیر گالری‌ها به‌صورت پیوسته طراحی شده و بازدیدکننده در جریان حرکت میان آن‌ها به‌تدریج در فضای موزه پیش می‌رود.',
    active: true,
  },
  {
    id: 'Location_5',
    locationId: 'Location_5',
    name: 'گالری ۰۵',
    title: 'گالری ها',
    description: 'موزه هنرهای معاصر تهران مجموعه‌ای از ۹ فضای گالری دارد که برای نمایش آثار هنری استفاده می‌شوند. بسته به برنامه موزه، این فضاها می‌توانند میزبان نمایشگاه‌های موقت، آثار مجموعه موزه یا پروژه‌های ویژه باشند. مسیر گالری‌ها به‌صورت پیوسته طراحی شده و بازدیدکننده در جریان حرکت میان آن‌ها به‌تدریج در فضای موزه پیش می‌رود.',
    active: true,
  },
  {
    id: 'Location_6',
    locationId: 'Location_6',
    name: 'گالری ۰۶',
    title: 'گالری ها',
    description: 'موزه هنرهای معاصر تهران مجموعه‌ای از ۹ فضای گالری دارد که برای نمایش آثار هنری استفاده می‌شوند. بسته به برنامه موزه، این فضاها می‌توانند میزبان نمایشگاه‌های موقت، آثار مجموعه موزه یا پروژه‌های ویژه باشند. مسیر گالری‌ها به‌صورت پیوسته طراحی شده و بازدیدکننده در جریان حرکت میان آن‌ها به‌تدریج در فضای موزه پیش می‌رود.',
    active: true,
  },
  {
    id: 'Location_7',
    locationId: 'Location_7',
    name: 'گالری ۰۷',
    title: 'گالری ها',
    description: 'موزه هنرهای معاصر تهران مجموعه‌ای از ۹ فضای گالری دارد که برای نمایش آثار هنری استفاده می‌شوند. بسته به برنامه موزه، این فضاها می‌توانند میزبان نمایشگاه‌های موقت، آثار مجموعه موزه یا پروژه‌های ویژه باشند. مسیر گالری‌ها به‌صورت پیوسته طراحی شده و بازدیدکننده در جریان حرکت میان آن‌ها به‌تدریج در فضای موزه پیش می‌رود.',
    active: true,
  },
  {
    id: 'Location_8',
    locationId: 'Location_8',
    name: 'گالری ۰۸',
    title: 'گالری ها',
    description: 'موزه هنرهای معاصر تهران مجموعه‌ای از ۹ فضای گالری دارد که برای نمایش آثار هنری استفاده می‌شوند. بسته به برنامه موزه، این فضاها می‌توانند میزبان نمایشگاه‌های موقت، آثار مجموعه موزه یا پروژه‌های ویژه باشند. مسیر گالری‌ها به‌صورت پیوسته طراحی شده و بازدیدکننده در جریان حرکت میان آن‌ها به‌تدریج در فضای موزه پیش می‌رود.',
    active: true,
  },
  {
    id: 'Location_9',
    locationId: 'Location_9',
    name: 'گالری ۰۹',
    title: 'گالری ها',
    description: 'موزه هنرهای معاصر تهران مجموعه‌ای از ۹ فضای گالری دارد که برای نمایش آثار هنری استفاده می‌شوند. بسته به برنامه موزه، این فضاها می‌توانند میزبان نمایشگاه‌های موقت، آثار مجموعه موزه یا پروژه‌های ویژه باشند. مسیر گالری‌ها به‌صورت پیوسته طراحی شده و بازدیدکننده در جریان حرکت میان آن‌ها به‌تدریج در فضای موزه پیش می‌رود.',
    active: true,
  },
  {
    id: 'Location_10',
    locationId: 'Location_10',
    name: 'کافه',
    description: 'کافه در طبقه همکف و کنار درب باغ موزه قرار دارد. برای خرید نوشیدنی یا میان وعده یا کار و دورهمی دوستانه می توانید از فضای کافه ی موزه استفاده کنید.',
    active: true,
  },
  {
    id: 'Location_11',
    locationId: 'Location_11',
    name: 'کتابخانه',
    description: 'کتابفروشی موزه در طبقه همکف و نزدیک درب ورودی اصلی قرار دارد. در این بخش می‌توانید کتاب‌های هنری، نشریات تخصصی، کاتالوگ نمایشگاه‌ها و پوسترهای موزه را تهیه کنید.',
    active: true,
  },
  {
    id: 'Location_12',
    locationId: 'Location_12',
    name: 'سینماتک',
    description: 'سینماتک فضای نمایش فیلم و رویدادهای تصویری موزه است و در طبقه پایین قرار دارد. برای رسیدن به آن، می‌توانید از مسیر پله‌های راهروی ورودی به سمت پایین حرکت کنید.',
    active: true,
  },
  {
    id: 'Location_13',
    locationId: 'Location_13',
    name: 'باغ مجسمه ها',
    description: 'فضای باز پیرامون موزه که مجسمه‌های دائمی از هنرمندان بین‌المللی و ایرانی در آن نصب شده است. برای بازدید از باغ مجسمه‌ها می‌توانید از درب خروجی سمت گالری‌ها یا محوطه بیرونی وارد شوید.',
    active: true,
  },
  {
    id: 'Location_14',
    locationId: 'Location_14',
    name: 'فروشگاه',
    description: 'کتابفروشی موزه در طبقه همکف و نزدیک درب ورودی اصلی قرار دارد. در این بخش می‌توانید کتاب‌های هنری، نشریات تخصصی، کاتالوگ نمایشگاه‌ها و پوسترهای موزه را تهیه کنید.',
    active: true,
  },
  {
    id: 'Location_15',
    locationId: 'Location_15',
    name: 'درب ورودی',
    description: 'ورودی اصلی موزه در خیابان کارگر شمالی قرار دارد و دسترسی به لابی، باجه بلیت و شروع مسیر بازدید از همین نقطه است.',
    active: true,
  },
  {
    id: 'Location_16',
    locationId: 'Location_16',
    name: 'حوض روغن',
    description: 'اثر «ماده و فکر» از نوریوکی هاراگوچی، یکی از مهم‌ترین و شناخته‌شده‌ترین آثار دائمی موزه است که در میانه فضای ورودی و میان گالری‌ها قرار دارد.',
    active: true,
  },
  {
    id: 'Location_17',
    locationId: 'Location_17',
    name: 'سرویس بهداشتی',
    description: 'سرویس بهداشتی در طبقه پایین و قسمت شمالی قرار دارد.',
    active: true,
  },
];

export const DEFAULT_GALLERIES: GalleryContent[] = [
  {
    id: 'gallery_01',
    galleryId: 'gallery_01',
    galleryNumber: '01',
    nameFa: 'کیمیای نور',
    nameEn: 'Alchemy of Light',
    descriptionFa: 'پیدایش و سیر تحول عکاسی در ایران و جهان',
    descriptionEn: 'Origins and Evolution of Photography in Iran and the World',
    curator: 'آنا بهرامی',
    curatorUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    puzzleArtworkId: '26',
    active: true,
  },
  {
    id: 'gallery_02',
    galleryId: 'gallery_02',
    galleryNumber: '02',
    nameFa: 'آلبوم‌های دیپلماتیک',
    nameEn: 'Diplomatic Albums',
    descriptionFa: 'آلبوم‌های تاریخی و عکس‌های تشریفاتی دوره قاجار',
    descriptionEn: 'Historical Albums and Ceremonial Photographs of the Qajar Era',
    curator: 'سهراب کاشانی',
    curatorUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    puzzleArtworkId: '27',
    active: true,
  },
  {
    id: 'gallery_03',
    galleryId: 'gallery_03',
    galleryNumber: '03',
    nameFa: 'ثبت دوام ما',
    nameEn: 'Recording Our Endurance',
    descriptionFa: 'روایت تصویری از هویت، زیست و حافظه جمعی',
    descriptionEn: 'Visual Narrative of Identity, Life, and Collective Memory',
    curator: 'نیلوفر معتمد',
    curatorUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    puzzleArtworkId: '28',
    active: true,
  },
  {
    id: 'gallery_04',
    galleryId: 'gallery_04',
    galleryNumber: '04',
    nameFa: 'ضرب آهنگ شهر',
    nameEn: 'City Rhythm',
    descriptionFa: 'عکاسی خیابانی و نبض دگرگونی‌های شهری',
    descriptionEn: 'Street Photography and the Pulse of Urban Transformations',
    puzzleArtworkId: '29',
    active: true,
  },
  {
    id: 'gallery_05',
    galleryId: 'gallery_05',
    galleryNumber: '05',
    nameFa: 'در کشاکش تماشا و استیلا',
    nameEn: 'Between Gaze and Mastery',
    descriptionFa: 'رویکردهای انتقادی به تصویر و قدرت دیدن',
    descriptionEn: 'Critical Approaches to the Image and the Power of Seeing',
    puzzleArtworkId: '30',
    active: true,
  },
  {
    id: 'gallery_06',
    galleryId: 'gallery_06',
    galleryNumber: '06',
    nameFa: 'گذر از برون به درون',
    nameEn: 'Passing from Outside to Inside',
    descriptionFa: 'روایت‌های شخصی، پرتره‌نگاری و نگاه درون‌نگر',
    descriptionEn: 'Personal Narratives, Portraiture, and Introspective Vision',
    puzzleArtworkId: '31',
    active: true,
  },
  {
    id: 'gallery_07',
    galleryId: 'gallery_07',
    galleryNumber: '07',
    nameFa: 'آونگ زمان',
    nameEn: 'Pendulum of Time',
    descriptionFa: 'گذر زمان در قالب فرم و متریال عکاسانه',
    descriptionEn: 'The Passage of Time in Photographic Form and Material',
    puzzleArtworkId: '32',
    active: true,
  },
  {
    id: 'gallery_08',
    galleryId: 'gallery_08',
    galleryNumber: '08',
    nameFa: 'تلاقی رسانه‌ها',
    nameEn: 'Intersection of Media',
    descriptionFa: 'پیوند عکاسی با رسانه‌ها و هنرهای نوظهور',
    descriptionEn: 'The Union of Photography with Emerging Arts and Media',
    puzzleArtworkId: '33',
    active: true,
  },
];

export const DEFAULT_EXPERIENCES: ExperienceContent[] = [
  {
    id: 'experience_1',
    experienceId: 'experience_1',
    galleryId: 'gallery_02',
    labelFa: 'q',
    title: 'q',
    descriptionFa: 'q',
    imageUrl: 'q',
    iconId: 'reversed-camera',
    active: true,
  },
  {
    id: 'experience_2',
    experienceId: 'experience_2',
    galleryId: 'gallery_03',
    labelFa: 'قرن ۱۹ عکاسخانه',
    title: 'قرن ۱۹ عکاسخانه',
    descriptionFa: 'در قرن نوزدهم، داشتن پرترهٔ عکاسانه برای همه آسان و ارزان نبود.حالا تو می‌توانی برای لحظه‌ای وارد یک عکاسخانهٔ قدیمی شوی.در آتلیه قرار بگیر، ژستت را انتخاب کن و از همراهت بخواه از تو عکس بگیرد.',
    imageUrl: 'https://www.olo.pics/images/2026/09/21/photo_2026-09-21_19-02-36.webp',
    iconId: 'frame',
    active: true,
  },
  {
    id: 'experience_3',
    experienceId: 'experience_3',
    galleryId: 'gallery_03',
    labelFa: 'این بار، خودت را با سایه‌ات ثبت کن',
    title: 'یک پرتره با نور و سایه',
    descriptionFa: 'پیش از آنکه عکاسی پرتره را برای مردم آسان‌تر کند، روش‌های ساده‌تری برای ثبت تصویر انسان وجود داشت.یکی از این روش‌ها، ساختن پرتره از سایه و خط بیرونی بدن بود؛ تصویری ساده که به «سیلوئت» معروف شد و نسبت به بسیاری از پرتره‌های نقاشی‌شده، هزینه و زمان کمتری داشت.حالا تو می‌توانی این تجربه را امتحان کنی.پشت پرده قرار بگیر، نور از پشت تو می‌تابد و سایه‌ات روی قاب شکل می‌گیرد.از همراهت بخواه از سایهٔ تو در قاب عکس بگیرد.',
    imageUrl: 'https://www.olo.pics/images/2026/09/07/photo_2026-09-07_13-03-43.jpg',
    iconId: 'shadow-silhouette',
    active: true,
  },
  {
    id: 'experience_4',
    experienceId: 'experience_4',
    galleryId: 'gallery_03',
    labelFa: 'حالا نوبت توست که وارد قاب شوی',
    title: 'یک پرتره، از زاویه‌ای دیگر',
    descriptionFa: 'در پرتره، فقط چهرهٔ فرد مهم نیست؛ژست، زاویه، نگاه و حتی تصویری که از خودمان می‌سازیم، بخشی از عکس است.حالا روبه‌روی آینه بایست و خودت را در قاب ببین.',
    iconId: 'mirror',
    active: true,
  },
  {
    id: 'experience_5',
    experienceId: 'experience_5',
    galleryId: 'gallery_04',
    labelFa: 'کمرا آبسورا',
    title: 'کمرا ابسورا',
    descriptionFa: 'جلوی دوربین قدیمی بایست.درون دوربین، تصویر تو و منظره‌ی پشت سرت ــ باغ مجسمه ــ به شکل وارونه دیده می‌شود.از همراهت بخواه با گوشی از تصویری که داخل دوربین می‌بینی عکس بگیرد.حالا عکس را در گوشی ۱۸۰ درجه بچرخان و ببین تصویر دوباره درست می‌شود.',
    iconId: 'vintage-camera',
    active: true,
  },
  {
    id: 'experience_6',
    experienceId: 'experience_6',
    galleryId: 'gallery_04',
    labelFa: 'حالا خودت را در قاب شهر پیدا کن.',
    title: 'آینهٔ قاب‌ها',
    descriptionFa: 'این بار، خودت موضوع عکس هستی. یک آینه‌ی بزرگ روبه‌رویت قرار دارد و چند قاب روی آن، تصویرت را به شکل‌های مختلف در بر می‌گیرند.جلوی آینه بایست، قاب مورد علاقه‌ات را پیدا کن و گوشی‌ات را روبه‌روی آینه بگیر.حالا از تصویر خودت در قاب عکس بگیر.قاب دیگری را امتحان کن و جای خودت را تغییر بده؛ ببین چطور با تغییر قاب و جایگاه تو، تصویرت هم تغییر می‌کند.',
    iconId: 'mirror-selfie',
    active: true,
  },
  {
    id: 'experience_7',
    experienceId: 'experience_7',
    galleryId: 'gallery_07',
    labelFa: 'لحظهٔ ظهور یک تصویر',
    title: 'تاریکخانه',
    descriptionFa: 'در تاریکیِ اتاق، نور بسیار کمی وجود دارد.چند میز و وسایل یک تاریکخانهٔ عکاسی قدیمی در فضا دیده می‌شود.در این تجربه، می‌توانی برای لحظه‌ای وارد فرایند ظهور عکس شوی؛ همان جایی که تصویر هنوز دیده نمی‌شود و باید صبر کرد تا کم‌کم از دل کاغذ ظاهر شود.نور قرمزِ کم‌رنگ، ظرف‌های ظهور و صدای آرام فضای تاریکخانه، محیط را شبیه یک تاریکخانهٔ قدیمی می‌کنند.در اینجا تصویر یک‌باره ظاهر نمی‌شود؛ زمان بخشی از فرایند ساختن آن است.در عکاسی آنالوگ، ثبت تصویر با فشردن دکمهٔ دوربین به پایان نمی‌رسد. پس از نوردهی، فیلم یا کاغذ حساس به نور باید در تاریکخانه با مواد شیمیایی پردازش شود تا تصویر ثبت‌شده به‌تدریج قابل مشاهده شود. در چاپ‌های عکاسی، کاغذ حساس ابتدا در محلول ظهور قرار می‌گیرد و تصویر کم‌کم از سطح سفید آن پدیدار می‌شود؛ سپس با توقف فرایند و ثبوت، تصویر پایدارتر می‌شود و در پایان شست‌وشو و خشک می‌شود. به همین دلیل، تاریکخانه فقط یک فضای فنی برای تولید عکس نبود؛ مکانی بود که در آن زمان، نور و ماده در شکل‌گیری تصویر نقش مستقیم داشتند. چیزی که دوربین در کسری از ثانیه ثبت کرده بود، برای تبدیل شدن به یک عکس قابل دیدن به فرایندی زمانمند نیاز داشت. این تجربه فرصتی است برای دیدن همین فاصله؛ فاصله‌ای میان لحظهٔ ثبت و لحظهٔ ظاهر شدن تصویر.',
    iconId: 'darkroom',
    active: true,
  },
];

/**
 * Builds bundled fallback seed data from existing in-repo datasets.
 * Used when offline and no previous cache exists, or before external URLs are configured.
 */
export function buildDefaultSeedContent(): GameContentData {
  // 1. Questions Seed
  const questions: QuestionContent[] = [];

  // Gallery 01 Questions
  GALLERY_01_QUESTIONS.forEach((q, idx) => {
    questions.push({
      id: `g01-q${q.id}`,
      galleryId: 'gallery_01',
      questionOrder: idx + 1,
      title: `تالار ۰۱ — سوال ${q.id}`,
      question: q.question,
      questionFa: q.question,
      options: [...q.options],
      optionsFa: [...q.options],
      correctAnswer: q.options[0] || '',
      correctIndex: 0,
      category: 'gallery',
      reward: 50,
      active: true,
    });
  });

  // Gallery 03 Questions
  GALLERY_03_QUESTIONS.forEach((q, idx) => {
    questions.push({
      id: `g03-q${q.id}`,
      galleryId: 'gallery_03',
      questionOrder: idx + 1,
      title: `تالار ۰۳ — سوال ${q.id}`,
      question: q.question,
      questionFa: q.question,
      options: [...q.options],
      optionsFa: [...q.options],
      correctAnswer: q.options[0] || '',
      correctIndex: 0,
      category: 'gallery',
      reward: 50,
      active: true,
    });
  });

  // Puzzle Questions
  Object.values(DEFAULT_PUZZLE_QUESTIONS).forEach((pq) => {
    const canonGId = normalizeGalleryId(pq.galleryId);
    let puzzlePointId = '';
    const orderMatch = pq.id.match(/q0*([1-3])$/i) || pq.id.match(/0*([1-3])$/i);
    const orderNum = orderMatch ? parseInt(orderMatch[1], 10) : 1;

    if (canonGId === 'gallery_01') {
      puzzlePointId = orderNum === 1 ? 'puzzle-point-01' : orderNum === 2 ? 'puzzle-point-02' : 'puzzle-point-03';
    } else if (canonGId === 'gallery_02') {
      puzzlePointId = `puzzle-g03-point-${String(orderNum).padStart(2, '0')}`;
    } else if (canonGId === 'gallery_03') {
      puzzlePointId = `puzzle-g04-point-${String(orderNum).padStart(2, '0')}`;
    } else if (canonGId === 'gallery_04') {
      puzzlePointId = `puzzle-g05-point-${String(orderNum).padStart(2, '0')}`;
    } else if (canonGId === 'gallery_05') {
      puzzlePointId = `puzzle-g06-point-${String(orderNum).padStart(2, '0')}`;
    } else if (canonGId === 'gallery_06') {
      puzzlePointId = `puzzle-g07-point-${String(orderNum).padStart(2, '0')}`;
    } else if (canonGId === 'gallery_07') {
      puzzlePointId = `puzzle-g08-point-${String(orderNum).padStart(2, '0')}`;
    } else if (canonGId === 'gallery_08') {
      puzzlePointId = `puzzle-g09-point-${String(orderNum).padStart(2, '0')}`;
    } else {
      const gNum = canonGId.replace(/[^0-9]/g, '');
      puzzlePointId = `puzzle-g${gNum}-point-${String(orderNum).padStart(2, '0')}`;
    }

    questions.push({
      id: pq.id,
      galleryId: canonGId,
      puzzlePointId,
      questionOrder: orderNum,
      title: pq.title,
      question: pq.question,
      questionFa: pq.question,
      options: [...pq.options],
      optionsFa: [...pq.options],
      correctAnswer: pq.options[pq.correctIndex] || '',
      correctIndex: pq.correctIndex,
      explanation: pq.explanation,
      category: 'puzzle',
      puzzlePieceId: pq.puzzlePieceId,
      artworkId: pq.artworkId,
      reward: 50,
      active: true,
    });
  });

  // 2. Stars Seed
  const rawStarDiscoveries =
    typeof DEFAULT_STAR_DISCOVERIES !== 'undefined' && DEFAULT_STAR_DISCOVERIES
      ? DEFAULT_STAR_DISCOVERIES
      : {};
  const stars: StarContent[] = Object.values(rawStarDiscoveries).map((star) => ({
    id: star.id,
    starId: star.starId || star.id,
    starNumber: star.starNumber || star.id.replace(/^star[-_]?/i, ''),
    questionId: star.questionId || `star-q-${String(star.starNumber || star.id.replace(/^star[-_]?/i, '')).padStart(2, '0')}`,
    galleryId: star.galleryId,
    artworkId: (star as any).artworkId,
    labelTextFa: star.labelTextFa,
    titleFa: star.titleFa,
    introFa: star.introFa,
    discoveryCost: star.discoveryCost || 30,
    informationCost: star.informationCost || 30,
    questionText: star.question?.question || star.discoveryQuestion?.question || '',
    questionOptions: star.question?.options || star.discoveryQuestion?.options || [],
    correctAnswer: star.question?.correctAnswer || star.discoveryQuestion?.correctAnswer || '',
    correctIndex: star.question?.correctIndex ?? star.discoveryQuestion?.correctIndex ?? 0,
    reward: star.question?.correctReward ?? 50,
    wrongReward: star.question?.wrongReward ?? 0,
    explanation: star.question?.explanation,
    artworkImageUrl: star.information?.image || star.discoveryArtwork?.image || '',
    artworkTextFa: star.information?.textFa || star.discoveryArtwork?.textFa || '',
    artworkTextEn: star.information?.textEn || star.discoveryArtwork?.textEn || '',
  }));

  // 3. Artworks Seed
  const artworks: ArtworkContent[] = [
    { id: '1', artworkId: '1', galleryId: 'gallery-01', title: 'شاخه سرخس', imageUrl: 'https://www.olo.pics/images/2026/09/05/fbf69bdd63db1cdf72428b93ad065dbf.webp' },
    { id: '2', artworkId: '2', galleryId: 'gallery-01', title: 'پرتره درباری', imageUrl: 'https://www.olo.pics/images/2026/09/05/1934-012.webp' },
    { id: '3', artworkId: '3', galleryId: 'gallery-01', title: 'پلکان کاخ گلستان', imageUrl: 'https://www.olo.pics/images/2026/09/05/1934-011.webp' },
    { id: '4', artworkId: '4', galleryId: 'gallery-01', title: 'میدان مشق تهران', imageUrl: 'https://www.olo.pics/images/2026/09/05/1934-010.webp' },
    { id: '5', artworkId: '5', galleryId: 'gallery-01', title: 'عکاسخانه ناصری', imageUrl: 'https://www.olo.pics/images/2026/09/05/1932-012.webp' },
    { id: '6', artworkId: '6', galleryId: 'gallery-01', title: 'شمس العماره', imageUrl: 'https://www.olo.pics/images/2026/09/05/970329_15.webp' },
    { id: '26', artworkId: '26', galleryId: 'gallery_01', title: 'پازل گالری ۰۱', imageUrl: 'https://www.olo.pics/images/2026/09/05/45fa62f550893fd78aad04a202819595.webp' },
    { id: '27', artworkId: '27', galleryId: 'gallery_02', title: 'پازل گالری ۰۲', imageUrl: 'https://www.olo.pics/images/2026/09/05/1931-004.webp' },
    { id: '28', artworkId: '28', galleryId: 'gallery_03', title: 'پازل گالری ۰۳', imageUrl: 'https://www.olo.pics/images/2026/09/05/1931-006.webp' },
    { id: '29', artworkId: '29', galleryId: 'gallery_04', title: 'پازل گالری ۰۴', imageUrl: 'https://www.olo.pics/images/2026/09/05/1931-008.webp' },
    { id: '30', artworkId: '30', galleryId: 'gallery_05', title: 'پازل گالری ۰۵', imageUrl: 'https://www.olo.pics/images/2026/09/05/1931-010.webp' },
    { id: '31', artworkId: '31', galleryId: 'gallery_06', title: 'پازل گالری ۰۶', imageUrl: 'https://www.olo.pics/images/2026/09/05/1931-012.webp' },
    { id: '32', artworkId: '32', galleryId: 'gallery_07', title: 'پازل گالری ۰۷', imageUrl: 'https://www.olo.pics/images/2026/09/05/1931-014.webp' },
    { id: '33', artworkId: '33', galleryId: 'gallery_08', title: 'پازل گالری ۰۸', imageUrl: 'https://www.olo.pics/images/2026/09/05/1931-016.webp' },
    { id: '37', artworkId: '37', galleryId: 'gallery-04', title: 'پرتره ادوارد استایکن', imageUrl: 'https://www.olo.pics/images/2026/09/05/--d9a6a2eaf8714280.webp' },
    { id: '41', artworkId: '41', galleryId: 'gallery_05', title: 'کارگر صنعتی — لوییس هاین', imageUrl: 'https://www.olo.pics/images/2026/09/05/1931-008.webp' },
    { id: '42', artworkId: '42', galleryId: 'gallery_05', title: 'زلزله سان‌فرانسیسکو — آرنولد گنته', imageUrl: 'https://www.olo.pics/images/2026/09/05/1931-008.webp' },
  ];

  // Gallery 01 Artworks
  GALLERY_01_ARTWORKS.forEach((art) => {
    artworks.push({
      id: art.id,
      galleryId: 'gallery-01',
      title: art.title,
      roomSection: art.roomSection,
      x: art.x,
      y: art.y,
    });
  });

  // Museum Gallery 00 Collections
  MUSEUM_COLLECTIONS.forEach((col) => {
    artworks.push({
      id: col.id,
      galleryId: 'gallery-00',
      title: col.title,
      roomSection: col.roomCode,
      period: col.period,
      x: col.mapX,
      y: col.mapY,
      description: col.curatorNote,
      imageUrl: col.placeholderImage?.realImageUrl,
    });
  });

  return {
    questions,
    stars,
    artworks,
    galleries: DEFAULT_GALLERIES,
    experiences: DEFAULT_EXPERIENCES,
    locations: DEFAULT_LOCATIONS,
    popups: DEFAULT_POPUPS,
    metadata: {
      loadedAt: Date.now(),
      source: 'seed-fallback',
      version: '1.0.0',
    },
  };
}
