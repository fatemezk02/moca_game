export interface GalleryAreaPoint {
  x: number;
  y: number;
}

export interface GalleryAreaPolygon {
  type: 'polygon';
  points: GalleryAreaPoint[];
}

export interface GalleryAreaConfig {
  id: string; // e.g. "area-gallery-01"
  galleryId: string; // e.g. "gallery-01", "gallery-03"
  masterMapGalleryId: string; // always "gallery-00"
  title?: string;
  area: GalleryAreaPolygon;
  lampPosition: {
    x: number;
    y: number;
  };
}
