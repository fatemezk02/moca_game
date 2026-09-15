/**
 * ============================================================================
 * CURATOR EXHIBITION WALL PERSISTENT CONFIGURATION STORE
 * ============================================================================
 * Manages container-relative / normalized positions and sizes for artwork
 * frames on the Curator Exhibition Wall.
 *
 * Coordinate System:
 * - Reference container: Virtual salon wall canvas of 720 × 580 units.
 * - Independent of device screen size and browser screen pixels.
 * - Scales proportionally across mobile, tablet, desktop, portrait & landscape.
 * - Saved configurations take priority over default salon slots.
 * ============================================================================
 */

export const CURATOR_VIRTUAL_WIDTH = 720;
export const CURATOR_VIRTUAL_HEIGHT = 580;

export const STORAGE_CURATOR_WALL_KEY = 'museum_curator_wall_frames_v1';

/**
 * Verified real aspect ratios (image width / image height) of each museum gallery puzzle artwork.
 * Default lookup ensures instant, flicker-free rendering before image network loads.
 */
export const KNOWN_ARTWORK_ASPECT_RATIOS: Record<string, number> = {
  'gallery-01': 0.73125, // 117x160 portrait (Qajar architectural hall)
  'gallery-03': 0.75711, // 2687x3549 portrait (Diplomatic album)
  'gallery-04': 0.69521, // 479x689 portrait (Edward Steichen portrait)
  'gallery-05': 1.37748, // 4784x3473 landscape (City rhythm / industrial worker)
  'gallery-06': 0.81077, // 2408x2970 portrait (Critical gaze / endurance)
  'gallery-07': 1.31765, // 448x340 landscape (Passing inside to outside)
  'gallery-08': 1.33333, // 1000x750 landscape 4:3 (Pendulum of time)
  'gallery-09': 1.41945, // 978x689 landscape (Intersection of media)
};

const dynamicRatioCache: Record<string, number> = {};

/**
 * Retrieves the artwork's real aspect ratio (width / height).
 * Priority: dynamic runtime image measurement > localStorage > known museum artwork ratio > 1.
 */
export function getArtworkRealAspectRatio(galleryId: string, imageUrl?: string): number {
  if (imageUrl && dynamicRatioCache[imageUrl]) {
    return dynamicRatioCache[imageUrl];
  }
  if (dynamicRatioCache[galleryId]) {
    return dynamicRatioCache[galleryId];
  }

  // Check persistent storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(`museum_artwork_ratio_${galleryId}`);
      if (stored) {
        const val = parseFloat(stored);
        if (val > 0.1 && val < 10) {
          dynamicRatioCache[galleryId] = val;
          if (imageUrl) dynamicRatioCache[imageUrl] = val;
          return val;
        }
      }
    } catch {}
  }

  // Fallback to verified known artwork ratios
  const canonId = galleryId.replace('_', '-');
  return KNOWN_ARTWORK_ASPECT_RATIOS[canonId] || KNOWN_ARTWORK_ASPECT_RATIOS[galleryId] || 1;
}

/**
 * Registers an artwork's measured real aspect ratio from an image's naturalWidth/naturalHeight.
 */
export function registerArtworkRealAspectRatio(
  galleryId: string,
  imageUrl: string,
  ratio: number
): void {
  if (ratio <= 0.1 || ratio >= 10 || isNaN(ratio)) return;
  const rounded = Math.round(ratio * 10000) / 10000;
  dynamicRatioCache[galleryId] = rounded;
  if (imageUrl) dynamicRatioCache[imageUrl] = rounded;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`museum_artwork_ratio_${galleryId}`, String(rounded));
      window.dispatchEvent(
        new CustomEvent('artwork_aspect_ratio_updated', {
          detail: { galleryId, imageUrl, ratio: rounded },
        })
      );
    } catch {}
  }
}

/**
 * Preloads the artwork image to determine its real dimensions in advance,
 * even for incomplete puzzles so the empty frame already matches the future artwork.
 */
export function preloadArtworkImageRatio(galleryId: string, imageUrl?: string): void {
  if (!imageUrl || typeof window === 'undefined') return;
  if (dynamicRatioCache[imageUrl] || dynamicRatioCache[galleryId]) return;

  const img = new Image();
  img.src = imageUrl;
  if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    registerArtworkRealAspectRatio(galleryId, imageUrl, img.naturalWidth / img.naturalHeight);
  } else {
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        registerArtworkRealAspectRatio(galleryId, imageUrl, img.naturalWidth / img.naturalHeight);
      }
    };
  }
}

export interface CalculatedFrameGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  centerNormX: number; // 0..1 relative to CURATOR_VIRTUAL_WIDTH
  centerNormY: number; // 0..1 relative to CURATOR_VIRTUAL_HEIGHT
  normWidth: number;   // width / CURATOR_VIRTUAL_WIDTH
  normHeight: number;  // height / CURATOR_VIRTUAL_HEIGHT
  aspectRatio: number;
}

/**
 * Calculates frame dimensions and coordinates that strictly match the artwork's real aspect ratio.
 * Preserves the designated center position and area/scale of the slot on the wall.
 */
export function calculateFittedFrameDimensions(
  baseX: number,
  baseY: number,
  baseWidth: number,
  baseHeight: number,
  aspectRatio: number
): CalculatedFrameGeometry {
  const safeRatio = Math.max(0.2, Math.min(5, aspectRatio || 1));
  const area = Math.max(900, baseWidth * baseHeight);

  // Preserve area while exactly matching target aspect ratio:
  // width = height * safeRatio => area = height^2 * safeRatio => height = sqrt(area / safeRatio)
  const fittedHeight = Math.sqrt(area / safeRatio);
  const fittedWidth = fittedHeight * safeRatio;

  // Keep center of the slot intact to maintain wall arrangement
  const centerX = baseX + baseWidth / 2;
  const centerY = baseY + baseHeight / 2;

  const fittedX = centerX - fittedWidth / 2;
  const fittedY = centerY - fittedHeight / 2;

  return {
    x: Math.round(fittedX * 10) / 10,
    y: Math.round(fittedY * 10) / 10,
    width: Math.round(fittedWidth * 10) / 10,
    height: Math.round(fittedHeight * 10) / 10,
    centerX: Math.round(centerX * 10) / 10,
    centerY: Math.round(centerY * 10) / 10,
    centerNormX: centerX / CURATOR_VIRTUAL_WIDTH,
    centerNormY: centerY / CURATOR_VIRTUAL_HEIGHT,
    normWidth: fittedWidth / CURATOR_VIRTUAL_WIDTH,
    normHeight: fittedHeight / CURATOR_VIRTUAL_HEIGHT,
    aspectRatio: safeRatio,
  };
}

export interface WallFramePosition {
  x: number; // in virtual canvas 720x580
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface CuratorFrameConfig {
  galleryId: string;
  artworkId: string;
  title?: string;
  // Position in virtual canvas units (0..720, 0..580)
  x: number;
  y: number;
  width: number;
  height: number;
  centerX?: number;
  centerY?: number;
  rotation?: number;
  // Background-relative normalized coordinates (0..1)
  centerNormX: number; // centerX / 720
  centerNormY: number; // centerY / 580
  normX: number; // x / 720
  normY: number; // y / 580
  normWidth: number; // width / 720
  normHeight: number; // height / 580
  aspectRatio: number; // width / height (preserved during resize)
  scaleMultiplier?: number; // relative scale compared to default size (1.0 = 100%)
}

/**
 * Default salon wall layout matching reference diagram (image.png).
 * Keys are gallery IDs matching the curator exhibition frames.
 * Configured with responsive percentage-based padding so frames never touch or overlap.
 */
export const DEFAULT_CURATOR_FRAME_MAP: Record<string, WallFramePosition> = {
  // Slot 0: Frame A (Top-Left): Tall Portrait frame (Qajar hall)
  'gallery-01': { x: 87.5, y: 62.5, width: 135, height: 185, rotation: 0 },

  // Slot 1: Frame B (Bottom-Left): Portrait frame (Diplomatic album)
  'gallery-03': { x: 87.5, y: 285.5, width: 125, height: 165, rotation: 0 },

  // Slot 2: Frame C (Top-Center): Portrait frame (Edward Steichen)
  'gallery-04': { x: 262.5, y: 39.5, width: 105, height: 151, rotation: 0 },

  // Slot 3: Frame D (Center-Middle): Wide prominent Landscape frame (City rhythm)
  'gallery-05': { x: 252.5, y: 211.5, width: 175, height: 127, rotation: 0 },

  // Slot 4: Frame E (Bottom-Center): Portrait frame (Critical gaze)
  'gallery-06': { x: 265.0, y: 361.0, width: 120, height: 148, rotation: 0 },

  // Slot 5: Frame F (Top-Right): Landscape frame (Pendulum of time)
  'gallery-08': { x: 407.5, y: 64.4, width: 135, height: 101.25, rotation: 0 },

  // Slot 6: Frame G (Bottom-Right): Wide Landscape frame (Media intersection)
  'gallery-09': { x: 435.0, y: 345.1, width: 170, height: 119.76, rotation: 0 },

  // Slot 7: Frame H (Mid-Right Extension): Landscape frame (Inside to outside)
  'gallery-07': { x: 475.0, y: 195.7, width: 130, height: 98.66, rotation: 0 },
};

/**
 * List of default slots in indexed order
 */
export const DEFAULT_SALON_SLOTS_LIST: WallFramePosition[] = [
  DEFAULT_CURATOR_FRAME_MAP['gallery-01'],
  DEFAULT_CURATOR_FRAME_MAP['gallery-03'],
  DEFAULT_CURATOR_FRAME_MAP['gallery-04'],
  DEFAULT_CURATOR_FRAME_MAP['gallery-05'],
  DEFAULT_CURATOR_FRAME_MAP['gallery-06'],
  DEFAULT_CURATOR_FRAME_MAP['gallery-08'],
  DEFAULT_CURATOR_FRAME_MAP['gallery-09'],
  DEFAULT_CURATOR_FRAME_MAP['gallery-07'],
];

/**
 * Reads all saved curator frame configurations from persistent local storage.
 */
export function getSavedCuratorFrames(): Record<string, CuratorFrameConfig> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_CURATOR_WALL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error('Error reading curator frame configs from storage:', err);
    return {};
  }
}

/**
 * Gets the effective configuration for a curator frame.
 * Priority: Saved override in database > default map by galleryId > fallback slot.
 */
export function getCuratorFrameConfig(
  galleryId: string,
  fallbackSlot?: WallFramePosition,
  indexFallback = 0
): CuratorFrameConfig {
  const savedAll = getSavedCuratorFrames();
  const saved = savedAll[galleryId] || savedAll[`artwork-${galleryId}`];

  const defaultSlot: WallFramePosition =
    DEFAULT_CURATOR_FRAME_MAP[galleryId] ||
    fallbackSlot ||
    DEFAULT_SALON_SLOTS_LIST[indexFallback % DEFAULT_SALON_SLOTS_LIST.length] || {
      x: 100,
      y: 100,
      width: 140,
      height: 180,
      rotation: 0,
    };

  const targetRatio = getArtworkRealAspectRatio(galleryId);

  if (saved) {
    const rawX = typeof saved.x === 'number' ? saved.x : defaultSlot.x;
    const rawY = typeof saved.y === 'number' ? saved.y : defaultSlot.y;
    const rawWidth = typeof saved.width === 'number' ? saved.width : defaultSlot.width;
    const rawHeight = typeof saved.height === 'number' ? saved.height : defaultSlot.height;

    // Check if saved already explicitly matches targetRatio (within 1%)
    const currentRatio = rawWidth / Math.max(1, rawHeight);
    const ratioMatches = Math.abs(currentRatio - targetRatio) < 0.02;

    const fitted = ratioMatches
      ? { x: rawX, y: rawY, width: rawWidth, height: rawHeight, aspectRatio: currentRatio }
      : calculateFittedFrameDimensions(rawX, rawY, rawWidth, rawHeight, targetRatio);

    const centerX = fitted.x + fitted.width / 2;
    const centerY = fitted.y + fitted.height / 2;

    return {
      galleryId,
      artworkId: saved.artworkId || `artwork-${galleryId}`,
      title: saved.title,
      x: fitted.x,
      y: fitted.y,
      width: fitted.width,
      height: fitted.height,
      centerX: Math.round(centerX * 10) / 10,
      centerY: Math.round(centerY * 10) / 10,
      centerNormX: centerX / CURATOR_VIRTUAL_WIDTH,
      centerNormY: centerY / CURATOR_VIRTUAL_HEIGHT,
      rotation: saved.rotation ?? defaultSlot.rotation ?? 0,
      normX: fitted.x / CURATOR_VIRTUAL_WIDTH,
      normY: fitted.y / CURATOR_VIRTUAL_HEIGHT,
      normWidth: fitted.width / CURATOR_VIRTUAL_WIDTH,
      normHeight: fitted.height / CURATOR_VIRTUAL_HEIGHT,
      aspectRatio: fitted.aspectRatio,
      scaleMultiplier: saved.scaleMultiplier ?? fitted.width / Math.max(1, defaultSlot.width),
    };
  }

  // Use default slot fitted to the artwork's real aspect ratio
  const fittedDefault = calculateFittedFrameDimensions(
    defaultSlot.x,
    defaultSlot.y,
    defaultSlot.width,
    defaultSlot.height,
    targetRatio
  );

  return {
    galleryId,
    artworkId: `artwork-${galleryId}`,
    x: fittedDefault.x,
    y: fittedDefault.y,
    width: fittedDefault.width,
    height: fittedDefault.height,
    centerX: fittedDefault.centerX,
    centerY: fittedDefault.centerY,
    centerNormX: fittedDefault.centerNormX,
    centerNormY: fittedDefault.centerNormY,
    rotation: defaultSlot.rotation ?? 0,
    normX: fittedDefault.x / CURATOR_VIRTUAL_WIDTH,
    normY: fittedDefault.y / CURATOR_VIRTUAL_HEIGHT,
    normWidth: fittedDefault.width / CURATOR_VIRTUAL_WIDTH,
    normHeight: fittedDefault.height / CURATOR_VIRTUAL_HEIGHT,
    aspectRatio: fittedDefault.aspectRatio,
    scaleMultiplier: 1.0,
  };
}

/**
 * Persists a frame's position and size in the configuration system.
 * Emits custom events for instant real-time live preview update.
 */
export function saveCuratorFrameConfig(params: {
  galleryId: string;
  artworkId?: string;
  title?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleMultiplier?: number;
}): CuratorFrameConfig {
  const roundedX = Math.round(params.x * 10) / 10;
  const roundedY = Math.round(params.y * 10) / 10;
  const roundedWidth = Math.max(30, Math.round(params.width * 10) / 10);
  const roundedHeight = Math.max(30, Math.round(params.height * 10) / 10);
  const centerX = roundedX + roundedWidth / 2;
  const centerY = roundedY + roundedHeight / 2;

  const aspectRatio = roundedWidth / roundedHeight;

  const fullConfig: CuratorFrameConfig = {
    galleryId: params.galleryId,
    artworkId: params.artworkId || `artwork-${params.galleryId}`,
    title: params.title,
    x: roundedX,
    y: roundedY,
    width: roundedWidth,
    height: roundedHeight,
    centerX: Math.round(centerX * 10) / 10,
    centerY: Math.round(centerY * 10) / 10,
    centerNormX: centerX / CURATOR_VIRTUAL_WIDTH,
    centerNormY: centerY / CURATOR_VIRTUAL_HEIGHT,
    rotation: params.rotation ?? 0,
    normX: roundedX / CURATOR_VIRTUAL_WIDTH,
    normY: roundedY / CURATOR_VIRTUAL_HEIGHT,
    normWidth: roundedWidth / CURATOR_VIRTUAL_WIDTH,
    normHeight: roundedHeight / CURATOR_VIRTUAL_HEIGHT,
    aspectRatio,
    scaleMultiplier: params.scaleMultiplier,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const current = getSavedCuratorFrames();
      current[params.galleryId] = fullConfig;
      current[fullConfig.artworkId] = fullConfig;
      localStorage.setItem(STORAGE_CURATOR_WALL_KEY, JSON.stringify(current));

      window.dispatchEvent(
        new CustomEvent('curator_wall_config_updated', {
          detail: fullConfig,
        })
      );
      window.dispatchEvent(
        new CustomEvent('museum_map_config_updated', {
          detail: { galleryId: params.galleryId },
        })
      );
    } catch (err) {
      console.error('Error saving curator frame config:', err);
    }
  }

  return fullConfig;
}

/**
 * Resets a single frame's position and size back to default.
 */
export function resetCuratorFrameConfig(galleryId: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const current = getSavedCuratorFrames();
      delete current[galleryId];
      delete current[`artwork-${galleryId}`];
      localStorage.setItem(STORAGE_CURATOR_WALL_KEY, JSON.stringify(current));

      window.dispatchEvent(
        new CustomEvent('curator_wall_config_updated', {
          detail: { galleryId, reset: true },
        })
      );
    } catch (err) {
      console.error('Error resetting curator frame config:', err);
    }
  }
}

/**
 * Resets all curator frame overrides back to initial defaults.
 */
export function resetAllCuratorFrames(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_CURATOR_WALL_KEY);
      window.dispatchEvent(
        new CustomEvent('curator_wall_config_updated', {
          detail: { resetAll: true },
        })
      );
    } catch (err) {
      console.error('Error resetting all curator frame configs:', err);
    }
  }
}
