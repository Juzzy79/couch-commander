import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

interface SettingsState {
  isSettingsOpen: boolean;
  tmdbApiKey: string;
  isHapticEnabled: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  setTmdbApiKey: (key: string) => void;
  toggleHaptic: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  let savedKey = '';
  try {
    savedKey = localStorage.getItem('couch_commander_tmdb_key') || '';
  } catch {
    // ignore
  }

  return {
    isSettingsOpen: false,
    tmdbApiKey: savedKey,
    isHapticEnabled: true,

    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),

    setTmdbApiKey: (key) => {
      const cleanKey = key.trim();
      set({ tmdbApiKey: cleanKey });
      try {
        localStorage.setItem('couch_commander_tmdb_key', cleanKey);
      } catch {
        // ignore
      }
      const authUser = useAuthStore.getState().user;
      if (authUser && authUser.userId && authUser.userId !== 'guest-user') {
        useAuthStore.getState().updateUser({ tmdbApiKey: cleanKey });
      }
    },

    toggleHaptic: () => {
      set((state) => ({ isHapticEnabled: !state.isHapticEnabled }));
    },
  };
});
