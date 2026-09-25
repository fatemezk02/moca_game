/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TransitionMapPosition {
  x: number;
  y: number;
}

const STORAGE_KEY = 'museum_dev_transition_g05_to_g06_pos';

/**
 * Sensible default starting position for Gallery 06 relative to Gallery 05 in SVG space.
 * Gallery 05 viewBox is 0 0 682.05 729.06.
 * Arrow from Gallery 05 to 06 is at x: 461, y: 729.06.
 * Gallery 06 viewBox is 0 0 486.92 793.01.
 * Top corridor of Gallery 06 is at x ≈ 338.7, y = 0.
 * Default aligns Gallery 06 top entrance with Gallery 05 exit:
 * x = 461 - 338.7 = 122.3 ≈ 122
 * y = 729 (at bottom corridor of Gallery 05)
 */
export const DEFAULT_TRANSITION_G06_POSITION: TransitionMapPosition = {
  x: 90,
  y: 90,
};

export function getTransitionGallery06Position(): TransitionMapPosition {
  if (typeof window === 'undefined') return { ...DEFAULT_TRANSITION_G06_POSITION };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        // If old default (122, 729) or clipped beyond the screen, reset to visible starting position
        if (parsed.y >= 650 && (parsed.x === 122 || parsed.y === 729)) {
          return { ...DEFAULT_TRANSITION_G06_POSITION };
        }
        return { x: Math.round(parsed.x), y: Math.round(parsed.y) };
      }
    }
  } catch {
    // fallback
  }
  return { ...DEFAULT_TRANSITION_G06_POSITION };
}

export function resetTransitionGallery06Position(): void {
  saveTransitionGallery06Position(
    DEFAULT_TRANSITION_G06_POSITION.x,
    DEFAULT_TRANSITION_G06_POSITION.y
  );
}

export function saveTransitionGallery06Position(x: number, y: number): void {
  if (typeof window === 'undefined') return;
  try {
    const data: TransitionMapPosition = {
      x: Math.round(x),
      y: Math.round(y),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent('museum_transition_g06_pos_updated', {
        detail: data,
      })
    );
  } catch {
    // fallback
  }
}
