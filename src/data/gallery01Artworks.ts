export interface Gallery01ArtworkPoint {
  id: string;
  title: string;
  roomSection: string;
  // SVG coordinates in 848 x 1264 space
  x: number;
  y: number;
  // Optional custom SVG or component ID
  svgKey?: string;
}

// 4 placeholder points across Gallery 01 floor plan (viewBox 0 0 848 1264)
export const GALLERY_01_ARTWORKS: Gallery01ArtworkPoint[] = [
  {
    id: 'artwork-01',
    title: 'North Apse Monolith',
    roomSection: 'NORTH ROTUNDA',
    x: 230,
    y: 190,
  },
  {
    id: 'artwork-02',
    title: 'West Gallery Vessel',
    roomSection: 'WEST CORRIDOR',
    x: 170,
    y: 520,
  },
  {
    id: 'artwork-03',
    title: 'East Corridor Relief',
    roomSection: 'EAST WING',
    x: 670,
    y: 480,
  },
  {
    id: 'artwork-04',
    title: 'South Forum Column',
    roomSection: 'SOUTH ATRIUM',
    x: 680,
    y: 890,
  },
];
