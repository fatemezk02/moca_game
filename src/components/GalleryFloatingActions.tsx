import React, { useState, useRef, useEffect } from 'react';
import { Plus, Compass, Eye, Dices, HelpCircle, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GalleryFloatingActionsProps {
  galleryId: string;
  onNavigateBack?: () => void;
  onOpenGuide?: () => void;
  onTriggerNextPuzzle?: () => void;
  onOpenLuckMachine?: () => void;
  isLuckMachineAvailable?: boolean;
  isLuckMachineCompleted?: boolean;
  onOpenSpecialPuzzle?: () => void;
  isSpecialPuzzleAvailable?: boolean;
  isSpecialPuzzleCompleted?: boolean;
}

/**
 * Floating Action Button (FAB) for Individual Gallery Pages (Gallery 01 through Gallery 08/09).
 * Located at the bottom-right of the gallery screen, above the bottom navigation bar.
 * Expands upward to reveal:
 *  1. Back to Master Map (بازگشت به گالری نقشه اصلی) - returns to the main museum floor plan
 *  2. Gallery Guide (راهنمای گالری) - opens the existing Gallery Information / Curator modal
 *  3. Next Puzzle (پازل بعدی) - highlights the first incomplete puzzle in order with the existing 2-blink animation
 *  4. Luck Machine (دستگاه شانس) - opens the existing Luck Machine modal in Gallery 02 when available
 *  5. Special Puzzle (معما) - opens the existing Darkroom Riddle modal in Gallery 07 when available
 */
export const GalleryFloatingActions: React.FC<GalleryFloatingActionsProps> = ({
  galleryId,
  onNavigateBack,
  onOpenGuide,
  onTriggerNextPuzzle,
  onOpenLuckMachine,
  isLuckMachineAvailable = false,
  isLuckMachineCompleted = false,
  onOpenSpecialPuzzle,
  isSpecialPuzzleAvailable = false,
  isSpecialPuzzleCompleted = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if there is an uncompleted available feature (subtle attention pulse)
  const hasPendingAttention =
    (isLuckMachineAvailable && !isLuckMachineCompleted) ||
    (isSpecialPuzzleAvailable && !isSpecialPuzzleCompleted);

  // Close when clicking outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleNavigateBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    onNavigateBack?.();
  };

  const handleGuideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    onOpenGuide?.();
  };

  const handleNextPuzzleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    onTriggerNextPuzzle?.();
  };

  const handleLuckMachineClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    onOpenLuckMachine?.();
  };

  const handleSpecialPuzzleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    onOpenSpecialPuzzle?.();
  };

  return (
    <div
      ref={containerRef}
      id={`fab-${galleryId}-container`}
      className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-6 z-30 flex flex-col-reverse items-center gap-2.5 select-none"
    >
      {/* Primary Floating '+' Button (اقدامات گالری) */}
      <button
        id={`btn-fab-${galleryId}-main`}
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'بستن منوی اقدامات' : 'منوی اقدامات گالری'}
        title={isExpanded ? 'بستن منو' : 'اقدامات گالری'}
        className={`relative w-13 h-13 rounded-2xl border-[2.5px] border-[#1e1b18] bg-[#ffffff] hover:bg-[#f8fafc] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none ${
          hasPendingAttention
            ? 'animate-pulse ring-2 ring-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.55)]'
            : ''
        }`}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex items-center justify-center pointer-events-none"
        >
          <Plus className="w-6 h-6 stroke-[2.75]" />
        </motion.div>
      </button>

      {/* Expanded Secondary Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <div
            id={`fab-${galleryId}-expanded-actions`}
            className="flex flex-col-reverse items-center gap-2.5"
          >
            {/* Secondary Action: Special Puzzle / معما (Gallery 07) */}
            {isSpecialPuzzleAvailable && onOpenSpecialPuzzle && (
              <motion.div
                key="fab-special-puzzle-item"
                initial={{ opacity: 0, y: 14, scale: 0.82 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.82 }}
                transition={{ duration: 0.2, delay: 0.01, ease: 'easeOut' }}
                className="flex items-center"
              >
                <button
                  id={`btn-fab-${galleryId}-special-puzzle`}
                  type="button"
                  onClick={handleSpecialPuzzleClick}
                  aria-label="معما"
                  title="معما"
                  className="w-11 h-11 rounded-xl border-[2px] border-[#1e1b18] bg-[#fce7f3] hover:bg-[#fbcfe8] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
                >
                  <HelpCircle className="w-5 h-5 stroke-[2.4] text-[#831843]" />
                </button>
              </motion.div>
            )}

            {/* Secondary Action: Luck Machine / دستگاه شانس (Gallery 02) */}
            {isLuckMachineAvailable && onOpenLuckMachine && (
              <motion.div
                key="fab-luck-item"
                initial={{ opacity: 0, y: 14, scale: 0.82 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.82 }}
                transition={{ duration: 0.2, delay: 0.02, ease: 'easeOut' }}
                className="flex items-center"
              >
                <button
                  id={`btn-fab-${galleryId}-luck-machine`}
                  type="button"
                  onClick={handleLuckMachineClick}
                  aria-label="دستگاه شانس"
                  title="دستگاه شانس"
                  className="w-11 h-11 rounded-xl border-[2px] border-[#1e1b18] bg-[#fef08a] hover:bg-[#fde047] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
                >
                  <Dices className="w-5 h-5 stroke-[2.4] text-[#78350f]" />
                </button>
              </motion.div>
            )}

            {/* Secondary Action 1: Gallery Guide / Information */}
            <motion.div
              key="fab-guide-item"
              initial={{ opacity: 0, y: 14, scale: 0.82 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.82 }}
              transition={{ duration: 0.2, delay: 0.04, ease: 'easeOut' }}
              className="flex items-center"
            >
              <button
                id={`btn-fab-${galleryId}-guide`}
                type="button"
                onClick={handleGuideClick}
                aria-label="راهنمای گالری"
                title="راهنمای گالری"
                className="w-11 h-11 rounded-xl border-[2px] border-[#1e1b18] bg-[#fef3c7] hover:bg-[#fde68a] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
              >
                <Compass className="w-5 h-5 stroke-[2.4]" />
              </button>
            </motion.div>

            {/* Secondary Action 2: Next Puzzle Guidance */}
            <motion.div
              key="fab-next-puzzle-item"
              initial={{ opacity: 0, y: 14, scale: 0.82 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.82 }}
              transition={{ duration: 0.2, delay: 0.06, ease: 'easeOut' }}
              className="flex items-center"
            >
              <button
                id={`btn-fab-${galleryId}-next-puzzle`}
                type="button"
                onClick={handleNextPuzzleClick}
                aria-label="پازل بعدی"
                title="پازل بعدی"
                className="w-11 h-11 rounded-xl border-[2px] border-[#1e1b18] bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
              >
                <Eye className="w-5 h-5 stroke-[2.4]" />
              </button>
            </motion.div>

            {/* Secondary Action 3: Back to Master Map (بازگشت به گالری نقشه اصلی) */}
            {onNavigateBack && (
              <motion.div
                key="fab-back-to-map-item"
                initial={{ opacity: 0, y: 14, scale: 0.82 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.82 }}
                transition={{ duration: 0.2, delay: 0.08, ease: 'easeOut' }}
                className="flex items-center"
              >
                <button
                  id={`btn-fab-${galleryId}-toggle-map`}
                  type="button"
                  onClick={handleNavigateBackClick}
                  aria-label="بازگشت به گالری نقشه اصلی"
                  title="بازگشت به گالری نقشه اصلی"
                  className="w-11 h-11 rounded-xl border-[2px] border-[#1e1b18] bg-[#f59e0b] hover:bg-[#d97706] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
                >
                  <Map className="w-5 h-5 stroke-[2.4]" />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
