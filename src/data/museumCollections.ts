import { MuseumCollection } from '../types';

/**
 * ============================================================================
 * MUSEUM ARCHIVE 01 / GALLERY 00 COLLECTIONS DATA
 * ============================================================================
 * NOTE FOR ASSET REPLACEMENT:
 * You can replace any `placeholderImage.realImageUrl` or `sampleArtworks[i].imageUrl`
 * with your real high-resolution museum artwork assets, photography URLs, or local SVGs.
 *
 * Reveal Directions:
 * - 'left': Marker on left wall -> expands eastward from left into gallery space.
 * - 'right': Marker on right wall -> expands westward from right into gallery space.
 * - 'top': Marker on top wall -> expands southward from top into gallery space.
 * - 'bottom': Marker on bottom wall -> expands northward from bottom into gallery space.
 */

export const MUSEUM_COLLECTIONS: MuseumCollection[] = [
  {
    id: 'col-05',
    roomCode: 'FORUM 00',
    title: 'The Curator’s Monolith & Central Axis',
    subtitle: 'Great Central Nave',
    wing: 'Central Forum',
    period: 'Contemporary Installation',
    artworkCount: 1,
    direction: 'bottom', // Center marker -> emerges bottom to top
    mapX: 50.0,
    mapY: 54.0,
    curatorNote: 'The singular basalt anchor point of Gallery 00. Aligning directly with the north solar zenith, it functions as both an acoustic focal point and spatial datum.',
    audioGuideDuration: '2m 50s',
    accessionRange: 'ARC.00.001',
    placeholderImage: {
      title: 'Basalt Datum 00 / Obsidian Prism',
      aspectRatio: '4/3',
      accentColor: '#0E0F0F',
      patternType: 'monolith',
      /* [PLACEHOLDER ASSET] Replace this placeholder with real image URL */
      realImageUrl: undefined,
    },
    sampleArtworks: [
      {
        id: 'art-501',
        accessionNumber: 'ARC.00.001',
        title: 'Monolithic Axis Marker 00',
        artistOrCulture: 'Curatorial Architectural Commission',
        year: '2024',
        medium: 'Polished Black Basalt & Cast Iron Inlay',
        dimensions: '220 × 60 × 60 cm',
        thumbnailPlaceholderColor: '#2B2B2B',
        description: 'Precision milled cube with micro-perforations aligning to the solstice celestial coordinate.',
      },
    ],
  },
];
