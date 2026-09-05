import React from 'react';
import { MuseumCollection } from '../types';
import { PlaceholderArtworkGraphic } from './PlaceholderArtworkGraphic';
import { Layers, ArrowRight, Volume2, Compass } from 'lucide-react';

interface CollectionListViewProps {
  collections: MuseumCollection[];
  onSelectCollectionOnMap: (collection: MuseumCollection) => void;
  onOpenDetailModal: (collection: MuseumCollection) => void;
}

export const CollectionListView: React.FC<CollectionListViewProps> = ({
  collections,
  onSelectCollectionOnMap,
  onOpenDetailModal,
}) => {
  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 pb-28 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="border-b border-[#0e0f0f] pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="font-mono-custom text-[10px] text-[#c5a059] font-bold tracking-widest uppercase">
            CATALOGUE DIRECTORY • ARCHIVE 01
          </span>
          <h2 className="font-sans-custom text-[24px] sm:text-[28px] font-bold text-[#0e0f0f] tracking-tight uppercase">
            GALLERY 00 SECTORS
          </h2>
        </div>
        <span className="font-mono-custom text-[11px] text-[#5e5e5d]">
          {collections.length} SECTORS • {collections.reduce((acc, c) => acc + c.artworkCount, 0)} TOTAL HOLDINGS
        </span>
      </div>

      {/* Grid of Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => (
          <div
            key={col.id}
            className="border-2 border-[#0e0f0f] bg-[#fbf9f9] flex flex-col justify-between p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between font-mono-custom text-[11px] border-b border-[#efeded] pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#c5a059]"></span>
                  <span className="font-bold">{col.roomCode}</span>
                </div>
                <span className="text-[10px] text-[#5e5e5d]">{col.wing}</span>
              </div>

              {/* Graphic */}
              <PlaceholderArtworkGraphic collection={col} className="h-32" />

              {/* Title & info */}
              <div>
                <h3 className="font-sans-custom text-[16px] font-bold text-[#0e0f0f] leading-snug">
                  {col.title}
                </h3>
                <p className="text-[11px] font-mono-custom text-[#5e5e5d] mt-0.5">
                  {col.period}
                </p>
                <p className="text-[12px] text-[#444748] line-clamp-2 mt-1.5 leading-relaxed">
                  {col.curatorNote}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 mt-3 border-t border-[#efeded] grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectCollectionOnMap(col)}
                className="py-1.5 px-2 bg-[#efeded] hover:bg-[#c4c7c7] text-[#0e0f0f] border border-[#0e0f0f] font-mono-custom text-[10px] font-medium tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Compass className="w-3 h-3" />
                <span>MAP LOCATE</span>
              </button>

              <button
                onClick={() => onOpenDetailModal(col)}
                className="py-1.5 px-2 bg-[#0e0f0f] text-[#fbf9f9] hover:bg-[#242424] font-mono-custom text-[10px] font-medium tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>DETAILS</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
