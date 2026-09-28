import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Gift,
  Frown,
  Coins,
  Coffee,
  Square,
  Timer,
  Dices,
  Key,
  Star,
  Compass,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExperienceIcon } from './ExperienceIcon';
import {
  LUCK_PRIZES,
  LuckPrize,
  getLuckMachineState,
  saveLuckMachineSpinResult,
  LuckMachineState,
  LUCK_MACHINE_ENABLED,
} from '../data/luckMachineStore';
import { toPersianDigits } from '../services/content/mappers';

export interface LuckMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MachinePhase =
  | 'idle' // Waiting for player to press "شروع چرخش" or starts on open
  | 'spinning' // Selector continuously cycling 1 -> 2 -> ... -> 12 -> 1
  | 'landed' // Stopped on current cell before flipping begins
  | 'flipping' // 12 cells flipping to white in random suspenseful order
  | 'revealed'; // Prize result displayed

const BOARD_IMAGE_URL = '/artwork/nadar_autoportrait_tournant.jpg';
const COUNTDOWN_TOTAL_SECONDS = 10;
const STEP_INTERVAL_MS = 90; // Smooth continuous cycle rate (~11 cells/sec)

const renderLargePrizeIcon = (prize: LuckPrize) => {
  switch (prize.type) {
    case 'empty':
      return <Frown className="w-10 h-10 sm:w-11 sm:h-11 text-[#64748b] stroke-[2.2]" />;
    case 'next_gallery':
      return <Key className="w-10 h-10 sm:w-11 sm:h-11 text-[#d97706] stroke-[2.2]" />;
    case 'cafe_discount':
      return <Coffee className="w-10 h-10 sm:w-11 sm:h-11 text-[#b45309] stroke-[2.2]" />;
    case 'coins':
      return <Coins className="w-10 h-10 sm:w-11 sm:h-11 text-[#ea580c] fill-[#fb923c] stroke-[2]" />;
    case 'gallery03_stars':
      return <Star className="w-10 h-10 sm:w-11 sm:h-11 text-[#eab308] fill-[#fde047] stroke-[2]" />;
    case 'gallery03_first_experience':
      return <ExperienceIcon iconId="frame" className="w-11 h-11 sm:w-12 sm:h-12" />;
    default:
      return <Gift className="w-10 h-10 sm:w-11 sm:h-11 text-[#1e1b18] stroke-[2.2]" />;
  }
};

const getLargePrizeCircleBg = (prize: LuckPrize) => {
  switch (prize.type) {
    case 'empty':
      return 'bg-[#f1f5f9] border-[#94a3b8] shadow-[2.5px_2.5px_0px_#94a3b8]';
    case 'next_gallery':
      return 'bg-[#fef3c7] border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] ring-4 ring-[#fde68a]';
    case 'cafe_discount':
      return 'bg-[#fef3c7] border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] ring-4 ring-[#fed7aa]';
    case 'coins':
      return 'bg-[#fef08a] border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] ring-4 ring-[#fde047]';
    case 'gallery03_stars':
      return 'bg-[#fef9c3] border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] ring-4 ring-[#fef08a]';
    case 'gallery03_first_experience':
      return 'bg-[#ede9fe] border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] ring-4 ring-[#ddd6fe]';
    default:
      return 'bg-[#ffffff] border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18]';
  }
};

export const LuckMachineModal: React.FC<LuckMachineModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [persistedState, setPersistedState] = useState<LuckMachineState>(() =>
    getLuckMachineState()
  );

  const [phase, setPhase] = useState<MachinePhase>(() =>
    persistedState.hasSpun ? 'revealed' : 'idle'
  );

  const [activeCellIndex, setActiveCellIndex] = useState<number>(() =>
    persistedState.selectedCellIndex !== null ? persistedState.selectedCellIndex : 0
  );

  const [flippedCells, setFlippedCells] = useState<Set<number>>(() => {
    if (persistedState.hasSpun) {
      return new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    }
    return new Set<number>();
  });

  const [wonPrize, setWonPrize] = useState<LuckPrize | null>(() => {
    if (persistedState.hasSpun && persistedState.prizeId) {
      return LUCK_PRIZES.find((p) => p.id === persistedState.prizeId) || null;
    }
    return null;
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(COUNTDOWN_TOTAL_SECONDS);

  // Per-attempt randomized mapping of the 12 prizes across the 12 cells
  const [currentAttemptPrizes, setCurrentAttemptPrizes] = useState<LuckPrize[]>(() => {
    const shuffled = [...LUCK_PRIZES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const activeCellIndexRef = useRef<number>(
    persistedState.selectedCellIndex !== null ? persistedState.selectedCellIndex : 0
  );
  const phaseRef = useRef<MachinePhase>(persistedState.hasSpun ? 'revealed' : 'idle');
  const isStoppingRef = useRef<boolean>(false);
  const currentAttemptPrizesRef = useRef<LuckPrize[]>(currentAttemptPrizes);

  useEffect(() => {
    currentAttemptPrizesRef.current = currentAttemptPrizes;
  }, [currentAttemptPrizes]);

  const animTimersRef = useRef<NodeJS.Timeout[]>([]);
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownStartTimeRef = useRef<number | null>(null);

  // Keep refs synchronized
  useEffect(() => {
    activeCellIndexRef.current = activeCellIndex;
  }, [activeCellIndex]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearAllTimers = () => {
    animTimersRef.current.forEach((t) => clearTimeout(t));
    animTimersRef.current = [];
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Sync state if external reset or update occurs
  useEffect(() => {
    const handleUpdate = () => {
      const state = getLuckMachineState();
      setPersistedState(state);
      if (state.hasSpun) {
        clearAllTimers();
        setPhase('revealed');
        setActiveCellIndex(state.selectedCellIndex ?? 0);
        activeCellIndexRef.current = state.selectedCellIndex ?? 0;
        setFlippedCells(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));
        if (state.prizeId) {
          setWonPrize(LUCK_PRIZES.find((p) => p.id === state.prizeId) || null);
        }
      } else {
        clearAllTimers();
        setPhase('idle');
        setFlippedCells(new Set());
        setWonPrize(null);
        setRemainingSeconds(COUNTDOWN_TOTAL_SECONDS);
        isStoppingRef.current = false;
      }
    };

    window.addEventListener('museum_luck_machine_updated', handleUpdate);
    window.addEventListener('museum_game_fully_reset', handleUpdate);
    return () => {
      window.removeEventListener('museum_luck_machine_updated', handleUpdate);
      window.removeEventListener('museum_game_fully_reset', handleUpdate);
    };
  }, []);

  // Confetti celebration helper
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#c5a059', '#3b82f6', '#10b981', '#ec4899', '#ffffff'],
      });
    } catch {
      // safe fallback
    }
  };

  /**
   * Suspenseful Reveal Animation:
   * Flips all 12 photo cells to solid white in a randomized sequence.
   */
  const startRevealFlipAnimation = (targetCell: number, targetPrize: LuckPrize) => {
    setPhase('flipping');

    // Generate random permutation of cells [0..11]
    const allCells = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (let i = allCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
    }

    // Paced suspenseful reveal:
    // Group 1: 3 cells (fast)
    // Short pause: 320ms
    // Group 2: 4 cells
    // Short pause: 360ms
    // Group 3: 5 remaining cells
    const timeline: { cell: number; delay: number }[] = [];

    let elapsed = 0;
    // Group 1 (cells 0..2)
    for (let i = 0; i < 3; i++) {
      timeline.push({ cell: allCells[i], delay: elapsed });
      elapsed += 150;
    }
    elapsed += 320; // suspense pause

    // Group 2 (cells 3..6)
    for (let i = 3; i < 7; i++) {
      timeline.push({ cell: allCells[i], delay: elapsed });
      elapsed += 150;
    }
    elapsed += 360; // suspense pause

    // Group 3 (cells 7..11)
    for (let i = 7; i < 12; i++) {
      timeline.push({ cell: allCells[i], delay: elapsed });
      elapsed += 150;
    }

    // Schedule flips
    timeline.forEach(({ cell, delay }) => {
      const timer = setTimeout(() => {
        setFlippedCells((prev) => {
          const next = new Set(prev);
          next.add(cell);
          return next;
        });
      }, delay);
      animTimersRef.current.push(timer);
    });

    // Reveal prize result after all 12 are flipped + final reveal pause
    const finishDelay = elapsed + 450;
    const finishTimer = setTimeout(() => {
      // Persist result and award coins once
      const saved = saveLuckMachineSpinResult(targetCell, targetPrize);
      setPersistedState(saved);
      setWonPrize(targetPrize);
      setPhase('revealed');

      if (targetPrize.type !== 'empty') {
        triggerCelebration();
      }
    }, finishDelay);
    animTimersRef.current.push(finishTimer);
  };

  /**
   * Stop selector handler:
   * Called either manually via the "توقف" button or automatically when 10-second timer hits 0.
   */
  const handleStopSelector = useCallback(() => {
    // Guard against multiple simultaneous triggers or invalid phases
    if (phaseRef.current !== 'spinning' || isStoppingRef.current) {
      return;
    }

    isStoppingRef.current = true;

    // 1. Immediately halt cycle intervals and countdown
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // 2. Freeze selector at current position - EXACT cell under selector at this moment
    const winningCell = activeCellIndexRef.current;
    const assignedPrizes = currentAttemptPrizesRef.current;
    const winningPrize = assignedPrizes[winningCell] || LUCK_PRIZES[winningCell] || LUCK_PRIZES[0];

    setActiveCellIndex(winningCell);
    setPhase('landed');

    // 3. Pause for brief suspense before flipping begins (~500ms)
    const landTimer = setTimeout(() => {
      startRevealFlipAnimation(winningCell, winningPrize);
    }, 500);
    animTimersRef.current.push(landTimer);
  }, []);

  /**
   * Start cycling selector continuously and begin the 10-second real countdown
   */
  const startCycling = useCallback(() => {
    if (persistedState.hasSpun) {
      return;
    }

    clearAllTimers();
    isStoppingRef.current = false;

    // Generate a fresh random permutation of the 12 prize outcomes for this new attempt
    const newShuffled = [...LUCK_PRIZES];
    for (let i = newShuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newShuffled[i], newShuffled[j]] = [newShuffled[j], newShuffled[i]];
    }
    setCurrentAttemptPrizes(newShuffled);
    currentAttemptPrizesRef.current = newShuffled;

    setRemainingSeconds(COUNTDOWN_TOTAL_SECONDS);
    setPhase('spinning');

    // 1. Continuous smooth selector cycling: 1 -> 2 -> ... -> 12 -> 1 -> ...
    cycleIntervalRef.current = setInterval(() => {
      setActiveCellIndex((prev) => {
        const next = (prev + 1) % 12;
        activeCellIndexRef.current = next;
        return next;
      });
    }, STEP_INTERVAL_MS);

    // 2. Real elapsed time countdown from 10 to 0
    countdownStartTimeRef.current = Date.now();
    countdownIntervalRef.current = setInterval(() => {
      if (!countdownStartTimeRef.current) return;
      const elapsedMs = Date.now() - countdownStartTimeRef.current;
      const leftSec = Math.max(0, Math.ceil(COUNTDOWN_TOTAL_SECONDS - elapsedMs / 1000));
      setRemainingSeconds(leftSec);

      if (leftSec <= 0) {
        // Automatically stop at exactly 0 seconds on current cell
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        handleStopSelector();
      }
    }, 100);
  }, [persistedState.hasSpun, handleStopSelector]);

  // Clean up timers when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearAllTimers();
      if (!persistedState.hasSpun) {
        setPhase('idle');
        setRemainingSeconds(COUNTDOWN_TOTAL_SECONDS);
        isStoppingRef.current = false;
      }
    }
  }, [isOpen, persistedState.hasSpun]);

  if (!LUCK_MACHINE_ENABLED || !isOpen) {
    return null;
  }

  const isSpinningOrFlipping = phase === 'spinning' || phase === 'landed' || phase === 'flipping';
  const isRevealed = phase === 'revealed';
  const hasSpun = persistedState.hasSpun || isRevealed;
  const persUnlockedNum = persistedState.unlockedGalleryNumber;

  return (
    <AnimatePresence>
      <div
        id="luck-machine-modal-backdrop"
        onClick={isSpinningOrFlipping ? undefined : onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-[3px] select-none"
        dir="rtl"
      >
        <motion.div
          id="luck-machine-modal-card"
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[390px] sm:max-w-[430px] bg-[#ffffff] rounded-3xl border-[2.75px] border-[#1e1b18] shadow-[6px_6px_0px_#1e1b18] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b-[2px] border-[#1e1b18] bg-[#fef3c7] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#f59e0b] border-[1.75px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center text-[#1e1b18]">
                <Dices className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans-custom font-black text-[15px] sm:text-[16px] text-[#1e1b18] tracking-tight">
                  دستگاه شانس
                </span>
                <span className="text-[11px] font-bold text-[#854d0e] font-sans-custom">
                  آلبوم پرترهٔ ۱۲ زاویهٔ نادار (۱۸۶۵)
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              id="luck-machine-close-btn"
              type="button"
              disabled={isSpinningOrFlipping}
              onClick={onClose}
              aria-label="بستن دستگاه شانس"
              title="بستن"
              className="w-7 h-7 rounded-full bg-[#ffffff] hover:bg-[#ef4444] hover:text-white disabled:opacity-40 transition-colors text-[#1e1b18] border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center gap-3.5 min-h-0">
            {/* Context Notice / Instructions */}
            <div className="text-center px-1">
              <p className="font-sans-custom font-extrabold text-[13px] sm:text-[14px] text-[#1e1b18]">
                {hasSpun
                  ? 'نتیجهٔ آزمون شانس شما ثبت شد'
                  : phase === 'idle'
                  ? 'برای چرخاندن گردونه، دکمهٔ شروع را بزنید!'
                  : phase === 'spinning'
                  ? 'کادر نشانگر در حال چرخش است؛ هر زمان خواستی دکمهٔ توقف را بزن!'
                  : 'در حال ثبت و نمایش جایزه...'}
              </p>
            </div>

            {/* Main Prize Board: 4 columns x 3 rows with 12 selectable cells */}
            <div
              id="luck-machine-board-container"
              className="relative w-full max-w-[320px] sm:max-w-[350px] mx-auto rounded-2xl border-[2.75px] border-[#1e1b18] shadow-[3.5px_3.5px_0px_#1e1b18] overflow-hidden bg-[#e8e2d8] shrink-0"
              style={{
                aspectRatio: '2139 / 2421',
              }}
            >
              {/* 12 Image Cells Grid (4 cols x 3 rows) */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 select-none">
                {Array.from({ length: 12 }).map((_, idx) => {
                  const col = idx % 4;
                  const row = Math.floor(idx / 4);
                  const isFlipped = flippedCells.has(idx);

                  return (
                    <div
                      key={`luck-cell-${idx}`}
                      className="relative w-full h-full overflow-hidden"
                      style={{ perspective: 1000 }}
                    >
                      <div
                        className="w-full h-full relative"
                        style={{
                          transformStyle: 'preserve-3d',
                          transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* Front Face: Original Photograph slice */}
                        <div
                          className="absolute inset-0 border-[0.5px] border-[#1e1b18]/10"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            backgroundImage: `url('${BOARD_IMAGE_URL}')`,
                            backgroundSize: '400% 300%',
                            backgroundPosition: `${(col / 3) * 100}% ${(row / 2) * 100}%`,
                            backgroundRepeat: 'no-repeat',
                          }}
                        />

                        {/* Back Face: Clean Solid White Surface */}
                        <div
                          className="absolute inset-0 bg-[#ffffff] border-[0.5px] border-[#f1f5f9]"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            backgroundColor: '#ffffff',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selector Box Frame: Exactly ONE cell in size, moves sequentially */}
              {activeCellIndex !== null && !isRevealed && phase !== 'flipping' && (
                <div
                  id="luck-machine-active-selector"
                  className="absolute pointer-events-none z-20 transition-all duration-100 ease-out"
                  style={{
                    width: '25%',
                    height: `${100 / 3}%`,
                    left: `${(activeCellIndex % 4) * 25}%`,
                    top: `${Math.floor(activeCellIndex / 4) * (100 / 3)}%`,
                  }}
                >
                  <div className="w-full h-full p-0.5">
                    <div className="w-full h-full rounded-md border-[3px] border-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.9),inset_0_0_6px_rgba(245,158,11,0.6)] ring-2 ring-[#1e1b18] animate-pulse" />
                  </div>
                </div>
              )}

              {/* Centered Winning Prize: Displayed ONCE in the center of the entire white 4x3 panel */}
              <AnimatePresence>
                {isRevealed && wonPrize && (
                  <motion.div
                    key="luck-machine-center-result"
                    initial={{ opacity: 0, scale: 0.8, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center select-none"
                  >
                    {/* Large Prize Icon */}
                    <div
                      className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-[2.5px] flex items-center justify-center shrink-0 mb-3 ${getLargePrizeCircleBg(
                        wonPrize
                      )}`}
                    >
                      {renderLargePrizeIcon(wonPrize)}
                    </div>

                    {wonPrize.type !== 'empty' ? (
                      <div className="flex flex-col items-center gap-1.5 px-2">
                        <p className="font-sans-custom font-black text-[16px] sm:text-[18px] text-[#1e1b18] leading-tight">
                          تو برندهٔ{' '}
                          <span className="text-[#b45309] underline decoration-[#f59e0b] decoration-2">
                            {wonPrize.name}
                          </span>{' '}
                          شدی
                        </p>

                        {/* 1. Coins reward details */}
                        {wonPrize.type === 'coins' && wonPrize.coins && (
                          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-[#fef08a] border-[1.5px] border-[#1e1b18] rounded-xl shadow-[1.5px_1.5px_0px_#1e1b18] font-bold text-[12px] sm:text-[13px] text-[#854d0e]">
                            <span>🪙</span>
                            <span>+{toPersianDigits(wonPrize.coins)} سکه به حسابت اضافه شد</span>
                          </div>
                        )}

                        {/* 2. Cafe discount unique code */}
                        {wonPrize.type === 'cafe_discount' && (
                          <div className="flex flex-col items-center gap-1.5 mt-2 w-full max-w-[280px]">
                            <span className="font-sans-custom text-[12px] font-bold text-[#b45309]">
                              کد تخفیف یک‌بار مصرف شما:
                            </span>
                            <div
                              dir="ltr"
                              className="px-3.5 py-1.5 bg-[#ffffff] border-[2px] border-[#1e1b18] rounded-xl shadow-[2px_2px_0px_#1e1b18] font-mono font-black text-[15px] sm:text-[16px] text-[#1e1b18] tracking-widest select-all text-center"
                            >
                              {persistedState.cafeCode || 'CAFE-CODE'}
                            </div>
                            <span className="text-[10.5px] font-sans-custom text-[#78350f]">
                              این کد را در کافهٔ موزه نشان دهید
                            </span>
                          </div>
                        )}

                        {/* 3. Next gallery unlock details */}
                        {wonPrize.type === 'next_gallery' && (
                          <div className="inline-flex flex-col items-center gap-1 mt-2 px-3 py-1.5 bg-[#fef3c7] border-[1.5px] border-[#1e1b18] rounded-xl shadow-[1.5px_1.5px_0px_#1e1b18] text-[#854d0e]">
                            <span className="font-sans-custom font-extrabold text-[12px] sm:text-[13px]">
                              {persUnlockedNum && persUnlockedNum !== 'همگی باز هستند'
                                ? `قفل تالار ${toPersianDigits(persUnlockedNum)} (${persistedState.unlockedGalleryName || ''}) باز شد!`
                                : 'تمام تالارهای موزه در دسترس شما هستند!'}
                            </span>
                          </div>
                        )}

                        {/* 4. Gallery 03 Stars unlock details */}
                        {wonPrize.type === 'gallery03_stars' && (
                          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-[#fef9c3] border-[1.5px] border-[#1e1b18] rounded-xl shadow-[1.5px_1.5px_0px_#1e1b18] font-bold text-[12px] sm:text-[13px] text-[#854d0e]">
                            <span>⭐</span>
                            <span>اطلاعات ستاره‌های تالار ۰۳ بازگشایی شد</span>
                          </div>
                        )}

                        {/* 5. Gallery 03 First Experience unlock details */}
                        {wonPrize.type === 'gallery03_first_experience' && (
                          <div className="flex flex-col items-center gap-1 mt-2 px-3 py-1.5 bg-[#ede9fe] border-[1.5px] border-[#1e1b18] rounded-xl shadow-[1.5px_1.5px_0px_#1e1b18] text-[#6b21a8]">
                            <span className="font-sans-custom font-extrabold text-[12px] sm:text-[13px]">
                              تجربهٔ «{persistedState.unlockedExperienceName || 'هم‌قاب با چهره‌های مشهور'}» باز شد!
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 px-2">
                        <h4 className="font-sans-custom font-black text-[18px] sm:text-[20px] text-[#64748b]">
                          پوچ بود.
                        </h4>
                        <p className="mt-1 font-sans-custom font-bold text-[13.5px] sm:text-[14.5px] text-[#475569]">
                          متأسفانه اینجا برنده نشدی 😔
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-3.5 sm:p-4 bg-[#fbf9f9] flex flex-col gap-2 shrink-0">
            {!hasSpun ? (
              <div className="w-full flex items-center gap-2">
                {/* 10-Second Countdown Badge */}
                <div
                  id="luck-machine-countdown-badge"
                  title="زمان باقی‌مانده برای فشردن دکمه توقف"
                  className="h-11 sm:h-12 px-3 rounded-xl border-[2px] border-[#1e1b18] bg-[#fef3c7] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center gap-1.5 shrink-0 select-none"
                >
                  <Timer className="w-4 h-4 text-[#854d0e] stroke-[2.2]" />
                  <span className="font-mono font-black text-[15px] sm:text-[16px] text-[#1e1b18] w-5 text-center">
                    {toPersianDigits(remainingSeconds)}
                  </span>
                </div>

                {/* Primary Action Button: "شروع" before start, transitioning to "توقف" after start */}
                <button
                  id={phase === 'idle' ? 'luck-machine-start-btn' : 'luck-machine-stop-btn'}
                  type="button"
                  disabled={phase !== 'idle' && phase !== 'spinning'}
                  onClick={phase === 'idle' ? startCycling : handleStopSelector}
                  className={`flex-1 h-11 sm:h-12 px-4 rounded-xl border-[2px] border-[#1e1b18] ${
                    phase === 'idle'
                      ? 'bg-[#10b981] hover:bg-[#059669] active:bg-[#047857]'
                      : 'bg-[#ef4444] hover:bg-[#dc2626] active:bg-[#b91c1c]'
                  } disabled:opacity-50 text-white font-sans-custom font-black text-[15px] sm:text-[16px] shadow-[2.5px_2.5px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 select-none`}
                >
                  {phase === 'idle' ? (
                    <>
                      <Play className="w-4 h-4 fill-white stroke-[2]" />
                      <span>شروع</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 fill-white stroke-[2]" />
                      <span>
                        {phase === 'spinning' ? 'توقف' : 'در حال ثبت...'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                id="luck-machine-done-btn"
                type="button"
                onClick={onClose}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl border-[2px] border-[#1e1b18] bg-[#1e1b18] hover:bg-[#2a2b2b] text-[#ffffff] font-sans-custom font-bold text-[14px] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150"
              >
                <span>باشه</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LuckMachineModal;
