import React from 'react';
import { PlaySquare, Search, Activity, User, Plus } from 'lucide-react';
import { TabType } from '../../types';
import { triggerHaptic } from '../../lib/haptics';
import { useCheckInStore } from '../../store/useCheckInStore';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const openQuickSelector = useCheckInStore((state) => state.openQuickSelector);

  const handleTabClick = (tab: TabType) => {
    triggerHaptic('light');
    onTabChange(tab);
  };

  const handleCenterClick = () => {
    triggerHaptic('medium');
    openQuickSelector();
  };

  const leftNavItems = [
    {
      id: 'upnext' as TabType,
      label: 'Up Next',
      icon: PlaySquare,
    },
    {
      id: 'search' as TabType,
      label: 'Search',
      icon: Search,
    },
  ];

  const rightNavItems = [
    {
      id: 'activity' as TabType,
      label: 'Activity',
      icon: Activity,
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-safe-bottom pb-1.5 pt-1.5 bg-[#040e0a]/95 backdrop-blur-2xl border-t border-emerald-950/90 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {/* Left 2 Items */}
        {leftNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-300 font-bold'
                  : 'text-emerald-700/80 hover:text-emerald-400 active:scale-95'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-teal-500/10 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.25)]" />
              )}
              
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]' : ''
                  }`}
                />
              </div>

              <span className="relative text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Circular Check-In FAB (Sitting half in nav bar, half in screen) */}
        <div className="relative flex flex-col items-center justify-center -mt-1">
          <button
            onClick={handleCenterClick}
            className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 text-black flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.5)] border-[3.5px] border-[#040e0a] hover:scale-105 active:scale-95 transition-all duration-200 group"
            title="Check into a show"
            aria-label="Check into a show"
          >
            {/* Ambient Pulse Glow */}
            <span className="absolute -inset-1 rounded-full bg-emerald-400/30 blur-xs group-hover:opacity-100 opacity-60 animate-pulse pointer-events-none" />
            <Plus className="relative w-6 h-6 stroke-[3] text-black group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <span className="text-[10px] -mt-3.5 font-extrabold text-emerald-400 tracking-tight">
            Check In
          </span>
        </div>

        {/* Right 2 Items */}
        {rightNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-300 font-bold'
                  : 'text-emerald-700/80 hover:text-emerald-400 active:scale-95'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-teal-500/10 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.25)]" />
              )}
              
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]' : ''
                  }`}
                />
              </div>

              <span className="relative text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
