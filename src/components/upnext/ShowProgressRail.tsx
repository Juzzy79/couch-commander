import React from 'react';
import { Crown, Plus } from 'lucide-react';
import { TrackedShow } from '../../types';
import { getTMDBImageUrl } from '../../lib/utils';
import { useCheckInStore } from '../../store/useCheckInStore';
import { useAuthStore } from '../../store/useAuthStore';

interface ShowProgressRailProps {
  shows: TrackedShow[];
  onSelectShow: (show: TrackedShow) => void;
  onExploreClick: () => void;
}

export const ShowProgressRail: React.FC<ShowProgressRailProps> = ({
  shows,
  onSelectShow,
  onExploreClick,
}) => {
  const showStats = useCheckInStore((state) => state.showStats);
  const currentUserId = useAuthStore((state) => state.user?.userId);

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-3 px-1 min-w-max">
        {/* Explore / Add More Button */}
        <button
          onClick={onExploreClick}
          className="flex flex-col items-center justify-center w-16 h-24 rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-amber-500/80 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-400 hover:text-amber-400 transition-all active:scale-95 group"
        >
          <div className="p-2 rounded-full bg-zinc-800 group-hover:bg-amber-500/20 text-zinc-300 group-hover:text-amber-400 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-1">Discover</span>
        </button>

        {/* Active Shows Thumbnails */}
        {shows.map((show) => {
          const stats = showStats[show.tmdbShowId];
          const isCommander = stats?.couchCommander?.userId === currentUserId;

          return (
            <div
              key={show.tmdbShowId}
              onClick={() => onSelectShow(show)}
              className="relative flex flex-col items-center w-16 cursor-pointer group active:scale-95 transition-transform"
            >
              {/* Show Poster Thumbnail */}
              <div className="relative w-16 h-24 rounded-2xl overflow-hidden border border-zinc-700/80 group-hover:border-amber-400/80 transition-colors shadow-md">
                <img
                  src={getTMDBImageUrl(show.posterPath, 'w200')}
                  alt={show.showTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Couch Commander Crown badge */}
                {isCommander && (
                  <div className="absolute top-1 right-1 p-1 rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/50">
                    <Crown className="w-3 h-3 fill-black" />
                  </div>
                )}

                {/* Season & Episode Badge */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-3 pb-1 px-1 text-center">
                  <span className="text-[9px] font-black text-amber-300 tracking-wider">
                    S{show.currentSeason} E{show.currentEpisode}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-medium text-zinc-300 truncate w-full text-center mt-1">
                {show.showTitle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
