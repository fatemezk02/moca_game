import { GALLERY_01_QUESTIONS } from '../../data/gallery01Questions';
import { GALLERY_03_QUESTIONS } from '../../data/gallery03Questions';
import { DEFAULT_PUZZLE_QUESTIONS } from '../../data/puzzleQuestionsData';
import { DEFAULT_STAR_DISCOVERIES } from '../../data/starDiscoveryData';
import { GALLERY_01_ARTWORKS } from '../../data/gallery01Artworks';
import { MUSEUM_COLLECTIONS } from '../../data/museumCollections';
import { ArtworkContent, GalleryContent, GameContentData, QuestionContent, StarContent } from './types';

export const DEFAULT_GALLERIES: GalleryContent[] = [
  {
    id: 'gallery-00',
    galleryId: 'gallery-00',
    galleryNumber: '0',
    nameFa: 'نقشه اصلی',
    nameEn: 'Main Map',
    descriptionFa: 'نقشه کلی موزه و مسیر دسترسی به تالارها',
    descriptionEn: 'Main Museum Floor Plan and Gallery Navigation',
    active: true,
  },
  {
    id: 'gallery-01',
    galleryId: 'gallery-01',
    galleryNumber: '1',
    nameFa: 'کیمیای نور',
    nameEn: 'Alchemy of Light',
    descriptionFa: 'پیدایش و سیر تحول عکاسی در ایران و جهان',
    descriptionEn: 'Origins and Evolution of Photography in Iran and the World',
    active: true,
  },
  {
    id: 'gallery-03',
    galleryId: 'gallery-03',
    galleryNumber: '3',
    nameFa: 'آلبوم‌های دیپلماتیک',
    nameEn: 'Diplomatic Albums',
    descriptionFa: 'آلبوم‌های تاریخی و عکس‌های تشریفاتی دوره قاجار',
    descriptionEn: 'Historical Albums and Ceremonial Photographs of the Qajar Era',
    active: true,
  },
  {
    id: 'gallery-04',
    galleryId: 'gallery-04',
    galleryNumber: '4',
    nameFa: 'ثبت دوام ما',
    nameEn: 'Recording Our Endurance',
    descriptionFa: 'روایت تصویری از هویت، زیست و حافظه جمعی',
    descriptionEn: 'Visual Narrative of Identity, Life, and Collective Memory',
    active: true,
  },
  {
    id: 'gallery-05',
    galleryId: 'gallery-05',
    galleryNumber: '5',
    nameFa: 'ضرب اهنگ شهر',
    nameEn: 'City Rhythm',
    descriptionFa: 'عکاسی خیابانی و نبض دگرگونی‌های شهری',
    descriptionEn: 'Street Photography and the Pulse of Urban Transformations',
    active: true,
  },
  {
    id: 'gallery-06',
    galleryId: 'gallery-06',
    galleryNumber: '6',
    nameFa: 'در کشاکش تماشا و استیلا',
    nameEn: 'Between Gaze and Mastery',
    descriptionFa: 'رویکردهای انتقادی به تصویر و قدرت دیدن',
    descriptionEn: 'Critical Approaches to the Image and the Power of Seeing',
    active: true,
  },
  {
    id: 'gallery-07',
    galleryId: 'gallery-07',
    galleryNumber: '7',
    nameFa: 'گذر از برون به درون',
    nameEn: 'Passing from Outside to Inside',
    descriptionFa: 'روایت‌های شخصی، پرتره‌نگاری و نگاه درون‌نگر',
    descriptionEn: 'Personal Narratives, Portraiture, and Introspective Vision',
    active: true,
  },
  {
    id: 'gallery-08',
    galleryId: 'gallery-08',
    galleryNumber: '8',
    nameFa: 'آونگ زمان',
    nameEn: 'Pendulum of Time',
    descriptionFa: 'گذر زمان در قالب فرم و متریال عکاسانه',
    descriptionEn: 'The Passage of Time in Photographic Form and Material',
    active: true,
  },
  {
    id: 'gallery-09',
    galleryId: 'gallery-09',
    galleryNumber: '9',
    nameFa: 'تلاقی رسانه‌ها',
    nameEn: 'Intersection of Media',
    descriptionFa: 'پیوند عکاسی با رسانه‌ها و هنرهای نوظهور',
    descriptionEn: 'The Union of Photography with Emerging Arts and Media',
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
      galleryId: 'gallery-01',
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
      galleryId: 'gallery-03',
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
  Object.values(DEFAULT_PUZZLE_QUESTIONS).forEach((pq, idx) => {
    let puzzlePointId: string | undefined;
    if (pq.galleryId === 'gallery-01') {
      puzzlePointId =
        pq.id.includes('q01') || pq.puzzlePieceId.includes('01')
          ? 'puzzle-point-01'
          : pq.id.includes('q02') || pq.puzzlePieceId.includes('02')
          ? 'puzzle-point-02'
          : 'puzzle-point-03';
    } else if (pq.galleryId === 'gallery-03') {
      puzzlePointId =
        pq.id.includes('q01') || pq.puzzlePieceId.includes('01')
          ? 'puzzle-g03-point-01'
          : pq.id.includes('q02') || pq.puzzlePieceId.includes('02')
          ? 'puzzle-g03-point-02'
          : 'puzzle-g03-point-03';
    }

    const orderNum = pq.id.includes('01') ? 1 : pq.id.includes('02') ? 2 : 3;

    questions.push({
      id: pq.id,
      galleryId: pq.galleryId,
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
      reward: 50,
      active: true,
    });
  });

  // 2. Stars Seed
  const stars: StarContent[] = Object.values(DEFAULT_STAR_DISCOVERIES).map((star) => ({
    id: star.id,
    galleryId: star.galleryId,
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
  const artworks: ArtworkContent[] = [];

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
    metadata: {
      loadedAt: Date.now(),
      source: 'seed-fallback',
      version: '1.0.0',
    },
  };
}
