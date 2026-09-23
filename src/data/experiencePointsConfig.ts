import { ExperienceContent, ExperienceIconType } from '../services/content/types';
import { contentService } from '../services/content/contentService';
import { normalizeGalleryId } from '../services/content/mappers';

export interface ExperienceMapPointDef {
  id: string;
  experienceId: string;
  galleryId: string;
  iconId: ExperienceIconType;
  icon_id?: ExperienceIconType;
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
  gallery_02: [
    {
      id: 'exp-g02-reversed-camera',
      experienceId: 'experience_1',
      galleryId: 'gallery_02',
      iconId: 'reversed-camera',
      x: 280,
      y: 355,
      labelFa: 'q',
      title: 'q',
    },
  ],
  gallery_03: [
    {
      id: 'exp-g02-reversed-camera',
      experienceId: 'experience_1',
      galleryId: 'gallery_02',
      iconId: 'reversed-camera',
      x: 280,
      y: 355,
      labelFa: 'q',
      title: 'q',
    },
  ],
  gallery_04: [
    {
      id: 'exp-g03-frame',
      experienceId: 'experience_2',
      galleryId: 'gallery_04',
      iconId: 'frame',
      x: 244,
      y: 149,
      labelFa: 'قرن ۱۹ عکاسخانه',
      title: 'قرن ۱۹ عکاسخانه',
    },
    {
      id: 'exp-g03-shadow',
      experienceId: 'experience_3',
      galleryId: 'gallery_04',
      iconId: 'shadow-silhouette',
      x: 241,
      y: 80,
      labelFa: 'پرتره تور و سایه',
      title: 'پرتره تور و سایه',
    },
  ],
  gallery_05: [
    {
      id: 'exp-g05-vintage-camera',
      experienceId: 'experience_5',
      galleryId: 'gallery_05',
      iconId: 'vintage-camera',
      x: 329,
      y: 351,
      labelFa: 'دوربین وارونه',
      title: 'دوربین وارونه',
    },
    {
      id: 'exp-g05-mirror-selfie',
      experienceId: 'experience_6',
      galleryId: 'gallery_05',
      iconId: 'mirror-selfie',
      x: 380,
      y: 446,
      labelFa: 'آینه قاب‌ها',
      title: 'آینه قاب‌ها',
    },
  ],
  gallery_08: [
    {
      id: 'exp-g08-darkroom',
      experienceId: 'experience_7',
      galleryId: 'gallery_08',
      iconId: 'darkroom',
      x: 131,
      y: 433,
      labelFa: 'اتاق تاریک',
      title: 'اتاق تاریک',
    },
  ],
};

const STORAGE_EXP_POINTS_KEY = 'museum_experience_points_v2';
const OLD_EXP_POINTS_KEY = 'museum_experience_points_v1';

/**
 * Retrieves saved coordinate overrides from localStorage if any exist
 */
function getSavedExperiencePoints(): Record<string, { x: number; y: number }> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_EXP_POINTS_KEY);
    if (raw) return JSON.parse(raw);

    // Migration from v1 with shifted IDs
    const oldRaw = localStorage.getItem(OLD_EXP_POINTS_KEY);
    if (oldRaw) {
      const oldCoords = JSON.parse(oldRaw);
      const migrated: Record<string, { x: number; y: number }> = {};
      const shiftMap: Record<string, string> = {
        experience_1: 'experience_2',
        experience_2: 'experience_3',
        experience_3: 'experience_4',
        experience_4: 'experience_5',
        experience_5: 'experience_6',
        experience_6: 'experience_7',
      };
      for (const [key, val] of Object.entries(oldCoords)) {
        const newKey = shiftMap[key] || key;
        migrated[newKey] = val as { x: number; y: number };
      }
      return migrated;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Gets the active Experience Points for a specific gallery.
 * Dynamically binds with ContentService data while preserving canonical SVG coordinates.
 * Strictly filters by gallery: galleries 02, 03, 04, 05, 08 have experiences.
 */
export function getExperiencePointsForGallery(galleryId: string): ExperienceMapPointDef[] {
  const canonId = normalizeGalleryId(galleryId);
  const baseDefs =
    CANONICAL_EXPERIENCE_POINTS[canonId] ||
    (canonId === 'gallery_03' ? CANONICAL_EXPERIENCE_POINTS.gallery_02 : []) ||
    (canonId === 'gallery_02' ? CANONICAL_EXPERIENCE_POINTS.gallery_03 : []) ||
    [];

  if (!baseDefs || baseDefs.length === 0) {
    return [];
  }

  const savedCoords = getSavedExperiencePoints();
  const allExperiences = contentService.getExperiences();

  return baseDefs.map((def) => {
    // Check if ContentService has live data from Google Sheets for this experience
    const liveExp = allExperiences.find(
      (e) =>
        e.experienceId.toLowerCase() === def.experienceId.toLowerCase() ||
        e.id.toLowerCase() === def.experienceId.toLowerCase() ||
        (def.iconId && e.iconId === def.iconId)
    );

    // Apply any saved coordinates override from localStorage
    const saved = savedCoords[def.id] || savedCoords[def.experienceId];
    const x = saved ? saved.x : def.x;
    const y = saved ? saved.y : def.y;

    const effectiveIcon =
      def.id === 'exp-g02-reversed-camera' || def.iconId === 'reversed-camera'
        ? 'reversed-camera'
        : def.id === 'exp-g05-vintage-camera'
        ? 'vintage-camera'
        : def.id === 'exp-g05-mirror-selfie'
        ? 'mirror-selfie'
        : liveExp?.iconId || def.iconId;

    return {
      ...def,
      x,
      y,
      iconId: effectiveIcon,
      icon_id: effectiveIcon,
      labelFa: liveExp?.labelFa || def.labelFa,
      title: liveExp?.title || def.title,
    };
  });
}

/**
 * Saves or updates coordinates for an Experience Point in local persistence
 * and dispatches update events so all gallery views re-render immediately.
 */
export function saveExperiencePointPosition(
  id: string,
  x: number,
  y: number,
  galleryId?: string
): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const current = getSavedExperiencePoints();
    current[id] = { x, y };

    // Also match and store under alternative ID (e.g. experience_1 <-> exp-g02-reversed-camera)
    const allDefs = Object.values(CANONICAL_EXPERIENCE_POINTS).flat();
    const matched = allDefs.find((e) => e.id === id || e.experienceId === id);
    if (matched) {
      current[matched.id] = { x, y };
      current[matched.experienceId] = { x, y };
    }

    localStorage.setItem(STORAGE_EXP_POINTS_KEY, JSON.stringify(current));

    window.dispatchEvent(
      new CustomEvent('museum_experience_points_updated', {
        detail: { id, x, y, galleryId },
      })
    );
    window.dispatchEvent(
      new CustomEvent('museum_points_updated', {
        detail: { galleryId },
      })
    );
    window.dispatchEvent(
      new CustomEvent('museum_puzzle_progress_updated', {
        detail: { galleryId },
      })
    );

    if (galleryId === 'gallery-02' || galleryId === 'gallery-03') {
      window.dispatchEvent(
        new CustomEvent('museum_experience_points_updated', {
          detail: { id, x, y, galleryId: 'gallery-02' },
        })
      );
      window.dispatchEvent(
        new CustomEvent('museum_experience_points_updated', {
          detail: { id, x, y, galleryId: 'gallery-03' },
        })
      );
    }
  } catch (err) {
    console.error('Error saving experience point position:', err);
  }
}

