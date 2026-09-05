import { GalleryAreaConfig } from '../types/galleryArea';

const STORAGE_KEY = 'museum_gallery_areas_config';

/**
 * Default location of the lamp when player is in Gallery 00 (Lobby/Master Archive entrance)
 * Matches the original coordinates: mapX = 50.0% (302.4px), mapY = 9.2% (77.7px)
 */
export const DEFAULT_GALLERY_00_LAMP_POSITION = {
  x: 302.4,
  y: 77.7,
};

/**
 * Default gallery areas configured for Gallery 01 and Gallery 03 on the master Gallery 00 SVG map.
 * SVG viewBox of Gallery 00 is 0 0 604.8 844.86.
 */
export const DEFAULT_GALLERY_AREAS: GalleryAreaConfig[] = [
  {
    id: 'area-gallery-01',
    galleryId: 'gallery-01',
    masterMapGalleryId: 'gallery-00',
    title: 'گالری ۰۱ — تالار معماری',
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
      x: 302,
      y: 85,
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
      x: 475,
      y: 335,
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
      x: 135,
      y: 335,
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
  } catch (err) {
    console.error('Failed to load gallery areas from localStorage:', err);
  }

  // Fallback to default
  cachedAreas = JSON.parse(JSON.stringify(DEFAULT_GALLERY_AREAS));
  return cachedAreas!;
}

/**
 * Find configured Gallery Area by target galleryId
 */
export function getGalleryAreaByGalleryId(galleryId: string): GalleryAreaConfig | undefined {
  const areas = getGalleryAreas();
  return areas.find((a) => a.galleryId === galleryId);
}

/**
 * Resolves the dynamic lamp position for the player's current gallery on Gallery 00.
 *
 * player.currentGalleryId
 *         ↓
 * galleryAreas[currentGalleryId]
 *         ↓
 * lampPosition
 *         ↓
 * Gallery 00 SVG
 */
export function getLampPositionForGallery(galleryId: string): { x: number; y: number } {
  // If player is in Gallery 00, return default Gallery 00 lamp position
  if (!galleryId || galleryId === 'gallery-00') {
    return DEFAULT_GALLERY_00_LAMP_POSITION;
  }

  const area = getGalleryAreaByGalleryId(galleryId);
  if (area && area.lampPosition) {
    return area.lampPosition;
  }

  // Fallback to default location
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
