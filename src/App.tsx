/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MUSEUM_COLLECTIONS } from './data/museumCollections';
import { MuseumCollection, MapDisplayMode } from './types';
import { MuseumFloorPlan } from './components/MuseumFloorPlan';
import { CollectionPreviewPanel } from './components/CollectionPreviewPanel';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { MapControls } from './components/MapControls';
import { CollectionDetailModal } from './components/CollectionDetailModal';
import { MuseumInfoModal } from './components/MuseumInfoModal';
import { CollectionListView } from './components/CollectionListView';
import { TasksCuratorView } from './components/TasksCuratorView';
import { Gallery01View } from './components/Gallery01View';
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
import { getCurrentGalleryId, setCurrentGalleryId } from './data/playerLocationStore';
import { contentService, registerContentDebugAPI } from './services/content';
import { Volume2, Pause, Play, X, Compass, Sparkles } from 'lucide-react';
import { DevMapPositioningTool, IS_DEV_POSITIONING_ENABLED } from './components/DevMapPositioningTool';
import { ProfileCreationPage } from './components/ProfileCreationPage';
import { ProfileModal } from './components/ProfileModal';
import { getUserProfile, UserProfile } from './data/userProfileStore';

export default function App() {
  const playerStats = usePlayerStats();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getUserProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
    const norm = galleryId.replace('_', '-');
    markGalleryReached(norm);
    setCurrentGalleryId(norm);
    setAssociatedGallery(getCurrentGalleryId());

    if (norm === 'gallery-09') {
      setCurrentGallery('gallery-09');
    } else if (norm === 'gallery-08') {
      setCurrentGallery('gallery-08');
    } else if (norm === 'gallery-07') {
      setCurrentGallery('gallery-07');
    } else if (norm === 'gallery-06') {
      setCurrentGallery('gallery-06');
    } else if (norm === 'gallery-05') {
      setCurrentGallery('gallery-05');
    } else if (norm === 'gallery-04') {
      setCurrentGallery('gallery-04');
    } else if (norm === 'gallery-03' || norm === 'gallery-03-questions') {
      setCurrentGallery(norm as any);
    } else if (norm === 'gallery-01' || norm === 'gallery-01-questions' || norm === 'gallery-02') {
      const target = norm === 'gallery-02' ? 'gallery-01' : norm;
      setCurrentGallery(target as any);
    } else if (norm === 'gallery-00' || norm === 'main-map') {
      setActiveTab('map');
      setCurrentGallery('gallery-00');
    } else {
      setCurrentGallery(norm as any);
    }
  };

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'map' | 'collection' | 'tasks' | 'curator'>('map');
  const [selectedCollection, setSelectedCollection] = useState<MuseumCollection | null>(null);
  const [activeStarDiscoveryId, setActiveStarDiscoveryId] = useState<string | null>(null);
  const [detailModalCollection, setDetailModalCollection] = useState<MuseumCollection | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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

  // If user navigated into Gallery 03, render the dedicated Gallery 03 view
  if (currentGallery === 'gallery-03') {
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

  // If user navigated into Gallery 01 or 02, render the dedicated Gallery view (Gallery 02 - کیمیای نور)
  if (currentGallery === 'gallery-01' || (currentGallery as string) === 'gallery-02') {
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

            {/* Collection Preview Panel with Wall-Origin Motion */}
            <CollectionPreviewPanel
              collection={selectedCollection}
              onClose={handleClearSelection}
              onOpenFullDetail={(col) => setDetailModalCollection(col)}
              onAudioPlay={handleToggleAudio}
              isAudioPlaying={
                isPlayingAudio && playingAudioCollection?.id === selectedCollection?.id
              }
              isStarPoint={selectedCollection ? isCollectionStarPoint(selectedCollection.id) : false}
              onOpenStarDiscovery={() => {
                if (selectedCollection) {
                  setActiveStarDiscoveryId(selectedCollection.id);
                  setSelectedCollection(null);
                }
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
              const norm = galleryId.toLowerCase().replace('_', '-');
              setCurrentGallery(norm as any);
              setActiveTab('map');
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
        }}
        collectionCount={MUSEUM_COLLECTIONS.length}
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
      {!userProfile ? (
        <ProfileCreationPage
          onProfileCreated={() => setUserProfile(getUserProfile())}
        />
      ) : (
        <>
          {renderCurrentView()}
          {IS_DEV_POSITIONING_ENABLED && !isAdminOpen && !currentGallery.includes('questions') && (
            <DevMapPositioningTool currentGalleryId={currentGallery} activeTab={activeTab} />
          )}
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        </>
      )}
    </>
  );
}
