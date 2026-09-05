import React from 'react';
import { Sparkles, Tv, Flame, Search } from 'lucide-react';
import { TrackedShow, ShowStatus, TabType } from '../../types';
import { useTrackerStore } from '../../store/useTrackerStore';
import { useAuthStore } from '../../store/useAuthStore';
import { UpNextCard } from './UpNextCard';
import { ShowProgressRail } from './ShowProgressRail';

interface UpNextScreenProps {
  onOpenDetails: (show: TrackedShow) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const UpNextScreen: React.FC<UpNextScreenProps> = ({
  onOpenDetails,
  onNavigateTab,
}) => {
  const trackedShows = useTrackerStore((state) => state.trackedShows);
  const activeFilter = useTrackerStore((state) => state.activeFilter);
  const setActiveFilter = useTrackerStore((state) => state.setActiveFilter);
  const user = useAuthStore((state) => state.user);

  const watchingShows = trackedShows.filter((s) => s.status === 'watching');
  const filteredShows = trackedShows.filter((s) =>
    activeFilter === 'all' ? true : s.status === activeFilter
  );

  const filterTabs: { id: 'all' | ShowStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'watching', label: 'Watching' },
    { id: 'plan_to_watch', label: 'Plan to Watch' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="pb-24 pt-2">
      {/* Top Banner: Forest Green Gradient & Daily Streak */}
      <div className="px-4 mb-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/70 to-[#06180f] border border-emerald-500/30 p-4 shadow-xl shadow-black/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                <Flame className="w-4 h-4 fill-emerald-500 text-emerald-400 animate-pulse" />
                <span>{user?.dailyStreak || 1} Day Streak</span>
              </div>
              <h2 className="text-base font-extrabold text-white mt-1">
                Keep the Couch Warm!
              </h2>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Check into today's episode to earn badges & leaderboard points.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('activity')}
              className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-transform active:scale-95 flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Rail (Thumbnails) */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-black text-emerald-400/90 uppercase tracking-wider">
            In Progress ({watchingShows.length})
          </h3>
        </div>
        <ShowProgressRail
          shows={watchingShows}
          onSelectShow={onOpenDetails}
          onExploreClick={() => onNavigateTab('search')}
        />
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md shadow-emerald-500/30'
                  : 'bg-[#091e14]/80 text-emerald-300/80 hover:text-white border border-emerald-900/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main List of Up Next Episodes */}
      <div className="px-4">
        {filteredShows.length > 0 ? (
          filteredShows.map((show) => (
            <UpNextCard
              key={show.tmdbShowId}
              show={show}
              onOpenDetails={onOpenDetails}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#091e14]/50 border border-emerald-900/40">
            <Tv className="w-12 h-12 text-emerald-800 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-emerald-200">
              No shows in this category yet
            </h3>
            <p className="text-xs text-emerald-400/60 max-w-xs mx-auto mt-1 mb-4">
              Explore the TMDB catalog to start tracking episodes and collecting Couch Commander badges.
            </p>
            <button
              onClick={() => onNavigateTab('search')}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-extrabold shadow-md shadow-emerald-500/25 transition-all active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore TV Catalog</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
