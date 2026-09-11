import { useState, useEffect, useRef } from 'react';

export interface MapDimensions {
  width: number;
  height: number;
}

/**
 * Custom hook to calculate the optimal responsive dimensions for an aspect-ratio constrained map
 * so that it occupies the largest practical size that fits 100% completely inside its container
 * without any vertical or horizontal scrolling/overflow.
 */
export function useFitMapDimensions(
  mapWidth: number,
  mapHeight: number,
  scaleMultiplier: number = 1.0
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<MapDimensions | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const style = window.getComputedStyle(el);
      const paddingX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const paddingY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);

      const availWidth = Math.max(0, el.clientWidth - paddingX);
      const availHeight = Math.max(0, el.clientHeight - paddingY);

      if (availWidth <= 0 || availHeight <= 0) return;

      const mapAspect = mapWidth / mapHeight;
      const containerAspect = availWidth / availHeight;

      let w: number;
      let h: number;

      if (containerAspect > mapAspect) {
        // Container is wider than the map: height is the limiting factor
        h = Math.round(availHeight * scaleMultiplier);
        w = Math.round(availHeight * mapAspect * scaleMultiplier);
      } else {
        // Container is narrower/taller than the map: width is the limiting factor
        w = Math.round(availWidth * scaleMultiplier);
        h = Math.round((availWidth / mapAspect) * scaleMultiplier);
      }

      setDimensions({ width: w, height: h });
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(el);
    }

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, [mapWidth, mapHeight, scaleMultiplier]);

  return { containerRef, dimensions };
}
