import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabType, TrackedShow } from './types';
import { TMDBShow } from './types/tmdb';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { UpNextScreen } from './components/upnext/UpNextScreen';
import { SearchScreen } from './components/search/SearchScreen';
import { ActivityFeed } from './components/activity/ActivityFeed';
import { ProfileView } from './components/profile/ProfileView';
import { CheckInBottomSheet } from './components/checkin/CheckInBottomSheet';
import { CheckInSelectorModal } from './components/checkin/CheckInSelectorModal';
import { BadgeUnlockModal } from './components/badges/BadgeUnlockModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ShowDetailModal } from './components/search/ShowDetailModal';
import { AuthModal } from './components/auth/AuthModal';
import { FriendInviteModal } from './components/friends/FriendInviteModal';
import { fetchShowDetails } from './lib/tmdb';
import { useAuthStore } from './store/useAuthStore';
import { useCheckInStore } from './store/useCheckInStore';
import { useTrackerStore } from './store/useTrackerStore';
import {
  subscribeToLiveActivityFeed,
  subscribeToUserTrackedShows,
} from './lib/firestoreService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 mins
      refetchOnWindowFocus: false,
    },
  },
});

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upnext');
  const [selectedShowForModal, setSelectedShowForModal] = useState<TMDBShow | null>(null);

  const initializeAuthListener = useAuthStore((state) => state.initializeAuthListener);
  const user = useAuthStore((state) => state.user);
  const setFeed = useCheckInStore((state) => state.setFeed);
  const setTrackedShows = useTrackerStore((state) => state.setTrackedShows);

  // Initialize Firebase Auth listener on mount
  useEffect(() => {
    const unsubAuth = initializeAuthListener();
    return () => unsubAuth();
  }, [initializeAuthListener]);

  // Helper to determine if a check-in belongs to the current user (including guest/displayName match)
  const isUserCheckIn = (
    checkIn: { userId: string; userName?: string },
    currentUser: { userId: string; displayName?: string; username?: string } | null
  ) => {
    if (!currentUser) return true;
    if (checkIn.userId === currentUser.userId) return true;
    if (currentUser.displayName && checkIn.userName?.toLowerCase() === currentUser.displayName.toLowerCase()) return true;
    if (currentUser.username && checkIn.userName?.toLowerCase() === currentUser.username.toLowerCase()) return true;
    if (checkIn.userId === 'guest-user' || checkIn.userId === 'commander-chief') return true;
    return false;
  };

  const syncCheckInsToTracked = (checkIns: any[]) => {
    const currentTracked = useTrackerStore.getState().trackedShows;
    const currentUser = useAuthStore.getState().user;

    // Group user check-ins by show
    const userCheckIns = checkIns.filter((c) => isUserCheckIn(c, currentUser));
    const showCheckInsMap = new Map<number, any[]>();
    userCheckIns.forEach((c) => {
      const arr = showCheckInsMap.get(c.tmdbShowId) || [];
      arr.push(c);
      showCheckInsMap.set(c.tmdbShowId, arr);
    });

    showCheckInsMap.forEach((showCheckIns, showId) => {
      // Sort chronologically
      showCheckIns.sort(
        (a, b) => (a.seasonNumber - b.seasonNumber) || (a.episodeNumber - b.episodeNumber)
      );
      const latestCheckIn = showCheckIns[showCheckIns.length - 1];
      const existing = currentTracked.find((s) => s.tmdbShowId === showId);

      const uniqueWatchedCount = new Set(
        showCheckIns.map((c) => `S${c.seasonNumber}E${c.episodeNumber}`)
      ).size;

      const totalWatched = Math.max(existing?.totalEpisodesWatched || 0, uniqueWatchedCount);

      useTrackerStore.getState().addOrUpdateShow({
        tmdbShowId: showId,
        showTitle: latestCheckIn.showTitle,
        posterPath: latestCheckIn.posterPath || (existing?.posterPath || ''),
        status: 'watching',
        currentSeason: latestCheckIn.seasonNumber || 1,
        currentEpisode: latestCheckIn.episodeNumber || 1,
        totalEpisodesWatched: totalWatched,
        totalEpisodesInShow: existing?.totalEpisodesInShow || 10,
        nextEpisodeToWatch: {
          seasonNumber: latestCheckIn.seasonNumber || 1,
          episodeNumber: (latestCheckIn.episodeNumber || 1) + 1,
          title: `Episode ${(latestCheckIn.episodeNumber || 1) + 1}`,
        },
      });
    });
  };

  // Immediate backfill on mount & whenever user profile or feed updates
  useEffect(() => {
    const feed = useCheckInStore.getState().feed;
    if (feed && feed.length > 0) {
      syncCheckInsToTracked(feed);
    }
  }, [user]);

  // Real-time Firestore social feed subscription & auto-backfill for user check-ins
  useEffect(() => {
    const unsubFeed = subscribeToLiveActivityFeed((remoteFeed) => {
      if (remoteFeed && remoteFeed.length > 0) {
        setFeed(remoteFeed);
        syncCheckInsToTracked(remoteFeed);
      }
    });
    return () => unsubFeed();
  }, [setFeed, user]);

  // Real-time Firestore tracked shows subscription for authenticated user
  useEffect(() => {
    if (!user || user.userId === 'commander-chief') return;

    const feed = useCheckInStore.getState().feed;
    syncCheckInsToTracked(feed);

    const unsubTracked = subscribeToUserTrackedShows(user.userId, (remoteShows) => {
      if (remoteShows && remoteShows.length > 0) {
        setTrackedShows(remoteShows);
      }
    });

    return () => unsubTracked();
  }, [user, setTrackedShows]);

  const handleOpenShowDetails = async (tracked: TrackedShow) => {
    const show = await fetchShowDetails(tracked.tmdbShowId);
    if (show) {
      setSelectedShowForModal(show);
    } else {
      setSelectedShowForModal({
        id: tracked.tmdbShowId,
        name: tracked.showTitle,
        overview: 'Tracked TV show.',
        poster_path: tracked.posterPath,
        backdrop_path: tracked.backdropPath || null,
        vote_average: 8.5,
        vote_count: 100,
        popularity: 50,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#05130d] text-zinc-100 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl border-x border-emerald-950/60">
      {/* Top App Header */}
      <Header />

      {/* Main Tab Screen Content */}
      <main className="flex-1 w-full overflow-x-hidden">
        {activeTab === 'upnext' && (
          <UpNextScreen
            onOpenDetails={handleOpenShowDetails}
            onNavigateTab={setActiveTab}
          />
        )}
        {activeTab === 'search' && <SearchScreen />}
        {activeTab === 'activity' && <ActivityFeed />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Quick Check-In Selector Modal */}
      <CheckInSelectorModal
        onOpenShowDetails={(show) => setSelectedShowForModal(show)}
      />

      {/* Global Check-in Bottom Sheet */}
      <CheckInBottomSheet />

      {/* Global Badge Unlock Celebratory Modal */}
      <BadgeUnlockModal />

      {/* Auth Modal (Google & Email/Password Sign-in) */}
      <AuthModal />

      {/* Settings Modal */}
      <SettingsModal />

      {/* Friend Invite Receiver Modal */}
      <FriendInviteModal />

      {/* Detailed Show Inspection Modal */}
      {selectedShowForModal && (
        <ShowDetailModal
          show={selectedShowForModal}
          onClose={() => setSelectedShowForModal(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
