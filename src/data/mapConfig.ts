import {
  AdminMapPoint,
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
  AdminArrowPoint,
  GalleryConfig,
  GalleryMapConfig,
  MuseumMapDatabase,
} from '../types/admin';

/**
 * ============================================================================
 * MUSEUM MAP CONFIGURATION — SINGLE SOURCE OF TRUTH
 * ============================================================================
 * This persistent map configuration data layer defines the collections,
 * icon points, and navigation arrows for every gallery in SVG viewBox coordinate space.
 *
 * User-facing Gallery views and the Admin Editor both read and write through this layer.
 * All coordinates are relative to the SVG viewBox coordinate system:
 * - Gallery 00: 0 0 1024 1024
 * - Gallery 01: 0 0 848 1264
 * - Gallery 02: 0 0 1000 1000
 * - Gallery 03: 0 0 848 1264
 */

export const GALLERIES: GalleryConfig[] = [
  {
    id: 'gallery-00',
    name: 'Gallery 00 — Museum Archive 01',
    nameFa: 'گالری ۰۰ — آرشیو موزه ۰۱',
    viewBox: '0 0 604.8 844.86',
    width: 604.8,
    height: 844.86,
  },
  {
    id: 'gallery-01',
    name: 'Gallery 01 — Architectural Hall',
    nameFa: 'گالری ۰۱ — تالار معماری',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
  },
  {
    id: 'gallery-02',
    name: 'Gallery 02 — Vault Pavilion (Coming Soon)',
    nameFa: 'گالری ۰۲ — پاویون طاق‌ها (به‌زودی)',
    viewBox: '0 0 1000 1000',
    width: 1000,
    height: 1000,
  },
  {
    id: 'gallery-03',
    name: 'Gallery 03 — Modern Hall',
    nameFa: 'گالری ۰۳ — تالار مدرن',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
  },
  {
    id: 'gallery-04',
    name: 'Gallery 04',
    nameFa: 'گالری ۰۴',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
  },
];

/**
 * Core default application configuration embedded in production build
 */
export const DEFAULT_MAP_DATABASE: MuseumMapDatabase = {
  'gallery-00': {
    galleryId: 'gallery-00',
    name: 'Gallery 00 — Museum Archive 01',
    nameFa: 'گالری ۰۰ — آرشیو موزه ۰۱',
    viewBox: '0 0 604.8 844.86',
    width: 604.8,
    height: 844.86,
    collectionPoints: [
      {
        id: 'col-01',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Classical Antiquities & Archaic Reliefs',
        roomCode: 'SEC 01',
        roomSection: 'Northwest Diagonal Gallery',
        x: 160, // 26.5%
        y: 173, // 20.5%
        direction: 'left',
        frames: [
          {
            id: 'col-01-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
      {
        id: 'col-02',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Epigraphic Tablets & Scribes Guild',
        roomCode: 'SEC 02',
        roomSection: 'Northern Archive Corridor',
        x: 438, // 72.5%
        y: 177, // 21.0%
        direction: 'right',
        frames: [
          {
            id: 'col-02-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
      {
        id: 'col-03',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Hellenistic Bronzes & Numismatics',
        roomCode: 'SEC 03',
        roomSection: 'West Central Transept',
        x: 109, // 18.0%
        y: 355, // 42.0%
        direction: 'left',
        frames: [
          {
            id: 'col-03-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
      {
        id: 'col-04',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Architectural Capitals & Columnar Orders',
        roomCode: 'SEC 04',
        roomSection: 'East Peristyle Wing',
        x: 490, // 81.0%
        y: 355, // 42.0%
        direction: 'right',
        frames: [
          {
            id: 'col-04-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
      {
        id: 'col-05',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'The Great Central Stele of Knossos',
        roomCode: 'SEC 05',
        roomSection: 'Central Rotunda & Navel Stone',
        x: 302, // 50.0%
        y: 430, // 51.0%
        direction: 'top',
        frames: [
          {
            id: 'col-05-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
      {
        id: 'col-06',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Etruscan Terracotta & Funerary Urns',
        roomCode: 'SEC 06',
        roomSection: 'Southwest Chamber',
        x: 139, // 23.0%
        y: 574, // 68.0%
        direction: 'left',
        frames: [
          {
            id: 'col-06-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
      {
        id: 'col-07',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Mosaic Pavements & Polychrome Glass',
        roomCode: 'SEC 07',
        roomSection: 'Southeast Corridor',
        x: 460, // 76.0%
        y: 583, // 69.0%
        direction: 'right',
        frames: [
          {
            id: 'col-07-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
      {
        id: 'col-08',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-00',
        title: 'Late Roman Sarcophagi & Vault Relics',
        roomCode: 'SEC 08',
        roomSection: 'South Crypt & Portico',
        x: 302, // 50.0%
        y: 693, // 82.0%
        direction: 'bottom',
        frames: [
          {
            id: 'col-08-f1',
            order: 1,
            x: 0,
            y: 0,
            scale: 1,
          },
        ],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g00-to-g01',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'Entrance to Gallery 01',
        x: 302, // 50%
        y: 78,  // ~9.2%
        iconType: 'preset-door',
        width: 36,
        height: 36,
        destination: 'gallery-01',
      },
      {
        id: 'icon-g00-cafe',
        type: 'icon',
        galleryId: 'gallery-00',
        title: 'کافه موزه (Museum Café)',
        x: 302,
        y: 775,
        iconType: 'preset-location-coffee',
        width: 32,
        height: 32,
        destination: 'gallery-00',
      },
    ],
    arrows: [
      {
        id: 'arrow-g00-to-g01',
        type: 'arrow',
        galleryId: 'gallery-00',
        title: 'فلش راهنما به گالری ۰۱',
        x: 302,
        y: 85,
        rotation: 0,
        size: 48,
        destination: 'gallery-01',
        visibilityConditions: [],
      },
    ],
  },

  'gallery-01': {
    galleryId: 'gallery-01',
    name: 'Gallery 01 — Architectural Hall',
    nameFa: 'گالری ۰۱ — تالار معماری',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
    collectionPoints: [
      {
        id: 'artwork-01',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-01',
        title: 'North Apse Monolith',
        roomSection: 'NORTH ROTUNDA',
        x: 230,
        y: 190,
        frames: [
          { id: 'artwork-01-f1', order: 1, x: 0, y: 0, scale: 1 },
          { id: 'artwork-01-f2', order: 2, x: 0, y: 0, scale: 1 },
          { id: 'artwork-01-f3', order: 3, x: 0, y: 0, scale: 1 },
        ],
      },
      {
        id: 'artwork-02',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-01',
        title: 'West Gallery Vessel',
        roomSection: 'WEST CORRIDOR',
        x: 170,
        y: 520,
        frames: [
          { id: 'artwork-02-f1', order: 1, x: 0, y: 0, scale: 1 },
          { id: 'artwork-02-f2', order: 2, x: 0, y: 0, scale: 1 },
          { id: 'artwork-02-f3', order: 3, x: 0, y: 0, scale: 1 },
        ],
      },
      {
        id: 'artwork-03',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-01',
        title: 'East Corridor Relief',
        roomSection: 'EAST WING',
        x: 670,
        y: 480,
        frames: [
          { id: 'artwork-03-f1', order: 1, x: 0, y: 0, scale: 1 },
          { id: 'artwork-03-f2', order: 2, x: 0, y: 0, scale: 1 },
          { id: 'artwork-03-f3', order: 3, x: 0, y: 0, scale: 1 },
        ],
      },
      {
        id: 'artwork-04',
        type: 'collection',
        pointType: 'normal',
        galleryId: 'gallery-01',
        title: 'South Forum Column',
        roomSection: 'SOUTH ATRIUM',
        x: 680,
        y: 890,
        frames: [
          { id: 'artwork-04-f1', order: 1, x: 0, y: 0, scale: 1 },
          { id: 'artwork-04-f2', order: 2, x: 0, y: 0, scale: 1 },
          { id: 'artwork-04-f3', order: 3, x: 0, y: 0, scale: 1 },
        ],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g01-questions',
        type: 'icon',
        galleryId: 'gallery-01',
        title: 'Gallery 01 Questions & Quiz',
        x: 424, // 50% of 848
        y: 675,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-01-questions',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-point-01',
        type: 'puzzle',
        galleryId: 'gallery-01',
        title: 'نقطه پازل ۰۱ — قطعه شمال غربی',
        x: 230,
        y: 380,
        questionId: 'gallery01-puzzle-q01',
        puzzlePieceId: 'gallery01-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-point-02',
        type: 'puzzle',
        galleryId: 'gallery-01',
        title: 'نقطه پازل ۰۲ — قطعه جنوب غربی',
        x: 424,
        y: 840,
        questionId: 'gallery01-puzzle-q02',
        puzzlePieceId: 'gallery01-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-point-03',
        type: 'puzzle',
        galleryId: 'gallery-01',
        title: 'نقطه پازل ۰۳ — قطعه شرقی (نهایی)',
        x: 640,
        y: 380,
        questionId: 'gallery01-puzzle-q03',
        puzzlePieceId: 'gallery01-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g01-to-g03',
        type: 'arrow',
        galleryId: 'gallery-01',
        title: 'فلش راهنما به گالری ۰۳',
        x: 680,
        y: 200,
        rotation: 90,
        size: 48,
        destination: 'gallery-03',
        visibilityConditions: [
          {
            id: 'cond-g01-piece01',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery01-piece-01',
          },
          {
            id: 'cond-g01-piece02',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery01-piece-02',
          },
          {
            id: 'cond-g01-piece03',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery01-piece-03',
          },
        ],
      },
    ],
  },

  'gallery-02': {
    galleryId: 'gallery-02',
    name: 'Gallery 02 — Vault Pavilion (Coming Soon)',
    nameFa: 'گالری ۰۲ — پاویون طاق‌ها (به‌زودی)',
    viewBox: '0 0 1000 1000',
    width: 1000,
    height: 1000,
    collectionPoints: [],
    iconPoints: [],
    arrows: [],
  },

  'gallery-03': {
    galleryId: 'gallery-03',
    name: 'Gallery 03 — Modern Hall',
    nameFa: 'گالری ۰۳ — تالار مدرن',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
    collectionPoints: [
      {
        id: 'artwork-g03-star',
        type: 'collection',
        pointType: 'star',
        galleryId: 'gallery-03',
        title: 'عکاسی در گذر زمان',
        roomSection: 'MODERN ROTUNDA',
        x: 230,
        y: 200,
        frames: [
          { id: 'artwork-g03-f1', order: 1, x: 0, y: 0, scale: 1 },
        ],
      },
    ],
    iconPoints: [
      {
        id: 'icon-g03-questions',
        type: 'icon',
        galleryId: 'gallery-03',
        title: 'Gallery 03 Questions & Quiz',
        x: 424,
        y: 632,
        iconType: 'preset-question',
        width: 48,
        height: 34,
        destination: 'gallery-03-questions',
      },
    ],
    puzzlePoints: [
      {
        id: 'puzzle-g03-point-01',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۱ — تالار معاصر',
        x: 240,
        y: 380,
        questionId: 'gallery03-puzzle-q01',
        puzzlePieceId: 'gallery03-piece-01',
        isActive: true,
      },
      {
        id: 'puzzle-g03-point-02',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۲ — تالار معاصر',
        x: 424,
        y: 920,
        questionId: 'gallery03-puzzle-q02',
        puzzlePieceId: 'gallery03-piece-02',
        isActive: true,
      },
      {
        id: 'puzzle-g03-point-03',
        type: 'puzzle',
        galleryId: 'gallery-03',
        title: 'نقطه پازل ۰۳ — تالار معاصر (قطعه نهایی)',
        x: 610,
        y: 380,
        questionId: 'gallery03-puzzle-q03',
        puzzlePieceId: 'gallery03-piece-03',
        isActive: true,
      },
    ],
    arrows: [
      {
        id: 'arrow-g03-to-g04',
        type: 'arrow',
        galleryId: 'gallery-03',
        title: 'فلش راهنما به گالری ۰۴',
        x: 680,
        y: 200,
        rotation: 90,
        size: 48,
        destination: 'gallery-04',
        visibilityConditions: [
          {
            id: 'cond-g03-piece01',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery03-piece-01',
          },
          {
            id: 'cond-g03-piece02',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery03-piece-02',
          },
          {
            id: 'cond-g03-piece03',
            type: 'puzzlePieceCollected',
            puzzlePieceId: 'gallery03-piece-03',
          },
        ],
      },
    ],
  },

  'gallery-04': {
    galleryId: 'gallery-04',
    name: 'Gallery 04',
    nameFa: 'گالری ۰۴',
    viewBox: '0 0 848 1264',
    width: 848,
    height: 1264,
    collectionPoints: [],
    iconPoints: [],
    puzzlePoints: [],
    arrows: [],
  },
};

const STORAGE_MAP_CONFIG_KEY = 'museum_map_config_v3';

/**
 * In-memory working database with live persistent synchronization
 */
let memoryDatabase: MuseumMapDatabase | null = null;

/**
 * Loads the complete database from persistent storage with default fallback
 */
export function getAllGalleryMapConfigs(): MuseumMapDatabase {
  if (memoryDatabase) {
    return memoryDatabase;
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_MAP_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Merge defaults with saved data to guarantee schema completeness
          const merged: MuseumMapDatabase = { ...DEFAULT_MAP_DATABASE };
          for (const key of Object.keys(DEFAULT_MAP_DATABASE)) {
            if (parsed[key]) {
              const defaultIcons = DEFAULT_MAP_DATABASE[key]?.iconPoints || [];
              const savedIcons = parsed[key].iconPoints || [];
              const combinedIcons = [...savedIcons];
              for (const defIcon of defaultIcons) {
                if (!combinedIcons.some((i) => i.id === defIcon.id)) {
                  combinedIcons.push(defIcon);
                }
              }

              const defaultPuzzles = DEFAULT_MAP_DATABASE[key]?.puzzlePoints || [];
              const savedPuzzles = parsed[key].puzzlePoints || [];
              const combinedPuzzles = [...savedPuzzles];
              for (const defPuzzle of defaultPuzzles) {
                if (!combinedPuzzles.some((p: any) => p.id === defPuzzle.id)) {
                  combinedPuzzles.push(defPuzzle);
                }
              }

              const defaultArrows = DEFAULT_MAP_DATABASE[key]?.arrows || [];
              const savedArrows = parsed[key].arrows || [];
              const combinedArrows = [...savedArrows];
              for (const defArrow of defaultArrows) {
                const existingIdx = combinedArrows.findIndex((a: any) => a.id === defArrow.id);
                if (existingIdx === -1) {
                  combinedArrows.push(defArrow);
                } else {
                  combinedArrows[existingIdx] = {
                    ...combinedArrows[existingIdx],
                    destination: defArrow.destination,
                    visibilityConditions: defArrow.visibilityConditions,
                  };
                }
              }

              const defaultCollections = DEFAULT_MAP_DATABASE[key]?.collectionPoints || [];
              const savedCollections = parsed[key].collectionPoints || [];
              const combinedCollections = [...savedCollections];
              for (const defCol of defaultCollections) {
                const existingIdx = combinedCollections.findIndex((c: any) => c.id === defCol.id);
                if (existingIdx === -1) {
                  combinedCollections.push(defCol);
                } else if (defCol.pointType === 'star') {
                  combinedCollections[existingIdx].pointType = 'star';
                }
              }

              merged[key] = {
                ...DEFAULT_MAP_DATABASE[key],
                ...parsed[key],
                collectionPoints: combinedCollections,
                iconPoints: combinedIcons,
                puzzlePoints: combinedPuzzles,
                arrows: combinedArrows,
              };
            }
          }
          memoryDatabase = merged;
          return memoryDatabase;
        }
      }
    }
  } catch (err) {
    console.error('Error reading map config from storage:', err);
  }

  // Deep clone default database
  memoryDatabase = JSON.parse(JSON.stringify(DEFAULT_MAP_DATABASE));
  return memoryDatabase!;
}

/**
 * Gets the map configuration for a specific gallery
 */
export function getGalleryMapConfig(galleryId: string): GalleryMapConfig {
  const all = getAllGalleryMapConfigs();
  const rawConfig = all[galleryId] || DEFAULT_MAP_DATABASE[galleryId];
  if (rawConfig) {
    return {
      ...rawConfig,
      collectionPoints: (rawConfig.collectionPoints || []).map((cp) => ({
        ...cp,
        pointType: cp.pointType || 'normal',
      })),
      iconPoints: rawConfig.iconPoints || [],
      puzzlePoints: rawConfig.puzzlePoints || (DEFAULT_MAP_DATABASE[galleryId]?.puzzlePoints ? [...DEFAULT_MAP_DATABASE[galleryId].puzzlePoints!] : []),
      arrows: rawConfig.arrows || [],
    };
  }
  // Fallback default
  return {
    galleryId,
    name: galleryId,
    nameFa: galleryId,
    viewBox: '0 0 1000 1000',
    width: 1000,
    height: 1000,
    collectionPoints: [],
    iconPoints: [],
    puzzlePoints: [],
    arrows: [],
  };
}

/**
 * Gets all points (collection + icon + puzzle) for a specific gallery
 */
export function getGalleryPoints(galleryId: string): AdminMapPoint[] {
  const config = getGalleryMapConfig(galleryId);
  return [...config.collectionPoints, ...config.iconPoints, ...(config.puzzlePoints || [])];
}

/**
 * Gets all collection points for a specific gallery
 */
export function getGalleryCollectionPoints(galleryId: string): AdminCollectionPoint[] {
  const config = getGalleryMapConfig(galleryId);
  return config.collectionPoints;
}

/**
 * Gets all custom icon points for a specific gallery
 */
export function getGalleryIconPoints(galleryId: string): AdminIconPoint[] {
  const config = getGalleryMapConfig(galleryId);
  return config.iconPoints;
}

/**
 * Gets all puzzle points for a specific gallery
 */
export function getGalleryPuzzlePoints(galleryId: string): AdminPuzzlePoint[] {
  const config = getGalleryMapConfig(galleryId);
  return config.puzzlePoints || [];
}

/**
 * Gets all navigation arrows for a specific gallery
 */
export function getGalleryArrows(galleryId: string): AdminArrowPoint[] {
  const config = getGalleryMapConfig(galleryId);
  return config.arrows || [];
}

/**
 * Saves all points (split into collection, icon & puzzle) for a gallery
 */
export function saveGalleryPoints(galleryId: string, points: AdminMapPoint[]): void {
  const all = getAllGalleryMapConfigs();
  const current = getGalleryMapConfig(galleryId);

  const collectionPoints = points.filter((p): p is AdminCollectionPoint => p.type === 'collection');
  const iconPoints = points.filter((p): p is AdminIconPoint => p.type === 'icon');
  const puzzlePoints = points.filter((p): p is AdminPuzzlePoint => p.type === 'puzzle');

  all[galleryId] = {
    ...current,
    collectionPoints,
    iconPoints,
    puzzlePoints,
  };

  persistDatabase(all, galleryId);
}

/**
 * Saves all puzzle points for a gallery
 */
export function saveGalleryPuzzlePoints(galleryId: string, puzzlePoints: AdminPuzzlePoint[]): void {
  const all = getAllGalleryMapConfigs();
  const current = getGalleryMapConfig(galleryId);

  all[galleryId] = {
    ...current,
    puzzlePoints,
  };

  persistDatabase(all, galleryId);
}

/**
 * Saves all navigation arrows for a gallery
 */
export function saveGalleryArrows(galleryId: string, arrows: AdminArrowPoint[]): void {
  const all = getAllGalleryMapConfigs();
  const current = getGalleryMapConfig(galleryId);

  all[galleryId] = {
    ...current,
    arrows,
  };

  persistDatabase(all, galleryId);
}

/**
 * Saves a full or partial gallery map configuration
 */
export function saveGalleryConfig(galleryId: string, updates: Partial<GalleryMapConfig>): void {
  const all = getAllGalleryMapConfigs();
  const current = getGalleryMapConfig(galleryId);

  all[galleryId] = {
    ...current,
    ...updates,
  };

  persistDatabase(all, galleryId);
}

/**
 * Resets points for a gallery to default
 */
export function resetGalleryPoints(galleryId: string): AdminMapPoint[] {
  const defaultConf = DEFAULT_MAP_DATABASE[galleryId] || {
    collectionPoints: [],
    iconPoints: [],
  };

  saveGalleryPoints(galleryId, [...defaultConf.collectionPoints, ...defaultConf.iconPoints]);
  return [...defaultConf.collectionPoints, ...defaultConf.iconPoints];
}

/**
 * Resets arrows for a gallery to default
 */
export function resetGalleryArrows(galleryId: string): AdminArrowPoint[] {
  const defaultConf = DEFAULT_MAP_DATABASE[galleryId] || { arrows: [] };
  saveGalleryArrows(galleryId, defaultConf.arrows);
  return defaultConf.arrows;
}

/**
 * Resets an entire gallery configuration to default
 */
export function resetGalleryMapConfig(galleryId: string): GalleryMapConfig {
  const defaultConf = DEFAULT_MAP_DATABASE[galleryId];
  if (defaultConf) {
    saveGalleryConfig(galleryId, JSON.parse(JSON.stringify(defaultConf)));
    return defaultConf;
  }
  return getGalleryMapConfig(galleryId);
}

/**
 * Resets all galleries to factory defaults
 */
export function resetAllGalleries(): void {
  memoryDatabase = JSON.parse(JSON.stringify(DEFAULT_MAP_DATABASE));
  persistDatabase(memoryDatabase!, 'all');
}

/**
 * Creates a new navigation arrow
 */
export function createNewArrow(
  galleryId: string,
  defaultX = 424,
  defaultY = 600
): AdminArrowPoint {
  const currentArrows = getGalleryArrows(galleryId);
  const nextNum = currentArrows.length + 1;
  const numPad = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;

  const newArrow: AdminArrowPoint = {
    id: `arrow-${galleryId}-${Date.now().toString(36)}`,
    type: 'arrow',
    galleryId,
    title: `Arrow ${numPad}`,
    x: defaultX,
    y: defaultY,
    rotation: 0,
    size: 48,
    destination: galleryId === 'gallery-00' ? 'gallery-01' : 'none',
    visibilityConditions: [],
  };

  return newArrow;
}

/**
 * Creates a new puzzle point
 */
export function createNewPuzzlePoint(
  galleryId: string,
  defaultX = 424,
  defaultY = 400
): AdminPuzzlePoint {
  const currentPuzzles = getGalleryPuzzlePoints(galleryId);
  const nextNum = currentPuzzles.length + 1;
  const numPad = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  const galleryNum = galleryId.replace(/[^0-9]/g, '') || '01';

  const newPuzzle: AdminPuzzlePoint = {
    id: `puzzle-point-${Date.now().toString(36)}`,
    type: 'puzzle',
    galleryId,
    title: `نقطه پازل ${numPad} (${galleryId})`,
    x: defaultX,
    y: defaultY,
    questionId: `gallery${galleryNum}-puzzle-q${numPad}`,
    puzzlePieceId: `gallery${galleryNum}-piece-${numPad}`,
    isActive: true,
  };

  return newPuzzle;
}

/**
 * Helper to dispatch update events and sync localStorage
 */
function persistDatabase(db: MuseumMapDatabase, galleryId: string): void {
  memoryDatabase = db;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_MAP_CONFIG_KEY, JSON.stringify(db));
    }
  } catch (err) {
    console.error('Error saving map database to localStorage:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('museum_map_config_updated', { detail: { galleryId } })
    );
    window.dispatchEvent(
      new CustomEvent('museum_points_updated', { detail: { galleryId } })
    );
    window.dispatchEvent(
      new CustomEvent('museum_arrows_updated', { detail: { galleryId } })
    );
  }
}
