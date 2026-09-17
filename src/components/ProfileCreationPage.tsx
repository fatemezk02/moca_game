import React, { useState } from 'react';
import { AVATAR_OPTIONS } from '../data/avatarConfig';
import { ProfileAvatar } from './ProfileAvatar';
import { AppLogo } from './AppLogo';
import { saveUserProfile } from '../data/userProfileStore';

interface ProfileCreationPageProps {
  onProfileCreated: () => void;
}

export const ProfileCreationPage: React.FC<ProfileCreationPageProps> = ({
  onProfileCreated,
}) => {
  const [name, setName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  const isFormValid = name.trim().length > 0 && selectedAvatarId !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      saveUserProfile({
        name: name.trim(),
        avatarId: selectedAvatarId,
      });
      onProfileCreated();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#fbf9f9] text-[#1e1b18] z-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans-custom overflow-y-auto" dir="rtl">
      <div className="w-full max-w-md bg-[#d9d8d4] border-[3px] border-[#1e1b18] rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_#1e1b18] flex flex-col gap-8 my-auto shrink-0">
        
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center justify-center mb-1">
            <AppLogo className="h-14 sm:h-16 w-auto object-contain cursor-default" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#2d2926] tracking-wide">
            موزه هنرهای معاصر تهران
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1e1b18] mt-4">
            به سفر تاریخ عکاسی جهان خوش آمدید
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label htmlFor="user-name" className="text-sm font-bold text-[#1e1b18]">
              نام شما
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام خود را وارد کنید"
              className="w-full h-12 px-4 rounded-xl border-2 border-[#1e1b18] bg-white text-[#1e1b18] font-bold outline-none focus:ring-4 focus:ring-[#f59e0b]/30 focus:border-[#f59e0b] transition-all placeholder:font-normal placeholder:text-[#635d57]"
              maxLength={20}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-[#1e1b18] text-center">
              آواتار خود را انتخاب کنید
            </label>
            
            <div className="grid grid-cols-3 gap-3.5 sm:gap-4 justify-items-center py-2">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`flex items-center justify-center p-1 rounded-full transition-all cursor-pointer ${
                      isSelected 
                        ? 'scale-110 ring-4 ring-[#f59e0b] ring-offset-2 ring-offset-[#d9d8d4]' 
                        : 'opacity-85 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <ProfileAvatar avatarId={avatar.id} size="lg" className="pointer-events-none" />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`mt-4 w-full h-14 rounded-xl border-2 border-[#1e1b18] font-black text-lg transition-all ${
              isFormValid
                ? 'bg-[#f59e0b] text-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer'
                : 'bg-[#b8b5ae] text-[#423f3a] border-[#1e1b18] shadow-none cursor-not-allowed opacity-80'
            }`}
          >
            ورود به بازی
          </button>
        </form>

      </div>
    </div>
  );
};
