import React from 'react';
import { Check, MessageSquarePlus, Crown, Tv, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { TrackedShow } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { getTMDBImageUrl } from '../../lib/utils';
import { useCheckInStore } from '../../store/useCheckInStore';
import { useTrackerStore } from '../../store/useTrackerStore';
import { useAuthStore } from '../../store/useAuthStore';

interface UpNextCardProps {
  show: TrackedShow;
  onOpenDetails: (show: TrackedShow) => void;
}

export const UpNextCard: React.FC<UpNextCardProps> = ({ show, onOpenDetails }) => {
  const openCheckInModal = useCheckInStore((state) => state.openCheckInModal);
  const quickWatch = useCheckInStore((state) => state.quickWatch);
  const showStats = useCheckInStore((state) => state.showStats[show.tmdbShowId]);
  const currentUserId = useAuthStore((state) => state.user?.userId);

  const nextEp = show.nextEpisodeToWatch || {
    seasonNumber: show.currentSeason,
    episodeNumber: show.currentEpisode + 1,
    title: `Episode ${show.currentEpisode + 1}`,
  };

  const isCommander = showStats?.couchCommander?.userId === currentUserId;
  const userCount = (currentUserId && showStats?.userCheckInCounts?.[currentUserId]) || 0;

  const addOrUpdateShow = useTrackerStore((state) => state.addOrUpdateShow);

  const isCompleted = show.status === 'completed';

  const handleRestartWatching = (e: React.MouseEvent) => {
    e.stopPropagation();
    addOrUpdateShow({
      tmdbShowId: show.tmdbShowId,
      showTitle: show.showTitle,
      posterPath: show.posterPath,
      backdropPath: show.backdropPath,
      status: 'watching',
      currentSeason: 1,
      currentEpisode: 0,
      totalEpisodesInShow: show.totalEpisodesInShow || 10,
      nextEpisodeToWatch: {
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Episode 1',
      },
    });
  };

  const handleCheckInClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCheckInModal({
      tmdbShowId: show.tmdbShowId,
      showTitle: show.showTitle,
      posterPath: show.posterPath,
      seasonNumber: nextEp.seasonNumber,
      episodeNumber: nextEp.episodeNumber,
      episodeTitle: nextEp.title,
    });
  };

  const handleQuickWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    quickWatch({
      tmdbShowId: show.tmdbShowId,
      showTitle: show.showTitle,
      posterPath: show.posterPath,
      seasonNumber: nextEp.seasonNumber,
      episodeNumber: nextEp.episodeNumber,
      episodeTitle: nextEp.title,
    });
  };

  const progressPercent = show.totalEpisodesInShow
    ? Math.min(100, Math.round((show.totalEpisodesWatched / show.totalEpisodesInShow) * 100))
    : 35;

  return (
    <GlassCard
      onClick={() => onOpenDetails(show)}
      className="p-4 cursor-pointer hover:border-emerald-500/50 transition-all active:scale-[0.99] group mb-4"
    >
      {/* Card Header with Backdrop Banner */}
      <div className="relative -mx-4 -mt-4 mb-3 h-28 overflow-hidden rounded-t-2xl">
        <img
          src={getTMDBImageUrl(show.backdropPath || show.posterPath, 'w780')}
          alt={show.showTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091e14] via-[#091e14]/60 to-transparent" />

        {/* Couch Commander Badge Indicator */}
        <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
          {isCommander ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-[11px] shadow-lg shadow-amber-500/40">
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>Couch Commander</span>
            </div>
          ) : showStats?.couchCommander ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#05130d]/85 backdrop-blur-md border border-emerald-700/60 text-emerald-200 text-[10px] font-semibold">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>Leader: {showStats.couchCommander.userName} ({showStats.couchCommander.count})</span>
            </div>
          ) : null}
        </div>

        {/* Show Title & Progress Pill */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white drop-shadow-md flex items-center gap-1.5">
              <span>{show.showTitle}</span>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-emerald-200/90 font-medium">
              Watched: S{show.currentSeason}E{show.currentEpisode} ({show.totalEpisodesWatched} eps)
            </p>
          </div>

          {userCount > 0 && (
            <div className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
              {userCount} in 30d
            </div>
          )}
        </div>
      </div>

      {/* Queued Next Episode or Completed Banner */}
      {isCompleted ? (
        <div className="bg-[#051a13]/90 border border-teal-700/60 rounded-xl p-3 mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-teal-300 uppercase tracking-wider">
                Show Completed
              </h4>
              <p className="text-[11px] text-teal-200/70">
                You've watched all available episodes!
              </p>
            </div>
          </div>
          <button
            onClick={handleRestartWatching}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#0e2a1d] hover:bg-[#153e2a] border border-emerald-700/70 text-emerald-300 text-xs font-bold transition-all active:scale-95"
            title="Start from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rewatch</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#05130d]/90 border border-emerald-900/60 rounded-xl p-3 mb-3.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Tv className="w-3.5 h-3.5" />
              <span>Up Next: S{nextEp.seasonNumber}E{nextEp.episodeNumber}</span>
            </div>
            {nextEp.airDate && (
              <span className="text-[10px] text-emerald-400/70">{nextEp.airDate}</span>
            )}
          </div>
          
          <h4 className="text-sm font-semibold text-zinc-100 line-clamp-1">
            {nextEp.title}
          </h4>

          {nextEp.overview && (
            <p className="text-xs text-emerald-300/70 line-clamp-2 mt-1 leading-relaxed">
              {nextEp.overview}
            </p>
          )}
        </div>
      )}

      {/* Progress Bar with Emerald to Teal Gradient */}
      <div className="w-full bg-emerald-950/80 rounded-full h-1.5 mb-3.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Action Buttons */}
      {isCompleted ? (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleRestartWatching}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0e2a1d] hover:bg-[#153e2a] border border-emerald-800/70 text-emerald-200 text-xs font-bold transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Watch Again</span>
          </button>

          <button
            onClick={() => onOpenDetails(show)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black shadow-md shadow-teal-500/25 transition-all active:scale-95"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>View Show</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleQuickWatch}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0e2a1d] hover:bg-[#153e2a] border border-emerald-800/70 text-emerald-200 text-xs font-bold transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick Watched</span>
          </button>

          <button
            onClick={handleCheckInClick}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black shadow-md shadow-emerald-500/25 transition-all active:scale-95"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Check In Live</span>
          </button>
        </div>
      )}
    </GlassCard>
  );
};
