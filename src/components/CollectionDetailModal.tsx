import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MuseumCollection, ArtworkPlaceholder } from '../types';
import { PlaceholderArtworkGraphic } from './PlaceholderArtworkGraphic';
import { X, Volume2, Sparkles, Layers, Bookmark, Check, Share2 } from 'lucide-react';

interface CollectionDetailModalProps {
  collection: MuseumCollection | null;
  onClose: () => void;
  onAudioPlay?: (collection: MuseumCollection) => void;
  isAudioPlaying?: boolean;
}

export const CollectionDetailModal: React.FC<CollectionDetailModalProps> = ({
  collection,
  onClose,
  onAudioPlay,
  isAudioPlaying = false,
}) => {
  const [bookmarked, setBookmarked] = React.useState(false);

  if (!collection) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#1e1b18]/60 backdrop-blur-xs select-none">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl max-h-[88vh] bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl flex flex-col overflow-hidden shadow-[6px_6px_0px_#1e1b18]"
        >
          {/* Modal Header */}
          <div className="bg-[#fee2e2] border-b-2 border-[#1e1b18] px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444] border-[1.5px] border-[#1e1b18] inline-block"></span>
              <span className="font-sans-custom text-[13px] font-black text-[#1e1b18] tracking-wider uppercase">
                {collection.roomCode}
              </span>
              <span className="text-[#1e1b18]/30">/</span>
              <span className="font-sans-custom text-[12px] font-bold text-[#991b1b]">
                {collection.wing}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                aria-label="نشان کردن بخش"
                className={`w-8 h-8 rounded-full border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center transition-all cursor-pointer ${
                  bookmarked
                    ? 'bg-[#fbbf24] text-[#1e1b18]'
                    : 'bg-[#ffffff] text-[#1e1b18] hover:bg-[#fef08a]'
                }`}
              >
                <Bookmark className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onClose}
                aria-label="بستن پنجره"
                className="w-8 h-8 rounded-full bg-[#ffffff] hover:bg-[#ef4444] hover:text-white transition-all text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-[#1e1b18]">
            {/* Title & Metadata */}
            <div>
              <div className="flex items-center gap-2 text-[12px] font-bold text-[#64748b] mb-1">
                <span>{collection.subtitle}</span>
                <span>•</span>
                <span className="text-[#d97706]">{collection.period}</span>
              </div>
              <h2 className="font-sans-custom text-[22px] sm:text-[26px] font-black text-[#1e1b18] leading-tight">
                {collection.title}
              </h2>
            </div>

            {/* Main Visual Asset Section */}
            <div className="border-2 border-[#1e1b18] rounded-2xl overflow-hidden shadow-[3px_3px_0px_#1e1b18] bg-white">
              <PlaceholderArtworkGraphic collection={collection} className="h-48" />
              
              {/* Asset replacement notice badge */}
              <div className="p-2.5 bg-[#f8fafc] border-t-2 border-[#1e1b18] flex items-center justify-between text-[11px] font-bold text-[#64748b]">
                <span className="flex items-center gap-1.5 text-[#1e1b18]">
                  <Layers className="w-3.5 h-3.5 text-[#f59e0b]" />
                  تعداد کل آثار: {collection.artworkCount} مورد
                </span>
                <span className="bg-[#fef3c7] px-2 py-0.5 rounded-full border border-[#1e1b18] text-[#92400e]">
                  دیوار: {collection.direction}
                </span>
              </div>
            </div>

            {/* Curatorial Essay / Room Background */}
            <div className="space-y-2 bg-[#fffdfa] border-2 border-[#1e1b18] rounded-2xl p-4 shadow-[2px_2px_0px_#1e1b18]">
              <h3 className="font-sans-custom text-[13px] font-black text-[#1e1b18] border-b-2 border-[#f1f5f9] pb-1.5 flex items-center justify-between">
                <span>درباره این بخش</span>
                <span className="text-[11px] font-mono text-[#64748b]">{collection.accessionRange}</span>
              </h3>
              <p className="text-[13px] leading-relaxed text-[#334155] font-medium whitespace-pre-line break-words">
                {collection.curatorNote}
              </p>
            </div>

            {/* Sample Artworks in this Collection */}
            <div className="space-y-3">
              <h3 className="font-sans-custom text-[14px] font-black text-[#1e1b18] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                شاهکارهای منتخب ({collection.sampleArtworks.length} از {collection.artworkCount})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {collection.sampleArtworks.map((art) => (
                  <div
                    key={art.id}
                    className="border-2 border-[#1e1b18] rounded-2xl p-3.5 bg-white shadow-[2px_2px_0px_#1e1b18] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#64748b]">
                      <span className="font-black text-[#1e1b18] bg-[#f1f5f9] px-1.5 py-0.5 rounded border border-[#1e1b18]">{art.accessionNumber}</span>
                      <span className="text-[#d97706]">{art.year}</span>
                    </div>
                    <h4 className="font-sans-custom text-[14px] font-black text-[#1e1b18] leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-[11px] font-bold text-[#64748b]">
                      {art.artistOrCulture}
                    </p>
                    <p className="text-[10px] text-[#94a3b8] italic">
                      {art.medium} ({art.dimensions})
                    </p>
                    <p className="text-[12px] text-[#475569] pt-1.5 border-t border-[#f1f5f9] leading-relaxed font-medium whitespace-pre-line break-words">
                      {art.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Bar */}
          <div className="bg-[#f8fafc] border-t-2 border-[#1e1b18] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <button
              onClick={() => onAudioPlay && onAudioPlay(collection)}
              className={`neo-btn py-2 px-3.5 text-[12px] font-black flex items-center gap-2 cursor-pointer ${
                isAudioPlaying
                  ? 'bg-[#f59e0b] text-[#1e1b18]'
                  : 'bg-[#ffffff] text-[#1e1b18] hover:bg-[#fef08a]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isAudioPlaying ? 'توقف راهنما' : `راهنمای صوتی (${collection.audioGuideDuration})`}</span>
            </button>

            <button
              onClick={onClose}
              className="neo-btn py-2 px-4 bg-[#1e1b18] text-white hover:bg-[#332e29] text-[12px] font-black cursor-pointer"
            >
              بستن
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

