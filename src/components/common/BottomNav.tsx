import React from 'react';
import { PlaySquare, Search, Activity, User } from 'lucide-react';
import { TabType } from '../../types';
import { triggerHaptic } from '../../lib/haptics';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const handleTabClick = (tab: TabType) => {
    triggerHaptic('light');
    onTabChange(tab);
  };

  const navItems = [
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe-bottom pb-2 pt-2 bg-[#040e0a]/90 backdrop-blur-2xl border-t border-emerald-950/90">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 ${
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

              <span className="relative text-[11px] mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
