import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

export interface MapDimensions {
  width: number;
  height: number;
  scale: number;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function getInitialEstimatedDimensions(mapWidth: number, mapHeight: number): MapDimensions | null {
  if (typeof window === 'undefined') return null;
  // Available width & height accounting for header (61px), status bar (32px), bottom nav (86px), and canvas padding (16px)
  const availWidth = Math.max(0, window.innerWidth - 16);
  const availHeight = Math.max(0, window.innerHeight - 196);
  if (availWidth <= 0 || availHeight <= 0) return null;
  const scale = Math.min(availWidth / mapWidth, availHeight / mapHeight);
  const fittedWidth = Math.floor(mapWidth * scale * 10) / 10;
  const fittedHeight = Math.floor(mapHeight * scale * 10) / 10;
  return { width: fittedWidth, height: fittedHeight, scale };
}

/**
 * Custom hook to dynamically calculate the maximum fitting scale for an aspect-ratio constrained map
 * (Gallery 03–09, etc.) within the actual available area between Header and Bottom Navigation.
 *
 * Algorithm:
 * 1. Measures available width and height of the container.
 * 2. Calculates scale = Math.min(availableWidth / mapWidth, availableHeight / mapHeight).
 * 3. Yields fittedWidth = mapWidth * scale and fittedHeight = mapHeight * scale.
 * 4. Strictly preserves the SVG aspect ratio, avoids distortion, prevents overflow, and maximizes size.
 */
export function useFitMapDimensions(
  mapWidth: number,
  mapHeight: number,
  safeMargin: number = 8
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<MapDimensions | null>(() =>
    getInitialEstimatedDimensions(mapWidth, mapHeight)
  );

  const calculateFitting = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);

    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;

    // Available width and height inside container
    const availWidth = Math.max(0, rect.width - paddingLeft - paddingRight);
    const availHeight = Math.max(0, rect.height - paddingTop - paddingBottom);

    if (availWidth <= 0 || availHeight <= 0) return;

    // Conceptually:
    // scale = min(availableWidth / mapWidth, availableHeight / mapHeight)
    const scale = Math.min(availWidth / mapWidth, availHeight / mapHeight);

    // Apply scale to both dimensions preserving original aspect ratio exactly:
    const fittedWidth = Math.floor(mapWidth * scale * 10) / 10;
    const fittedHeight = Math.floor(mapHeight * scale * 10) / 10;

    setDimensions((prev) => {
      if (
        prev &&
        Math.abs(prev.width - fittedWidth) < 0.5 &&
        Math.abs(prev.height - fittedHeight) < 0.5 &&
        Math.abs(prev.scale - scale) < 0.001
      ) {
        return prev;
      }
      return { width: fittedWidth, height: fittedHeight, scale };
    });
  }, [mapWidth, mapHeight]);

  useIsomorphicLayoutEffect(() => {
    calculateFitting();
  }, [calculateFitting]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    calculateFitting();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        calculateFitting();
      });
      resizeObserver.observe(el);
    }

    window.addEventListener('resize', calculateFitting);
    window.addEventListener('orientationchange', calculateFitting);

    // Initial tick to guarantee layout synchronization after initial frame render
    const frameId = requestAnimationFrame(calculateFitting);

    return () => {
      cancelAnimationFrame(frameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', calculateFitting);
      window.removeEventListener('orientationchange', calculateFitting);
    };
  }, [calculateFitting]);

  return { containerRef, dimensions, recalculate: calculateFitting };
}


