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

export const CURATOR_VIRTUAL_WIDTH = 580;
export const CURATOR_VIRTUAL_HEIGHT = 720;

export const STORAGE_CURATOR_WALL_KEY = 'museum_curator_wall_frames_v1';
export const STORAGE_VERSION_KEY = 'museum_curator_wall_version';
export const CURRENT_STORAGE_VERSION = 'v2_580x720';

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
  x: number; // top-left x in 580x720 canvas
  y: number; // top-left y in 580x720 canvas
  width: number;
  height: number;
  rotation?: number;
}

export interface CuratorFrameConfig {
  galleryId: string;
  artworkId: string;
  title?: string;
  // Authoritative reference dimensions (in 580x720 canvas)
  refWidth: number;
  refHeight: number;
  // Normalized center coordinates relative to 580x720 reference wall
  centerNormX: number; // centerX / 580
  centerNormY: number; // centerY / 720
  // Center coordinates in reference units
  centerX: number;
  centerY: number;
  // Top-left coordinates in reference units (centerX - refWidth/2, centerY - refHeight/2)
  x: number;
  y: number;
  width: number;
  height: number;
  // Background-relative normalized coordinates (0..1)
  normX: number; // x / 580
  normY: number; // y / 720
  normWidth: number; // refWidth / 580
  normHeight: number; // refHeight / 720
  aspectRatio: number; // width / height
  rotation?: number;
  scaleMultiplier?: number;
  _schemaVersion?: string;
}

export interface ReferenceFrameDef {
  galleryId: string;
  topLeftX: number;
  topLeftY: number;
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * The authoritative reference layout designed on the 580×720 reference background.
 * Verified and audited coordinates (never altered at runtime).
 */
export const AUTHORITATIVE_REFERENCE_FRAMES: Record<string, ReferenceFrameDef> = {
  'gallery-02': {
    galleryId: 'gallery-02',
    topLeftX: 110,
    topLeftY: 613,
    width: 205.4,
    height: 176.9,
    aspectRatio: 205.4 / 176.9, // 1.161108
  },
  'gallery-01': {
    // Gallery 01 is an alias for Gallery 02's slot
    galleryId: 'gallery-01',
    topLeftX: 110,
    topLeftY: 613,
    width: 205.4,
    height: 176.9,
    aspectRatio: 205.4 / 176.9,
  },
  'gallery-03': {
    galleryId: 'gallery-03',
    topLeftX: 246,
    topLeftY: 243,
    width: 330,
    height: 250,
    aspectRatio: 330 / 250, // 1.32
  },
  'gallery-04': {
    galleryId: 'gallery-04',
    topLeftX: 522,
    topLeftY: 305,
    width: 257,
    height: 179,
    aspectRatio: 257 / 179, // 1.435754
  },
  'gallery-05': {
    galleryId: 'gallery-05',
    topLeftX: 17,
    topLeftY: 339,
    width: 239,
    height: 192,
    aspectRatio: 239 / 192, // 1.244792
  },
  'gallery-06': {
    galleryId: 'gallery-06',
    topLeftX: 318,
    topLeftY: 608,
    width: 237,
    height: 329,
    aspectRatio: 237 / 329, // 0.720365
  },
  'gallery-07': {
    galleryId: 'gallery-07',
    topLeftX: 44,
    topLeftY: 57,
    width: 243,
    height: 180,
    aspectRatio: 243 / 180, // 1.35
  },
  'gallery-08': {
    galleryId: 'gallery-08',
    topLeftX: 513,
    topLeftY: 37,
    width: 227,
    height: 189,
    aspectRatio: 227 / 189, // 1.201058
  },
  'gallery-09': {
    galleryId: 'gallery-09',
    topLeftX: 251,
    topLeftY: 12,
    width: 185,
    height: 239,
    aspectRatio: 185 / 239, // 0.774059
  },
};

/**
 * Builds a CuratorFrameConfig from an authoritative reference definition.
 * Mathematically converts top-left coordinates to center-based normalized values.
 */
export function buildConfigFromReference(ref: ReferenceFrameDef): CuratorFrameConfig {
  const centerX = ref.topLeftX + ref.width / 2;
  const centerY = ref.topLeftY + ref.height / 2;
  const centerNormX = centerX / CURATOR_VIRTUAL_WIDTH;
  const centerNormY = centerY / CURATOR_VIRTUAL_HEIGHT;
  const normX = ref.topLeftX / CURATOR_VIRTUAL_WIDTH;
  const normY = ref.topLeftY / CURATOR_VIRTUAL_HEIGHT;
  const normWidth = ref.width / CURATOR_VIRTUAL_WIDTH;
  const normHeight = ref.height / CURATOR_VIRTUAL_HEIGHT;

  return {
    galleryId: ref.galleryId,
    artworkId: `artwork-${ref.galleryId}`,
    refWidth: ref.width,
    refHeight: ref.height,
    centerX: Math.round(centerX * 1000) / 1000,
    centerY: Math.round(centerY * 1000) / 1000,
    centerNormX,
    centerNormY,
    x: ref.topLeftX,
    y: ref.topLeftY,
    width: ref.width,
    height: ref.height,
    normX,
    normY,
    normWidth,
    normHeight,
    aspectRatio: ref.aspectRatio,
    rotation: 0,
    scaleMultiplier: 1.0,
    _schemaVersion: CURRENT_STORAGE_VERSION,
  };
}

/**
 * Default salon wall layout matching reference diagram in 580x720 canvas.
 * Provided for backward compatibility.
 */
export const DEFAULT_CURATOR_FRAME_MAP: Record<string, WallFramePosition> = {
  'gallery-01': { x: 110, y: 613, width: 205.4, height: 176.9, rotation: 0 },
  'gallery-02': { x: 110, y: 613, width: 205.4, height: 176.9, rotation: 0 },
  'gallery-03': { x: 246, y: 243, width: 330, height: 250, rotation: 0 },
  'gallery-04': { x: 522, y: 305, width: 257, height: 179, rotation: 0 },
  'gallery-05': { x: 17, y: 339, width: 239, height: 192, rotation: 0 },
  'gallery-06': { x: 318, y: 608, width: 237, height: 329, rotation: 0 },
  'gallery-07': { x: 44, y: 57, width: 243, height: 180, rotation: 0 },
  'gallery-08': { x: 513, y: 37, width: 227, height: 189, rotation: 0 },
  'gallery-09': { x: 251, y: 12, width: 185, height: 239, rotation: 0 },
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
 * Performs a one-time migration to the 580x720 center-based coordinate system if necessary.
 */
export function getSavedCuratorFrames(): Record<string, CuratorFrameConfig> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_CURATOR_WALL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};

    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (savedVersion !== CURRENT_STORAGE_VERSION) {
      // Migrate existing saved records to v2_580x720 schema
      const migrated: Record<string, CuratorFrameConfig> = {};
      let hasChanges = false;

      for (const [key, item] of Object.entries(parsed)) {
        const frame = item as Partial<CuratorFrameConfig> & Record<string, any>;
        const gid = frame.galleryId || key.replace('artwork-', '');
        const refDef = AUTHORITATIVE_REFERENCE_FRAMES[gid];

        // Check if item has custom values vs old 720x580 defaults
        const isOldDefaultX = frame.x === 87.5 || frame.x === 262.5 || frame.x === 252.5 || frame.x === 265.0 || frame.x === 407.5 || frame.x === 435.0 || frame.x === 475.0;

        if (refDef && isOldDefaultX) {
          // Replace old defaults with the audited 580x720 reference layout
          migrated[key] = buildConfigFromReference(refDef);
          hasChanges = true;
        } else if (frame.centerNormX && frame.centerNormY && frame.refWidth && frame.refHeight && frame._schemaVersion === CURRENT_STORAGE_VERSION) {
          migrated[key] = frame as CuratorFrameConfig;
        } else {
          // Convert existing customized data to center-anchored normalized coordinates
          const w = frame.refWidth ?? frame.width ?? refDef?.width ?? 180;
          const h = frame.refHeight ?? frame.height ?? refDef?.height ?? 200;
          const cx = typeof frame.centerX === 'number'
            ? frame.centerX
            : (typeof frame.x === 'number' ? frame.x + w / 2 : (refDef ? refDef.topLeftX + refDef.width / 2 : CURATOR_VIRTUAL_WIDTH / 2));
          const cy = typeof frame.centerY === 'number'
            ? frame.centerY
            : (typeof frame.y === 'number' ? frame.y + h / 2 : (refDef ? refDef.topLeftY + refDef.height / 2 : CURATOR_VIRTUAL_HEIGHT / 2));

          const centerNormX = cx / CURATOR_VIRTUAL_WIDTH;
          const centerNormY = cy / CURATOR_VIRTUAL_HEIGHT;
          const topLeftX = cx - w / 2;
          const topLeftY = cy - h / 2;

          migrated[key] = {
            galleryId: gid,
            artworkId: frame.artworkId || `artwork-${gid}`,
            title: frame.title,
            refWidth: w,
            refHeight: h,
            centerX: Math.round(cx * 10) / 10,
            centerY: Math.round(cy * 10) / 10,
            centerNormX,
            centerNormY,
            x: Math.round(topLeftX * 10) / 10,
            y: Math.round(topLeftY * 10) / 10,
            width: w,
            height: h,
            normX: topLeftX / CURATOR_VIRTUAL_WIDTH,
            normY: topLeftY / CURATOR_VIRTUAL_HEIGHT,
            normWidth: w / CURATOR_VIRTUAL_WIDTH,
            normHeight: h / CURATOR_VIRTUAL_HEIGHT,
            aspectRatio: frame.aspectRatio || (w / h),
            rotation: frame.rotation ?? 0,
            scaleMultiplier: frame.scaleMultiplier ?? 1.0,
            _schemaVersion: CURRENT_STORAGE_VERSION,
          };
          hasChanges = true;
        }
      }

      if (hasChanges) {
        localStorage.setItem(STORAGE_CURATOR_WALL_KEY, JSON.stringify(migrated));
      }
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
      return migrated;
    }

    return parsed as Record<string, CuratorFrameConfig>;
  } catch (err) {
    console.error('Error reading curator frame configs from storage:', err);
    return {};
  }
}

/**
 * Gets the effective configuration for a curator frame.
 * Priority: Saved override in database > authoritative reference layout > fallback slot.
 *
 * NOTE: Destructive runtime resizing has been removed. Saved reference dimensions are authoritative.
 */
export function getCuratorFrameConfig(
  galleryId: string,
  fallbackSlot?: WallFramePosition,
  indexFallback = 0
): CuratorFrameConfig {
  const savedAll = getSavedCuratorFrames();
  // Check direct ID, artwork- prefixed ID, and aliases (gallery-01 and gallery-02)
  const aliasId = galleryId === 'gallery-01' ? 'gallery-02' : (galleryId === 'gallery-02' ? 'gallery-01' : galleryId);
  const saved =
    savedAll[galleryId] ||
    savedAll[`artwork-${galleryId}`] ||
    savedAll[aliasId] ||
    savedAll[`artwork-${aliasId}`];

  if (saved && saved.centerNormX !== undefined && saved.centerNormY !== undefined) {
    const refWidth = saved.refWidth ?? saved.width;
    const refHeight = saved.refHeight ?? saved.height;
    const centerX = saved.centerX ?? saved.centerNormX * CURATOR_VIRTUAL_WIDTH;
    const centerY = saved.centerY ?? saved.centerNormY * CURATOR_VIRTUAL_HEIGHT;
    const x = saved.x ?? (centerX - refWidth / 2);
    const y = saved.y ?? (centerY - refHeight / 2);

    return {
      galleryId,
      artworkId: saved.artworkId || `artwork-${galleryId}`,
      title: saved.title,
      refWidth,
      refHeight,
      centerX: Math.round(centerX * 10) / 10,
      centerY: Math.round(centerY * 10) / 10,
      centerNormX: saved.centerNormX,
      centerNormY: saved.centerNormY,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: refWidth,
      height: refHeight,
      normX: x / CURATOR_VIRTUAL_WIDTH,
      normY: y / CURATOR_VIRTUAL_HEIGHT,
      normWidth: refWidth / CURATOR_VIRTUAL_WIDTH,
      normHeight: refHeight / CURATOR_VIRTUAL_HEIGHT,
      aspectRatio: saved.aspectRatio || (refWidth / refHeight),
      rotation: saved.rotation ?? 0,
      scaleMultiplier: saved.scaleMultiplier ?? 1.0,
      _schemaVersion: CURRENT_STORAGE_VERSION,
    };
  }

  // Look up authoritative reference frame definition
  const refDef = AUTHORITATIVE_REFERENCE_FRAMES[galleryId] || AUTHORITATIVE_REFERENCE_FRAMES[aliasId];
  if (refDef) {
    return buildConfigFromReference({
      ...refDef,
      galleryId,
    });
  }

  // Fallback slot
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

  const centerX = defaultSlot.x + defaultSlot.width / 2;
  const centerY = defaultSlot.y + defaultSlot.height / 2;

  return {
    galleryId,
    artworkId: `artwork-${galleryId}`,
    refWidth: defaultSlot.width,
    refHeight: defaultSlot.height,
    centerX: Math.round(centerX * 10) / 10,
    centerY: Math.round(centerY * 10) / 10,
    centerNormX: centerX / CURATOR_VIRTUAL_WIDTH,
    centerNormY: centerY / CURATOR_VIRTUAL_HEIGHT,
    x: defaultSlot.x,
    y: defaultSlot.y,
    width: defaultSlot.width,
    height: defaultSlot.height,
    normX: defaultSlot.x / CURATOR_VIRTUAL_WIDTH,
    normY: defaultSlot.y / CURATOR_VIRTUAL_HEIGHT,
    normWidth: defaultSlot.width / CURATOR_VIRTUAL_WIDTH,
    normHeight: defaultSlot.height / CURATOR_VIRTUAL_HEIGHT,
    aspectRatio: defaultSlot.width / defaultSlot.height,
    rotation: defaultSlot.rotation ?? 0,
    scaleMultiplier: 1.0,
    _schemaVersion: CURRENT_STORAGE_VERSION,
  };
}

/**
 * Persists a frame's position and size in the 580x720 center-anchored coordinate system.
 * Emits custom events for instant real-time live preview update across the app.
 */
export function saveCuratorFrameConfig(params: {
  galleryId: string;
  artworkId?: string;
  title?: string;
  centerX?: number;
  centerY?: number;
  x?: number;
  y?: number;
  width: number;
  height: number;
  rotation?: number;
  scaleMultiplier?: number;
}): CuratorFrameConfig {
  const refWidth = Math.max(30, Math.round(params.width * 10) / 10);
  const refHeight = Math.max(30, Math.round(params.height * 10) / 10);

  // Compute center coordinates
  let centerX: number;
  let centerY: number;

  if (typeof params.centerX === 'number' && !isNaN(params.centerX)) {
    centerX = Math.round(params.centerX * 10) / 10;
  } else if (typeof params.x === 'number' && !isNaN(params.x)) {
    centerX = Math.round((params.x + refWidth / 2) * 10) / 10;
  } else {
    centerX = CURATOR_VIRTUAL_WIDTH / 2;
  }

  if (typeof params.centerY === 'number' && !isNaN(params.centerY)) {
    centerY = Math.round(params.centerY * 10) / 10;
  } else if (typeof params.y === 'number' && !isNaN(params.y)) {
    centerY = Math.round((params.y + refHeight / 2) * 10) / 10;
  } else {
    centerY = CURATOR_VIRTUAL_HEIGHT / 2;
  }

  const centerNormX = centerX / CURATOR_VIRTUAL_WIDTH;
  const centerNormY = centerY / CURATOR_VIRTUAL_HEIGHT;
  const x = centerX - refWidth / 2;
  const y = centerY - refHeight / 2;
  const normX = x / CURATOR_VIRTUAL_WIDTH;
  const normY = y / CURATOR_VIRTUAL_HEIGHT;
  const normWidth = refWidth / CURATOR_VIRTUAL_WIDTH;
  const normHeight = refHeight / CURATOR_VIRTUAL_HEIGHT;
  const aspectRatio = refWidth / refHeight;

  const fullConfig: CuratorFrameConfig = {
    galleryId: params.galleryId,
    artworkId: params.artworkId || `artwork-${params.galleryId}`,
    title: params.title,
    refWidth,
    refHeight,
    centerNormX,
    centerNormY,
    centerX,
    centerY,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    width: refWidth,
    height: refHeight,
    normX,
    normY,
    normWidth,
    normHeight,
    aspectRatio,
    rotation: params.rotation ?? 0,
    scaleMultiplier: params.scaleMultiplier ?? 1.0,
    _schemaVersion: CURRENT_STORAGE_VERSION,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const current = getSavedCuratorFrames();
      current[params.galleryId] = fullConfig;
      current[fullConfig.artworkId] = fullConfig;
      // Sync gallery-01 and gallery-02 aliases
      if (params.galleryId === 'gallery-01') current['gallery-02'] = fullConfig;
      if (params.galleryId === 'gallery-02') current['gallery-01'] = fullConfig;

      localStorage.setItem(STORAGE_CURATOR_WALL_KEY, JSON.stringify(current));
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);

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
