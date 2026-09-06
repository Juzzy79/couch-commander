import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Plus, Check, Play, Tv } from 'lucide-react';
import { TMDBShow, TMDBSeasonDetail } from '../../types/tmdb';
import { getTMDBImageUrl } from '../../lib/utils';
import { fetchSeasonDetails, fetchShowDetails } from '../../lib/tmdb';
import { useTrackerStore } from '../../store/useTrackerStore';
import { useCheckInStore } from '../../store/useCheckInStore';
import { ShowLeaderboard } from '../leaderboard/ShowLeaderboard';
import { triggerHaptic } from '../../lib/haptics';

interface ShowDetailModalProps {
  show: TMDBShow | null;
  onClose: () => void;
}

export const ShowDetailModal: React.FC<ShowDetailModalProps> = ({ show: initialShow, onClose }) => {
  const [show, setShow] = useState<TMDBShow | null>(initialShow);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetail, setSeasonDetail] = useState<TMDBSeasonDetail | null>(null);
  const [isLoadingSeason, setIsLoadingSeason] = useState<boolean>(false);

  useEffect(() => {
    if (!initialShow) return;
    setShow(initialShow);
    fetchShowDetails(initialShow.id, initialShow.name).then((full) => {
      if (full) {
        setShow(full);
      }
    });
  }, [initialShow]);

  const trackedShow = useTrackerStore((state) =>
    show ? state.getTrackedShow(show.id) : undefined
  );
  const addOrUpdateShow = useTrackerStore((state) => state.addOrUpdateShow);
  const markSeasonWatched = useTrackerStore((state) => state.markSeasonWatched);
  const markEpisodeWatched = useTrackerStore((state) => state.markEpisodeWatched);
  const openCheckInModal = useCheckInStore((state) => state.openCheckInModal);
  const getShowStats = useCheckInStore((state) => state.getShowStats);

  useEffect(() => {
    if (!show) return;

    let isMounted = true;
    setIsLoadingSeason(true);

    fetchSeasonDetails(show.id, selectedSeasonNumber, show.name).then((data) => {
      if (isMounted) {
        setSeasonDetail(data);
        setIsLoadingSeason(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [show, selectedSeasonNumber]);

  if (!show) return null;

  const showStats = getShowStats(show.id);
  const seasons = show.seasons?.filter((s) => s.season_number > 0) || [
    { id: 1, season_number: 1, name: 'Season 1', episode_count: 8, air_date: null, overview: '', poster_path: null }
  ];

  const handleStartWatching = () => {
    triggerHaptic('success');
    addOrUpdateShow({
      tmdbShowId: show.id,
      showTitle: show.name,
      posterPath: show.poster_path || '',
      backdropPath: show.backdrop_path || '',
      status: 'watching',
      currentSeason: 1,
      currentEpisode: 0,
      totalEpisodesInShow: show.number_of_episodes || 10,
    });
  };

  const handlePlanToWatch = () => {
    triggerHaptic('light');
    addOrUpdateShow({
      tmdbShowId: show.id,
      showTitle: show.name,
      posterPath: show.poster_path || '',
      backdropPath: show.backdrop_path || '',
      status: 'plan_to_watch',
      currentSeason: 1,
      currentEpisode: 0,
      totalEpisodesInShow: show.number_of_episodes || 10,
    });
  };

  const handleMarkSeasonWatched = () => {
    triggerHaptic('success');
    const epCount = seasonDetail?.episodes.length || 10;
    markSeasonWatched(show.id, selectedSeasonNumber, epCount);
  };

  const handleCheckInEpisode = (ep: { episode_number: number; name: string }) => {
    openCheckInModal({
      tmdbShowId: show.id,
      showTitle: show.name,
      posterPath: show.poster_path || '',
      seasonNumber: selectedSeasonNumber,
      episodeNumber: ep.episode_number,
      episodeTitle: ep.name,
      isSeriesFinale:
        show.status === 'Ended' &&
        selectedSeasonNumber === (show.number_of_seasons || 1) &&
        ep.episode_number === (seasonDetail?.episodes.length || 1),
    });
  };

  const handleQuickWatchEpisode = (ep: { episode_number: number }) => {
    triggerHaptic('light');
    markEpisodeWatched(show.id, selectedSeasonNumber, ep.episode_number);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#05130d] border border-emerald-900/80 shadow-2xl flex flex-col no-scrollbar"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white hover:bg-black/90 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Backdrop Banner */}
          <div className="relative h-60 w-full flex-shrink-0">
            <img
              src={getTMDBImageUrl(show.backdrop_path || show.poster_path, 'w780')}
              alt={show.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05130d] via-[#05130d]/40 to-black/30" />

            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3.5">
              <img
                src={getTMDBImageUrl(show.poster_path, 'w300')}
                alt={show.name}
                className="w-20 h-28 rounded-xl object-cover border border-emerald-700/80 shadow-2xl flex-shrink-0"
              />
              <div className="flex-1 overflow-hidden">
                <h2 className="text-xl font-black text-white drop-shadow-md truncate">
                  {show.name}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-emerald-300/80">
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {show.vote_average ? show.vote_average.toFixed(1) : '8.5'}
                  </span>
                  <span>•</span>
                  <span>{show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'TV'}</span>
                  <span>•</span>
                  <span>{show.status || 'Active'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-5 flex-1">
            {/* Action Bar */}
            <div className="flex items-center gap-2">
              {trackedShow?.status === 'watching' ? (
                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                  <Check className="w-4 h-4" />
                  <span>Currently Watching</span>
                </div>
              ) : (
                <button
                  onClick={handleStartWatching}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-extrabold shadow-md shadow-emerald-500/25 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start Watching</span>
                </button>
              )}

              {trackedShow?.status !== 'plan_to_watch' && (
                <button
                  onClick={handlePlanToWatch}
                  className="py-2.5 px-3.5 rounded-xl bg-[#091e14] hover:bg-[#0f2e1f] border border-emerald-850 text-emerald-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Plan to Watch</span>
                </button>
              )}
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                Overview
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {show.overview || 'No synopsis available for this show.'}
              </p>
            </div>

            {/* Couch Commander Leaderboard for this Show */}
            <ShowLeaderboard stats={showStats} showTitle={show.name} />

            {/* Season & Episode Breakdown */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-200">
                    Episodes
                  </h4>
                </div>

                <button
                  onClick={handleMarkSeasonWatched}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 active:scale-95"
                >
                  Mark Season Watched
                </button>
              </div>

              {/* Season Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                {seasons.map((s) => (
                  <button
                    key={s.id || s.season_number}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedSeasonNumber(s.season_number);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedSeasonNumber === s.season_number
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-[#091e14] text-emerald-400/80 hover:text-emerald-200 border border-emerald-900/60'
                    }`}
                  >
                    Season {s.season_number}
                  </button>
                ))}
              </div>

              {/* Episodes List */}
              <div className="space-y-2 mt-2">
                {isLoadingSeason ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 rounded-xl bg-[#091e14]/60 animate-pulse border border-emerald-900/60" />
                    ))}
                  </div>
                ) : seasonDetail?.episodes && seasonDetail.episodes.length > 0 ? (
                  seasonDetail.episodes.map((ep) => {
                    const isWatched =
                      trackedShow &&
                      (trackedShow.currentSeason > selectedSeasonNumber ||
                        (trackedShow.currentSeason === selectedSeasonNumber &&
                          trackedShow.currentEpisode >= ep.episode_number));

                    return (
                      <div
                        key={ep.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isWatched
                            ? 'bg-[#091e14]/30 border-emerald-950/40 opacity-75'
                            : 'bg-[#091e14]/80 border-emerald-900/70 hover:border-emerald-600/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#0e2a1d] flex items-center justify-center font-black text-xs text-emerald-300 flex-shrink-0">
                            {ep.episode_number}
                          </div>

                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">
                              {ep.name}
                            </h5>
                            <p className="text-[10px] text-emerald-400/60">
                              {ep.runtime ? `${ep.runtime} min` : '50 min'} • {ep.air_date || 'Aired'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleQuickWatchEpisode(ep)}
                            className={`p-2 rounded-lg border transition-all ${
                              isWatched
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'bg-[#0e2a1d] border-emerald-850 text-emerald-300 hover:text-white'
                            }`}
                            title="Mark Watched"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleCheckInEpisode(ep)}
                            className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-[11px] font-black shadow-sm transition-all active:scale-95"
                          >
                            Check In
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-emerald-600/80 bg-[#091e14]/40 rounded-xl border border-emerald-900/50">
                    No episode list available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
