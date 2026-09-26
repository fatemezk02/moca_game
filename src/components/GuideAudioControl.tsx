import React from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useGuideAudio } from '../services/audio/guideAudioService';

interface GuideAudioControlProps {
  galleryId: string;
}

export const GuideAudioControl: React.FC<GuideAudioControlProps> = ({ galleryId }) => {
  const {
    hasAudio,
    isPlaying,
    isLoading,
    togglePlay,
  } = useGuideAudio(galleryId);

  // Gallery 06 has NO audio -> Do NOT render anything
  if (!hasAudio) {
    return null;
  }

  return (
    <div className="w-full flex justify-center items-center my-3 sm:my-4 select-none shrink-0" dir="rtl">
      <button
        type="button"
        id="guide-audio-play-pause-btn"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        aria-label={isPlaying ? 'توقف راهنمای صوتی' : 'پخش راهنمای صوتی'}
        title={isPlaying ? 'توقف' : 'پخش'}
        disabled={isLoading}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white border-2 border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer transition-all disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5 fill-white stroke-[2.5]" />
        ) : (
          <Play className="w-5 h-5 fill-white stroke-[2.5] translate-x-[-1px]" />
        )}
      </button>
    </div>
  );
};
