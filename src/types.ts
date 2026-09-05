export type RevealDirection = 'left' | 'right' | 'top' | 'bottom';
export type MapDisplayMode = 'normal' | 'outline';

export interface ArtworkPlaceholder {
  id: string;
  accessionNumber: string;
  title: string;
  artistOrCulture: string;
  year: string;
  medium: string;
  dimensions: string;
  thumbnailPlaceholderColor: string;
  /* [PLACEHOLDER ASSET] Replace this with real artwork asset URL */
  imageUrl?: string;
  description: string;
}

export interface MuseumCollection {
  id: string;
  roomCode: string;
  title: string;
  subtitle: string;
  wing: 'North Wing' | 'South Rotunda' | 'East Wing' | 'West Wing' | 'Central Forum';
  period: string;
  artworkCount: number;
  direction: RevealDirection;
  // Position as percentage on the floor plan coordinate space (0-100)
  mapX: number;
  mapY: number;
  curatorNote: string;
  audioGuideDuration: string;
  accessionRange: string;
  /* [PLACEHOLDER ASSET] Primary collection cover image placeholder */
  placeholderImage: {
    title: string;
    aspectRatio: string;
    accentColor: string;
    patternType: 'geometric' | 'monolith' | 'rotunda' | 'manuscript' | 'relief' | 'astrolabe' | 'statuary';
    // Developer can replace with real image URL:
    realImageUrl?: string;
  };
  sampleArtworks: ArtworkPlaceholder[];
}

export interface MapTransform {
  x: number;
  y: number;
  scale: number;
}
