/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MUSEUM_COLLECTIONS } from './data/museumCollections';
import { MuseumCollection, MapDisplayMode } from './types';
import { MuseumFloorPlan } from './components/MuseumFloorPlan';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { MapControls } from './components/MapControls';
import { CollectionDetailModal } from './components/CollectionDetailModal';
import { MuseumInfoModal } from './components/MuseumInfoModal';
import { CollectionListView } from './components/CollectionListView';
import { TasksCuratorView } from './components/TasksCuratorView';
import { Gallery01View } from './components/Gallery01View';
import { Gallery01To02CameraTransition } from './components/Gallery01To02CameraTransition';
import { Gallery02To03CameraTransition } from './components/Gallery02To03CameraTransition';
import { Gallery03To04CameraTransition } from './components/Gallery03To04CameraTransition';
import { Gallery04To05CameraTransition } from './components/Gallery04To05CameraTransition';
import { Gallery05To06CameraTransition } from './components/Gallery05To06CameraTransition';
import { Gallery06To07CameraTransition } from './components/Gallery06To07CameraTransition';
import { Gallery07To08CameraTransition } from './components/Gallery07To08CameraTransition';
import { Gallery01QuestionsView } from './components/Gallery01QuestionsView';
import { Gallery03View } from './components/Gallery03View';
import { Gallery03QuestionsView } from './components/Gallery03QuestionsView';
import { Gallery04View } from './components/Gallery04View';
import { Gallery05View } from './components/Gallery05View';
import { Gallery06View } from './components/Gallery06View';
import { Gallery07View } from './components/Gallery07View';
import { Gallery08View } from './components/Gallery08View';
import { Gallery09View } from './components/Gallery09View';
import { Gallery04PlaceholderView } from './components/Gallery04PlaceholderView';
import { AdminManagementView } from './components/AdminManagementView';
import { PlayerStatusBar } from './components/PlayerStatusBar';
import { usePlayerStats } from './hooks/usePlayerStats';
import { AdminPuzzlePoint, AdminCollectionPoint } from './types/admin';
import { getGalleryPoints } from './data/mapConfig';
import { StarDiscoveryModal } from './components/StarDiscoveryModal';
import {
  hasStarPointBeenViewed,
  markStarPointFirstViewed,
} from './data/starPointProgressStore';
import { resetEntireGame } from './data/gameReset';
import { markGalleryReached } from './data/reachedGalleriesStore';
import { normalizeGalleryId } from './services/content/mappers';
import { getCurrentGalleryId, setCurrentGalleryId } from './data/playerLocationStore';
import { contentService, registerContentDebugAPI } from './services/content';
import { Volume2, Pause, Play, X, Compass, Sparkles } from 'lucide-react';
import { DevMapPositioningTool, IS_DEV_POSITIONING_ENABLED } from './components/DevMapPositioningTool';
import { ProfileCreationPage } from './components/ProfileCreationPage';
import { ProfileModal } from './components/ProfileModal';
import { FinalCertificateModal } from './components/FinalCertificateModal';
import { getUserProfile, UserProfile } from './data/userProfileStore';
import { markCollectionsAsViewed } from './data/collectionNotificationStore';
import { markArrowUsed } from './data/arrowConditionsStore';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const playerStats = usePlayerStats();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getUserProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFinalCertificateOpen, setIsFinalCertificateOpen] = useState(false);
  const [isTransitioningG01ToG02, setIsTransitioningG01ToG02] = useState(false);
  const [isTransitioningG02ToG01, setIsTransitioningG02ToG01] = useState(false);
  const [isTransitioningG02ToG03, setIsTransitioningG02ToG03] = useState(false);
  const [isTransitioningG03ToG02, setIsTransitioningG03ToG02] = useState(false);
  const [isTransitioningG03ToG04, setIsTransitioningG03ToG04] = useState(false);
  const [isTransitioningG04ToG03, setIsTransitioningG04ToG03] = useState(false);
  const [isTransitioningG04ToG05, setIsTransitioningG04ToG05] = useState(false);
  const [isTransitioningG05ToG04, setIsTransitioningG05ToG04] = useState(false);
  const [isTransitioningG05ToG06, setIsTransitioningG05ToG06] = useState(false);
  const [isTransitioningG06ToG05, setIsTransitioningG06ToG05] = useState(false);
  const [isTransitioningG06ToG07, setIsTransitioningG06ToG07] = useState(false);
  const [isTransitioningG07ToG06, setIsTransitioningG07ToG06] = useState(false);
  const [isTransitioningG07ToG08, setIsTransitioningG07ToG08] = useState(false);
  const [isTransitioningG08ToG07, setIsTransitioningG08ToG07] = useState(false);

  useEffect(() => {
    const handleOpenCertificate = () => setIsFinalCertificateOpen(true);
    const handleCloseCertificate = () => setIsFinalCertificateOpen(false);
    const handleOpenProfile = () => setIsProfileModalOpen(true);
    window.addEventListener('museum_open_final_certificate', handleOpenCertificate);
    window.addEventListener('museum_close_final_certificate', handleCloseCertificate);
    window.addEventListener('museum_open_profile', handleOpenProfile);
    return () => {
      window.removeEventListener('museum_open_final_certificate', handleOpenCertificate);
      window.removeEventListener('museum_close_final_certificate', handleCloseCertificate);
      window.removeEventListener('museum_open_profile', handleOpenProfile);
    };
  }, []);

  // Gallery Route state
  const [currentGallery, setCurrentGallery] = useState<
    'gallery-00' | 'gallery-01' | 'gallery-01-questions' | 'gallery-03' | 'gallery-03-questions' | 'gallery-04' | 'gallery-05' | 'gallery-06' | 'gallery-07' | 'gallery-08' | 'gallery-09'
  >(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const g = urlParams.get('gallery');
      if (g === '09' || g === 'gallery-09') return 'gallery-09';
      if (g === '08' || g === 'gallery-08') return 'gallery-08';
      if (g === '07' || g === 'gallery-07') return 'gallery-07';
      if (g === '06' || g === 'gallery-06') return 'gallery-06';
      if (g === '05' || g === 'gallery-05') return 'gallery-05';
      if (g === '04' || g === 'gallery-04') return 'gallery-04';
      if (g === '03' || g === 'gallery-03') return 'gallery-03';
      if (g === '03-questions' || g === 'gallery-03-questions') return 'gallery-03-questions';
      if (g === '01' || g === 'gallery-01') return 'gallery-01';
      if (g === '01-questions' || g === 'gallery-01-questions') return 'gallery-01-questions';
      if (window.location.hash === '#gallery-09') return 'gallery-09';
      if (window.location.hash === '#gallery-08') return 'gallery-08';
      if (window.location.hash === '#gallery-07') return 'gallery-07';
      if (window.location.hash === '#gallery-06') return 'gallery-06';
      if (window.location.hash === '#gallery-05') return 'gallery-05';
      if (window.location.hash === '#gallery-04') return 'gallery-04';
      if (window.location.hash === '#gallery-03') return 'gallery-03';
      if (window.location.hash === '#gallery-03-questions') return 'gallery-03-questions';
      if (window.location.hash === '#gallery-01') return 'gallery-01';
    } catch {
      // Fallback
    }
    return 'gallery-00';
  });

  // Admin Management Mode
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    return (
      window.location.search.includes('admin') ||
      window.location.hash.includes('admin')
    );
  });

  // Associated Gallery for the circular toggle button (syncs with current player progression gallery)
  const [associatedGallery, setAssociatedGallery] = useState<string>(() => {
    return getCurrentGalleryId();
  });

  // Keep associatedGallery synced with player location progression events
  useEffect(() => {
    const handleLocationUpdate = (e: any) => {
      const gid = e?.detail?.currentGalleryId || getCurrentGalleryId();
      setAssociatedGallery(gid);
    };
    window.addEventListener('museum_player_location_updated', handleLocationUpdate);
    window.addEventListener('museum_game_fully_reset', handleLocationUpdate);
    return () => {
      window.removeEventListener('museum_player_location_updated', handleLocationUpdate);
      window.removeEventListener('museum_game_fully_reset', handleLocationUpdate);
    };
  }, []);

  const navigateToGalleryWithTrack = (galleryId: string) => {
    if (!galleryId || typeof galleryId !== 'string') return;
    const canon = normalizeGalleryId(galleryId);

    // Camera transition: Gallery 01 -> Gallery 02 (Forward)
    if (
      currentGallery === 'gallery-01' &&
      (galleryId === 'gallery-03' ||
        galleryId === 'gallery-02' ||
        galleryId === 'gallery_02' ||
        canon === 'gallery_02' ||
        canon === 'gallery_03')
    ) {
      setIsTransitioningG01ToG02(true);
      return;
    }

    // Camera transition: Gallery 02 -> Gallery 01 (Reverse)
    if (
      (currentGallery === 'gallery-03' || (currentGallery as string) === 'gallery-02') &&
      (galleryId === 'gallery-01' ||
        galleryId === 'gallery_01' ||
        canon === 'gallery_01')
    ) {
      setIsTransitioningG02ToG01(true);
      return;
    }

    // Camera transition: Gallery 02 -> Gallery 03 (Forward)
    if (
      (currentGallery === 'gallery-03' || (currentGallery as string) === 'gallery-02') &&
      (galleryId === 'gallery-04' ||
        galleryId === 'gallery_03' ||
        galleryId === 'gallery_04' ||
        canon === 'gallery_03' ||
        canon === 'gallery_04')
    ) {
      setIsTransitioningG02ToG03(true);
      return;
    }

    // Camera transition: Gallery 03 -> Gallery 02 (Reverse)
    if (
      (currentGallery === 'gallery-04' || (currentGallery as string) === 'gallery_03') &&
      (galleryId === 'gallery-03' ||
        galleryId === 'gallery-02' ||
        galleryId === 'gallery_02' ||
        canon === 'gallery_02')
    ) {
      setIsTransitioningG03ToG02(true);
      return;
    }

    // Camera transition: Gallery 03 -> Gallery 04 (Forward)
    if (
      (currentGallery === 'gallery-04' || (currentGallery as string) === 'gallery_03') &&
      (galleryId === 'gallery-05' ||
        galleryId === 'gallery_04' ||
        galleryId === 'gallery-04' ||
        canon === 'gallery_04' ||
        canon === 'gallery_05')
    ) {
      setIsTransitioningG03ToG04(true);
      return;
    }

    // Camera transition: Gallery 04 -> Gallery 03 (Reverse)
    if (
      (currentGallery === 'gallery-05' || (currentGallery as string) === 'gallery_04') &&
      (galleryId === 'gallery-04' ||
        galleryId === 'gallery-03' ||
        galleryId === 'gallery_03' ||
        canon === 'gallery_03')
    ) {
      setIsTransitioningG04ToG03(true);
      return;
    }

    // Camera transition: Gallery 04 -> Gallery 05 (Forward)
    if (
      (currentGallery === 'gallery-05' || (currentGallery as string) === 'gallery_04') &&
      (galleryId === 'gallery-06' ||
        galleryId === 'gallery_05' ||
        galleryId === 'gallery-05' ||
        canon === 'gallery_05' ||
        canon === 'gallery_06')
    ) {
      setIsTransitioningG04ToG05(true);
      return;
    }

    // Camera transition: Gallery 05 -> Gallery 04 (Reverse)
    if (
      (currentGallery === 'gallery-06' || (currentGallery as string) === 'gallery_05') &&
      (galleryId === 'gallery-05' ||
        galleryId === 'gallery-04' ||
        galleryId === 'gallery_04' ||
        canon === 'gallery_04')
    ) {
      setIsTransitioningG05ToG04(true);
      return;
    }

    // Camera transition: Gallery 05 -> Gallery 06 (Forward)
    if (
      (currentGallery === 'gallery-06' || (currentGallery as string) === 'gallery_05') &&
      (galleryId === 'gallery-07' ||
        galleryId === 'gallery_06' ||
        galleryId === 'gallery-06' ||
        canon === 'gallery_06' ||
        canon === 'gallery_07')
    ) {
      setIsTransitioningG05ToG06(true);
      return;
    }

    // Camera transition: Gallery 06 -> Gallery 05 (Reverse)
    if (
      (currentGallery === 'gallery-07' || (currentGallery as string) === 'gallery_06') &&
      (galleryId === 'gallery-06' ||
        galleryId === 'gallery-05' ||
        galleryId === 'gallery_05' ||
        canon === 'gallery_05')
    ) {
      setIsTransitioningG06ToG05(true);
      return;
    }

    // Camera transition: Gallery 06 -> Gallery 07 (Forward)
    if (
      (currentGallery === 'gallery-07' || (currentGallery as string) === 'gallery_06') &&
      (galleryId === 'gallery-08' ||
        galleryId === 'gallery_07' ||
        galleryId === 'gallery-07' ||
        canon === 'gallery_07' ||
        canon === 'gallery_08')
    ) {
      setIsTransitioningG06ToG07(true);
      return;
    }

    // Camera transition: Gallery 07 -> Gallery 06 (Reverse)
    if (
      (currentGallery === 'gallery-08' || (currentGallery as string) === 'gallery_07') &&
      (galleryId === 'gallery-07' ||
        galleryId === 'gallery-06' ||
        galleryId === 'gallery_06' ||
        canon === 'gallery_06')
    ) {
      setIsTransitioningG07ToG06(true);
      return;
    }

    // Camera transition: Gallery 07 -> Gallery 08 (Forward)
    if (
      (currentGallery === 'gallery-08' || (currentGallery as string) === 'gallery_07') &&
      (galleryId === 'gallery-09' ||
        galleryId === 'gallery_08' ||
        galleryId === 'gallery-08' ||
        canon === 'gallery_08' ||
        canon === 'gallery_09')
    ) {
      setIsTransitioningG07ToG08(true);
      return;
    }

    // Camera transition: Gallery 08 -> Gallery 07 (Reverse)
    if (
      (currentGallery === 'gallery-09' || (currentGallery as string) === 'gallery_08') &&
      (galleryId === 'gallery-08' ||
        galleryId === 'gallery-07' ||
        galleryId === 'gallery_07' ||
        canon === 'gallery_07')
    ) {
      setIsTransitioningG08ToG07(true);
      return;
    }

    markGalleryReached(canon);

    let routeTarget = 'gallery-01';
    if (galleryId === 'gallery-00' || canon === 'gallery_00' || galleryId === 'main-map') {
      setActiveTab('map');
      setCurrentGallery('gallery-00');
      setCurrentGalleryId('gallery-00');
      setAssociatedGallery('gallery-00');
      return;
    } else if (galleryId === 'gallery_01' || galleryId === 'gallery-01') {
      routeTarget = 'gallery-01';
    } else if (galleryId === 'gallery_02' || galleryId === 'gallery-02') {
      routeTarget = 'gallery-03';
    } else if (galleryId === 'gallery_03') {
      routeTarget = 'gallery-04';
    } else if (galleryId === 'gallery_04') {
      routeTarget = 'gallery-05';
    } else if (galleryId === 'gallery_05') {
      routeTarget = 'gallery-06';
    } else if (galleryId === 'gallery_06') {
      routeTarget = 'gallery-07';
    } else if (galleryId === 'gallery_07') {
      routeTarget = 'gallery-08';
    } else if (galleryId === 'gallery_08') {
      routeTarget = 'gallery-09';
    } else if (galleryId === 'gallery-09' || galleryId === 'gallery_09') {
      routeTarget = 'gallery-09';
    } else {
      routeTarget = galleryId.replace('_', '-');
    }

    setCurrentGalleryId(routeTarget);
    setAssociatedGallery(routeTarget);
    setCurrentGallery(routeTarget as any);
  };

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'map' | 'collection' | 'tasks' | 'curator'>('map');
  const [selectedCollection, setSelectedCollection] = useState<MuseumCollection | null>(null);
  const [activeStarDiscoveryId, setActiveStarDiscoveryId] = useState<string | null>(null);
  const [detailModalCollection, setDetailModalCollection] = useState<MuseumCollection | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Track if player has entered Gallery 02 for the first time
  const [hasEnteredGallery02, setHasEnteredGallery02] = useState<boolean>(() => {
    try {
      return localStorage.getItem('museum_has_entered_gallery_02') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (
      currentGallery &&
      currentGallery !== 'gallery-00' &&
      currentGallery !== 'main-map'
    ) {
      setHasEnteredGallery02(true);
      markArrowUsed('arrow-g00-to-g01');
      try {
        localStorage.setItem('museum_has_entered_gallery_01', 'true');
        localStorage.setItem('museum_has_entered_gallery_02', 'true');
        localStorage.setItem('museum_has_entered_any_gallery', 'true');
      } catch {}
    }
  }, [currentGallery]);

  // Automatically mark collections as viewed when active tab is collection
  useEffect(() => {
    if (activeTab === 'collection') {
      markCollectionsAsViewed();
    }
  }, [activeTab]);

  // Map Filter & Zoom & Display Mode states
  const [activeFilter, setActiveFilter] = useState<string>('ALL SECTIONS');
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [mapMode, setMapMode] = useState<MapDisplayMode>('normal');

  // Audio Guide State
  const [playingAudioCollection, setPlayingAudioCollection] = useState<MuseumCollection | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Filtered collections based on wing
  const filteredCollections = MUSEUM_COLLECTIONS.filter((col) => {
    if (activeFilter === 'ALL SECTIONS') return true;
    if (activeFilter === 'WEST WING') return col.wing === 'West Wing';
    if (activeFilter === 'NORTH APSE') return col.wing === 'North Wing';
    if (activeFilter === 'EAST CLOISTER') return col.wing === 'East Wing';
    if (activeFilter === 'SOUTH ROTUNDA') return col.wing === 'South Rotunda';
    return true;
  });

  // Check if a collection is configured as a Star Point in Gallery 00
  const isCollectionStarPoint = (colId: string) => {
    const g00Points = getGalleryPoints('gallery-00');
    return Boolean(
      g00Points.find(
        (p) => p.id === colId && p.type === 'collection' && (p as AdminCollectionPoint).pointType === 'star'
      )
    );
  };

  // Handle marker selection (ensures only 1 preview is open at a time with smooth transition)
  const handleSelectCollection = (col: MuseumCollection) => {
    const isStar = isCollectionStarPoint(col.id);

    if (isStar) {
      const alreadyViewed = hasStarPointBeenViewed(col.id);
      if (!alreadyViewed) {
        // First tap: mark viewed and open preview panel
        markStarPointFirstViewed(col.id);
        setSelectedCollection(col);
      } else {
        // Second tap or returning user: open dedicated Discover More view
        if (selectedCollection?.id === col.id) {
          setSelectedCollection(null);
        }
        setActiveStarDiscoveryId(col.id);
      }
      return;
    }

    // Normal Collection Point
    if (selectedCollection?.id === col.id) {
      // Toggle off if clicking the already open one
      setSelectedCollection(null);
    } else {
      setSelectedCollection(col);
    }
  };

  const handleClearSelection = () => {
    setSelectedCollection(null);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(2.2, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(0.85, Number((prev - 0.25).toFixed(2))));
  };

  const handleResetView = () => {
    setZoomScale(1.0);
  };

  // Audio Guide Toggle
  const handleToggleAudio = (col: MuseumCollection) => {
    if (playingAudioCollection?.id === col.id && isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setPlayingAudioCollection(col);
      setIsPlayingAudio(true);
      setAudioProgress(0);
    }
  };

  // Simulated audio guide playback progress ticker
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  // Keyboard shortcut listener (ESC to close modals or previews, Alt+A or Ctrl+Alt+A for Admin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Admin with Alt+A or Ctrl+Alt+A
      if ((e.altKey && e.key?.toLowerCase() === 'a') || (e.ctrlKey && e.altKey && e.key?.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (isAdminOpen) {
          setIsAdminOpen(false);
        } else if (detailModalCollection) {
          setDetailModalCollection(null);
        } else if (isInfoModalOpen) {
          setIsInfoModalOpen(false);
        } else if (selectedCollection) {
          setSelectedCollection(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminOpen, detailModalCollection, isInfoModalOpen, selectedCollection]);

  // Listen for full game reset event
  useEffect(() => {
    const handleGameReset = () => {
      setUserProfile(null);
      setHasEnteredGallery02(false);
      setIsProfileModalOpen(false);
      setIsFinalCertificateOpen(false);
      setCurrentGallery('gallery-00');
      setSelectedCollection(null);
      setActiveStarDiscoveryId(null);
      setDetailModalCollection(null);
      try {
        if (window.location.hash) {
          window.location.hash = '';
        }
      } catch {}
    };

    window.addEventListener('museum_game_fully_reset', handleGameReset);
    return () => window.removeEventListener('museum_game_fully_reset', handleGameReset);
  }, []);

  // One-time automatic reset triggered by user request
  useEffect(() => {
    const RESET_VERSION = 'v1_reset_2026_09_13_g02_lamp';
    try {
      if (localStorage.getItem('museum_last_reset_version') !== RESET_VERSION) {
        resetEntireGame();
        localStorage.setItem('museum_last_reset_version', RESET_VERSION);
        setCurrentGallery('gallery-00');
      }
    } catch {}
  }, []);

  // Track reached gallery whenever active gallery changes
  useEffect(() => {
    if (currentGallery && currentGallery !== 'gallery-00') {
      markGalleryReached(currentGallery);
    }
  }, [currentGallery]);


  // Load external game content (Questions, Stars, Artworks) on application startup
  useEffect(() => {
    contentService
      .initializeContent()
      .then(() => {
        // Requirement 5: Registration happens during application startup after ContentService has been initialized
        registerContentDebugAPI(contentService);
      })
      .catch((err) => {
        console.warn('[ContentService] Startup initialization notice:', err);
        registerContentDebugAPI(contentService);
      });
  }, []);

  // Requirement 6: Ensure globals persist across React re-renders
  useEffect(() => {
    registerContentDebugAPI(contentService);
  });

  // Render current view
  const renderCurrentView = () => {
    // If Admin Mode is active
    if (isAdminOpen) {
      return (
        <AdminManagementView
          initialGalleryId={
            currentGallery === 'gallery-00'
              ? 'gallery-00'
              : currentGallery === 'gallery-03' || currentGallery === 'gallery-03-questions'
              ? 'gallery-03'
              : 'gallery-01'
          }
          onCloseAdmin={() => setIsAdminOpen(false)}
        />
      );
    }

    // If camera transition from Gallery 01 -> Gallery 02 is running (Forward)
    if (isTransitioningG01ToG02) {
      return (
        <Gallery01To02CameraTransition
          direction="forward"
          onComplete={() => {
            setIsTransitioningG01ToG02(false);
            markGalleryReached('gallery_02');
            setCurrentGalleryId('gallery-03');
            setAssociatedGallery('gallery-03');
            setCurrentGallery('gallery-03' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG01ToG02(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG01ToG02(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 02 -> Gallery 01 is running (Reverse)
    if (isTransitioningG02ToG01) {
      return (
        <Gallery01To02CameraTransition
          direction="reverse"
          onComplete={() => {
            setIsTransitioningG02ToG01(false);
            markGalleryReached('gallery_01');
            setCurrentGalleryId('gallery-01');
            setAssociatedGallery('gallery-01');
            setCurrentGallery('gallery-01' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG02ToG01(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG02ToG01(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 02 -> Gallery 03 is running (Forward)
    if (isTransitioningG02ToG03) {
      return (
        <Gallery02To03CameraTransition
          direction="forward"
          onComplete={() => {
            setIsTransitioningG02ToG03(false);
            markGalleryReached('gallery_03');
            setCurrentGalleryId('gallery-04');
            setAssociatedGallery('gallery-04');
            setCurrentGallery('gallery-04' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG02ToG03(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG02ToG03(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 03 -> Gallery 02 is running (Reverse)
    if (isTransitioningG03ToG02) {
      return (
        <Gallery02To03CameraTransition
          direction="reverse"
          onComplete={() => {
            setIsTransitioningG03ToG02(false);
            markGalleryReached('gallery_02');
            setCurrentGalleryId('gallery-03');
            setAssociatedGallery('gallery-03');
            setCurrentGallery('gallery-03' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG03ToG02(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG03ToG02(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 03 -> Gallery 04 is running (Forward)
    if (isTransitioningG03ToG04) {
      return (
        <Gallery03To04CameraTransition
          direction="forward"
          onComplete={() => {
            setIsTransitioningG03ToG04(false);
            markGalleryReached('gallery_04');
            setCurrentGalleryId('gallery-05');
            setAssociatedGallery('gallery-05');
            setCurrentGallery('gallery-05' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG03ToG04(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG03ToG04(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 04 -> Gallery 03 is running (Reverse)
    if (isTransitioningG04ToG03) {
      return (
        <Gallery03To04CameraTransition
          direction="reverse"
          onComplete={() => {
            setIsTransitioningG04ToG03(false);
            markGalleryReached('gallery_03');
            setCurrentGalleryId('gallery-04');
            setAssociatedGallery('gallery-04');
            setCurrentGallery('gallery-04' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG04ToG03(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG04ToG03(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 04 -> Gallery 05 is running (Forward)
    if (isTransitioningG04ToG05) {
      return (
        <Gallery04To05CameraTransition
          direction="forward"
          onComplete={() => {
            setIsTransitioningG04ToG05(false);
            markGalleryReached('gallery_05');
            setCurrentGalleryId('gallery-06');
            setAssociatedGallery('gallery-06');
            setCurrentGallery('gallery-06' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG04ToG05(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG04ToG05(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 05 -> Gallery 04 is running (Reverse)
    if (isTransitioningG05ToG04) {
      return (
        <Gallery04To05CameraTransition
          direction="reverse"
          onComplete={() => {
            setIsTransitioningG05ToG04(false);
            markGalleryReached('gallery_04');
            setCurrentGalleryId('gallery-05');
            setAssociatedGallery('gallery-05');
            setCurrentGallery('gallery-05' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG05ToG04(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG05ToG04(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 05 -> Gallery 06 is running (Forward)
    if (isTransitioningG05ToG06) {
      return (
        <Gallery05To06CameraTransition
          direction="forward"
          onComplete={() => {
            setIsTransitioningG05ToG06(false);
            markGalleryReached('gallery_06');
            setCurrentGalleryId('gallery-07');
            setAssociatedGallery('gallery-07');
            setCurrentGallery('gallery-07' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG05ToG06(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG05ToG06(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 06 -> Gallery 05 is running (Reverse)
    if (isTransitioningG06ToG05) {
      return (
        <Gallery05To06CameraTransition
          direction="reverse"
          onComplete={() => {
            setIsTransitioningG06ToG05(false);
            markGalleryReached('gallery_05');
            setCurrentGalleryId('gallery-06');
            setAssociatedGallery('gallery-06');
            setCurrentGallery('gallery-06' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG06ToG05(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG06ToG05(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 06 -> Gallery 07 is running (Forward)
    if (isTransitioningG06ToG07) {
      return (
        <Gallery06To07CameraTransition
          direction="forward"
          onComplete={() => {
            setIsTransitioningG06ToG07(false);
            markGalleryReached('gallery_07');
            setCurrentGalleryId('gallery-08');
            setAssociatedGallery('gallery-08');
            setCurrentGallery('gallery-08' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG06ToG07(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG06ToG07(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 07 -> Gallery 06 is running (Reverse)
    if (isTransitioningG07ToG06) {
      return (
        <Gallery06To07CameraTransition
          direction="reverse"
          onComplete={() => {
            setIsTransitioningG07ToG06(false);
            markGalleryReached('gallery_06');
            setCurrentGalleryId('gallery-07');
            setAssociatedGallery('gallery-07');
            setCurrentGallery('gallery-07' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG07ToG06(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG07ToG06(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 07 -> Gallery 08 is running (Forward)
    if (isTransitioningG07ToG08) {
      return (
        <Gallery07To08CameraTransition
          direction="forward"
          onComplete={() => {
            setIsTransitioningG07ToG08(false);
            markGalleryReached('gallery_08');
            setCurrentGalleryId('gallery-09');
            setAssociatedGallery('gallery-09');
            setCurrentGallery('gallery-09' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG07ToG08(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG07ToG08(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

    // If camera transition from Gallery 08 -> Gallery 07 is running (Reverse)
    if (isTransitioningG08ToG07) {
      return (
        <Gallery07To08CameraTransition
          direction="reverse"
          onComplete={() => {
            setIsTransitioningG08ToG07(false);
            markGalleryReached('gallery_07');
            setCurrentGalleryId('gallery-08');
            setAssociatedGallery('gallery-08');
            setCurrentGallery('gallery-08' as any);
          }}
          onNavigateBack={() => {
            setIsTransitioningG08ToG07(false);
            navigateToGalleryWithTrack('gallery-00');
          }}
          onSelectTab={(tab) => {
            setIsTransitioningG08ToG07(false);
            setActiveTab(tab);
            navigateToGalleryWithTrack('gallery-00');
          }}
        />
      );
    }

  // If user navigated into Gallery 03 Questions view
  if (currentGallery === 'gallery-03-questions') {
    return (
      <Gallery03QuestionsView
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-03')}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  // If user navigated into Gallery 09, render the dedicated Gallery 09 view
  if (currentGallery === 'gallery-09') {
    return (
      <Gallery09View
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-00')}
        onNavigateToGallery={(galleryId) => {
          navigateToGalleryWithTrack(galleryId);
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  // If user navigated into Gallery 08, render the dedicated Gallery 08 view
  if (currentGallery === 'gallery-08') {
    return (
      <Gallery08View
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-00')}
        onNavigateToGallery={(galleryId) => {
          navigateToGalleryWithTrack(galleryId);
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  // If user navigated into Gallery 07, render the dedicated Gallery 07 view
  if (currentGallery === 'gallery-07') {
    return (
      <Gallery07View
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-00')}
        onNavigateToGallery={(galleryId) => {
          navigateToGalleryWithTrack(galleryId);
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  // If user navigated into Gallery 06, render the dedicated Gallery 06 view
  if (currentGallery === 'gallery-06') {
    return (
      <Gallery06View
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-00')}
        onNavigateToGallery={(galleryId) => {
          navigateToGalleryWithTrack(galleryId);
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  // If user navigated into Gallery 05, render the dedicated Gallery 05 view
  if (currentGallery === 'gallery-05') {
    return (
      <Gallery05View
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-00')}
        onNavigateToGallery={(galleryId) => {
          navigateToGalleryWithTrack(galleryId);
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  // If user navigated into Gallery 04, render the dedicated Gallery 04 view
  if (currentGallery === 'gallery-04') {
    return (
      <Gallery04View
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-00')}
        onNavigateToGallery={(galleryId) => {
          navigateToGalleryWithTrack(galleryId);
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  // If user navigated into Gallery 03 (or legacy route gallery-02), render the dedicated Gallery 02 view (آلبوم‌های دیپلماتیک)
  if (currentGallery === 'gallery-03' || (currentGallery as string) === 'gallery-02') {
    return (
      <Gallery03View
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-00')}
        onNavigateToQuestions={() => navigateToGalleryWithTrack('gallery-03-questions')}
        onNavigateToGallery={(galleryId) => navigateToGalleryWithTrack(galleryId)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  // If user navigated into Gallery 01 Questions view
  if (currentGallery === 'gallery-01-questions') {
    return (
      <Gallery01QuestionsView
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-01')}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  // If user navigated into Gallery 01, render the dedicated Gallery 01 view (کیمیای نور)
  if (currentGallery === 'gallery-01') {
    return (
      <Gallery01View
        onNavigateBack={() => navigateToGalleryWithTrack('gallery-00')}
        onNavigateToQuestions={() => navigateToGalleryWithTrack('gallery-01-questions')}
        onNavigateToGallery={(galleryId) => navigateToGalleryWithTrack(galleryId)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigateToGalleryWithTrack('gallery-00');
        }}
      />
    );
  }

  return (
    <div className="user-facing-app h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom">
      {/* Top App Bar Header */}
      <TopAppBar
        onOpenInfo={() => setIsInfoModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        activeFilter={activeFilter}
        onFilterChange={(f) => {
          setActiveFilter(f);
          setSelectedCollection(null);
        }}
      />

      {/* Compact Player Status Bar */}
      <PlayerStatusBar puzzles={playerStats.completedPuzzles} stars={playerStats.stars} coins={playerStats.coins} />

      {/* Start Game Navigation Hint */}
      <AnimatePresence>
        {userProfile && !hasEnteredGallery02 && (
          <motion.div
            key="start-game-navigation-hint"
            initial={{ opacity: 0, x: 45, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(2px)', transition: { duration: 0.3 } }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="w-full flex justify-start items-center px-4 pt-1 pb-0.5 z-20 pointer-events-none select-none overflow-hidden"
            dir="rtl"
          >
            <span className="text-[11px] sm:text-xs font-bold text-[#635e59] tracking-tight">
              به طرف فلش و به سمت نمایشگاه حرکت کن
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas Area */}
      <main className="flex-1 min-h-0 relative overflow-hidden bg-[#fbf9f9] flex items-center justify-center mb-[calc(64px+env(safe-area-inset-bottom,0px))] sm:mb-[calc(68px+env(safe-area-inset-bottom,0px))]">
        {activeTab === 'map' && (
          <>
            {/* The Interactive Architectural Map Canvas */}
            <MuseumFloorPlan
              collections={filteredCollections}
              selectedCollection={selectedCollection}
              onSelectCollection={handleSelectCollection}
              onClearSelection={handleClearSelection}
              zoomScale={zoomScale}
              onZoomChange={setZoomScale}
              onNavigateToGallery01={() => navigateToGalleryWithTrack('gallery-01')}
              onNavigateToQuestions={() => navigateToGalleryWithTrack('gallery-01-questions')}
              onNavigateToGallery={(galleryId) => navigateToGalleryWithTrack(galleryId)}
              onSelectTab={(tab) => setActiveTab(tab)}
              mapMode={mapMode}
              onOpenStarDiscovery={(starId) => {
                setActiveStarDiscoveryId(starId);
                setSelectedCollection(null);
              }}
            />

            {/* Floating Circular Gallery Toggle & Gallery Status Controls */}
            <MapControls
              currentView="gallery-00"
              associatedGallery={associatedGallery}
              onToggleGallery={() => {
                const target = getCurrentGalleryId();
                navigateToGalleryWithTrack(target);
              }}
              galleryName="GALLERY 00"
            />
          </>
        )}

        {/* Collection Tab Index */}
        {activeTab === 'collection' && (
          <CollectionListView
            collections={MUSEUM_COLLECTIONS}
            onSelectCollectionOnMap={(col) => {
              setSelectedCollection(col);
              setActiveTab('map');
            }}
            onOpenDetailModal={(col) => setDetailModalCollection(col)}
          />
        )}

        {/* Tasks or Curator Tab */}
        {(activeTab === 'tasks' || activeTab === 'curator') && (
          <TasksCuratorView
            type={activeTab}
            onNavigateToMap={() => setActiveTab('map')}
            onSelectGallery={(galleryId) => {
              setActiveTab('map');
              navigateToGalleryWithTrack(galleryId);
            }}
          />
        )}

        {/* Floating Audio Guide Mini-Player Bar when listening */}
        {playingAudioCollection && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-[#0e0f0f] text-[#fbf9f9] border border-[#c5a059] px-3.5 py-2 shadow-xl flex items-center gap-3 font-mono-custom text-[11px] max-w-[92vw] sm:max-w-md">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              aria-label={isPlayingAudio ? 'Pause audio' : 'Play audio'}
              className="p-1 bg-[#c5a059] text-[#0e0f0f] font-bold cursor-pointer"
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] text-[#c5a059]">
                <span className="truncate uppercase font-bold">
                  راهنمای صوتی: {playingAudioCollection.roomCode}
                </span>
                <span>{playingAudioCollection.audioGuideDuration}</span>
              </div>
              <div className="w-full bg-[#242424] h-1 mt-1 overflow-hidden">
                <div
                  className="bg-[#c5a059] h-full transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                setIsPlayingAudio(false);
                setPlayingAudioCollection(null);
              }}
              aria-label="Close audio guide"
              className="text-[#747878] hover:text-[#fbf9f9] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </main>

      {/* Detail Modal for Full Collection Breakdown */}
      <CollectionDetailModal
        collection={detailModalCollection}
        onClose={() => setDetailModalCollection(null)}
        onAudioPlay={handleToggleAudio}
        isAudioPlaying={
          isPlayingAudio && playingAudioCollection?.id === detailModalCollection?.id
        }
      />

      {/* Museum Guide & Legend Modal */}
      <MuseumInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onOpenAdmin={() => {
          setIsInfoModalOpen(false);
          setIsAdminOpen(true);
        }}
        onNavigateToGallery={(galleryId) => {
          setCurrentGallery(galleryId);
        }}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedCollection(null);
          if (tab === 'collection') {
            markCollectionsAsViewed();
          }
        }}
      />

      {/* Star Point Discovery Modal for Gallery 00 Star Points */}
      {activeStarDiscoveryId && (
        <StarDiscoveryModal
          starPointId={activeStarDiscoveryId}
          galleryId="gallery-00"
          isOpen={!!activeStarDiscoveryId}
          onClose={() => setActiveStarDiscoveryId(null)}
        />
      )}
    </div>
    );
  };

  return (
    <>
      {renderCurrentView()}
      {!userProfile && (
        <ProfileCreationPage
          onProfileCreated={() => setUserProfile(getUserProfile())}
        />
      )}
      {userProfile && (
        <>
          {IS_DEV_POSITIONING_ENABLED && !isAdminOpen && !currentGallery.includes('questions') && (
            <DevMapPositioningTool currentGalleryId={currentGallery} activeTab={activeTab} />
          )}
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
          <FinalCertificateModal
            isOpen={isFinalCertificateOpen}
            onClose={() => setIsFinalCertificateOpen(false)}
          />
        </>
      )}
    </>
  );
}
