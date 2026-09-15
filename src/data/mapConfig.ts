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
    name: 'Gallery 02 — Alchemy of Light',
    nameFa: 'گالری ۰۲ـ کیمیای نور',
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
    name: 'Gallery 03 — Diplomatic Albums',
    nameFa: 'گالری۰۳ـ آلبومهای دیپلماتیک',
    viewBox: '0 0 561.28 851.79',
    width: 561.28,
    height: 851.79,
  },
  {
    id: 'gallery-04',
    name: 'Gallery 04 — Recording Our Endurance',
    nameFa: 'گالری ۰۴ — ثبت دوام ما',
    viewBox: '0 0 498.55 851.79',
    width: 498.55,
    height: 851.79,
  },
  {
    id: 'gallery-05',
    name: 'Gallery 05 — City Rhythm',
    nameFa: 'گالری ۰۵ — ضرب آهنگ شهر',
    viewBox: '0 0 682.05 729.06',
    width: 682.05,
    height: 729.06,
  },
  {
    id: 'gallery-06',
    name: 'Gallery 06 — Between Gaze and Mastery',
    nameFa: 'گالری ۰۶ — در کشاکش تماشا و استیلا',
    viewBox: '0 0 486.92 793.01',
    width: 486.92,
    height: 793.01,
  },
  {
    id: 'gallery-07',
    name: 'Gallery 07 — Passing from Outside to Inside',
    nameFa: 'گالری ۰۷ — گذر از برون به درون',
    viewBox: '0 0 544.58 650',
    width: 544.58,
    height: 650,
  },
  {
    id: 'gallery-08',
    name: 'Gallery 08 — Pendulum of Time',
    nameFa: 'گالری ۰۸ — آونگ زمان',
    viewBox: '0 0 501.5 642.18',
    width: 501.5,
    height: 642.18,
  },
  {
    id: 'gallery-09',
    name: 'Gallery 09 — Intersection of Media',
    nameFa: 'گالری ۰۹ — تلاقی رسانه‌ها',
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
        x: 302, // 50%
        y: 78,  // ~9.2%
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
        x: 425,
        y: 550,
        iconType: 'preset-location-coffee',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-frame',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'قاب معرفی آثار (Exhibition Frame)',
        x: 308,
        y: 667,
        iconType: 'preset-location-frame',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-shop',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'فروشگاه موزه (Museum Shop)',
        x: 186,
        y: 620,
        iconType: 'preset-location-shop',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
      {
        id: 'icon-g00-tree',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'باغ موزه (Museum Garden)',
        x: 310,
        y: 349,
        iconType: 'preset-location-tree',
        width: 32,
        height: 32,
        destination: 'gallery-00',
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
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-01',
        title: 'North Apse Monolith',
        roomSection: 'NORTH ROTUNDA',
        x: 137,
        y: 211,
        frames: [
          { id: 'artwork-01-f1', order: 1, x: 0, y: 0, scale: 1 },
          { id: 'artwork-01-f2', order: 2, x: 0, y: 0, scale: 1 },
          { id: 'artwork-01-f3', order: 3, x: 0, y: 0, scale: 1 },
        ],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g01-questions',
        type: 'icon',
        galleryId: 'gallery-01',
        title: 'Gallery 01 Questions & Quiz',
        x: 203,
        y: 395,
        iconType: 'preset-question',
        width: 28,
        height: 36,
        destination: 'gallery-01-questions',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-point-01',
        type: 'puzzle',
        galleryId: 'gallery-01',
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
        galleryId: 'gallery-01',
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
        galleryId: 'gallery-01',
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
        rotation: 180,
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
    collectionPoints: [
      {
        id: 'artwork-01',
        starId: 'star-01',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-02',
        title: 'North Apse Monolith',
        roomSection: 'NORTH ROTUNDA',
        x: 137,
        y: 211,
        frames: [],
      },
      {
        id: 'star-02',
        starId: 'star-02',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-02',
        title: 'Camera Work Magazine',
        roomSection: 'VAULT PAVILION',
        x: 317,
        y: 518,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g01-questions',
        type: 'icon',
        galleryId: 'gallery-02',
        title: 'Gallery 02 Questions & Quiz',
        x: 203,
        y: 395,
        iconType: 'preset-question',
        width: 28,
        height: 36,
        destination: 'gallery-01-questions',
      },
    ],
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
        rotation: 180,
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
        x: 362,
        y: 227,
        frames: [],
      },
      {
        id: 'star-05',
        starId: 'star-05',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-03',
        title: 'ژاپن در یک قاب',
        x: 120,
        y: 504,
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
        title: 'عکاسی در گذر زمان',
        roomSection: 'MODERN ROTUNDA',
        x: 363,
        y: 446,
        frames: [
          { id: 'artwork-g03-f1', order: 1, x: 0, y: 0, scale: 1 },
        ],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g03-questions',
        type: 'icon',
        galleryId: 'gallery-03',
        title: 'Gallery 03 Questions & Quiz',
        x: 240,
        y: 374,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-03-questions',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-g03-point-01',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۱ — تالار معاصر',
        x: 359,
        y: 316,
        questionId: 'gallery03-puzzle-q01',
        puzzlePieceId: 'gallery03-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g03-point-02',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۲ — تالار معاصر',
        x: 117,
        y: 229,
        questionId: 'gallery03-puzzle-q02',
        puzzlePieceId: 'gallery03-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g03-point-03',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۳ — تالار معاصر (قطعه نهایی)',
        x: 117,
        y: 402,
        questionId: 'gallery03-puzzle-q03',
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
            galleryId: 'gallery-03',
          },
        ],
      },
    ],
  },

  'gallery-04': {
    galleryId: 'gallery-04',
    name: 'Gallery 04',
    nameFa: 'ثبت دوام ما',
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
        x: 240,
        y: 800,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g04-info',
        type: 'icon',
        galleryId: 'gallery-04',
        title: 'اطلاعات گالری ۰۴',
        x: 244,
        y: 387,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-04',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-g04-point-01',
        type: 'puzzle',
        galleryId: 'gallery-04',
        title: 'نقطه پازل ۰۱ — ثبت دوام ما',
        x: 359,
        y: 454,
        questionId: 'gallery04-puzzle-q01',
        puzzlePieceId: 'gallery04-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g04-point-02',
        type: 'puzzle',
        galleryId: 'gallery-04',
        title: 'نقطه پازل ۰۲ — ثبت دوام ما',
        x: 359,
        y: 346,
        questionId: 'gallery04-puzzle-q02',
        puzzlePieceId: 'gallery04-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g04-point-03',
        type: 'puzzle',
        galleryId: 'gallery-04',
        title: 'نقطه پازل ۰۳ — ثبت دوام ما (قطعه نهایی)',
        x: 359,
        y: 220,
        questionId: 'gallery04-puzzle-q03',
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
            galleryId: 'gallery-04',
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
    name: 'Gallery 05',
    nameFa: 'ضرب آهنگ شهر',
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
        x: 456,
        y: 58,
        frames: [],
      },
      {
        id: 'star-09',
        starId: 'star-09',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۰۹ — شهری در حال ناپدید شدن',
        x: 245,
        y: 58,
        frames: [],
      },
      {
        id: 'star-10',
        starId: 'star-10',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۱۰ — زندگی روزمره، بخشی از چهره‌ی شهر',
        x: 469,
        y: 338,
        frames: [],
      },
      {
        id: 'star-11',
        starId: 'star-11',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۱۱ — تخریب و دگرگونی شهر',
        x: 455,
        y: 611,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g05-info',
        type: 'icon',
        galleryId: 'gallery-05',
        title: 'اطلاعات گالری ۰۵',
        x: 215,
        y: 242,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-05',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-g05-point-01',
        type: 'puzzle',
        galleryId: 'gallery-05',
        title: 'نقطه پازل ۰۱ — ضرب آهنگ شهر',
        x: 358,
        y: 212,
        questionId: '10',
        puzzlePieceId: 'gallery05-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g05-point-02',
        type: 'puzzle',
        galleryId: 'gallery-05',
        title: 'نقطه پازل ۰۲ — ضرب آهنگ شهر',
        x: 615,
        y: 221,
        questionId: '11',
        puzzlePieceId: 'gallery05-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g05-point-03',
        type: 'puzzle',
        galleryId: 'gallery-05',
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
            galleryId: 'gallery-05',
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
    name: 'Gallery 06',
    nameFa: 'در کشاکش تماشا و استیلا',
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
        x: 451,
        y: 536,
        frames: [],
      },
      {
        id: 'star-13',
        starId: 'star-13',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۳ — بستر معنا و تصویر',
        x: 451,
        y: 641,
        frames: [],
      },
      {
        id: 'star-14',
        starId: 'star-14',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۴ — تصویر و حافظه',
        x: 450,
        y: 588,
        frames: [],
      },
      {
        id: 'star-15',
        starId: 'star-15',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۵ — افق‌های نوین نقد',
        x: 449,
        y: 339,
        frames: [],
      },
      {
        id: 'col-8549',
        starId: 'col-8549',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'مجموعه جدید (8549-col)',
        x: 200,
        y: 359,
        frames: [],
      },
      {
        id: 'col-6925',
        starId: 'col-6925',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'مجموعه جدید (6925-col)',
        x: 327,
        y: 738,
        frames: [],
      },
      {
        id: 'col-0594',
        starId: 'col-0594',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'مجموعه جدید (0594-col)',
        x: 50,
        y: 153,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g06-info',
        type: 'icon',
        galleryId: 'gallery-06',
        title: 'اطلاعات گالری ۰۶',
        x: 325,
        y: 460,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-06',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-g06-point-01',
        type: 'puzzle',
        galleryId: 'gallery-06',
        title: 'نقطه پازل ۰۱ — در کشاکش تماشا و استیلا',
        x: 198,
        y: 608,
        questionId: '13',
        puzzlePieceId: 'gallery06-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g06-point-02',
        type: 'puzzle',
        galleryId: 'gallery-06',
        title: 'نقطه پازل ۰۲ — در کشاکش تماشا و استیلا',
        x: 198,
        y: 455,
        questionId: '14',
        puzzlePieceId: 'gallery06-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g06-point-03',
        type: 'puzzle',
        galleryId: 'gallery-06',
        title: 'نقطه پازل ۰۳ — در کشاکش تماشا و استیلا (قطعه نهایی)',
        x: 448,
        y: 433,
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
        title: 'بازگشت به گالری ۰۵',
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
        title: 'ورود به گالری ۰۷',
        x: 120,
        y: 282,
        rotation: 180,
        size: 44,
        destination: 'gallery-07',
        visibilityConditions: [
          {
            id: 'cond-g06-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-06',
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
        galleryId: 'gallery-07',
        title: 'ستاره کشف ۱۹',
        x: 342,
        y: 544,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g07-info',
        type: 'icon',
        galleryId: 'gallery-07',
        title: 'اطلاعات گالری ۰۷',
        x: 308,
        y: 67,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-07',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-g07-point-01',
        type: 'puzzle',
        galleryId: 'gallery-07',
        title: 'نقطه پازل ۰۱ — گذر از برون به درون',
        x: 342,
        y: 278,
        questionId: '16',
        puzzlePieceId: 'gallery07-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g07-point-02',
        type: 'puzzle',
        galleryId: 'gallery-07',
        title: 'نقطه پازل ۰۲ — گذر از برون به درون',
        x: 343,
        y: 365,
        questionId: '17',
        puzzlePieceId: 'gallery07-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g07-point-03',
        type: 'puzzle',
        galleryId: 'gallery-07',
        title: 'نقطه پازل ۰۳ — گذر از برون به درون (قطعه نهایی)',
        x: 343,
        y: 463,
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
            galleryId: 'gallery-07',
          },
        ],
      },
    ],
  },
  'gallery-08': {
    galleryId: 'gallery-08',
    name: 'Gallery 08',
    nameFa: 'آونگ زمان',
    viewBox: '0 0 501.5 642.18',
    width: 501.5,
    height: 642.18,
    collectionPoints: [],
    iconPoints: [
      {
        id: 'icon-g08-info',
        type: 'icon',
        galleryId: 'gallery-08',
        title: 'اطلاعات گالری ۰۸',
        x: 226,
        y: 229,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-08',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-g08-point-01',
        type: 'puzzle',
        galleryId: 'gallery-08',
        title: 'نقطه پازل ۰۱ — آونگ زمان',
        x: 225,
        y: 58,
        questionId: '19',
        puzzlePieceId: 'gallery08-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g08-point-02',
        type: 'puzzle',
        galleryId: 'gallery-08',
        title: 'نقطه پازل ۰۲ — آونگ زمان',
        x: 362,
        y: 124,
        questionId: '20',
        puzzlePieceId: 'gallery08-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g08-point-03',
        type: 'puzzle',
        galleryId: 'gallery-08',
        title: 'نقطه پازل ۰۳ — آونگ زمان (قطعه نهایی)',
        x: 123,
        y: 124,
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
        title: 'بازگشت به گالری ۰۷',
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
        title: 'ورود به گالری ۰۹',
        x: 228,
        y: 561,
        rotation: 180,
        size: 44,
        destination: 'gallery-09',
        visibilityConditions: [
          {
            id: 'cond-g08-puzzle-completed',
            type: 'galleryPuzzleCompleted',
            galleryId: 'gallery-08',
          },
        ],
      },
    ],
  },
  'gallery-09': {
    galleryId: 'gallery-09',
    name: 'Gallery 09',
    nameFa: 'تلاقی رسانه‌ها',
    viewBox: '0 0 453.09 846.45',
    width: 453.09,
    height: 846.45,
    collectionPoints: [
      {
        id: 'star-24',
        starId: 'star-24',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'ستاره کشف ۲۴',
        x: 401,
        y: 215,
        frames: [],
      },
      {
        id: 'star-25',
        starId: 'star-25',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'ستاره کشف ۲۵',
        x: 253,
        y: 667,
        frames: [],
      },
      {
        id: 'col-g09-01',
        starId: 'col-g09-01',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'تابلو فرش',
        x: 137,
        y: 111,
        frames: [],
      },
      {
        id: 'col-g09-02',
        starId: 'col-g09-02',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'سوپ داگر',
        x: 249,
        y: 48,
        frames: [],
      },
      {
        id: 'col-g09-03',
        starId: 'col-g09-03',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'عکسها و حکاکی ها',
        x: 137,
        y: 374,
        frames: [],
      },
      {
        id: 'col-g09-04',
        starId: 'col-g09-04',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'بدون عنوان سگ سه پا',
        x: 138,
        y: 602,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g09-info',
        type: 'icon',
        galleryId: 'gallery-09',
        title: 'اطلاعات گالری ۰۹',
        x: 251,
        y: 220,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-09',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-g09-point-01',
        type: 'puzzle',
        galleryId: 'gallery-09',
        title: 'نقطه پازل ۰۱ — تلاقی رسانه‌ها',
        x: 355,
        y: 117,
        questionId: '22',
        puzzlePieceId: 'gallery09-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g09-point-02',
        type: 'puzzle',
        galleryId: 'gallery-09',
        title: 'نقطه پازل ۰۲ — تلاقی رسانه‌ها',
        x: 356,
        y: 408,
        questionId: '23',
        puzzlePieceId: 'gallery09-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g09-point-03',
        type: 'puzzle',
        galleryId: 'gallery-09',
        title: 'نقطه پازل ۰۳ — تلاقی رسانه‌ها (قطعه نهایی)',
        x: 356,
        y: 567,
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
        title: 'بازگشت به گالری ۰۸',
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
            galleryId: 'gallery-09',
          },
        ],
      },
    ],
  },
};

const STORAGE_MAP_CONFIG_KEY = 'museum_map_config_v3';

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
              const savedIcons = (parsed[key].iconPoints || []).filter((i: any) => i.id !== 'icon-3527');
              const combinedIcons = [...savedIcons];
              for (const defIcon of defaultIcons) {
                if (defIcon.id !== 'icon-3527' && !combinedIcons.some((i) => i.id === defIcon.id)) {
                  combinedIcons.push(defIcon);
                }
              }

              const defaultPuzzles = DEFAULT_MAP_DATABASE[key]?.puzzlePoints || [];
              const savedPuzzles = parsed[key].puzzlePoints || [];
              const combinedPuzzles = [...savedPuzzles];
              for (const defPuzzle of defaultPuzzles) {
                if (!combinedPuzzles.some((p: any) => p.id === defPuzzle.id)) {
                  combinedPuzzles.push(defPuzzle);
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
                  !((key === 'gallery-07' || key === 'gallery_07') && (c.id === 'star-16' || c.id === 'star-17' || c.id === 'star-18')) &&
                  !((key === 'gallery-08' || key === 'gallery_08') && (c.id === 'star-20' || c.id === 'star-21' || c.id === 'star-22' || c.id === 'star-23')) &&
                  !((key === 'gallery-09' || key === 'gallery_09') && (c.id === 'star-26' || c.id === 'star-27' || c.id === 'star-28'))
              );
              const combinedCollections = [...savedCollections];
              for (const defCol of defaultCollections) {
                const existingIdx = combinedCollections.findIndex((c: any) => c.id === defCol.id);
                if (existingIdx === -1) {
                  combinedCollections.push(defCol);
                } else if (defCol.pointType === 'star') {
                  combinedCollections[existingIdx].pointType = 'star';
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
            !((safeGalleryId === 'gallery-07' || canonId === 'gallery-07' || safeGalleryId === 'gallery_07' || canonId === 'gallery_07') && (cp.id === 'star-16' || cp.id === 'star-17' || cp.id === 'star-18')) &&
            !((safeGalleryId === 'gallery-08' || canonId === 'gallery-08' || safeGalleryId === 'gallery_08' || canonId === 'gallery_08') && (cp.id === 'star-20' || cp.id === 'star-21' || cp.id === 'star-22' || cp.id === 'star-23')) &&
            !((safeGalleryId === 'gallery-09' || canonId === 'gallery-09' || safeGalleryId === 'gallery_09' || canonId === 'gallery_09') && (cp.id === 'star-26' || cp.id === 'star-27' || cp.id === 'star-28'))
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
            if (!list.some((ip) => ip.id === 'icon-g00-shop')) {
              const defaultShop = DEFAULT_MAP_DATABASE['gallery-00']?.iconPoints?.find((ip) => ip.id === 'icon-g00-shop');
              if (defaultShop) {
                list.push({ ...defaultShop, width: targetWidth, height: targetHeight });
              }
            } else {
              list = list.map((ip) => (ip.id === 'icon-g00-shop' ? { ...ip, width: targetWidth, height: targetHeight } : ip));
            }
            if (!list.some((ip) => ip.id === 'icon-g00-frame')) {
              const defaultFrame = DEFAULT_MAP_DATABASE['gallery-00']?.iconPoints?.find((ip) => ip.id === 'icon-g00-frame');
              if (defaultFrame) {
                list.push({ ...defaultFrame, width: targetWidth, height: targetHeight });
              }
            } else {
              list = list.map((ip) => (ip.id === 'icon-g00-frame' ? { ...ip, width: targetWidth, height: targetHeight } : ip));
            }
            if (!list.some((ip) => ip.id === 'icon-g00-tree')) {
              const defaultTree = DEFAULT_MAP_DATABASE['gallery-00']?.iconPoints?.find((ip) => ip.id === 'icon-g00-tree');
              if (defaultTree) {
                list.push({ ...defaultTree, width: targetWidth, height: targetHeight });
              }
            } else {
              list = list.map((ip) => (ip.id === 'icon-g00-tree' ? { ...ip, width: targetWidth, height: targetHeight } : ip));
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
