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
    id: 'col-01',
    roomCode: 'SEC 01',
    title: 'Classical Antiquities & Archaic Reliefs',
    subtitle: 'Northwest Diagonal Gallery',
    wing: 'West Wing',
    period: 'c. 600 BCE – 150 CE',
    artworkCount: 14,
    direction: 'left', // Marker on left side -> emerges from left to right
    mapX: 26.5,
    mapY: 20.5,
    curatorNote: 'Limestone friezes and votive steles recovered during the 1924 Aegean architectural survey. Exhibits high-relief drapery and geometric incisions.',
    audioGuideDuration: '4m 15s',
    accessionRange: 'ARC.01.001 – ARC.01.014',
    placeholderImage: {
      title: 'Votive Relief with Chariot Procession',
      aspectRatio: '4/3',
      accentColor: '#C5A059',
      patternType: 'relief',
      /* [PLACEHOLDER ASSET] Replace this property with your real artwork image URL: e.g. realImageUrl: '/assets/artworks/archaic-relief.jpg' */
      realImageUrl: undefined,
    },
    sampleArtworks: [
      {
        id: 'art-101',
        accessionNumber: 'ARC.01.004',
        title: 'Fragmentary Kore with Pomegranate',
        artistOrCulture: 'Attic Workshop, Late Archaic',
        year: 'c. 520 BCE',
        medium: 'Parian Marble with Polychrome Traces',
        dimensions: '68 × 34 × 22 cm',
        thumbnailPlaceholderColor: '#E8E5DD',
        description: 'Delicate archaic smile with braided coiffure, preserving traces of cinnabar pigment.',
      },
      {
        id: 'art-102',
        accessionNumber: 'ARC.01.009',
        title: 'Ionic Volute Capital with Egg-and-Dart Trim',
        artistOrCulture: 'Ionian Stonemason Guild',
        year: 'c. 480 BCE',
        medium: 'Hymettian Limestone',
        dimensions: '45 × 82 × 30 cm',
        thumbnailPlaceholderColor: '#DFDDD7',
        description: 'Architectural cornerstone displaying mathematical spiral harmonics and crisp fluting.',
      },
    ],
  },
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
    id: 'col-03',
    roomCode: 'SEC 03',
    title: 'Epigraphic Lapidary & Inscribed Stele',
    subtitle: 'Southwest Vestibule',
    wing: 'West Wing',
    period: 'c. 400 BCE – 300 CE',
    artworkCount: 19,
    direction: 'left', // Marker on left side -> emerges from left to right
    mapX: 25.0,
    mapY: 66.5,
    curatorNote: 'Civic decrees, surveyor boundary stones, and guild contracts carved into basalt blocks utilizing boustrophedon typographic layout.',
    audioGuideDuration: '3m 40s',
    accessionRange: 'ARC.03.001 – ARC.03.019',
    placeholderImage: {
      title: 'Lex Municipalis Lexicon Block',
      aspectRatio: '4/3',
      accentColor: '#757575',
      patternType: 'geometric',
      /* [PLACEHOLDER ASSET] Replace this placeholder with real image URL */
      realImageUrl: undefined,
    },
    sampleArtworks: [
      {
        id: 'art-301',
        accessionNumber: 'ARC.03.007',
        title: 'Bilingual Maritime Harbor Tariff Decree',
        artistOrCulture: 'Rhodes Port Magistracy',
        year: 'c. 165 BCE',
        medium: 'Grey Veined Marble Stele',
        dimensions: '140 × 52 × 18 cm',
        thumbnailPlaceholderColor: '#E2E2E2',
        description: 'Official legal sanctions for merchant galleys transporting grain and olive oil.',
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
    id: 'col-06',
    roomCode: 'SEC 06',
    title: 'Illuminated Vellum Codices & Calligraphy',
    subtitle: 'Northeast Scriptoria Wing',
    wing: 'East Wing',
    period: 'c. 1100 – 1450 CE',
    artworkCount: 16,
    direction: 'right', // Marker on right side -> emerges from right to left
    mapX: 65.5,
    mapY: 28.5,
    curatorNote: 'Rare monastic manuscripts penned in iron gall ink with burnished gold leaf, ultramarine lapis lazuli borders, and historiated initial capitals.',
    audioGuideDuration: '4m 45s',
    accessionRange: 'ARC.06.001 – ARC.06.016',
    placeholderImage: {
      title: 'Book of Hours of Saint Margaret',
      aspectRatio: '4/3',
      accentColor: '#9C7A3C',
      patternType: 'manuscript',
      /* [PLACEHOLDER ASSET] Replace this placeholder with real image URL */
      realImageUrl: undefined,
    },
    sampleArtworks: [
      {
        id: 'art-601',
        accessionNumber: 'ARC.06.005',
        title: 'Folio with Zodiac Astrological Calender',
        artistOrCulture: 'Flemish Illuminator Atelier',
        year: 'c. 1420',
        medium: 'Tempera and Gold Leaf on Calf Vellum',
        dimensions: '28 × 19 cm',
        thumbnailPlaceholderColor: '#EDE5D4',
        description: 'Intricate floral marginalia featuring miniature scenes of vineyard harvesting.',
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
  {
    id: 'col-08',
    roomCode: 'SEC 08',
    title: 'Architectural Maquettes & Cast Plasters',
    subtitle: 'Southeast Loggia Pavilions',
    wing: 'East Wing',
    period: 'c. 1750 – 1900 CE',
    artworkCount: 9,
    direction: 'right', // Marker on right side -> emerges from right to left
    mapX: 73.5,
    mapY: 69.0,
    curatorNote: 'Scale plaster sectional models of classical domes, timber truss armatures, and Beaux-Arts competition elevation blueprints.',
    audioGuideDuration: '3m 55s',
    accessionRange: 'ARC.08.001 – ARC.08.009',
    placeholderImage: {
      title: 'Sectional Model of Bramante’s Tempietto',
      aspectRatio: '4/3',
      accentColor: '#8C8B8B',
      patternType: 'geometric',
      /* [PLACEHOLDER ASSET] Replace this placeholder with real image URL */
      realImageUrl: undefined,
    },
    sampleArtworks: [
      {
        id: 'art-801',
        accessionNumber: 'ARC.08.004',
        title: 'Cross-Section of the Pantheon Coffered Dome',
        artistOrCulture: 'École des Beaux-Arts Paris',
        year: '1842',
        medium: 'Cast Plaster, Walnut, and Brass Wire',
        dimensions: '65 × 65 × 40 cm',
        thumbnailPlaceholderColor: '#EBE9E4',
        description: 'Exquisitely cast stepped stepped concentric coffers demonstrating Roman pozzolanic concrete thickness.',
      },
    ],
  },
  {
    id: 'col-09',
    roomCode: 'ROTUNDA 01',
    title: 'Astronomic Astrolabes & Scientific Horology',
    subtitle: 'The Grand Octagonal Rotunda',
    wing: 'South Rotunda',
    period: 'c. 1350 – 1780 CE',
    artworkCount: 22,
    direction: 'bottom', // Marker at bottom -> emerges from bottom to top
    mapX: 50.0,
    mapY: 79.5,
    curatorNote: 'Brass celestial planispheric astrolabes, armillary spheres, and water-clock escapements calibrated to European and Islamic observatory latitudes.',
    audioGuideDuration: '7m 10s',
    accessionRange: 'ARC.09.001 – ARC.09.022',
    placeholderImage: {
      title: 'Planispheric Astrolabe with Rete Star Pointers',
      aspectRatio: '4/3',
      accentColor: '#C5A059',
      patternType: 'astrolabe',
      /* [PLACEHOLDER ASSET] Replace this placeholder with real image URL */
      realImageUrl: undefined,
    },
    sampleArtworks: [
      {
        id: 'art-901',
        accessionNumber: 'ARC.09.006',
        title: 'Nuremberg Universal Equinoctial Dial',
        artistOrCulture: 'Hans Troschel Workshop',
        year: '1618',
        medium: 'Engraved Gilt Brass and Magnetic Compass Needle',
        dimensions: '14 × 14 × 4 cm',
        thumbnailPlaceholderColor: '#D8C7A0',
        description: 'Adjustable folding gnomon with latitude arc calibrated for traveling scholars across Northern Europe.',
      },
      {
        id: 'art-902',
        accessionNumber: 'ARC.09.011',
        title: 'Ptolemaic Armillary Sphere with Zodiac Ring',
        artistOrCulture: 'Florentine Instrument Maker Guild',
        year: 'c. 1570',
        medium: 'Turned Ebony Base with Intersecting Brass Hoops',
        dimensions: '48 × 32 × 32 cm',
        thumbnailPlaceholderColor: '#E1D9C5',
        description: 'Nested rings demonstrating the celestial equator, ecliptic band, and precession of the equinoxes.',
      },
    ],
  },
];
