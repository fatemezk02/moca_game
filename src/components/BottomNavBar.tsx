import React from 'react';
import { Map, Layers, ClipboardList } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'map' | 'collection' | 'tasks' | 'curator';
  onTabChange: (tab: 'map' | 'collection' | 'tasks') => void;
  collectionCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  collectionCount,
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      className="bg-[#ffffff] border-t-[1.25px] border-[#1e1b18] shadow-[0px_-2px_0px_#1e1b18] fixed bottom-0 left-0 w-full z-40 flex justify-center items-center px-4 sm:px-8 pb-safe h-[calc(64px+env(safe-area-inset-bottom,0px))] sm:h-[calc(68px+env(safe-area-inset-bottom,0px))] select-none"
    >
      <div className="w-full max-w-sm sm:max-w-md flex justify-around items-center">
        {/* MAP TAB */}
        <button
          id="nav-tab-map"
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center justify-center py-1.5 px-4 sm:px-6 rounded-xl transition-all cursor-pointer ${
            activeTab === 'map'
              ? 'bg-[#fef3c7] border-2 border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18] text-[#1e1b18] font-black -translate-y-1'
              : 'text-[#64748b] hover:text-[#1e1b18] hover:bg-[#f1f5f9]'
          }`}
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span className="font-sans-custom text-[11px] font-bold">نقشه</span>
        </button>

        {/* COLLECTION TAB */}
        <button
          id="nav-tab-collection"
          onClick={() => onTabChange('collection')}
          className={`flex flex-col items-center justify-center py-1.5 px-4 sm:px-6 rounded-xl relative transition-all cursor-pointer ${
            activeTab === 'collection'
              ? 'bg-[#fed7aa] border-2 border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18] text-[#1e1b18] font-black -translate-y-1'
              : 'text-[#64748b] hover:text-[#1e1b18] hover:bg-[#f1f5f9]'
          }`}
        >
          <div className="relative">
            <Layers className="w-5 h-5 mb-0.5" />
            {/* Red notification badge matching reference image */}
            <span className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] bg-[#ef4444] text-white text-[10px] font-black flex items-center justify-center px-1 rounded-full border-[1.5px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18]">
              {collectionCount}
            </span>
          </div>
          <span className="font-sans-custom text-[11px] font-bold">مجموعه‌ها</span>
        </button>

        {/* TASKS TAB */}
        <button
          id="nav-tab-tasks"
          onClick={() => onTabChange('tasks')}
          className={`flex flex-col items-center justify-center py-1.5 px-4 sm:px-6 rounded-xl transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-[#e0f2fe] border-2 border-[#1e1b18] shadow-[2.5px_2.5px_0px_#1e1b18] text-[#1e1b18] font-black -translate-y-1'
              : 'text-[#64748b] hover:text-[#1e1b18] hover:bg-[#f1f5f9]'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span className="font-sans-custom text-[11px] font-bold">وظایف</span>
        </button>
      </div>
    </nav>
  );
};


