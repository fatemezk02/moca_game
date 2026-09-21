import { GalleryAreaConfig } from '../types/galleryArea';
import { normalizeGalleryId } from '../services/content/mappers';

const STORAGE_KEY = 'museum_gallery_areas_config';
export const STORAGE_GALLERY_LAMPS_KEY = 'museum_gallery_lamps_config_v4';
export const STORAGE_GALLERY_LOCKS_KEY = 'museum_gallery_locks_config_v4';

export interface GalleryLampItem {
  id: string;
  galleryId: string;
  masterMapGalleryId?: string;
  title: string;
  x: number;
  y: number;
}

export interface GalleryLockItem {
  id: string;
  galleryId: string;
  masterMapGalleryId?: string;
  title: string;
  x: number;
  y: number;
}

/**
 * Default location of the lamp when player is in Gallery 00 (Lobby/Master Archive entrance)
 * Matches the original coordinates: mapX = 50.0% (302.4px), mapY = 9.2% (77.7px)
 */
export const DEFAULT_GALLERY_00_LAMP_POSITION = {
  x: 512,
  y: 94,
};

/**
 * Standard known museum gallery lamps on the Master Map SVG (0 0 604.8 844.86)
 */
export const DEFAULT_GALLERY_LAMPS: Array<{ galleryId: string; title: string; defaultX: number; defaultY: number }> = [
  { galleryId: 'gallery_01', title: 'چراغ گالری ۰۱', defaultX: 309, defaultY: 734 },
  { galleryId: 'gallery_02', title: 'چراغ گالری ۰۲ (کیمیای نور / تالار معماری)', defaultX: 165, defaultY: 480 },
  { galleryId: 'gallery_03', title: 'چراغ گالری ۰۳ (آلبوم‌های دیپلماتیک / تالار مدرن)', defaultX: 162, defaultY: 326 },
  { galleryId: 'gallery_04', title: 'چراغ گالری ۰۴ (ثبت دوام ما)', defaultX: 162, defaultY: 172 },
  { galleryId: 'gallery_05', title: 'چراغ گالری ۰۵ (ضرب آهنگ شهر)', defaultX: 313, defaultY: 124 },
  { galleryId: 'gallery_06', title: 'چراغ گالری ۰۶ (در کشاکش تماشا و استیلا)', defaultX: 466, defaultY: 254 },
  { galleryId: 'gallery_07', title: 'چراغ گالری ۰۷ (گذر از برون به درون)', defaultX: 418, defaultY: 283 },
  { galleryId: 'gallery_08', title: 'چراغ گالری ۰۸ (آونگ زمان)', defaultX: 427, defaultY: 382 },
  { galleryId: 'gallery_09', title: 'چراغ گالری ۰۹ (تلاقی رسانه‌ها)', defaultX: 463, defaultY: 481 },
  { galleryId: 'gallery_00', title: 'چراغ ورودی (نقشه اصلی)', defaultX: 512, defaultY: 94 },
];

/**
 * Default gallery areas configured for Gallery 01 and Gallery 03 on the master Gallery 00 SVG map.
 * SVG viewBox of Gallery 00 is 0 0 604.8 844.86.
 */
export const DEFAULT_GALLERY_AREAS: GalleryAreaConfig[] = [
  {
    id: 'area-gallery-02',
    galleryId: 'gallery_02',
    masterMapGalleryId: 'gallery-00',
    title: 'گالری ۰۲ — تالار معماری',
    area: {
      type: 'polygon',
      points: [
        { x: 220, y: 30 },
        { x: 385, y: 30 },
        { x: 405, y: 135 },
        { x: 200, y: 135 },
      ],
    },
    lampPosition: {
      x: 165,
      y: 480,
    },
  },
  {
    id: 'area-gallery-03',
    galleryId: 'gallery-03',
    masterMapGalleryId: 'gallery-00',
    title: 'گالری ۰۳ — تالار مدرن',
    area: {
      type: 'polygon',
      points: [
        { x: 410, y: 260 },
        { x: 535, y: 260 },
        { x: 545, y: 410 },
        { x: 400, y: 410 },
      ],
    },
    lampPosition: {
      x: 162,
      y: 326,
    },
  },
  {
    id: 'area-gallery-04',
    galleryId: 'gallery-04',
    masterMapGalleryId: 'gallery-00',
    title: 'گالری ۰۴',
    area: {
      type: 'polygon',
      points: [
        { x: 70, y: 260 },
        { x: 195, y: 260 },
        { x: 205, y: 410 },
        { x: 60, y: 410 },
      ],
    },
    lampPosition: {
      x: 162,
      y: 172,
    },
  },
];

let cachedAreas: GalleryAreaConfig[] | null = null;

/**
 * Get all configured Gallery Areas on the master Gallery 00 map
 */
export function getGalleryAreas(): GalleryAreaConfig[] {
  if (cachedAreas) return cachedAreas;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const combined = [...parsed];
          for (const def of DEFAULT_GALLERY_AREAS) {
            if (!combined.some((a) => a.galleryId === def.galleryId)) {
              combined.push(def);
            }
          }
          cachedAreas = combined;
          return cachedAreas!;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load gallery areas from localStorage:', err);
  }

  // Fallback to default
  cachedAreas = JSON.parse(JSON.stringify(DEFAULT_GALLERY_AREAS));
  return cachedAreas!;
}

/**
 * Get all saved gallery lamp positions overrides from localStorage
 */
export function getSavedGalleryLamps(): Record<string, { x: number; y: number }> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_GALLERY_LAMPS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load saved gallery lamps:', err);
  }
  return {};
}

/**
 * Persists a gallery lamp position using exact SVG viewBox coordinates.
 * Preserves the gallery association and updates both dedicated lamp storage and galleryAreaConfig.
 */
export function saveGalleryLampPosition(rawGalleryId: string, x: number, y: number): void {
  const roundedX = Math.round(x * 10) / 10;
  const roundedY = Math.round(y * 10) / 10;
  const canonId = normalizeGalleryId(rawGalleryId) || rawGalleryId;

  // 1. Update saved lamps dictionary
  const current = getSavedGalleryLamps();
  current[canonId] = { x: roundedX, y: roundedY };
  current[rawGalleryId] = { x: roundedX, y: roundedY };

  // Also cross-link legacy aliases (e.g. gallery_02 <-> gallery-01)
  if (canonId === 'gallery_02') {
    current['gallery-01'] = { x: roundedX, y: roundedY };
  } else if (canonId === 'gallery_03') {
    current['gallery-03'] = { x: roundedX, y: roundedY };
  } else if (canonId === 'gallery_04') {
    current['gallery-04'] = { x: roundedX, y: roundedY };
  } else if (canonId === 'gallery_00') {
    current['gallery-00'] = { x: roundedX, y: roundedY };
    current['gallery_01'] = { x: roundedX, y: roundedY };
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_GALLERY_LAMPS_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.error('Failed to persist gallery lamp position:', err);
  }

  // 2. Also update corresponding galleryArea if one exists
  const areas = getGalleryAreas();
  let updatedAnyArea = false;
  const newAreas = areas.map((area) => {
    const areaCanon = normalizeGalleryId(area.galleryId);
    if (
      area.galleryId === rawGalleryId ||
      area.galleryId === canonId ||
      areaCanon === canonId ||
      (canonId === 'gallery_02' && area.galleryId === 'gallery-01')
    ) {
      updatedAnyArea = true;
      return {
        ...area,
        lampPosition: { x: roundedX, y: roundedY },
      };
    }
    return area;
  });

  if (updatedAnyArea) {
    saveGalleryAreas(newAreas);
  }

  // 3. Dispatch update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('museum_lamp_position_updated', {
        detail: { galleryId: canonId, rawGalleryId, x: roundedX, y: roundedY },
      })
    );
    window.dispatchEvent(new CustomEvent('museum_gallery_areas_updated'));
  }
}

/**
 * Returns list of all existing gallery lamps for the Master Map.
 * Ensures exactly one lamp per gallery and preserves gallery association.
 */
export function getAllGalleryLamps(): GalleryLampItem[] {
  const lamps: GalleryLampItem[] = [];
  const seenGalleries = new Set<string>();

  // Helper to map aliases
  const getMappedCanon = (id: string) => {
    const c = normalizeGalleryId(id);
    if (c === 'gallery_01') return 'gallery_02'; // Map gallery_01 to gallery_02
    return c;
  };

  // 1. Process known standard museum galleries
  for (const def of DEFAULT_GALLERY_LAMPS) {
    const canonId = getMappedCanon(def.galleryId);
    if (seenGalleries.has(canonId)) continue;
    seenGalleries.add(canonId);

    const pos = getLampPositionForGallery(def.galleryId);
    lamps.push({
      id: `lamp-${canonId}`,
      galleryId: canonId,
      masterMapGalleryId: 'gallery-00',
      title: def.title,
      x: pos.x,
      y: pos.y,
    });
  }

  // 2. Check if any other gallery area exists that was not in standard list
  const areas = getGalleryAreas();
  for (const area of areas) {
    const canonId = getMappedCanon(area.galleryId);
    if (!seenGalleries.has(canonId)) {
      seenGalleries.add(canonId);
      const pos = getLampPositionForGallery(area.galleryId);
      lamps.push({
        id: `lamp-${canonId}`,
        galleryId: canonId,
        masterMapGalleryId: 'gallery-00',
        title: `چراغ ${area.title || canonId}`,
        x: pos.x,
        y: pos.y,
      });
    }
  }

  return lamps;
}

/**
 * Find configured Gallery Area by target galleryId (normalizing aliases)
 */
export function getGalleryAreaByGalleryId(galleryId: string): GalleryAreaConfig | undefined {
  if (!galleryId) return undefined;
  const canonTarget = normalizeGalleryId(galleryId);
  const areas = getGalleryAreas();
  return areas.find((a) => {
    if (a.galleryId === galleryId) return true;
    const aCanon = normalizeGalleryId(a.galleryId);
    if (aCanon && aCanon === canonTarget) return true;
    // Cross-link gallery-01 area with gallery_02
    if (
      (galleryId === 'gallery_02' && a.galleryId === 'gallery-01') ||
      (galleryId === 'gallery-01' && a.galleryId === 'gallery_02')
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Resolves the dynamic lamp position for a gallery on the Master Map SVG (604.8 × 844.86).
 * Priority:
 * 1. Dedicated saved lamp position (from Development Positioning Tool)
 * 2. Configured Gallery Area lampPosition
 * 3. Default known gallery lamp position
 * 4. Fallback default entrance position
 */
export function getLampPositionForGallery(galleryId: string): { x: number; y: number } {
  // If player is in Lobby/Master Archive entrance
  if (!galleryId || galleryId === 'gallery-00' || galleryId === 'gallery_00') {
    const saved = getSavedGalleryLamps();
    if (saved['gallery-00']) return saved['gallery-00'];
    if (saved['gallery_00']) return saved['gallery_00'];
    return DEFAULT_GALLERY_00_LAMP_POSITION;
  }

  const canonId = normalizeGalleryId(galleryId);
  const saved = getSavedGalleryLamps();

  // 1. Saved lamp positions
  if (saved[galleryId]) return saved[galleryId];
  if (saved[canonId]) return saved[canonId];
  if (canonId === 'gallery_02' && saved['gallery-01']) return saved['gallery-01'];
  if (canonId === 'gallery_03' && saved['gallery-03']) return saved['gallery-03'];
  if (canonId === 'gallery_04' && saved['gallery-04']) return saved['gallery-04'];

  // 2. Configured gallery area
  const area = getGalleryAreaByGalleryId(galleryId);
  if (area && area.lampPosition) {
    return area.lampPosition;
  }

  // 3. Known default position
  const foundDef = DEFAULT_GALLERY_LAMPS.find(
    (d) => d.galleryId === galleryId || normalizeGalleryId(d.galleryId) === canonId
  );
  if (foundDef) {
    return { x: foundDef.defaultX, y: foundDef.defaultY };
  }

  // 4. Fallback to default location
  return DEFAULT_GALLERY_00_LAMP_POSITION;
}

/**
 * Save Gallery Areas to persistent storage
 */
export function saveGalleryAreas(areas: GalleryAreaConfig[]): void {
  cachedAreas = areas;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
    window.dispatchEvent(new CustomEvent('museum_gallery_areas_updated', { detail: areas }));
  } catch (err) {
    console.error('Failed to save gallery areas:', err);
  }
}

/**
 * Reset Gallery Areas to default configuration
 */
export function resetGalleryAreas(): GalleryAreaConfig[] {
  cachedAreas = JSON.parse(JSON.stringify(DEFAULT_GALLERY_AREAS));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedAreas));
    window.dispatchEvent(new CustomEvent('museum_gallery_areas_updated', { detail: cachedAreas }));
  } catch (err) {
    console.error('Failed to reset gallery areas:', err);
  }
  return cachedAreas!;
}

/**
 * Factory to create a new Gallery Area for an unconfigured gallery
 */
export function createNewGalleryArea(galleryId: string, title?: string): GalleryAreaConfig {
  const centerX = 302;
  const centerY = 422;
  const halfWidth = 60;
  const halfHeight = 50;

  return {
    id: `area-${galleryId}-${Date.now().toString().slice(-4)}`,
    galleryId,
    masterMapGalleryId: 'gallery-00',
    title: title || galleryId,
    area: {
      type: 'polygon',
      points: [
        { x: centerX - halfWidth, y: centerY - halfHeight },
        { x: centerX + halfWidth, y: centerY - halfHeight },
        { x: centerX + halfWidth, y: centerY + halfHeight },
        { x: centerX - halfWidth, y: centerY + halfHeight },
      ],
    },
    lampPosition: {
      x: centerX,
      y: centerY,
    },
  };
}

/**
 * Standard known museum gallery locks on the Master Map SVG (0 0 604.8 844.86)
 */
export const DEFAULT_GALLERY_LOCKS: Array<{ galleryId: string; title: string; defaultX: number; defaultY: number }> = [
  { galleryId: 'gallery_02', title: 'قفل گالری ۰۲ (کیمیای نور / تالار معماری)', defaultX: 175, defaultY: 502 },
  { galleryId: 'gallery_03', title: 'قفل گالری ۰۳ (آلبوم‌های دیپلماتیک / تالار مدرن)', defaultX: 157, defaultY: 336 },
  { galleryId: 'gallery_04', title: 'قفل گالری ۰۴ (ثبت دوام ما)', defaultX: 161, defaultY: 185 },
  { galleryId: 'gallery_05', title: 'قفل گالری ۰۵ (ضرب آهنگ شهر)', defaultX: 312, defaultY: 148 },
  { galleryId: 'gallery_06', title: 'قفل گالری ۰۶ (در کشاکش تماشا و استیلا)', defaultX: 467, defaultY: 268 },
  { galleryId: 'gallery_07', title: 'قفل گالری ۰۷ (گذر از برون به درون)', defaultX: 376, defaultY: 253 },
  { galleryId: 'gallery_08', title: 'قفل گالری ۰۸ (آونگ زمان)', defaultX: 422, defaultY: 381 },
  { galleryId: 'gallery_09', title: 'قفل گالری ۰۹ (تلاقی رسانه‌ها)', defaultX: 453, defaultY: 501 },
];

/**
 * Get all saved gallery lock positions overrides from localStorage
 */
export function getSavedGalleryLocks(): Record<string, { x: number; y: number }> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_GALLERY_LOCKS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load saved gallery locks:', err);
  }
  return {};
}

/**
 * Persists a gallery lock position using exact SVG viewBox coordinates.
 * Preserves the gallery association and updates dedicated lock storage.
 */
export function saveGalleryLockPosition(rawGalleryId: string, x: number, y: number): void {
  const roundedX = Math.round(x * 10) / 10;
  const roundedY = Math.round(y * 10) / 10;
  const canonId = normalizeGalleryId(rawGalleryId) || rawGalleryId;

  // 1. Update saved locks dictionary
  const current = getSavedGalleryLocks();
  current[canonId] = { x: roundedX, y: roundedY };
  current[rawGalleryId] = { x: roundedX, y: roundedY };

  // Also cross-link legacy aliases (e.g. gallery_02 <-> gallery-01)
  if (canonId === 'gallery_02') {
    current['gallery-01'] = { x: roundedX, y: roundedY };
  } else if (canonId === 'gallery_03') {
    current['gallery-03'] = { x: roundedX, y: roundedY };
  } else if (canonId === 'gallery_04') {
    current['gallery-04'] = { x: roundedX, y: roundedY };
  } else if (canonId === 'gallery_00') {
    current['gallery-00'] = { x: roundedX, y: roundedY };
    current['gallery_01'] = { x: roundedX, y: roundedY };
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_GALLERY_LOCKS_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.error('Failed to persist gallery lock position:', err);
  }

  // 2. Dispatch update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('museum_lock_position_updated', {
        detail: { galleryId: canonId, rawGalleryId, x: roundedX, y: roundedY },
      })
    );
    window.dispatchEvent(new CustomEvent('museum_gallery_areas_updated'));
  }
}

/**
 * Resolves the dynamic lock position for a gallery on the Master Map SVG (604.8 × 844.86).
 * Priority:
 * 1. Dedicated saved lock position (from Development Positioning Tool)
 * 2. Fallback to this gallery's lamp position
 */
export function getLockPositionForGallery(galleryId: string): { x: number; y: number } {
  const canonId = normalizeGalleryId(galleryId);
  const saved = getSavedGalleryLocks();

  // 1. Saved lock positions
  if (saved[galleryId]) return saved[galleryId];
  if (saved[canonId]) return saved[canonId];
  if (canonId === 'gallery_02' && saved['gallery-01']) return saved['gallery-01'];
  if (canonId === 'gallery_03' && saved['gallery-03']) return saved['gallery-03'];
  if (canonId === 'gallery_04' && saved['gallery-04']) return saved['gallery-04'];

  // 2. Default lock positions
  const def = DEFAULT_GALLERY_LOCKS.find(
    (l) => normalizeGalleryId(l.galleryId) === canonId || l.galleryId === galleryId
  );
  if (def) {
    return { x: def.defaultX, y: def.defaultY };
  }

  // 3. Fallback to lamp position of this gallery
  return getLampPositionForGallery(galleryId);
}

/**
 * Returns list of all existing gallery locks for the Master Map.
 * Ensures exactly one lock per gallery and preserves gallery association.
 */
export function getAllGalleryLocks(): GalleryLockItem[] {
  const locks: GalleryLockItem[] = [];
  const seenGalleries = new Set<string>();

  // 1. Process known standard museum galleries
  for (const def of DEFAULT_GALLERY_LOCKS) {
    const canonId = normalizeGalleryId(def.galleryId);
    if (seenGalleries.has(canonId)) continue;
    seenGalleries.add(canonId);

    const pos = getLockPositionForGallery(def.galleryId);
    locks.push({
      id: `lock-${canonId}`,
      galleryId: canonId,
      masterMapGalleryId: 'gallery-00',
      title: def.title,
      x: pos.x,
      y: pos.y,
    });
  }

  // 2. Check if any other gallery area exists that was not in standard list
  const areas = getGalleryAreas();
  for (const area of areas) {
    const canonId = normalizeGalleryId(area.galleryId);
    if (canonId === 'gallery_00') continue;
    if (!seenGalleries.has(canonId)) {
      seenGalleries.add(canonId);
      const pos = getLockPositionForGallery(area.galleryId);
      locks.push({
        id: `lock-${canonId}`,
        galleryId: canonId,
        masterMapGalleryId: 'gallery-00',
        title: `قفل ${area.title || canonId}`,
        x: pos.x,
        y: pos.y,
      });
    }
  }

  return locks;
}

