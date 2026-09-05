import React from 'react';
import { MuseumCollection } from '../types';

interface PlaceholderArtworkGraphicProps {
  collection: MuseumCollection;
  className?: string;
}

/**
 * ============================================================================
 * [PLACEHOLDER ASSET COMPONENT - NEO-POP ILLUSTRATION]
 * ============================================================================
 * Generates charming vector illustrations with bold strokes, pastel fills,
 * and playful geometry matching the Neo-Pop comic aesthetic.
 */
export const PlaceholderArtworkGraphic: React.FC<PlaceholderArtworkGraphicProps> = ({
  collection,
  className = '',
}) => {
  const { placeholderImage, roomCode, accessionRange } = collection;

  // If a real image URL is provided, display it directly
  if (placeholderImage.realImageUrl) {
    return (
      <div className={`relative overflow-hidden bg-[#f1f5f9] border-2 border-[#1e1b18] ${className}`}>
        <img
          src={placeholderImage.realImageUrl}
          alt={placeholderImage.title || collection.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-[#1e1b18] bg-[#ffffff] px-1.5 py-0.5 rounded border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18]">
          {accessionRange}
        </div>
      </div>
    );
  }

  // Neo-Pop Vector Comic Graphic
  return (
    <div
      className={`relative overflow-hidden bg-[#fffdfa] flex flex-col items-center justify-center p-3.5 group ${className}`}
      style={{ minHeight: '135px' }}
    >
      {/* Background cute comic dots */}
      <div className="absolute inset-0 comic-dots-bg opacity-40 pointer-events-none" />

      {/* Center thematic vector line-art based on patternType */}
      <div className="relative z-10 w-full flex items-center justify-center my-1.5">
        {placeholderImage.patternType === 'rotunda' || placeholderImage.patternType === 'astrolabe' ? (
          // Astrolabe / Rotunda
          <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[2px_2px_0px_#1e1b18]">
            <circle cx="50" cy="50" r="42" fill="#fef08a" stroke="#1e1b18" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="30" fill="#fed7aa" stroke="#1e1b18" strokeWidth="2" strokeDasharray="4 2" />
            <polygon points="50,14 86,50 50,86 14,50" fill="#93c5fd" stroke="#1e1b18" strokeWidth="2" />
            <circle cx="50" cy="50" r="12" fill="#fda4af" stroke="#1e1b18" strokeWidth="2" />
            <circle cx="50" cy="50" r="4" fill="#ef4444" stroke="#1e1b18" strokeWidth="1.5" />
          </svg>
        ) : placeholderImage.patternType === 'monolith' ? (
          // Central Monolith
          <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[2px_2px_0px_#1e1b18]">
            <circle cx="50" cy="50" r="40" fill="#e0f2fe" stroke="#1e1b18" strokeWidth="2.5" />
            <rect x="34" y="20" width="32" height="60" rx="4" fill="#fbbf24" stroke="#1e1b18" strokeWidth="2.5" />
            <rect x="42" y="32" width="16" height="24" rx="2" fill="#ffffff" stroke="#1e1b18" strokeWidth="2" />
            <line x1="42" y1="44" x2="58" y2="44" stroke="#1e1b18" strokeWidth="2" />
            <circle cx="50" cy="68" r="3" fill="#ef4444" stroke="#1e1b18" strokeWidth="1.5" />
          </svg>
        ) : placeholderImage.patternType === 'manuscript' ? (
          // Manuscript folio icon (styled like the envelope / document in the image)
          <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[2px_2px_0px_#1e1b18]">
            <rect x="20" y="16" width="60" height="68" rx="6" fill="#fee2e2" stroke="#1e1b18" strokeWidth="2.5" />
            {/* Cute folded envelope/letter */}
            <rect x="28" y="26" width="44" height="32" rx="4" fill="#fbbf24" stroke="#1e1b18" strokeWidth="2.5" />
            <path d="M 28 26 L 50 44 L 72 26" fill="none" stroke="#1e1b18" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="28" y="64" width="28" height="4" rx="2" fill="#93c5fd" stroke="#1e1b18" strokeWidth="1.5" />
            <rect x="28" y="72" width="44" height="4" rx="2" fill="#93c5fd" stroke="#1e1b18" strokeWidth="1.5" />
          </svg>
        ) : placeholderImage.patternType === 'relief' ? (
          // Classical Relief Frieze
          <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[2px_2px_0px_#1e1b18]">
            <rect x="16" y="24" width="68" height="52" rx="6" fill="#fef3c7" stroke="#1e1b18" strokeWidth="2.5" />
            <path d="M 24 60 Q 40 32, 52 54 T 76 40" fill="none" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
            <circle cx="34" cy="38" r="5" fill="#fda4af" stroke="#1e1b18" strokeWidth="2" />
            <circle cx="66" cy="46" r="6" fill="#93c5fd" stroke="#1e1b18" strokeWidth="2" />
          </svg>
        ) : (
          // Statuary / Architecture
          <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[2px_2px_0px_#1e1b18]">
            <polygon points="50,14 82,44 82,84 18,84 18,44" fill="#fed7aa" stroke="#1e1b18" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="38" y="52" width="24" height="32" rx="3" fill="#93c5fd" stroke="#1e1b18" strokeWidth="2" />
            <circle cx="50" cy="32" r="6" fill="#ef4444" stroke="#1e1b18" strokeWidth="2" />
          </svg>
        )}
      </div>

      {/* Label and Spec line */}
      <div className="relative z-10 w-full text-center mt-1">
        <p className="font-sans-custom text-[13px] font-black text-[#1e1b18] truncate">
          {placeholderImage.title}
        </p>
        <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] font-bold text-[#64748b]">
          <span>{roomCode}</span>
          <span>•</span>
          <span>{collection.period.split('–')[0]?.trim() || 'آرشیوی'}</span>
        </div>
      </div>
    </div>
  );
};

