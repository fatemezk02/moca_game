const PLAYER_GALLERY_STORAGE_KEY = 'museum_player_current_gallery';
const ALTERNATIVE_STORAGE_KEY = 'currentGalleryId';

/**
 * Gets the current gallery the player is located in.
 * Starting state defaults to "gallery-00".
 * Survives page navigation and browser refresh.
 */
export function getCurrentGalleryId(): string {
  try {
    const saved =
      localStorage.getItem(PLAYER_GALLERY_STORAGE_KEY) ||
      localStorage.getItem(ALTERNATIVE_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (err) {
    console.error('Failed to read player currentGalleryId:', err);
  }
  return 'gallery-00';
}

/**
 * Updates the player's current gallery location.
 * Dispatches a 'museum_player_location_updated' custom event.
 */
export function setCurrentGalleryId(galleryId: string): void {
  if (!galleryId) return;

  // Normalize question sub-routes to parent gallery
  let target = galleryId;
  if (target === 'gallery-01-questions') target = 'gallery-01';
  if (target === 'gallery-03-questions') target = 'gallery-03';

  try {
    localStorage.setItem(PLAYER_GALLERY_STORAGE_KEY, target);
    localStorage.setItem(ALTERNATIVE_STORAGE_KEY, target);
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
 * Resets the player's location to the starting state (Gallery 00)
 */
export function resetPlayerLocation(): void {
  try {
    localStorage.setItem(PLAYER_GALLERY_STORAGE_KEY, 'gallery-00');
    localStorage.setItem(ALTERNATIVE_STORAGE_KEY, 'gallery-00');
    window.dispatchEvent(
      new CustomEvent('museum_player_location_updated', {
        detail: { currentGalleryId: 'gallery-00' },
      })
    );
  } catch (err) {
    console.error('Failed to reset player currentGalleryId:', err);
  }
}
