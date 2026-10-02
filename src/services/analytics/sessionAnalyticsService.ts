/**
 * Anonymous Game-Session Analytics Service
 *
 * Measures game usage and session duration using Google Apps Script Web App.
 * - Anonymous persistent Player ID (P-xxxxxxxx) surviving game resets.
 * - Unique Session ID (S-xxxxxxxx) refreshed on every new game / reset.
 * - Active play time tracked strictly when document.visibilityState === "visible".
 * - Heartbeat sent every 30 seconds of active visibility.
 * - Canonical gallery IDs (01 to 08).
 * - Simple device category (mobile, tablet, desktop).
 * - Non-blocking asynchronous network requests with sendBeacon on session end.
 * - No personal data, quiz answers, or game secrets collected.
 */

import { getCurrentGalleryId } from '../../data/playerLocationStore';

const APPS_SCRIPT_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyr6TToD0Z52TVhxCs2MurPX7j4j_MwJXzf8KLuH5JxKP-9dV6s_k0BJdzDLxnmyJkF/exec';

const PLAYER_ID_STORAGE_KEY = 'museum_analytics_player_id';
const SESSION_ID_STORAGE_KEY = 'museum_analytics_session_id';

export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';
export type CanonicalGalleryId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';
export type AnalyticsAction = 'start' | 'heartbeat' | 'end';

export interface AnalyticsPayload {
  action: AnalyticsAction;
  session_id: string;
  player_id: string;
  timestamp: string;
  active_seconds: number;
  last_gallery: CanonicalGalleryId;
  device: DeviceCategory;
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
 * Does not use array indexes, component filenames, or old gallery numbering.
 */
export function getCanonicalGalleryId(rawGalleryId?: string | null): CanonicalGalleryId {
  const target = (rawGalleryId || getCurrentGalleryId() || '').trim().toLowerCase();

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

  // If on map (gallery-00), query playerLocationStore for the last active gallery
  const playerLoc = getCurrentGalleryId();
  if (playerLoc && playerLoc !== target && playerLoc !== 'gallery-00') {
    return getCanonicalGalleryId(playerLoc);
  }

  return '01';
}

class SessionAnalyticsService {
  private playerId: string = '';
  private sessionId: string | null = null;
  private isSessionActive: boolean = false;
  private currentGallery: string = 'gallery-01';

  // Active time tracking
  private accumulatedActiveSeconds: number = 0;
  private visibleStartTime: number | null = null;
  private lastHeartbeatActiveSeconds: number = 0;

  // Interval ticker
  private tickIntervalId: any = null;
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize window listeners and player ID
   */
  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    this.playerId = getOrCreatePlayerId();

    // Listen for Page Visibility API changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Send final beacon on page unload / hide
    window.addEventListener('pagehide', () => {
      if (this.isSessionActive) {
        this.sendPayload('end', true);
      }
    });

    window.addEventListener('beforeunload', () => {
      if (this.isSessionActive) {
        this.sendPayload('end', true);
      }
    });

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
   * Starts a new game session.
   * Only called when the player is actually in the game (not on profile creation page).
   */
  public startSession(initialGallery?: string): void {
    if (this.isSessionActive) return;

    if (!this.playerId) {
      this.playerId = getOrCreatePlayerId();
    }

    this.sessionId = createNewSessionId();
    this.isSessionActive = true;
    this.accumulatedActiveSeconds = 0;
    this.lastHeartbeatActiveSeconds = 0;

    if (initialGallery) {
      this.currentGallery = initialGallery;
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
   * Updates the tracked gallery whenever player moves
   */
  public updateGallery(galleryId: string): void {
    if (!galleryId) return;
    this.currentGallery = galleryId;
  }

  /**
   * Ends the current session cleanly (e.g. on full game reset)
   */
  public endSession(): void {
    if (!this.isSessionActive) return;

    // Send end beacon
    this.sendPayload('end', true);

    this.stopTicker();
    this.isSessionActive = false;
    this.sessionId = null;
    this.accumulatedActiveSeconds = 0;
    this.visibleStartTime = null;
    this.lastHeartbeatActiveSeconds = 0;
  }

  /**
   * Handles game reset ("Reset Game / Start New Game")
   * Ends previous session, clears session_id, preserves player_id.
   */
  public handleGameReset(): void {
    this.endSession();
    // Prepare a new session ID for when the player starts playing again
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(SESSION_ID_STORAGE_KEY);
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
      // Send end update reliably while document is being hidden
      if (this.isSessionActive) {
        this.sendPayload('end', true);
      }
    } else if (document.visibilityState === 'visible') {
      // Tab/App became visible: Resume accumulating active time
      this.visibleStartTime = Date.now();
    }
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
   * Sends non-blocking analytics payload to Google Apps Script Web App
   */
  private sendPayload(action: AnalyticsAction, preferBeacon = false): void {
    if (!this.sessionId) return;

    const payload: AnalyticsPayload = {
      action,
      session_id: this.sessionId,
      player_id: this.getPlayerId(),
      timestamp: new Date().toISOString(),
      active_seconds: this.getActiveSeconds(),
      last_gallery: getCanonicalGalleryId(this.currentGallery),
      device: getDeviceCategory(),
    };

    // Try sendBeacon first if requested (ideal for 'end' during visibility hidden / page unload)
    if (
      preferBeacon &&
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function'
    ) {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' });
        const sent = navigator.sendBeacon(APPS_SCRIPT_ENDPOINT, blob);
        if (sent) return;
      } catch {
        // Fallback to fetch
      }
    }

    // Non-blocking fetch with mode: 'no-cors'
    if (typeof fetch !== 'undefined') {
      try {
        fetch(APPS_SCRIPT_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {
          // Analytics must ALWAYS be non-blocking and silent to the player
        });
      } catch {
        // Silent catch
      }
    }
  }
}

export const sessionAnalyticsService = new SessionAnalyticsService();
