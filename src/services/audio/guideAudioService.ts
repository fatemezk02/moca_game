import { useEffect, useState, useCallback } from 'react';
import { getLogicalGalleryNumber, normalizeGalleryId } from '../content/mappers';

/**
 * Dedicated versioned cache for TMOCA guide audio files.
 * Bumped to v2 to purge any previous synthetic/test-tone audio responses.
 */
export const GUIDE_AUDIO_CACHE_NAME = 'tmoca-guide-audio-v2';

// Immediately purge any legacy audio caches on script evaluation in browser
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key.startsWith('tmoca-guide-audio-') && key !== GUIDE_AUDIO_CACHE_NAME) {
        console.log('[GuideAudio] Purged legacy cache:', key);
        caches.delete(key);
      }
    });
  });
}

/**
 * Canonical mapping of logical gallery numbers to local static audio assets.
 * Note: Gallery 06 intentionally has NO AUDIO.
 */
export const GUIDE_AUDIO_MAP: Record<number, string> = {
  1: '/audio/gallery-01-guide.mp3',
  2: '/audio/gallery-02-guide.mp3',
  3: '/audio/gallery-03-guide.mp3',
  4: '/audio/gallery-04-guide.mp3',
  5: '/audio/gallery-05-guide.mp3',
  // Gallery 06: NO AUDIO
  7: '/audio/gallery-07-guide.mp3',
  8: '/audio/gallery-08-guide.mp3',
};

/**
 * List of all local audio URLs to be cached in the background.
 */
export const ALL_GUIDE_AUDIO_URLS: string[] = Object.values(GUIDE_AUDIO_MAP);

/**
 * Resolves the local static audio file URL for any gallery identifier.
 * Returns null if the gallery has no audio (e.g. Gallery 06 or invalid ID).
 */
export function getGuideAudioUrlForGallery(galleryId?: string | null): string | null {
  if (!galleryId) return null;
  const logicalNum = getLogicalGalleryNumber(galleryId);
  if (logicalNum === null || logicalNum === 6) {
    return null;
  }
  return GUIDE_AUDIO_MAP[logicalNum] || null;
}

/**
 * Registers the Service Worker for offline audio caching if supported.
 */
export function registerGuideAudioServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Prompt service worker to check for updates immediately
        reg.update().catch(() => {});
        console.log('[GuideAudio] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[GuideAudio] Service Worker registration skipped/failed:', err);
      });
  }
}

/**
 * Asynchronously checks and caches all local guide audio files.
 * Does NOT re-download already cached files.
 * Continues on failure of any individual file.
 */
export async function prefetchAllGuideAudios(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;

  try {
    const cache = await caches.open(GUIDE_AUDIO_CACHE_NAME);

    for (const url of ALL_GUIDE_AUDIO_URLS) {
      try {
        const existing = await cache.match(url);
        if (existing) {
          continue; // Already cached in v2
        }

        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log(`[GuideAudio] Cached: ${url}`);
        }
      } catch (fileErr) {
        console.warn(`[GuideAudio] Background cache skipped for ${url}:`, fileErr);
      }
    }
  } catch (err) {
    console.warn('[GuideAudio] CacheStorage access failed:', err);
  }
}

let prefetchScheduled = false;

/**
 * Initializes background audio prefetching without blocking app startup or UI rendering.
 * Defers prefetch execution until the browser is idle or shortly after mount.
 */
export function initGuideAudioBackgroundPrefetch(): void {
  if (prefetchScheduled || typeof window === 'undefined') return;
  prefetchScheduled = true;

  registerGuideAudioServiceWorker();

  // Clean old caches
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (key.startsWith('tmoca-guide-audio-') && key !== GUIDE_AUDIO_CACHE_NAME) {
          caches.delete(key);
        }
      });
    });
  }

  const runBackgroundCache = () => {
    prefetchAllGuideAudios().catch((err) => {
      console.warn('[GuideAudio] Background cache encountered non-fatal error:', err);
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(
      () => {
        setTimeout(runBackgroundCache, 1500);
      },
      { timeout: 4000 }
    );
  } else {
    setTimeout(runBackgroundCache, 2500);
  }
}

export interface AudioPlaybackState {
  galleryId: string | null;
  audioUrl: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
}

type AudioStateListener = (state: AudioPlaybackState) => void;

/**
 * Singleton manager for Guide Audio playback.
 * Ensures only one audio can play at any time.
 * Supports PLAY, PAUSE, RESUME, seeking, and global persistence.
 */
class GuideAudioManager {
  private static instance: GuideAudioManager | null = null;
  private audio: HTMLAudioElement | null = null;
  private listeners: Set<AudioStateListener> = new Set();

  private state: AudioPlaybackState = {
    galleryId: null,
    audioUrl: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    error: null,
  };

  private constructor() {
    // Global audio player singleton. Audio lifecycle is managed globally across navigation.
  }

  public static getInstance(): GuideAudioManager {
    if (!GuideAudioManager.instance) {
      GuideAudioManager.instance = new GuideAudioManager();
    }
    return GuideAudioManager.instance;
  }

  public getState(): AudioPlaybackState {
    return { ...this.state };
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  private cleanupCurrentAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.audio = null;
    }
  }

  public async play(galleryId: string): Promise<void> {
    const audioUrl = getGuideAudioUrlForGallery(galleryId);
    if (!audioUrl) {
      console.warn(`[GuideAudio] No audio file for galleryId: "${galleryId}"`);
      return;
    }

    const normTarget = normalizeGalleryId(galleryId);
    const normCurrent = this.state.galleryId ? normalizeGalleryId(this.state.galleryId) : null;

    // Case 1: Same audio is currently paused -> resume
    if (this.audio && normTarget === normCurrent && this.state.audioUrl === audioUrl) {
      if (!this.state.isPlaying) {
        try {
          await this.audio.play();
          this.state.isPlaying = true;
          this.state.error = null;
          this.notify();
        } catch (err: any) {
          console.error('[GuideAudio] Resume failed:', err);
          this.state.isPlaying = false;
          this.state.error = err.message || 'خطا در پخش';
          this.notify();
        }
      }
      return;
    }

    // Case 2: New audio or different gallery
    this.cleanupCurrentAudio();

    this.state = {
      galleryId,
      audioUrl,
      isPlaying: false,
      isLoading: true,
      currentTime: 0,
      duration: 0,
      error: null,
    };
    this.notify();

    // Use direct canonical audio URL to stream directly from static public/audio/
    const audio = new Audio();
    this.audio = audio;
    audio.preload = 'auto';
    audio.src = audioUrl;

    audio.addEventListener('loadedmetadata', () => {
      this.state.duration = audio.duration || 0;
      this.notify();
    });

    audio.addEventListener('timeupdate', () => {
      this.state.currentTime = audio.currentTime;
      this.notify();
    });

    audio.addEventListener('playing', () => {
      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.notify();
    });

    audio.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.notify();
    });

    audio.addEventListener('ended', () => {
      this.state.isPlaying = false;
      this.state.currentTime = 0;
      this.notify();
    });

    audio.addEventListener('waiting', () => {
      this.state.isLoading = true;
      this.notify();
    });

    audio.addEventListener('error', () => {
      console.error('[GuideAudio] Playback error on audio element for:', audioUrl);
      this.state.isLoading = false;
      this.state.isPlaying = false;
      this.state.error = 'خطا در بارگذاری صوت';
      this.notify();
    });

    try {
      await audio.play();
      this.state.isPlaying = true;
      this.state.isLoading = false;
      this.notify();
    } catch (err: any) {
      console.warn('[GuideAudio] Play failed (user interaction required or network issue):', err);
      this.state.isLoading = false;
      this.state.isPlaying = false;
      this.notify();
    }
  }

  public pause(): void {
    if (this.audio && this.state.isPlaying) {
      this.audio.pause();
      this.state.isPlaying = false;
      this.notify();
    }
  }

  public stop(): void {
    this.cleanupCurrentAudio();
    this.state = {
      galleryId: null,
      audioUrl: null,
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      error: null,
    };
    this.notify();
  }

  public seek(timeInSeconds: number): void {
    if (this.audio) {
      this.audio.currentTime = Math.max(0, Math.min(timeInSeconds, this.audio.duration || timeInSeconds));
      this.state.currentTime = this.audio.currentTime;
      this.notify();
    }
  }

  public stopIfDifferentGallery(newGalleryId: string): void {
    if (this.state.galleryId) {
      const normCurrent = normalizeGalleryId(this.state.galleryId);
      const normNew = normalizeGalleryId(newGalleryId);
      if (normCurrent !== normNew) {
        this.stop();
      }
    }
  }
}

export const guideAudioManager = GuideAudioManager.getInstance();

/**
 * Custom React hook for controlling and subscribing to Guide Audio for a specific gallery.
 */
export function useGuideAudio(galleryId?: string | null) {
  const [managerState, setManagerState] = useState<AudioPlaybackState>(guideAudioManager.getState());

  useEffect(() => {
    return guideAudioManager.subscribe((newState) => {
      setManagerState(newState);
    });
  }, []);

  const audioUrl = getGuideAudioUrlForGallery(galleryId);
  const hasAudio = audioUrl !== null;

  const isCurrentGallery =
    Boolean(galleryId && managerState.galleryId) &&
    normalizeGalleryId(galleryId!) === normalizeGalleryId(managerState.galleryId!);

  const isPlaying = isCurrentGallery && managerState.isPlaying;
  const isLoading = isCurrentGallery && managerState.isLoading;
  const currentTime = isCurrentGallery ? managerState.currentTime : 0;
  const duration = isCurrentGallery ? managerState.duration : 0;

  const play = useCallback(() => {
    if (!galleryId || !hasAudio) return;
    guideAudioManager.play(galleryId);
  }, [galleryId, hasAudio]);

  const pause = useCallback(() => {
    guideAudioManager.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (!galleryId || !hasAudio) return;
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [galleryId, hasAudio, isPlaying, pause, play]);

  const seek = useCallback((time: number) => {
    guideAudioManager.seek(time);
  }, []);

  const stop = useCallback(() => {
    guideAudioManager.stop();
  }, []);

  return {
    hasAudio,
    audioUrl,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    play,
    pause,
    togglePlay,
    seek,
    stop,
  };
}

/**
 * Custom React hook for controlling and subscribing to the global Guide Audio player.
 */
export function useGlobalGuideAudio() {
  const [managerState, setManagerState] = useState<AudioPlaybackState>(guideAudioManager.getState());

  useEffect(() => {
    return guideAudioManager.subscribe((newState) => {
      setManagerState(newState);
    });
  }, []);

  const hasLoadedAudio = managerState.galleryId !== null && managerState.audioUrl !== null;

  const play = useCallback(
    (galleryId?: string) => {
      const target = galleryId || managerState.galleryId;
      if (target) guideAudioManager.play(target);
    },
    [managerState.galleryId]
  );

  const pause = useCallback(() => {
    guideAudioManager.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (!managerState.galleryId) return;
    if (managerState.isPlaying) {
      guideAudioManager.pause();
    } else {
      guideAudioManager.play(managerState.galleryId);
    }
  }, [managerState.galleryId, managerState.isPlaying]);

  const stop = useCallback(() => {
    guideAudioManager.stop();
  }, []);

  const seek = useCallback((time: number) => {
    guideAudioManager.seek(time);
  }, []);

  return {
    ...managerState,
    hasLoadedAudio,
    play,
    pause,
    togglePlay,
    stop,
    seek,
  };
}
