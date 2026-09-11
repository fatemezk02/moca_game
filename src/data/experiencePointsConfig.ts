import { ExperienceContent, ExperienceIconType } from '../services/content/types';
import { contentService } from '../services/content/contentService';
import { normalizeGalleryId } from '../services/content/mappers';

export interface ExperienceMapPointDef {
  id: string;
  experienceId: string;
  galleryId: string;
  iconId: ExperienceIconType;
  x: number;
  y: number;
  labelFa?: string;
  title?: string;
}

/**
 * Authoritative SVG-relative default coordinates for Experience Points per gallery.
 * Carefully positioned on open floor plan space without overlapping Star or Puzzle points.
 */
export const CANONICAL_EXPERIENCE_POINTS: Record<string, ExperienceMapPointDef[]> = {
  gallery_03: [
    {
      id: 'exp-g03-frame',
      experienceId: 'experience_1',
      galleryId: 'gallery_03',
      iconId: 'frame',
      x: 230,
      y: 560,
      labelFa: 'قاب پرتره',
      title: 'قاب پرتره',
    },
    {
      id: 'exp-g03-shadow',
      experienceId: 'experience_2',
      galleryId: 'gallery_03',
      iconId: 'shadow-silhouette',
      x: 620,
      y: 560,
      labelFa: 'سایه و ضد‌نور',
      title: 'سایه و ضد‌نور',
    },
  ],
  gallery_04: [
    {
      id: 'exp-g04-mirror',
      experienceId: 'experience_3',
      galleryId: 'gallery_04',
      iconId: 'mirror',
      x: 590,
      y: 560,
      labelFa: 'انعکاس در آینه',
      title: 'انعکاس در آینه',
    },
  ],
  gallery_05: [
    {
      id: 'exp-g05-vintage-camera',
      experienceId: 'experience_4',
      galleryId: 'gallery_05',
      iconId: 'vintage-camera',
      x: 381,
      y: 340,
      labelFa: 'دوربین قطع بزرگ',
      title: 'دوربین قطع بزرگ',
    },
    {
      id: 'exp-g05-mirror-selfie',
      experienceId: 'experience_5',
      galleryId: 'gallery_05',
      iconId: 'mirror-selfie',
      x: 381,
      y: 760,
      labelFa: 'سلفی در آینه',
      title: 'سلفی در آینه',
    },
  ],
  gallery_08: [
    {
      id: 'exp-g08-darkroom',
      experienceId: 'experience_6',
      galleryId: 'gallery_08',
      iconId: 'darkroom',
      x: 358,
      y: 280,
      labelFa: 'اتاق تاریک',
      title: 'اتاق تاریک',
    },
  ],
};

const STORAGE_EXP_POINTS_KEY = 'museum_experience_points_v1';

/**
 * Retrieves saved coordinate overrides from localStorage if any exist
 */
function getSavedExperiencePoints(): Record<string, { x: number; y: number }> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_EXP_POINTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Gets the active Experience Points for a specific gallery.
 * Dynamically binds with ContentService data while preserving canonical SVG coordinates.
 * Strictly filters by gallery: only galleries 03, 04, 05, 08 have experiences.
 */
export function getExperiencePointsForGallery(galleryId: string): ExperienceMapPointDef[] {
  const canonId = normalizeGalleryId(galleryId);
  const baseDefs = CANONICAL_EXPERIENCE_POINTS[canonId] || [];

  if (baseDefs.length === 0) {
    return [];
  }

  const savedCoords = getSavedExperiencePoints();
  const galleryExperiences = contentService.getExperiencesForGallery(galleryId);

  return baseDefs.map((def) => {
    // Check if ContentService has live data from Google Sheets for this experience
    const liveExp = galleryExperiences.find(
      (e) =>
        e.experienceId.toLowerCase() === def.experienceId.toLowerCase() ||
        e.id.toLowerCase() === def.experienceId.toLowerCase() ||
        e.iconId === def.iconId
    );

    // Apply any saved coordinates override from localStorage
    const saved = savedCoords[def.id] || savedCoords[def.experienceId];
    const x = saved ? saved.x : def.x;
    const y = saved ? saved.y : def.y;

    return {
      ...def,
      x,
      y,
      iconId: liveExp?.iconId || def.iconId,
      labelFa: liveExp?.labelFa || def.labelFa,
      title: liveExp?.title || def.title,
    };
  });
}
