import React from 'react';
import { ArrowRight, Compass, Sparkles, Map } from 'lucide-react';
import { BottomNavBar } from './BottomNavBar';
import { markCollectionsAsViewed } from '../data/collectionNotificationStore';

interface Gallery04PlaceholderViewProps {
  onNavigateBack: () => void;
  onSelectTab?: (tab: 'map' | 'collection' | 'tasks' | 'curator') => void;
}

export const Gallery04PlaceholderView: React.FC<Gallery04PlaceholderViewProps> = ({
  onNavigateBack,
  onSelectTab,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen bg-[#f8fafc] text-[#1e1b18] flex flex-col font-sans-custom select-none overflow-hidden pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#ffffff]/90 backdrop-blur-md border-b-2 border-[#1e1b18] px-4 py-3 shadow-[0px_2px_0px_#1e1b18]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={onNavigateBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffffff] hover:bg-[#f1f5f9] text-[#1e1b18] font-bold text-[13px] border-2 border-[#1e1b18] rounded-xl shadow-[2px_2px_0px_#1e1b18] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all"
            aria-label="بازگشت به نقشه اصلی موزه"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            <span>بازگشت به نقشه اصلی (گالری ۰۰)</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono-custom text-[11px] font-black px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#1e1b18]">
              GALLERY 03
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-md w-full bg-[#ffffff] border-2 border-[#1e1b18] rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#1e1b18] space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#e0f2fe] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center text-[#0284c7]">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <div className="inline-block text-[11px] font-bold text-[#0369a1] bg-[#f0f9ff] border border-[#0284c7] px-2.5 py-0.5 rounded-full mb-2">
              مقصد جدید آنلاک شد 🎉
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1e1b18]">
              گالری ۰۳
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1.5 leading-relaxed">
              شما با موفقیت معماها و پازل‌های گالری‌های پیشین را حل کرده و به گالری ۰۳ راه یافتید. چیدمان و آثار این تالار در فاز توسعه بعدی موزه قرار دارد.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateBack}
              className="w-full py-3 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e1b18] font-black text-[13px] border-2 border-[#1e1b18] rounded-xl shadow-[3px_3px_0px_#1e1b18] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1e1b18]"
            >
              <Map className="w-4 h-4" />
              <span>مشاهده موقعیت خود در نقشه اصلی (گالری ۰۰)</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab="map"
        onTabChange={(tab) => {
          if (tab === 'map') {
            onNavigateBack();
          } else {
            if (tab === 'collection') {
              markCollectionsAsViewed();
            }
            onSelectTab?.(tab);
          }
        }}
      />
    </div>
  );
};
