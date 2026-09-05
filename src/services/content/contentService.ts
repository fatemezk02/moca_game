import { IContentProvider } from './IContentProvider';
import { contentCache } from './contentCache';
import { buildDefaultSeedContent } from './defaultSeedContent';
import { GoogleSheetsContentProvider } from './googleSheetsProvider';
import { normalizeGalleryId } from './mappers';
import {
  ArtworkContent,
  ContentDebugSummary,
  ContentServiceStatus,
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

  constructor(provider?: IContentProvider) {
    this.provider = provider || new GoogleSheetsContentProvider();
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
    // If already loaded and not forcing reload, return existing data immediately (0 network requests)
    if (this.currentData && !forceReload) {
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
        const { questions, stars, artworks, galleries } = await this.provider.fetchAll();

        const networkData: GameContentData = {
          questions,
          stars,
          artworks,
          galleries,
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
    console.groupEnd();
  }

  /**
   * Get all loaded questions
   */
  getQuestions(): QuestionContent[] {
    return this.currentData?.questions || [];
  }

  /**
   * Finds the active question associated with a specific puzzle point in a gallery.
   * Matches via Google Sheets 'puzzle_point_id' column, respecting gallery_id,
   * active flag, and question_order.
   */
  getQuestionForPuzzlePoint(galleryId: string, puzzlePointId: string): QuestionContent | null {
    const questions = this.getQuestions();
    const canonGalleryId = normalizeGalleryId(galleryId);

    // Filter questions belonging to this gallery and marked active with non-empty content
    const galleryQuestions = questions.filter((q) => {
      const qGallery = normalizeGalleryId(q.galleryId);
      if (qGallery !== canonGalleryId) return false;
      if (q.active === false) return false;
      // Must have question text and at least one option to be playable
      const hasText = Boolean(q.question && q.question.trim().length > 0);
      const hasOptions = Boolean(q.options && q.options.length > 0);
      return hasText && hasOptions;
    });

    // Match question by puzzle_point_id
    const isMatchingPoint = (q: QuestionContent): boolean => {
      if (!q.puzzlePointId) return false;
      const qPoint = q.puzzlePointId.trim();
      const targetPoint = puzzlePointId.trim();

      // 1. Direct match (e.g. "puzzle-point-01" === "puzzle-point-01")
      if (qPoint.toLowerCase() === targetPoint.toLowerCase()) return true;

      // 2. Normalized alphanumeric match (e.g. "puzzlepoint01" === "puzzlepoint01")
      const qClean = qPoint.toLowerCase().replace(/[^a-z0-9]/g, '');
      const tClean = targetPoint.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (qClean === tClean) return true;

      // 3. Match numeric identifiers for Gallery 01:
      // puzzle-point-01 -> "1", "01", "puzzle-point-1"
      // puzzle-point-02 -> "2", "02", "puzzle-point-2"
      // puzzle-point-03 -> "3", "03", "puzzle-point-3"
      if (targetPoint === 'puzzle-point-01' && (qPoint === '1' || qPoint === '01' || qPoint === 'puzzle-point-1')) return true;
      if (targetPoint === 'puzzle-point-02' && (qPoint === '2' || qPoint === '02' || qPoint === 'puzzle-point-2')) return true;
      if (targetPoint === 'puzzle-point-03' && (qPoint === '3' || qPoint === '03' || qPoint === 'puzzle-point-3')) return true;

      // 4. Match numeric identifiers for Gallery 03:
      // puzzle-g03-point-01 -> "puzzle-g03-point-01", "7", "1", "01" (order 1 in G03, point 7 globally)
      // puzzle-g03-point-02 -> "puzzle-g03-point-02", "8", "2", "02"
      // puzzle-g03-point-03 -> "puzzle-g03-point-03", "9", "3", "03"
      if (targetPoint === 'puzzle-g03-point-01' && (qPoint === '7' || qPoint === '1' || qPoint === '01' || qClean === 'puzzleg03point01' || qClean === 'puzzleg03point1')) return true;
      if (targetPoint === 'puzzle-g03-point-02' && (qPoint === '8' || qPoint === '2' || qPoint === '02' || qClean === 'puzzleg03point02' || qClean === 'puzzleg03point2')) return true;
      if (targetPoint === 'puzzle-g03-point-03' && (qPoint === '9' || qPoint === '3' || qPoint === '03' || qClean === 'puzzleg03point03' || qClean === 'puzzleg03point3')) return true;

      // 5. Fallback: match if q.puzzlePieceId matches piece ID or point ID
      if (q.puzzlePieceId && q.puzzlePieceId === targetPoint) return true;

      return false;
    };

    const matchingQuestions = galleryQuestions.filter(isMatchingPoint);

    // Requirement 14: If multiple active questions exist for the same puzzle_point_id:
    // - use question_order to determine the first applicable question
    // - log a development warning indicating duplicate questions exist for that Puzzle Point
    if (matchingQuestions.length > 1) {
      matchingQuestions.sort((a, b) => {
        const orderA = a.questionOrder ?? 9999;
        const orderB = b.questionOrder ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        return a.id.localeCompare(b.id);
      });
      console.warn(
        `[ContentService] Duplicate active questions found for puzzle point "${puzzlePointId}" in gallery "${galleryId}". Found ${matchingQuestions.length} active questions. Selecting question with question_order ${matchingQuestions[0].questionOrder ?? 1} (question_id: "${matchingQuestions[0].id}").`
      );
      return matchingQuestions[0];
    }

    if (matchingQuestions.length === 1) {
      return matchingQuestions[0];
    }

    // Requirement 13: If a Puzzle Point has no matching question in Google Sheets:
    // - do not crash
    // - keep the application stable
    // - show a clear development warning in the console
    // - the Puzzle Point should not incorrectly award a puzzle piece
    console.warn(
      `[ContentService] No active matching question found in Google Sheets for puzzle point "${puzzlePointId}" in gallery "${galleryId}".`
    );
    return null;
  }

  /**
   * Get all loaded stars
   */
  getStars(): StarContent[] {
    return this.currentData?.stars || [];
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
  getStarForStarPoint(starPointId: string, galleryId?: string): StarContent | null {
    if (!starPointId) return null;
    const stars = this.getStars();

    if (!stars || stars.length === 0) {
      console.warn(
        `[ContentService] No stars data loaded in cache when resolving Star Point "${starPointId}".`
      );
      return null;
    }

    const activeStars = stars.filter((s) => s.active !== false);
    const canonGalleryId = galleryId ? normalizeGalleryId(galleryId) : null;

    const isMatchingStar = (star: StarContent): boolean => {
      const starId = (star.starId || star.id || '').trim();
      const target = starPointId.trim();

      // Gallery verification:
      // "The Star's gallery_id must also be respected. A Star Point must not display content belonging to another gallery."
      if (canonGalleryId && star.galleryId) {
        const starGallery = normalizeGalleryId(star.galleryId);
        // Gallery 01 Architectural Hall in game maps to gallery_id 2 or 1 in Google Sheets
        const isG01Compatible =
          canonGalleryId === 'gallery-01' && (starGallery === 'gallery-01' || starGallery === 'gallery-02');
        const isG02Compatible =
          canonGalleryId === 'gallery-02' && starGallery === 'gallery-02';
        const isExactMatch = starGallery === canonGalleryId;

        if (!isG01Compatible && !isG02Compatible && !isExactMatch) {
          return false;
        }
      }

      // 1. Direct match (e.g. item.starId === starPoint.id)
      if (starId.toLowerCase() === target.toLowerCase()) return true;

      // 2. Normalized alphanumeric match (e.g. "star01" === "star01")
      const starClean = starId.toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetClean = target.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (starClean === targetClean && starClean.length > 0) return true;

      // 3. Numeric extraction match (e.g. target "star-01" -> 1 matches star "1", "01", "star-1")
      const extractNumeric = (s: string): number | null => {
        if (/^\d+$/.test(s)) return parseInt(s, 10);
        const m = s.match(/(?:star|artwork|col)?[-_]?(\d+)/i);
        if (m && m[1]) return parseInt(m[1], 10);
        return null;
      };

      const targetNum = extractNumeric(target);
      const starNum = extractNumeric(starId);

      if (targetNum !== null && starNum !== null && targetNum === starNum) {
        return true;
      }

      // 4. Map configuration alias matching for existing points
      if (target.toLowerCase() === 'artwork-01' && starNum === 1) return true;
      if (target.toLowerCase() === 'artwork-g03-star' && starNum === 3) return true;
      if (target.toLowerCase() === 'col-01' && starNum === 1) return true;

      return false;
    };

    const matchingStars = activeStars.filter(isMatchingStar);

    // Duplicate star_id handling:
    // - log a development warning
    // - use a deterministic record
    // - do not silently merge unrelated Star records
    if (matchingStars.length > 1) {
      console.warn(
        `[ContentService] Duplicate star_id records exist for Star Point "${starPointId}" in gallery "${galleryId || 'all'}" (found ${matchingStars.length} records). Using deterministic record with id "${matchingStars[0].id}".`
      );
      return matchingStars[0];
    }

    if (matchingStars.length === 1) {
      return matchingStars[0];
    }

    // No matching record found:
    // - do not crash
    // - log a clear console warning containing the Star Point ID
    // - do not silently fall back to the first Star record
    // - do not display another Star's content
    console.warn(
      `[ContentService] No matching Star record found for Star Point id "${starPointId}" in gallery "${galleryId || 'all'}".`
    );
    return null;
  }

  /**
   * Get all loaded artworks
   */
  getArtworks(): ArtworkContent[] {
    return this.currentData?.artworks || [];
  }

  /**
   * Get all loaded galleries from the Google Sheets 'Galleries' tab
   */
  getGalleries(): GalleryContent[] {
    return this.currentData?.galleries || [];
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
    if (!matched) {
      const targetNum = galleryId.replace(/[^0-9]/g, '');
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
      },
      hasLocalCache: contentCache.has(),
    };
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
    getGalleryById: (id: string) => service.getGalleryById(id),
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

