import React from 'react';
import { getAvatarById } from '../data/avatarConfig';
import { CharacterAvatarSVG } from './CharacterAvatars';

interface ProfileAvatarProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarId,
  size = 'md',
  className = '',
  onClick,
}) => {
  const avatar = getAvatarById(avatarId);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-full flex items-center justify-center bg-[#d96c60] shadow-[1.5px_1.5px_0px_#1e1b18] overflow-hidden shrink-0 ${
        onClick ? 'cursor-pointer hover:shadow-[2.5px_2.5px_0px_#1e1b18] hover:scale-105 active:scale-95 transition-all' : ''
      } ${sizeClasses[size]} ${className}`}
      style={{ border: '2.5px solid #1e1b18' }}
      title={`${avatar.nameFa} - ${avatar.titleFa}`}
    >
      <CharacterAvatarSVG id={avatar.id} className="w-full h-full" />
    </div>
  );
};
