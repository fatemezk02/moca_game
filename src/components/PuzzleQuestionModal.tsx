import React, { useState, useEffect } from 'react';
import {
  X,
  Puzzle,
  Check,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { AdminPuzzlePoint } from '../types/admin';
import {
  getGalleryPuzzleConfig,
  getGalleryPuzzleArtworkSrc,
  PuzzlePieceConfig,
} from '../data/galleryPuzzleConfig';
import {
  getCollectedPiecesForGallery,
  collectPuzzlePiece,
  isGalleryPuzzleCompleted,
  markGalleryPuzzleCompleted,
  isPuzzlePointCompleted,
  markPuzzlePointCompleted,
  recordPuzzleIncorrectAttempt,
} from '../data/puzzleProgressStore';
import { deductCoins } from '../data/questionProgressStore';
import { markQuestionAnswered } from '../data/arrowConditionsStore';
import { contentService } from '../services/content/contentService';
import { formatTwoDigitPersian, normalizeGalleryId, toPersianDigits } from '../services/content/mappers';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { JigsawPieceGraphic } from './JigsawPieceGraphic';
import { ArtworkFrame } from './ArtworkFrame';
import {
  areAll8GalleryPuzzlesCompleted,
  isFinalCompletionAwarded,
  openFinalCertificateModal,
} from '../data/finalCompletionStore';

export interface PuzzleQuestionModalProps {
  galleryId: string;
  puzzlePoint: AdminPuzzlePoint | null;
  onClose: () => void;
}

type ModalViewMode =
  | 'question'
  | 'piece_reward'
  | 'already_collected'
  | 'assembling'
  | 'completed';

/**
 * Shared reusable PuzzleQuestionModal component.
 * Used identically across Gallery 01, Gallery 02, Gallery 03, Gallery 04, and future galleries.
 * Preserves the exact modal size, typography, Persian font, borders, shadows, animations,
 * answer behavior, reward sequence, and celebration states.
 */
export const PuzzleQuestionModal: React.FC<PuzzleQuestionModalProps> = ({
  galleryId,
  puzzlePoint,
  onClose,
}) => {
  if (!puzzlePoint) return null;

  // Canonical gallery IDs:
  // gallery_01 = Master Gallery (no puzzles)
  // gallery_02 = the exhibition gallery that was previously Gallery 01
  // gallery_03 ... gallery_09
  // The Puzzle Modal must always display the CURRENT gallery number.
  // Never display the old Gallery 01 number.
  // Do not derive the gallery number from an old page/component name.
  // Use the current gallery_id and Galleries.gallery_number.
  const rawGalleryId = galleryId || puzzlePoint.galleryId || '';
  const canonicalGalleryId = normalizeGalleryId(rawGalleryId);

  // Final gallery puzzle artwork (Galleries.puzzle_artwork_id -> Artworks -> image_url)
  const puzzleConfig = getGalleryPuzzleConfig(canonicalGalleryId);
  const artworkSrc = getGalleryPuzzleArtworkSrc(canonicalGalleryId);

  const currentPieceConfig: PuzzlePieceConfig =
    puzzleConfig.pieces.find((p) => p.id === puzzlePoint.puzzlePieceId) ||
    puzzleConfig.pieces.find((p) => {
      const pieceOrderMatch = (puzzlePoint.puzzlePieceId || '').match(/0*([1-3])$/);
      return pieceOrderMatch && p.order === parseInt(pieceOrderMatch[1], 10);
    }) ||
    puzzleConfig.pieces[0];

  // Dynamic question loaded from Google Sheets via ContentService using canonicalGalleryId + puzzle_point_id
  const questionData = contentService.getQuestionForPuzzlePoint(
    canonicalGalleryId,
    puzzlePoint.id
  );

  // For development verification:
  // Log Puzzle Point ID, Current Gallery ID, Question ID, Question gallery_id, Question order
  useEffect(() => {
    console.log(
      `[PuzzleQuestionModal] Puzzle Point ID: ${puzzlePoint.id} | Current Gallery ID: ${canonicalGalleryId} | Question ID: ${questionData?.id ?? 'none'} | Question gallery_id: ${questionData?.galleryId ?? 'none'} | Question order: ${questionData?.questionOrder ?? 'none'}`
    );
  }, [puzzlePoint.id, canonicalGalleryId, questionData?.id, questionData?.galleryId, questionData?.questionOrder]);

  // Question Image Resolution: Questions.artwork_id -> Artworks.artwork_id -> Artworks.image_url
  const questionArtwork = questionData?.artworkId
    ? contentService.getArtworkById(questionData.artworkId)
    : null;
  const questionArtworkUrl = questionArtwork?.imageUrl?.trim() || '';

  const [, setQuestionImgLoaded] = useState(false);
  const [questionImgError, setQuestionImgError] = useState(false);

  useEffect(() => {
    setQuestionImgLoaded(false);
    setQuestionImgError(false);

    if (questionData?.artworkId) {
      if (!questionArtwork) {
        console.warn(
          `[PuzzleQuestionModal] Question "${questionData.id}" references artwork_id "${questionData.artworkId}" but no matching artwork was found in Artworks. Omitting image.`
        );
      } else if (!questionArtwork.imageUrl?.trim()) {
        console.warn(
          `[PuzzleQuestionModal] Artwork "${questionArtwork.id}" found for question "${questionData.id}" but has empty image_url. Omitting image.`
        );
      }
    }
  }, [questionData?.id, questionData?.artworkId, questionArtwork]);

  // Resolve gallery record from Galleries dataset by canonicalGalleryId
  const galleryRecord = contentService.getGalleryById(canonicalGalleryId);

  // Determine puzzle order (1, 2, or 3) from puzzle point ID
  const puzzleOrderMatch = (puzzlePoint.id || '').match(/(?:point|piece)?[-_]?0*([1-3])$/i);
  const pointOrder = puzzleOrderMatch ? parseInt(puzzleOrderMatch[1], 10) : 1;

  // Puzzle number from Questions.question_order (fallback to point order or piece order)
  const puzzleNumber = questionData?.questionOrder ?? pointOrder ?? currentPieceConfig?.order ?? 1;
  const puzzleNumberFa = formatTwoDigitPersian(puzzleNumber);

  // Gallery number strictly from Galleries.gallery_number (fallback to digits in canonicalGalleryId)
  const rawGalleryNumber = galleryRecord?.galleryNumber ?? canonicalGalleryId.replace(/[^0-9]/g, '');
  const galleryNumberFa = formatTwoDigitPersian(rawGalleryNumber);

  // Gallery name strictly from Galleries.name_fa
  const galleryNameFa = galleryRecord?.nameFa?.trim() || 'گالری';

  // Modal header title: پازل [شماره پازل] ـ گالری [شماره گالری]
  const modalHeaderTitle = `پازل ${puzzleNumberFa} ـ گالری ${galleryNumberFa}`;

  // Blue informational text: پازل [شماره پازل] از گالری [نام گالری]
  const blueInformationalText = `پازل ${puzzleNumberFa} از گالری ${galleryNameFa}`;

  const initialCollected = isPuzzlePointCompleted(
    puzzlePoint.id,
    canonicalGalleryId,
    puzzlePoint.puzzlePieceId
  );
  const isAllInitiallyComplete = isGalleryPuzzleCompleted(canonicalGalleryId);

  const [viewMode, setViewMode] = useState<ModalViewMode>(() => {
    if (isAllInitiallyComplete) {
      return 'completed';
    }
    if (initialCollected) {
      return 'already_collected';
    }
    return 'question';
  });

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [wrongOptionIndex, setWrongOptionIndex] = useState<number | null>(null);
  const [floatingPenalty, setFloatingPenalty] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [assembledPiecesCount, setAssembledPiecesCount] = useState<number>(0);

  const playerStats = usePlayerStats();
  const hasZeroCoins = playerStats.coins <= 0;

  // Get live collected pieces list
  const [collectedPieces, setCollectedPieces] = useState<string[]>(() =>
    getCollectedPiecesForGallery(canonicalGalleryId)
  );

  const totalPieces = puzzleConfig.totalPieces;
  const isComplete = collectedPieces.length >= totalPieces;

  // Trigger celebratory confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c5a059', '#38bdf8', '#22c55e', '#f59e0b', '#1e1b18'],
      });
    } catch {
      // safe fallback if confetti fails in iframe
    }
  };

  // Auto-close puzzle modal if independent certificate modal opens
  useEffect(() => {
    const handleCertificateOpen = () => {
      onClose();
    };
    window.addEventListener('museum_open_final_certificate', handleCertificateOpen);
    return () => {
      window.removeEventListener('museum_open_final_certificate', handleCertificateOpen);
    };
  }, [onClose]);

  const handleSelectOption = (index: number) => {
    if (isAnswering || viewMode !== 'question' || !questionData) return;

    setSelectedOption(index);
    const correctIdx = questionData.correctIndex;
    const isCorrect = correctIdx === -1 || index === correctIdx;

    if (!isCorrect) {
      const effectivePuzzleId =
        puzzlePoint.id ||
        puzzlePoint.questionId ||
        puzzlePoint.puzzlePieceId ||
        `${canonicalGalleryId}_puzzle_${puzzleNumber}`;

      const alreadyDone = isPuzzlePointCompleted(
        puzzlePoint.id,
        canonicalGalleryId,
        puzzlePoint.puzzlePieceId
      );

      let penalty = 0;
      if (!alreadyDone) {
        const attemptNum = recordPuzzleIncorrectAttempt(effectivePuzzleId);
        if (attemptNum === 1) {
          penalty = 5;
        } else if (attemptNum === 2) {
          penalty = 10;
        } else {
          penalty = 0;
        }

        if (penalty > 0) {
          deductCoins(penalty);
          setFloatingPenalty(penalty);
        }
      }

      setWrongOptionIndex(index);
      setIsAnswering(true);
      setTimeout(() => {
        setWrongOptionIndex(null);
        setFloatingPenalty(null);
        setIsAnswering(false);
      }, 900);
      return;
    }

    setIsAnswering(true);

    // Mark question as answered in conditions store
    markQuestionAnswered(puzzlePoint.questionId);

    // Save and collect puzzle piece & mark puzzle point completed by unique ID
    collectPuzzlePiece(
      canonicalGalleryId,
      puzzlePoint.puzzlePieceId,
      puzzlePoint.questionId,
      puzzlePoint.id
    );
    markPuzzlePointCompleted(
      puzzlePoint.id,
      canonicalGalleryId,
      puzzlePoint.puzzlePieceId,
      puzzlePoint.questionId
    );

    const updatedPieces = Array.from(new Set([...collectedPieces, puzzlePoint.puzzlePieceId]));
    setCollectedPieces(updatedPieces);

    // Transition smoothly to reward view
    setTimeout(() => {
      setViewMode('piece_reward');
      setIsAnswering(false);
    }, 450);
  };

  const startAssemblySequence = () => {
    setViewMode('assembling');
    setAssembledPiecesCount(0);

    // Assemble pieces one by one with animations
    setTimeout(() => {
      setAssembledPiecesCount(1);
    }, 400);

    setTimeout(() => {
      setAssembledPiecesCount(2);
    }, 1100);

    setTimeout(() => {
      setAssembledPiecesCount(3);
    }, 1800);

    // Complete puzzle & trigger celebration
    setTimeout(() => {
      markGalleryPuzzleCompleted(canonicalGalleryId);
      triggerCelebration();
      setViewMode('completed');
    }, 2500);
  };

  return (
    <AnimatePresence>
      <div
        id="puzzle-point-modal-backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#0e0f0f]/60 backdrop-blur-xs select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget && viewMode !== 'assembling') {
            onClose();
          }
        }}
      >
        <motion.div
          id="puzzle-point-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] overflow-hidden flex flex-col max-h-[88vh]"
        >
            {/* Top Header Bar */}
            <div
              id="puzzle-point-modal-header"
              className="bg-[#e0f2fe] border-b-2 border-[#1e1b18] px-4 py-2.5 flex items-center justify-between shrink-0"
            >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#38bdf8] border-[1.5px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center text-[#1e1b18]">
                <Puzzle className="w-3.5 h-3.5 text-[#1e1b18] fill-[#1e1b18]" />
              </div>
              <div className="text-right">
                <h2 className="font-sans-custom text-[14px] font-black text-[#1e1b18] tracking-tight">
                  {modalHeaderTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Puzzle Pieces Progress Badge */}
              <div
                id="modal-puzzle-pieces-badge"
                title={`پیشرفت پازل: ${toPersianDigits(collectedPieces.length)} از ${toPersianDigits(totalPieces)} قطعه`}
                className="bg-[#ffffff] text-[#1e1b18] border-[1.5px] border-[#1e1b18] rounded-full px-2.5 py-0.5 shadow-[1px_1px_0px_#1e1b18] flex items-center gap-1 font-mono-custom text-[11px] font-bold"
              >
                <span className="w-2 h-2 rounded-full bg-[#a78bfa] inline-block"></span>
                <span>🧩</span>
                <span dir="ltr">
                  {toPersianDigits(collectedPieces.length)}/{toPersianDigits(totalPieces)}
                </span>
              </div>

              {/* Close Button */}
              <button
                id="puzzle-point-close-btn"
                onClick={onClose}
                disabled={viewMode === 'assembling'}
                aria-label="بستن پنجره پازل"
                className="w-7 h-7 rounded-full bg-[#ffffff] hover:bg-[#ef4444] hover:text-white transition-colors text-[#1e1b18] border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Modal Body Container */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col justify-start">
            <AnimatePresence mode="wait">
              {/* ==========================================================
                  STAGE 1: QUESTION PHASE
                  ========================================================== */}
              {viewMode === 'question' && (
                <motion.div
                  key="view-question"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  {hasZeroCoins ? (
                    <div className="space-y-3 p-5 sm:p-6 bg-[#fffbeb] border-2 border-[#f59e0b] rounded-2xl text-center shadow-[2px_2px_0px_#1e1b18] my-auto">
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#fef3c7] border-2 border-[#d97706] flex items-center justify-center text-2xl select-none">
                        🪙
                      </div>
                      <div className="space-y-2 text-center">
                        <h4 className="font-sans-custom text-[14px] sm:text-[15px] font-black text-[#92400e] leading-snug">
                          برای پاسخ‌گویی به بیش از ۵ سکه احتیاج داری
                        </h4>
                        <p className="font-sans-custom text-[12px] sm:text-[13px] font-bold text-[#b45309] leading-relaxed">
                          برای جمع کردن سکه به سوالات اثار ستاره دار سر بزن
                        </p>
                      </div>
                    </div>
                  ) : !questionData ? (
                    <div className="space-y-3 p-5 bg-[#f8fafc] border-2 border-dashed border-[#cbd5e1] rounded-xl text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-[#f1f5f9] border border-[#cbd5e1] flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-[#64748b]" />
                      </div>
                      <div>
                        <h4 className="font-sans-custom text-[14px] font-bold text-[#1e1b18]">
                          پرسش این نقطه پازل هنوز در جدول محتوا تنظیم نشده است
                        </h4>
                        <p className="text-[12px] text-[#64748b] mt-1.5 leading-relaxed">
                          پرسش متناظر با این نقطه پازل در جدول گوگل شیت وجود ندارد یا غیرفعال است.
                        </p>
                      </div>
                      <div className="inline-block px-3 py-1 bg-[#ffffff] border border-[#e2e8f0] rounded-md text-[11px] font-mono-custom text-[#64748b]">
                        شناسه نقطه: {puzzlePoint.id}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Question Artwork Image from Artworks dataset (Questions.artwork_id -> Artworks.artwork_id -> Artworks.image_url) */}
                      {questionArtworkUrl && !questionImgError && (
                        <div className="w-full flex items-center justify-center py-1">
                          <ArtworkFrame>
                            <img
                              src={questionArtworkUrl}
                              alt={questionData.title || questionData.questionFa || 'تصویر پرسش پازل'}
                              className="max-h-[20vh] sm:max-h-[24vh] max-w-full w-auto h-auto object-contain block rounded-xs select-none"
                              referrerPolicy="no-referrer"
                              onLoad={() => setQuestionImgLoaded(true)}
                              onError={() => {
                                console.warn(
                                  `[PuzzleQuestionModal] Failed to load question artwork image: ${questionArtworkUrl}`
                                );
                                setQuestionImgError(true);
                              }}
                            />
                          </ArtworkFrame>
                        </div>
                      )}

                      {/* Question Text */}
                      <div className="space-y-1 text-right">
                        <h3 className="font-sans-custom text-[14px] sm:text-[15px] font-black text-[#1e1b18] leading-snug">
                          {questionData.questionFa || questionData.question}
                        </h3>
                        {questionData.questionEn && questionData.questionEn !== (questionData.questionFa || questionData.question) && (
                          <p className="text-[12px] font-medium text-[#64748b] leading-relaxed font-mono-custom" dir="ltr">
                            {questionData.questionEn}
                          </p>
                        )}
                      </div>

                      {/* Wrong answer feedback banner */}
                      {wrongOptionIndex !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative p-2.5 bg-[#fef2f2] border-2 border-[#f87171] rounded-xl text-center flex flex-col items-center justify-center"
                        >
                          {floatingPenalty !== null && floatingPenalty > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.8 }}
                              animate={{
                                opacity: [0, 1, 1, 0],
                                y: [8, -4, -14, -24],
                                scale: [0.8, 1.1, 1.05, 0.95],
                              }}
                              transition={{
                                duration: 0.9,
                                times: [0, 0.2, 0.7, 1],
                                ease: 'easeOut',
                              }}
                              className="absolute -top-3.5 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fee2e2] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] text-[#dc2626] select-none pointer-events-none"
                            >
                              <span
                                className="font-mono-custom text-[13px] sm:text-[14px] font-black text-[#dc2626] flex items-center gap-1"
                                dir="ltr"
                              >
                                <span>−{toPersianDigits(floatingPenalty)}</span>
                                <span className="text-[13px]">🪙</span>
                              </span>
                            </motion.div>
                          )}
                          <p className="text-[12px] font-bold text-[#dc2626]">
                            پاسخ نادرست بود. لطفاً دوباره تلاش کنید!
                          </p>
                        </motion.div>
                      )}

                      {/* Options */}
                      <div className="space-y-2.5">
                        {questionData.options.map((optionText, idx) => {
                          const isChosen = selectedOption === idx && wrongOptionIndex === null;
                          const isWrong = wrongOptionIndex === idx;
                          return (
                            <button
                              key={idx}
                              disabled={isAnswering}
                              onClick={() => handleSelectOption(idx)}
                              className={`w-full text-right p-3 sm:p-3.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer group disabled:cursor-not-allowed ${
                                isWrong
                                  ? 'bg-[#fee2e2] text-[#dc2626] border-[#ef4444] shadow-[2px_2px_0px_#ef4444]'
                                  : isChosen
                                  ? 'bg-[#1e1b18] text-[#ffffff] border-[#1e1b18] shadow-[3px_3px_0px_#38bdf8]'
                                  : 'bg-[#ffffff] text-[#1e1b18] border-[#1e1b18] hover:bg-[#f8fafc] shadow-[2px_2px_0px_#1e1b18]'
                              }`}
                            >
                              <div className="flex flex-col pr-2">
                                <span className="text-[12px] sm:text-[13px] font-bold leading-relaxed">
                                  {optionText}
                                </span>
                                {questionData.optionsEn?.[idx] && (
                                  <span className="text-[10px] text-[#64748b] font-medium" dir="ltr">
                                    {questionData.optionsEn[idx]}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`font-mono-custom text-[11px] font-black shrink-0 px-2 py-0.5 rounded border ${
                                  isWrong
                                    ? 'bg-[#ef4444] text-white border-[#b91c1c]'
                                    : isChosen
                                    ? 'bg-[#38bdf8] text-[#1e1b18] border-[#38bdf8]'
                                    : 'bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] group-hover:border-[#1e1b18]'
                                }`}
                              >
                                {toPersianDigits(idx + 1)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* ==========================================================
                  STAGE 2: PIECE REWARD PHASE
                  ========================================================== */}
              {viewMode === 'piece_reward' && (
                <motion.div
                  key="view-piece-reward"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4 my-auto text-center"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#dcfce7] border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#15803d]" />
                  </div>

                  <div>
                    <h3 className="font-sans-custom text-[16px] font-black text-[#15803d]">
                      قطعه پازل دریافت شد! 🎉
                    </h3>
                    <p className="text-[12px] font-medium text-[#64748b] mt-1">
                      آفرین! این قطعه با فرم واقعی به مجموعه پازل شما افزوده شد.
                    </p>
                  </div>

                  {/* Genuine Jigsaw Cut Piece Graphic in Neo-Brutalist Frame */}
                  <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl p-3 shadow-[2px_2px_0px_#1e1b18] flex flex-col items-center gap-1.5">
                    <div className="relative p-1">
                      <JigsawPieceGraphic
                        piece={currentPieceConfig}
                        artworkSrc={artworkSrc}
                        mode="standalone"
                      />
                      <span className="absolute -top-1 -right-1 p-1 bg-[#22c55e] text-white border border-[#1e1b18] rounded-full shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    </div>
                    <span className="font-sans-custom text-[13px] font-black text-[#1e1b18]">
                      {currentPieceConfig.titleFa}
                    </span>
                  </div>

                  {/* Progress Box */}
                  <div className="bg-[#f0f9ff] border-2 border-[#1e1b18] rounded-xl px-4 py-2.5 shadow-[2px_2px_0px_#1e1b18] flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#0369a1]">
                      پیشرفت پازل گالری:
                    </span>
                    <span className="font-mono-custom text-[14px] font-black text-[#0369a1] flex items-center gap-1">
                      <span>{collectedPieces.length}</span>
                      <span>از</span>
                      <span>{totalPieces}</span>
                      <span>قطعه</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1">
                    {collectedPieces.length >= totalPieces ? (
                      <button
                        onClick={startAssemblySequence}
                        className="w-full py-3 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] active:bg-[#d97706] text-[#1e1b18] font-black text-[14px] border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1.5px_1.5px_0px_#1e1b18]"
                      >
                        <Sparkles className="w-4 h-4 text-[#1e1b18]" />
                        <span>تکمیل و سرهم‌سازی شاهکار ({totalPieces}/{totalPieces})</span>
                      </button>
                    ) : (
                      <button
                        onClick={onClose}
                        className="w-full py-3 bg-[#1e1b18] hover:bg-[#2a2b2b] text-[#ffffff] font-black text-[13px] rounded-xl shadow-[3px_3px_0px_#1e1b18] cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        <span>ادامه کاوش در نقشه</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ==========================================================
                  STAGE 3: ALREADY COLLECTED PHASE
                  ========================================================== */}
              {viewMode === 'already_collected' && (
                <motion.div
                  key="view-already-collected"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4 my-auto text-center"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#dcfce7] border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#15803d]" />
                  </div>

                  <div>
                    <h3 className="font-sans-custom text-[16px] font-black text-[#1e1b18]">
                      قطعه قبلاً جمع‌آوری شده
                    </h3>
                    <p className="text-[12px] font-medium text-[#64748b] mt-1 leading-relaxed">
                      شما قبلاً به پرسش این نقطه پاسخ داده‌اید و این قطعه در مجموعه شما ثبت است.
                    </p>
                  </div>

                  {/* Standalone Jigsaw Preview Card */}
                  <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl p-3 shadow-[2px_2px_0px_#1e1b18] flex flex-col items-center gap-1.5">
                    <div className="relative p-1">
                      <JigsawPieceGraphic
                        piece={currentPieceConfig}
                        artworkSrc={artworkSrc}
                        mode="standalone"
                      />
                      <span className="absolute -top-1 -right-1 p-1 bg-[#22c55e] text-white border border-[#1e1b18] rounded-full shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    </div>
                    <span className="font-sans-custom text-[13px] font-black text-[#1e1b18]">
                      {currentPieceConfig.titleFa}
                    </span>
                  </div>

                  {/* Progress Box */}
                  <div className="bg-[#f0f9ff] border-2 border-[#1e1b18] rounded-xl px-4 py-2.5 shadow-[2px_2px_0px_#1e1b18] flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#0369a1]">
                      وضعیت پازل گالری:
                    </span>
                    <span className="font-mono-custom text-[14px] font-black text-[#0369a1] flex items-center gap-1">
                      <span>{toPersianDigits(collectedPieces.length)}</span>
                      <span>از</span>
                      <span>{toPersianDigits(totalPieces)}</span>
                      <span>قطعه</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    {(areAll8GalleryPuzzlesCompleted() || isFinalCompletionAwarded()) && (
                      <button
                        type="button"
                        id="already-collected-view-certificate-btn"
                        onClick={() => setViewMode('final_certificate')}
                        className="w-full py-3 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e1b18] font-black text-[13px] border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Sparkles className="w-4 h-4 text-[#1e1b18]" />
                        <span>مشاهده کارت دستاورد نهایی (گواهی‌نامه) 🏆</span>
                      </button>
                    )}

                    {isComplete ? (
                      <button
                        onClick={startAssemblySequence}
                        className="w-full py-3 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] active:bg-[#d97706] text-[#1e1b18] font-black text-[14px] border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-[#1e1b18]" />
                        <span>مشاهده شاهکار سرهم‌شده</span>
                      </button>
                    ) : null}

                    <button
                      onClick={onClose}
                      className="w-full py-2.5 bg-[#ffffff] hover:bg-[#f8fafc] text-[#1e1b18] font-bold text-[12px] border-2 border-[#1e1b18] rounded-xl shadow-[2px_2px_0px_#1e1b18] cursor-pointer transition-all"
                    >
                      بستن
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ==========================================================
                  STAGE 4: ASSEMBLING SEQUENCE
                  ========================================================== */}
              {viewMode === 'assembling' && (
                <motion.div
                  key="view-assembling"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3.5 my-auto text-center flex flex-col items-center"
                >
                  <div className="bg-[#fef3c7] border-2 border-[#1e1b18] px-4 py-1.5 rounded-xl shadow-[2px_2px_0px_#1e1b18] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d97706] animate-spin" />
                    <span className="text-[13px] font-black font-sans-custom text-[#1e1b18]">
                      در حال سرهم‌سازی قطعات پازل...
                    </span>
                  </div>

                  {/* Assembled Canvas Box with Neo-Brutalist Frame */}
                  <div className="w-64 h-64 sm:w-72 sm:h-72 border-2 border-[#1e1b18] bg-[#1e1b18] rounded-2xl relative overflow-hidden shadow-[4px_4px_0px_#1e1b18]">
                    <svg viewBox="0 0 1000 1000" className="w-full h-full">
                      {/* Background template silhouette with subtle puzzle borders */}
                      <rect width="1000" height="1000" fill="#2a2724" />

                      {/* Pieces appearing one by one with quick blink animation */}
                      {assembledPiecesCount >= 1 && (
                        <g className="animate-pulse">
                          <JigsawPieceGraphic
                            piece={puzzleConfig.pieces[0]}
                            artworkSrc={artworkSrc}
                            mode="assembled"
                            isHighlighted={assembledPiecesCount === 1}
                          />
                        </g>
                      )}

                      {assembledPiecesCount >= 2 && (
                        <g className="animate-pulse">
                          <JigsawPieceGraphic
                            piece={puzzleConfig.pieces[1]}
                            artworkSrc={artworkSrc}
                            mode="assembled"
                            isHighlighted={assembledPiecesCount === 2}
                          />
                        </g>
                      )}

                      {assembledPiecesCount >= 3 && (
                        <g className="animate-pulse">
                          <JigsawPieceGraphic
                            piece={puzzleConfig.pieces[2]}
                            artworkSrc={artworkSrc}
                            mode="assembled"
                            isHighlighted={assembledPiecesCount === 3}
                          />
                        </g>
                      )}
                    </svg>
                  </div>

                  <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl px-4 py-2 shadow-[2px_2px_0px_#1e1b18] text-xs font-mono-custom font-bold text-[#64748b]">
                    <span>
                      قطعه {toPersianDigits(assembledPiecesCount)} از {toPersianDigits(totalPieces)} در جای خود قرار گرفت
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ==========================================================
                  STAGE 5: COMPLETED CELEBRATION
                  ========================================================== */}
              {viewMode === 'completed' && (
                <motion.div
                  key="view-completed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3.5 my-auto text-center"
                >
                  {/* Completed Full Artwork in ArtworkFrame */}
                  <div className="w-full flex items-center justify-center overflow-hidden py-1">
                    <ArtworkFrame>
                      <div className="w-56 h-56 sm:w-64 sm:h-64 bg-[#1e1b18] relative overflow-hidden rounded-xs">
                        <svg viewBox="0 0 1000 1000" className="w-full h-full">
                          {puzzleConfig.pieces.map((p) => (
                            <JigsawPieceGraphic
                              key={p.id}
                              piece={p}
                              artworkSrc={artworkSrc}
                              mode="assembled"
                            />
                          ))}
                        </svg>
                      </div>
                    </ArtworkFrame>
                  </div>

                  {/* Congratulatory Celebration Banner */}
                  <div className="bg-[#dcfce7] border-2 border-[#1e1b18] px-4 py-2 rounded-xl shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center gap-2 text-[13px] font-black text-[#15803d]">
                    <Sparkles className="w-4 h-4 text-[#15803d]" />
                    <span>دمت گرم این پازل رو تکمیل کردی 🎉</span>
                  </div>


                  {(areAll8GalleryPuzzlesCompleted() || isFinalCompletionAwarded()) && (
                    <button
                      type="button"
                      id="completed-puzzle-view-certificate-btn"
                      onClick={() => {
                        openFinalCertificateModal();
                        onClose();
                      }}
                      className="w-full py-3 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e1b18] font-black text-[13px] border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <Sparkles className="w-4 h-4 text-[#1e1b18]" />
                      <span>مشاهده کارت دستاورد نهایی (گواهی‌نامه) 🏆</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-[#1e1b18] hover:bg-[#2a2b2b] text-[#ffffff] font-black text-[13px] rounded-xl shadow-[3px_3px_0px_#1e1b18] cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <span>پایان و بازگشت به نقشه</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PuzzleQuestionModal;
