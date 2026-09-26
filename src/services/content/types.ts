/**
 * Strongly typed definitions for the game's external content layer.
 * These interfaces represent the unified internal model for:
 * 1. Questions
 * 2. Stars (Star Points & Discovery)
 * 3. Artworks
 */

export type ContentSourceType = 'network' | 'cache' | 'seed-fallback';

export type ExperienceIconType =
  | 'frame'
  | 'shadow-silhouette'
  | 'mirror'
  | 'vintage-camera'
  | 'mirror-selfie'
  | 'darkroom'
  | 'reversed-camera'
  | 'grand-stereoscope'
  | (string & {});

/**
 * Strongly typed representation of an Experience Point entity
 * Loaded from Google Sheets 'Experiences' tab
 */
export interface ExperienceContent {
  id: string;
  experienceId: string;
  galleryId: string;
  labelFa: string;
  descriptionFa: string;
  imageUrl?: string;
  iconId: ExperienceIconType;
  title?: string;
  active?: boolean;
  rawFields?: Record<string, string>;
}

/**
 * Strongly typed representation of a Question item
 */
export interface QuestionContent {
  id: string;
  galleryId: string;
  puzzlePointId?: string;
  questionOrder?: number;
  title: string;
  question: string;
  questionFa?: string;
  questionEn?: string;
  options: string[];
  optionsFa?: string[];
  optionsEn?: string[];
  correctOption?: string;
  correctAnswer: string;
  correctIndex: number;
  explanation?: string;
  category?: 'gallery' | 'puzzle' | 'star' | 'general';
  reward?: number;
  active: boolean;
  puzzlePieceId?: string;
  artworkId?: string;
  /** Preserves any unexpected raw columns from the sheet */
  rawFields?: Record<string, string>;
}

/**
 * Strongly typed representation of a Star Point entity
 */
export interface StarContent {
  id: string;
  starId?: string;
  starNumber?: string;
  questionId?: string;
  galleryId: string;
  artworkId?: string;
  labelTextFa: string;
  titleFa: string;
  introFa: string;
  discoveryCost: number;
  informationCost: number;
  questionText: string;
  questionOptions: string[];
  correctAnswer: string;
  correctIndex: number;
  reward: number;
  wrongReward: number;
  explanation?: string;
  artworkImageUrl: string;
  artworkTextFa: string;
  artworkTextEn: string;
  active?: boolean;
  rawFields?: Record<string, string>;
}

/**
 * Strongly typed representation of an Artwork entity
 */
export interface ArtworkContent {
  id: string;
  artworkId?: string;
  galleryId: string;
  title: string;
  roomSection?: string;
  x?: number;
  y?: number;
  period?: string;
  artistOrCulture?: string;
  medium?: string;
  year?: string;
  dimensions?: string;
  description?: string;
  imageUrl?: string;
  rawFields?: Record<string, string>;
}

/**
 * Strongly typed representation of a Gallery entity
 * Based on Google Sheets 'Galleries' tab:
 * gallery_id, gallery_number, name_fa, name_en, description_fa, description_en, active, artwork_id
 */
export interface GalleryContent {
  id: string;
  galleryId: string;
  galleryNumber: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  curator?: string;
  curatorUrl?: string;
  puzzleArtworkId?: string;
  audioUrl?: string;
  active: boolean;
  rawFields?: Record<string, string>;
}

/**
 * Strongly typed representation of a Location Point entity
 * Loaded from Google Sheets 'Location' / 'Locations' tab
 */
export interface LocationContent {
  id: string;
  locationId: string;
  name: string;
  title?: string;
  description: string;
  active: boolean;
  rawFields?: Record<string, string>;
}

/**
 * Strongly typed representation of a Popup entity
 * Loaded from Google Sheets 'pop' / 'Pop' tab:
 * Popup_id, gallery_id, info_txt, picture, active
 */
export interface PopupContent {
  id: string;
  popupId: string;
  galleryId: string;
  infoTxt: string;
  picture?: string;
  active: boolean;
  title?: string;
  rawFields?: Record<string, string>;
}

/**
 * Full bundled content payload stored in cache and memory
 */
export interface GameContentData {
  questions: QuestionContent[];
  stars: StarContent[];
  artworks: ArtworkContent[];
  galleries: GalleryContent[];
  experiences?: ExperienceContent[];
  locations?: LocationContent[];
  popups?: PopupContent[];
  metadata: {
    loadedAt: number;
    source: ContentSourceType;
    version: string;
    error?: string;
  };
}

/**
 * Real-time status of the ContentService
 */
export interface ContentServiceStatus {
  isLoading: boolean;
  isLoaded: boolean;
  source: 'idle' | ContentSourceType;
  lastLoadedAt?: number;
  error?: string | null;
  counts: {
    questions: number;
    stars: number;
    artworks: number;
    galleries: number;
    experiences?: number;
    locations?: number;
    popups?: number;
  };
}

/**
 * Summary object for verification and debugging as specified in requirements
 */
export interface GameContentSummary {
  isLoaded: boolean;
  source: 'network' | 'cache' | 'seed' | 'none';
  lastLoadedDate: string | null;
  counts: {
    questions: number;
    stars: number;
    artworks: number;
    galleries: number;
    experiences?: number;
    locations?: number;
    popups?: number;
  };
  hasLocalCache: boolean;
}

/**
 * Public debug interface exposed on window.__GAME_CONTENT_DEBUG__
 */
export interface GameContentDebug {
  getSummary: () => GameContentSummary;
  getQuestions: () => QuestionContent[];
  getStars: () => StarContent[];
  getArtworks: () => ArtworkContent[];
  getGalleries: () => GalleryContent[];
  getExperiences: () => ExperienceContent[];
  getExperiencesForGallery: (galleryId: string) => ExperienceContent[];
  getExperienceById: (id: string) => ExperienceContent | null;
  getLocations: () => LocationContent[];
  getLocationById: (locationId: string) => LocationContent | null;
  getPopups: () => PopupContent[];
  getPopupsForGallery: (galleryId: string) => PopupContent[];
  getActivePopupsForGallery: (galleryId: string) => PopupContent[];
  getPopupById: (popupId: string) => PopupContent | null;
  getGalleryById: (id: string) => GalleryContent | null;
  getArtworkById: (id: string) => ArtworkContent | null;
  getGalleryPuzzleArtwork: (galleryId: string) => ArtworkContent | null;
  refresh: () => Promise<GameContentData>;
  clearCache: () => void;
}

/**
 * Backward compatibility alias for debug summary
 */
export type ContentDebugSummary = GameContentSummary;

declare global {
  interface Window {
    __GAME_CONTENT_DEBUG__: GameContentDebug;
    getGameContentStats: () => GameContentSummary;
  }
}
