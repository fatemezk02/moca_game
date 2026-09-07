/**
 * Gallery Questions Artwork Store
 * Manages persistence for final artwork image configurations across galleries
 */
import { contentService } from '../services/content/contentService';
import { GALLERY_01_ARTWORK_SRC } from './gallery01Artwork';

export interface GalleryQuestionsArtworkConfig {
  galleryId: string;
  image: string; // URL or base64
  scale: number; // percentage, e.g. 100 for 100%, range 20 - 250
  x: number;     // offset percentage (-50 to +50 from center, or relative %)
  y: number;     // offset percentage (-50 to +50 from center, or relative %)
  imageName?: string;
  updatedAt?: number;
}

const STORAGE_KEY_PREFIX = 'museum_gallery_questions_artwork_';

/**
 * Retrieve the configured artwork for a gallery dynamically from ContentService.
 * Respects user adjustments (scale, x, y) in localStorage while ensuring the source
 * image resolves to the gallery's configured puzzle artwork in Google Sheets.
 */
export function getGalleryQuestionsArtwork(galleryId: string): GalleryQuestionsArtworkConfig {
  const dynamicSrc = contentService.getGalleryPuzzleArtworkSrc(galleryId);

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${galleryId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.scale === 'number') {
        // If parsed.image was an old hardcoded asset or placeholder, prefer dynamic URL from Google Sheets
        const isLegacyDefault =
          !parsed.image ||
          parsed.image === GALLERY_01_ARTWORK_SRC ||
          parsed.image.includes('gallery01Artwork') ||
          parsed.imageName?.includes('Default') ||
          parsed.imageName?.includes('Placeholder');

        const imageToUse = isLegacyDefault
          ? (dynamicSrc || parsed.image || '')
          : (parsed.image || dynamicSrc || '');

        return {
          galleryId,
          image: imageToUse,
          scale: parsed.scale ?? 100,
          x: parsed.x ?? 0,
          y: parsed.y ?? 0,
          imageName: parsed.imageName || 'سفارشی',
          updatedAt: parsed.updatedAt || Date.now(),
        };
      }
    }
  } catch (err) {
    console.warn('Failed to load gallery questions artwork from localStorage', err);
  }

  return {
    galleryId,
    image: dynamicSrc || '',
    scale: 100,
    x: 0,
    y: 0,
    imageName: `اثر پازل ${galleryId}`,
    updatedAt: Date.now(),
  };
}

/**
 * Save the configured artwork for a gallery
 */
export function saveGalleryQuestionsArtwork(config: GalleryQuestionsArtworkConfig): void {
  try {
    const toSave: GalleryQuestionsArtworkConfig = {
      ...config,
      updatedAt: Date.now(),
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${config.galleryId}`, JSON.stringify(toSave));
    // Dispatch a custom window event so open views can update dynamically if needed
    window.dispatchEvent(
      new CustomEvent('gallery_questions_artwork_updated', {
        detail: { galleryId: config.galleryId, config: toSave },
      })
    );
  } catch (err) {
    console.error('Failed to save gallery questions artwork to localStorage', err);
  }
}

/**
 * Reset the configured artwork to default for a gallery
 */
export function resetGalleryQuestionsArtwork(galleryId: string): GalleryQuestionsArtworkConfig {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${galleryId}`);
  } catch (err) {
    console.warn('Failed to remove gallery questions artwork from localStorage', err);
  }

  const dynamicSrc = contentService.getGalleryPuzzleArtworkSrc(galleryId);
  const defConfig: GalleryQuestionsArtworkConfig = {
    galleryId,
    image: dynamicSrc || '',
    scale: 100,
    x: 0,
    y: 0,
    imageName: `اثر پازل ${galleryId}`,
    updatedAt: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent('gallery_questions_artwork_updated', {
      detail: { galleryId, config: defConfig },
    })
  );

  return defConfig;
}
