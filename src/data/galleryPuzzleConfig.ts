/**
 * Gallery Puzzle Configuration & Jigsaw Architecture
 * Extensible configuration defining puzzle pieces, jigsaw clip paths,
 * questions, and assembly specifications for each gallery.
 */

import { GALLERY_01_ARTWORK_SRC } from './gallery01Artwork';
import { getGalleryQuestionsArtwork } from './galleryQuestionsArtworkStore';

export interface PuzzlePieceConfig {
  id: string;
  galleryId: string;
  order: number;
  titleFa: string;
  titleEn: string;
  sizeType: 'small' | 'large';
  questionId: string;
  svgPath: string;
  viewBox: string; // "0 0 1000 1000"
  // Standalone preview framing (sub-region viewBox to zoom in nicely on the single piece)
  standaloneViewBox: string;
  standaloneWidth: number;
  standaloneHeight: number;
}

export interface GalleryPuzzleConfig {
  galleryId: string;
  galleryNameFa: string;
  galleryNameEn: string;
  totalPieces: number;
  aspectRatio: string; // "1/1" or "4/3"
  artworkWidth: number;
  artworkHeight: number;
  pieces: PuzzlePieceConfig[];
}

/**
 * Normalized Jigsaw Paths for Gallery 01 (1000x1000 artwork space):
 * Piece 1: Top-Left (Smaller, ~480x500 area) with tab into Piece 3 and tab into Piece 2
 * Piece 2: Bottom-Left (Smaller, ~480x500 area) with socket from Piece 1 and tab into Piece 3
 * Piece 3: Right Side (Noticeably Larger, ~520x1000 area) with sockets receiving Piece 1 and Piece 2
 */
const G01_PATH_PIECE_01 = `
  M 0 0
  L 480 0
  L 480 190
  C 480 220, 450 220, 450 240
  C 450 260, 540 220, 540 250
  C 540 280, 450 240, 450 260
  C 450 280, 480 280, 480 310
  L 480 500
  L 310 500
  C 280 500, 280 470, 260 470
  C 240 470, 280 560, 250 560
  C 220 560, 260 470, 240 470
  C 220 470, 220 500, 190 500
  L 0 500
  L 0 0
  Z
`.trim();

const G01_PATH_PIECE_02 = `
  M 0 500
  L 190 500
  C 220 500, 220 470, 240 470
  C 260 470, 220 560, 250 560
  C 280 560, 240 470, 260 470
  C 280 470, 280 500, 310 500
  L 480 500
  L 480 680
  C 480 710, 450 710, 450 730
  C 450 750, 540 710, 540 740
  C 540 770, 450 730, 450 750
  C 450 770, 480 770, 480 800
  L 480 1000
  L 0 1000
  L 0 500
  Z
`.trim();

const G01_PATH_PIECE_03 = `
  M 480 0
  L 1000 0
  L 1000 1000
  L 480 1000
  L 480 800
  C 480 770, 450 770, 450 750
  C 450 730, 540 770, 540 740
  C 540 710, 450 750, 450 730
  C 450 710, 480 710, 480 680
  L 480 500
  L 480 310
  C 480 280, 450 280, 450 260
  C 450 240, 540 280, 540 250
  C 540 220, 450 260, 450 240
  C 450 220, 480 220, 480 190
  L 480 0
  Z
`.trim();

export const GALLERY_PUZZLE_REGISTRY: Record<string, GalleryPuzzleConfig> = {
  'gallery-01': {
    galleryId: 'gallery-01',
    galleryNameFa: 'کیمیای نور',
    galleryNameEn: 'Alchemy of Light',
    totalPieces: 3,
    aspectRatio: '1/1',
    artworkWidth: 1000,
    artworkHeight: 1000,
    pieces: [
      {
        id: 'gallery01-piece-01',
        galleryId: 'gallery-01',
        order: 1,
        titleFa: 'قطعه شماره ۱ — گوشه شمال غربی',
        titleEn: 'Piece 01 — Northwest Arch',
        sizeType: 'small',
        questionId: '1',
        svgPath: G01_PATH_PIECE_01,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 -10 570 590',
        standaloneWidth: 570,
        standaloneHeight: 590,
      },
      {
        id: 'gallery01-piece-02',
        galleryId: 'gallery-01',
        order: 2,
        titleFa: 'قطعه شماره ۲ — گوشه جنوب غربی',
        titleEn: 'Piece 02 — Southwest Relief',
        sizeType: 'small',
        questionId: '2',
        svgPath: G01_PATH_PIECE_02,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 460 570 560',
        standaloneWidth: 570,
        standaloneHeight: 560,
      },
      {
        id: 'gallery01-piece-03',
        galleryId: 'gallery-01',
        order: 3,
        titleFa: 'قطعه شماره ۳ — بخش اصلی و شرقی',
        titleEn: 'Piece 03 — Major East Wing (Final Piece)',
        sizeType: 'large',
        questionId: '3',
        svgPath: G01_PATH_PIECE_03,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '440 -10 570 1020',
        standaloneWidth: 570,
        standaloneHeight: 1020,
      },
    ],
  },
  'gallery-02': {
    galleryId: 'gallery-02',
    galleryNameFa: 'آلبوم‌های دیپلماتیک',
    galleryNameEn: 'Diplomatic Albums',
    totalPieces: 3,
    aspectRatio: '1/1',
    artworkWidth: 1000,
    artworkHeight: 1000,
    pieces: [
      {
        id: 'gallery03-piece-01',
        galleryId: 'gallery-02',
        order: 1,
        titleFa: 'قطعه شماره ۱ — گوشه شمال غربی',
        titleEn: 'Piece 01 — Modern Northwest Arch',
        sizeType: 'small',
        questionId: '4',
        svgPath: G01_PATH_PIECE_01,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 -10 570 590',
        standaloneWidth: 570,
        standaloneHeight: 590,
      },
      {
        id: 'gallery03-piece-02',
        galleryId: 'gallery-02',
        order: 2,
        titleFa: 'قطعه شماره ۲ — گوشه جنوب غربی',
        titleEn: 'Piece 02 — Modern Southwest Relief',
        sizeType: 'small',
        questionId: '5',
        svgPath: G01_PATH_PIECE_02,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 460 570 560',
        standaloneWidth: 570,
        standaloneHeight: 560,
      },
      {
        id: 'gallery03-piece-03',
        galleryId: 'gallery-02',
        order: 3,
        titleFa: 'قطعه شماره ۳ — بخش اصلی و شرقی',
        titleEn: 'Piece 03 — Major Modern East Wing (Final Piece)',
        sizeType: 'large',
        questionId: '6',
        svgPath: G01_PATH_PIECE_03,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '440 -10 570 1020',
        standaloneWidth: 570,
        standaloneHeight: 1020,
      },
    ],
  },
  'gallery-03': {
    galleryId: 'gallery-03',
    galleryNameFa: 'ثبت دوام ما',
    galleryNameEn: 'Recording Our Endurance',
    totalPieces: 3,
    aspectRatio: '1/1',
    artworkWidth: 1000,
    artworkHeight: 1000,
    pieces: [
      {
        id: 'gallery04-piece-01',
        galleryId: 'gallery-03',
        order: 1,
        titleFa: 'قطعه شماره ۱ — ثبت دوام ما',
        titleEn: 'Piece 01 — Recording Our Endurance',
        sizeType: 'small',
        questionId: '7',
        svgPath: G01_PATH_PIECE_01,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 -10 570 590',
        standaloneWidth: 570,
        standaloneHeight: 590,
      },
      {
        id: 'gallery04-piece-02',
        galleryId: 'gallery-03',
        order: 2,
        titleFa: 'قطعه شماره ۲ — ثبت دوام ما',
        titleEn: 'Piece 02 — Recording Our Endurance',
        sizeType: 'small',
        questionId: '8',
        svgPath: G01_PATH_PIECE_02,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 460 570 560',
        standaloneWidth: 570,
        standaloneHeight: 560,
      },
      {
        id: 'gallery04-piece-03',
        galleryId: 'gallery-03',
        order: 3,
        titleFa: 'قطعه شماره ۳ — بخش اصلی و شرقی (قطعه نهایی)',
        titleEn: 'Piece 03 — Major East Wing (Final Piece)',
        sizeType: 'large',
        questionId: '9',
        svgPath: G01_PATH_PIECE_03,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '440 -10 570 1020',
        standaloneWidth: 570,
        standaloneHeight: 1020,
      },
    ],
  },
  'gallery-04': {
    galleryId: 'gallery-04',
    galleryNameFa: 'ضرب آهنگ شهر',
    galleryNameEn: 'City Rhythm',
    totalPieces: 3,
    aspectRatio: '1/1',
    artworkWidth: 1000,
    artworkHeight: 1000,
    pieces: [
      {
        id: 'gallery05-piece-01',
        galleryId: 'gallery-04',
        order: 1,
        titleFa: 'قطعه شماره ۱ — گوشه شمال غربی',
        titleEn: 'Piece 01 — Northwest Arch',
        sizeType: 'small',
        questionId: '10',
        svgPath: G01_PATH_PIECE_01,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 -10 570 590',
        standaloneWidth: 570,
        standaloneHeight: 590,
      },
      {
        id: 'gallery05-piece-02',
        galleryId: 'gallery-04',
        order: 2,
        titleFa: 'قطعه شماره ۲ — گوشه جنوب غربی',
        titleEn: 'Piece 02 — Southwest Relief',
        sizeType: 'small',
        questionId: '11',
        svgPath: G01_PATH_PIECE_02,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 460 570 560',
        standaloneWidth: 570,
        standaloneHeight: 560,
      },
      {
        id: 'gallery05-piece-03',
        galleryId: 'gallery-04',
        order: 3,
        titleFa: 'قطعه شماره ۳ — بخش اصلی و شرقی (قطعه نهایی)',
        titleEn: 'Piece 03 — Major East Wing (Final Piece)',
        sizeType: 'large',
        questionId: '12',
        svgPath: G01_PATH_PIECE_03,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '440 -10 570 1020',
        standaloneWidth: 570,
        standaloneHeight: 1020,
      },
    ],
  },
  'gallery-05': {
    galleryId: 'gallery-05',
    galleryNameFa: 'در کشاکش تماشا و استیلا',
    galleryNameEn: 'Between Gaze and Mastery',
    totalPieces: 3,
    aspectRatio: '1/1',
    artworkWidth: 1000,
    artworkHeight: 1000,
    pieces: [
      {
        id: 'gallery06-piece-01',
        galleryId: 'gallery-05',
        order: 1,
        titleFa: 'قطعه شماره ۱ — گوشه شمال غربی',
        titleEn: 'Piece 01 — Northwest Arch',
        sizeType: 'small',
        questionId: '13',
        svgPath: G01_PATH_PIECE_01,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 -10 570 590',
        standaloneWidth: 570,
        standaloneHeight: 590,
      },
      {
        id: 'gallery06-piece-02',
        galleryId: 'gallery-05',
        order: 2,
        titleFa: 'قطعه شماره ۲ — گوشه جنوب غربی',
        titleEn: 'Piece 02 — Southwest Relief',
        sizeType: 'small',
        questionId: '14',
        svgPath: G01_PATH_PIECE_02,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 460 570 560',
        standaloneWidth: 570,
        standaloneHeight: 560,
      },
      {
        id: 'gallery06-piece-03',
        galleryId: 'gallery-05',
        order: 3,
        titleFa: 'قطعه شماره ۳ — بخش اصلی و شرقی (قطعه نهایی)',
        titleEn: 'Piece 03 — Major East Wing (Final Piece)',
        sizeType: 'large',
        questionId: '15',
        svgPath: G01_PATH_PIECE_03,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '440 -10 570 1020',
        standaloneWidth: 570,
        standaloneHeight: 1020,
      },
    ],
  },
  'gallery-06': {
    galleryId: 'gallery-06',
    galleryNameFa: 'گذر از برون به درون',
    galleryNameEn: 'Journey from Outside to Inside',
    totalPieces: 3,
    aspectRatio: '1/1',
    artworkWidth: 1000,
    artworkHeight: 1000,
    pieces: [
      {
        id: 'gallery07-piece-01',
        galleryId: 'gallery-06',
        order: 1,
        titleFa: 'قطعه شماره ۱ — گوشه شمال غربی',
        titleEn: 'Piece 01 — Northwest Arch',
        sizeType: 'small',
        questionId: '16',
        svgPath: G01_PATH_PIECE_01,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 -10 570 590',
        standaloneWidth: 570,
        standaloneHeight: 590,
      },
      {
        id: 'gallery07-piece-02',
        galleryId: 'gallery-06',
        order: 2,
        titleFa: 'قطعه شماره ۲ — گوشه جنوب غربی',
        titleEn: 'Piece 02 — Southwest Relief',
        sizeType: 'small',
        questionId: '17',
        svgPath: G01_PATH_PIECE_02,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 460 570 560',
        standaloneWidth: 570,
        standaloneHeight: 560,
      },
      {
        id: 'gallery07-piece-03',
        galleryId: 'gallery-06',
        order: 3,
        titleFa: 'قطعه شماره ۳ — بخش اصلی و شرقی (قطعه نهایی)',
        titleEn: 'Piece 03 — Major East Wing (Final Piece)',
        sizeType: 'large',
        questionId: '18',
        svgPath: G01_PATH_PIECE_03,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '440 -10 570 1020',
        standaloneWidth: 570,
        standaloneHeight: 1020,
      },
    ],
  },
  'gallery-07': {
    galleryId: 'gallery-07',
    galleryNameFa: 'آونگ زمان',
    galleryNameEn: 'Pendulum of Time',
    totalPieces: 3,
    aspectRatio: '1/1',
    artworkWidth: 1000,
    artworkHeight: 1000,
    pieces: [
      {
        id: 'gallery08-piece-01',
        galleryId: 'gallery-07',
        order: 1,
        titleFa: 'قطعه شماره ۱ — گوشه شمال غربی',
        titleEn: 'Piece 01 — Northwest Arch',
        sizeType: 'small',
        questionId: '19',
        svgPath: G01_PATH_PIECE_01,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 -10 570 590',
        standaloneWidth: 570,
        standaloneHeight: 590,
      },
      {
        id: 'gallery08-piece-02',
        galleryId: 'gallery-07',
        order: 2,
        titleFa: 'قطعه شماره ۲ — گوشه جنوب غربی',
        titleEn: 'Piece 02 — Southwest Relief',
        sizeType: 'small',
        questionId: '20',
        svgPath: G01_PATH_PIECE_02,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 460 570 560',
        standaloneWidth: 570,
        standaloneHeight: 560,
      },
      {
        id: 'gallery08-piece-03',
        galleryId: 'gallery-07',
        order: 3,
        titleFa: 'قطعه شماره ۳ — بخش اصلی و شرقی (قطعه نهایی)',
        titleEn: 'Piece 03 — Major East Wing (Final Piece)',
        sizeType: 'large',
        questionId: '21',
        svgPath: G01_PATH_PIECE_03,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '440 -10 570 1020',
        standaloneWidth: 570,
        standaloneHeight: 1020,
      },
    ],
  },
  'gallery-08': {
    galleryId: 'gallery-08',
    galleryNameFa: 'تلاقی رسانه‌ها',
    galleryNameEn: 'Intersection of Media',
    totalPieces: 3,
    aspectRatio: '1/1',
    artworkWidth: 1000,
    artworkHeight: 1000,
    pieces: [
      {
        id: 'gallery09-piece-01',
        galleryId: 'gallery-08',
        order: 1,
        titleFa: 'قطعه شماره ۱ — گوشه شمال غربی',
        titleEn: 'Piece 01 — Northwest Arch',
        sizeType: 'small',
        questionId: '22',
        svgPath: G01_PATH_PIECE_01,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 -10 570 590',
        standaloneWidth: 570,
        standaloneHeight: 590,
      },
      {
        id: 'gallery09-piece-02',
        galleryId: 'gallery-08',
        order: 2,
        titleFa: 'قطعه شماره ۲ — گوشه جنوب غربی',
        titleEn: 'Piece 02 — Southwest Relief',
        sizeType: 'small',
        questionId: '23',
        svgPath: G01_PATH_PIECE_02,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 460 570 560',
        standaloneWidth: 570,
        standaloneHeight: 560,
      },
      {
        id: 'gallery09-piece-03',
        galleryId: 'gallery-08',
        order: 3,
        titleFa: 'قطعه شماره ۳ — بخش اصلی و شرقی (قطعه نهایی)',
        titleEn: 'Piece 03 — Major East Wing (Final Piece)',
        sizeType: 'large',
        questionId: '24',
        svgPath: G01_PATH_PIECE_03,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '440 -10 570 1020',
        standaloneWidth: 570,
        standaloneHeight: 1020,
      },
    ],
  },
};

// Aliases for backwards compatibility with legacy routes
GALLERY_PUZZLE_REGISTRY['gallery-09'] = GALLERY_PUZZLE_REGISTRY['gallery-08'];

/**
 * Retrieves puzzle configuration for any gallery (with fallback to Gallery 01 template)
 */
export function getGalleryPuzzleConfig(galleryId?: string): GalleryPuzzleConfig {
  if (!galleryId || typeof galleryId !== 'string') {
    galleryId = 'gallery-01';
  }
  const cleanId = galleryId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const canonId = cleanId.startsWith('gallery')
    ? `gallery-${cleanId.replace('gallery', '').padStart(2, '0')}`
    : galleryId;

  if (GALLERY_PUZZLE_REGISTRY[canonId]) {
    return GALLERY_PUZZLE_REGISTRY[canonId];
  }

  const rawDigits = canonId.replace(/[^0-9]/g, '');
  const digitsFa = rawDigits
    ? rawDigits.padStart(2, '0').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])
    : '';

  // Extensible default configuration for other galleries
  return {
    galleryId: canonId,
    galleryNameFa: digitsFa ? `گالری ${digitsFa}` : `گالری ${canonId}`,
    galleryNameEn: `Gallery ${rawDigits ? rawDigits.padStart(2, '0') : canonId}`,
    totalPieces: 3,
    aspectRatio: '1/1',
    artworkWidth: 1000,
    artworkHeight: 1000,
    pieces: [
      {
        id: `${canonId.replace('-', '')}-piece-01`,
        galleryId: canonId,
        order: 1,
        titleFa: 'قطعه شماره ۱',
        titleEn: 'Piece 01',
        sizeType: 'small',
        questionId: `${canonId.replace('-', '')}-puzzle-q01`,
        svgPath: G01_PATH_PIECE_01,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 -10 570 590',
        standaloneWidth: 570,
        standaloneHeight: 590,
      },
      {
        id: `${canonId.replace('-', '')}-piece-02`,
        galleryId: canonId,
        order: 2,
        titleFa: 'قطعه شماره ۲',
        titleEn: 'Piece 02',
        sizeType: 'small',
        questionId: `${canonId.replace('-', '')}-puzzle-q02`,
        svgPath: G01_PATH_PIECE_02,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '-10 460 570 560',
        standaloneWidth: 570,
        standaloneHeight: 560,
      },
      {
        id: `${canonId.replace('-', '')}-piece-03`,
        galleryId: canonId,
        order: 3,
        titleFa: 'قطعه شماره ۳ (نهایی و بزرگ)',
        titleEn: 'Piece 03 (Major Final Piece)',
        sizeType: 'large',
        questionId: `${canonId.replace('-', '')}-puzzle-q03`,
        svgPath: G01_PATH_PIECE_03,
        viewBox: '0 0 1000 1000',
        standaloneViewBox: '440 -10 570 1020',
        standaloneWidth: 570,
        standaloneHeight: 1020,
      },
    ],
  };
}

/**
 * Retrieves the artwork source for the puzzle of a specific gallery
 */
export function getGalleryPuzzleArtworkSrc(galleryId: string): string {
  const config = getGalleryQuestionsArtwork(galleryId);
  return config?.image?.trim() || '';
}
