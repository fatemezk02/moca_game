import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNavBar } from './BottomNavBar';
import { ArtworkFrame } from './ArtworkFrame';
import { GALLERY_01_QUESTIONS } from '../data/gallery01Questions';
import {
  getGalleryQuestionsArtwork,
  GalleryQuestionsArtworkConfig,
} from '../data/galleryQuestionsArtworkStore';
import {
  isGalleryQuestionsCompleted,
  setGalleryQuestionsCompleted,
  setGalleryAnsweredCount,
} from '../data/questionProgressStore';
import { markQuestionAnswered } from '../data/arrowConditionsStore';
import { markCollectionsAsViewed } from '../data/collectionNotificationStore';

interface Gallery01QuestionsViewProps {
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

type ViewPhase = 'question' | 'progress' | 'completed';

export const Gallery01QuestionsView: React.FC<Gallery01QuestionsViewProps> = ({
  onNavigateBack,
  onSelectTab,
}) => {
  const isAlreadyCompleted = isGalleryQuestionsCompleted('gallery-01');

  // Current question index: 0 (Q1), 1 (Q2), 2 (Q3)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() =>
    isAlreadyCompleted ? 2 : 0
  );
  
  // Phase state: 'question' | 'progress' | 'completed'
  const [phase, setPhase] = useState<ViewPhase>(() =>
    isAlreadyCompleted ? 'completed' : 'question'
  );

  // Progress step: 1 (1/3 revealed after Q1), 2 (2/3 revealed after Q2)
  const [progressStep, setProgressStep] = useState<1 | 2>(1);

  // Flashing effect state before moving to the next question
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  
  // Lock selection during transitions to prevent duplicate triggers
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Configured artwork settings (image, size/scale, position X/Y)
  const [artworkConfig, setArtworkConfig] = useState<GalleryQuestionsArtworkConfig>(() =>
    getGalleryQuestionsArtwork('gallery-01')
  );

  // Timers ref to prevent memory leaks or duplicate timeouts
  const flashTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextQuestionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = () => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    if (nextQuestionTimerRef.current) clearTimeout(nextQuestionTimerRef.current);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
  };

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ galleryId: string; config: GalleryQuestionsArtworkConfig }>;
      if (customEvent.detail?.galleryId === 'gallery-01') {
        setArtworkConfig(customEvent.detail.config);
      }
    };
    window.addEventListener('gallery_questions_artwork_updated', handleUpdate);
    return () => {
      window.removeEventListener('gallery_questions_artwork_updated', handleUpdate);
      clearAllTimers();
    };
  }, []);

  // Handle transitions when entering the progress phase
  useEffect(() => {
    if (phase === 'progress') {
      setIsFlashing(false);

      // Keep progress artwork visible for ~2 seconds, then trigger flashing animation
      flashTimerRef.current = setTimeout(() => {
        setIsFlashing(true);

        // After quick flash/blink (~350ms), transition to the next question
        nextQuestionTimerRef.current = setTimeout(() => {
          setIsFlashing(false);
          setCurrentQuestionIndex((prev) => prev + 1);
          setPhase('question');
          
          // Release lock after new question enters
          lockTimerRef.current = setTimeout(() => {
            setIsLocked(false);
          }, 450);
        }, 360);
      }, 2000);
    }
  }, [phase, progressStep]);

  const handleSelectOption = (_optionIndex: number) => {
    if (isLocked || phase !== 'question') return;
    
    // Lock interaction immediately during transition
    setIsLocked(true);
    clearAllTimers();

    const currentQ = GALLERY_01_QUESTIONS[currentQuestionIndex];
    if (currentQ) {
      markQuestionAnswered(`gallery01-q0${currentQ.id}`);
      markQuestionAnswered(`gallery01-q${currentQ.id}`);
    }

    if (currentQuestionIndex === 0) {
      // After Question 1 -> show 1/3 progress artwork
      setGalleryAnsweredCount('gallery-01', 1);
      setProgressStep(1);
      setPhase('progress');
    } else if (currentQuestionIndex === 1) {
      // After Question 2 -> show 2/3 progress artwork
      setGalleryAnsweredCount('gallery-01', 2);
      setProgressStep(2);
      setPhase('progress');
    } else {
      // After Question 3 -> transition to final completed artwork view
      setGalleryQuestionsCompleted('gallery-01', true);
      setPhase('completed');
      lockTimerRef.current = setTimeout(() => {
        setIsLocked(false);
      }, 450);
    }
  };

  const currentQuestion = GALLERY_01_QUESTIONS[currentQuestionIndex];

  return (
    <div
      id="gallery-01-questions-root"
      className="user-facing-app h-screen w-full flex flex-col overflow-hidden bg-[#fbf9f9] text-[#0e0f0f] relative font-sans-custom select-none"
    >
      {/* Top App Bar Header */}
      <header
        id="gallery-01-questions-top-bar"
        className="bg-[#fbf9f9] border-b border-[#e5e5e5] flex justify-between items-center px-4 sm:px-6 py-3.5 z-40 relative select-none shrink-0"
      >
        <button
          onClick={onNavigateBack}
          aria-label="بازگشت به گالری ۰۱"
          className="p-1.5 -ml-1.5 text-[#0e0f0f] hover:bg-[#eae7e7] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          <span className="font-mono-custom text-xs tracking-wider uppercase">گالری ۰۱</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono-custom tracking-widest text-[#747878] uppercase">
            گالری ۰۱
          </span>
          <h1 className="text-sm font-bold tracking-tight font-sans-custom uppercase">
            پرسش‌ها
          </h1>
        </div>

        <div className="w-8 flex justify-end">
          <span className="text-xs font-mono-custom text-[#747878] font-bold">
            {phase === 'completed'
              ? '۳/۳'
              : phase === 'progress'
              ? `${['۰', '۱', '۲', '۳'][progressStep] || progressStep}/۳`
              : `${['۱', '۲', '۳'][currentQuestionIndex] || currentQuestionIndex + 1}/۳`}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        id="gallery-01-questions-main"
        className="flex-1 min-h-0 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 mb-16"
      >
        <AnimatePresence mode="wait">
          {/* Question View (Q1, Q2, Q3) */}
          {phase === 'question' && (
            <motion.div
              key={`question-${currentQuestion.id}`}
              initial={{ x: '100vw', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100vw', opacity: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier
              }}
              className="w-full max-w-md mx-auto flex flex-col justify-center"
            >
              {/* Question Header Badge */}
              <div className="mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 border border-[#0e0f0f] text-[10px] font-mono-custom font-bold uppercase tracking-wider bg-white">
                  پرسش {['۰', '۱', '۲', '۳'][currentQuestion.id] || currentQuestion.id} از ۳
                </span>
              </div>

              {/* Question Heading */}
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0e0f0f] leading-snug mb-6">
                {currentQuestion.question}
              </h2>

              {/* 4 Options */}
              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((optionText, idx) => (
                  <button
                    key={idx}
                    disabled={isLocked}
                    onClick={() => handleSelectOption(idx)}
                    className="w-full text-right p-3.5 sm:p-4 bg-white border border-[#0e0f0f] hover:bg-[#0e0f0f] hover:text-[#fbf9f9] active:bg-[#2a2b2b] active:text-white transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed group flex items-center justify-between"
                  >
                    <span className="text-xs sm:text-sm font-medium tracking-tight pl-2">
                      {optionText}
                    </span>
                    <span className="font-mono-custom text-[11px] opacity-40 group-hover:opacity-100 font-bold shrink-0">
                      [{String.fromCharCode(65 + idx)}]
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Progressive Artwork Reveal View (Between Q1 -> Q2 and Q2 -> Q3) */}
          {phase === 'progress' && (
            <motion.div
              key={`progress-state-${progressStep}`}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-sm sm:max-w-md w-full h-full max-h-full"
            >
              <motion.div
                className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden relative"
                animate={
                  isFlashing
                    ? {
                        opacity: [1, 0, 1, 0, 1, 0],
                      }
                    : {
                        opacity: 1,
                      }
                }
                transition={
                  isFlashing
                    ? {
                        duration: 0.35,
                        ease: 'linear',
                      }
                    : {
                        duration: 0,
                      }
                }
              >
                {/* Reference ghost image for intrinsic layout geometry and sizing */}
                <img
                  src={artworkConfig.image || ''}
                  alt=""
                  aria-hidden="true"
                  className="max-h-full max-w-full w-auto h-auto object-contain select-none pointer-events-none invisible"
                  style={{
                    transform: `translate(${artworkConfig.x}%, ${artworkConfig.y}%) scale(${artworkConfig.scale / 100})`,
                  }}
                />

                {/* Layer 1: Bottom 1/3 (Blinks on Q1 completion; remains static with no animation on Q2 completion) */}
                <motion.img
                  src={artworkConfig.image || ''}
                  alt="Gallery 01 Artwork - Bottom Third"
                  initial={progressStep === 1 ? { opacity: 0 } : { opacity: 1 }}
                  animate={
                    progressStep === 1
                      ? { opacity: [0, 1, 0, 1, 0, 1] }
                      : { opacity: 1 }
                  }
                  transition={
                    progressStep === 1
                      ? { duration: 0.4, ease: 'easeInOut' }
                      : { duration: 0 }
                  }
                  className="max-h-full max-w-full w-auto h-auto object-contain select-none pointer-events-none transition-transform absolute"
                  style={{
                    transform: `translate(${artworkConfig.x}%, ${artworkConfig.y}%) scale(${artworkConfig.scale / 100})`,
                    clipPath: 'inset(66.666% 0% 0% 0%)',
                  }}
                  referrerPolicy="no-referrer"
                />

                {/* Layer 2: Middle 1/3 (Newly revealed on Q2 completion; blinks 2-3 times then stays visible) */}
                {progressStep === 2 && (
                  <motion.img
                    src={artworkConfig.image || ''}
                    alt="Gallery 01 Artwork - Middle Third"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0, 1, 0, 1] }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="max-h-full max-w-full w-auto h-auto object-contain select-none pointer-events-none transition-transform absolute"
                    style={{
                      transform: `translate(${artworkConfig.x}%, ${artworkConfig.y}%) scale(${artworkConfig.scale / 100})`,
                      clipPath: 'inset(33.333% 0% 33.333% 0%)',
                    }}
                    referrerPolicy="no-referrer"
                  />
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Completed State (After Question 3 is answered) */}
          {phase === 'completed' && (
            <motion.div
              key="completed-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-sm sm:max-w-md w-full h-full max-h-full"
            >
              <div className="flex-1 min-h-0 w-full flex items-center justify-center mb-4 overflow-hidden relative">
                <ArtworkFrame>
                  <img
                    src={artworkConfig.image || ''}
                    alt="Gallery 01 Artwork"
                    className="max-h-[42vh] sm:max-h-[46vh] max-w-[76vw] sm:max-w-xs w-auto h-auto object-contain select-none pointer-events-auto transition-transform block"
                    style={{
                      transform: `translate(${artworkConfig.x}%, ${artworkConfig.y}%) scale(${artworkConfig.scale / 100})`,
                    }}
                    referrerPolicy="no-referrer"
                  />
                </ArtworkFrame>
              </div>
              <div className="border border-[#0e0f0f] bg-white p-4 w-full text-center shrink-0">
                <span className="text-[10px] font-mono-custom font-bold text-[#747878] uppercase tracking-widest block mb-1">
                  گالری ۰۱
                </span>
                <h3 className="text-base font-bold uppercase tracking-tight text-[#0e0f0f]">
                  همه ۳ پرسش پاسخ داده شدند
                </h3>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="map"
        onTabChange={(tab) => {
          if (tab === 'map') {
            onNavigateBack();
          } else {
            if (tab === 'collection') {
              markCollectionsAsViewed();
            }
            onSelectTab?.(tab);
            onNavigateBack();
          }
        }}
      />
    </div>
  );
};
