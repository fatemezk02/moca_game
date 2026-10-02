import { getLogicalGalleryNumber } from '../content/mappers';
import { getCurrentGalleryId } from '../../data/playerLocationStore';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyr6TToD0Z52TVhxCs2MurPX7j4j_MwJXzf8KLuH5JxKP-9dV6s_k0BJdzDLxnmyJkF/exec';

const STORAGE_PLAYER_ID_KEY = 'museum_analytics_player_id';

export interface SessionAnalyticsPayload {
  action: 'start' | 'heartbeat' | 'end';
  session_id: string;
  player_id: string;
  timestamp: string;
  active_seconds: number;
  last_gallery: string;
  device: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Generates an 8-character random hex string.
 */
function generateRandomHex(len = 8): string {
  const chars = '0123456789abcdef';
  let result = '';
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(len);
      crypto.getRandomValues(bytes);
      for (let i = 0; i < len; i++) {
        result += chars[bytes[i] % chars.length];
      }
      return result;
    }
  } catch {}
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Retrieves or generates a persistent anonymous player ID: P-xxxxxxxx
 * Persists in localStorage across game resets.
 */
export function getOrCreatePlayerId(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = localStorage.getItem(STORAGE_PLAYER_ID_KEY);
      if (existing && /^P-[a-z0-9]{8}$/i.test(existing.trim())) {
        return existing.trim();
      }
      const newId = `P-${generateRandomHex(8)}`;
      localStorage.setItem(STORAGE_PLAYER_ID_KEY, newId);
      return newId;
    }
  } catch {}
  return `P-${generateRandomHex(8)}`;
}

/**
 * Creates a unique session ID: S-xxxxxxxx
 */
export function createSessionId(): string {
  return `S-${generateRandomHex(8)}`;
}

/**
 * Categorizes the device into 'mobile' | 'tablet' | 'desktop' without fingerprinting.
 */
export function getDeviceCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = (navigator.userAgent || '').toLowerCase();

  const isTablet =
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /macintosh/i.test(ua));
  if (isTablet) return 'tablet';

  const isMobile =
    /(iphone|ipod|android.*mobile|windows.*phone|blackberry|mobile)/i.test(ua) ||
    (window.innerWidth <= 640 && 'ontouchstart' in window);
  if (isMobile) return 'mobile';

  return 'desktop';
}

/**
 * Converts any gallery route or state into a canonical 2-digit gallery code:
 * "01", "02", "03", "04", "05", "06", "07", "08"
 */
export function getCanonicalGalleryCode(currentRoute?: string): string {
  if (currentRoute && currentRoute !== 'gallery-00') {
    const num = getLogicalGalleryNumber(currentRoute);
    if (num !== null && num >= 1 && num <= 8) {
      return num < 10 ? `0${num}` : `${num}`;
    }
  }

  // Fallback to progression gallery from playerLocationStore
  try {
    const prog = getCurrentGalleryId();
    const progNum = getLogicalGalleryNumber(prog);
    if (progNum !== null && progNum >= 1 && progNum <= 8) {
      return progNum < 10 ? `0${progNum}` : `${progNum}`;
    }
  } catch {}

  return '01';
}

/**
 * Sends the analytics payload asynchronously in the background.
 * Uses sendBeacon when requested / available, otherwise non-blocking fetch with keepalive.
 */
function sendAnalyticsPayload(payload: SessionAnalyticsPayload, preferBeacon = false): void {
  try {
    const jsonStr = JSON.stringify(payload);

    if (preferBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([jsonStr], { type: 'text/plain;charset=UTF-8' });
        const success = navigator.sendBeacon(APPS_SCRIPT_URL, blob);
        if (success) return;
      } catch {}
    }

    if (typeof fetch !== 'undefined') {
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: jsonStr,
        mode: 'no-cors',
        keepalive: true,
      }).catch(() => {
        // Non-blocking error handling: silent catch so gameplay is NEVER affected
      });
    }
  } catch {
    // Non-blocking error handling
  }
}

/**
 * Autonomous Session Analytics Manager
 * Tracks active gameplay time via Page Visibility API, sends start/heartbeat/end events.
 */
class SessionAnalyticsService {
  private playerId: string;
  private sessionId: string | null = null;
  private hasStarted = false;
  private accumulatedActiveSeconds = 0;
  private lastVisibleTime: number | null = null;
  private lastHeartbeatActiveSeconds = 0;
  private timerIntervalId: number | null = null;
  private currentGalleryCode = '01';
  private listenersAttached = false;

  constructor() {
    this.playerId = getOrCreatePlayerId();
    this.setupWindowListeners();
  }

  /**
   * Starts a new game session when player actually starts playing.
   */
  public startSession(initialGallery?: string): void {
    if (this.hasStarted) {
      return;
    }

    this.playerId = getOrCreatePlayerId();
    this.sessionId = createSessionId();
    this.hasStarted = true;
    this.accumulatedActiveSeconds = 0;
    this.lastHeartbeatActiveSeconds = 0;
    this.currentGalleryCode = getCanonicalGalleryCode(initialGallery);

    const isVisible = typeof document !== 'undefined' && document.visibilityState === 'visible';
    this.lastVisibleTime = isVisible ? Date.now() : null;

    // Send "start" event
    sendAnalyticsPayload({
      action: 'start',
      session_id: this.sessionId,
      player_id: this.playerId,
      timestamp: new Date().toISOString(),
      active_seconds: 0,
      last_gallery: this.currentGalleryCode,
      device: getDeviceCategory(),
    });

    this.startTimer();
  }

  /**
   * Updates the current gallery code when the player navigates.
   */
  public setCurrentGallery(galleryId?: string): void {
    this.currentGalleryCode = getCanonicalGalleryCode(galleryId);
  }

  /**
   * Calculates total active seconds accumulated so far in the current session.
   */
  public getActiveSeconds(): number {
    if (!this.hasStarted) return 0;
    let extra = 0;
    if (this.lastVisibleTime !== null && typeof document !== 'undefined' && document.visibilityState === 'visible') {
      extra = (Date.now() - this.lastVisibleTime) / 1000;
    }
    return Math.floor(this.accumulatedActiveSeconds + Math.max(0, extra));
  }

  /**
   * Called when a game is reset ("Reset Game / Start New Game").
   * Sends final "end" update for current session and resets local state.
   */
  public endSessionAndReset(): void {
    if (this.hasStarted && this.sessionId) {
      this.syncActiveTimeBeforePause();
      sendAnalyticsPayload(
        {
          action: 'end',
          session_id: this.sessionId,
          player_id: this.playerId,
          timestamp: new Date().toISOString(),
          active_seconds: Math.floor(this.accumulatedActiveSeconds),
          last_gallery: this.currentGalleryCode,
          device: getDeviceCategory(),
        },
        true
      );
    }

    this.stopTimer();
    this.sessionId = null;
    this.hasStarted = false;
    this.accumulatedActiveSeconds = 0;
    this.lastVisibleTime = null;
    this.lastHeartbeatActiveSeconds = 0;
  }

  private syncActiveTimeBeforePause(): void {
    if (this.lastVisibleTime !== null) {
      const delta = (Date.now() - this.lastVisibleTime) / 1000;
      if (delta > 0) {
        this.accumulatedActiveSeconds += delta;
      }
      this.lastVisibleTime = null;
    }
  }

  private startTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
    }

    this.timerIntervalId = window.setInterval(() => {
      if (!this.hasStarted || !this.sessionId) return;

      // Only evaluate if the page is actively visible
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        if (this.lastVisibleTime === null) {
          this.lastVisibleTime = Date.now();
        }

        const currentActive = this.getActiveSeconds();

        // Send heartbeat every 30 seconds of active play
        if (currentActive - this.lastHeartbeatActiveSeconds >= 30) {
          this.lastHeartbeatActiveSeconds = currentActive;
          sendAnalyticsPayload({
            action: 'heartbeat',
            session_id: this.sessionId,
            player_id: this.playerId,
            timestamp: new Date().toISOString(),
            active_seconds: currentActive,
            last_gallery: this.currentGalleryCode,
            device: getDeviceCategory(),
          });
        }
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  private setupWindowListeners(): void {
    if (this.listenersAttached || typeof window === 'undefined') return;
    this.listenersAttached = true;

    // Visibility Change listener
    document.addEventListener('visibilitychange', () => {
      if (!this.hasStarted || !this.sessionId) return;

      if (document.visibilityState === 'hidden') {
        // Page hidden: accumulate active time up to this moment, stop timer
        this.syncActiveTimeBeforePause();

        // Send "end" update via sendBeacon as reliable exit update
        sendAnalyticsPayload(
          {
            action: 'end',
            session_id: this.sessionId,
            player_id: this.playerId,
            timestamp: new Date().toISOString(),
            active_seconds: Math.floor(this.accumulatedActiveSeconds),
            last_gallery: this.currentGalleryCode,
            device: getDeviceCategory(),
          },
          true
        );
      } else if (document.visibilityState === 'visible') {
        // Page visible again: resume active timer from current accumulated time
        this.lastVisibleTime = Date.now();
      }
    });

    // Page hide / unload listener
    window.addEventListener('pagehide', () => {
      if (!this.hasStarted || !this.sessionId) return;
      this.syncActiveTimeBeforePause();
      sendAnalyticsPayload(
        {
          action: 'end',
          session_id: this.sessionId,
          player_id: this.playerId,
          timestamp: new Date().toISOString(),
          active_seconds: Math.floor(this.accumulatedActiveSeconds),
          last_gallery: this.currentGalleryCode,
          device: getDeviceCategory(),
        },
        true
      );
    });

    // Game reset listener
    window.addEventListener('museum_game_fully_reset', () => {
      this.endSessionAndReset();
    });
  }
}

export const sessionAnalytics = new SessionAnalyticsService();
