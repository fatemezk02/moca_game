/**
 * Persistent Collection Notification Store
 * Manages the unread completed artwork counter for the Collections badge.
 *
 * Rules:
 * - Every time a player completes a puzzle/artwork and a new artwork is added to Collections,
 *   the counter increments by 1.
 * - Shows this count inside the existing red notification badge above the Collections button.
 * - When the player opens the Collections page, the counter resets to 0 and the badge is hidden.
 * - Only counts newly completed artworks that the player has not already viewed in Collections.
 * - Persists across app sessions via localStorage.
 */

import { useState, useEffect } from 'react';
import { isGalleryPuzzleCompleted } from './puzzleProgressStore';

const STORAGE_VIEWED_COLLECTIONS_KEY = 'museum_viewed_collection_artworks';

/**
 * The 8 gallery slots represented as exhibition artworks on the Collections wall
 * (matching CuratorExhibitionWall ordering and slots).
 * Note: Gallery 01 and Gallery 02 both correspond to the first artwork slot ('gallery-01').
 */
export const COLLECTION_GALLERY_IDS: string[] = [
  'gallery-01',
  'gallery-03',
  'gallery-04',
  'gallery-05',
  'gallery-06',
  'gallery-08',
  'gallery-09',
  'gallery-07',
];

/**
 * Normalizes any gallery ID to its canonical Collections artwork slot ID.
 * Both gallery-01 and gallery-02 refer to the first artwork slot ('gallery-01').
 */
export function toCollectionArtworkId(galleryId: string): string {
  if (!galleryId || typeof galleryId !== 'string') return '';
  const clean = galleryId.toLowerCase().replace(/_/g, '-');
  if (clean === 'gallery-01' || clean === 'gallery-02') {
    return 'gallery-01';
  }
  return clean;
}

/**
 * Checks whether a specific gallery artwork is completed in the game.
 */
export function isCollectionArtworkCompleted(galleryId: string): boolean {
  const normId = toCollectionArtworkId(galleryId);
  if (!normId) return false;
  if (normId === 'gallery-01') {
    return isGalleryPuzzleCompleted('gallery-01') || isGalleryPuzzleCompleted('gallery-02');
  }
  return isGalleryPuzzleCompleted(normId);
}

/**
 * Returns all currently completed collection artwork IDs in the museum.
 */
export function getCompletedCollectionArtworkIds(): string[] {
  return COLLECTION_GALLERY_IDS.filter((gId) => isCollectionArtworkCompleted(gId));
}

/**
 * Retrieves the list of artwork IDs that the player has already viewed in Collections.
 */
export function getViewedCollectionArtworkIds(): string[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_VIEWED_COLLECTIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((id) => toCollectionArtworkId(id)).filter(Boolean);
        }
      }
    }
  } catch (err) {
    console.error('Error reading viewed collection artworks from storage:', err);
  }
  return [];
}

/**
 * Returns the list of completed artwork IDs that have NOT yet been viewed in Collections.
 */
export function getUnreadCompletedArtworkIds(): string[] {
  const completed = getCompletedCollectionArtworkIds();
  const viewedSet = new Set(getViewedCollectionArtworkIds());
  return completed.filter((id) => !viewedSet.has(id));
}

/**
 * Returns the count of unread completed artworks for the Collections badge.
 */
export function getUnreadCompletedArtworksCount(): number {
  return getUnreadCompletedArtworkIds().length;
}

/**
 * Marks all currently completed artworks as viewed.
 * Called when the player opens the Collections page.
 * Resets the notification counter to 0.
 */
export function markCollectionsAsViewed(): void {
  try {
    const completed = getCompletedCollectionArtworkIds();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_VIEWED_COLLECTIONS_KEY, JSON.stringify(completed));
      window.dispatchEvent(
        new CustomEvent('museum_collection_notification_updated', {
          detail: { unreadCount: 0, viewedArtworks: completed },
        })
      );
    }
  } catch (err) {
    console.error('Error marking collections as viewed:', err);
  }
}

/**
 * Clears the viewed artworks record (used during full game reset).
 */
export function resetCollectionNotificationStore(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_VIEWED_COLLECTIONS_KEY);
      window.dispatchEvent(
        new CustomEvent('museum_collection_notification_updated', {
          detail: { unreadCount: 0, viewedArtworks: [] },
        })
      );
    }
  } catch (err) {
    console.error('Error resetting collection notification store:', err);
  }
}

/**
 * React hook to subscribe to the unread completed artwork counter.
 * Automatically stays in sync across puzzle completions, tab switches, and game resets.
 */
export function useCollectionNotificationCount(): number {
  const [unreadCount, setUnreadCount] = useState<number>(() => getUnreadCompletedArtworksCount());

  useEffect(() => {
    const handleUpdate = () => {
      setUnreadCount(getUnreadCompletedArtworksCount());
    };

    window.addEventListener('museum_collection_notification_updated', handleUpdate);
    window.addEventListener('museum_puzzle_progress_updated', handleUpdate);
    window.addEventListener('museum_completed_gallery_puzzles_updated', handleUpdate);
    window.addEventListener('museum_player_progress_updated', handleUpdate);
    window.addEventListener('museum_game_fully_reset', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('museum_collection_notification_updated', handleUpdate);
      window.removeEventListener('museum_puzzle_progress_updated', handleUpdate);
      window.removeEventListener('museum_completed_gallery_puzzles_updated', handleUpdate);
      window.removeEventListener('museum_player_progress_updated', handleUpdate);
      window.removeEventListener('museum_game_fully_reset', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return unreadCount;
}
