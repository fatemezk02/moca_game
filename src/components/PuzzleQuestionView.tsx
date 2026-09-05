import React, { useState } from 'react';
import { ArrowLeft, Check, Puzzle, Sparkles, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNavBar } from './BottomNavBar';
import { AdminPuzzlePoint } from '../types/admin';
import {
  isPuzzlePieceCollected,
  collectPuzzlePiece,
  markPuzzlePointCompleted,
} from '../data/puzzleProgressStore';
import { markQuestionAnswered } from '../data/arrowConditionsStore';
import { awardCoins } from '../data/questionProgressStore';
import { contentService } from '../services/content/contentService';
import { formatTwoDigitPersian } from '../services/content/mappers';
import {
  getGalleryPuzzleConfig,
  getGalleryPuzzleArtworkSrc,
  PuzzlePieceConfig,
} from '../data/galleryPuzzleConfig';
import { JigsawPieceGraphic } from './JigsawPieceGraphic';

interface PuzzleQuestionViewProps {
  galleryId: string;
  puzzlePoint: AdminPuzzlePoint;
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

type PuzzleViewPhase = 'question' | 'reward' | 'already-collected';

export const PuzzleQuestionView: React.FC<PuzzleQuestionViewProps> = ({
  galleryId,
  puzzlePoint,
  onNavigateBack,
  onSelectTab,
}) => {
  const isAlreadyCollected = isPuzzlePieceCollected(galleryId, puzzlePoint.puzzlePieceId);

  const [phase, setPhase] = useState<PuzzleViewPhase>(() =>
    isAlreadyCollected ? 'already-collected' : 'question'
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [wrongOptionIndex, setWrongOptionIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const puzzleConfig = getGalleryPuzzleConfig(galleryId);
  const artworkSrc = getGalleryPuzzleArtworkSrc(galleryId);
  const currentPieceConfig: PuzzlePieceConfig =
    puzzleConfig.pieces.find((p) => p.id === puzzlePoint.puzzlePieceId) ||
    puzzleConfig.pieces[0];

  // Dynamic question loaded from Google Sheets via ContentService
  const questionData = contentService.getQuestionForPuzzlePoint(
    galleryId,
    puzzlePoint.id
  );

  // Resolve gallery record from Galleries dataset by gallery_id
  const galleryRecord = contentService.getGalleryById(galleryId);

  // Puzzle number from Questions.question_order (fallback to piece order)
  const puzzleNumber = questionData?.questionOrder ?? currentPieceConfig?.order ?? 1;
  const puzzleNumberFa = formatTwoDigitPersian(puzzleNumber);

  // Gallery number strictly from Galleries.gallery_number (fallback to digits in galleryId)
  const rawGalleryNumber = galleryRecord?.galleryNumber ?? galleryId.replace(/[^0-9]/g, '');
  const galleryNumberFa = formatTwoDigitPersian(rawGalleryNumber);

  // Gallery name strictly from Galleries.name_fa
  const galleryNameFa = galleryRecord?.nameFa?.trim() || 'گالری';

  // Modal header title: پازل [شماره پازل] ـ گالری [شماره گالری]
  const modalHeaderTitle = `پازل ${puzzleNumberFa} ـ گالری ${galleryNumberFa}`;

  // Blue informational text: پازل [شماره پازل] از گالری [نام گالری]
  const blueInformationalText = `پازل ${puzzleNumberFa} از گالری ${galleryNameFa}`;

  const handleSelectOption = (index: number) => {
    if (isLocked || phase !== 'question' || !questionData) return;

    setSelectedOption(index);
    const correctIdx = questionData.correctIndex;
    const isCorrect = correctIdx === -1 || index === correctIdx;

    if (!isCorrect) {
      setWrongOptionIndex(index);
      setIsLocked(true);
      setTimeout(() => {
        setWrongOptionIndex(null);
        setIsLocked(false);
      }, 900);
      return;
    }

    setIsLocked(true);

    // Mark question as answered in conditions store
    markQuestionAnswered(puzzlePoint.questionId);

    // Award reward coins from Google Sheets
    if (questionData.reward && questionData.reward > 0) {
      awardCoins(questionData.reward);
    }

    // Save and award puzzle piece
    collectPuzzlePiece(
      galleryId,
      puzzlePoint.puzzlePieceId,
      puzzlePoint.questionId,
      puzzlePoint.id
    );
    markPuzzlePointCompleted(
      puzzlePoint.id,
      galleryId,
      puzzlePoint.puzzlePieceId,
      puzzlePoint.questionId
    );

    // Smooth transition to reward phase
    setTimeout(() => {
      setPhase('reward');
      setIsLocked(false);
    }, 450);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#fbf9f9] text-[#1e1b18] select-none font-sans-custom overflow-hidden relative">
      {/* Top Header Bar */}
      <header className="h-14 bg-[#ffffff] border-b-2 border-[#1e1b18] px-4 flex items-center justify-between z-30 shrink-0">
        <button
          onClick={onNavigateBack}
          aria-label="بازگشت به نقشه"
          className="py-1.5 px-3 bg-[#ffffff] hover:bg-[#f8fafc] text-[#1e1b18] flex items-center gap-1.5 text-xs font-mono-custom font-bold border-2 border-[#1e1b18] rounded-xl shadow-[2px_2px_0px_#1e1b18] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>بازگشت به نقشه</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#e0f2fe] border-2 border-[#1e1b18] rounded-full text-[11px] font-mono-custom font-bold shadow-[1px_1px_0px_#1e1b18]">
            <Puzzle className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>{modalHeaderTitle}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* Phase 1: Question */}
          {phase === 'question' && (
            <motion.div
              key="puzzle-question-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="max-w-md w-full bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0px_#1e1b18] flex flex-col space-y-4"
            >
              {!questionData ? (
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
                  {/* Question Badge & Title */}
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 gap-2">
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-7 h-7 rounded-full bg-[#38bdf8] border-[1.5px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center text-[#1e1b18]">
                        <Puzzle className="w-3.5 h-3.5 text-[#1e1b18] fill-[#1e1b18]" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black font-mono-custom text-[#1e1b18]">
                          {modalHeaderTitle}
                        </h3>
                        <p className="text-[11px] text-[#64748b] font-medium">
                          {currentPieceConfig.titleFa}
                        </p>
                      </div>
                    </div>
                    {/* Blue Box containing the requested single-line informational text */}
                    <div
                      id="puzzle-view-blue-box"
                      className="bg-[#f0f9ff] border border-[#38bdf8] px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-bold text-[#0369a1] font-sans-custom whitespace-nowrap overflow-hidden text-ellipsis shadow-xs"
                      title={blueInformationalText}
                    >
                      {blueInformationalText}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1 text-right">
                    <h2 className="font-sans-custom text-[14px] sm:text-[15px] font-black text-[#1e1b18] leading-snug">
                      {questionData.questionFa || questionData.question}
                    </h2>
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
                      className="p-2.5 bg-[#fef2f2] border-2 border-[#f87171] rounded-xl text-center"
                    >
                      <p className="text-[12px] font-bold text-[#dc2626]">
                        پاسخ نادرست بود. لطفاً دوباره تلاش کنید!
                      </p>
                    </motion.div>
                  )}

                  {/* 4 Options */}
                  <div className="space-y-2.5">
                    {questionData.options.map((optionText, idx) => {
                      const isChosen = selectedOption === idx && wrongOptionIndex === null;
                      const isWrong = wrongOptionIndex === idx;
                      return (
                        <button
                          key={idx}
                          disabled={isLocked}
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
                            className={`font-mono-custom text-[11px] font-black shrink-0 px-1.5 py-0.5 rounded border ${
                              isWrong
                                ? 'bg-[#ef4444] text-white border-[#b91c1c]'
                                : isChosen
                                ? 'bg-[#38bdf8] text-[#1e1b18] border-[#38bdf8]'
                                : 'bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] group-hover:border-[#1e1b18]'
                            }`}
                          >
                            [{String.fromCharCode(65 + idx)}]
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Phase 2: Reward Confirmation */}
          {phase === 'reward' && (
            <motion.div
              key="puzzle-reward-card"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="max-w-sm sm:max-w-md w-full bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#1e1b18] flex flex-col items-center text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#dcfce7] border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#15803d]" />
              </div>

              <div>
                <h2 className="font-sans-custom text-[16px] font-black text-[#15803d]">
                  قطعه پازل دریافت شد! 🎉
                </h2>
                <p className="text-[12px] font-medium text-[#64748b] mt-1">
                  پاسخ شما ثبت شد و این قطعه با فرم واقعی به مجموعه شما اضافه گردید.
                </p>
                {questionData?.reward ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 bg-[#fef3c7] border border-[#f59e0b] rounded-full text-xs font-bold text-[#b45309]">
                    <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>+{questionData.reward} سکه پاداش دریافت شد</span>
                  </div>
                ) : null}
              </div>

              {/* Jigsaw Cut Piece Graphic */}
              <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl p-3 shadow-[2px_2px_0px_#1e1b18] flex flex-col items-center gap-1.5 w-full">
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

              {/* Return to Map Button */}
              <button
                onClick={onNavigateBack}
                className="w-full py-3 bg-[#1e1b18] hover:bg-[#2a2b2b] text-[#ffffff] font-black text-[13px] rounded-xl shadow-[3px_3px_0px_#1e1b18] cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                <span>بازگشت به نقشه</span>
              </button>
            </motion.div>
          )}

          {/* Phase 3: Already Collected State */}
          {phase === 'already-collected' && (
            <motion.div
              key="puzzle-already-collected-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-sm sm:max-w-md w-full bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#1e1b18] flex flex-col items-center text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#dcfce7] border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#15803d]" />
              </div>

              <div>
                <h2 className="font-sans-custom text-[16px] font-black text-[#1e1b18]">
                  قطعه قبلاً جمع‌آوری شده
                </h2>
                <p className="text-[12px] font-medium text-[#64748b] mt-1 leading-relaxed">
                  شما به پرسش این نقطه پاسخ داده‌اید و این قطعه در مجموعه شما ثبت است.
                </p>
              </div>

              <div className="bg-[#f8fafc] border-2 border-[#1e1b18] rounded-xl p-3 shadow-[2px_2px_0px_#1e1b18] flex flex-col items-center gap-1.5 w-full">
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

              <button
                onClick={onNavigateBack}
                className="w-full py-3 bg-[#1e1b18] hover:bg-[#2a2b2b] text-[#ffffff] font-black text-[13px] rounded-xl shadow-[3px_3px_0px_#1e1b18] cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                <span>بازگشت به نقشه</span>
              </button>
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
            onSelectTab?.(tab);
            onNavigateBack();
          }
        }}
        collectionCount={8}
      />
    </div>
  );
};
