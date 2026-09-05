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

  // Real-time Firestore social feed subscription & auto-backfill for user check-ins
  useEffect(() => {
    const unsubFeed = subscribeToLiveActivityFeed((remoteFeed) => {
      if (remoteFeed && remoteFeed.length > 0) {
        setFeed(remoteFeed);

        // Auto-heal / backfill any tracked shows from current user's past check-ins
        if (user && user.userId) {
          const userCheckIns = remoteFeed.filter((c) => c.userId === user.userId);
          const currentTracked = useTrackerStore.getState().trackedShows;
          userCheckIns.forEach((checkIn) => {
            const exists = currentTracked.some((s) => s.tmdbShowId === checkIn.tmdbShowId);
            if (!exists) {
              useTrackerStore.getState().addOrUpdateShow({
                tmdbShowId: checkIn.tmdbShowId,
                showTitle: checkIn.showTitle,
                posterPath: checkIn.posterPath || '',
                status: 'watching',
                currentSeason: checkIn.seasonNumber,
                currentEpisode: checkIn.episodeNumber,
                totalEpisodesWatched: 1,
                totalEpisodesInShow: 10,
                nextEpisodeToWatch: {
                  seasonNumber: checkIn.seasonNumber,
                  episodeNumber: checkIn.episodeNumber + 1,
                  title: `Episode ${checkIn.episodeNumber + 1}`,
                },
              });
            }
          });
        }
      }
    });
    return () => unsubFeed();
  }, [setFeed, user]);

  // Real-time Firestore tracked shows subscription for authenticated user
  useEffect(() => {
    if (!user || user.userId === 'commander-chief') return;

    // Check feed for any shows the user has checked into that aren't yet in trackedShows
    const userCheckIns = useCheckInStore.getState().feed.filter((c) => c.userId === user.userId);
    const currentTracked = useTrackerStore.getState().trackedShows;
    userCheckIns.forEach((checkIn) => {
      const exists = currentTracked.some((s) => s.tmdbShowId === checkIn.tmdbShowId);
      if (!exists) {
        useTrackerStore.getState().addOrUpdateShow({
          tmdbShowId: checkIn.tmdbShowId,
          showTitle: checkIn.showTitle,
          posterPath: checkIn.posterPath || '',
          status: 'watching',
          currentSeason: checkIn.seasonNumber,
          currentEpisode: checkIn.episodeNumber,
          totalEpisodesWatched: 1,
          totalEpisodesInShow: 10,
          nextEpisodeToWatch: {
            seasonNumber: checkIn.seasonNumber,
            episodeNumber: checkIn.episodeNumber + 1,
            title: `Episode ${checkIn.episodeNumber + 1}`,
          },
        });
      }
    });

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
