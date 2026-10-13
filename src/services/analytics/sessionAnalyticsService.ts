/**
 * Anonymous Game-Session Analytics Service
 *
 * Measures game usage and session duration using Google Apps Script Web App.
 * - Anonymous persistent Player ID (P-xxxxxxxx) surviving game resets.
 * - Unique Session ID (S-xxxxxxxx) refreshed on every new game / reset.
 * - Active play time tracked strictly when document.visibilityState === "visible".
 * - Primary direct events sent immediately:
 *     A) "visit_gallery"
 *     B) "answer_puzzle"
 *     C) "answer_star"
 * - Heartbeat sent every 30 seconds of active visibility as secondary backup.
 * - Canonical gallery IDs (01 to 08).
 * - Visited galleries list (canonical IDs in order of first entry, no duplicates).
 * - Answered puzzles list (stable puzzle IDs, no duplicates).
 * - Answered stars list (stable star IDs, no duplicates).
 * - Simple device category (mobile, tablet, desktop).
 * - No personal data, quiz answers, or game secrets collected.
 */

import { getCurrentGalleryId } from '../../data/playerLocationStore';

const APPS_SCRIPT_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyr6TToD0Z52TVhxCs2MurPX7j4j_MwJXzf8KLuH5JxKP-9dV6s_k0BJdzDLxnmyJkF/exec';

const PLAYER_ID_STORAGE_KEY = 'museum_analytics_player_id';
const SESSION_ID_STORAGE_KEY = 'museum_analytics_session_id';
const ACTIVE_SECONDS_STORAGE_KEY = 'museum_analytics_active_seconds';
const VISITED_GALLERIES_STORAGE_KEY = 'museum_analytics_visited_galleries';
const ANSWERED_PUZZLES_STORAGE_KEY = 'museum_analytics_answered_puzzles';
const ANSWERED_STARS_STORAGE_KEY = 'museum_analytics_answered_stars';
const OPENED_PUZZLES_STORAGE_KEY = 'museum_analytics_opened_puzzles';
const OPENED_STARS_STORAGE_KEY = 'museum_analytics_opened_stars';

export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';
export type CanonicalGalleryId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';
export type AnalyticsAction =
  | 'start'
  | 'heartbeat'
  | 'end'
  | 'visit_gallery'
  | 'answer_puzzle'
  | 'answer_star'
  | 'open_puzzle'
  | 'open_star';

export interface AnalyticsPayload {
  action: AnalyticsAction;
  session_id: string;
  player_id: string;
  timestamp: string;
  gallery_id?: CanonicalGalleryId;
  puzzle_id?: string;
  star_id?: string;
  active_seconds?: number;
  last_gallery?: CanonicalGalleryId;
  device?: DeviceCategory;
  visited_galleries?: CanonicalGalleryId[];
  answered_puzzles?: string[];
  answered_stars?: string[];
  opened_puzzles?: string[];
  opened_stars?: string[];
}

/**
 * Generate a random 8-character hex string
 */
function generateRandomHex(length = 8): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, length);
  }
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Retrieves or generates an anonymous persistent player ID: P-xxxxxxxx
 * Persists in localStorage across game resets.
 */
export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'P-' + generateRandomHex(8);
  }

  try {
    let id = localStorage.getItem(PLAYER_ID_STORAGE_KEY);
    if (!id || !/^P-[a-z0-9]{6,12}$/i.test(id)) {
      id = 'P-' + generateRandomHex(8);
      localStorage.setItem(PLAYER_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'P-' + generateRandomHex(8);
  }
}

/**
 * Creates a new unique session ID: S-xxxxxxxx
 */
export function createNewSessionId(): string {
  const id = 'S-' + generateRandomHex(8);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(SESSION_ID_STORAGE_KEY, id);
    }
  } catch {}
  return id;
}

/**
 * Determines device category: mobile | tablet | desktop
 * Without collecting fingerprints or personal information.
 */
export function getDeviceCategory(): DeviceCategory {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'desktop';
  }

  const ua = (navigator.userAgent || '').toLowerCase();

  // Tablet check
  const isTablet =
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth >= 768 && window.innerWidth <= 1024);

  if (isTablet) return 'tablet';

  // Mobile check
  const isMobile =
    /(mobi|ipod|iphone|android.*mobile|blackberry|iemobile|opera mini)/i.test(ua) ||
    (window.innerWidth < 768 && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window));

  if (isMobile) return 'mobile';

  return 'desktop';
}

/**
 * Maps any gallery route/identifier to canonical gallery ID: 01, 02, 03, 04, 05, 06, 07, 08.
 * Does not use array indexes, route index, component filename, or old gallery numbering.
 */
export function getCanonicalGalleryId(rawGalleryId?: string | null): CanonicalGalleryId | null {
  if (!rawGalleryId) return null;
  const target = rawGalleryId.trim().toLowerCase();

  // Map / lobby is not one of the exhibition galleries
  if (target === 'gallery-00' || target === 'gallery_00' || target === 'main-map') {
    return null;
  }

  // Gallery 01 (کیمیای نور)
  if (
    target === 'gallery-01' ||
    target === 'gallery-01-questions' ||
    target === 'gallery_01' ||
    target === '01' ||
    target === '1'
  ) {
    return '01';
  }

  // Gallery 02 (آلبوم‌های دیپلماتیک / Gallery03View in legacy code)
  if (
    target === 'gallery-03' ||
    target === 'gallery-03-questions' ||
    target === 'gallery-02' ||
    target === 'gallery_02' ||
    target === '02' ||
    target === '2'
  ) {
    return '02';
  }

  // Gallery 03 (ثبت دوام ما / Gallery04View in legacy code)
  if (
    target === 'gallery-04' ||
    target === 'gallery_03' ||
    target === '03' ||
    target === '3'
  ) {
    return '03';
  }

  // Gallery 04 (ضرب‌آهنگ شهر / Gallery05View in legacy code)
  if (
    target === 'gallery-05' ||
    target === 'gallery_04' ||
    target === '04' ||
    target === '4'
  ) {
    return '04';
  }

  // Gallery 05 (در کشاکش تماشا و استیلا / Gallery06View in legacy code)
  if (
    target === 'gallery-06' ||
    target === 'gallery_05' ||
    target === '05' ||
    target === '5'
  ) {
    return '05';
  }

  // Gallery 06 (گذر از برون به درون / Gallery07View in legacy code)
  if (
    target === 'gallery-07' ||
    target === 'gallery_06' ||
    target === '06' ||
    target === '6'
  ) {
    return '06';
  }

  // Gallery 07 (آونگ زمان / Gallery08View in legacy code)
  if (
    target === 'gallery-08' ||
    target === 'gallery_07' ||
    target === '07' ||
    target === '7'
  ) {
    return '07';
  }

  // Gallery 08 (تلاقی رسانه‌ها / Gallery09View in legacy code)
  if (
    target === 'gallery-09' ||
    target === 'gallery_08' ||
    target === 'gallery_09' ||
    target === '08' ||
    target === '8'
  ) {
    return '08';
  }

  // Fallback: search for numbers 1-8
  const m = target.match(/0*([1-8])$/);
  if (m) {
    return m[1].padStart(2, '0') as CanonicalGalleryId;
  }

  return null;
}

class SessionAnalyticsService {
  private playerId: string = '';
  private sessionId: string | null = null;
  private isSessionActive: boolean = false;
  private currentGallery: string = 'gallery-01';

  // Visited galleries, answered questions & opened points state
  private visitedGalleries: CanonicalGalleryId[] = [];
  private answeredPuzzles: string[] = [];
  private answeredStars: string[] = [];
  private openedPuzzles: string[] = [];
  private openedStars: string[] = [];

  // Active time tracking
  private accumulatedActiveSeconds: number = 0;
  private visibleStartTime: number | null = null;
  private lastHeartbeatActiveSeconds: number = 0;
  private lastExitSentTime: number = 0;

  // Interval ticker
  private tickIntervalId: any = null;
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize window listeners, player ID, and restore session lists
   */
  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    this.playerId = getOrCreatePlayerId();
    this.loadPersistedSessionData();

    // Listen for Page Visibility API changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    const handleExit = () => {
      this.handlePageExit();
    };

    // Send final payload on page exit without duplicating requests
    window.addEventListener('pagehide', handleExit);
    window.addEventListener('beforeunload', handleExit);

    // Listen for gallery location updates
    window.addEventListener('museum_player_location_updated', (e: any) => {
      const gid = e?.detail?.currentGalleryId;
      if (gid) {
        this.updateGallery(gid);
      }
    });

    // Listen for full game reset
    window.addEventListener('museum_game_fully_reset', () => {
      this.handleGameReset();
    });
  }

  /**
   * Loads persisted lists, active seconds, and session ID from sessionStorage
   */
  private loadPersistedSessionData(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const existingSession = sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
        if (existingSession && /^S-[a-z0-9]{6,12}$/i.test(existingSession)) {
          this.sessionId = existingSession;
        }

        const savedActiveSec = sessionStorage.getItem(ACTIVE_SECONDS_STORAGE_KEY);
        if (savedActiveSec) {
          const sec = parseInt(savedActiveSec, 10);
          if (!isNaN(sec) && sec >= 0) {
            this.accumulatedActiveSeconds = sec;
            this.lastHeartbeatActiveSeconds = sec;
          }
        }

        const savedVisited = sessionStorage.getItem(VISITED_GALLERIES_STORAGE_KEY);
        if (savedVisited) {
          const parsed = JSON.parse(savedVisited);
          if (Array.isArray(parsed)) {
            this.visitedGalleries = parsed;
          }
        }

        const savedPuzzles = sessionStorage.getItem(ANSWERED_PUZZLES_STORAGE_KEY);
        if (savedPuzzles) {
          const parsed = JSON.parse(savedPuzzles);
          if (Array.isArray(parsed)) {
            this.answeredPuzzles = parsed;
          }
        }

        const savedStars = sessionStorage.getItem(ANSWERED_STARS_STORAGE_KEY);
        if (savedStars) {
          const parsed = JSON.parse(savedStars);
          if (Array.isArray(parsed)) {
            this.answeredStars = parsed;
          }
        }

        const savedOpenedPuzzles = sessionStorage.getItem(OPENED_PUZZLES_STORAGE_KEY);
        if (savedOpenedPuzzles) {
          const parsed = JSON.parse(savedOpenedPuzzles);
          if (Array.isArray(parsed)) {
            this.openedPuzzles = parsed;
          }
        }

        const savedOpenedStars = sessionStorage.getItem(OPENED_STARS_STORAGE_KEY);
        if (savedOpenedStars) {
          const parsed = JSON.parse(savedOpenedStars);
          if (Array.isArray(parsed)) {
            this.openedStars = parsed;
          }
        }
      }
    } catch {
      // Safe fallback
    }
  }

  /**
   * Persists session lists and accumulated active seconds locally to survive rerenders, unmounts, and reloads
   */
  private persistSessionData(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (this.sessionId) {
          sessionStorage.setItem(SESSION_ID_STORAGE_KEY, this.sessionId);
        }
        sessionStorage.setItem(
          ACTIVE_SECONDS_STORAGE_KEY,
          String(this.getActiveSeconds())
        );
        sessionStorage.setItem(
          VISITED_GALLERIES_STORAGE_KEY,
          JSON.stringify(this.visitedGalleries)
        );
        sessionStorage.setItem(
          ANSWERED_PUZZLES_STORAGE_KEY,
          JSON.stringify(this.answeredPuzzles)
        );
        sessionStorage.setItem(
          ANSWERED_STARS_STORAGE_KEY,
          JSON.stringify(this.answeredStars)
        );
        sessionStorage.setItem(
          OPENED_PUZZLES_STORAGE_KEY,
          JSON.stringify(this.openedPuzzles)
        );
        sessionStorage.setItem(
          OPENED_STARS_STORAGE_KEY,
          JSON.stringify(this.openedStars)
        );
      }
    } catch {
      // Safe fallback
    }
  }

  /**
   * Retrieves current session ID or resumes existing one from sessionStorage
   */
  public getOrCreateSessionId(): string {
    if (this.sessionId) return this.sessionId;

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const existing = sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
        if (existing && /^S-[a-z0-9]{6,12}$/i.test(existing)) {
          this.sessionId = existing;
          return existing;
        }
      }
    } catch {}

    const newId = createNewSessionId();
    this.sessionId = newId;
    return newId;
  }

  /**
   * =========================================================================
   * 2. VISITED GALLERY (Action: visit_gallery)
   * =========================================================================
   * When the player ACTUALLY enters a gallery:
   * Sends immediately:
   *   { action: "visit_gallery", session_id, player_id, gallery_id, timestamp }
   * Uses CURRENT CANONICAL gallery ID: 01, 02, 03, 04, 05, 06, 07, 08.
   * If visited again in same session: no duplicate.
   */
  public recordVisitedGallery(rawGalleryId?: string | null): void {
    if (!rawGalleryId) return;
    const canonicalId = getCanonicalGalleryId(rawGalleryId);
    if (!canonicalId) return;

    const isNew = !this.visitedGalleries.includes(canonicalId);
    if (isNew) {
      this.visitedGalleries.push(canonicalId);
      this.persistSessionData();
    }

    const currentSessionId = this.getOrCreateSessionId();
    const playerId = this.getPlayerId();
    const timestamp = new Date().toISOString();
    const activeSeconds = this.getActiveSeconds();

    // 11. FRONTEND EVENT LOGGING
    console.log('[ANALYTICS] visit_gallery', {
      session_id: currentSessionId,
      gallery_id: canonicalId,
      active_seconds: activeSeconds,
    });

    // Send immediately to Apps Script
    this.sendImmediateEventRequest({
      action: 'visit_gallery',
      session_id: currentSessionId,
      player_id: playerId,
      gallery_id: canonicalId,
      active_seconds: activeSeconds,
      timestamp,
    });
  }

  /**
   * =========================================================================
   * 3. PUZZLE ANSWER (Action: answer_puzzle)
   * =========================================================================
   * When the user ACTUALLY submits an answer to a Puzzle:
   * Sends immediately:
   *   { action: "answer_puzzle", session_id, player_id, puzzle_id, active_seconds, timestamp }
   * Uses REAL stable Puzzle ID from the Puzzle currently being answered.
   * If answered multiple times: stores only once.
   */
  public recordAnsweredPuzzle(puzzleId?: string | null): void {
    if (!puzzleId || typeof puzzleId !== 'string') return;
    const cleanId = puzzleId.trim();
    if (!cleanId) return;

    if (!this.answeredPuzzles.includes(cleanId)) {
      this.answeredPuzzles.push(cleanId);
      this.persistSessionData();
    }

    const currentSessionId = this.getOrCreateSessionId();
    const playerId = this.getPlayerId();
    const timestamp = new Date().toISOString();
    const activeSeconds = this.getActiveSeconds();

    // 11. FRONTEND EVENT LOGGING
    console.log('[ANALYTICS] answer_puzzle', {
      session_id: currentSessionId,
      puzzle_id: cleanId,
      active_seconds: activeSeconds,
    });

    // Send immediately to Apps Script
    this.sendImmediateEventRequest({
      action: 'answer_puzzle',
      session_id: currentSessionId,
      player_id: playerId,
      puzzle_id: cleanId,
      active_seconds: activeSeconds,
      timestamp,
      answered_puzzles: [...this.answeredPuzzles],
    });
  }

  /**
   * =========================================================================
   * 4. STAR ANSWER (Action: answer_star)
   * =========================================================================
   * When the user ACTUALLY submits an answer to a Star question:
   * Sends immediately:
   *   { action: "answer_star", session_id, player_id, star_id, active_seconds, timestamp }
   * Uses stable Star ID, e.g. star-20.
   * If answered multiple times: stores only once.
   */
  public recordAnsweredStar(starId?: string | null): void {
    if (!starId || typeof starId !== 'string') return;
    const cleanId = starId.trim();
    if (!cleanId) return;

    if (!this.answeredStars.includes(cleanId)) {
      this.answeredStars.push(cleanId);
      this.persistSessionData();
    }

    const currentSessionId = this.getOrCreateSessionId();
    const playerId = this.getPlayerId();
    const timestamp = new Date().toISOString();
    const activeSeconds = this.getActiveSeconds();

    // 11. FRONTEND EVENT LOGGING
    console.log('[ANALYTICS] answer_star', {
      session_id: currentSessionId,
      star_id: cleanId,
      active_seconds: activeSeconds,
    });

    // Send immediately to Apps Script
    this.sendImmediateEventRequest({
      action: 'answer_star',
      session_id: currentSessionId,
      player_id: playerId,
      star_id: cleanId,
      active_seconds: activeSeconds,
      timestamp,
      answered_stars: [...this.answeredStars],
    });
  }

  /**
   * =========================================================================
   * 5. PUZZLE OPEN (Action: open_puzzle)
   * =========================================================================
   * When the user ACTUALLY opens a Puzzle point modal:
   * Recorded into "opened_puzzles" distinct from "answered_puzzles".
   */
  public recordOpenedPuzzle(puzzleId?: string | null): void {
    if (!puzzleId || typeof puzzleId !== 'string') return;
    const cleanId = puzzleId.trim();
    if (!cleanId) return;

    if (!this.openedPuzzles.includes(cleanId)) {
      this.openedPuzzles.push(cleanId);
      this.persistSessionData();
    }

    const currentSessionId = this.getOrCreateSessionId();
    const playerId = this.getPlayerId();
    const timestamp = new Date().toISOString();
    const activeSeconds = this.getActiveSeconds();

    console.log('[ANALYTICS] open_puzzle', {
      session_id: currentSessionId,
      puzzle_id: cleanId,
      active_seconds: activeSeconds,
    });

    this.sendImmediateEventRequest({
      action: 'open_puzzle',
      session_id: currentSessionId,
      player_id: playerId,
      puzzle_id: cleanId,
      active_seconds: activeSeconds,
      timestamp,
    });
  }

  /**
   * =========================================================================
   * 6. STAR OPEN (Action: open_star)
   * =========================================================================
   * When the user ACTUALLY opens a Star point modal:
   * Recorded into "opened_stars" distinct from "answered_stars".
   */
  public recordOpenedStar(starId?: string | null): void {
    if (!starId || typeof starId !== 'string') return;
    const cleanId = starId.trim();
    if (!cleanId) return;

    if (!this.openedStars.includes(cleanId)) {
      this.openedStars.push(cleanId);
      this.persistSessionData();
    }

    const currentSessionId = this.getOrCreateSessionId();
    const playerId = this.getPlayerId();
    const timestamp = new Date().toISOString();
    const activeSeconds = this.getActiveSeconds();

    console.log('[ANALYTICS] open_star', {
      session_id: currentSessionId,
      star_id: cleanId,
      active_seconds: activeSeconds,
    });

    this.sendImmediateEventRequest({
      action: 'open_star',
      session_id: currentSessionId,
      player_id: playerId,
      star_id: cleanId,
      active_seconds: activeSeconds,
      timestamp,
    });
  }

  /**
   * Sends an immediate direct event request to Apps Script
   * Logs the response as required by Part 11 & 12.
   */
  private sendImmediateEventRequest(payload: {
    action: 'visit_gallery' | 'answer_puzzle' | 'answer_star' | 'open_puzzle' | 'open_star';
    session_id: string;
    player_id: string;
    gallery_id?: CanonicalGalleryId;
    puzzle_id?: string;
    star_id?: string;
    active_seconds?: number;
    timestamp: string;
    visited_galleries?: CanonicalGalleryId[];
    answered_puzzles?: string[];
    answered_stars?: string[];
    opened_puzzles?: string[];
    opened_stars?: string[];
  }): void {
    if (typeof fetch === 'undefined') return;

    const bodyStr = JSON.stringify(payload);

    // Google Apps Script redirects require mode: 'no-cors' for browser requests from cross-origin pages
    fetch(APPS_SCRIPT_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: bodyStr,
    })
      .then((res) => {
        // In no-cors mode, type is 'opaque' with status 0, indicating successful dispatch
        if (res.type === 'opaque' || res.ok) {
          // Dispatched successfully to Apps Script
          return;
        }
        res.json().then((json) => {
          if (json && json.ok) {
            console.log('[ANALYTICS RESPONSE SUCCESS]', json);
          } else {
            console.warn('[ANALYTICS RESPONSE WARNING]', json);
          }
        }).catch(() => {});
      })
      .catch((err) => {
        console.warn('[ANALYTICS REQUEST WARNING]', err?.message || err);
      });
  }

  /**
   * Starts a new game session.
   * Only called when the player is actually in the game (not on profile creation page).
   */
  public startSession(initialGallery?: string): void {
    if (this.isSessionActive) {
      if (initialGallery) {
        this.updateGallery(initialGallery);
      }
      return;
    }

    if (!this.playerId) {
      this.playerId = getOrCreatePlayerId();
    }

    this.sessionId = this.getOrCreateSessionId();
    this.isSessionActive = true;

    if (initialGallery) {
      this.currentGallery = initialGallery;
      this.recordVisitedGallery(initialGallery);
    } else {
      this.recordVisitedGallery(this.currentGallery);
    }

    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.visibleStartTime = Date.now();
    } else {
      this.visibleStartTime = null;
    }

    // Send session start
    this.sendPayload('start');

    // Start 1-second interval ticker for active play time and heartbeat
    this.startTicker();
  }

  /**
   * Updates the tracked gallery whenever player moves between galleries
   */
  public updateGallery(galleryId: string): void {
    if (!galleryId) return;
    this.currentGallery = galleryId;
    this.recordVisitedGallery(galleryId);
  }

  /**
   * Ends the current session cleanly (e.g. on full game reset)
   */
  public endSession(): void {
    if (!this.isSessionActive && !this.sessionId) return;

    // Send end beacon with final metrics
    this.sendPayload('end', true);

    this.stopTicker();
    this.isSessionActive = false;
    this.accumulatedActiveSeconds = 0;
    this.visibleStartTime = null;
    this.lastHeartbeatActiveSeconds = 0;
  }

  /**
   * Handles game reset ("Reset Game / Start New Game")
   * Ends previous session, clears session_id and session lists, preserves player_id.
   */
  public handleGameReset(): void {
    this.endSession();
    this.sessionId = null;
    this.visitedGalleries = [];
    this.answeredPuzzles = [];
    this.answeredStars = [];
    this.openedPuzzles = [];
    this.openedStars = [];

    // Clear session storage records for the fresh game
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(SESSION_ID_STORAGE_KEY);
        sessionStorage.removeItem(ACTIVE_SECONDS_STORAGE_KEY);
        sessionStorage.removeItem(VISITED_GALLERIES_STORAGE_KEY);
        sessionStorage.removeItem(ANSWERED_PUZZLES_STORAGE_KEY);
        sessionStorage.removeItem(ANSWERED_STARS_STORAGE_KEY);
        sessionStorage.removeItem(OPENED_PUZZLES_STORAGE_KEY);
        sessionStorage.removeItem(OPENED_STARS_STORAGE_KEY);
      }
    } catch {}
  }

  /**
   * Calculates total active game seconds (only while document.visibilityState === "visible")
   */
  public getActiveSeconds(): number {
    let extra = 0;
    if (
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible' &&
      this.visibleStartTime !== null
    ) {
      extra = (Date.now() - this.visibleStartTime) / 1000;
    }
    return Math.max(0, Math.floor(this.accumulatedActiveSeconds + extra));
  }

  /**
   * Returns current session ID
   */
  public getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Returns persistent anonymous player ID
   */
  public getPlayerId(): string {
    if (!this.playerId) {
      this.playerId = getOrCreatePlayerId();
    }
    return this.playerId;
  }

  /**
   * Returns current visited galleries list (01 to 08)
   */
  public getVisitedGalleries(): CanonicalGalleryId[] {
    return [...this.visitedGalleries];
  }

  /**
   * Returns answered puzzles list
   */
  public getAnsweredPuzzles(): string[] {
    return [...this.answeredPuzzles];
  }

  /**
   * Returns answered stars list
   */
  public getAnsweredStars(): string[] {
    return [...this.answeredStars];
  }

  /**
   * Returns opened puzzles list
   */
  public getOpenedPuzzles(): string[] {
    return [...this.openedPuzzles];
  }

  /**
   * Returns opened stars list
   */
  public getOpenedStars(): string[] {
    return [...this.openedStars];
  }

  /**
   * Page Visibility API handler
   */
  private handleVisibilityChange(): void {
    if (typeof document === 'undefined') return;

    if (document.visibilityState === 'hidden') {
      // Tab/App became hidden: Stop accumulating active time
      if (this.visibleStartTime !== null) {
        this.accumulatedActiveSeconds += (Date.now() - this.visibleStartTime) / 1000;
        this.visibleStartTime = null;
      }
      this.persistSessionData();
      // Ensure the latest accumulated duration is sent and persisted when page becomes hidden
      if (this.isSessionActive) {
        this.sendPayload('heartbeat', true);
      }
    } else if (document.visibilityState === 'visible') {
      // Tab/App became visible: Resume accumulating active time
      this.visibleStartTime = Date.now();
    }
  }

  /**
   * Handles page exit / unmount cleanly without duplicate requests
   */
  private handlePageExit(): void {
    if (!this.isSessionActive) return;

    const now = Date.now();
    if (now - this.lastExitSentTime < 1500) {
      return;
    }
    this.lastExitSentTime = now;

    if (this.visibleStartTime !== null) {
      this.accumulatedActiveSeconds += (Date.now() - this.visibleStartTime) / 1000;
      this.visibleStartTime = null;
    }
    this.persistSessionData();

    this.sendPayload('end', true);
  }

  /**
   * Ticker running once per second to track 30-second heartbeat intervals while visible
   */
  private startTicker(): void {
    this.stopTicker();

    this.tickIntervalId = setInterval(() => {
      if (
        !this.isSessionActive ||
        typeof document === 'undefined' ||
        document.visibilityState !== 'visible'
      ) {
        // Do not send heartbeat while hidden or inactive
        return;
      }

      this.persistSessionData();

      const currentActive = this.getActiveSeconds();
      // Every 30 seconds of active visible play time: send heartbeat
      if (currentActive - this.lastHeartbeatActiveSeconds >= 30) {
        this.lastHeartbeatActiveSeconds = currentActive;
        this.sendPayload('heartbeat');
      }
    }, 1000);
  }

  private stopTicker(): void {
    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
  }

  /**
   * 15. DO NOT USE HEARTBEAT AS THE ONLY BACKUP
   * Sends analytics payload to Google Apps Script Web App
   */
  public sendPayload(action: AnalyticsAction, preferBeacon = false): void {
    const activeSessionId = this.sessionId || this.getOrCreateSessionId();
    if (!activeSessionId) return;

    this.persistSessionData();

    const payload: AnalyticsPayload = {
      action,
      session_id: activeSessionId,
      player_id: this.getPlayerId(),
      timestamp: new Date().toISOString(),
      active_seconds: this.getActiveSeconds(),
      last_gallery: getCanonicalGalleryId(this.currentGallery) || undefined,
      device: getDeviceCategory(),
      visited_galleries: [...this.visitedGalleries],
      answered_puzzles: [...this.answeredPuzzles],
      answered_stars: [...this.answeredStars],
      opened_puzzles: [...this.openedPuzzles],
      opened_stars: [...this.openedStars],
    };

    // PreferBeacon / isExit is used on unload/pagehide/visibility hidden:
    // Deliver via sendBeacon when available (most reliable during unload), or fallback to keepalive fetch
    if (preferBeacon) {
      const payloadStr = JSON.stringify(payload);
      let delivered = false;

      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.sendBeacon === 'function'
      ) {
        try {
          const blob = new Blob([payloadStr], { type: 'text/plain;charset=UTF-8' });
          delivered = navigator.sendBeacon(APPS_SCRIPT_ENDPOINT, blob);
        } catch {
          delivered = false;
        }
      }

      if (!delivered && typeof fetch !== 'undefined') {
        try {
          fetch(APPS_SCRIPT_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            keepalive: true,
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: payloadStr,
          }).catch((err) => {
            console.warn('[ANALYTICS EXIT WARNING]', err?.message || err);
          });
        } catch (err: any) {
          console.warn('[ANALYTICS EXIT ATTEMPT WARNING]', err?.message || err);
        }
      }
      return;
    }

    // Standard non-blocking fetch
    if (typeof fetch !== 'undefined') {
      fetch(APPS_SCRIPT_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (res.type === 'opaque' || res.ok) {
            return;
          }
          res.json().then((json) => {
            if (json && json.ok) {
              console.log('[ANALYTICS PAYLOAD SUCCESS]', json);
            } else {
              console.warn('[ANALYTICS PAYLOAD WARNING]', json);
            }
          }).catch(() => {});
        })
        .catch((err) => {
          console.warn('[ANALYTICS PAYLOAD WARNING]', err?.message || err);
        });
    }
  }
}

export const sessionAnalyticsService = new SessionAnalyticsService();

if (typeof window !== 'undefined') {
  (window as any).__SESSION_ANALYTICS__ = sessionAnalyticsService;
}
