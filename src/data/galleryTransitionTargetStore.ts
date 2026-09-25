/**
 * Gallery 05 -> Gallery 06 Transition Target Store
 *
 * Single Source of Truth for the temporary starting world-space transform
 * of Gallery 06 at the start of the Gallery 05 -> Gallery 06 camera transition.
 *
 * Shared identically between:
 * 1. The temporary positioning tool ("تنظیم نقاط") in Gallery 05
 * 2. The actual Gallery 05 -> Gallery 06 camera transition
 */

export interface GalleryTransitionTarget {
  x: number;
  y: number;
  scale: number;
}

export const DEFAULT_G05_TO_G06_TARGET: GalleryTransitionTarget = {
  x: -184,
  y: 91,
  scale: 0.97,
};

const STORAGE_KEY = 'museum_g05_to_g06_transition_target';

/**
 * Returns the authoritative saved transition target for Gallery 06.
 * Falls back to DEFAULT_G05_TO_G06_TARGET ({ x: -184, y: 91, scale: 0.97 }).
 */
export function getGallery05To06TransitionTarget(): GalleryTransitionTarget {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_G05_TO_G06_TARGET;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_G05_TO_G06_TARGET;
    const parsed = JSON.parse(raw);
    const x = typeof parsed.x === 'number' && !isNaN(parsed.x) ? parsed.x : DEFAULT_G05_TO_G06_TARGET.x;
    const y = typeof parsed.y === 'number' && !isNaN(parsed.y) ? parsed.y : DEFAULT_G05_TO_G06_TARGET.y;
    const scale = typeof parsed.scale === 'number' && !isNaN(parsed.scale) && parsed.scale > 0
      ? parsed.scale
      : DEFAULT_G05_TO_G06_TARGET.scale;
    return { x, y, scale };
  } catch {
    return DEFAULT_G05_TO_G06_TARGET;
  }
}

/**
 * Saves the authoritative transition target from the positioning tool.
 * Persists in localStorage and broadcasts a custom update event for live synchronization.
 */
export function saveGallery05To06TransitionTarget(target: GalleryTransitionTarget): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const safeTarget: GalleryTransitionTarget = {
    x: Math.round(target.x * 100) / 100,
    y: Math.round(target.y * 100) / 100,
    scale: Math.round(target.scale * 1000) / 1000,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeTarget));
  } catch (err) {
    console.error('Failed to save gallery transition target:', err);
  }
  window.dispatchEvent(
    new CustomEvent('museum_g05_to_g06_transition_target_updated', { detail: safeTarget })
  );
}

/**
 * Resets the transition target to the original calibrated defaults.
 */
export function resetGallery05To06TransitionTarget(): GalleryTransitionTarget {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  }
  window.dispatchEvent(
    new CustomEvent('museum_g05_to_g06_transition_target_updated', {
      detail: DEFAULT_G05_TO_G06_TARGET,
    })
  );
  return DEFAULT_G05_TO_G06_TARGET;
}
