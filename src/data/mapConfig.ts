import {
  AdminMapPoint,
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
  AdminArrowPoint,
  GalleryConfig,
  GalleryMapConfig,
  MuseumMapDatabase,
} from '../types/admin';

/**
 * ============================================================================
 * MUSEUM MAP CONFIGURATION — SINGLE SOURCE OF TRUTH
 * ============================================================================
 * This persistent map configuration data layer defines the collections,
 * icon points, and navigation arrows for every gallery in SVG viewBox coordinate space.
 *
 * User-facing Gallery views and the Admin Editor both read and write through this layer.
 * All coordinates are relative to the SVG viewBox coordinate system:
 * - Gallery 00: 0 0 1024 1024
 * - Gallery 01: 0 0 848 1264
 * - Gallery 02: 0 0 1000 1000
 * - Gallery 03: 0 0 848 1264
 */

export const GALLERIES: GalleryConfig[] = [
  {
    id: 'gallery-00',
    name: 'Gallery 00 — Museum Archive 01',
    nameFa: 'گالری ۰۰ — آرشیو موزه ۰۱',
    viewBox: '0 0 604.8 844.86',
    width: 604.8,
    height: 844.86,
  },
  {
    id: 'gallery-01',
    name: 'Gallery 01 — Alchemy of Light',
    nameFa: 'گالری ۰۱ — کیمیای نور',
    viewBox: '0 0 524.2 822.62',
    width: 524.2,
    height: 822.62,
  },
  {
    id: 'gallery-02',
    name: 'Gallery 02 — Vault Pavilion (Coming Soon)',
    nameFa: 'گالری ۰۲ — پاویون طاق‌ها (به‌زودی)',
    viewBox: '0 0 524.2 822.62',
    width: 524.2,
    height: 822.62,
  },
  {
    id: 'gallery-03',
    name: 'Gallery 02 — Diplomatic Albums',
    nameFa: 'گالری ۰۲ — آلبوم‌های دیپلماتیک',
    viewBox: '0 0 561.28 851.79',
    width: 561.28,
    height: 851.79,
  },
  {
    id: 'gallery-04',
    name: 'Gallery 03 — Recording Our Endurance',
    nameFa: 'گالری ۰۳ — ثبت دوام ما',
    viewBox: '0 0 498.55 851.79',
    width: 498.55,
    height: 851.79,
  },
  {
    id: 'gallery-05',
    name: 'Gallery 04 — City Rhythm',
    nameFa: 'گالری ۰۴ — ضرب آهنگ شهر',
    viewBox: '0 0 682.05 729.06',
    width: 682.05,
    height: 729.06,
  },
  {
    id: 'gallery-06',
    name: 'Gallery 05 — Between Gaze and Mastery',
    nameFa: 'گالری ۰۵ — در کشاکش تماشا و استیلا',
    viewBox: '0 0 486.92 793.01',
    width: 486.92,
    height: 793.01,
  },
  {
    id: 'gallery-07',
    name: 'Gallery 06 — Passing from Outside to Inside',
    nameFa: 'گالری ۰۶ — گذر از برون به درون',
    viewBox: '0 0 544.58 650',
    width: 544.58,
    height: 650,
  },
  {
    id: 'gallery-08',
    name: 'Gallery 07 — Pendulum of Time',
    nameFa: 'گالری ۰۷ — آونگ زمان',
    viewBox: '0 0 501.5 642.18',
    width: 501.5,
    height: 642.18,
  },
  {
    id: 'gallery-09',
    name: 'Gallery 08 — Intersection of Media',
    nameFa: 'گالری ۰۸ — تلاقی رسانه‌ها',
    viewBox: '0 0 453.09 846.45',
    width: 453.09,
    height: 846.45,
  },
];

/**
 * Core default application configuration embedded in production build
 */
export const DEFAULT_MAP_DATABASE: MuseumMapDatabase = {
  'gallery-00': {
    galleryId: 'gallery-00',
    name: 'Gallery 00 — Museum Archive 01',
    nameFa: 'گالری ۰۰ — آرشیو موزه ۰۱',
    viewBox: '0 0 604.8 844.86',
    width: 604.8,
    height: 844.86,
    collectionPoints: [
      {
        id: 'col-05',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'The Great Central Stele of Knossos',
        roomCode: 'SEC 05',
        roomSection: 'Central Rotunda & Navel Stone',
        x: 302, // 50.0%
        y: 430, // 51.0%
        direction: 'top',
        frames: [
          {
            id: 'col-05-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g00-to-g01',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'Entrance to Gallery 01',
        locationId: 'Location_0',
        x: 512,
        y: 94,
        iconType: 'preset-door',
        width: 36,
        height: 36,
        destination: 'gallery-01',
      },
      {
        id: 'icon-g00-cafe',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'کافه موزه (Museum Café)',
        locationId: 'Location_10',
        x: 426,
        y: 530,
        iconType: 'preset-location-coffee',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-shop',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'فروشگاه موزه (Museum Shop)',
        locationId: 'Location_14',
        x: 192,
        y: 580,
        iconType: 'preset-location-shop',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-frame',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'قاب معرفی آثار (Exhibition Frame)',
        locationId: 'Location_16',
        x: 310,
        y: 628,
        iconType: 'preset-location-frame',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-tree',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'باغ موزه (Museum Garden)',
        locationId: 'Location_13',
        x: 310,
        y: 349,
        iconType: 'preset-location-tree',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-entrance',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'درب ورودی موزه (Entrance)',
        locationId: 'Location_15',
        x: 138,
        y: 637,
        iconType: 'preset-location-entrance',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-wc',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'سرویس بهداشتی (WC)',
        locationId: 'Location_17',
        x: 314,
        y: 496,
        iconType: 'preset-location-wc',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-library',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'کتابخانه تخصصی (Library)',
        locationId: 'Location_11',
        x: 441,
        y: 591,
        iconType: 'preset-location-library',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-cinema',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'سینماتک موزه (Cinema)',
        locationId: 'Location_12',
        x: 230,
        y: 663,
        iconType: 'preset-location-cinema',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-gallery-1',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'گالری ۰۱',
        locationId: 'Location_1',
        x: 309,
        y: 734,
        iconType: 'preset-location-gallery-1',
        galleryNumber: 1,
        width: 32,
        height: 32,
        destination: 'gallery-01',
      },
      {
        id: 'icon-g00-gallery-2',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'گالری ۰۱',
        locationId: 'Location_2',
        x: 165,
        y: 480,
        iconType: 'preset-location-gallery-2',
        galleryNumber: 1,
        width: 32,
        height: 32,
        destination: 'gallery-01',
      },
      {
        id: 'icon-g00-gallery-3',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'گالری ۰۲',
        locationId: 'Location_3',
        x: 162,
        y: 326,
        iconType: 'preset-location-gallery-3',
        galleryNumber: 2,
        width: 32,
        height: 32,
        destination: 'gallery-03',
      },
      {
        id: 'icon-g00-gallery-4',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'گالری ۰۳',
        locationId: 'Location_4',
        x: 162,
        y: 172,
        iconType: 'preset-location-gallery-4',
        galleryNumber: 3,
        width: 32,
        height: 32,
        destination: 'gallery-04',
      },
      {
        id: 'icon-g00-gallery-5',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'گالری ۰۴',
        locationId: 'Location_5',
        x: 313,
        y: 124,
        iconType: 'preset-location-gallery-5',
        galleryNumber: 4,
        width: 32,
        height: 32,
        destination: 'gallery-05',
      },
      {
        id: 'icon-g00-gallery-6',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'گالری ۰۵',
        locationId: 'Location_6',
        x: 466,
        y: 254,
        iconType: 'preset-location-gallery-6',
        galleryNumber: 5,
        width: 32,
        height: 32,
        destination: 'gallery-06',
      },
      {
        id: 'icon-g00-gallery-7',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'گالری ۰۶',
        locationId: 'Location_7',
        x: 418,
        y: 283,
        iconType: 'preset-location-gallery-7',
        galleryNumber: 6,
        width: 26,
        height: 26,
        destination: 'gallery-07',
      },
      {
        id: 'icon-g00-gallery-8',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'گالری ۰۷',
        locationId: 'Location_8',
        x: 427,
        y: 382,
        iconType: 'preset-location-gallery-8',
        galleryNumber: 7,
        width: 32,
        height: 32,
        destination: 'gallery-08',
      },
      {
        id: 'icon-g00-gallery-9',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'گالری ۰۸',
        locationId: 'Location_9',
        x: 463,
        y: 481,
        iconType: 'preset-location-gallery-9',
        galleryNumber: 8,
        width: 32,
        height: 32,
        destination: 'gallery-09',
      },
    ],
    arrows: [
      {
        id: 'arrow-g00-to-g01',
        type: 'arrow',
        galleryId: 'gallery-00',
        title: 'فلش راهنما به گالری ۰۱',
        x: 240,
        y: 583,
        rotation: 315,
        size: 32,
        destination: 'gallery-01',
        visibilityConditions: [],
      },
    ],
  },

  'gallery-01': {
    galleryId: 'gallery-01',
    name: 'Gallery 02 — Alchemy of Light',
    nameFa: 'گالری ۰۲ـ کیمیای نور',
    viewBox: '0 0 524.2 822.62',
    width: 524.2,
    height: 822.62,
    collectionPoints: [
      {
        id: 'artwork-01',
        starId: 'star-01',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-01',
        title: 'تایم‌لاین عکاسی',
        roomSection: 'NORTH ROTUNDA',
        x: 317,
        y: 518,
        frames: [
          { id: 'artwork-01-f1', order: 1, x: 0, y: 0, scale: 1 },
          { id: 'artwork-01-f2', order: 2, x: 0, y: 0, scale: 1 },
          { id: 'artwork-01-f3', order: 3, x: 0, y: 0, scale: 1 },
        ],
      },
      {
        id: 'star-02',
        starId: 'star-02',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-01',
        title: 'مجله‌های Camera Work',
        roomSection: 'VAULT PAVILION',
        x: 137,
        y: 211,
        frames: [],
      },
    ],
    iconPoints: [],
    puzzlePoints: [
      {
        id: 'puzzle-point-01',
        type: 'puzzle',
        galleryId: 'gallery-01',
        title: 'نقطه پازل ۰۱ — قطعه تالار معماری',
        x: 91,
        y: 611,
        questionId: '1',
        puzzlePieceId: 'gallery01-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-point-02',
        type: 'puzzle',
        galleryId: 'gallery-01',
        title: 'نقطه پازل ۰۲ — قطعه جنوب غربی',
        x: 88,
        y: 524,
        questionId: '2',
        puzzlePieceId: 'gallery01-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-point-03',
        type: 'puzzle',
        galleryId: 'gallery-01',
        title: 'نقطه پازل ۰۳ — قطعه شرقی (نهایی)',
        x: 87,
        y: 323,
        questionId: '3',
        puzzlePieceId: 'gallery01-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g01-to-g00',
        type: 'arrow',
        galleryId: 'gallery-01',
        title: 'بازگشت به نقشه اصلی (گالری ۰۱)',
        x: 424,
        y: 1120,
        rotation: 270,
        size: 44,
        destination: 'gallery-00',
        visibilityConditions: [],
      },
      {
        id: 'arrow-g01-to-g03',
        type: 'arrow',
        galleryId: 'gallery-01',
        title: 'فلش راهنما به گالری ۰۳',
        x: 431,
        y: 216,
        rotation: 90,
        size: 44,
        destination: 'gallery-03',
        visibilityConditions: [
          {
            id: 'cond-g01-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-01',
          },
        ],
      },
    ],
  },

  'gallery-02': {
    galleryId: 'gallery-02',
    name: 'Gallery 02 — Vault Pavilion (Coming Soon)',
    nameFa: 'گالری ۰۲ — پاویون طاق‌ها (به‌زودی)',
    viewBox: '0 0 524.2 822.62',
    width: 524.2,
    height: 822.62,
    collectionPoints: [],
    iconPoints: [],
    puzzlePoints: [
      {
        id: 'puzzle-point-01',
        type: 'puzzle',
        galleryId: 'gallery-02',
        title: 'نقطه پازل ۰۱ — قطعه تالار معماری',
        x: 91,
        y: 611,
        questionId: 'gallery01-puzzle-q01',
        puzzlePieceId: 'gallery01-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-point-02',
        type: 'puzzle',
        galleryId: 'gallery-02',
        title: 'نقطه پازل ۰۲ — قطعه جنوب غربی',
        x: 88,
        y: 524,
        questionId: 'gallery01-puzzle-q02',
        puzzlePieceId: 'gallery01-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-point-03',
        type: 'puzzle',
        galleryId: 'gallery-02',
        title: 'نقطه پازل ۰۳ — قطعه شرقی (نهایی)',
        x: 87,
        y: 323,
        questionId: 'gallery01-puzzle-q03',
        puzzlePieceId: 'gallery01-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g02-to-g00',
        type: 'arrow',
        galleryId: 'gallery-02',
        title: 'بازگشت به نقشه اصلی (گالری ۰۱)',
        x: 424,
        y: 1120,
        rotation: 270,
        size: 44,
        destination: 'gallery-00',
        visibilityConditions: [],
      },
      {
        id: 'arrow-g02-to-g03',
        type: 'arrow',
        galleryId: 'gallery-02',
        title: 'ورود به گالری ۰۳',
        x: 431,
        y: 216,
        rotation: 90,
        size: 44,
        destination: 'gallery-03',
        visibilityConditions: [],
      },
    ],
  },

  'gallery-03': {
    galleryId: 'gallery-03',
    name: 'Gallery 03 — Diplomatic Albums',
    nameFa: 'گالری۰۳ـ آلبومهای دیپلماتیک',
    viewBox: '0 0 561.28 851.79',
    width: 561.28,
    height: 851.79,
    collectionPoints: [
      {
        id: 'star-04',
        starId: 'star-04',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-03',
        title: 'چهره‌های مشهور، در یک قاب',
        x: 117,
        y: 266,
        frames: [],
      },
      {
        id: 'star-05',
        starId: 'star-05',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-03',
        title: 'ژاپن در یک قاب',
        x: 117,
        y: 315,
        frames: [],
      },
      {
        id: 'star-06',
        starId: 'star-06',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-03',
        title: 'خودنگارهٔ چرخان نادار',
        x: 442,
        y: 214,
        frames: [],
      },
      {
        id: 'artwork-g03-star',
        starId: 'star-03',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-03',
        title: 'در جست‌وجوی فن و فضیلت',
        roomSection: 'DIPLOMATIC ALBUMS',
        x: 361,
        y: 347,
        frames: [
          { id: 'artwork-g03-f1', order: 1, x: 0, y: 0, scale: 1 },
        ],
      },
    ],
    iconPoints: [],
    puzzlePoints: [
      {
        id: 'puzzle-g03-point-01',
        type: 'puzzle',
        galleryId: 'gallery-02',
        title: 'نقطه پازل ۰۱ — آلبوم‌های دیپلماتیک',
        x: 358,
        y: 524,
        questionId: '4',
        puzzlePieceId: 'gallery03-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g03-point-02',
        type: 'puzzle',
        galleryId: 'gallery-02',
        title: 'نقطه پازل ۰۲ — آلبوم‌های دیپلماتیک',
        x: 358,
        y: 197,
        questionId: '5',
        puzzlePieceId: 'gallery03-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g03-point-03',
        type: 'puzzle',
        galleryId: 'gallery-02',
        title: 'نقطه پازل ۰۳ — آلبوم‌های دیپلماتیک (قطعه نهایی)',
        x: 115,
        y: 521,
        questionId: '6',
        puzzlePieceId: 'gallery03-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g03-to-g02',
        type: 'arrow',
        galleryId: 'gallery-03',
        title: 'بازگشت به گالری ۰۲',
        x: 28,
        y: 645,
        rotation: 270,
        size: 44,
        destination: 'gallery-01',
        visibilityConditions: [],
      },
      {
        id: 'arrow-g03-to-g04',
        type: 'arrow',
        galleryId: 'gallery-03',
        title: 'فلش راهنما به گالری ۰۴',
        x: 532,
        y: 229,
        rotation: 90,
        size: 44,
        destination: 'gallery-04',
        visibilityConditions: [
          {
            id: 'cond-g03-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-02',
          },
        ],
      },
    ],
  },

  'gallery-04': {
    galleryId: 'gallery-04',
    name: 'Gallery 03 — Recording Our Endurance',
    nameFa: 'گالری ۰۳ — ثبت دوام ما',
    viewBox: '0 0 498.55 851.79',
    width: 498.55,
    height: 851.79,
    collectionPoints: [
      {
        id: 'star-07',
        starId: 'star-07',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-04',
        title: 'ایا عکاسی میتواند شبیه نقاشی باشد',
        x: 361,
        y: 740,
        frames: [],
      },
    ],
    iconPoints: [],
    puzzlePoints: [
      {
        id: 'puzzle-g04-point-01',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۱ — ثبت دوام ما',
        x: 359,
        y: 325,
        questionId: '7',
        puzzlePieceId: 'gallery04-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g04-point-02',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۲ — ثبت دوام ما',
        x: 359,
        y: 436,
        questionId: '8',
        puzzlePieceId: 'gallery04-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g04-point-03',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۳ — ثبت دوام ما (قطعه نهایی)',
        x: 359,
        y: 526,
        questionId: '9',
        puzzlePieceId: 'gallery04-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g04-to-g05',
        type: 'arrow',
        galleryId: 'gallery-04',
        title: 'فلش راهنما به گالری ۰۵',
        x: 462.55,
        y: 640,
        rotation: 90,
        size: 44,
        destination: 'gallery-05',
        visibilityConditions: [
          {
            id: 'cond-g04-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-03',
          },
        ],
      },
      {
        id: 'arrow-g04-to-g03',
        type: 'arrow',
        galleryId: 'gallery-04',
        title: 'بازگشت به گالری ۰۳',
        x: 28,
        y: 645,
        rotation: 270,
        size: 44,
        destination: 'gallery-03',
        visibilityConditions: [],
      },
    ],
  },
  'gallery-05': {
    galleryId: 'gallery-05',
    name: 'Gallery 04 — City Rhythm',
    nameFa: 'گالری ۰۴ — ضرب آهنگ شهر',
    viewBox: '0 0 682.05 729.06',
    width: 682.05,
    height: 729.06,
    collectionPoints: [
      {
        id: 'star-08',
        starId: 'star-08',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۰۸ — وقتی شهر از زاویه‌ای تازه دیده می‌شود',
        x: 350,
        y: 205,
        frames: [],
      },
      {
        id: 'star-09',
        starId: 'star-09',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۰۹ — شهری در حال ناپدید شدن',
        x: 264,
        y: 116,
        frames: [],
      },
      {
        id: 'star-10',
        starId: 'star-10',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۱۰ — زندگی روزمره، بخشی از چهره‌ی شهر',
        x: 595,
        y: 240,
        frames: [],
      },
      {
        id: 'star-11',
        starId: 'star-11',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۱۱ — تخریب و دگرگونی شهر',
        x: 433,
        y: 582,
        frames: [],
      },
    ],
    iconPoints: [],
    puzzlePoints: [
      {
        id: 'puzzle-g05-point-01',
        type: 'puzzle',
        galleryId: 'gallery-04',
        title: 'نقطه پازل ۰۱ — ضرب آهنگ شهر',
        x: 467,
        y: 332,
        questionId: '10',
        puzzlePieceId: 'gallery05-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g05-point-02',
        type: 'puzzle',
        galleryId: 'gallery-04',
        title: 'نقطه پازل ۰۲ — ضرب آهنگ شهر',
        x: 346,
        y: 134,
        questionId: '11',
        puzzlePieceId: 'gallery05-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g05-point-03',
        type: 'puzzle',
        galleryId: 'gallery-04',
        title: 'نقطه پازل ۰۳ — ضرب آهنگ شهر (قطعه نهایی)',
        x: 615,
        y: 427,
        questionId: '12',
        puzzlePieceId: 'gallery05-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g05-to-g06',
        type: 'arrow',
        galleryId: 'gallery-05',
        title: 'فلش راهنما به گالری ۰۶',
        x: 461,
        y: 729.06,
        rotation: 180,
        size: 44,
        destination: 'gallery-06',
        visibilityConditions: [
          {
            id: 'cond-g05-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-04',
          },
        ],
      },
      {
        id: 'arrow-g05-to-g04',
        type: 'arrow',
        galleryId: 'gallery-05',
        title: 'بازگشت به گالری ۰۴',
        x: 64,
        y: 227,
        rotation: 270,
        size: 44,
        destination: 'gallery-04',
        visibilityConditions: [],
      },
    ],
  },
  'gallery-06': {
    galleryId: 'gallery-06',
    name: 'Gallery 05 — Between Gaze and Mastery',
    nameFa: 'گالری ۰۵ — در کشاکش تماشا و استیلا',
    viewBox: '0 0 486.92 793.01',
    width: 486.92,
    height: 793.01,
    collectionPoints: [
      {
        id: 'star-12',
        starId: 'star-12',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۲ — سیاستِ نگاه',
        x: 201,
        y: 620,
        frames: [],
      },
      {
        id: 'star-13',
        starId: 'star-13',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۳ — بستر معنا و تصویر',
        x: 200,
        y: 371,
        frames: [],
      },
      {
        id: 'star-14',
        starId: 'star-14',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۴ — تصویر و حافظه',
        x: 200,
        y: 493,
        frames: [],
      },
      {
        id: 'star-15',
        starId: 'star-15',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۵ — افق‌های نوین نقد',
        x: 450,
        y: 310,
        frames: [],
      },
      {
        id: 'col-8549',
        starId: 'star-16',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'اصفهان، نیویورک',
        x: 452,
        y: 368,
        frames: [],
      },
      {
        id: 'col-6925',
        starId: 'star-17',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'پیشنهاد برای تغییر زمین',
        x: 327,
        y: 738,
        frames: [],
      },
    ],
    iconPoints: [],
    puzzlePoints: [
      {
        id: 'puzzle-g06-point-01',
        type: 'puzzle',
        galleryId: 'gallery-05',
        title: 'نقطه پازل ۰۱ — در کشاکش تماشا و استیلا',
        x: 199,
        y: 427,
        questionId: '13',
        puzzlePieceId: 'gallery06-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g06-point-02',
        type: 'puzzle',
        galleryId: 'gallery-05',
        title: 'نقطه پازل ۰۲ — در کشاکش تماشا و استیلا',
        x: 199,
        y: 580,
        questionId: '14',
        puzzlePieceId: 'gallery06-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g06-point-03',
        type: 'puzzle',
        galleryId: 'gallery-05',
        title: 'نقطه پازل ۰۳ — در کشاکش تماشا و استیلا (قطعه نهایی)',
        x: 448,
        y: 582,
        questionId: '15',
        puzzlePieceId: 'gallery06-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g06-to-g05',
        type: 'arrow',
        galleryId: 'gallery-06',
        title: 'بازگشت به گالری ۰۴',
        x: 338,
        y: 28,
        rotation: 0,
        size: 44,
        destination: 'gallery-05',
        visibilityConditions: [],
      },
      {
        id: 'arrow-g06-to-g07',
        type: 'arrow',
        galleryId: 'gallery-06',
        title: 'ورود به گالری ۰۶',
        x: 120,
        y: 282,
        rotation: 180,
        size: 44,
        destination: 'gallery-07',
        visibilityConditions: [
          {
            id: 'cond-g06-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-05',
          },
        ],
      },
    ],
  },
  'gallery-07': {
    galleryId: 'gallery-07',
    name: 'Gallery 07',
    nameFa: 'گذر از برون به درون',
    viewBox: '0 0 544.58 650',
    width: 544.58,
    height: 650,
    collectionPoints: [
      {
        id: 'star-19',
        starId: 'star-19',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'دگردیسی',
        x: 315,
        y: 609,
        frames: [],
      },
    ],
    iconPoints: [],
    puzzlePoints: [
      {
        id: 'puzzle-g07-point-01',
        type: 'puzzle',
        galleryId: 'gallery-06',
        title: 'نقطه پازل ۰۱ — گذر از برون به درون',
        x: 272,
        y: 182,
        questionId: '16',
        puzzlePieceId: 'gallery07-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g07-point-02',
        type: 'puzzle',
        galleryId: 'gallery-06',
        title: 'نقطه پازل ۰۲ — گذر از برون به درون',
        x: 272,
        y: 271,
        questionId: '17',
        puzzlePieceId: 'gallery07-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g07-point-03',
        type: 'puzzle',
        galleryId: 'gallery-06',
        title: 'نقطه پازل ۰۳ — گذر از برون به درون (قطعه نهایی)',
        x: 337,
        y: 370,
        questionId: '18',
        puzzlePieceId: 'gallery07-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g07-to-g06',
        type: 'arrow',
        galleryId: 'gallery-07',
        title: 'بازگشت به گالری ۰۶',
        x: 477,
        y: 68,
        rotation: 90,
        size: 44,
        destination: 'gallery-06',
        visibilityConditions: [],
      },
      {
        id: 'arrow-g07-to-g08',
        type: 'arrow',
        galleryId: 'gallery-07',
        title: 'ورود به گالری ۰۸',
        x: 166,
        y: 595,
        rotation: 270,
        size: 44,
        destination: 'gallery-08',
        visibilityConditions: [
          {
            id: 'cond-g07-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-06',
          },
        ],
      },
    ],
  },
  'gallery-08': {
    galleryId: 'gallery-08',
    name: 'Gallery 07 — Pendulum of Time',
    nameFa: 'گالری ۰۷ — آونگ زمان',
    viewBox: '0 0 501.5 642.18',
    width: 501.5,
    height: 642.18,
    collectionPoints: [
      {
        id: 'star-20',
        starId: 'star-20',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-08',
        title: 'ستاره کشف ۲۰',
        x: 230,
        y: 410,
        frames: [],
      },
      {
        id: 'star-21',
        starId: 'star-21',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-08',
        title: 'ستاره کشف ۲۱',
        x: 470,
        y: 410,
        frames: [],
      },
      {
        id: 'star-22',
        starId: 'star-22',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-08',
        title: 'ستاره کشف ۲۲',
        x: 250,
        y: 550,
        frames: [],
      },
    ],
    iconPoints: [],
    puzzlePoints: [
      {
        id: 'puzzle-g08-point-01',
        type: 'puzzle',
        galleryId: 'gallery-07',
        title: 'نقطه پازل ۰۱ — آونگ زمان',
        x: 40,
        y: 227,
        questionId: '19',
        puzzlePieceId: 'gallery08-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g08-point-02',
        type: 'puzzle',
        galleryId: 'gallery-07',
        title: 'نقطه پازل ۰۲ — آونگ زمان',
        x: 225,
        y: 47,
        questionId: '20',
        puzzlePieceId: 'gallery08-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g08-point-03',
        type: 'puzzle',
        galleryId: 'gallery-07',
        title: 'نقطه پازل ۰۳ — آونگ زمان (قطعه نهایی)',
        x: 121,
        y: 352,
        questionId: '21',
        puzzlePieceId: 'gallery08-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g08-to-g07',
        type: 'arrow',
        galleryId: 'gallery-08',
        title: 'بازگشت به گالری ۰۶',
        x: 448,
        y: 121,
        rotation: 0,
        size: 44,
        destination: 'gallery-07',
        visibilityConditions: [],
      },
      {
        id: 'arrow-g08-to-g09',
        type: 'arrow',
        galleryId: 'gallery-08',
        title: 'ورود به گالری ۰۸',
        x: 228,
        y: 561,
        rotation: 180,
        size: 44,
        destination: 'gallery-09',
        visibilityConditions: [
          {
            id: 'cond-g08-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-07',
          },
        ],
      },
    ],
  },
  'gallery-09': {
    galleryId: 'gallery-09',
    name: 'Gallery 08 — Intersection of Media',
    nameFa: 'گالری ۰۸ — تلاقی رسانه‌ها',
    viewBox: '0 0 453.09 846.45',
    width: 453.09,
    height: 846.45,
    collectionPoints: [
      {
        id: 'col-g09-01',
        starId: 'star-23',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'تابلوی دام',
        x: 251,
        y: 39,
        frames: [],
      },
      {
        id: 'col-g09-02',
        starId: 'star-24',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'سوپ داگر',
        x: 360,
        y: 341,
        frames: [],
      },
      {
        id: 'col-g09-03',
        starId: 'star-25',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'عکس‌ها و اچینگ‌ها',
        x: 355,
        y: 130,
        frames: [],
      },
      {
        id: 'col-g09-04',
        starId: 'star-26',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'سگ سه پا',
        x: 324,
        y: 90,
        frames: [],
      },
      {
        id: 'star-27',
        starId: 'star-27',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'پروژهٔ محمد علی کلی',
        x: 401,
        y: 215,
        frames: [],
      },
      {
        id: 'star-28',
        starId: 'star-28',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'تمام ساختمان های خیابان سان ست',
        x: 253,
        y: 667,
        frames: [],
      },
    ],
    iconPoints: [],
    puzzlePoints: [
      {
        id: 'puzzle-g09-point-01',
        type: 'puzzle',
        galleryId: 'gallery-08',
        title: 'نقطه پازل ۰۱ — تلاقی رسانه‌ها',
        x: 166,
        y: 98,
        questionId: '22',
        puzzlePieceId: 'gallery09-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g09-point-02',
        type: 'puzzle',
        galleryId: 'gallery-08',
        title: 'نقطه پازل ۰۲ — تلاقی رسانه‌ها',
        x: 135,
        y: 342,
        questionId: '23',
        puzzlePieceId: 'gallery09-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g09-point-03',
        type: 'puzzle',
        galleryId: 'gallery-08',
        title: 'نقطه پازل ۰۳ — تلاقی رسانه‌ها (قطعه نهایی)',
        x: 137,
        y: 565,
        questionId: '24',
        puzzlePieceId: 'gallery09-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g09-to-g08',
        type: 'arrow',
        galleryId: 'gallery-09',
        title: 'بازگشت به گالری ۰۷',
        x: 49,
        y: 228,
        rotation: 270,
        size: 44,
        destination: 'gallery-08',
        visibilityConditions: [],
      },
      {
        id: 'arrow-g09-to-g00',
        type: 'arrow',
        galleryId: 'gallery-09',
        title: 'بازگشت به سرسرای موزه',
        x: 256,
        y: 794,
        rotation: 180,
        size: 44,
        destination: 'gallery-00',
        visibilityConditions: [
          {
            id: 'cond-g09-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-08',
          },
        ],
      },
    ],
  },
};

const STORAGE_MAP_CONFIG_KEY = 'museum_map_config_v14';

/**
 * In-memory working database with live persistent synchronization
 */
let memoryDatabase: MuseumMapDatabase | null = null;

/**
 * Loads the complete database from persistent storage with default fallback
 */
export function getAllGalleryMapConfigs(): MuseumMapDatabase {
  if (memoryDatabase) {
    return memoryDatabase;
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_MAP_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Merge defaults with saved data to guarantee schema completeness
          const merged: MuseumMapDatabase = { ...DEFAULT_MAP_DATABASE };
          for (const key of Object.keys(DEFAULT_MAP_DATABASE)) {
            if (parsed[key]) {
              const defaultIcons = DEFAULT_MAP_DATABASE[key]?.iconPoints || [];
              const savedIcons = (parsed[key].iconPoints || []).filter((i: any) => i.id !== 'icon-3527' && i.id !== 'icon-g00-entrance-to-g01');
              const combinedIcons = [...savedIcons];
              for (const defIcon of defaultIcons) {
                if (defIcon.id !== 'icon-3527') {
                  const existingIdx = combinedIcons.findIndex((i: any) => i.id === defIcon.id);
                  if (existingIdx === -1) {
                    combinedIcons.push(defIcon);
                  } else {
                    combinedIcons[existingIdx] = {
                      ...defIcon,
                      ...combinedIcons[existingIdx],
                      iconType: defIcon.iconType,
                      galleryNumber: defIcon.galleryNumber,
                      title: combinedIcons[existingIdx].title || defIcon.title,
                    };
                  }
                }
              }

              const defaultPuzzles = DEFAULT_MAP_DATABASE[key]?.puzzlePoints || [];
              const savedPuzzles = parsed[key].puzzlePoints || [];
              const combinedPuzzles = [...savedPuzzles];
              for (const defPuzzle of defaultPuzzles) {
                const existingIdx = combinedPuzzles.findIndex((p: any) => p.id === defPuzzle.id);
                if (existingIdx === -1) {
                  combinedPuzzles.push(defPuzzle);
                } else {
                  combinedPuzzles[existingIdx] = {
                    ...combinedPuzzles[existingIdx],
                    galleryId: defPuzzle.galleryId,
                    questionId: defPuzzle.questionId,
                  };
                  if (
                    ((key === 'gallery-03' || key === 'gallery_03') && (defPuzzle.id === 'puzzle-g03-point-01' || defPuzzle.id === 'puzzle-g03-point-02' || defPuzzle.id === 'puzzle-g03-point-03')) ||
                    ((key === 'gallery-04' || key === 'gallery_04') && (defPuzzle.id === 'puzzle-g04-point-01' || defPuzzle.id === 'puzzle-g04-point-02' || defPuzzle.id === 'puzzle-g04-point-03')) ||
                    ((key === 'gallery-05' || key === 'gallery_05') && (defPuzzle.id === 'puzzle-g05-point-01' || defPuzzle.id === 'puzzle-g05-point-02' || defPuzzle.id === 'puzzle-g05-point-03')) ||
                    ((key === 'gallery-06' || key === 'gallery_06') && (defPuzzle.id === 'puzzle-g06-point-01' || defPuzzle.id === 'puzzle-g06-point-02' || defPuzzle.id === 'puzzle-g06-point-03')) ||
                    ((key === 'gallery-07' || key === 'gallery_07') && (defPuzzle.id === 'puzzle-g07-point-01' || defPuzzle.id === 'puzzle-g07-point-02' || defPuzzle.id === 'puzzle-g07-point-03')) ||
                    ((key === 'gallery-08' || key === 'gallery_08') && (defPuzzle.id === 'puzzle-g08-point-01' || defPuzzle.id === 'puzzle-g08-point-02' || defPuzzle.id === 'puzzle-g08-point-03')) ||
                    ((key === 'gallery-09' || key === 'gallery_09') && (defPuzzle.id === 'puzzle-g09-point-01' || defPuzzle.id === 'puzzle-g09-point-02' || defPuzzle.id === 'puzzle-g09-point-03'))
                  ) {
                    combinedPuzzles[existingIdx].x = defPuzzle.x;
                    combinedPuzzles[existingIdx].y = defPuzzle.y;
                  }
                }
              }

              const defaultArrows = DEFAULT_MAP_DATABASE[key]?.arrows || [];
              const savedArrows = parsed[key].arrows || [];
              const combinedArrows = [...savedArrows];
              for (const defArrow of defaultArrows) {
                const existingIdx = combinedArrows.findIndex((a: any) => a.id === defArrow.id);
                if (existingIdx === -1) {
                  combinedArrows.push(defArrow);
                } else {
                  combinedArrows[existingIdx] = {
                    ...combinedArrows[existingIdx],
                    size: defArrow.size,
                    rotation: defArrow.rotation,
                    destination: defArrow.destination,
                    visibilityConditions: defArrow.visibilityConditions,
                  };
                }
              }

              const defaultCollections = DEFAULT_MAP_DATABASE[key]?.collectionPoints || [];
              const savedCollections = (parsed[key].collectionPoints || []).filter(
                (c: any) =>
                  !(key === 'gallery-01' && (c.id === 'artwork-02' || c.id === 'artwork-03' || c.id === 'artwork-04')) &&
                  !((key === 'gallery-06' || key === 'gallery_06') && (c.id === 'star-11' || c.id === 'col-0594')) &&
                  !((key === 'gallery-07' || key === 'gallery_07') && (c.id === 'star-16' || c.id === 'star-17' || c.id === 'star-18')) &&
                  !((key === 'gallery-08' || key === 'gallery_08') && (c.id === 'star-23' || c.id === 'star-24' || c.id === 'star-25' || c.id === 'star-26' || c.id === 'star-27' || c.id === 'star-28')) &&
                  !((key === 'gallery-09' || key === 'gallery_09') && (c.id === 'star-20' || c.id === 'star-21' || c.id === 'star-22'))
              );
              const combinedCollections = [...savedCollections];
              for (const defCol of defaultCollections) {
                const existingIdx = combinedCollections.findIndex((c: any) => c.id === defCol.id);
                if (existingIdx === -1) {
                  combinedCollections.push(defCol);
                } else if (defCol.pointType === 'star') {
                  combinedCollections[existingIdx].pointType = 'star';
                  if (defCol.starId) {
                    combinedCollections[existingIdx].starId = defCol.starId;
                  }
                  if (defCol.title) {
                    combinedCollections[existingIdx].title = defCol.title;
                  }
                  if (
                    ((key === 'gallery-01' || key === 'gallery-02' || key === 'gallery_01' || key === 'gallery_02') && (defCol.id === 'artwork-01' || defCol.id === 'star-02')) ||
                    ((key === 'gallery-03' || key === 'gallery_03') && (defCol.id === 'star-04' || defCol.id === 'star-05' || defCol.id === 'star-06' || defCol.id === 'artwork-g03-star' || defCol.starId === 'star-03')) ||
                    ((key === 'gallery-04' || key === 'gallery_04') && (defCol.id === 'star-07')) ||
                    ((key === 'gallery-05' || key === 'gallery_05') && (defCol.id === 'star-08' || defCol.id === 'star-09' || defCol.id === 'star-10' || defCol.id === 'star-11')) ||
                    ((key === 'gallery-06' || key === 'gallery_06') && (defCol.id === 'star-12' || defCol.id === 'star-13' || defCol.id === 'star-14' || defCol.id === 'star-15' || defCol.starId === 'star-16' || defCol.starId === 'star-17' || defCol.starId === 'star-18' || defCol.id === 'col-8549' || defCol.id === 'col-6925')) ||
                    ((key === 'gallery-07' || key === 'gallery_07') && (defCol.id === 'star-19')) ||
                    ((key === 'gallery-08' || key === 'gallery_08') && (defCol.id === 'star-20' || defCol.id === 'star-21' || defCol.id === 'star-22')) ||
                    ((key === 'gallery-09' || key === 'gallery_09') && (defCol.starId === 'star-23' || defCol.starId === 'star-24' || defCol.starId === 'star-25' || defCol.starId === 'star-26' || defCol.id === 'star-27' || defCol.id === 'star-28' || defCol.id === 'col-g09-01' || defCol.id === 'col-g09-02' || defCol.id === 'col-g09-03' || defCol.id === 'col-g09-04'))
                  ) {
                    combinedCollections[existingIdx].x = defCol.x;
                    combinedCollections[existingIdx].y = defCol.y;
                    combinedCollections[existingIdx].starId = defCol.starId;
                    combinedCollections[existingIdx].title = defCol.title;
                  }
                }
              }

              merged[key] = {
                ...DEFAULT_MAP_DATABASE[key],
                ...parsed[key],
                width: DEFAULT_MAP_DATABASE[key]?.width ?? parsed[key].width,
                height: DEFAULT_MAP_DATABASE[key]?.height ?? parsed[key].height,
                viewBox: DEFAULT_MAP_DATABASE[key]?.viewBox ?? parsed[key].viewBox,
                collectionPoints: combinedCollections,
                iconPoints: combinedIcons,
                puzzlePoints: combinedPuzzles,
                arrows: combinedArrows,
              };
            }
          }
          memoryDatabase = merged;
          return memoryDatabase;
        }
      }
    }
  } catch (err) {
    console.error('Error reading map config from storage:', err);
  }

  // Deep clone default database
  memoryDatabase = JSON.parse(JSON.stringify(DEFAULT_MAP_DATABASE));
  return memoryDatabase!;
}

/**
 * Gets the map configuration for a specific gallery
 */
export function getGalleryMapConfig(galleryId: string): GalleryMapConfig {
  const all = getAllGalleryMapConfigs();
  const safeGalleryId = galleryId || 'gallery-01';
  const canonId = safeGalleryId.replace('_', '-');
  const underscoreId = safeGalleryId.replace('-', '_');
  const rawConfig =
    all[safeGalleryId] ||
    all[canonId] ||
    all[underscoreId] ||
    DEFAULT_MAP_DATABASE[safeGalleryId] ||
    DEFAULT_MAP_DATABASE[canonId] ||
    DEFAULT_MAP_DATABASE[underscoreId];
  if (rawConfig) {
    return {
      ...rawConfig,
      collectionPoints: (rawConfig.collectionPoints || [])
        .filter(
          (cp) =>
            !((safeGalleryId === 'gallery-00' || canonId === 'gallery-00' || safeGalleryId === 'gallery_00' || canonId === 'gallery_00') && (cp.id === 'col-02' || cp.id === 'col-04' || cp.id === 'col-07')) &&
            !((safeGalleryId === 'gallery-01' || canonId === 'gallery-01') && (cp.id === 'artwork-02' || cp.id === 'artwork-03' || cp.id === 'artwork-04')) &&
            !((safeGalleryId === 'gallery-06' || canonId === 'gallery-06' || safeGalleryId === 'gallery_06' || canonId === 'gallery_06') && (cp.id === 'star-11' || cp.id === 'col-0594')) &&
            !((safeGalleryId === 'gallery-07' || canonId === 'gallery-07' || safeGalleryId === 'gallery_07' || canonId === 'gallery_07') && (cp.id === 'star-16' || cp.id === 'star-17' || cp.id === 'star-18')) &&
            !((safeGalleryId === 'gallery-08' || canonId === 'gallery-08' || safeGalleryId === 'gallery_08' || canonId === 'gallery_08') && (cp.id === 'star-23' || cp.id === 'star-24' || cp.id === 'star-25' || cp.id === 'star-26' || cp.id === 'star-27' || cp.id === 'star-28')) &&
            !((safeGalleryId === 'gallery-09' || canonId === 'gallery-09' || safeGalleryId === 'gallery_09' || canonId === 'gallery_09') && (cp.id === 'star-20' || cp.id === 'star-21' || cp.id === 'star-22'))
        )
        .map((cp) => ({
          ...cp,
          pointType: cp.pointType || 'normal',
        })),
      iconPoints: (safeGalleryId === 'gallery-00' || canonId === 'gallery-00')
        ? (() => {
            const rawList = rawConfig.iconPoints || [];
            const cafePt = rawList.find((ip) => ip.id === 'icon-g00-cafe');
            const targetWidth = cafePt?.width || 32;
            const targetHeight = cafePt?.height || 32;
            let list = [...rawList];

            const defaultIcons = DEFAULT_MAP_DATABASE['gallery-00']?.iconPoints || [];
            for (const defIcon of defaultIcons) {
              const existingIdx = list.findIndex((ip) => ip.id === defIcon.id);
              const isG7 = defIcon.iconType === 'preset-location-gallery-7' || defIcon.id === 'icon-g00-gallery-7';
              const iconW = isG7 ? Math.round(targetWidth * 0.8) : targetWidth;
              const iconH = isG7 ? Math.round(targetHeight * 0.8) : targetHeight;
              if (existingIdx === -1) {
                list.push({ ...defIcon, width: iconW, height: iconH });
              } else {
                if (defIcon.iconType?.startsWith('preset-location-') || defIcon.locationId) {
                  list[existingIdx] = {
                    ...list[existingIdx],
                    locationId: list[existingIdx].locationId || defIcon.locationId,
                    width: isG7 ? iconW : (list[existingIdx].width || iconW),
                    height: isG7 ? iconH : (list[existingIdx].height || iconH),
                  };
                }
              }
            }
            return list;
          })()
        : (rawConfig.iconPoints || []).filter((ip) => ip.id !== 'icon-3527'),
      puzzlePoints: rawConfig.puzzlePoints || (DEFAULT_MAP_DATABASE[safeGalleryId]?.puzzlePoints ? [...DEFAULT_MAP_DATABASE[safeGalleryId].puzzlePoints!] : []),
      arrows: (() => {
        const baseArrows = rawConfig.arrows || [];
        const defArrows =
          DEFAULT_MAP_DATABASE[safeGalleryId]?.arrows ||
          DEFAULT_MAP_DATABASE[canonId]?.arrows ||
          DEFAULT_MAP_DATABASE[underscoreId]?.arrows ||
          [];
        const res = [...baseArrows];
        for (const da of defArrows) {
          const existingIdx = res.findIndex((a) => a.id === da.id);
          if (existingIdx === -1) {
            res.push(da);
          } else {
            res[existingIdx] = {
              ...res[existingIdx],
              size: da.size,
              rotation: da.rotation,
            };
          }
        }
        return res;
      })(),
    };
  }
  // Fallback default
  return {
    galleryId: safeGalleryId,
    name: safeGalleryId,
    nameFa: safeGalleryId,
    viewBox: '0 0 1000 1000',
    width: 1000,
    height: 1000,
    collectionPoints: [],
    iconPoints: [],
    puzzlePoints: [],
    arrows: [],
  };
}

/**
 * Gets all points (collection + icon + puzzle) for a specific gallery
 */
export function getGalleryPoints(galleryId: string): AdminMapPoint[] {
  const config = getGalleryMapConfig(galleryId);
  return [...config.collectionPoints, ...config.iconPoints, ...(config.puzzlePoints || [])];
}

/**
 * Gets all collection points for a specific gallery
 */
export function getGalleryCollectionPoints(galleryId: string): AdminCollectionPoint[] {
  const config = getGalleryMapConfig(galleryId);
  return config.collectionPoints;
}

/**
 * Gets all custom icon points for a specific gallery
 */
export function getGalleryIconPoints(galleryId: string): AdminIconPoint[] {
  const config = getGalleryMapConfig(galleryId);
  return config.iconPoints;
}

/**
 * Gets all puzzle points for a specific gallery
 */
export function getGalleryPuzzlePoints(galleryId: string): AdminPuzzlePoint[] {
  const config = getGalleryMapConfig(galleryId);
  return config.puzzlePoints || [];
}

/**
 * Gets all navigation arrows for a specific gallery
 */
export function getGalleryArrows(galleryId: string): AdminArrowPoint[] {
  const config = getGalleryMapConfig(galleryId);
  return config.arrows || [];
}

/**
 * Saves all points (split into collection, icon & puzzle) for a gallery
 */
export function saveGalleryPoints(galleryId: string, points: AdminMapPoint[]): void {
  const all = getAllGalleryMapConfigs();
  const current = getGalleryMapConfig(galleryId);

  const collectionPoints = points.filter((p): p is AdminCollectionPoint => p.type === 'collection');
  const iconPoints = points.filter((p): p is AdminIconPoint => p.type === 'icon');
  const puzzlePoints = points.filter((p): p is AdminPuzzlePoint => p.type === 'puzzle');

  all[galleryId] = {
    ...current,
    collectionPoints,
    iconPoints,
    puzzlePoints,
  };

  persistDatabase(all, galleryId);
}

/**
 * Saves all puzzle points for a gallery
 */
export function saveGalleryPuzzlePoints(galleryId: string, puzzlePoints: AdminPuzzlePoint[]): void {
  const all = getAllGalleryMapConfigs();
  const current = getGalleryMapConfig(galleryId);

  all[galleryId] = {
    ...current,
    puzzlePoints,
  };

  persistDatabase(all, galleryId);
}

/**
 * Saves all navigation arrows for a gallery
 */
export function saveGalleryArrows(galleryId: string, arrows: AdminArrowPoint[]): void {
  const all = getAllGalleryMapConfigs();
  const current = getGalleryMapConfig(galleryId);

  all[galleryId] = {
    ...current,
    arrows,
  };

  persistDatabase(all, galleryId);
}

/**
 * Saves a full or partial gallery map configuration
 */
export function saveGalleryConfig(galleryId: string, updates: Partial<GalleryMapConfig>): void {
  const all = getAllGalleryMapConfigs();
  const current = getGalleryMapConfig(galleryId);

  all[galleryId] = {
    ...current,
    ...updates,
  };

  persistDatabase(all, galleryId);
}

/**
 * Resets points for a gallery to default
 */
export function resetGalleryPoints(galleryId: string): AdminMapPoint[] {
  const defaultConf = DEFAULT_MAP_DATABASE[galleryId] || {
    collectionPoints: [],
    iconPoints: [],
  };

  saveGalleryPoints(galleryId, [...defaultConf.collectionPoints, ...defaultConf.iconPoints]);
  return [...defaultConf.collectionPoints, ...defaultConf.iconPoints];
}

/**
 * Resets arrows for a gallery to default
 */
export function resetGalleryArrows(galleryId: string): AdminArrowPoint[] {
  const defaultConf = DEFAULT_MAP_DATABASE[galleryId] || { arrows: [] };
  saveGalleryArrows(galleryId, defaultConf.arrows);
  return defaultConf.arrows;
}

/**
 * Resets an entire gallery configuration to default
 */
export function resetGalleryMapConfig(galleryId: string): GalleryMapConfig {
  const defaultConf = DEFAULT_MAP_DATABASE[galleryId];
  if (defaultConf) {
    saveGalleryConfig(galleryId, JSON.parse(JSON.stringify(defaultConf)));
    return defaultConf;
  }
  return getGalleryMapConfig(galleryId);
}

/**
 * Resets all galleries to factory defaults
 */
export function resetAllGalleries(): void {
  memoryDatabase = JSON.parse(JSON.stringify(DEFAULT_MAP_DATABASE));
  persistDatabase(memoryDatabase!, 'all');
}

/**
 * Creates a new navigation arrow
 */
export function createNewArrow(
  galleryId: string,
  defaultX = 424,
  defaultY = 600
): AdminArrowPoint {
  const currentArrows = getGalleryArrows(galleryId);
  const nextNum = currentArrows.length + 1;
  const numPad = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;

  const newArrow: AdminArrowPoint = {
    id: `arrow-${galleryId}-${Date.now().toString(36)}`,
    type: 'arrow',
    galleryId,
    title: `Arrow ${numPad}`,
    x: defaultX,
    y: defaultY,
    rotation: 0,
    size: 48,
    destination: galleryId === 'gallery-00' ? 'gallery-01' : 'none',
    visibilityConditions: [],
  };

  return newArrow;
}

/**
 * Creates a new puzzle point
 */
export function createNewPuzzlePoint(
  galleryId: string,
  defaultX = 424,
  defaultY = 400
): AdminPuzzlePoint {
  const currentPuzzles = getGalleryPuzzlePoints(galleryId || 'gallery-01');
  const nextNum = currentPuzzles.length + 1;
  const numPad = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  const galleryNum = (galleryId || '').replace(/[^0-9]/g, '') || '01';

  const newPuzzle: AdminPuzzlePoint = {
    id: `puzzle-point-${Date.now().toString(36)}`,
    type: 'puzzle',
    galleryId,
    title: `نقطه پازل ${numPad} (${galleryId})`,
    x: defaultX,
    y: defaultY,
    questionId: `gallery${galleryNum}-puzzle-q${numPad}`,
    puzzlePieceId: `gallery${galleryNum}-piece-${numPad}`,
    isActive: true,
  };

  return newPuzzle;
}

/**
 * Helper to dispatch update events and sync localStorage
 */
function persistDatabase(db: MuseumMapDatabase, galleryId: string): void {
  memoryDatabase = db;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_MAP_CONFIG_KEY, JSON.stringify(db));
    }
  } catch (err) {
    console.error('Error saving map database to localStorage:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('museum_map_config_updated', { detail: { galleryId } })
    );
    window.dispatchEvent(
      new CustomEvent('museum_points_updated', { detail: { galleryId } })
    );
    window.dispatchEvent(
      new CustomEvent('museum_arrows_updated', { detail: { galleryId } })
    );
  }
}
