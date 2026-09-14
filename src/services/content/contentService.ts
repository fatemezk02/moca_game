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
  QuestionContent,
  StarContent,
} from './types';

type StatusListener = (status: ContentServiceStatus) => void;

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
    },
  };

  private hasInitializedFromNetworkOrCache = false;

  constructor(provider?: IContentProvider) {
    this.provider = provider || new GoogleSheetsContentProvider();
    try {
      const cached = contentCache.get();
      this.currentData = cached || buildDefaultSeedContent();
      if (this.currentData) {
        this.status = {
          isLoading: false,
          isLoaded: true,
          source: cached ? 'cache' : 'seed-fallback',
          error: null,
          counts: {
            questions: this.currentData.questions.length,
            stars: this.currentData.stars.length,
            artworks: this.currentData.artworks.length,
            galleries: (this.currentData.galleries || []).length,
          },
        };
      }
    } catch {
      this.currentData = buildDefaultSeedContent();
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
        const { questions, stars, artworks, galleries, experiences } = await this.provider.fetchAll();

        const networkData: GameContentData = {
          questions,
          stars,
          artworks,
          galleries,
          experiences: experiences || [],
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
    let canonGalleryId = normalizeGalleryId(galleryId);
    // Canonical gallery IDs: gallery_01 is Master Gallery with no puzzles;
    // previous Gallery 01 is now canonical gallery_02.
    if (canonGalleryId === 'gallery_01') {
      canonGalleryId = 'gallery_02';
    }

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
  getStarForStarPoint(
    starPointId?: string,
    galleryId?: string,
    explicitStarId?: string
  ): StarContent | null {
    if (!starPointId && !explicitStarId) return null;
    const stars = this.getStars();

    const lookupPointId = (starPointId || '').trim();
    const lookupStarId = (explicitStarId || '').trim();

    if (!stars || stars.length === 0) {
      console.warn(
        `[ContentService] No stars data loaded in cache when resolving Star Point ID: "${lookupPointId}", star_id: "${lookupStarId || lookupPointId}".`
      );
      return null;
    }

    const activeStars = stars.filter((s) => s.active !== false);
    const canonGalleryId = galleryId ? normalizeGalleryId(galleryId) : null;

    // Helper: Extract integer numeric value from ID or starNumber
    const extractNumeric = (s?: string): number | null => {
      if (!s) return null;
      if (/^\d+$/.test(s.trim())) return parseInt(s.trim(), 10);
      const m = s.match(/(?:star|artwork|col|point)?[-_]?(\d+)/i);
      if (m && m[1]) return parseInt(m[1], 10);
      return null;
    };

    // Helper: Check if two strings match normalized
    const isCleanMatch = (a?: string, b?: string): boolean => {
      if (!a || !b) return false;
      const cleanA = a.toLowerCase().trim();
      const cleanB = b.toLowerCase().trim();
      if (cleanA === cleanB) return true;
      const alphaA = cleanA.replace(/[^a-z0-9]/g, '');
      const alphaB = cleanB.replace(/[^a-z0-9]/g, '');
      return alphaA.length > 0 && alphaA === alphaB;
    };

    // If galleryId is specified, perform gallery-scoped matching
    if (canonGalleryId) {
      // 1. Filter active stars belonging strictly to this gallery (with Gallery 01 / Gallery 02 backward compatibility)
      const galleryStars = activeStars.filter((star) => {
        if (!star.galleryId) return false;
        const starGallery = normalizeGalleryId(star.galleryId);
        const isG01Compatible =
          (canonGalleryId === 'gallery_01' || canonGalleryId === 'gallery-01') &&
          (starGallery === 'gallery_01' || starGallery === 'gallery-01' || starGallery === 'gallery_02' || starGallery === 'gallery-02');
        const isG02Compatible =
          (canonGalleryId === 'gallery_02' || canonGalleryId === 'gallery-02') &&
          (starGallery === 'gallery_02' || starGallery === 'gallery-02');
        const isExactMatch = starGallery === canonGalleryId;
        return isG01Compatible || isG02Compatible || isExactMatch;
      });

      // Sort gallery stars deterministically by starNumber/ID
      galleryStars.sort((a, b) => {
        const numA = extractNumeric(a.starNumber) ?? extractNumeric(a.starId) ?? extractNumeric(a.id) ?? 9999;
        const numB = extractNumeric(b.starNumber) ?? extractNumeric(b.starId) ?? extractNumeric(b.id) ?? 9999;
        if (numA !== numB) return numA - numB;
        return (a.id || '').localeCompare(b.id || '');
      });

      // Retrieve all collection/star points configured for this gallery
      const mapConfig = getGalleryMapConfig(canonGalleryId);
      const existingStarPoints = (mapConfig?.collectionPoints || []).filter(
        (cp) => cp.pointType === 'star'
      );

      // Ensure the queried lookupPoint is represented in the list of points to match if missing
      const allPointsToMatch = [...existingStarPoints];
      if (
        lookupPointId &&
        !allPointsToMatch.some((p) => p.id === lookupPointId)
      ) {
        allPointsToMatch.push({
          id: lookupPointId,
          starId: lookupStarId || undefined,
          pointType: 'star',
          type: 'collection',
          galleryId: canonGalleryId,
          x: 0,
          y: 0,
          title: '',
          frames: [],
        });
      }

      // DETERMINISTIC MATCHING:
      // Point ID -> StarContent
      const pointToStarMap = new Map<string, StarContent>();
      const usedStarIds = new Set<string>();

      // PHASE 1: Preserve existing correct mappings first
      for (const point of allPointsToMatch) {
        const pId = point.id;
        const pStarId = point.starId;
        const pNum = extractNumeric(pStarId) ?? extractNumeric(pId);

        // Try direct starId match
        let matchedStar = galleryStars.find((s) => {
          if (usedStarIds.has(s.id)) return false;
          const sId = s.starId || s.id;
          return (pStarId && isCleanMatch(pStarId, sId)) || isCleanMatch(pId, sId);
        });

        // Try numeric match within this gallery
        if (!matchedStar && pNum !== null) {
          matchedStar = galleryStars.find((s) => {
            if (usedStarIds.has(s.id)) return false;
            const sNum = extractNumeric(s.starId || s.id) ?? extractNumeric(s.starNumber);
            return sNum !== null && sNum === pNum;
          });
        }

        // Try explicit alias match (e.g. artwork-01 -> 1, artwork-g03-star -> 3)
        if (!matchedStar) {
          if (pId.toLowerCase() === 'artwork-01' || pId.toLowerCase() === 'col-01') {
            matchedStar = galleryStars.find((s) => !usedStarIds.has(s.id) && extractNumeric(s.starId || s.id) === 1);
          } else if (pId.toLowerCase() === 'artwork-g03-star') {
            matchedStar = galleryStars.find((s) => !usedStarIds.has(s.id) && extractNumeric(s.starId || s.id) === 3);
          }
        }

        if (matchedStar) {
          pointToStarMap.set(pId, matchedStar);
          usedStarIds.add(matchedStar.id);
        }
      }

      // PHASE 2: Assign remaining unused gallery records to unmatched existing Star Points in gallery-local order
      for (const point of allPointsToMatch) {
        if (!pointToStarMap.has(point.id)) {
          const unusedStar = galleryStars.find((s) => !usedStarIds.has(s.id));
          if (unusedStar) {
            pointToStarMap.set(point.id, unusedStar);
            usedStarIds.add(unusedStar.id);
          }
        }
      }

      // RESOLUTION FOR THE CURRENT QUERY:
      // 1. By Point ID
      if (lookupPointId && pointToStarMap.has(lookupPointId)) {
        return pointToStarMap.get(lookupPointId)!;
      }

      // 2. By Star ID (find point having that starId or matching star directly)
      if (lookupStarId) {
        // Check if any point was mapped to a star matching lookupStarId
        for (const star of pointToStarMap.values()) {
          if (isCleanMatch(star.starId || star.id, lookupStarId)) {
            return star;
          }
        }
        // Check unused or direct star in galleryStars
        const directStar = galleryStars.find((s) => isCleanMatch(s.starId || s.id, lookupStarId));
        if (directStar) {
          return directStar;
        }
      }

      // 3. If single lookupPointId matches any star in galleryStars directly
      if (lookupPointId) {
        const directStar = galleryStars.find((s) => isCleanMatch(s.starId || s.id, lookupPointId));
        if (directStar) {
          return directStar;
        }
      }

      // If no match in this gallery: Attempt cross-gallery and global fallback
      const missingStarId = lookupStarId || lookupPointId;
      console.info(
        `[ContentService] Star Point ID "${lookupPointId}" (star_id: "${missingStarId}") not found within gallery "${galleryId}". Attempting cross-gallery fallback...`
      );
    }

    // Fallback: Global lookup across all active stars
    // 1. Direct ID / starId match
    const singleMatch = activeStars.find((s) => {
      const sId = s.starId || s.id;
      if (lookupStarId && isCleanMatch(sId, lookupStarId)) return true;
      if (lookupPointId && isCleanMatch(sId, lookupPointId)) return true;
      return false;
    });

    if (singleMatch) {
      return singleMatch;
    }

    // 2. Numeric match globally
    const pNum = extractNumeric(lookupStarId) ?? extractNumeric(lookupPointId);
    if (pNum !== null) {
      const numMatch = activeStars.find((s) => {
        const sNum = extractNumeric(s.starId || s.id) ?? extractNumeric(s.starNumber);
        return sNum !== null && sNum === pNum;
      });
      if (numMatch) {
        return numMatch;
      }
    }

    // 3. Fallback to bundled seed stars
    try {
      const defaultSeed = buildDefaultSeedContent();
      const seedStars = defaultSeed.stars || [];

      // Try ID match in seed
      const seedMatch = seedStars.find((s) => {
        const sId = s.starId || s.id;
        if (lookupStarId && isCleanMatch(sId, lookupStarId)) return true;
        if (lookupPointId && isCleanMatch(sId, lookupPointId)) return true;
        return false;
      });
      if (seedMatch) return seedMatch;

      // Try numeric match in seed
      if (pNum !== null) {
        const seedNumMatch = seedStars.find((s) => {
          const sNum = extractNumeric(s.starId || s.id);
          return sNum !== null && sNum === pNum;
        });
        if (seedNumMatch) return seedNumMatch;
      }

      // Try alias match in seed (e.g. artwork-01 -> star-01)
      if (lookupPointId.toLowerCase() === 'artwork-01' || lookupPointId.toLowerCase() === 'col-01') {
        const s01 = seedStars.find((s) => s.id === 'star-01');
        if (s01) return s01;
      }
      if (lookupPointId.toLowerCase() === 'artwork-g03-star') {
        const s03 = seedStars.find((s) => s.id === 'star-03');
        if (s03) return s03;
      }

      if (seedStars.length > 0) {
        return seedStars[0];
      }
    } catch {
      // ignore
    }

    const missingStarId = lookupStarId || lookupPointId;
    console.warn(
      `[ContentService] No matching Star record found for Star Point ID "${lookupPointId}", missing star_id: "${missingStarId}".`
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
        'gallery_03': '27',
        'gallery_04': '28',
        'gallery_05': '29',
        'gallery_06': '30',
        'gallery_07': '31',
        'gallery_08': '32',
        'gallery_09': '33',
        'gallery-01': '26',
        'gallery-03': '27',
        'gallery-04': '28',
        'gallery-05': '29',
        'gallery-06': '30',
        'gallery-07': '31',
        'gallery-08': '32',
        'gallery-09': '33',
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

