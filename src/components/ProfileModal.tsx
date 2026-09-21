import React, { useEffect, useState } from 'react';
import { X, Puzzle, Landmark, Sparkles, RotateCcw, AlertTriangle, Star } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';
import { getUserProfile, saveUserProfile, UserProfile } from '../data/userProfileStore';
import { AVATAR_OPTIONS } from '../data/avatarConfig';
import { getPuzzleProgress, isGalleryPuzzleCompleted } from '../data/puzzleProgressStore';
import {
  areAll8GalleryPuzzlesCompleted,
  isFinalCompletionAwarded,
  getOverallGameProgress,
} from '../data/finalCompletionStore';
import { resetEntireGame } from '../data/gameReset';
import { FinalCompletionCardBack } from './FinalCompletionCardBack';
import { toPersianDigits } from '../services/content/mappers';
import { contentService } from '../services/content/contentService';
import {
  isStarPointUnlocked,
  isStarPointInformationUnlocked,
  getUnlockedInformationStarsCount,
} from '../data/starPointProgressStore';
import { getDiscoveredExperiencesCount } from '../data/experienceProgressStore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REQUIRED_GALLERIES = [
  'gallery-01',
  'gallery-03',
  'gallery-04',
  'gallery-05',
  'gallery-06',
  'gallery-07',
  'gallery-08',
  'gallery-09',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    completedPuzzles: 0,
    totalPuzzles: 8,
    stars: 0,
    totalStars: 8,
    experiences: 0,
    totalExperiences: 6,
    percentage: 0,
  });
  const [showCertificate, setShowCertificate] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(getUserProfile());
      setShowCertificate(false);
      setShowConfirmResetModal(false);
      
      const updateStats = () => {
        const overall = getOverallGameProgress();
        const allStars = contentService.getStars().filter((s) => s.active !== false);
        let collectedStars = 0;
        if (allStars.length > 0) {
          collectedStars = allStars.filter((star) => {
            return (
              isStarPointUnlocked(star.id) ||
              (star.starId && isStarPointUnlocked(star.starId)) ||
              isStarPointInformationUnlocked(star.id)
            );
          }).length;
        } else {
          collectedStars = getUnlockedInformationStarsCount();
        }
        const totalStarsCount = allStars.length > 0 ? allStars.length : 8;

        const allExperiences = contentService.getExperiences().filter((e) => e.active !== false);
        const totalExperiencesCount = allExperiences.length > 0 ? allExperiences.length : 6;
        const discoveredExpCount = getDiscoveredExperiencesCount(allExperiences);

        setStats({
          completedPuzzles: overall.completedGalleriesCount,
          totalPuzzles: 8,
          stars: collectedStars,
          totalStars: totalStarsCount,
          experiences: discoveredExpCount,
          totalExperiences: totalExperiencesCount,
          percentage: overall.percentage,
        });
      };

      updateStats();

      const handleUpdate = () => updateStats();
      window.addEventListener('museum_puzzle_progress_updated', handleUpdate);
      window.addEventListener('museum_player_progress_updated', handleUpdate);
      window.addEventListener('museum_completed_gallery_puzzles_updated', handleUpdate);
      window.addEventListener('museum_star_point_progress_updated', handleUpdate);
      window.addEventListener('museum_experience_progress_updated', handleUpdate);
      window.addEventListener('museum_final_completion_awarded', handleUpdate);
      window.addEventListener('museum_game_fully_reset', handleUpdate);
      
      return () => {
        window.removeEventListener('museum_puzzle_progress_updated', handleUpdate);
        window.removeEventListener('museum_player_progress_updated', handleUpdate);
        window.removeEventListener('museum_completed_gallery_puzzles_updated', handleUpdate);
        window.removeEventListener('museum_star_point_progress_updated', handleUpdate);
        window.removeEventListener('museum_experience_progress_updated', handleUpdate);
        window.removeEventListener('museum_final_completion_awarded', handleUpdate);
        window.removeEventListener('museum_game_fully_reset', handleUpdate);
      };
    }
  }, [isOpen]);

  const handleConfirmReset = () => {
    resetEntireGame();
    setShowConfirmResetModal(false);
    onClose();
  };

  if (!isOpen || !profile) return null;

  const isAllComplete = stats.percentage === 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto" dir="rtl" onClick={onClose}>
      {showCertificate ? (
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
      ) : (
        <div 
          className="w-full max-w-sm bg-[#fbf9f9] border-[3px] border-[#1e1b18] rounded-3xl p-6 shadow-[6px_6px_0px_#1e1b18] flex flex-col relative font-sans-custom overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="بستن"
            className="absolute top-4 left-4 p-2 rounded-xl bg-white border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all z-10 cursor-pointer"
          >
            <X className="w-5 h-5 text-[#1e1b18]" />
          </button>

          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="relative group">
              <ProfileAvatar
                avatarId={profile.avatarId}
                size="xl"
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                className="cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                className="absolute -bottom-1 -right-1 p-1.5 bg-[#f59e0b] border-2 border-[#1e1b18] rounded-full shadow-[1.5px_1.5px_0px_#1e1b18] hover:scale-110 active:scale-95 transition-all text-[#1e1b18] cursor-pointer"
                title="تغییر آواتار"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
            <h2 className="text-2xl font-black text-[#1e1b18] mt-0.5">{profile.name}</h2>

            {isEditingAvatar && (
              <div className="w-full bg-[#f3f4f6] border-2 border-[#1e1b18] rounded-2xl p-4 mt-2 shadow-[2.5px_2.5px_0px_#1e1b18] z-20">
                <p className="text-xs font-bold text-[#4a443b] text-center mb-3">
                  انتخاب آواتار:
                </p>
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                  {AVATAR_OPTIONS.map((avatar) => {
                    const isSel = profile.avatarId === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => {
                          const updated = { ...profile, avatarId: avatar.id };
                          saveUserProfile(updated);
                          setProfile(updated);
                          setIsEditingAvatar(false);
                        }}
                        className={`flex items-center justify-center p-1 rounded-full transition-all cursor-pointer ${
                          isSel
                            ? 'scale-110 ring-4 ring-[#f59e0b] ring-offset-2'
                            : 'opacity-80 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <ProfileAvatar avatarId={avatar.id} size="md" className="pointer-events-none" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3.5 sm:gap-5 mt-6 mb-6">
            <div className="flex flex-col items-center gap-2" title={`${stats.completedPuzzles} از ${stats.totalPuzzles} پازل تکمیل شده`}>
              <div className="w-14 h-14 rounded-2xl bg-[#ede9fe] border-2 border-[#1e1b18] flex items-center justify-center">
                <Puzzle className="w-7 h-7 text-[#8b5cf6] fill-[#8b5cf6]/20 stroke-[2]" />
              </div>
              <div className="text-center bg-white px-2.5 py-1 rounded-full border-2 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18]">
                <span className="block font-black text-[13.5px] sm:text-[14px] text-[#1e1b18] leading-none pt-0.5 whitespace-nowrap" dir="ltr">
                  {toPersianDigits(stats.completedPuzzles)} / {toPersianDigits(stats.totalPuzzles)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2" title={`${stats.stars} از ${stats.totalStars} ستاره کشف شده`}>
              <div className="w-14 h-14 rounded-2xl bg-[#fef9c3] border-2 border-[#1e1b18] flex items-center justify-center">
                <Star className="w-7 h-7 text-[#f59e0b] fill-[#f59e0b]/20 stroke-[2]" />
              </div>
              <div className="text-center bg-white px-2.5 py-1 rounded-full border-2 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18]">
                <span className="block font-black text-[13.5px] sm:text-[14px] text-[#1e1b18] leading-none pt-0.5 whitespace-nowrap" dir="ltr">
                  {toPersianDigits(stats.stars)} / {toPersianDigits(stats.totalStars)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2" title={`${stats.experiences} از ${stats.totalExperiences} تجربه کشف شده`}>
              <div className="w-14 h-14 rounded-2xl bg-[#e0f2fe] border-2 border-[#1e1b18] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#0284c7] fill-[#0284c7]/20 stroke-[2]" />
              </div>
              <div className="text-center bg-white px-2.5 py-1 rounded-full border-2 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18]">
                <span className="block font-black text-[13.5px] sm:text-[14px] text-[#1e1b18] leading-none pt-0.5 whitespace-nowrap" dir="ltr">
                  {toPersianDigits(stats.experiences)} / {toPersianDigits(stats.totalExperiences)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2 bg-white p-4 rounded-2xl border-2 border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18]">
            <div className="flex justify-between items-end mb-1 px-1">
              <span className="font-bold text-sm text-[#4a443b]">پیشرفت</span>
              <span className="font-black text-[#f59e0b] text-xl leading-none">
                {toPersianDigits(stats.percentage)}٪
              </span>
            </div>
            
            <div className="w-full bg-[#f3f4f6] h-5 rounded-full border-2 border-[#1e1b18] overflow-hidden">
              <div 
                className="h-full bg-[#f59e0b] transition-all duration-1000 ease-out border-r-2 border-[#1e1b18]"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {isAllComplete && (
            <button
              type="button"
              id="profile-view-final-certificate-btn"
              onClick={() => setShowCertificate(true)}
              className="w-full mt-3 py-3 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e1b18] font-black text-[13px] border-2 border-[#1e1b18] rounded-2xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Sparkles className="w-4 h-4 text-[#1e1b18]" />
              <span>مشاهده گواهی‌نامه نهایی موزه 🏆</span>
            </button>
          )}

          {/* Small Reset Game Button positioned at the bottom of the modal */}
          <div className="flex justify-end mt-2">
            <button
              id="profile-reset-game-btn"
              type="button"
              onClick={() => setShowConfirmResetModal(true)}
              title="شروع مجدد بازی و بازنشانی تمام پیشرفت‌ها"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#fca5a5] bg-[#fff5f5] hover:bg-[#fee2e2] text-[#991b1b] text-[11px] font-bold shadow-xs active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span>شروع دوباره</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting Game */}
      {showConfirmResetModal && (
        <div
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-reset-modal-title"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirmResetModal(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-[#ffffff] border-2 border-[#1e1b18] rounded-2xl p-5 shadow-[4px_4px_0px_#1e1b18] text-[#1e1b18] space-y-4 animate-in fade-in zoom-in-95 duration-150 font-sans-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2 text-[#b91c1c]">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 id="profile-reset-modal-title" className="font-black text-sm sm:text-base">
                  شروع دوباره بازی
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(false)}
                className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#1e1b18] transition-colors cursor-pointer"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              آیا مایلید تمام پیشرفت بازی از ابتدا ریست شود؟
              <br />
              <span className="text-[#991b1b] font-medium text-[11px] block mt-1">
                • قطعات پازل و پیشرفت تالارها پاک می‌شوند.
                <br />
                • سکه‌ها و ستاره‌ها به مقدار اولیه بازمی‌گردند.
                <br />
                • به تالار اصلی موزه (گالری ۰۰) بازگردانده می‌شوید.
              </span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(false)}
                className="px-3.5 py-2 rounded-xl border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#475569] text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                id="profile-confirm-reset-game-btn"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl border-2 border-[#1e1b18] bg-[#ef4444] hover:bg-[#dc2626] text-[#ffffff] text-xs font-black shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تایید و شروع دوباره</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
