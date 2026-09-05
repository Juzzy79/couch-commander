import { create } from 'zustand';

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
      set({ tmdbApiKey: key });
      try {
        localStorage.setItem('couch_commander_tmdb_key', key);
      } catch {
        // ignore
      }
    },

    toggleHaptic: () => {
      set((state) => ({ isHapticEnabled: !state.isHapticEnabled }));
    },
  };
});
