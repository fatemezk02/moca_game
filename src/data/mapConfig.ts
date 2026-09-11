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
    name: 'Gallery 01 — Architectural Hall',
    nameFa: 'گالری ۰۱ — تالار معماری',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
  },
  {
    id: 'gallery-02',
    name: 'Gallery 02 — Vault Pavilion (Coming Soon)',
    nameFa: 'گالری ۰۲ — پاویون طاق‌ها (به‌زودی)',
    viewBox: '0 0 1000 1000',
    width: 1000,
    height: 1000,
  },
  {
    id: 'gallery-03',
    name: 'Gallery 03 — Modern Hall',
    nameFa: 'گالری ۰۳ — تالار مدرن',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
  },
  {
    id: 'gallery-04',
    name: 'Gallery 04 — Recording Our Endurance',
    nameFa: 'گالری ۰۴ — ثبت دوام ما',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
  },
  {
    id: 'gallery-05',
    name: 'Gallery 05 — City Rhythm',
    nameFa: 'گالری ۰۵ — ضرب آهنگ شهر',
    viewBox: '0 0 763 1147',
    width: 763,
    height: 1147,
  },
  {
    id: 'gallery-06',
    name: 'Gallery 06 — Between Gaze and Mastery',
    nameFa: 'گالری ۰۶ — در کشاکش تماشا و استیلا',
    viewBox: '0 0 762.8 1147.2',
    width: 762.8,
    height: 1147.2,
  },
  {
    id: 'gallery-07',
    name: 'Gallery 07 — Passing from Outside to Inside',
    nameFa: 'گالری ۰۷ — گذر از برون به درون',
    viewBox: '0 0 762.8 1147.2',
    width: 762.8,
    height: 1147.2,
  },
  {
    id: 'gallery-08',
    name: 'Gallery 08 — Pendulum of Time',
    nameFa: 'گالری ۰۸ — آونگ زمان',
    viewBox: '0 0 762.8 1147.2',
    width: 762.8,
    height: 1147.2,
  },
  {
    id: 'gallery-09',
    name: 'Gallery 09 — Intersection of Media',
    nameFa: 'گالری ۰۹ — تلاقی رسانه‌ها',
    viewBox: '0 0 762.78 1147.23',
    width: 762.78,
    height: 1147.23,
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
        id: 'col-02',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Epigraphic Tablets & Scribes Guild',
        roomCode: 'SEC 02',
        roomSection: 'Northern Archive Corridor',
        x: 438, // 72.5%
        y: 177, // 21.0%
        direction: 'right',
        frames: [
          {
            id: 'col-02-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
      {
        id: 'col-04',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Architectural Capitals & Columnar Orders',
        roomCode: 'SEC 04',
        roomSection: 'East Peristyle Wing',
        x: 490, // 81.0%
        y: 355, // 42.0%
        direction: 'right',
        frames: [
          {
            id: 'col-04-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
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
      {
        id: 'col-07',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Mosaic Pavements & Polychrome Glass',
        roomCode: 'SEC 07',
        roomSection: 'Southeast Corridor',
        x: 460, // 76.0%
        y: 583, // 69.0%
        direction: 'right',
        frames: [
          {
            id: 'col-07-f1',
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
        x: 235,
        y: 775,
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
        x: 370,
        y: 775,
        iconType: 'preset-location-shop',
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
        x: 302,
        y: 85,
        rotation: 0,
        size: 48,
        destination: 'gallery-01',
        visibilityConditions: [],
      },
    ],
  },

  'gallery-01': {
    galleryId: 'gallery-01',
    name: 'Gallery 01 — Architectural Hall',
    nameFa: 'گالری ۰۱ — تالار معماری',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
    collectionPoints: [
      {
        id: 'artwork-01',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-01',
        title: 'North Apse Monolith',
        roomSection: 'NORTH ROTUNDA',
        x: 230,
        y: 190,
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
        x: 424, // 50% of 848
        y: 675,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-01-questions',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-point-01',
        type: 'puzzle',
        galleryId: 'gallery-01',
        title: 'نقطه پازل ۰۱ — قطعه شمال غربی',
        x: 230,
        y: 380,
        questionId: 'gallery01-puzzle-q01',
        puzzlePieceId: 'gallery01-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-point-02',
        type: 'puzzle',
        galleryId: 'gallery-01',
        title: 'نقطه پازل ۰۲ — قطعه جنوب غربی',
        x: 424,
        y: 840,
        questionId: 'gallery01-puzzle-q02',
        puzzlePieceId: 'gallery01-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-point-03',
        type: 'puzzle',
        galleryId: 'gallery-01',
        title: 'نقطه پازل ۰۳ — قطعه شرقی (نهایی)',
        x: 640,
        y: 380,
        questionId: 'gallery01-puzzle-q03',
        puzzlePieceId: 'gallery01-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g01-to-g03',
        type: 'arrow',
        galleryId: 'gallery-01',
        title: 'فلش راهنما به گالری ۰۳',
        x: 680,
        y: 200,
        rotation: 90,
        size: 48,
        destination: 'gallery-03',
        visibilityConditions: [
          {
            id: 'cond-g01-piece01',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery01-piece-01',
          },
          {
            id: 'cond-g01-piece02',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery01-piece-02',
          },
          {
            id: 'cond-g01-piece03',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery01-piece-03',
          },
        ],
      },
    ],
  },

  'gallery-02': {
    galleryId: 'gallery-02',
    name: 'Gallery 02 — Vault Pavilion (Coming Soon)',
    nameFa: 'گالری ۰۲ — پاویون طاق‌ها (به‌زودی)',
    viewBox: '0 0 1000 1000',
    width: 1000,
    height: 1000,
    collectionPoints: [],
    iconPoints: [],
    arrows: [],
  },

  'gallery-03': {
    galleryId: 'gallery-03',
    name: 'Gallery 03 — Modern Hall',
    nameFa: 'گالری ۰۳ — تالار مدرن',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
    collectionPoints: [
      {
        id: 'artwork-g03-star',
        starId: 'star-03',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-03',
        title: 'عکاسی در گذر زمان',
        roomSection: 'MODERN ROTUNDA',
        x: 230,
        y: 200,
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
        x: 424,
        y: 632,
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
        x: 240,
        y: 380,
        questionId: 'gallery03-puzzle-q01',
        puzzlePieceId: 'gallery03-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g03-point-02',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۲ — تالار معاصر',
        x: 424,
        y: 920,
        questionId: 'gallery03-puzzle-q02',
        puzzlePieceId: 'gallery03-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g03-point-03',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۳ — تالار معاصر (قطعه نهایی)',
        x: 610,
        y: 380,
        questionId: 'gallery03-puzzle-q03',
        puzzlePieceId: 'gallery03-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g03-to-g04',
        type: 'arrow',
        galleryId: 'gallery-03',
        title: 'فلش راهنما به گالری ۰۴',
        x: 680,
        y: 200,
        rotation: 90,
        size: 48,
        destination: 'gallery-04',
        visibilityConditions: [
          {
            id: 'cond-g03-piece01',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery03-piece-01',
          },
          {
            id: 'cond-g03-piece02',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery03-piece-02',
          },
          {
            id: 'cond-g03-piece03',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery03-piece-03',
          },
        ],
      },
    ],
  },

  'gallery-04': {
    galleryId: 'gallery-04',
    name: 'Gallery 04',
    nameFa: 'ثبت دوام ما',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
    collectionPoints: [
      {
        id: 'star-07',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-04',
        title: 'ستاره کشف — آیا عکاسی می‌تواند شبیه نقاشی باشد؟',
        x: 330,
        y: 260,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g04-info',
        type: 'icon',
        galleryId: 'gallery-04',
        title: 'اطلاعات گالری ۰۴',
        x: 424,
        y: 632,
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
        x: 260,
        y: 360,
        questionId: 'gallery04-puzzle-q01',
        puzzlePieceId: 'gallery04-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g04-point-02',
        type: 'puzzle',
        galleryId: 'gallery-04',
        title: 'نقطه پازل ۰۲ — ثبت دوام ما',
        x: 424,
        y: 920,
        questionId: 'gallery04-puzzle-q02',
        puzzlePieceId: 'gallery04-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g04-point-03',
        type: 'puzzle',
        galleryId: 'gallery-04',
        title: 'نقطه پازل ۰۳ — ثبت دوام ما (قطعه نهایی)',
        x: 590,
        y: 460,
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
        x: 670,
        y: 380,
        rotation: 90,
        size: 48,
        destination: 'gallery-05',
        visibilityConditions: [
          {
            id: 'cond-g04-piece01',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery04-piece-01',
          },
          {
            id: 'cond-g04-piece02',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery04-piece-02',
          },
          {
            id: 'cond-g04-piece03',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery04-piece-03',
          },
        ],
      },
      {
        id: 'arrow-g04-to-g03',
        type: 'arrow',
        galleryId: 'gallery-04',
        title: 'بازگشت به گالری ۰۳',
        x: 100,
        y: 790,
        rotation: 270,
        size: 48,
        destination: 'gallery-03',
        visibilityConditions: [],
      },
    ],
  },
  'gallery-05': {
    galleryId: 'gallery-05',
    name: 'Gallery 05',
    nameFa: 'ضرب آهنگ شهر',
    viewBox: '0 0 763 1147',
    width: 763,
    height: 1147,
    collectionPoints: [
      {
        id: 'star-08',
        starId: 'star-08',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۰۸ — وقتی شهر از زاویه‌ای تازه دیده می‌شود',
        x: 240,
        y: 280,
        frames: [],
      },
      {
        id: 'star-09',
        starId: 'star-09',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۰۹ — شهری در حال ناپدید شدن',
        x: 530,
        y: 340,
        frames: [],
      },
      {
        id: 'star-10',
        starId: 'star-10',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۱۰ — زندگی روزمره، بخشی از چهره‌ی شهر',
        x: 230,
        y: 720,
        frames: [],
      },
      {
        id: 'star-11',
        starId: 'star-11',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-05',
        title: 'ستاره کشف ۱۱ — تخریب و دگرگونی شهر',
        x: 540,
        y: 810,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g05-info',
        type: 'icon',
        galleryId: 'gallery-05',
        title: 'اطلاعات گالری ۰۵',
        x: 381,
        y: 574,
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
        x: 270,
        y: 440,
        questionId: '10',
        puzzlePieceId: 'gallery05-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g05-point-02',
        type: 'puzzle',
        galleryId: 'gallery-05',
        title: 'نقطه پازل ۰۲ — ضرب آهنگ شهر',
        x: 381,
        y: 890,
        questionId: '11',
        puzzlePieceId: 'gallery05-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g05-point-03',
        type: 'puzzle',
        galleryId: 'gallery-05',
        title: 'نقطه پازل ۰۳ — ضرب آهنگ شهر (قطعه نهایی)',
        x: 510,
        y: 560,
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
        x: 670,
        y: 380,
        rotation: 90,
        size: 48,
        destination: 'gallery-06',
        visibilityConditions: [
          {
            id: 'cond-g05-piece01',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery05-piece-01',
          },
          {
            id: 'cond-g05-piece02',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery05-piece-02',
          },
          {
            id: 'cond-g05-piece03',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery05-piece-03',
          },
        ],
      },
      {
        id: 'arrow-g05-to-g04',
        type: 'arrow',
        galleryId: 'gallery-05',
        title: 'بازگشت به گالری ۰۴',
        x: 100,
        y: 790,
        rotation: 270,
        size: 48,
        destination: 'gallery-04',
        visibilityConditions: [],
      },
    ],
  },
  'gallery-06': {
    galleryId: 'gallery-06',
    name: 'Gallery 06',
    nameFa: 'در کشاکش تماشا و استیلا',
    viewBox: '0 0 762.8 1147.2',
    width: 762.8,
    height: 1147.2,
    collectionPoints: [
      {
        id: 'star-12',
        starId: 'star-12',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۲ — سیاستِ نگاه',
        x: 240,
        y: 280,
        frames: [],
      },
      {
        id: 'star-13',
        starId: 'star-13',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۳ — بستر معنا و تصویر',
        x: 530,
        y: 340,
        frames: [],
      },
      {
        id: 'star-14',
        starId: 'star-14',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۴ — تصویر و حافظه',
        x: 230,
        y: 720,
        frames: [],
      },
      {
        id: 'star-15',
        starId: 'star-15',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-06',
        title: 'ستاره کشف ۱۵ — افق‌های نوین نقد',
        x: 540,
        y: 810,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g06-info',
        type: 'icon',
        galleryId: 'gallery-06',
        title: 'اطلاعات گالری ۰۶',
        x: 381,
        y: 574,
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
        x: 270,
        y: 440,
        questionId: '13',
        puzzlePieceId: 'gallery06-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g06-point-02',
        type: 'puzzle',
        galleryId: 'gallery-06',
        title: 'نقطه پازل ۰۲ — در کشاکش تماشا و استیلا',
        x: 381,
        y: 890,
        questionId: '14',
        puzzlePieceId: 'gallery06-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g06-point-03',
        type: 'puzzle',
        galleryId: 'gallery-06',
        title: 'نقطه پازل ۰۳ — در کشاکش تماشا و استیلا (قطعه نهایی)',
        x: 510,
        y: 560,
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
        x: 100,
        y: 790,
        rotation: 270,
        size: 48,
        destination: 'gallery-05',
        visibilityConditions: [],
      },
    ],
  },
  'gallery-07': {
    galleryId: 'gallery-07',
    name: 'Gallery 07',
    nameFa: 'گذر از برون به درون',
    viewBox: '0 0 762.8 1147.2',
    width: 762.8,
    height: 1147.2,
    collectionPoints: [
      {
        id: 'star-19',
        starId: 'star-19',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-07',
        title: 'ستاره کشف ۱۹',
        x: 540,
        y: 780,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g07-info',
        type: 'icon',
        galleryId: 'gallery-07',
        title: 'اطلاعات گالری ۰۷',
        x: 381,
        y: 574,
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
        x: 410,
        y: 320,
        questionId: '16',
        puzzlePieceId: 'gallery07-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g07-point-02',
        type: 'puzzle',
        galleryId: 'gallery-07',
        title: 'نقطه پازل ۰۲ — گذر از برون به درون',
        x: 410,
        y: 580,
        questionId: '17',
        puzzlePieceId: 'gallery07-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g07-point-03',
        type: 'puzzle',
        galleryId: 'gallery-07',
        title: 'نقطه پازل ۰۳ — گذر از برون به درون (قطعه نهایی)',
        x: 410,
        y: 840,
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
        x: 100,
        y: 790,
        rotation: 270,
        size: 48,
        destination: 'gallery-06',
        visibilityConditions: [],
      },
      {
        id: 'arrow-g07-to-g08',
        type: 'arrow',
        galleryId: 'gallery-07',
        title: 'ورود به گالری ۰۸',
        x: 485,
        y: 905,
        rotation: 180,
        size: 48,
        destination: 'gallery-08',
        visibilityConditions: [
          {
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
    viewBox: '0 0 762.8 1147.2',
    width: 762.8,
    height: 1147.2,
    collectionPoints: [],
    iconPoints: [
      {
        id: 'icon-g08-info',
        type: 'icon',
        galleryId: 'gallery-08',
        title: 'اطلاعات گالری ۰۸',
        x: 358,
        y: 515,
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
        x: 358,
        y: 415,
        questionId: '19',
        puzzlePieceId: 'gallery08-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g08-point-02',
        type: 'puzzle',
        galleryId: 'gallery-08',
        title: 'نقطه پازل ۰۲ — آونگ زمان',
        x: 465,
        y: 515,
        questionId: '20',
        puzzlePieceId: 'gallery08-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g08-point-03',
        type: 'puzzle',
        galleryId: 'gallery-08',
        title: 'نقطه پازل ۰۳ — آونگ زمان (قطعه نهایی)',
        x: 255,
        y: 620,
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
        x: 358,
        y: 880,
        rotation: 180,
        size: 48,
        destination: 'gallery-07',
        visibilityConditions: [],
      },
      {
        id: 'arrow-g08-to-g09',
        type: 'arrow',
        galleryId: 'gallery-08',
        title: 'ورود به گالری ۰۹',
        x: 580,
        y: 350,
        rotation: 0,
        size: 48,
        destination: 'gallery-09',
        visibilityConditions: [
          {
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
    viewBox: '0 0 762.78 1147.23',
    width: 762.78,
    height: 1147.23,
    collectionPoints: [
      {
        id: 'star-24',
        starId: 'star-24',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'ستاره کشف ۲۴',
        x: 300,
        y: 360,
        frames: [],
      },
      {
        id: 'star-25',
        starId: 'star-25',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-09',
        title: 'ستاره کشف ۲۵',
        x: 480,
        y: 360,
        frames: [],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g09-info',
        type: 'icon',
        galleryId: 'gallery-09',
        title: 'اطلاعات گالری ۰۹',
        x: 397,
        y: 490,
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
        x: 397,
        y: 360,
        questionId: '22',
        puzzlePieceId: 'gallery09-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g09-point-02',
        type: 'puzzle',
        galleryId: 'gallery-09',
        title: 'نقطه پازل ۰۲ — تلاقی رسانه‌ها',
        x: 490,
        y: 560,
        questionId: '23',
        puzzlePieceId: 'gallery09-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g09-point-03',
        type: 'puzzle',
        galleryId: 'gallery-09',
        title: 'نقطه پازل ۰۳ — تلاقی رسانه‌ها (قطعه نهایی)',
        x: 295,
        y: 560,
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
        x: 397,
        y: 930,
        rotation: 180,
        size: 48,
        destination: 'gallery-08',
        visibilityConditions: [],
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
              const savedIcons = parsed[key].iconPoints || [];
              const combinedIcons = [...savedIcons];
              for (const defIcon of defaultIcons) {
                if (!combinedIcons.some((i) => i.id === defIcon.id)) {
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
                  !((key === 'gallery-09' || key === 'gallery_09') && (c.id === 'star-26' || c.id === 'star-27'))
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
            !((safeGalleryId === 'gallery-01' || canonId === 'gallery-01') && (cp.id === 'artwork-02' || cp.id === 'artwork-03' || cp.id === 'artwork-04')) &&
            !((safeGalleryId === 'gallery-07' || canonId === 'gallery-07' || safeGalleryId === 'gallery_07' || canonId === 'gallery_07') && (cp.id === 'star-16' || cp.id === 'star-17' || cp.id === 'star-18')) &&
            !((safeGalleryId === 'gallery-08' || canonId === 'gallery-08' || safeGalleryId === 'gallery_08' || canonId === 'gallery_08') && (cp.id === 'star-20' || cp.id === 'star-21' || cp.id === 'star-22' || cp.id === 'star-23')) &&
            !((safeGalleryId === 'gallery-09' || canonId === 'gallery-09' || safeGalleryId === 'gallery_09' || canonId === 'gallery_09') && (cp.id === 'star-26' || cp.id === 'star-27'))
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
            return list;
          })()
        : (rawConfig.iconPoints || []),
      puzzlePoints: rawConfig.puzzlePoints || (DEFAULT_MAP_DATABASE[safeGalleryId]?.puzzlePoints ? [...DEFAULT_MAP_DATABASE[safeGalleryId].puzzlePoints!] : []),
      arrows: rawConfig.arrows || [],
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
