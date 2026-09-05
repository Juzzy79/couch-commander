import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Vibrate, Check, Sparkles, User, Trash2 } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTrackerStore } from '../../store/useTrackerStore';
import { triggerHaptic } from '../../lib/haptics';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useSettingsStore((state) => state.isSettingsOpen);
  const closeSettings = useSettingsStore((state) => state.closeSettings);
  const tmdbApiKey = useSettingsStore((state) => state.tmdbApiKey);
  const setTmdbApiKey = useSettingsStore((state) => state.setTmdbApiKey);
  const isHapticEnabled = useSettingsStore((state) => state.isHapticEnabled);
  const toggleHaptic = useSettingsStore((state) => state.toggleHaptic);

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearUserData = useAuthStore((state) => state.clearUserData);
  const clearAllShows = useTrackerStore((state) => state.clearAllShows);

  const [keyInput, setKeyInput] = useState<string>(tmdbApiKey);
  const [displayName, setDisplayName] = useState<string>(user?.displayName || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    setTmdbApiKey(keyInput.trim());
    if (displayName.trim()) {
      updateUser({ displayName: displayName.trim() });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeSettings();
    }, 1000);
  };

  const handleCleanSlate = () => {
    if (window.confirm('Reset your profile to a completely clean slate? This removes all tracked shows and resets badges so you start fresh.')) {
      triggerHaptic('medium');
      clearAllShows();
      clearUserData();
      localStorage.removeItem('couch_commander_tracked');
      localStorage.removeItem('couch_commander_feed');
      localStorage.removeItem('couch_commander_stats');
      closeSettings();
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#05130d] border border-emerald-900/80 p-6 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">App Settings</h3>
                <p className="text-[11px] text-emerald-400/80">Couch Commander Configuration</p>
              </div>
            </div>

            <button
              onClick={closeSettings}
              className="p-2 rounded-full bg-[#091e14] border border-emerald-900/70 text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-emerald-300/90 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>Commander Display Name</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Rivers"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#091e14] border border-emerald-900 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>

            {/* TMDB API Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-emerald-300/90 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TMDB API Key (Optional)</span>
                </label>
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Get free key
                </a>
              </div>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Enter TMDB API Key or leave empty for offline demo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#091e14] border border-emerald-900 text-sm text-white placeholder-emerald-700 font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>

            {/* Haptic Toggle */}
            <div
              onClick={toggleHaptic}
              className="flex items-center justify-between p-3 rounded-xl bg-[#091e14]/60 border border-emerald-900/60 cursor-pointer hover:border-emerald-600/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#0e2a1d] text-emerald-300">
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-200">Mobile Haptics</h4>
                  <p className="text-[10px] text-emerald-400/60">Vibration feedback on check-ins</p>
                </div>
              </div>

              <div
                className={`w-10 h-6 rounded-full p-1 transition-colors ${
                  isHapticEnabled ? 'bg-emerald-500' : 'bg-emerald-950'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isHapticEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </form>

          {/* Clean Slate Action */}
          <div className="pt-2 border-t border-emerald-950/80">
            <button
              type="button"
              onClick={handleCleanSlate}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 text-xs font-bold text-rose-300 hover:text-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset My Account to Clean Slate</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
