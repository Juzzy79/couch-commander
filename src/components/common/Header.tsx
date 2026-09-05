import React from 'react';
import { Crown, Flame, Settings, Sparkles, LogIn } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const Header: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const openSettings = useSettingsStore((state) => state.openSettings);

  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-safe-top pt-3 pb-3 bg-[#05130d]/85 backdrop-blur-xl border-b border-emerald-950/80">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Title with Forest Green Gradient */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800/80 via-forest-800 to-forest-950 border border-emerald-500/40 shadow-lg shadow-emerald-950/60">
            <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent">
              Couch Commander
            </h1>
            <p className="text-[10px] font-medium text-emerald-300/80 tracking-wider uppercase flex items-center gap-1">
              <span>TV Tracker</span>
              <span className="text-emerald-700">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> PWA
              </span>
            </p>
          </div>
        </div>

        {/* Right Section: Streak, Sign In / Settings */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-950/80 to-forest-900 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-inner">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{user.dailyStreak}d</span>
            </div>
          )}

          {isGuest ? (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-md shadow-emerald-500/25 transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={openSettings}
              className="p-2 rounded-xl bg-[#091e14] hover:bg-[#0f2e1f] border border-emerald-900/60 text-emerald-300 hover:text-white transition-all active:scale-95"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
