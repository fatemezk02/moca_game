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
    id: 'col-02',
    roomCode: 'SEC 02',
    title: 'Hellenistic Bronze Statuary & Casts',
    subtitle: 'West Portico Chambers',
    wing: 'West Wing',
    period: 'c. 320 BCE – 50 BCE',
    artworkCount: 8,
    direction: 'left', // Marker on left side -> emerges from left to right
    mapX: 23.5,
    mapY: 48.0,
    curatorNote: 'Lost-wax casting masterpieces preserved in maritime anaerobic deposits. Features inlaid copper lips, glass eyes, and anatomical dynamic torsion.',
    audioGuideDuration: '5m 30s',
    accessionRange: 'ARC.02.001 – ARC.02.008',
    placeholderImage: {
      title: 'The Ephebe of Antikythera (Study)',
      aspectRatio: '4/3',
      accentColor: '#3A443E',
      patternType: 'statuary',
      /* [PLACEHOLDER ASSET] Replace this placeholder with real image URL */
      realImageUrl: undefined,
    },
    sampleArtworks: [
      {
        id: 'art-201',
        accessionNumber: 'ARC.02.002',
        title: 'Torso of a Striding Pugilist',
        artistOrCulture: 'School of Lysippos',
        year: 'c. 280 BCE',
        medium: 'Hollow Cast Bronze with Copper Inlays',
        dimensions: '112 × 58 × 40 cm',
        thumbnailPlaceholderColor: '#D3D8D3',
        description: 'Tensed musculature showing athletic exertion and leather caestus hand bindings.',
      },
    ],
  },
  {
    id: 'col-04',
    roomCode: 'SEC 04',
    title: 'Renaissance Master Cartography & Topography',
    subtitle: 'North Apse Chapel Galleries',
    wing: 'North Wing',
    period: 'c. 1480 – 1620 CE',
    artworkCount: 11,
    direction: 'top', // Marker at top -> emerges from top to bottom
    mapX: 49.0,
    mapY: 17.0,
    curatorNote: 'Ptolemaic projections, celestial globes, and engraved copperplate nautical portolan charts illuminated with gold leaf and sea monster vignettes.',
    audioGuideDuration: '6m 10s',
    accessionRange: 'ARC.04.001 – ARC.04.011',
    placeholderImage: {
      title: 'Typus Orbis Terrarum (Venetian Edition)',
      aspectRatio: '4/3',
      accentColor: '#C5A059',
      patternType: 'geometric',
      /* [PLACEHOLDER ASSET] Replace this placeholder with real image URL */
      realImageUrl: undefined,
    },
    sampleArtworks: [
      {
        id: 'art-401',
        accessionNumber: 'ARC.04.003',
        title: 'Planisphere of the Maritime Republics',
        artistOrCulture: 'Fra Mauro Workshop (Attrib.)',
        year: 'c. 1492',
        medium: 'Hand-colored Engraving on Vellum',
        dimensions: '88 × 124 cm',
        thumbnailPlaceholderColor: '#F3EBDD',
        description: 'Elaborate compass roses and rhumb lines detailing Atlantic and Mediterranean shipping routes.',
      },
    ],
  },
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
  {
    id: 'col-07',
    roomCode: 'SEC 07',
    title: 'Baroque Sacred Iconography & Reliquaries',
    subtitle: 'East Transept Cloister',
    wing: 'East Wing',
    period: 'c. 1580 – 1740 CE',
    artworkCount: 12,
    direction: 'right', // Marker on right side -> emerges from right to left
    mapX: 72.0,
    mapY: 52.0,
    curatorNote: 'Chiaroscuro oil studies, gilt silver monstrances, and carved boxwood devotional polyptychs celebrating high theatrical counter-reformation fervor.',
    audioGuideDuration: '5m 05s',
    accessionRange: 'ARC.07.001 – ARC.07.012',
    placeholderImage: {
      title: 'Gilded Filigree Monstrance with Rock Crystal',
      aspectRatio: '4/3',
      accentColor: '#C5A059',
      patternType: 'geometric',
      /* [PLACEHOLDER ASSET] Replace this placeholder with real image URL */
      realImageUrl: undefined,
    },
    sampleArtworks: [
      {
        id: 'art-701',
        accessionNumber: 'ARC.07.002',
        title: 'Study of Saint Jerome in Penumbra',
        artistOrCulture: 'Circle of Jusepe de Ribera',
        year: 'c. 1635',
        medium: 'Oil on Canvas over Oak Panel',
        dimensions: '94 × 76 cm',
        thumbnailPlaceholderColor: '#3A3228',
        description: 'Dramatic single candle illumination emphasizing tactile parchment wrinkles and skull memento mori.',
      },
    ],
  },
];
