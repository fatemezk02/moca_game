import { IContentProvider } from './IContentProvider';
import { contentCache } from './contentCache';
import { buildDefaultSeedContent } from './defaultSeedContent';
import { GoogleSheetsContentProvider } from './googleSheetsProvider';
import { normalizeGalleryId, normalizeKey } from './mappers';
import { getGalleryMapConfig } from '../../data/mapConfig';
import {
  ArtworkContent,
  ContentDebugSummary,
  ContentServiceStatus,
  ExperienceContent,
  GalleryContent,
  GameContentData,
  GameContentDebug,
  GameContentSummary,
  LocationContent,
  QuestionContent,
  StarContent,
} from './types';

type StatusListener = (status: ContentServiceStatus) => void;

/**
 * Helper to extract canonical Star Number (1 to 25) from any valid star identifier or alias.
 */
export function extractCanonicalStarNumber(s?: string | number | null): number | null {
  if (s === undefined || s === null) return null;
  if (typeof s === 'number') {
    return s >= 1 && s <= 28 ? s : null;
  }
  const clean = String(s).trim().toLowerCase();
  if (!clean) return null;

  // Direct integer check
  if (/^\d+$/.test(clean)) {
    const parsed = parseInt(clean, 10);
    return parsed >= 1 && parsed <= 28 ? parsed : null;
  }

  // Exact point ID aliases
  if (clean === 'artwork-01' || clean === 'col-01') return 1;
  if (clean === 'star-02' || clean === 'col-02') return 2;
  if (clean === 'artwork-g03-star' || clean === 'col-03') return 3;
  if (clean === 'col-8549') return 16;
  if (clean === 'col-6925') return 17;
  if (clean === 'col-0594') return 18;
  if (clean === 'col-g09-01') return 23;
  if (clean === 'col-g09-02') return 24;
  if (clean === 'col-g09-03') return 25;
  if (clean === 'col-g09-04') return 26;

  // Regex patterns: star-01, star-1, star-q-01, star_01, point-star-01, etc.
  const starMatch = clean.match(/(?:star(?:-q)?|star_point|artwork|point)[-_]?0*(\d+)/i);
  if (starMatch && starMatch[1]) {
    const parsed = parseInt(starMatch[1], 10);
    return parsed >= 1 && parsed <= 28 ? parsed : null;
  }

  // Generic trailing digits fallback
  const trailingDigitsMatch = clean.match(/0*(\d+)$/);
  if (trailingDigitsMatch && trailingDigitsMatch[1]) {
    const parsed = parseInt(trailingDigitsMatch[1], 10);
    return parsed >= 1 && parsed <= 28 ? parsed : null;
  }

  return null;
}

/**
 * Central Content Service
 *
 * Responsibilities:
 * - Orchestrates content loading from Google Sheets or any other IContentProvider.
 * - Handles offline fallback using local caching.
 * - Guarantees data is fetched ONCE at startup and never re-fetched per popup/modal.
 * - Provides strongly-typed getters and verification/debug helpers.
 */
class ContentService {
  private provider: IContentProvider;
  private currentData: GameContentData | null = null;
  private initPromise: Promise<GameContentData> | null = null;
  private listeners: Set<StatusListener> = new Set();

  private status: ContentServiceStatus = {
    isLoading: false,
    isLoaded: false,
    source: 'idle',
    error: null,
    counts: {
      questions: 0,
      stars: 0,
      artworks: 0,
      galleries: 0,
      experiences: 0,
      locations: 0,
    },
  };

  private hasInitializedFromNetworkOrCache = false;

  constructor(provider?: IContentProvider) {
    this.provider = provider || new GoogleSheetsContentProvider();
    try {
      const cached = contentCache.get();
      if (cached) {
        this.currentData = cached;
        this.status = {
          isLoading: false,
          isLoaded: true,
          source: 'cache',
          error: null,
          counts: {
            questions: cached.questions.length,
            stars: cached.stars.length,
            artworks: cached.artworks.length,
            galleries: (cached.galleries || []).length,
            experiences: (cached.experiences || []).length,
            locations: (cached.locations || []).length,
          },
        };
      }
    } catch {
      // Lazy fallback will populate currentData in ensureDataLoaded() when needed at runtime
    }
  }

  /**
   * Allows replacing the provider (e.g. for backend API or MySQL in the future)
   */
  setProvider(provider: IContentProvider): void {
    this.provider = provider;
  }

  /**
   * Subscribe to status changes
   */
  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.status));
  }

  /**
   * Primary initialization entry point.
   * Loads content on startup:
   * 1. Checks if online and provider is configured.
   * 2. Tries to fetch latest spreadsheet data.
   * 3. On success, updates local cache and in-memory store.
   * 4. On failure or offline, falls back to local cache or bundled seed data.
   */
  async initializeContent(forceReload = false): Promise<GameContentData> {
    // If already initialized and not forcing reload, return existing data immediately (0 network requests)
    if (this.hasInitializedFromNetworkOrCache && this.currentData && !forceReload) {
      return this.currentData;
    }

    // If an initialization is already in-flight, return the same promise to prevent duplicate requests
    if (this.initPromise && !forceReload) {
      return this.initPromise;
    }

    this.status = {
      ...this.status,
      isLoading: true,
      error: null,
    };
    this.notify();

    this.initPromise = this.executeLoad()
      .then((data) => {
        this.currentData = data;
        this.hasInitializedFromNetworkOrCache = true;
        this.status = {
          isLoading: false,
          isLoaded: true,
          source: data.metadata.source,
          lastLoadedAt: data.metadata.loadedAt,
          error: data.metadata.error || null,
          counts: {
            questions: data.questions.length,
            stars: data.stars.length,
            artworks: data.artworks.length,
            galleries: (data.galleries || []).length,
            experiences: (data.experiences || []).length,
            locations: (data.locations || []).length,
          },
        };
        registerContentDebugAPI(this);
        this.notify();
        this.logSummary(data);
        return data;
      })
      .catch((err) => {
        const errorMsg = err?.message || 'Unknown error loading content';
        console.error('[ContentService] Initialization error:', errorMsg);

        // Even on complete error, ensure we have fallback data so game never crashes
        const fallback = contentCache.get() || buildDefaultSeedContent();
        fallback.metadata.error = errorMsg;
        this.currentData = fallback;

        this.status = {
          isLoading: false,
          isLoaded: true,
          source: fallback.metadata.source,
          lastLoadedAt: fallback.metadata.loadedAt,
          error: errorMsg,
          counts: {
            questions: fallback.questions.length,
            stars: fallback.stars.length,
            artworks: fallback.artworks.length,
            galleries: (fallback.galleries || []).length,
            experiences: (fallback.experiences || []).length,
            locations: (fallback.locations || []).length,
          },
        };
        registerContentDebugAPI(this);
        this.notify();
        return fallback;
      })
      .finally(() => {
        this.initPromise = null;
      });

    return this.initPromise;
  }

  private async executeLoad(): Promise<GameContentData> {
    const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine !== false;
    const isSheetsProvider = this.provider instanceof GoogleSheetsContentProvider;
    const isConfigured = isSheetsProvider
      ? (this.provider as GoogleSheetsContentProvider).isConfigured()
      : true;

    // STEP 1: Attempt network fetch if online and configured
    if (isOnline && isConfigured) {
      try {
        console.info(`[ContentService] Fetching latest content via ${this.provider.name}...`);
        const { questions, stars, artworks, galleries, experiences, locations } = await this.provider.fetchAll();

        const networkData: GameContentData = {
          questions,
          stars,
          artworks,
          galleries,
          experiences: experiences || [],
          locations: locations || [],
          metadata: {
            loadedAt: Date.now(),
            source: 'network',
            version: '1.0.0',
          },
        };

        // Cache for offline use
        contentCache.set(networkData);
        console.info('[ContentService] Network content successfully loaded and cached.');
        return networkData;
      } catch (networkErr: any) {
        console.warn(
          '[ContentService] Network fetch failed. Attempting to use local cache...',
          networkErr?.message || networkErr
        );
      }
    } else if (!isOnline) {
      console.info('[ContentService] Device is currently offline. Using local cache...');
    } else {
      console.info(
        '[ContentService] Google Sheets URLs are not yet configured in src/config/contentConfig.ts. Using local cache / seed...'
      );
    }

    // STEP 2: Use cached content if available
    const cached = contentCache.get();
    if (cached) {
      console.info('[ContentService] Successfully loaded content from local offline cache.');
      return cached;
    }

    // STEP 3: Fall back to bundled seed content
    console.info('[ContentService] No local cache found. Seeding initial content from repository defaults.');
    const seed = buildDefaultSeedContent();
    // Cache the initial seed so next offline startup has it
    contentCache.set(seed);
    return seed;
  }

  /**
   * Log formatted debug summary in developer console
   */
  private logSummary(data: GameContentData): void {
    const timeStr = new Date(data.metadata.loadedAt).toLocaleTimeString();
    console.groupCollapsed(
      `%c[ContentService]%c Game Content Loaded (${data.metadata.source.toUpperCase()}) — Q: ${data.questions.length}, Stars: ${data.stars.length}, Artworks: ${data.artworks.length}, Galleries: ${(data.galleries || []).length} @ ${timeStr}`,
      'background: #1e1b18; color: #fbbf24; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
      'color: inherit; font-weight: normal;'
    );
    console.log('Source:', data.metadata.source);
    console.log('Timestamp:', new Date(data.metadata.loadedAt).toLocaleString());
    console.log('Questions count:', data.questions.length);
    console.log('Stars count:', data.stars.length);
    console.log('Artworks count:', data.artworks.length);
    console.log('Galleries count:', (data.galleries || []).length);
    console.log('Experiences count:', (data.experiences || []).length);
    console.groupEnd();
  }

  private ensureDataLoaded(): GameContentData {
    if (!this.currentData) {
      this.currentData = contentCache.get() || buildDefaultSeedContent();
      if (this.currentData && !this.status.isLoaded) {
        this.status = {
          isLoading: false,
          isLoaded: true,
          source: contentCache.has() ? 'cache' : 'seed-fallback',
          error: null,
          counts: {
            questions: this.currentData.questions.length,
            stars: this.currentData.stars.length,
            artworks: this.currentData.artworks.length,
            galleries: (this.currentData.galleries || []).length,
            experiences: (this.currentData.experiences || []).length,
          },
        };
      }
    }
    return this.currentData;
  }

  /**
   * Get all loaded questions
   */
  getQuestions(): QuestionContent[] {
    return this.ensureDataLoaded().questions || [];
  }

  /**
   * Finds the active question associated with a specific puzzle point in a gallery.
   * Matches via Google Sheets 'puzzle_point_id' column, respecting gallery_id,
   * active flag, and question_order.
   */
  /**
   * Resolves a Question for a given Puzzle Point in a gallery.
   *
   * Rules:
   * 1. Gallery IDs:
   *    gallery_01 = Master Gallery (no puzzle points)
   *    gallery_02 = the exhibition gallery that was previously Gallery 01
   *    gallery_03 ... gallery_09
   * 2. Puzzle Questions Order:
   *    Each gallery has 3 Puzzle Points and 3 Questions.
   *    Puzzle Point #1 -> Question order 1
   *    Puzzle Point #2 -> Question order 2
   *    Puzzle Point #3 -> Question order 3
   * 3. Data Resolution:
   *    - Filter by Questions.gallery_id == current gallery_id
   *    - Filter active questions only (active !== false, non-empty text and options)
   *    - If Questions.puzzle_point_id is explicitly mapped, preserve it ONLY when it matches
   *      the correct gallery and question.
   *    - Otherwise sort the gallery's questions by question_order ASC:
   *      question 1 -> Puzzle 01
   *      question 2 -> Puzzle 02
   *      question 3 -> Puzzle 03
   *    - Do NOT use random selection
   *    - Do NOT use array index across all questions
   *    - Use gallery-local question_order
   * 4. Missing Content:
   *    If a gallery does not have exactly 3 active questions:
   *    - Do not borrow questions from another gallery
   *    - Do not fall back to the first question
   *    - Do not show an unrelated question
   *    - Log a clear development warning containing:
   *      gallery_id, expected question_order, available question IDs
   */
  getQuestionForPuzzlePoint(galleryId: string, puzzlePointId: string): QuestionContent | null {
    const questions = this.getQuestions();
    const canonGalleryId = normalizeGalleryId(galleryId);

    // Determine expected question_order (1, 2, or 3) for this puzzle point:
    // Existing Puzzle Point #1 must ALWAYS open Question order 1
    // Existing Puzzle Point #2 must ALWAYS open Question order 2
    // Existing Puzzle Point #3 must ALWAYS open Question order 3
    let expectedOrder: number | null = null;
    const orderMatch = (puzzlePointId || '').match(/(?:point|piece)?[-_]?0*([1-3])$/i);
    if (orderMatch) {
      expectedOrder = parseInt(orderMatch[1], 10);
    } else if (puzzlePointId && /^[1-3]$/.test(puzzlePointId.trim())) {
      expectedOrder = parseInt(puzzlePointId.trim(), 10);
    } else {
      const anyDigitMatch = (puzzlePointId || '').match(/0*(\d+)/);
      if (anyDigitMatch) {
        const d = parseInt(anyDigitMatch[1], 10);
        if (d >= 1 && d <= 3) {
          expectedOrder = d;
        }
      }
    }

    // 1. Filter questions belonging to this gallery and marked active with playable content
    let galleryActiveQuestions = questions.filter((q) => {
      const qGallery = normalizeGalleryId(q.galleryId);
      // Strictly enforce matching current gallery; never borrow from another gallery
      if (qGallery !== canonGalleryId) return false;
      if (q.active === false) return false;
      const hasText = Boolean(q.question && q.question.trim().length > 0);
      const hasOptions = Boolean(q.options && q.options.length > 0);
      return hasText && hasOptions;
    });

    // Prioritize specific puzzle questions (category === 'puzzle' or has puzzlePieceId / puzzlePointId)
    const specificPuzzleQuestions = galleryActiveQuestions.filter(
      (q) => q.category === 'puzzle' || Boolean(q.puzzlePieceId) || Boolean(q.puzzlePointId)
    );
    if (specificPuzzleQuestions.length > 0) {
      galleryActiveQuestions = specificPuzzleQuestions;
    }

    const availableQuestionIds = galleryActiveQuestions.map((q) => q.id);

    // Warning if gallery does not have exactly 3 active questions
    if (galleryActiveQuestions.length !== 3) {
      console.warn(
        `[ContentService] Gallery "${canonGalleryId}" has ${galleryActiveQuestions.length} active questions (expected 3). Available question IDs: [${availableQuestionIds.join(', ')}].`
      );
    }

    if (expectedOrder === null || expectedOrder < 1 || expectedOrder > 3) {
      console.warn(
        `[ContentService] Missing content or invalid puzzle point "${puzzlePointId}" in gallery "${canonGalleryId}". Expected question_order 1, 2, or 3. Available question IDs: [${availableQuestionIds.join(', ')}].`
      );
      return null;
    }

    // 2. If Questions.puzzle_point_id is explicitly mapped, preserve it ONLY when it matches the correct gallery and question
    const explicitMatch = galleryActiveQuestions.find((q) => {
      if (!q.puzzlePointId) return false;
      const qPointClean = q.puzzlePointId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetClean = puzzlePointId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (qPointClean === targetClean) {
        if (q.questionOrder != null && q.questionOrder !== expectedOrder) {
          return false;
        }
        return true;
      }
      return false;
    });

    if (explicitMatch) {
      console.log(
        `[ContentService] Puzzle Point Lookup -> Puzzle Point ID: ${puzzlePointId} | Current Gallery ID: ${canonGalleryId} | Question ID: ${explicitMatch.id} | Question gallery_id: ${explicitMatch.galleryId} | Question order: ${explicitMatch.questionOrder}`
      );
      return explicitMatch;
    }

    // 3. Otherwise match question with question_order === expectedOrder
    const matchedByOrder = galleryActiveQuestions.find(
      (q) => q.questionOrder === expectedOrder
    );

    if (matchedByOrder) {
      console.log(
        `[ContentService] Puzzle Point Lookup -> Puzzle Point ID: ${puzzlePointId} | Current Gallery ID: ${canonGalleryId} | Question ID: ${matchedByOrder.id} | Question gallery_id: ${matchedByOrder.galleryId} | Question order: ${matchedByOrder.questionOrder}`
      );
      return matchedByOrder;
    }

    // 4. Fallback: Sort the gallery's questions by question_order ASC (or id)
    // question 1 -> Puzzle 01
    // question 2 -> Puzzle 02
    // question 3 -> Puzzle 03
    const sortedQuestions = [...galleryActiveQuestions].sort((a, b) => {
      const orderA = a.questionOrder ?? 999;
      const orderB = b.questionOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.id.localeCompare(b.id);
    });

    const candidate = sortedQuestions[expectedOrder - 1];
    if (candidate) {
      console.log(
        `[ContentService] Puzzle Point Lookup -> Puzzle Point ID: ${puzzlePointId} | Current Gallery ID: ${canonGalleryId} | Question ID: ${candidate.id} | Question gallery_id: ${candidate.galleryId} | Question order: ${candidate.questionOrder}`
      );
      return candidate;
    }

    // 5. Missing content:
    // - do not borrow questions from another gallery
    // - do not fall back to the first question
    // - do not show an unrelated question
    // - log a clear development warning containing:
    //   gallery_id, expected question_order, available question IDs
    console.warn(
      `[ContentService] Missing question for puzzle point "${puzzlePointId}" in gallery "${canonGalleryId}". Expected question_order: ${expectedOrder}. Available question IDs: [${availableQuestionIds.join(', ')}].`
    );
    return null;
  }

  /**
   * Get all loaded stars
   */
  getStars(): StarContent[] {
    return this.ensureDataLoaded().stars || [];
  }

  /**
   * Resolves the Star record from Google Sheets corresponding to a given Star Point ID and gallery.
   * Matches via starId / id property, respecting gallery_id.
   *
   * Error Handling & Resolution:
   * - If no record matches: logs a clear console warning containing the Star Point ID and returns null.
   *   Does NOT crash and does NOT fall back to stars[0] or another Star's content.
   * - If duplicate star_id records exist: logs a development warning and returns a deterministic record.
   */
  /**
   * Resolves the authoritative StarContent for a specific Star Point or star_id.
   *
   * STRICT MAPPING RULES:
   * - Matches strictly by Star Identity (star_id or canonical Star Number 1..28).
   * - All Star content fields (question, options, answer, reward, info, artwork) come from the SAME row.
   * - Does NOT use array order, rendering order, or positional fallbacks.
   * - Returns null if no matching star is found.
   */
  getStarForStarPoint(
    starPointId?: string,
    galleryId?: string,
    explicitStarId?: string
  ): StarContent | null {
    if (!starPointId && !explicitStarId) return null;

    const lookupPointId = (starPointId || '').trim();
    const lookupStarId = (explicitStarId || '').trim();

    // 1. Resolve canonical star number (1 to 28)
    const targetNum =
      extractCanonicalStarNumber(lookupStarId) ??
      extractCanonicalStarNumber(lookupPointId);

    const stars = this.getStars();
    const activeStars = (stars || []).filter((s) => s.active !== false);

    // 2. Search in loaded Google Sheets active stars
    if (activeStars.length > 0) {
      // 2a. Match by exact canonical star number
      if (targetNum !== null) {
        const numMatch = activeStars.find((s) => {
          const sNum =
            extractCanonicalStarNumber(s.starNumber) ??
            extractCanonicalStarNumber(s.starId) ??
            extractCanonicalStarNumber(s.id);
          return sNum !== null && sNum === targetNum;
        });
        if (numMatch) {
          return numMatch;
        }
      }

      // 2b. Match by explicit string ID / starId
      const targetIds = [lookupStarId, lookupPointId]
        .filter(Boolean)
        .map((id) => id.toLowerCase().trim());

      for (const tid of targetIds) {
        const directMatch = activeStars.find((s) => {
          const sid = (s.starId || '').toLowerCase().trim();
          const id = (s.id || '').toLowerCase().trim();
          if (sid === tid || id === tid) return true;
          if (sid.replace(/[^a-z0-9]/g, '') === tid.replace(/[^a-z0-9]/g, '')) return true;
          return false;
        });
        if (directMatch) {
          return directMatch;
        }
      }
    }

    // 3. Fallback to bundled seed stars (strictly matched by targetNum or ID)
    try {
      const defaultSeed = buildDefaultSeedContent();
      const seedStars = defaultSeed.stars || [];

      if (targetNum !== null) {
        const seedNumMatch = seedStars.find((s) => {
          const sNum =
            extractCanonicalStarNumber(s.starNumber) ??
            extractCanonicalStarNumber(s.starId) ??
            extractCanonicalStarNumber(s.id);
          return sNum !== null && sNum === targetNum;
        });
        if (seedNumMatch) return seedNumMatch;
      }

      const targetIds = [lookupStarId, lookupPointId]
        .filter(Boolean)
        .map((id) => id.toLowerCase().trim());

      for (const tid of targetIds) {
        const seedMatch = seedStars.find((s) => {
          const sid = (s.starId || '').toLowerCase().trim();
          const id = (s.id || '').toLowerCase().trim();
          return sid === tid || id === tid;
        });
        if (seedMatch) return seedMatch;
      }
    } catch {
      // ignore
    }

    console.warn(
      `[ContentService] No Star record matched for Star Point ID "${lookupPointId}", star_id: "${lookupStarId}", targetNum: ${targetNum}.`
    );
    return null;
  }

  /**
   * Get all loaded artworks
   */
  getArtworks(): ArtworkContent[] {
    return this.ensureDataLoaded().artworks || [];
  }

  /**
   * Resolves an Artwork entity by its artwork_id or id from the Artworks sheet.
   *
   * Error Handling (Requirement 9):
   * - If no matching artwork exists: do not crash, log a clear development warning,
   *   do not display another artwork, do not use the first artwork as fallback.
   * - If image_url is missing: log a clear development warning, keep the UI stable.
   */
  getArtworkById(artworkId: string): ArtworkContent | null {
    if (!artworkId || typeof artworkId !== 'string' || !artworkId.trim()) {
      return null;
    }
    const cleanId = artworkId.trim();
    const artworks = this.getArtworks();

    if (!artworks || artworks.length === 0) {
      console.warn(
        `[ContentService] No artworks loaded in cache when resolving artwork_id "${artworkId}".`
      );
      return null;
    }

    // 1. Direct match on id or artworkId
    let match = artworks.find(
      (a) => a.id === cleanId || a.artworkId === cleanId
    );

    // 2. Numeric / integer match (e.g. '1' matches 'artwork-01' or '1' or 'artwork-1')
    if (!match && cleanId) {
      const targetDigits = (cleanId || '').replace(/[^0-9]/g, '');
      if (targetDigits) {
        const targetNum = parseInt(targetDigits, 10);
        match = artworks.find((a) => {
          const idDigits = (a.artworkId || a.id || '').replace(/[^0-9]/g, '');
          return idDigits !== '' && parseInt(idDigits, 10) === targetNum;
        });
      }
    }

    // 3. Normalized string match
    if (!match) {
      const normTarget = normalizeKey(cleanId);
      match = artworks.find(
        (a) =>
          normalizeKey(a.id) === normTarget ||
          (a.artworkId && normalizeKey(a.artworkId) === normTarget)
      );
    }

    if (!match) {
      console.warn(`[ContentService] No matching Artwork found for artwork_id: "${artworkId}".`);
      return null;
    }

    if (!match.imageUrl || !match.imageUrl.trim()) {
      console.warn(`[ContentService] Artwork "${artworkId}" was found but its image_url is empty.`);
    }

    return match;
  }

  /**
   * Resolves the configured puzzle artwork for a given gallery.
   * Conceptually: Galleries.gallery_id -> puzzle_artwork_id -> Artworks.artwork_id -> Artworks.image_url
   *
   * Error Handling (Requirement 9):
   * - If a Gallery references a puzzle_artwork_id that does not exist:
   *   do not crash, log a clear development warning, do not use another gallery's artwork,
   *   keep the rest of the game functional.
   */
  getGalleryPuzzleArtwork(galleryId: string): ArtworkContent | null {
    if (!galleryId) return null;
    const gallery = this.getGalleryById(galleryId);

    // 1. Check gallery.puzzleArtworkId from Galleries sheet
    let puzzleArtId = gallery?.puzzleArtworkId?.trim();

    // 2. If not explicitly in sheet row, check standard configured mapping:
    // Gallery 01 -> '26', Gallery 03 -> '27', Gallery 04 -> '28', etc.
    if (!puzzleArtId) {
      const canonId = normalizeGalleryId(galleryId);
      const defaultMappings: Record<string, string> = {
        'gallery_01': '26',
        'gallery_02': '27',
        'gallery_03': '28',
        'gallery_04': '29',
        'gallery_05': '30',
        'gallery_06': '31',
        'gallery_07': '32',
        'gallery_08': '33',
        'gallery-01': '26',
        'gallery-02': '27',
        'gallery-03': '28',
        'gallery-04': '29',
        'gallery-05': '30',
        'gallery-06': '31',
        'gallery-07': '32',
        'gallery-08': '33',
        'gallery-09': '33',
        'gallery_09': '33',
      };
      if (defaultMappings[canonId]) {
        puzzleArtId = defaultMappings[canonId];
      }
    }

    if (puzzleArtId) {
      const art = this.getArtworkById(puzzleArtId);
      if (art) return art;
      console.warn(
        `[ContentService] Gallery "${galleryId}" references puzzle_artwork_id "${puzzleArtId}" which does not exist in Artworks.`
      );
      return null;
    }

    // 3. Fallback: Search Artworks sheet for artwork with matching gallery_id and non-empty image_url
    const matchingArtwork = this.getArtworks().find(
      (a) => normalizeGalleryId(a.galleryId) === normalizeGalleryId(galleryId) && a.imageUrl && a.imageUrl.trim()
    );
    if (matchingArtwork) {
      return matchingArtwork;
    }

    console.warn(`[ContentService] No configured puzzle artwork found for gallery "${galleryId}".`);
    return null;
  }

  /**
   * Resolves the final puzzle artwork image URL for a given gallery.
   */
  getGalleryPuzzleArtworkSrc(galleryId: string): string {
    const artwork = this.getGalleryPuzzleArtwork(galleryId);
    return artwork?.imageUrl ? artwork.imageUrl.trim() : '';
  }

  /**
   * Get all loaded galleries from the Google Sheets 'Galleries' tab
   */
  getGalleries(): GalleryContent[] {
    return this.ensureDataLoaded().galleries || [];
  }

  /**
   * Resolve a gallery record by its unique gallery_id (e.g. 'gallery-01', 'gallery-03').
   * If not found, logs a clear development warning containing the missing gallery_id
   * and returns null without crashing or falling back to Galleries[0].
   */
  getGalleryById(galleryId: string): GalleryContent | null {
    if (!galleryId) return null;
    const galleries = this.getGalleries();
    const canonTarget = normalizeGalleryId(galleryId);

    // 1. Direct match on galleryId or id
    let matched = galleries.find(
      (g) => g.galleryId === galleryId || g.id === galleryId || g.galleryId === canonTarget
    );

    // 2. Match with normalized gallery ID
    if (!matched) {
      matched = galleries.find((g) => normalizeGalleryId(g.galleryId) === canonTarget);
    }

    // 3. Match numeric or gallery_number if passed e.g. "1" or "01"
    if (!matched && galleryId) {
      const targetNum = (galleryId || '').replace(/[^0-9]/g, '');
      if (targetNum) {
        const intTarget = parseInt(targetNum, 10);
        matched = galleries.find((g) => {
          const gNum = (g.galleryNumber || '').replace(/[^0-9]/g, '');
          return gNum !== '' && parseInt(gNum, 10) === intTarget;
        });
      }
    }

    if (!matched) {
      console.warn(`[ContentService] No matching Gallery record found for gallery_id: "${galleryId}".`);
      return null;
    }

    return matched;
  }

  /**
   * Get complete current game content data
   */
  getContent(): GameContentData | null {
    return this.currentData;
  }

  /**
   * Get service status
   */
  getStatus(): ContentServiceStatus {
    return this.status;
  }

  /**
   * Requirement 6: Developer / Debug verification summary
   */
  getSummary(): GameContentSummary {
    const isLoaded = this.status.isLoaded;
    const current = this.currentData;
    const questions = current?.questions || [];
    const stars = current?.stars || [];
    const artworks = current?.artworks || [];
    const galleries = current?.galleries || [];
    const experiences = current?.experiences || [];

    let source: 'network' | 'cache' | 'seed' | 'none' = 'none';
    if (!isLoaded || this.status.source === 'idle') {
      source = 'none';
    } else if (this.status.source === 'network') {
      source = 'network';
    } else if (this.status.source === 'cache') {
      source = 'cache';
    } else {
      source = 'seed';
    }

    const lastLoadedDate =
      this.status.lastLoadedAt && isLoaded
        ? new Date(this.status.lastLoadedAt).toLocaleString()
        : null;

    return {
      isLoaded,
      source,
      lastLoadedDate,
      counts: {
        questions: questions.length,
        stars: stars.length,
        artworks: artworks.length,
        galleries: galleries.length,
        experiences: experiences.length,
      },
      hasLocalCache: contentCache.has(),
    };
  }

  /**
   * Get all loaded experiences
   */
  getExperiences(): ExperienceContent[] {
    return this.ensureDataLoaded().experiences || [];
  }

  /**
   * Get active experiences for a specific gallery
   */
  getExperiencesForGallery(galleryId: string): ExperienceContent[] {
    if (!galleryId) return [];
    const canonId = normalizeGalleryId(galleryId);
    return this.getExperiences().filter(
      (exp) =>
        exp.active !== false &&
        (normalizeGalleryId(exp.galleryId) === canonId ||
          exp.galleryId === galleryId ||
          exp.galleryId === canonId)
    );
  }

  /**
   * Get an experience by its experienceId or id
   */
  getExperienceById(experienceId: string): ExperienceContent | null {
    if (!experienceId) return null;
    const cleanId = experienceId.trim().toLowerCase();
    return (
      this.getExperiences().find(
        (exp) =>
          exp.experienceId.toLowerCase() === cleanId ||
          exp.id.toLowerCase() === cleanId
      ) || null
    );
  }

  /**
   * Get all loaded Location points
   */
  getLocations(): LocationContent[] {
    const data = this.ensureDataLoaded();
    return data.locations || [];
  }

  /**
   * Helper to normalize keys for flexible matching
   */
  private normalizeLocationKey(val: string): string {
    return (val || '')
      .toLowerCase()
      .replace(/[\s_\-–—:\/\\()\[\]]/g, '')
      .replace(/[۰-۹]/g, (d) => String(['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'].indexOf(d)));
  }

  /**
   * Helper to resolve common aliases for location IDs
   */
  private getLocationIdAliases(rawId: string): string[] {
    const clean = this.normalizeLocationKey(rawId);
    const aliases: string[] = [clean, rawId.toLowerCase().trim()];

    // Location_10: Cafe
    if (
      clean === 'location10' ||
      clean === 'location_10' ||
      clean.includes('cafe') ||
      clean.includes('coffee') ||
      clean.includes('کافه')
    ) {
      aliases.push(
        'location_10',
        'location10',
        'Location_10',
        'icon-g00-cafe',
        'cafe',
        'coffee',
        'g00-cafe',
        'preset-location-coffee',
        'کافه',
        'کافهموزه',
        'کافه موزه'
      );
    }

    // Location_11: Library
    if (
      clean === 'location11' ||
      clean === 'location_11' ||
      clean.includes('library') ||
      clean.includes('کتابخانه') ||
      clean.includes('کتاب')
    ) {
      aliases.push(
        'location_11',
        'location11',
        'Location_11',
        'icon-g00-library',
        'library',
        'g00-library',
        'preset-location-library',
        'کتابخانه',
        'کتابخانه تخصصی'
      );
    }

    // Location_12: Cinema
    if (
      clean === 'location12' ||
      clean === 'location_12' ||
      clean.includes('cinema') ||
      clean.includes('cinematheque') ||
      clean.includes('سینما')
    ) {
      aliases.push(
        'location_12',
        'location12',
        'Location_12',
        'icon-g00-cinema',
        'cinema',
        'cinematheque',
        'g00-cinema',
        'preset-location-cinema',
        'سینما',
        'سینماتک'
      );
    }

    // Location_13: Garden / Tree
    if (
      clean === 'location13' ||
      clean === 'location_13' ||
      clean.includes('tree') ||
      clean.includes('garden') ||
      clean.includes('باغ')
    ) {
      aliases.push(
        'location_13',
        'location13',
        'Location_13',
        'icon-g00-tree',
        'tree',
        'garden',
        'g00-tree',
        'preset-location-tree',
        'باغ',
        'باغموزه',
        'باغ موزه',
        'باغمجسمهها',
        'باغ مجسمه ها'
      );
    }

    // Location_14: Shop
    if (
      clean === 'location14' ||
      clean === 'location_14' ||
      clean.includes('shop') ||
      clean.includes('store') ||
      clean.includes('فروشگاه')
    ) {
      aliases.push(
        'location_14',
        'location14',
        'Location_14',
        'icon-g00-shop',
        'shop',
        'store',
        'g00-shop',
        'preset-location-shop',
        'فروشگاه',
        'فروشگاهموزه',
        'فروشگاه موزه'
      );
    }

    // Location_15: Entrance
    if (
      clean === 'location15' ||
      clean === 'location_15' ||
      clean.includes('entrance') ||
      clean.includes('door') ||
      clean.includes('ورود')
    ) {
      aliases.push(
        'location_15',
        'location15',
        'Location_15',
        'icon-g00-entrance',
        'entrance',
        'door',
        'g00-entrance',
        'preset-location-entrance',
        'ورودی',
        'دربورودی',
        'درب ورودی'
      );
    }

    // Location_16: Frame / Oil pool
    if (
      clean === 'location16' ||
      clean === 'location_16' ||
      clean.includes('frame') ||
      clean.includes('oil') ||
      clean.includes('pool') ||
      clean.includes('روغن') ||
      clean.includes('حوض')
    ) {
      aliases.push(
        'location_16',
        'location16',
        'Location_16',
        'icon-g00-frame',
        'frame',
        'oil',
        'oil-pool',
        'g00-frame',
        'preset-location-frame',
        'حوضروغن',
        'حوض روغن',
        'حوض'
      );
    }

    // Location_17: WC / Restroom
    if (
      clean === 'location17' ||
      clean === 'location_17' ||
      clean.includes('wc') ||
      clean.includes('restroom') ||
      clean.includes('toilet') ||
      clean.includes('دستشویی') ||
      clean.includes('بهداشتی')
    ) {
      aliases.push(
        'location_17',
        'location17',
        'Location_17',
        'icon-g00-wc',
        'wc',
        'restroom',
        'toilet',
        'g00-wc',
        'preset-location-wc',
        'دستشویی',
        'سرویسبهداشتی',
        'سرویس بهداشتی'
      );
    }

    // Gallery aliases (Location_1 to Location_9)
    for (let i = 1; i <= 9; i++) {
      const gNum = String(i);
      const gPadded = `0${i}`;
      if (
        clean === `location${gNum}` ||
        clean === `location_${gNum}` ||
        clean === `location${gPadded}` ||
        clean === `location_${gPadded}` ||
        clean === `icong00gallery${gNum}` ||
        clean === `gallery${gNum}` ||
        clean === `gallery${gPadded}` ||
        clean === `g${gNum}` ||
        clean === `g${gPadded}` ||
        clean === gNum ||
        clean === gPadded ||
        clean === `presetlocationgallery${gNum}` ||
        clean === `گالری${gNum}` ||
        clean === `گالری${gPadded}`
      ) {
        aliases.push(
          `Location_${gNum}`,
          `location_${gNum}`,
          `location${gNum}`,
          `icon-g00-gallery-${gNum}`,
          `gallery-${gPadded}`,
          `gallery-${gNum}`,
          `gallery_${gPadded}`,
          `gallery_${gNum}`,
          `g${gPadded}`,
          `g${gNum}`,
          gNum,
          gPadded,
          `preset-location-gallery-${gNum}`,
          `گالری ${gPadded}`,
          `گالری ${gNum}`,
          `گالری ۰${gNum}`
        );
      }
    }

    return aliases;
  }

  /**
   * Get a location by its Location_id / id or iconType alias
   * Only returns active locations with content (name or description)
   */
  getLocationById(locationIdOrType: string): LocationContent | null {
    if (!locationIdOrType) return null;
    const cleanQuery = locationIdOrType.trim().toLowerCase();
    const normQuery = this.normalizeLocationKey(cleanQuery);
    const allLocations = this.getLocations();

    // 1. Exact or normalized direct match on id or locationId
    const exactMatch = allLocations.find(
      (loc) =>
        loc.active !== false &&
        (loc.locationId?.toLowerCase().trim() === cleanQuery ||
          loc.id?.toLowerCase().trim() === cleanQuery ||
          this.normalizeLocationKey(loc.locationId) === normQuery ||
          this.normalizeLocationKey(loc.id) === normQuery)
    );
    if (exactMatch && (exactMatch.name || exactMatch.description)) {
      return exactMatch;
    }

    // 2. Alias matching
    const queryAliases = this.getLocationIdAliases(cleanQuery);
    const aliasMatch = allLocations.find((loc) => {
      if (loc.active === false) return false;
      if (!loc.name && !loc.description) return false;

      const locId = (loc.locationId || loc.id || '').toLowerCase().trim();
      const normLocId = this.normalizeLocationKey(locId);

      if (queryAliases.includes(locId) || queryAliases.includes(normLocId)) {
        return true;
      }

      const locAliases = this.getLocationIdAliases(locId);
      if (locAliases.includes(cleanQuery) || locAliases.includes(normQuery)) {
        return true;
      }

      return false;
    });

    if (aliasMatch) return aliasMatch;

    // 3. Match by name / title
    const nameMatch = allLocations.find(
      (loc) =>
        loc.active !== false &&
        loc.name &&
        (loc.name.trim().toLowerCase() === cleanQuery ||
          this.normalizeLocationKey(loc.name) === normQuery ||
          cleanQuery.includes(loc.name.trim().toLowerCase()) ||
          normQuery.includes(this.normalizeLocationKey(loc.name)))
    );
    if (nameMatch && (nameMatch.name || nameMatch.description)) {
      return nameMatch;
    }

    return null;
  }

  /**
   * Alias for backward compatibility
   */
  getDebugSummary(): GameContentSummary {
    return this.getSummary();
  }

  /**
   * Clears local cache and re-initializes
   */
  async clearCacheAndReload(): Promise<GameContentData> {
    contentCache.clear();
    this.currentData = null;
    return this.initializeContent(true);
  }
}

// Export singleton instance
export const contentService = new ContentService();

/**
 * Registers the global debug object on window and global environments.
 * Called immediately upon module load, after initialization, and after component mounts.
 */
export function registerContentDebugAPI(service: ContentService = contentService): GameContentDebug {
  const debugApi: GameContentDebug = {
    getSummary: () => service.getSummary(),
    getQuestions: () => service.getQuestions(),
    getStars: () => service.getStars(),
    getArtworks: () => service.getArtworks(),
    getGalleries: () => service.getGalleries(),
    getExperiences: () => service.getExperiences(),
    getExperiencesForGallery: (galleryId: string) => service.getExperiencesForGallery(galleryId),
    getExperienceById: (id: string) => service.getExperienceById(id),
    getLocations: () => service.getLocations(),
    getLocationById: (locationId: string) => service.getLocationById(locationId),
    getGalleryById: (id: string) => service.getGalleryById(id),
    getArtworkById: (id: string) => service.getArtworkById(id),
    getGalleryPuzzleArtwork: (galleryId: string) => service.getGalleryPuzzleArtwork(galleryId),
    refresh: () => service.initializeContent(true),
    clearCache: () => {
      contentCache.clear();
      console.info('[ContentService] Game content cache cleared.');
    },
  };

  const statsFn = () => service.getSummary();

  const attachToTarget = (target: any) => {
    try {
      if (!target) return;
      target.__GAME_CONTENT_DEBUG__ = debugApi;
      target.getGameContentStats = statsFn;
    } catch {
      // Ignore cross-origin context issues
    }
  };

  if (typeof window !== 'undefined') {
    attachToTarget(window);
    try {
      (window as any).__GAME_CONTENT_DEBUG__ = debugApi;
      (window as any).getGameContentStats = statsFn;
    } catch {}

    try {
      if (window.parent && window.parent !== window) {
        attachToTarget(window.parent);
      }
    } catch {}
    try {
      if (window.top && window.top !== window) {
        attachToTarget(window.top);
      }
    } catch {}
  }

  if (typeof globalThis !== 'undefined') {
    attachToTarget(globalThis);
    try {
      (globalThis as any).__GAME_CONTENT_DEBUG__ = debugApi;
      (globalThis as any).getGameContentStats = statsFn;
    } catch {}
  }

  return debugApi;
}

// Execute immediate registration so window.__GAME_CONTENT_DEBUG__ exists immediately at startup
registerContentDebugAPI(contentService);

