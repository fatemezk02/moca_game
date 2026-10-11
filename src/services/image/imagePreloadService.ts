/**
 * Progressive Background Image Preload Service for TMOCA Museum Game PWA
 *
 * Responsibilities:
 * 1. Progressively preloads images for puzzle questions, puzzle answer options,
 *    star discovery artworks, final assembled puzzle artworks, and popups.
 * 2. Starts loading as soon as image URLs become available (from local cache/seed,
 *    then reconciles with live Google Sheets).
 * 3. Uses a controlled concurrent queue (default 3 concurrent requests).
 * 4. Deduplicates requests by normalized URL and prevents redundant downloads.
 * 5. Prioritizes the player's current gallery and immediately prioritizes
 *    images needed by an actively opened modal (urgent priority).
 * 6. Handles failures with limited retries and backoff delays, avoiding continuous loops.
 * 7. Pauses on offline connectivity and resumes when online; respects Data Saver.
 * 8. Never blocks gameplay, modal opening, or user interactions.
 * 9. Reusable and clean; exposes window.__IMAGE_PRELOAD_DEBUG__ for DevTools verification.
 */

import { contentService } from '../content/contentService';
import { normalizeGalleryId } from '../content/mappers';
import { getStarDiscovery } from '../../data/starDiscoveryData';
import { getGalleryPuzzleArtworkSrc } from '../../data/galleryPuzzleConfig';
import { getGalleryPoints } from '../../data/mapConfig';
import { CANONICAL_PROGRESSION_SEQUENCE } from '../../data/reachedGalleriesStore';

export type PreloadStatus = 'queued' | 'loading' | 'loaded' | 'failed';

export type PreloadSourceType =
  | 'puzzle_artwork'
  | 'puzzle_option'
  | 'star_artwork'
  | 'gallery_assembled'
  | 'popup'
  | 'other';

export interface PreloadItem {
  url: string;
  normalizedUrl: string;
  priority: number; // 1 = Urgent (Active modal), 2 = High (Current gallery), 3 = Normal (Other galleries)
  galleryId?: string;
  sourceType: PreloadSourceType;
  status: PreloadStatus;
  attempts: number;
  addedAt: number;
  lastAttemptAt?: number;
  completedAt?: number;
  error?: string;
}

export interface PreloadStats {
  total: number;
  queued: number;
  loading: number;
  loaded: number;
  failed: number;
  maxConcurrent: number;
  isOnline: boolean;
  currentGalleryId: string;
}

const DEFAULT_MAX_CONCURRENT = 3;
const MAX_RETRIES = 2; // Total 3 attempts (1 initial + 2 retries)
const RETRY_BASE_DELAY_MS = 2000;
const IMAGE_LOAD_TIMEOUT_MS = 15000;

export const PRIORITY_URGENT = 1;
export const PRIORITY_HIGH = 2;
export const PRIORITY_NORMAL = 3;

export function normalizeImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.toLowerCase() === 'none' ||
    trimmed === '""' ||
    trimmed === "''"
  ) {
    return null;
  }
  // Exclude data URIs and empty placeholders
  if (trimmed.startsWith('data:')) return null;
  // Must be valid HTTP/HTTPS or absolute path
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    return null;
  }
  return trimmed;
}

class ImagePreloadService {
  private itemsByUrl: Map<string, PreloadItem> = new Map();
  private queue: PreloadItem[] = [];
  private activeDownloads: Map<string, PreloadItem> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  private maxConcurrent = DEFAULT_MAX_CONCURRENT;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
  private currentGalleryId = 'gallery-01';
  private hasInitialized = false;

  constructor() {
    this.setupNetworkListeners();
    this.adjustConcurrencyForNetwork();
    this.registerGlobalDebug();
  }

  /**
   * Set up network online/offline listeners to pause and resume preloading
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.info('[ImagePreloader] Connectivity restored. Resuming queue.');
      this.isOnline = true;
      this.adjustConcurrencyForNetwork();
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.warn('[ImagePreloader] Connectivity lost. Pausing background preloading.');
      this.isOnline = false;
    });

    // Check if network conditions change (e.g. 4G to 2G)
    const navConn = (navigator as any)?.connection || (navigator as any)?.mozConnection || (navigator as any)?.webkitConnection;
    if (navConn && typeof navConn.addEventListener === 'function') {
      navConn.addEventListener('change', () => {
        this.adjustConcurrencyForNetwork();
      });
    }
  }

  /**
   * Dynamically adjusts concurrency based on Network Information API
   */
  private adjustConcurrencyForNetwork(): void {
    if (typeof navigator === 'undefined') return;
    const navConn = (navigator as any)?.connection || (navigator as any)?.mozConnection || (navigator as any)?.webkitConnection;
    if (!navConn) {
      this.maxConcurrent = DEFAULT_MAX_CONCURRENT;
      return;
    }

    // If user has Data Saver enabled or very slow connection, limit to 1 concurrent request
    if (navConn.saveData === true || navConn.effectiveType === 'slow-2g' || navConn.effectiveType === '2g') {
      this.maxConcurrent = 1;
    } else {
      this.maxConcurrent = DEFAULT_MAX_CONCURRENT;
    }
  }

  /**
   * Updates the current active gallery and elevates its queued images to high priority
   */
  public setCurrentGallery(rawGalleryId: string): void {
    if (!rawGalleryId) return;
    const canon = normalizeGalleryId(rawGalleryId);
    if (!canon || canon === this.currentGalleryId) return;

    this.currentGalleryId = canon;

    // Reprioritize items in queue
    let reprioritized = false;
    for (const item of this.queue) {
      if (item.galleryId) {
        const itemCanon = normalizeGalleryId(item.galleryId);
        if (itemCanon === canon && item.priority > PRIORITY_HIGH) {
          item.priority = PRIORITY_HIGH;
          reprioritized = true;
        } else if (itemCanon !== canon && item.priority === PRIORITY_HIGH) {
          item.priority = PRIORITY_NORMAL;
          reprioritized = true;
        }
      }
    }

    if (reprioritized) {
      this.sortQueue();
      this.processQueue();
    }
  }

  /**
   * Adds an image URL to the preload queue if valid and not already loaded
   */
  public enqueue(
    rawUrl: string,
    sourceType: PreloadSourceType,
    galleryId?: string,
    priority: number = PRIORITY_NORMAL
  ): boolean {
    const normalized = normalizeImageUrl(rawUrl);
    if (!normalized) return false;

    // Check if already registered
    const existing = this.itemsByUrl.get(normalized);
    if (existing) {
      // If already loaded or currently downloading, just boost priority if needed
      if (priority < existing.priority) {
        existing.priority = priority;
        if (galleryId && !existing.galleryId) {
          existing.galleryId = galleryId;
        }
        this.sortQueue();
        this.processQueue();
      }
      return false;
    }

    const item: PreloadItem = {
      url: rawUrl,
      normalizedUrl: normalized,
      priority,
      galleryId,
      sourceType,
      status: 'queued',
      attempts: 0,
      addedAt: Date.now(),
    };

    this.itemsByUrl.set(normalized, item);
    this.queue.push(item);
    this.sortQueue();
    this.processQueue();
    return true;
  }

  /**
   * Immediately prioritizes a single image (e.g. when user clicks/opens a modal)
   */
  public prioritize(rawUrl?: string | null, galleryId?: string): void {
    const normalized = normalizeImageUrl(rawUrl);
    if (!normalized) return;

    const existing = this.itemsByUrl.get(normalized);
    if (existing) {
      if (existing.status === 'loaded') {
        // Already loaded, nothing to do
        return;
      }
      if (existing.status === 'failed') {
        // Reset attempts to allow a fresh immediate try
        existing.attempts = 0;
        existing.status = 'queued';
        this.queue.push(existing);
      }
      existing.priority = PRIORITY_URGENT;
      this.sortQueue();
      this.processQueue();
      return;
    }

    // If not known yet, enqueue immediately with URGENT priority
    this.enqueue(normalized, 'other', galleryId, PRIORITY_URGENT);
  }

  /**
   * Extracts and queues all images for a specific gallery
   */
  public queueGalleryImages(galleryId: string, isCurrentGallery: boolean): number {
    const canon = normalizeGalleryId(galleryId);
    if (!canon) return 0;

    const priority = isCurrentGallery ? PRIORITY_HIGH : PRIORITY_NORMAL;
    let count = 0;

    // 1. Puzzle Questions for this gallery
    const allQuestions = contentService.getQuestions() || [];
    const questions = allQuestions.filter(
      (q) => normalizeGalleryId(q.galleryId) === canon
    );
    for (const q of questions) {
      // Question artwork image
      if (q.artworkId) {
        const artwork = contentService.getArtworkById(q.artworkId);
        if (artwork?.imageUrl) {
          if (this.enqueue(artwork.imageUrl, 'puzzle_artwork', canon, priority)) {
            count++;
          }
        }
      }

      // Option images (options 1, 2, 3)
      const opt1 = q.option_1_image || q.optionImages?.[0];
      const opt2 = q.option_2_image || q.optionImages?.[1];
      const opt3 = q.option_3_image || q.optionImages?.[2];

      if (opt1 && this.enqueue(opt1, 'puzzle_option', canon, priority)) count++;
      if (opt2 && this.enqueue(opt2, 'puzzle_option', canon, priority)) count++;
      if (opt3 && this.enqueue(opt3, 'puzzle_option', canon, priority)) count++;

      // Check rawFields for additional column aliases (e.g. option1image, opt1image)
      if (q.rawFields) {
        for (const [k, v] of Object.entries(q.rawFields)) {
          const normKey = k.toLowerCase().replace(/[\s_\-]/g, '');
          if (/^(?:opt|option)[123]image$/.test(normKey)) {
            if (typeof v === 'string' && this.enqueue(v, 'puzzle_option', canon, priority)) {
              count++;
            }
          }
        }
      }
    }

    // 2. Final Assembled Gallery Puzzle Artwork
    const puzzleArtworkSrc =
      contentService.getGalleryPuzzleArtworkSrc(galleryId) ||
      getGalleryPuzzleArtworkSrc(galleryId) ||
      getGalleryPuzzleArtworkSrc(canon);
    if (puzzleArtworkSrc && this.enqueue(puzzleArtworkSrc, 'gallery_assembled', canon, priority)) {
      count++;
    }

    // 3. Star Discovery Artwork Images for this gallery
    // 3a. Stars from ContentService
    const allStars = contentService.getStars() || [];
    const stars = allStars.filter(
      (s) => normalizeGalleryId(s.galleryId) === canon
    );
    for (const star of stars) {
      const discovery = getStarDiscovery(star.id, galleryId, star.starId);
      const img = discovery?.information?.image || discovery?.discoveryArtwork?.image;
      if (img && this.enqueue(img, 'star_artwork', canon, priority)) {
        count++;
      }
    }

    // 3b. Star Collection Points from mapConfig for this gallery
    try {
      const mapPoints = getGalleryPoints(galleryId) || [];
      for (const pt of mapPoints) {
        if (pt.type === 'collection' && (pt as any).pointType === 'star') {
          const starId = (pt as any).starId || pt.id;
          const discovery = getStarDiscovery(pt.id, galleryId, starId);
          const img = discovery?.information?.image || discovery?.discoveryArtwork?.image;
          if (img && this.enqueue(img, 'star_artwork', canon, priority)) {
            count++;
          }
        }
      }
    } catch {
      // ignore
    }

    // 4. Contextual Popups for this gallery
    try {
      const popups = contentService.getActivePopupsForGallery(galleryId) || [];
      for (const pop of popups) {
        if (pop.picture && this.enqueue(pop.picture, 'popup', canon, priority)) {
          count++;
        }
      }
    } catch {
      // ignore
    }

    return count;
  }

  /**
   * Discovers and enqueues images across all galleries, starting with the current gallery
   */
  public syncFromContent(currentGalleryId?: string): void {
    if (currentGalleryId) {
      this.currentGalleryId = normalizeGalleryId(currentGalleryId) || this.currentGalleryId;
    }

    // First: Prioritize current gallery
    let totalQueued = this.queueGalleryImages(this.currentGalleryId, true);

    // Second: Progressively queue images for other canonical galleries
    for (const gid of CANONICAL_PROGRESSION_SEQUENCE) {
      if (gid === 'gallery_00') continue; // master map has no puzzles/stars
      if (normalizeGalleryId(gid) === this.currentGalleryId) continue;
      totalQueued += this.queueGalleryImages(gid, false);
    }

    if (!this.hasInitialized) {
      this.hasInitialized = true;
      console.info(
        `[ImagePreloader] Progressive background preloading initialized. Total tracked: ${this.itemsByUrl.size} images. (Active Priority: ${this.currentGalleryId})`
      );
    }

    this.processQueue();
  }

  /**
   * Sorts the queue by priority (Urgent 1 -> High 2 -> Normal 3), then by attempts, then FIFO
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      if (a.attempts !== b.attempts) {
        return a.attempts - b.attempts;
      }
      return a.addedAt - b.addedAt;
    });
  }

  /**
   * Main queue processing loop
   */
  private processQueue(): void {
    // If offline, pause new downloads
    if (!this.isOnline) return;

    while (this.activeDownloads.size < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      // Skip if already loaded or currently downloading
      if (item.status === 'loaded' || this.activeDownloads.has(item.normalizedUrl)) {
        continue;
      }

      this.startDownload(item);
    }
  }

  /**
   * Executes a single image preload download using standard browser Image loading
   */
  private startDownload(item: PreloadItem): void {
    item.status = 'loading';
    item.lastAttemptAt = Date.now();
    this.activeDownloads.set(item.normalizedUrl, item);

    if (typeof window === 'undefined') {
      this.onDownloadComplete(item, true);
      return;
    }

    let isSettled = false;
    const img = new Image();
    img.referrerPolicy = 'no-referrer';

    // Timeout safety to ensure stalled images never block the queue slot
    const timeoutId = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      try {
        img.src = '';
      } catch {
        // ignore
      }
      this.onDownloadComplete(item, false, 'Preload request timed out (15s)');
    }, IMAGE_LOAD_TIMEOUT_MS);

    img.onload = async () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeoutId);

      // Trigger asynchronous off-thread decode if supported so rendering has 0ms latency
      if ('decode' in img && typeof img.decode === 'function') {
        try {
          await img.decode();
        } catch {
          // Decode errors do not invalidate the cached image resource
        }
      }

      this.onDownloadComplete(item, true);
    };

    img.onerror = () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeoutId);
      this.onDownloadComplete(item, false, 'Image network error or 404');
    };

    // Check if the image is already available in the browser's HTTP/memory cache synchronously
    try {
      img.src = item.normalizedUrl;
      if (img.complete && img.naturalWidth > 0) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutId);
          this.onDownloadComplete(item, true);
        }
      }
    } catch (err: any) {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timeoutId);
        this.onDownloadComplete(item, false, err?.message || 'Exception during img.src assign');
      }
    }
  }

  /**
   * Handles download completion (success or failure)
   */
  private onDownloadComplete(item: PreloadItem, success: boolean, errorMsg?: string): void {
    this.activeDownloads.delete(item.normalizedUrl);

    if (success) {
      item.status = 'loaded';
      item.completedAt = Date.now();
      item.error = undefined;
      // Clear any pending retry timer
      if (this.retryTimeouts.has(item.normalizedUrl)) {
        clearTimeout(this.retryTimeouts.get(item.normalizedUrl)!);
        this.retryTimeouts.delete(item.normalizedUrl);
      }
    } else {
      item.attempts += 1;
      item.error = errorMsg;

      if (item.attempts <= MAX_RETRIES && this.isOnline) {
        // Schedule retry with backoff delay
        const delay = RETRY_BASE_DELAY_MS * item.attempts;
        item.status = 'queued';

        const t = setTimeout(() => {
          this.retryTimeouts.delete(item.normalizedUrl);
          // Only re-enqueue if still queued and not loaded
          if (item.status === 'queued') {
            this.queue.push(item);
            this.sortQueue();
            this.processQueue();
          }
        }, delay);

        this.retryTimeouts.set(item.normalizedUrl, t);
      } else {
        item.status = 'failed';
        console.warn(
          `[ImagePreloader] Preload failed after ${item.attempts} attempts for: ${item.normalizedUrl} (${errorMsg || 'unknown'})`
        );
      }
    }

    // Process next item in queue
    this.processQueue();
  }

  /**
   * Check whether a specific image is already preloaded / loaded
   */
  public isLoaded(rawUrl?: string | null): boolean {
    const normalized = normalizeImageUrl(rawUrl);
    if (!normalized) return false;
    return this.itemsByUrl.get(normalized)?.status === 'loaded';
  }

  /**
   * Get current summary statistics of the preloader
   */
  public getStats(): PreloadStats {
    let queued = 0;
    let loading = 0;
    let loaded = 0;
    let failed = 0;

    for (const item of this.itemsByUrl.values()) {
      if (item.status === 'queued') queued++;
      else if (item.status === 'loading') loading++;
      else if (item.status === 'loaded') loaded++;
      else if (item.status === 'failed') failed++;
    }

    return {
      total: this.itemsByUrl.size,
      queued,
      loading,
      loaded,
      failed,
      maxConcurrent: this.maxConcurrent,
      isOnline: this.isOnline,
      currentGalleryId: this.currentGalleryId,
    };
  }

  /**
   * Exposes global debug helper on window
   */
  private registerGlobalDebug(): void {
    if (typeof window === 'undefined') return;

    (window as any).__IMAGE_PRELOAD_DEBUG__ = {
      getStats: () => this.getStats(),
      getItems: () => Array.from(this.itemsByUrl.values()),
      getQueue: () => [...this.queue],
      getActive: () => Array.from(this.activeDownloads.values()),
      prioritize: (url: string) => this.prioritize(url),
      retryFailed: () => {
        let count = 0;
        for (const item of this.itemsByUrl.values()) {
          if (item.status === 'failed') {
            item.status = 'queued';
            item.attempts = 0;
            this.queue.push(item);
            count++;
          }
        }
        this.sortQueue();
        this.processQueue();
        return `Re-queued ${count} failed images for retry.`;
      },
      sync: () => {
        this.syncFromContent(this.currentGalleryId);
        return this.getStats();
      },
    };
  }
}

export const imagePreloadService = new ImagePreloadService();
