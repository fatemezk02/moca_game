export type PointType = 'collection' | 'icon' | 'puzzle';
export type CollectionPointVisualType = 'normal' | 'star';

export interface ArtworkFrameConfig {
  id: string;
  order: number;
  image?: string; // base64 data URI or image URL
  imageName?: string;
  x: number;      // offset X inside frame (percentage -50% to +50% or px)
  y: number;      // offset Y inside frame (percentage -50% to +50% or px)
  scale: number;  // scale factor (e.g. 1.0, 1.2, 0.8)
  width?: number;
  height?: number;
  aspectRatio?: string; // e.g. '1/1', '4/3', '16/9'
}

export interface AdminCollectionPoint {
  id: string;
  type: 'collection';
  pointType?: CollectionPointVisualType;
  galleryId: string;
  title: string;
  roomCode?: string;
  roomSection?: string;
  x: number; // SVG coordinate X
  y: number; // SVG coordinate Y
  direction?: 'left' | 'right' | 'top' | 'bottom';
  frames: ArtworkFrameConfig[];
  hiddenInAdminPreview?: boolean;
  starId?: string;
}

export interface AdminIconPoint {
  id: string;
  type: 'icon';
  galleryId: string;
  title: string;
  x: number; // SVG coordinate X
  y: number; // SVG coordinate Y
  iconType:
    | 'custom-svg'
    | 'upload'
    | 'preset-question'
    | 'preset-door'
    | 'preset-star'
    | 'preset-info'
    | 'preset-location-coffee'
    | 'preset-location-shop'
    | 'preset-location-frame'
    | 'preset-location-tree'
    | 'preset-location-wc'
    | 'preset-location-library'
    | 'preset-location-entrance'
    | 'preset-location-cinema'
    | 'preset-location-gallery'
    | 'preset-location-gallery-1'
    | 'preset-location-gallery-2'
    | 'preset-location-gallery-3'
    | 'preset-location-gallery-4'
    | 'preset-location-gallery-5'
    | 'preset-location-gallery-6'
    | 'preset-location-gallery-7'
    | 'preset-location-gallery-8'
    | 'preset-location-gallery-9';
  iconData?: string; // SVG raw string or base64 data URL
  galleryNumber?: number | string;
  width: number;
  height: number;
  destination:
    | 'gallery-00'
    | 'gallery-01'
    | 'gallery-01-questions'
    | 'gallery-02'
    | 'gallery-03'
    | 'gallery-03-questions'
    | 'gallery-04'
    | 'gallery-05'
    | 'gallery-06'
    | 'gallery-07'
    | 'gallery-08'
    | 'gallery-09'
    | 'collection'
    | 'tasks'
    | 'curator'
    | (string & {});
  destinationParams?: string;
  locationId?: string;
  hiddenInAdminPreview?: boolean;
}

export interface AdminPuzzlePoint {
  id: string;
  type: 'puzzle';
  galleryId: string;
  title: string;
  x: number; // SVG coordinate X
  y: number; // SVG coordinate Y
  questionId: string;
  puzzlePieceId: string;
  isActive: boolean;
  hiddenInAdminPreview?: boolean;
}

export type AdminMapPoint = AdminCollectionPoint | AdminIconPoint | AdminPuzzlePoint;

export type ArrowConditionType =
  | 'alwaysVisible'
  | 'questionAnswered'
  | 'puzzlePieceCollected'
  | 'arrowUsed'
  | 'galleryPuzzleCompleted';

export interface ArrowVisibilityCondition {
  id?: string;
  type: ArrowConditionType;
  galleryId?: string;
  questionId?: string;
  puzzlePieceId?: string;
  arrowId?: string;
}

export type ArrowDestination =
  | 'none'
  | 'gallery-00'
  | 'gallery-01'
  | 'gallery-01-questions'
  | 'gallery-02'
  | 'gallery-03'
  | 'gallery-03-questions'
  | 'gallery-04'
  | 'gallery-05'
  | 'collection'
  | 'tasks'
  | 'curator'
  | (string & {});

export interface AdminArrowPoint {
  id: string;
  type: 'arrow';
  galleryId: string;
  title?: string;
  x: number; // SVG coordinate X (viewBox based)
  y: number; // SVG coordinate Y (viewBox based)
  rotation: number; // degrees (0 - 360)
  size: number; // width/height in px / SVG units
  destination: ArrowDestination;
  visibilityConditions?: ArrowVisibilityCondition[];
  hiddenInAdminPreview?: boolean;
}

export interface GalleryLampItem {
  id: string;
  galleryId: string;
  masterMapGalleryId?: string;
  title: string;
  x: number;
  y: number;
}

export interface GalleryLockItem {
  id: string;
  galleryId: string;
  masterMapGalleryId?: string;
  title: string;
  x: number;
  y: number;
}

export interface GalleryExperiencePointItem {
  id: string;
  experienceId: string;
  galleryId: string;
  iconId: string;
  icon_id?: string;
  x: number;
  y: number;
  labelFa?: string;
  title?: string;
}

export interface GalleryConfig {
  id: string;
  name: string;
  nameFa: string;
  viewBox: string;
  width: number;
  height: number;
}

export interface GalleryMapConfig {
  galleryId: string;
  name: string;
  nameFa: string;
  viewBox: string;
  width: number;
  height: number;
  collectionPoints: AdminCollectionPoint[];
  iconPoints: AdminIconPoint[];
  puzzlePoints?: AdminPuzzlePoint[];
  arrows: AdminArrowPoint[];
  lamps?: GalleryLampItem[];
  locks?: GalleryLockItem[];
  experiencePoints?: GalleryExperiencePointItem[];
}

export type MuseumMapDatabase = Record<string, GalleryMapConfig>;

export * from './galleryArea';
