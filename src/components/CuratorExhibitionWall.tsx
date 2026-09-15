import React, { useState, useEffect, useRef } from 'react';
import { ArtworkFrame } from './ArtworkFrame';
import { contentService } from '../services/content/contentService';
import { isGalleryPuzzleCompleted } from '../data/puzzleProgressStore';
import { GALLERIES } from '../data/mapConfig';
import { MapPin, X, Eye, Lock, Sparkles, Award } from 'lucide-react';
import {
  areAll8GalleryPuzzlesCompleted,
  isFinalCompletionAwarded,
} from '../data/finalCompletionStore';
import { FinalCompletionCardBack } from './FinalCompletionCardBack';
import {
  getCuratorFrameConfig,
  CURATOR_VIRTUAL_WIDTH,
  CURATOR_VIRTUAL_HEIGHT,
  DEFAULT_CURATOR_FRAME_MAP,
  DEFAULT_SALON_SLOTS_LIST,
  WallFramePosition,
  getArtworkRealAspectRatio,
  registerArtworkRealAspectRatio,
  preloadArtworkImageRatio,
  calculateFittedFrameDimensions,
} from '../data/curatorWallStore';

export interface ExhibitionArtwork {
  id: string;
  galleryId: string;
  galleryName: string;
  galleryNameFa: string;
  title: string;
  imageUrl: string;
  isCompleted: boolean;
  aspectRatio: number; // width / height
  description?: string;
}

interface CuratorExhibitionWallProps {
  onNavigateToMap?: () => void;
  onOpenDetailModal?: (item: any) => void;
}

// Virtual salon wall coordinate space (720 x 580)
// Derived with 1:1 fidelity from the user's reference diagram (image.png)
const SALON_SLOTS: WallFramePosition[] = DEFAULT_SALON_SLOTS_LIST;

export const CuratorExhibitionWall: React.FC<CuratorExhibitionWallProps> = ({
  onNavigateToMap,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  const [selectedArtwork, setSelectedArtwork] = useState<ExhibitionArtwork | null>(null);
  const [lockedHint, setLockedHint] = useState<string | null>(null);
  const [wallTheme, setWallTheme] = useState<'light' | 'dark'>('light');
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  // Load artworks dynamically from ContentService and check completion via puzzleProgressStore
  const [artworks, setArtworks] = useState<ExhibitionArtwork[]>([]);
  const [wallConfigVersion, setWallConfigVersion] = useState<number>(0);
  const [liveDragOverrides, setLiveDragOverrides] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});

  const refreshArtworks = () => {
    // Gallery ordering matching salon frame orientations in image.png:
    // Slot 0: Top-Left (Portrait) -> Gallery 01
    // Slot 1: Bottom-Left (Landscape) -> Gallery 03
    // Slot 2: Top-Center (Portrait) -> Gallery 04
    // Slot 3: Center-Middle (Wide Landscape) -> Gallery 05
    // Slot 4: Bottom-Center (Portrait) -> Gallery 06
    // Slot 5: Top-Right (Landscape) -> Gallery 08
    // Slot 6: Bottom-Right (Wide Landscape) -> Gallery 09
    // Slot 7: Mid-Right Extension -> Gallery 07
    const desiredGalleryOrder = [
      'gallery-01',
      'gallery-03',
      'gallery-04',
      'gallery-05',
      'gallery-06',
      'gallery-08',
      'gallery-09',
      'gallery-07',
    ];

    // Filter galleries 01 to 09 (ignoring gallery-00 rotunda and gallery-02 coming soon)
    const validGalleries = GALLERIES.filter(
      (g) => g.id !== 'gallery-00' && g.id !== 'gallery-02' && g.id.startsWith('gallery-')
    ).sort((a, b) => {
      const idxA = desiredGalleryOrder.indexOf(a.id);
      const idxB = desiredGalleryOrder.indexOf(b.id);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    const list: ExhibitionArtwork[] = validGalleries.map((g, idx) => {
      const puzzleArtwork = contentService.getGalleryPuzzleArtwork(g.id);
      const dynamicSrc = contentService.getGalleryPuzzleArtworkSrc(g.id);
      const completed = isGalleryPuzzleCompleted(g.id);

      const title = puzzleArtwork?.title || g.nameFa;
      const imageUrl = dynamicSrc || puzzleArtwork?.imageUrl || '';

      // Preload image dimensions in background for empty & completed frames
      if (imageUrl) {
        preloadArtworkImageRatio(g.id, imageUrl);
      }

      const fallbackSlot =
        DEFAULT_CURATOR_FRAME_MAP[g.id] ||
        DEFAULT_SALON_SLOTS_LIST[idx % DEFAULT_SALON_SLOTS_LIST.length];
      const frameConfig = getCuratorFrameConfig(g.id, fallbackSlot, idx);
      const realRatio = getArtworkRealAspectRatio(g.id, imageUrl);
      const aspectRatio = realRatio || frameConfig.aspectRatio || 1;

      return {
        id: `artwork-${g.id}`,
        galleryId: g.id,
        galleryName: g.name,
        galleryNameFa: g.nameFa,
        title,
        imageUrl,
        isCompleted: completed,
        aspectRatio,
        description: puzzleArtwork?.description,
      };
    });

    setArtworks(list);
  };

  useEffect(() => {
    refreshArtworks();

    const handleUpdate = () => {
      refreshArtworks();
      setWallConfigVersion((v) => v + 1);
    };

    const handleCuratorConfigUpdate = () => {
      setWallConfigVersion((v) => v + 1);
    };

    const handleAspectRatioUpdate = () => {
      refreshArtworks();
      setWallConfigVersion((v) => v + 1);
    };

    const handleLiveDrag = (e: Event) => {
      const customEvent = e as CustomEvent<{
        galleryId: string;
        coords: { x: number; y: number; width: number; height: number };
      }>;
      if (customEvent.detail?.galleryId && customEvent.detail.coords) {
        setLiveDragOverrides((prev) => ({
          ...prev,
          [customEvent.detail.galleryId]: customEvent.detail.coords,
        }));
      }
    };

    const handleLiveDragEnd = () => {
      setLiveDragOverrides({});
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('gallery_questions_artwork_updated', handleUpdate);
    window.addEventListener('museum_progress_reset', handleUpdate);
    window.addEventListener('curator_wall_config_updated', handleCuratorConfigUpdate);
    window.addEventListener('artwork_aspect_ratio_updated', handleAspectRatioUpdate);
    window.addEventListener('curator_frame_live_drag', handleLiveDrag);
    window.addEventListener('curator_frame_live_drag_end', handleLiveDragEnd);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('gallery_questions_artwork_updated', handleUpdate);
      window.removeEventListener('museum_progress_reset', handleUpdate);
      window.removeEventListener('curator_wall_config_updated', handleCuratorConfigUpdate);
      window.removeEventListener('artwork_aspect_ratio_updated', handleAspectRatioUpdate);
      window.removeEventListener('curator_frame_live_drag', handleLiveDrag);
      window.removeEventListener('curator_frame_live_drag_end', handleLiveDragEnd);
    };
  }, []);

  // Measure container using ResizeObserver to ensure 100% responsive fit on all screens
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const slots = SALON_SLOTS;

  // Calculate geometry for every artwork frame relative to background coordinate system
  const frameItems = artworks.map((art, index) => {
    const fallbackSlot = slots[index] || slots[slots.length - 1];
    const frameConfig = getCuratorFrameConfig(art.galleryId, fallbackSlot, index);
    const liveOverride = liveDragOverrides[art.galleryId] as
      | { x: number; y: number; width: number; height: number; centerX?: number; centerY?: number }
      | undefined;

    const centerNormX =
      liveOverride && typeof liveOverride.centerX === 'number'
        ? liveOverride.centerX / CURATOR_VIRTUAL_WIDTH
        : liveOverride
        ? (liveOverride.x + liveOverride.width / 2) / CURATOR_VIRTUAL_WIDTH
        : frameConfig.centerNormX;

    const centerNormY =
      liveOverride && typeof liveOverride.centerY === 'number'
        ? liveOverride.centerY / CURATOR_VIRTUAL_HEIGHT
        : liveOverride
        ? (liveOverride.y + liveOverride.height / 2) / CURATOR_VIRTUAL_HEIGHT
        : frameConfig.centerNormY;

    const refWidth = liveOverride?.width ?? frameConfig.refWidth ?? frameConfig.width;
    const refHeight = liveOverride?.height ?? frameConfig.refHeight ?? frameConfig.height;

    // Real ratio of the artwork preserved for aperture fitting
    const realRatio =
      getArtworkRealAspectRatio(art.galleryId, art.imageUrl) ||
      art.aspectRatio ||
      frameConfig.aspectRatio ||
      refWidth / Math.max(1, refHeight);

    const centerX = centerNormX * CURATOR_VIRTUAL_WIDTH;
    const centerY = centerNormY * CURATOR_VIRTUAL_HEIGHT;

    // Dynamically calculate fitted frame dimensions: strictly matching artwork aspect ratio,
    // sized from stored reference dimensions, bounded safely within 580x720 canvas
    const fitted = calculateFittedFrameDimensions(
      centerX,
      centerY,
      refWidth,
      refHeight,
      realRatio,
      true
    );

    return {
      art,
      index,
      frameConfig,
      realRatio,
      refWidth: fitted.width,
      refHeight: fitted.height,
      centerX: fitted.centerX,
      centerY: fitted.centerY,
      centerNormX: fitted.centerNormX,
      centerNormY: fitted.centerNormY,
      normWidth: fitted.normWidth,
      normHeight: fitted.normHeight,
      rotation: frameConfig.rotation ?? 0,
    };
  });

  // Compute available space with safe content boundary padding
  const paddingX = dimensions.width >= 640 ? 24 : dimensions.width >= 400 ? 12 : 6;
  const paddingY = dimensions.height >= 640 ? 24 : dimensions.height >= 400 ? 12 : 6;
  const availableWallWidth = Math.max(dimensions.width - paddingX * 2, 80);
  const availableWallHeight = Math.max(dimensions.height - paddingY * 2, 80);

  // Background salon wall scales uniformly while keeping reference aspect ratio (580 / 720)
  const bgAspectRatio = CURATOR_VIRTUAL_WIDTH / CURATOR_VIRTUAL_HEIGHT;
  let wallWidth = availableWallWidth;
  let wallHeight = wallWidth / bgAspectRatio;
  if (wallHeight > availableWallHeight) {
    wallHeight = availableWallHeight;
    wallWidth = wallHeight * bgAspectRatio;
  }

  // Global wall scale factor relative to 580 reference width
  const wallScale = wallWidth / CURATOR_VIRTUAL_WIDTH;

  const handleFrameClick = (art: ExhibitionArtwork) => {
    // If dev positioning tool is active on screen, select this frame for editing
    if (typeof document !== 'undefined' && document.querySelector('#dev-map-positioning-layer')) {
      window.dispatchEvent(
        new CustomEvent('dev_select_curator_frame', {
          detail: { galleryId: art.galleryId },
        })
      );
      return;
    }

    if (art.isCompleted) {
      setSelectedArtwork(art);
      setLockedHint(null);
    } else {
      setLockedHint(`اثر مربوط به «${art.galleryNameFa}» هنوز کشف نشده است.`);
      setTimeout(() => {
        setLockedHint((prev) => (prev ? null : prev));
      }, 3500);
    }
  };

  const isLight = wallTheme === 'light';
  const isAllExhibitionCompleted =
    artworks.length > 0 &&
    (artworks.every((a) => a.isCompleted) ||
      areAll8GalleryPuzzlesCompleted() ||
      isFinalCompletionAwarded());

  return (
    <div
      ref={containerRef}
      id="curator-collection-single-screen-view"
      className="relative w-full h-full overflow-hidden select-none flex flex-col justify-between bg-[#eceae4]"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 32%, #faf8f5 0%, #e5e2d8 100%)',
      }}
    >
      {/* Final Certificate Floating Button when all 8 artworks are completed */}
      {isAllExhibitionCompleted && (
        <div className="absolute top-3 left-3 z-20">
          <button
            type="button"
            id="curator-wall-certificate-badge-btn"
            onClick={() => setShowCertificate(true)}
            className="py-2 px-3 sm:px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e1b18] font-sans-custom font-black text-[12px] sm:text-[13px] rounded-xl border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1e1b18]" />
            <span>گواهی‌نامه نهایی موزه 🏆</span>
          </button>
        </div>
      )}

      {/* Main Single-Screen Wall Area - Centered in available space */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-2 sm:p-4">
        {/* Museum Wall Lighting Subtle Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.7) 0%, rgba(220, 216, 206, 0.3) 75%)',
          }}
        />

        {/* The Scaled Salon Wall Canvas (Reference coordinate system: 580 x 720) */}
        <div
          id="museum-salon-wall"
          data-virtual-width={CURATOR_VIRTUAL_WIDTH}
          data-virtual-height={CURATOR_VIRTUAL_HEIGHT}
          className="relative flex-none"
          style={{
            width: `${Math.round(wallWidth)}px`,
            height: `${Math.round(wallHeight)}px`,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {frameItems.map((item) => {
            const { art, realRatio } = item;

            // Virtual SVG coordinate system scaled to rendered wall
            // wallScale = wallWidth / 580
            const pixelCenterX = item.centerX * wallScale;
            const pixelCenterY = item.centerY * wallScale;
            const pixelWidth = item.refWidth * wallScale;
            const pixelHeight = item.refHeight * wallScale;

            return (
              <div
                key={art.id}
                id={`wall-frame-item-${art.galleryId}`}
                onClick={() => handleFrameClick(art)}
                className="absolute cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] z-10"
                style={{
                  left: `${pixelCenterX}px`,
                  top: `${pixelCenterY}px`,
                  width: `${pixelWidth}px`,
                  height: `${pixelHeight}px`,
                  transform: `translate(-50%, -50%) ${item.rotation ? `rotate(${item.rotation}deg)` : ''}`,
                }}
                title={art.isCompleted ? art.title : 'اثر قفل است'}
              >
                {/* Single unified Artwork Frame: strictly matches artwork aspect ratio */}
                <ArtworkFrame
                  fillContainer
                  aspectRatio={realRatio}
                  wallScale={wallScale}
                  frameWidth={pixelWidth}
                  frameHeight={pixelHeight}
                  className="w-full h-full shadow-[0_8px_20px_-4px_rgba(30,27,24,0.22)]"
                >
                  {art.isCompleted && art.imageUrl ? (
                    /* Completed Artwork Image: Fits snugly without cropping or distortion, zero black areas */
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#faf8f5]">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-fill select-none pointer-events-none block"
                        loading="lazy"
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                            registerArtworkRealAspectRatio(
                              art.galleryId,
                              art.imageUrl,
                              img.naturalWidth / img.naturalHeight
                            );
                          }
                        }}
                      />
                    </div>
                  ) : (
                    /* Incomplete / Empty Frame: Same dimensions and aperture with elegant museum backing */
                    <div
                      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-[#f8f6f0]"
                      style={{
                        backgroundImage:
                          'radial-gradient(ellipse at 50% 50%, #faf8f3 0%, #eae5d8 100%)',
                      }}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div
                          className="rounded-full bg-[#fef3c7] border border-[#d97706] flex items-center justify-center shadow-xs"
                          style={{
                            width: `${Math.max(14, Math.min(26, Math.round(pixelWidth * 0.16)))}px`,
                            height: `${Math.max(14, Math.min(26, Math.round(pixelWidth * 0.16)))}px`,
                          }}
                        >
                          <Lock
                            className="text-[#b45309]"
                            style={{
                              width: `${Math.max(8, Math.min(15, Math.round(pixelWidth * 0.09)))}px`,
                              height: `${Math.max(8, Math.min(15, Math.round(pixelWidth * 0.09)))}px`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </ArtworkFrame>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Notification for Incomplete/Empty Frame click */}
      {lockedHint && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#ffffff] border-2 border-[#1e1b18] text-[#1e1b18] px-4 py-2.5 rounded-2xl shadow-[4px_4px_0px_#1e1b18] flex items-center gap-2.5 max-w-[90%] text-center animate-in fade-in slide-in-from-bottom-2">
          <div className="w-6 h-6 rounded-full bg-[#fef3c7] border border-[#d97706] flex items-center justify-center shrink-0">
            <Lock className="w-3.5 h-3.5 text-[#b45309]" />
          </div>
          <span className="font-sans-custom text-[12px] font-bold text-[#1e1b18]">{lockedHint}</span>
          {onNavigateToMap && (
            <button
              onClick={onNavigateToMap}
              className="neo-btn bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] px-3 py-1 rounded-xl text-[11px] font-black font-sans-custom mr-1 cursor-pointer flex-none flex items-center gap-1 border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18]"
            >
              <MapPin className="w-3 h-3 text-[#b45309]" />
              <span>نقشه</span>
            </button>
          )}
        </div>
      )}

      {/* Completed Artwork Preview Modal */}
      {selectedArtwork && (
        <div
          id="artwork-detail-overlay"
          className="fixed inset-0 z-50 bg-[#1e1b18]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none"
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            className="bg-[#ffffff] border-[2.5px] border-[#1e1b18] max-w-md w-full p-5 sm:p-6 rounded-3xl shadow-[6px_6px_0px_#1e1b18] relative select-none animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#fee2e2] hover:bg-[#ef4444] hover:text-white transition-all text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              <span className="font-sans-custom text-[11px] text-[#ea580c] font-black tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                {selectedArtwork.galleryNameFa}
              </span>

              {/* Framed Image */}
              <div className="my-2">
                <ArtworkFrame className="shadow-2xl">
                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    className="max-h-[220px] sm:max-h-[260px] w-auto object-contain"
                  />
                </ArtworkFrame>
              </div>

              {/* Title & Info */}
              <div>
                <h3 className="font-sans-custom text-[18px] sm:text-[20px] font-black text-[#1e1b18]">
                  {selectedArtwork.title}
                </h3>
                {selectedArtwork.description && (
                  <p className="text-[12.5px] text-[#475569] font-sans-custom leading-relaxed mt-1.5 line-clamp-3">
                    {selectedArtwork.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 w-full">
                {onNavigateToMap && (
                  <button
                    onClick={() => {
                      setSelectedArtwork(null);
                      onNavigateToMap();
                    }}
                    className="neo-btn flex-1 py-2.5 bg-[#fef3c7] hover:bg-[#fde047] text-[#1e1b18] font-sans-custom text-[12px] font-black rounded-xl flex items-center justify-center gap-1.5 border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>مشاهده در نقشه</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="neo-btn px-4 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e1b18] font-sans-custom text-[12px] font-bold rounded-xl border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Completion Certificate Modal */}
      {showCertificate && (
        <div
          id="curator-wall-certificate-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
          onClick={() => setShowCertificate(false)}
        >
          <div
            className="w-full max-w-md bg-[#fcfaf7] rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <FinalCompletionCardBack
              onClose={() => setShowCertificate(false)}
              onFlipBack={() => setShowCertificate(false)}
              isFlipped={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
