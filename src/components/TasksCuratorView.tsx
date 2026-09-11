import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lock, Unlock, Star, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { CuratorExhibitionWall } from './CuratorExhibitionWall';
import { GALLERIES } from '../data/mapConfig';
import { contentService } from '../services/content/contentService';
import {
  isStarPointUnlocked,
  isStarPointInformationUnlocked,
} from '../data/starPointProgressStore';
import { isProgressionConditionsSatisfied } from '../data/galleryProgressionStore';
import { isGalleryPuzzleCompleted, getPuzzleProgress } from '../data/puzzleProgressStore';
import {
  normalizeGalleryId,
  toPersianDigits,
  formatTwoDigitPersian,
} from '../services/content/mappers';
import { StarContent } from '../services/content/types';

interface TasksCuratorViewProps {
  type: 'tasks' | 'curator';
  onNavigateToMap: () => void;
}

/**
 * Checks whether a gallery is unlocked based on authoritative progression rules and puzzle state.
 */
function isGalleryUnlockedState(galleryId: string): boolean {
  const norm = galleryId.toLowerCase().replace('_', '-');
  if (norm === 'gallery-00' || norm === 'gallery-01') return true;
  if (norm === 'gallery-02') return false; // Pavilion (Coming Soon)

  // If the player has already completed this gallery's puzzle or has pieces, it is unlocked
  if (isGalleryPuzzleCompleted(norm)) return true;
  const puzzleProgress = getPuzzleProgress();
  if (
    Array.isArray(puzzleProgress[norm]?.collectedPieces) &&
    puzzleProgress[norm].collectedPieces.length > 0
  ) {
    return true;
  }

  // Linear progression chain evaluation
  if (norm === 'gallery-03') {
    return isProgressionConditionsSatisfied('gallery-01') || isGalleryPuzzleCompleted('gallery-01');
  }
  if (norm === 'gallery-04') {
    return (
      isGalleryUnlockedState('gallery-03') &&
      (isProgressionConditionsSatisfied('gallery-03') || isGalleryPuzzleCompleted('gallery-03'))
    );
  }
  if (norm === 'gallery-05') {
    return (
      isGalleryUnlockedState('gallery-04') &&
      (isProgressionConditionsSatisfied('gallery-04') || isGalleryPuzzleCompleted('gallery-04'))
    );
  }
  if (norm === 'gallery-06') {
    return (
      isGalleryUnlockedState('gallery-05') &&
      (isProgressionConditionsSatisfied('gallery-05') || isGalleryPuzzleCompleted('gallery-05'))
    );
  }
  if (norm === 'gallery-07') {
    return (
      isGalleryUnlockedState('gallery-06') &&
      (isProgressionConditionsSatisfied('gallery-06') || isGalleryPuzzleCompleted('gallery-06'))
    );
  }
  if (norm === 'gallery-08') {
    return isGalleryUnlockedState('gallery-07');
  }
  if (norm === 'gallery-09') {
    return isGalleryUnlockedState('gallery-08');
  }

  return false;
}

export const TasksCuratorView: React.FC<TasksCuratorViewProps> = ({ type, onNavigateToMap }) => {
  const [version, setVersion] = useState<number>(0);

  const refreshState = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const unsub = contentService.subscribe(refreshState);
    window.addEventListener('museum_star_point_progress_updated', refreshState);
    window.addEventListener('museum_player_progress_updated', refreshState);
    window.addEventListener('museum_puzzle_progress_updated', refreshState);
    window.addEventListener('museum_completed_gallery_puzzles_updated', refreshState);

    return () => {
      unsub();
      window.removeEventListener('museum_star_point_progress_updated', refreshState);
      window.removeEventListener('museum_player_progress_updated', refreshState);
      window.removeEventListener('museum_puzzle_progress_updated', refreshState);
      window.removeEventListener('museum_completed_gallery_puzzles_updated', refreshState);
    };
  }, [refreshState]);

  // If in Curator tab, render the single-screen exhibition salon wall
  if (type === 'curator') {
    return <CuratorExhibitionWall onNavigateToMap={onNavigateToMap} />;
  }

  // Tasks Tab: Redesigned Gallery Progress Cards
  // Filter standard exhibition galleries (excluding gallery-00 and gallery-01 as requested)
  const targetGalleries = GALLERIES.filter(
    (g) => g.id !== 'gallery-00' && g.id !== 'gallery-01' && g.id.startsWith('gallery-')
  );

  const allStars: StarContent[] = contentService.getStars().filter((s) => s.active !== false);

  // Compute cards dynamic data
  const galleryCards = targetGalleries.map((gallery) => {
    const canonId = normalizeGalleryId(gallery.id);
    const numMatch = gallery.id.match(/\d+/);
    const galleryNumInt = numMatch ? parseInt(numMatch[0], 10) : null;
    const formattedNum = galleryNumInt !== null ? (galleryNumInt < 10 ? `0${galleryNumInt}` : `${galleryNumInt}`) : '01';

    // ContentService gallery entity for title / metadata overrides
    const csGallery = contentService.getGalleryById(gallery.id);
    const galleryName = csGallery?.nameFa || gallery.nameFa || gallery.name;
    const galleryNameEn = csGallery?.nameEn || gallery.name;

    const isUnlocked = isGalleryUnlockedState(gallery.id);

    // Calculate stars for this gallery
    const galleryStars = allStars.filter((s) => {
      if (!s.galleryId) return false;
      const sCanon = normalizeGalleryId(s.galleryId);
      if (sCanon === canonId) return true;
      if (galleryNumInt !== null) {
        const sNumMatch = s.galleryId.match(/\d+/);
        if (sNumMatch && parseInt(sNumMatch[0], 10) === galleryNumInt) return true;
      }
      return false;
    });

    // Fallback default star count if empty from sheets (e.g. Gallery 01 has 2, Gallery 03 has 4, etc.)
    const totalStars = galleryStars.length > 0 ? galleryStars.length : (gallery.id === 'gallery-03' ? 4 : gallery.id === 'gallery-01' ? 2 : 4);

    let collectedStars = 0;
    if (galleryStars.length > 0) {
      collectedStars = galleryStars.filter((star) => {
        return (
          isStarPointUnlocked(star.id) ||
          (star.starId && isStarPointUnlocked(star.starId)) ||
          isStarPointInformationUnlocked(star.id)
        );
      }).length;
    }

    const isComplete = isUnlocked && totalStars > 0 && collectedStars >= totalStars;

    return {
      id: gallery.id,
      number: formattedNum,
      numberPersian: formatTwoDigitPersian(galleryNumInt || 1),
      name: galleryName,
      nameEn: galleryNameEn,
      isUnlocked,
      isComplete,
      collectedStars,
      totalStars,
      progressPercent: totalStars > 0 ? Math.min(100, Math.round((collectedStars / totalStars) * 100)) : 0,
    };
  });

  const totalUnlockedCount = galleryCards.filter((g) => g.isUnlocked).length;
  const totalStarsCollected = galleryCards.reduce((sum, g) => sum + (g.isUnlocked ? g.collectedStars : 0), 0);
  const totalStarsAvailable = galleryCards.reduce((sum, g) => sum + (g.isUnlocked ? g.totalStars : 0), 0);

  return (
    <div
      id="tasks-gallery-progress"
      className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 pb-28 max-w-4xl mx-auto select-none"
    >
      {/* Page Header */}
      <div className="border-b-2 border-[#1e1b18] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#f59e0b]" />
            <span className="font-sans-custom text-[11px] text-[#ea580c] font-black tracking-wider uppercase">
              پیشرفت مأموریت‌های موزه
            </span>
          </div>
          <h1 className="font-sans-custom text-[20px] sm:text-[24px] font-black text-[#1e1b18] tracking-tight mt-0.5">
            پیشرفت تالارها و کشف ستاره‌ها
          </h1>
        </div>

        {/* Global Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#1e1b18] bg-[#e0f2fe] shadow-[2px_2px_0px_#1e1b18] text-[#1e1b18] font-bold text-xs">
            <Unlock className="w-3.5 h-3.5 text-[#0284c7]" />
            <span className="font-sans-custom">
              {toPersianDigits(totalUnlockedCount)} از {toPersianDigits(galleryCards.length)} تالار
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#1e1b18] bg-[#fef08a] shadow-[2px_2px_0px_#1e1b18] text-[#1e1b18] font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#1e1b18] stroke-[2]" />
            <span className="font-sans-custom">
              {toPersianDigits(totalStarsCollected)} از {toPersianDigits(totalStarsAvailable)} ستاره
            </span>
          </div>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {galleryCards.map((card) => {
          if (!card.isUnlocked) {
            // 2. LOCKED GALLERIES
            return (
              <div
                key={card.id}
                id={`gallery-card-${card.id}`}
                className="border-2 border-dashed border-[#94a3b8] rounded-2xl bg-[#ffffff]/60 p-4 sm:p-5 shadow-[2px_2px_0px_#cbd5e1] transition-all flex flex-col justify-between gap-3.5 relative overflow-hidden"
              >
                {/* Header: Gallery Number & Lock Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-custom text-[11px] font-bold text-[#64748b] tracking-wider uppercase bg-[#e2e8f0] px-2.5 py-0.5 rounded-lg border border-[#cbd5e1]">
                      Gallery {card.number}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#64748b] font-sans-custom text-[11px] font-bold bg-[#e2e8f0] px-2.5 py-0.5 rounded-full border border-[#cbd5e1]">
                    <Lock className="w-3 h-3 text-[#64748b]" />
                    <span>قفل</span>
                  </div>
                </div>

                {/* Gallery Title */}
                <div>
                  <h3 className="font-sans-custom text-[16px] sm:text-[17px] font-bold text-[#64748b] leading-snug">
                    {card.name}
                  </h3>
                </div>

                {/* Locked Notice Message */}
                <div className="mt-1 pt-3 border-t border-[#e2e8f0] flex items-center gap-2 text-[#64748b]">
                  <div className="w-6 h-6 rounded-full bg-[#e2e8f0] border border-[#cbd5e1] flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5 text-[#64748b]" />
                  </div>
                  <span className="font-sans-custom text-[11.5px] text-[#64748b] font-medium leading-relaxed">
                    این تالار قفل است. با حل پازل تالار قبل بازگشایی می‌شود.
                  </span>
                </div>
              </div>
            );
          }

          // 3. UNLOCKED GALLERIES
          return (
            <div
              key={card.id}
              id={`gallery-card-${card.id}`}
              className="border-[2.5px] border-[#1e1b18] rounded-2xl bg-[#ffffff] p-4 sm:p-5 shadow-[4px_4px_0px_#1e1b18] hover:shadow-[5px_5px_0px_#1e1b18] transition-all flex flex-col justify-between gap-3.5 relative"
            >
              {/* Header: Gallery Number & Unlocked Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono-custom text-[11px] font-black text-[#1e1b18] tracking-wider uppercase bg-[#fef3c7] px-2.5 py-0.5 rounded-lg border-2 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18]">
                    Gallery {card.number}
                  </span>
                </div>
                {card.isComplete ? (
                  <div className="flex items-center gap-1 text-[#1e1b18] font-sans-custom text-[11px] font-black bg-[#fef08a] px-2.5 py-0.5 rounded-full border-2 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>کامل شد</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[#15803d] font-sans-custom text-[11px] font-black bg-[#ecfdf5] px-2.5 py-0.5 rounded-full border-2 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18]">
                    <Unlock className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>بازگشایی‌شده</span>
                  </div>
                )}
              </div>

              {/* Gallery Title */}
              <div>
                <h3 className="font-sans-custom text-[16px] sm:text-[18px] font-black text-[#1e1b18] leading-snug">
                  {card.name}
                </h3>
              </div>

              {/* Star Progress Section */}
              <div className="mt-1 pt-3 border-t-2 border-[#f1f5f9] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#fef08a] border-2 border-[#1e1b18] flex items-center justify-center shadow-[1px_1px_0px_#1e1b18]">
                      <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#1e1b18] stroke-[2]" />
                    </div>
                    <span className="font-mono-custom text-[14px] font-black text-[#1e1b18]">
                      {card.collectedStars} / {card.totalStars}
                    </span>
                  </div>
                  <span className="font-sans-custom text-[11.5px] text-[#64748b] font-bold">
                    {toPersianDigits(card.collectedStars)} از {toPersianDigits(card.totalStars)} ستاره کشف‌شده
                  </span>
                </div>

                {/* Progress Bar Indicator */}
                <div className="w-full h-3 bg-[#e2e8f0] rounded-full border-2 border-[#1e1b18] p-[1.5px] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#fde047] to-[#f59e0b] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${card.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


