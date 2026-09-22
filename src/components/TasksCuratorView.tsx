import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lock, Unlock, Star, CheckCircle2, ChevronLeft } from 'lucide-react';
import { CuratorExhibitionWall } from './CuratorExhibitionWall';
import { GalleryLockModal } from './GalleryLockModal';
import { contentService } from '../services/content/contentService';
import { DEFAULT_GALLERIES } from '../services/content/defaultSeedContent';
import {
  isStarPointUnlocked,
  isStarPointInformationUnlocked,
} from '../data/starPointProgressStore';
import { isGalleryPuzzleCompleted } from '../data/puzzleProgressStore';
import { isGalleryReached, isGalleryManuallyUnlocked } from '../data/reachedGalleriesStore';
import {
  normalizeGalleryId,
  getLogicalGalleryNumber,
  toPersianDigits,
  formatTwoDigitPersian,
} from '../services/content/mappers';
import { StarContent, GalleryContent } from '../services/content/types';

interface TasksCuratorViewProps {
  type: 'tasks' | 'curator';
  onNavigateToMap: () => void;
  onSelectGallery?: (galleryId: string) => void;
}

/**
 * Checks whether a gallery is unlocked based on authoritative progression rules and puzzle state.
 */
function isGalleryUnlockedState(galleryId: string): boolean {
  const canon = normalizeGalleryId(galleryId);
  if (canon === 'gallery_00' || canon === 'gallery_01') return true;

  return (
    isGalleryReached(canon) ||
    isGalleryReached(galleryId) ||
    isGalleryManuallyUnlocked(canon) ||
    isGalleryManuallyUnlocked(galleryId)
  );
}

function parseGalleryTitle(rawFa: string): string {
  if (!rawFa) return '';
  let title = rawFa.trim();
  if (title.includes(' — ')) {
    const parts = title.split(' — ');
    return parts[parts.length - 1].trim();
  }
  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    return parts[parts.length - 1].trim();
  }
  return title;
}

export const TasksCuratorView: React.FC<TasksCuratorViewProps> = ({
  type,
  onNavigateToMap,
  onSelectGallery,
}) => {
  const [version, setVersion] = useState<number>(0);
  const [selectedLockGallery, setSelectedLockGallery] = useState<{ galleryId: string; title?: string } | null>(null);

  const refreshState = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const unsub = contentService.subscribe(refreshState);
    window.addEventListener('museum_star_point_progress_updated', refreshState);
    window.addEventListener('museum_player_progress_updated', refreshState);
    window.addEventListener('museum_puzzle_progress_updated', refreshState);
    window.addEventListener('museum_completed_gallery_puzzles_updated', refreshState);
    window.addEventListener('museum_gallery_reached', refreshState);
    window.addEventListener('museum_gallery_manually_unlocked', refreshState);

    return () => {
      unsub();
      window.removeEventListener('museum_star_point_progress_updated', refreshState);
      window.removeEventListener('museum_player_progress_updated', refreshState);
      window.removeEventListener('museum_puzzle_progress_updated', refreshState);
      window.removeEventListener('museum_completed_gallery_puzzles_updated', refreshState);
      window.removeEventListener('museum_gallery_reached', refreshState);
      window.removeEventListener('museum_gallery_manually_unlocked', refreshState);
    };
  }, [refreshState]);

  // If in Curator tab, render the single-screen exhibition salon wall
  if (type === 'curator') {
    return <CuratorExhibitionWall onNavigateToMap={onNavigateToMap} />;
  }

  // Authoritative Google Sheets Galleries data as source of truth
  const rawGalleries: GalleryContent[] = contentService.getGalleries();
  const sourceGalleries = rawGalleries && rawGalleries.length > 0 ? rawGalleries : DEFAULT_GALLERIES;

  // Deduplicate and filter canonical galleries (01 to 08 only, strictly no gallery 09 or master map 00)
  const canonicalGalleryMap = new Map<string, GalleryContent>();

  for (const g of sourceGalleries) {
    if (g.active === false) continue;
    const canonId = normalizeGalleryId(g.galleryId || g.id);
    if (!canonId || canonId === 'gallery_00') continue;

    const numInt =
      getLogicalGalleryNumber(canonId) ??
      (g.galleryNumber ? parseInt(g.galleryNumber, 10) : null);

    // Only accept valid exhibition galleries 1 through 8
    if (numInt === null || numInt < 1 || numInt > 8) continue;

    if (!canonicalGalleryMap.has(canonId)) {
      canonicalGalleryMap.set(canonId, g);
    }
  }

  // Ensure all 8 galleries exist from canonical defaults if missing from active sheet rows
  for (let i = 1; i <= 8; i++) {
    const cid = `gallery_0${i}`;
    if (!canonicalGalleryMap.has(cid)) {
      const defaultG = DEFAULT_GALLERIES.find((dg) => dg.id === cid || dg.galleryId === cid);
      if (defaultG) {
        canonicalGalleryMap.set(cid, defaultG);
      }
    }
  }

  const allStars: StarContent[] = contentService.getStars().filter((s) => s.active !== false);

  // Build card data for each canonical gallery
  const galleryCards = Array.from(canonicalGalleryMap.entries()).map(([canonId, gallery]) => {
    const numInt =
      getLogicalGalleryNumber(canonId) ??
      (gallery.galleryNumber ? parseInt(gallery.galleryNumber, 10) : 1);

    const formattedNum = numInt < 10 ? `0${numInt}` : `${numInt}`;
    const faNum = formatTwoDigitPersian(numInt);

    const rawFa = gallery.nameFa || gallery.nameEn || '';
    const title = parseGalleryTitle(rawFa);
    const subtitle = `گالری ${faNum} • Gallery ${formattedNum}`;

    const isUnlocked = isGalleryUnlockedState(canonId);
    const isPuzzleCompleted = isGalleryPuzzleCompleted(canonId);
    const isComplete = isPuzzleCompleted;

    // Calculate stars belonging strictly to this canonical gallery
    const galleryStars = allStars.filter((s) => {
      if (!s.galleryId) return false;
      const sCanon = normalizeGalleryId(s.galleryId);
      return sCanon === canonId;
    });

    const totalStars = galleryStars.length;
    let collectedStars = 0;
    if (totalStars > 0) {
      collectedStars = galleryStars.filter((star) => {
        return (
          isStarPointUnlocked(star.id) ||
          (star.starId && isStarPointUnlocked(star.starId)) ||
          isStarPointInformationUnlocked(star.id)
        );
      }).length;
    }

    return {
      id: canonId,
      numInt,
      number: formattedNum,
      numberPersian: faNum,
      title,
      subtitle,
      isUnlocked,
      isComplete,
      isPuzzleCompleted,
      collectedStars,
      totalStars,
      progressPercent:
        totalStars > 0
          ? Math.min(100, Math.round((collectedStars / totalStars) * 100))
          : isPuzzleCompleted
          ? 100
          : 0,
    };
  });

  // Sort numerically: 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08
  galleryCards.sort((a, b) => a.numInt - b.numInt);

  const totalUnlockedCount = galleryCards.filter((g) => g.isUnlocked).length;
  const totalStarsCollected = galleryCards.reduce((sum, g) => sum + g.collectedStars, 0);
  const totalStarsAvailable = galleryCards.reduce((sum, g) => sum + g.totalStars, 0);

  return (
    <div
      id="tasks-gallery-progress"
      className="w-full h-full overflow-y-auto p-3.5 sm:p-6 space-y-5 pb-28 max-w-2xl mx-auto select-none"
    >
      {/* Page Header */}
      <div className="border-b-2 border-[#1e1b18] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-sans-custom text-[20px] sm:text-[22px] font-black text-[#1e1b18] tracking-tight">
            مراحل و گالری ها
          </h1>
        </div>

        {/* Global Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#1e1b18] bg-[#e0f2fe] shadow-[1.5px_1.5px_0px_#1e1b18] text-[#1e1b18] font-bold text-xs">
            <Unlock className="w-3.5 h-3.5 text-[#0284c7]" />
            <span className="font-sans-custom">
              {toPersianDigits(totalUnlockedCount)} از {toPersianDigits(galleryCards.length)} تالار
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#1e1b18] bg-[#fef08a] shadow-[1.5px_1.5px_0px_#1e1b18] text-[#1e1b18] font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#1e1b18] stroke-[2]" />
            <span className="font-sans-custom">
              {toPersianDigits(totalStarsCollected)} از {toPersianDigits(totalStarsAvailable)} ستاره
            </span>
          </div>
        </div>
      </div>

      {/* Main Board Container with Stacked Gallery Cards */}
      <div
        id="missions-board-container"
        className="rounded-3xl border-2 border-[#1e1b18] bg-[#38bdf8]/15 p-3.5 sm:p-5 shadow-[4px_4px_0px_#1e1b18] space-y-3 sm:space-y-3.5"
      >
        {galleryCards.map((card) => {
          const handleCardClick = () => {
            if (!card.isUnlocked) {
              setSelectedLockGallery({ galleryId: card.id, title: card.title });
              return;
            }
            if (onSelectGallery) {
              onSelectGallery(card.id);
            }
          };

          return (
            <div
              key={card.id}
              id={`mission-card-${card.id}`}
              role="button"
              tabIndex={0}
              onClick={handleCardClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick();
                }
              }}
              className="w-full rounded-2xl border-2 transition-all duration-150 flex items-center justify-between px-3.5 sm:px-4 py-3 gap-3 bg-[#ffffff] border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18] hover:shadow-[4px_4px_0px_#1e1b18] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1e1b18] cursor-pointer"
            >
              {/* Right Side: Lock/Unlock Medallion + Vertical Divider + Title & Number */}
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                {/* Status Icon */}
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    card.isComplete
                      ? 'bg-[#dcfce7] border-[#1e1b18] text-[#15803d] shadow-[1.5px_1.5px_0px_#1e1b18]'
                      : !card.isUnlocked
                      ? 'bg-[#fed7aa] border-[#1e1b18] text-[#ea580c] shadow-[1.5px_1.5px_0px_#1e1b18]'
                      : 'bg-[#e0f2fe] border-[#1e1b18] text-[#0284c7] shadow-[1.5px_1.5px_0px_#1e1b18]'
                  }`}
                >
                  {card.isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-[#15803d]" />
                  ) : !card.isUnlocked ? (
                    <Lock className="w-5 h-5 text-[#ea580c]" />
                  ) : (
                    <Unlock className="w-5 h-5 text-[#0284c7]" />
                  )}
                </div>

                {/* Vertical Separator Line */}
                <div className="w-[1.5px] sm:w-[2px] h-8 sm:h-9 rounded-full shrink-0 bg-[#1e1b18]/20" />

                {/* Left of Line: Gallery Name & Gallery Number */}
                <div className="flex flex-col text-right justify-center min-w-0">
                  <h3 className="font-sans-custom text-[14px] sm:text-[15.5px] font-black leading-snug truncate text-[#1e1b18]">
                    {card.title}
                  </h3>
                  <span className="font-mono-custom text-[11px] sm:text-[12px] mt-0.5 font-bold truncate text-[#64748b]">
                    {card.subtitle}
                  </span>
                </div>
              </div>

              {/* Left End: Navigation Arrow / Status */}
              <div className="flex items-center gap-1.5 shrink-0 pr-1">
                <div className="flex items-center gap-1.5 text-[#1e1b18]">
                  {card.isComplete ? (
                    <span className="font-sans-custom text-[10.5px] font-black text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-md border border-[#86efac] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#15803d]" />
                      تکمیل شد
                    </span>
                  ) : !card.isUnlocked ? (
                    <span className="font-sans-custom text-[10.5px] font-bold text-[#ea580c] bg-[#ffedd5] px-2 py-0.5 rounded-md border border-[#fed7aa] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#ea580c]" />
                      قفل
                    </span>
                  ) : (
                    <span className="font-sans-custom text-[10.5px] font-bold text-[#0284c7] bg-[#e0f2fe] px-2 py-0.5 rounded-md border border-[#bae6fd] flex items-center gap-1">
                      <Unlock className="w-3 h-3 text-[#0284c7]" />
                      ورود
                    </span>
                  )}
                  <ChevronLeft className="w-5 h-5 text-[#1e1b18]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lock Click Popup Modal */}
      <GalleryLockModal
        lockGallery={selectedLockGallery}
        onClose={() => setSelectedLockGallery(null)}
        onUnlockSuccess={(targetId) => {
          setSelectedLockGallery(null);
          if (onSelectGallery) {
            onSelectGallery(targetId);
          }
        }}
        onNavigateToCurrent={(currentGid) => {
          setSelectedLockGallery(null);
          if (onSelectGallery) {
            onSelectGallery(currentGid);
          }
        }}
      />
    </div>
  );
};
