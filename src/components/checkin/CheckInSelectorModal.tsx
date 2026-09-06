import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Tv, Sparkles, Play, ChevronRight } from 'lucide-react';
import { useCheckInStore } from '../../store/useCheckInStore';
import { useTrackerStore } from '../../store/useTrackerStore';
import { searchTMDB, fetchShowDetails } from '../../lib/tmdb';
import { TMDBShow } from '../../types/tmdb';
import { getTMDBImageUrl } from '../../lib/utils';
import { triggerHaptic } from '../../lib/haptics';

interface CheckInSelectorModalProps {
  onOpenShowDetails?: (show: TMDBShow) => void;
}

export const CheckInSelectorModal: React.FC<CheckInSelectorModalProps> = ({ onOpenShowDetails }) => {
  const isQuickSelectorOpen = useCheckInStore((state) => state.isQuickSelectorOpen);
  const closeQuickSelector = useCheckInStore((state) => state.closeQuickSelector);
  const openCheckInModal = useCheckInStore((state) => state.openCheckInModal);
  const trackedShows = useTrackerStore((state) => state.trackedShows);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<TMDBShow[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const watchingShows = trackedShows.filter((s) => s.status === 'watching');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchTMDB(searchQuery).then((results) => {
        setSearchResults(results);
        setIsSearching(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isQuickSelectorOpen) return null;

  const handleSelectWatchingShow = (show: typeof watchingShows[0]) => {
    triggerHaptic('success');
    closeQuickSelector();
    openCheckInModal({
      tmdbShowId: show.tmdbShowId,
      showTitle: show.showTitle,
      posterPath: show.posterPath,
      seasonNumber: show.nextEpisodeToWatch?.seasonNumber || show.currentSeason || 1,
      episodeNumber: show.nextEpisodeToWatch?.episodeNumber || (show.currentEpisode + 1),
      episodeTitle: show.nextEpisodeToWatch?.title || `Episode ${(show.currentEpisode + 1)}`,
    });
  };

  const handleSelectSearchResult = async (show: TMDBShow) => {
    triggerHaptic('light');
    closeQuickSelector();
    if (onOpenShowDetails) {
      onOpenShowDetails(show);
    } else {
      const full = await fetchShowDetails(show.id);
      openCheckInModal({
        tmdbShowId: show.id,
        showTitle: full?.name || show.name,
        posterPath: full?.poster_path || show.poster_path || '',
        seasonNumber: 1,
        episodeNumber: 1,
        episodeTitle: 'Episode 1',
      });
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{ zIndex: 1000 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-md"
      >
        <div onClick={closeQuickSelector} className="absolute inset-0 bg-transparent" />

        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 200 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80) {
              triggerHaptic('light');
              closeQuickSelector();
            }
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[85vh] rounded-t-3xl bg-[#05130d] border-t border-x border-emerald-900/80 p-5 shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Swipe indicator bar */}
          <div className="w-12 h-1.5 rounded-full bg-emerald-800/60 mx-auto mb-4 -mt-1 cursor-grab active:cursor-grabbing" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Check into a Show
                </h3>
                <p className="text-[11px] text-emerald-400/70">
                  Select an in-progress show or search any title
                </p>
              </div>
            </div>

            <button
              onClick={closeQuickSelector}
              className="p-2 rounded-full bg-[#091e14] border border-emerald-900/70 text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any show (e.g., The Gentlemen, Severance)..."
              autoFocus={watchingShows.length === 0}
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#091e14]/90 border border-emerald-900/80 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto space-y-4 no-scrollbar flex-1 pb-4">
            {/* Search Results if typing */}
            {searchQuery.trim().length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  Search Results ({searchResults.length})
                </h4>

                {isSearching ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 rounded-2xl bg-[#091e14]/60 animate-pulse border border-emerald-900/60" />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((show) => (
                      <button
                        key={show.id}
                        onClick={() => handleSelectSearchResult(show)}
                        className="w-full p-2.5 rounded-2xl bg-[#091e14]/80 hover:bg-[#0f2e1f] border border-emerald-900/70 hover:border-emerald-500/60 transition-all flex items-center justify-between gap-3 text-left group active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={getTMDBImageUrl(show.poster_path, 'w200')}
                            alt={show.name}
                            className="w-12 h-16 rounded-xl object-cover border border-emerald-800/60 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                              {show.name}
                            </h5>
                            <p className="text-[11px] text-emerald-400/70 mt-0.5 line-clamp-1">
                              {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'TV Show'} • ★ {show.vote_average ? show.vote_average.toFixed(1) : '8.0'}
                            </p>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all flex-shrink-0">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-emerald-600">
                    No shows found for "{searchQuery}".
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Active Watching Shows Section */}
                {watchingShows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5" />
                        <span>Continue Watching</span>
                      </h4>
                      <span className="text-[10px] text-emerald-600 font-bold">1-Tap Check In</span>
                    </div>

                    <div className="space-y-2">
                      {watchingShows.map((show) => {
                        const nextEpNum = show.nextEpisodeToWatch?.episodeNumber || (show.currentEpisode + 1);
                        const nextSeasonNum = show.nextEpisodeToWatch?.seasonNumber || show.currentSeason || 1;
                        const epTitle = show.nextEpisodeToWatch?.title || `Episode ${nextEpNum}`;

                        return (
                          <button
                            key={show.tmdbShowId}
                            onClick={() => handleSelectWatchingShow(show)}
                            className="w-full p-3 rounded-2xl bg-[#091e14]/90 hover:bg-[#0e2c1e] border border-emerald-900/80 hover:border-emerald-500/70 transition-all flex items-center justify-between gap-3 text-left group active:scale-[0.98] shadow-md shadow-emerald-950/40"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={getTMDBImageUrl(show.posterPath, 'w200')}
                                alt={show.showTitle}
                                className="w-12 h-16 rounded-xl object-cover border border-emerald-700/60 shadow-md flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-black text-white truncate group-hover:text-emerald-300 transition-colors">
                                  {show.showTitle}
                                </h5>
                                <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                                  <span>S{String(nextSeasonNum).padStart(2, '0')}E{String(nextEpNum).padStart(2, '0')}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[140px]">{epTitle}</span>
                                </div>
                              </div>
                            </div>

                            <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-[11px] font-black shadow-sm flex items-center gap-1 flex-shrink-0 group-hover:scale-105 transition-transform">
                              <Play className="w-3 h-3 fill-black" />
                              <span>Check In</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State / Search Prompt if no active shows */}
                {watchingShows.length === 0 && (
                  <div className="text-center py-8 px-4 rounded-2xl bg-[#091e14]/50 border border-emerald-900/60">
                    <Tv className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-emerald-200">No active shows yet</h4>
                    <p className="text-[11px] text-emerald-400/60 mt-1 max-w-xs mx-auto">
                      Use the search bar above to find and check into any show in the database!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
