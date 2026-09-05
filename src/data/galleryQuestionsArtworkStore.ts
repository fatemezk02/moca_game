/**
 * Gallery Questions Artwork Store
 * Manages persistence for final artwork image configurations across galleries
 */
import { GALLERY_01_ARTWORK_SRC } from './gallery01Artwork';

export interface GalleryQuestionsArtworkConfig {
  galleryId: string;
  image: string; // base64 data URL or asset URL
  scale: number; // percentage, e.g. 100 for 100%, range 20 - 250
  x: number;     // offset percentage (-50 to +50 from center, or relative %)
  y: number;     // offset percentage (-50 to +50 from center, or relative %)
  imageName?: string;
  updatedAt?: number;
}

const STORAGE_KEY_PREFIX = 'museum_gallery_questions_artwork_';

export const DEFAULT_GALLERY_ARTWORKS: Record<string, GalleryQuestionsArtworkConfig> = {
  'gallery-01': {
    galleryId: 'gallery-01',
    image: GALLERY_01_ARTWORK_SRC,
    scale: 100,
    x: 0,
    y: 0,
    imageName: 'اچ سالیوان.jpg (Default)',
    updatedAt: Date.now(),
  },
  'gallery-03': {
    galleryId: 'gallery-03',
    image: GALLERY_01_ARTWORK_SRC,
    scale: 100,
    x: 0,
    y: 0,
    imageName: 'Gallery 03 Artwork (Placeholder)',
    updatedAt: Date.now(),
  },
};

/**
 * Retrieve the configured artwork for a gallery
 */
export function getGalleryQuestionsArtwork(galleryId: string): GalleryQuestionsArtworkConfig {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${galleryId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.scale === 'number') {
        return {
          galleryId,
          image: parsed.image || DEFAULT_GALLERY_ARTWORKS[galleryId]?.image || GALLERY_01_ARTWORK_SRC,
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

  return DEFAULT_GALLERY_ARTWORKS[galleryId] || {
    galleryId,
    image: GALLERY_01_ARTWORK_SRC,
    scale: 100,
    x: 0,
    y: 0,
    imageName: 'پیش‌فرض',
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
  return DEFAULT_GALLERY_ARTWORKS[galleryId] || {
    galleryId,
    image: GALLERY_01_ARTWORK_SRC,
    scale: 100,
    x: 0,
    y: 0,
    imageName: 'پیش‌فرض',
    updatedAt: Date.now(),
  };
}
