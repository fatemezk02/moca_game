import { GameContentData } from './types';

const CACHE_STORAGE_KEY = 'museum_game_content_cache_v1';

/**
 * Manages local persistence for loaded game content.
 * Ensures the app can function completely offline once loaded.
 */
export const contentCache = {
  /**
   * Retrieves cached content from localStorage
   */
  get(): GameContentData | null {
    try {
      const raw = localStorage.getItem(CACHE_STORAGE_KEY);
      if (!raw) return null;

      const parsed: GameContentData = JSON.parse(raw);
      if (
        parsed &&
        Array.isArray(parsed.questions) &&
        Array.isArray(parsed.stars) &&
        Array.isArray(parsed.artworks)
      ) {
        return {
          ...parsed,
          galleries: Array.isArray(parsed.galleries) ? parsed.galleries : [],
          metadata: {
            ...parsed.metadata,
            source: 'cache',
          },
        };
      }
      return null;
    } catch (err) {
      console.warn('[ContentCache] Failed to read from localStorage:', err);
      return null;
    }
  },

  /**
   * Saves updated content into localStorage
   */
  set(data: GameContentData): boolean {
    try {
      const toStore: GameContentData = {
        ...data,
        metadata: {
          ...data.metadata,
          loadedAt: Date.now(),
        },
      };
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(toStore));
      return true;
    } catch (err) {
      console.warn('[ContentCache] Failed to write to localStorage:', err);
      return false;
    }
  },

  /**
   * Checks if cached content is currently available
   */
  has(): boolean {
    return this.get() !== null;
  },

  /**
   * Clears the cached content (useful for testing and debug resets)
   */
  clear(): void {
    try {
      localStorage.removeItem(CACHE_STORAGE_KEY);
    } catch (err) {
      console.warn('[ContentCache] Failed to clear localStorage cache:', err);
    }
  },
};
