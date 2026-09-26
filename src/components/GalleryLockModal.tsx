import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, Coins, Compass } from 'lucide-react';
import { getCurrentGalleryId } from '../data/playerLocationStore';
import {
  markGalleryReached,
  markGalleryManuallyUnlocked,
  isGalleryManuallyUnlocked,
} from '../data/reachedGalleriesStore';
import { isGalleryPuzzleCompleted } from '../data/puzzleProgressStore';
import { formatGalleryLabelFa } from './NavigationLight';
import { normalizeGalleryId, getLogicalGalleryNumber } from '../services/content/mappers';

interface GalleryLockModalProps {
  lockGallery: { galleryId: string; title?: string } | null;
  onClose: () => void;
  onUnlockSuccess: (galleryId: string) => void;
  onNavigateToCurrent: (currentGid: string) => void;
}

const GALLERY_DISPLAY_NAMES: Record<string, string> = {
  'gallery_00': 'آرشیو اصلی',
  'gallery_01': 'کیمیای نور',
  'gallery_02': 'آلبوم‌های دیپلماتیک',
  'gallery_03': 'ثبت دوام ما',
  'gallery_04': 'ضرب آهنگ شهر',
  'gallery_05': 'در کشاکش تماشا و استیلا',
  'gallery_06': 'گذر از برون به درون',
  'gallery_07': 'آونگ زمان',
  'gallery_08': 'تلاقی رسانه‌ها',
  'gallery-00': 'آرشیو اصلی',
  'gallery-01': 'کیمیای نور',
  'gallery-02': 'آلبوم‌های دیپلماتیک',
  'gallery-03': 'ثبت دوام ما',
  'gallery-04': 'ضرب آهنگ شهر',
  'gallery-05': 'در کشاکش تماشا و استیلا',
  'gallery-06': 'گذر از برون به درون',
  'gallery-07': 'آونگ زمان',
  'gallery-08': 'تلاقی رسانه‌ها',
};

/**
 * Checks whether a gallery's lock is open in the museum floor plan.
 * A gallery's lock is open if:
 * - It is Gallery 01 (always unlocked from start)
 * - It was manually unlocked with coins (isGalleryManuallyUnlocked)
 * - Its predecessor gallery's puzzle has been completed (isGalleryPuzzleCompleted)
 * - Or this gallery's own puzzle has been completed (isGalleryPuzzleCompleted)
 */
function isGalleryLockOpen(galleryNum: number): boolean {
  if (galleryNum <= 1) return true;
  if (galleryNum > 8) return false;

  const canonId = `gallery_0${galleryNum}`;
  const routeId = `gallery-0${galleryNum}`;

  // 1. Manually unlocked with coins
  if (isGalleryManuallyUnlocked(canonId) || isGalleryManuallyUnlocked(routeId)) {
    return true;
  }

  // 2. Predecessor gallery puzzle is completed
  const prevCanonId = `gallery_0${galleryNum - 1}`;
  const prevRouteId = `gallery-0${galleryNum - 1}`;
  if (isGalleryPuzzleCompleted(prevCanonId) || isGalleryPuzzleCompleted(prevRouteId)) {
    return true;
  }

  // 3. Own gallery puzzle is completed
  if (isGalleryPuzzleCompleted(canonId) || isGalleryPuzzleCompleted(routeId)) {
    return true;
  }

  return false;
}

/**
 * Determines the continuation gallery ID for a locked destination gallery.
 *
 * Rules:
 * 1. Find all canonical galleries (01 to 08) with a lower gallery number than the destination gallery.
 * 2. From those galleries, find the gallery with the highest number whose lock is open.
 * 3. If no lower-numbered unlocked gallery exists, falls back to the current gallery ID.
 */
function getContinuationGalleryId(targetGalleryId: string): string {
  const fallbackGid = getCurrentGalleryId();
  const destNum = getLogicalGalleryNumber(targetGalleryId);

  // If destination gallery number is invalid or <= 1, fall back to current player gallery
  if (destNum === null || destNum <= 1) {
    return fallbackGid;
  }

  // Search in descending order from (destNum - 1) down to 1
  // The first unlocked gallery encountered is the highest-numbered gallery whose lock is open before destination
  for (let n = destNum - 1; n >= 1; n--) {
    if (isGalleryLockOpen(n)) {
      return `gallery_0${n}`;
    }
  }

  return fallbackGid;
}

export const GalleryLockModal: React.FC<GalleryLockModalProps> = ({
  lockGallery,
  onClose,
  onUnlockSuccess,
  onNavigateToCurrent,
}) => {
  if (!lockGallery) return null;

  const continuationGid = getContinuationGalleryId(lockGallery.galleryId);
  const continuationGalleryLabel = formatGalleryLabelFa(continuationGid);
  const continuationGalleryNumber = continuationGalleryLabel.replace(/^گالری\s*/, '');
  const targetGalleryLabel = formatGalleryLabelFa(lockGallery.galleryId);

  const normId = normalizeGalleryId(lockGallery.galleryId);
  let targetGalleryName = GALLERY_DISPLAY_NAMES[normId] || GALLERY_DISPLAY_NAMES[lockGallery.galleryId];
  if (!targetGalleryName && lockGallery.title) {
    const match = lockGallery.title.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      targetGalleryName = match[1].split('/')[0].trim();
    }
  }
  if (!targetGalleryName) {
    targetGalleryName = formatGalleryLabelFa(lockGallery.galleryId);
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1e1b18]/60 backdrop-blur-xs select-none">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative z-10 w-full max-w-md bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] text-right overflow-hidden flex flex-col"
        >
          {/* Top Header Bar */}
          <div className="bg-[#fee2e2] border-b-2 border-[#1e1b18] px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ef4444] border-[1.5px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center text-[#1e1b18]">
                <Lock className="w-3.5 h-3.5 text-[#1e1b18]" />
              </div>
              <div className="text-right">
                <h2 className="font-sans-custom text-[14px] font-black text-[#1e1b18] tracking-tight">
                  {targetGalleryLabel}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 shrink-0 aspect-square rounded-full bg-[#ffffff] hover:bg-[#ef4444] hover:text-white transition-colors text-[#1e1b18] border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-sm sm:text-base font-semibold text-[#1e1b18] leading-relaxed">
              برای باز کردن گالری <span className="text-[#b45309] font-bold">{targetGalleryName}</span>، ۲۵ سکه بپردازید یا از گالری {continuationGalleryNumber} ادامه دهید.
            </p>

            <div className="flex flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  markGalleryManuallyUnlocked(lockGallery.galleryId);
                  markGalleryReached(lockGallery.galleryId);
                  const targetId = lockGallery.galleryId;
                  onClose();
                  onUnlockSuccess(targetId);
                }}
                className="flex-1 py-3.5 px-2 sm:px-3 bg-[#ffffff] hover:bg-[#fef2f2] border-2 border-[#1e1b18] rounded-xl shadow-[2.5px_2.5px_0px_#1e1b18] text-center cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center gap-2 group select-none min-h-[48px]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#fee2e2] border border-[#1e1b18] flex items-center justify-center text-[#dc2626] shrink-0 group-hover:bg-[#fecaca] transition-colors">
                  <Coins className="w-4 h-4 text-[#1e1b18]" />
                </div>
                <span className="font-sans-custom text-[13px] sm:text-[14px] font-black text-[#1e1b18] whitespace-nowrap flex items-center justify-center gap-1">
                  <span dir="ltr">-۲۵</span>
                  <span>سکه</span>
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateToCurrent(continuationGid);
                }}
                className="flex-1 py-3.5 px-2 sm:px-3 bg-[#ffffff] hover:bg-[#f0f9ff] text-[#1e1b18] font-black text-[13px] sm:text-[14px] rounded-xl border-2 border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1e1b18] transition-all flex items-center justify-center gap-2 group cursor-pointer min-h-[48px] select-none"
              >
                <div className="w-7 h-7 rounded-lg bg-[#e0f2fe] border border-[#1e1b18] flex items-center justify-center text-[#0284c7] shrink-0 group-hover:bg-[#bae6fd] transition-colors">
                  <Compass className="w-4 h-4 text-[#1e1b18]" />
                </div>
                <span className="font-sans-custom text-[13px] sm:text-[14px] font-black text-[#1e1b18] whitespace-nowrap">
                  رفتن به {continuationGalleryLabel}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
