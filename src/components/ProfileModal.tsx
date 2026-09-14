import React, { useEffect, useState } from 'react';
import { X, Puzzle, Landmark, Sparkles } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';
import { getUserProfile, saveUserProfile, UserProfile } from '../data/userProfileStore';
import { AVATAR_OPTIONS } from '../data/avatarConfig';
import { getPuzzleProgress, isGalleryPuzzleCompleted } from '../data/puzzleProgressStore';
import {
  areAll8GalleryPuzzlesCompleted,
  isFinalCompletionAwarded,
} from '../data/finalCompletionStore';
import { FinalCompletionCardBack } from './FinalCompletionCardBack';
import { toPersianDigits } from '../services/content/mappers';

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
  const [stats, setStats] = useState({ completedPuzzles: 0, galleries: 0, percentage: 0 });
  const [showCertificate, setShowCertificate] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(getUserProfile());
      setShowCertificate(false);
      
      const updateStats = () => {
        const progressDb = getPuzzleProgress();
        
        // 1. Completed galleries count out of the 8 required exhibition galleries
        const completedCount = REQUIRED_GALLERIES.filter((id) =>
          isGalleryPuzzleCompleted(id)
        ).length;

        // 2. Count puzzle pieces collected (each completed gallery has at least 3 pieces)
        let collectedPiecesCount = 0;
        for (const gId of REQUIRED_GALLERIES) {
          const canon = gId === 'gallery-01' ? 'gallery_02' : gId.replace('-', '_');
          if (isGalleryPuzzleCompleted(gId)) {
            collectedPiecesCount += 3;
          } else {
            const pieces = progressDb[canon]?.collectedPieces;
            collectedPiecesCount += Array.isArray(pieces) ? pieces.length : 0;
          }
        }

        const isAllDone =
          completedCount >= 8 ||
          areAll8GalleryPuzzlesCompleted() ||
          isFinalCompletionAwarded();

        // 3. Progress percentage:
        // When all 8 puzzles/galleries are completed, percentage is guaranteed 100%
        let percentage = 0;
        if (isAllDone) {
          percentage = 100;
        } else {
          // Total pieces across all 8 galleries is 24 (8 * 3 = 24)
          percentage = Math.min(99, Math.round((collectedPiecesCount / 24) * 100));
        }

        setStats({
          completedPuzzles: isAllDone ? 8 : completedCount,
          galleries: isAllDone ? 8 : completedCount,
          percentage,
        });
      };

      updateStats();

      const handleUpdate = () => updateStats();
      window.addEventListener('museum_puzzle_progress_updated', handleUpdate);
      window.addEventListener('museum_player_progress_updated', handleUpdate);
      window.addEventListener('museum_completed_gallery_puzzles_updated', handleUpdate);
      window.addEventListener('museum_final_completion_awarded', handleUpdate);
      
      return () => {
        window.removeEventListener('museum_puzzle_progress_updated', handleUpdate);
        window.removeEventListener('museum_player_progress_updated', handleUpdate);
        window.removeEventListener('museum_completed_gallery_puzzles_updated', handleUpdate);
        window.removeEventListener('museum_final_completion_awarded', handleUpdate);
      };
    }
  }, [isOpen]);

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
            <button
              type="button"
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              className="text-xs font-bold text-[#d97706] hover:underline cursor-pointer"
            >
              {isEditingAvatar ? 'بستن آواتارها' : 'تغییر آواتار'}
            </button>

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

          <div className="flex items-center justify-center gap-6 mt-6 mb-6">
            <div className="flex flex-col items-center gap-2" title={`${stats.completedPuzzles} پازل تکمیل شده`}>
              <div className="w-14 h-14 rounded-2xl bg-[#ede9fe] border-2 border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18] flex items-center justify-center">
                <Puzzle className="w-7 h-7 text-[#8b5cf6] fill-[#8b5cf6]/20 stroke-[2]" />
              </div>
              <div className="text-center bg-white px-3 py-1 rounded-full border-2 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18]">
                <span className="block font-black text-[15px] text-[#1e1b18] leading-none pt-0.5">
                  {toPersianDigits(stats.completedPuzzles)} پازل
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2" title={`${stats.galleries} گالری تکمیل شده`}>
              <div className="w-14 h-14 rounded-2xl bg-[#fef3c7] border-2 border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18] flex items-center justify-center">
                <Landmark className="w-7 h-7 text-[#d97706] fill-[#d97706]/20 stroke-[2]" />
              </div>
              <div className="text-center bg-white px-3 py-1 rounded-full border-2 border-[#1e1b18] shadow-[1.5px_1.5px_0px_#1e1b18]">
                <span className="block font-black text-[15px] text-[#1e1b18] leading-none pt-0.5">
                  {toPersianDigits(stats.galleries)} گالری
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2 bg-white p-4 rounded-2xl border-2 border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18]">
            <div className="flex justify-between items-end mb-1 px-1">
              <span className="font-bold text-sm text-[#4a443b]">پیشرفت بازی</span>
              <div className="flex items-center gap-2">
                {isAllComplete && (
                  <span className="text-[11px] font-black text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-md border border-[#16a34a]">
                    تکمیل ۱۰۰٪
                  </span>
                )}
                <span className="font-black text-[#f59e0b] text-xl leading-none">
                  {toPersianDigits(stats.percentage)}٪
                </span>
              </div>
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
              className="w-full mt-4 py-3 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e1b18] font-black text-[13px] border-2 border-[#1e1b18] rounded-2xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Sparkles className="w-4 h-4 text-[#1e1b18]" />
              <span>مشاهده گواهی‌نامه نهایی موزه 🏆</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
