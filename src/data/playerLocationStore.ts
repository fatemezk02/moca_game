const PLAYER_GALLERY_STORAGE_KEY = 'museum_player_current_gallery';
const ALTERNATIVE_STORAGE_KEY = 'currentGalleryId';

/**
 * Returns numeric rank for gallery progression order:
 * Gallery 02 (or 01) -> 2
 * Gallery 03 -> 3
 * Gallery 04 -> 4
 * Gallery 05 -> 5
 * Gallery 06 -> 6
 * Gallery 07 -> 7
 * Gallery 08 -> 8
 * Gallery 09 -> 9
 */
export function getGalleryRank(galleryId: string): number {
  if (!galleryId || typeof galleryId !== 'string') return 0;
  const norm = galleryId.toLowerCase().replace('_', '-');
  if (norm.includes('gallery-09')) return 9;
  if (norm.includes('gallery-08')) return 8;
  if (norm.includes('gallery-07')) return 7;
  if (norm.includes('gallery-06')) return 6;
  if (norm.includes('gallery-05')) return 5;
  if (norm.includes('gallery-04')) return 4;
  if (norm.includes('gallery-03')) return 3;
  if (norm.includes('gallery-02')) return 2;
  if (norm.includes('gallery-01')) return 1;
  return 0;
}

/**
 * Gets the current gallery the player is located in.
 * Starting state defaults to "gallery-01".
 * Survives page navigation and browser refresh.
 */
export function getCurrentGalleryId(): string {
  try {
    const saved =
      localStorage.getItem(PLAYER_GALLERY_STORAGE_KEY) ||
      localStorage.getItem(ALTERNATIVE_STORAGE_KEY);
    if (saved && saved.trim() && saved.trim() !== 'gallery-00' && saved.trim() !== 'gallery_00') {
      return saved.trim();
    }
  } catch (err) {
    console.error('Failed to read player currentGalleryId:', err);
  }
  return 'gallery-01';
}

/**
 * Updates the player's current gallery location.
 * Tracks the last gallery the user was in (from galleries 01 to 08).
 * Preserves current gallery location when user views the map (gallery-00).
 * Dispatches a 'museum_player_location_updated' custom event.
 */
export function setCurrentGalleryId(galleryId: string): void {
  if (!galleryId) return;

  // Normalize question sub-routes to parent gallery
  let target = galleryId.replace('_', '-');
  if (target === 'gallery-01-questions') target = 'gallery-01';
  if (target === 'gallery-03-questions') target = 'gallery-03';

  const newRank = getGalleryRank(target);
  if (newRank <= 0) {
    // If it's gallery-00 or non-gallery destination, do not overwrite current gallery
    return;
  }

  // Update to the last gallery the user entered (from 01 to 08)
  try {
    localStorage.setItem(PLAYER_GALLERY_STORAGE_KEY, target);
    localStorage.setItem(ALTERNATIVE_STORAGE_KEY, target);
    localStorage.setItem('museum_active_gallery', target);
    window.dispatchEvent(
      new CustomEvent('museum_player_location_updated', {
        detail: { currentGalleryId: target },
      })
    );
  } catch (err) {
    console.error('Failed to persist player currentGalleryId:', err);
  }
}

/**
 * Resets the player's location to the starting state (Gallery 01)
 */
export function resetPlayerLocation(): void {
  try {
    localStorage.setItem(PLAYER_GALLERY_STORAGE_KEY, 'gallery-01');
    localStorage.setItem(ALTERNATIVE_STORAGE_KEY, 'gallery-01');
    localStorage.setItem('museum_active_gallery', 'gallery-01');
    window.dispatchEvent(
      new CustomEvent('museum_player_location_updated', {
        detail: { currentGalleryId: 'gallery-01' },
      })
    );
  } catch (err) {
    console.error('Failed to reset player currentGalleryId:', err);
  }
}
