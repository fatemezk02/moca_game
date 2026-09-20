import React, { useState, useRef, useEffect } from 'react';
import { Plus, Compass, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GalleryFloatingActionsProps {
  galleryId: string;
  onOpenGuide?: () => void;
  onTriggerNextPuzzle?: () => void;
}

/**
 * Floating Action Button (FAB) for Individual Gallery Pages (Gallery 02 through Gallery 09).
 * Located at the bottom-left of the gallery screen, above the bottom navigation bar.
 * Expands upward to reveal:
 *  1. Gallery Guide (راهنمای گالری) - opens the existing Gallery Information / Curator modal
 *  2. Next Puzzle (پازل بعدی) - highlights the first incomplete puzzle in order with the existing 2-blink animation
 */
export const GalleryFloatingActions: React.FC<GalleryFloatingActionsProps> = ({
  galleryId,
  onOpenGuide,
  onTriggerNextPuzzle,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={containerRef}
      id={`fab-${galleryId}-container`}
      className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-4 sm:left-6 z-30 flex flex-col-reverse items-center gap-2.5 select-none"
    >
      {/* Primary Floating '+' Button */}
      <button
        id={`btn-fab-${galleryId}-main`}
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'بستن منوی اقدامات' : 'منوی اقدامات گالری'}
        title={isExpanded ? 'بستن منو' : 'اقدامات گالری'}
        className="w-13 h-13 rounded-2xl border-[2.5px] border-[#1e1b18] bg-[#ffffff] hover:bg-[#f8fafc] text-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#1e1b18] flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
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
            className="flex flex-col-reverse items-start gap-2.5"
          >
            {/* Secondary Action 1: Gallery Guide / Information */}
            <motion.div
              key="fab-guide-item"
              initial={{ opacity: 0, y: 14, scale: 0.82 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.82 }}
              transition={{ duration: 0.2, delay: 0.03, ease: 'easeOut' }}
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
              transition={{ duration: 0.2, delay: 0.08, ease: 'easeOut' }}
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
