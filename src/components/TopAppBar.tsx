import React, { useEffect, useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { ProfileAvatar } from './ProfileAvatar';
import { getUserProfile, UserProfile } from '../data/userProfileStore';

interface TopAppBarProps {
  onOpenInfo: () => void;
  onOpenProfile: () => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenInfo,
  onOpenProfile,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => getUserProfile());

  useEffect(() => {
    const handleProfileUpdate = (e: any) => setProfile(e.detail);
    window.addEventListener('museum_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('museum_user_profile_updated', handleProfileUpdate);
  }, []);

  return (
    <header
      id="top-app-bar"
      className="bg-[#ffffff] border-b-[1.25px] border-[#1e1b18] shadow-[0px_2px_0px_#1e1b18] flex flex-col w-full z-40 relative select-none pt-safe shrink-0"
    >
      {/* Top phone-style accent bar */}
      <div className="h-[5px] w-full bg-[#f59e0b] border-b border-[#1e1b18]" />

      <div className="flex justify-between items-center px-3.5 sm:px-6 h-[56px] sm:h-[60px]">
        {/* Left Icon Button (Profile Avatar instead of Museum Emblem) */}
        <button
          id="profile-trigger-btn"
          onClick={onOpenProfile}
          aria-label="پروفایل کاربری"
          title="پروفایل کاربری"
          className="active:scale-95 transition-all duration-150 rounded-full cursor-pointer"
        >
          <ProfileAvatar avatarId={profile?.avatarId} size="md" className="scale-[1.04]" />
        </button>

        {/* Center Logo & Title */}
        <div
          id="top-app-bar-logo-container"
          className="flex items-center justify-center h-full relative"
          title="آرشیو موزه"
        >
          {/* Subtle playful burst lines on the right of logo */}
          <div className="absolute top-1 -right-3 hidden sm:flex items-center gap-0.5 pointer-events-none opacity-80">
            <span className="w-1 h-3 bg-[#1e1b18] rounded-full rotate-45 transform origin-bottom" />
            <span className="w-1 h-4 bg-[#1e1b18] rounded-full" />
            <span className="w-1 h-3 bg-[#1e1b18] rounded-full -rotate-45 transform origin-bottom" />
          </div>

          <AppLogo className="h-[46px] sm:h-[52px] w-auto object-contain cursor-default" />
        </div>

        {/* Right Info / Legend Button */}
        <button
          id="info-trigger-btn"
          onClick={onOpenInfo}
          aria-label="راهنمای نقشه و علائم"
          title="راهنمای نقشه و علائم"
          className="border-2 border-[#1e1b18] rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#1e1b18] p-2 shadow-[1.5px_1.5px_0px_#1e1b18] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none inline-flex items-center justify-center cursor-pointer transition-all duration-150"
        >
          <Info className="w-5 h-5 text-[#0284c7]" />
        </button>
      </div>
    </header>
  );
};


