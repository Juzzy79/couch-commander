import { create } from 'zustand';
import { TrackedShow, ShowStatus } from '../types';
import { saveTrackedShowToFirestore } from '../lib/firestoreService';
import { useAuthStore } from './useAuthStore';

interface TrackerState {
  trackedShows: TrackedShow[];
  activeFilter: 'all' | ShowStatus;
  setActiveFilter: (filter: 'all' | ShowStatus) => void;
  setTrackedShows: (shows: TrackedShow[]) => void;
  clearAllShows: () => void;
  getTrackedShow: (showId: number) => TrackedShow | undefined;
  addOrUpdateShow: (show: Partial<TrackedShow> & { tmdbShowId: number; showTitle: string; posterPath: string }) => void;
  markEpisodeWatched: (showId: number, seasonNumber: number, episodeNumber: number, nextEpisode?: TrackedShow['nextEpisodeToWatch']) => void;
  markSeasonWatched: (showId: number, seasonNumber: number, episodeCount: number) => void;
  removeTrackedShow: (showId: number) => void;
  updateShowStatus: (showId: number, status: ShowStatus) => void;
}

export const useTrackerStore = create<TrackerState>((set, get) => {
  let initialShows: TrackedShow[] = [];
  try {
    const saved = localStorage.getItem('couch_commander_tracked');
    if (saved) {
      initialShows = JSON.parse(saved);
    }
  } catch {
    initialShows = [];
  }

  const persist = (shows: TrackedShow[]) => {
    try {
      localStorage.setItem('couch_commander_tracked', JSON.stringify(shows));
    } catch {
      // ignore
    }
  };

  const syncShowToFirestore = (show: TrackedShow) => {
    const user = useAuthStore.getState().user;
    if (user && user.userId) {
      saveTrackedShowToFirestore(user.userId, show);
    }
  };

  return {
    trackedShows: initialShows,
    activeFilter: 'all',

    setActiveFilter: (filter) => set({ activeFilter: filter }),
    setTrackedShows: (shows) => {
      set({ trackedShows: shows });
      persist(shows);
    },
    clearAllShows: () => {
      set({ trackedShows: [] });
      localStorage.removeItem('couch_commander_tracked');
    },

    getTrackedShow: (showId: number) => {
      return get().trackedShows.find((s) => s.tmdbShowId === showId);
    },

    addOrUpdateShow: (showData) => {
      const shows = get().trackedShows;
      const index = shows.findIndex((s) => s.tmdbShowId === showData.tmdbShowId);
      let updated: TrackedShow[];
      let targetShow: TrackedShow;

      if (index >= 0) {
        const existing = shows[index];
        targetShow = {
          ...existing,
          ...showData,
          lastWatchedAt: showData.lastWatchedAt || existing.lastWatchedAt || Date.now(),
        };
        updated = [...shows];
        updated[index] = targetShow;
      } else {
        targetShow = {
          tmdbShowId: showData.tmdbShowId,
          showTitle: showData.showTitle,
          posterPath: showData.posterPath,
          backdropPath: showData.backdropPath,
          status: showData.status || 'watching',
          currentSeason: showData.currentSeason || 1,
          currentEpisode: showData.currentEpisode || 0,
          totalEpisodesWatched: showData.totalEpisodesWatched || 0,
          totalEpisodesInShow: showData.totalEpisodesInShow,
          lastWatchedAt: Date.now(),
          nextEpisodeToWatch: showData.nextEpisodeToWatch,
        };
        updated = [targetShow, ...shows];
      }

      set({ trackedShows: updated });
      persist(updated);
      syncShowToFirestore(targetShow);
    },

    markEpisodeWatched: (showId, seasonNumber, episodeNumber, nextEpisode) => {
      const shows = get().trackedShows;
      const index = shows.findIndex((s) => s.tmdbShowId === showId);
      
      let updatedShow: TrackedShow;
      let updated: TrackedShow[];

      if (index >= 0) {
        const existing = shows[index];
        updatedShow = {
          ...existing,
          status: 'watching',
          currentSeason: seasonNumber,
          currentEpisode: episodeNumber,
          totalEpisodesWatched: (existing.totalEpisodesWatched || 0) + 1,
          lastWatchedAt: Date.now(),
          nextEpisodeToWatch: nextEpisode || {
            seasonNumber: seasonNumber,
            episodeNumber: episodeNumber + 1,
            title: `Episode ${episodeNumber + 1}`,
          },
        };
        updated = [...shows];
        updated[index] = updatedShow;
      } else {
        updatedShow = {
          tmdbShowId: showId,
          showTitle: `Show #${showId}`,
          posterPath: '',
          status: 'watching',
          currentSeason: seasonNumber,
          currentEpisode: episodeNumber,
          totalEpisodesWatched: 1,
          totalEpisodesInShow: 10,
          lastWatchedAt: Date.now(),
          nextEpisodeToWatch: nextEpisode || {
            seasonNumber: seasonNumber,
            episodeNumber: episodeNumber + 1,
            title: `Episode ${episodeNumber + 1}`,
          },
        };
        updated = [updatedShow, ...shows];
      }

      set({ trackedShows: updated });
      persist(updated);
      syncShowToFirestore(updatedShow);
    },

    markSeasonWatched: (showId, seasonNumber, episodeCount) => {
      const shows = get().trackedShows;
      const index = shows.findIndex((s) => s.tmdbShowId === showId);
      if (index < 0) return;

      const existing = shows[index];
      const updatedShow: TrackedShow = {
        ...existing,
        status: 'watching',
        currentSeason: seasonNumber,
        currentEpisode: episodeCount,
        totalEpisodesWatched: Math.max(existing.totalEpisodesWatched, episodeCount),
        lastWatchedAt: Date.now(),
        nextEpisodeToWatch: {
          seasonNumber: seasonNumber + 1,
          episodeNumber: 1,
          title: `Season ${seasonNumber + 1} Premiere`,
        },
      };

      const updated = [...shows];
      updated[index] = updatedShow;
      set({ trackedShows: updated });
      persist(updated);
      syncShowToFirestore(updatedShow);
    },

    updateShowStatus: (showId, status) => {
      const shows = get().trackedShows;
      const updated = shows.map((s) =>
        s.tmdbShowId === showId ? { ...s, status } : s
      );
      set({ trackedShows: updated });
      persist(updated);
      const updatedShow = updated.find((s) => s.tmdbShowId === showId);
      if (updatedShow) syncShowToFirestore(updatedShow);
    },

    removeTrackedShow: (showId) => {
      const shows = get().trackedShows;
      const updated = shows.filter((s) => s.tmdbShowId !== showId);
      set({ trackedShows: updated });
      persist(updated);
    },
  };
});
