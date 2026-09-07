import { create } from 'zustand';
import { CheckIn, ShowStats } from '../types';
import { useAuthStore } from './useAuthStore';
import { useTrackerStore } from './useTrackerStore';
import { useBadgeStore } from './useBadgeStore';
import { triggerHaptic } from '../lib/haptics';
import { calculateNextEpisodeOrCompletion } from '../lib/tmdb';
import {
  publishCheckInToFirestore,
  saveShowStatsToFirestore,
} from '../lib/firestoreService';

interface ActiveCheckInTarget {
  tmdbShowId: number;
  showTitle: string;
  posterPath?: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  totalEpisodesInSeason?: number;
  isSeriesFinale?: boolean;
}

interface CheckInState {
  isBottomSheetOpen: boolean;
  isQuickSelectorOpen: boolean;
  activeTarget: ActiveCheckInTarget | null;
  feed: CheckIn[];
  showStats: Record<number, ShowStats>;
  dethronedNotice: { showTitle: string; newCommander: string } | null;
  
  setFeed: (feed: CheckIn[]) => void;
  setShowStat: (showId: number, stats: ShowStats) => void;
  clearFeed: () => void;
  openCheckInModal: (target: ActiveCheckInTarget) => void;
  closeCheckInModal: () => void;
  openQuickSelector: () => void;
  closeQuickSelector: () => void;
  submitCheckIn: (comment: string, isSpoiler: boolean) => Promise<CheckIn | null>;
  quickWatch: (target: ActiveCheckInTarget) => void;
  toggleLikeCheckIn: (checkInId: string) => void;
  getShowStats: (showId: number) => ShowStats;
  dismissDethronedNotice: () => void;
}

export const useCheckInStore = create<CheckInState>((set, get) => {
  let initialFeed: CheckIn[] = [];
  let initialStats: Record<number, ShowStats> = {};

  try {
    const savedFeed = localStorage.getItem('couch_commander_feed');
    if (savedFeed) initialFeed = JSON.parse(savedFeed);
    const savedStats = localStorage.getItem('couch_commander_stats');
    if (savedStats) initialStats = JSON.parse(savedStats);
  } catch {
    initialFeed = [];
    initialStats = {};
  }

  const persistFeed = (feed: CheckIn[]) => {
    try {
      localStorage.setItem('couch_commander_feed', JSON.stringify(feed));
    } catch {
      // ignore
    }
  };

  const persistStats = (stats: Record<number, ShowStats>) => {
    try {
      localStorage.setItem('couch_commander_stats', JSON.stringify(stats));
    } catch {
      // ignore
    }
  };

  return {
    isBottomSheetOpen: false,
    isQuickSelectorOpen: false,
    activeTarget: null,
    feed: initialFeed,
    showStats: initialStats,
    dethronedNotice: null,

    setFeed: (feed) => {
      set({ feed });
      persistFeed(feed);
    },

    clearFeed: () => {
      set({ feed: [], showStats: {} });
      localStorage.removeItem('couch_commander_feed');
      localStorage.removeItem('couch_commander_stats');
    },

    setShowStat: (showId, stat) => {
      const allStats = { ...get().showStats, [showId]: stat };
      set({ showStats: allStats });
      persistStats(allStats);
    },

    dismissDethronedNotice: () => set({ dethronedNotice: null }),

    openCheckInModal: (target) => {
      triggerHaptic('light');
      set({ activeTarget: target, isBottomSheetOpen: true, isQuickSelectorOpen: false });
    },

    closeCheckInModal: () => {
      set({ isBottomSheetOpen: false, activeTarget: null });
    },

    openQuickSelector: () => {
      triggerHaptic('light');
      set({ isQuickSelectorOpen: true });
    },

    closeQuickSelector: () => {
      set({ isQuickSelectorOpen: false });
    },

    getShowStats: (showId: number) => {
      const stats = get().showStats[showId];
      if (stats) return stats;

      return {
        tmdbShowId: showId,
        couchCommander: null,
        remoteContender: null,
        snackRunner: null,
        userCheckInCounts: {},
        totalCheckIns: 0,
        updatedAt: Date.now(),
      };
    },

    quickWatch: (target) => {
      const auth = useAuthStore.getState();
      const tracker = useTrackerStore.getState();
      const badge = useBadgeStore.getState();

      const existingShow = tracker.getTrackedShow(target.tmdbShowId);
      const currentEpisodesCount = existingShow?.totalEpisodesWatched || 0;

      const isLastInSeason = target.totalEpisodesInSeason && target.episodeNumber >= target.totalEpisodesInSeason;

      tracker.addOrUpdateShow({
        tmdbShowId: target.tmdbShowId,
        showTitle: target.showTitle,
        posterPath: target.posterPath || (existingShow?.posterPath || ''),
        status: target.isSeriesFinale ? 'completed' : 'watching',
        currentSeason: target.seasonNumber,
        currentEpisode: target.episodeNumber,
        totalEpisodesWatched: currentEpisodesCount + 1,
        totalEpisodesInShow: target.totalEpisodesInSeason || (existingShow?.totalEpisodesInShow || 10),
        nextEpisodeToWatch: target.isSeriesFinale
          ? undefined
          : {
              seasonNumber: isLastInSeason ? target.seasonNumber + 1 : target.seasonNumber,
              episodeNumber: isLastInSeason ? 1 : target.episodeNumber + 1,
              title: isLastInSeason ? `Season ${target.seasonNumber + 1} Premiere` : `Episode ${target.episodeNumber + 1}`,
            },
      });

      // Query database for accurate next episode or complete status
      calculateNextEpisodeOrCompletion(
        target.tmdbShowId,
        target.seasonNumber,
        target.episodeNumber,
        target.showTitle
      ).then((res) => {
        const currentNow = useTrackerStore.getState().getTrackedShow(target.tmdbShowId);
        if (!currentNow) return;

        if (res.isCompleted) {
          useTrackerStore.getState().addOrUpdateShow({
            ...currentNow,
            status: 'completed',
            nextEpisodeToWatch: undefined,
          });
        } else if (res.nextEpisode && currentNow.status !== 'completed') {
          useTrackerStore.getState().addOrUpdateShow({
            ...currentNow,
            nextEpisodeToWatch: res.nextEpisode,
          });
        }
      });

      auth.incrementStreak();
      triggerHaptic('success');

      badge.checkAndAwardBadges({
        totalCheckIns: tracker.trackedShows.reduce((acc, s) => acc + s.totalEpisodesWatched, 0),
        showCheckInsIn12h: 1,
        isSeriesFinale: target.isSeriesFinale,
      });
    },

    submitCheckIn: async (comment, isSpoiler) => {
      const target = get().activeTarget;
      const user = useAuthStore.getState().user;
      if (!target || !user) return null;

      const newCheckIn: CheckIn = {
        id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: user.userId,
        userName: user.displayName,
        userAvatar: user.avatarUrl,
        tmdbShowId: target.tmdbShowId,
        showTitle: target.showTitle,
        posterPath: target.posterPath,
        seasonNumber: target.seasonNumber,
        episodeNumber: target.episodeNumber,
        episodeTitle: target.episodeTitle,
        comment: comment.trim(),
        isSpoiler: isSpoiler,
        timestamp: Date.now(),
        likesCount: 0,
        likedBy: [],
      };

      // 1. Add to local Feed & Firestore
      const updatedFeed = [newCheckIn, ...get().feed];
      set({ feed: updatedFeed });
      persistFeed(updatedFeed);
      publishCheckInToFirestore(newCheckIn);

      // 2. Update Show Stats & Leaderboard
      const allStats = { ...get().showStats };
      const currentStat = allStats[target.tmdbShowId] || {
        tmdbShowId: target.tmdbShowId,
        couchCommander: null,
        remoteContender: null,
        snackRunner: null,
        userCheckInCounts: {},
        totalCheckIns: 0,
        updatedAt: Date.now(),
      };

      const prevCommander = currentStat.couchCommander;
      const prevUserCount = currentStat.userCheckInCounts[user.userId] || 0;
      const newUserCount = prevUserCount + 1;

      const updatedCounts = {
        ...currentStat.userCheckInCounts,
        [user.userId]: newUserCount,
      };

      const sortedUsers = Object.entries(updatedCounts).sort((a, b) => b[1] - a[1]);
      
      const newCommanderUser = sortedUsers[0] ? {
        userId: sortedUsers[0][0],
        userName: sortedUsers[0][0] === user.userId ? user.displayName : (prevCommander?.userName || 'Friend'),
        avatarUrl: sortedUsers[0][0] === user.userId ? user.avatarUrl : prevCommander?.avatarUrl,
        count: sortedUsers[0][1],
      } : null;

      const newContenderUser = sortedUsers[1] ? {
        userId: sortedUsers[1][0],
        userName: sortedUsers[1][0] === user.userId ? user.displayName : 'Friend',
        count: sortedUsers[1][1],
      } : null;

      const newRunnerUser = sortedUsers[2] ? {
        userId: sortedUsers[2][0],
        userName: sortedUsers[2][0] === user.userId ? user.displayName : 'Friend',
        count: sortedUsers[2][1],
      } : null;

      const updatedStat: ShowStats = {
        ...currentStat,
        userCheckInCounts: updatedCounts,
        couchCommander: newCommanderUser,
        remoteContender: newContenderUser,
        snackRunner: newRunnerUser,
        totalCheckIns: currentStat.totalCheckIns + 1,
        updatedAt: Date.now(),
      };

      allStats[target.tmdbShowId] = updatedStat;
      set({ showStats: allStats });
      persistStats(allStats);
      saveShowStatsToFirestore(target.tmdbShowId, updatedStat);

      // 3. Check dethroned
      if (prevCommander && prevCommander.userId !== user.userId && newCommanderUser?.userId === user.userId) {
        triggerHaptic('badge');
      }

      // 4. Update Tracker pointer - automatically add to watching & Up Next
      const existingShow = useTrackerStore.getState().getTrackedShow(target.tmdbShowId);
      const currentEpisodesCount = existingShow?.totalEpisodesWatched || 0;
      const isLastInSeason = target.totalEpisodesInSeason && target.episodeNumber >= target.totalEpisodesInSeason;

      useTrackerStore.getState().addOrUpdateShow({
        tmdbShowId: target.tmdbShowId,
        showTitle: target.showTitle,
        posterPath: target.posterPath || (existingShow?.posterPath || ''),
        status: target.isSeriesFinale ? 'completed' : 'watching',
        currentSeason: target.seasonNumber,
        currentEpisode: target.episodeNumber,
        totalEpisodesWatched: currentEpisodesCount + 1,
        totalEpisodesInShow: target.totalEpisodesInSeason || (existingShow?.totalEpisodesInShow || 10),
        nextEpisodeToWatch: target.isSeriesFinale
          ? undefined
          : {
              seasonNumber: isLastInSeason ? target.seasonNumber + 1 : target.seasonNumber,
              episodeNumber: isLastInSeason ? 1 : target.episodeNumber + 1,
              title: isLastInSeason ? `Season ${target.seasonNumber + 1} Premiere` : `Episode ${target.episodeNumber + 1}`,
            },
      });

      // Query database for accurate next episode or complete status
      calculateNextEpisodeOrCompletion(
        target.tmdbShowId,
        target.seasonNumber,
        target.episodeNumber,
        target.showTitle
      ).then((res) => {
        const currentNow = useTrackerStore.getState().getTrackedShow(target.tmdbShowId);
        if (!currentNow) return;

        if (res.isCompleted) {
          useTrackerStore.getState().addOrUpdateShow({
            ...currentNow,
            status: 'completed',
            nextEpisodeToWatch: undefined,
          });
        } else if (res.nextEpisode && currentNow.status !== 'completed') {
          useTrackerStore.getState().addOrUpdateShow({
            ...currentNow,
            nextEpisodeToWatch: res.nextEpisode,
          });
        }
      });

      // 5. Update Streak
      useAuthStore.getState().incrementStreak();

      // 6. Check badges
      const userCheckInsIn12h = updatedFeed.filter(
        (c) =>
          c.userId === user.userId &&
          c.tmdbShowId === target.tmdbShowId &&
          Date.now() - c.timestamp < 1000 * 60 * 60 * 12
      ).length;

      useBadgeStore.getState().checkAndAwardBadges({
        totalCheckIns: updatedFeed.filter((c) => c.userId === user.userId).length,
        showCheckInsIn12h: userCheckInsIn12h,
        checkInTime: new Date(),
        isSeriesFinale: target.isSeriesFinale,
        isRank1: newCommanderUser?.userId === user.userId,
        isRank2: newContenderUser?.userId === user.userId,
        isSpoilerMarked: isSpoiler,
      });

      triggerHaptic('success');
      get().closeCheckInModal();
      return newCheckIn;
    },

    toggleLikeCheckIn: (checkInId: string) => {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const updatedFeed = get().feed.map((item) => {
        if (item.id === checkInId) {
          const likedBy = item.likedBy || [];
          const hasLiked = likedBy.includes(user.userId);
          const newLikedBy = hasLiked
            ? likedBy.filter((id) => id !== user.userId)
            : [...likedBy, user.userId];
          return {
            ...item,
            likedBy: newLikedBy,
            likesCount: newLikedBy.length,
          };
        }
        return item;
      });

      set({ feed: updatedFeed });
      persistFeed(updatedFeed);
      triggerHaptic('light');

      const updatedItem = updatedFeed.find((i) => i.id === checkInId);
      if (updatedItem) {
        publishCheckInToFirestore(updatedItem);
      }
    },
  };
});
