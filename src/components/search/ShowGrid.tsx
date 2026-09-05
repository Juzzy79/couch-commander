import React from 'react';
import { Star } from 'lucide-react';
import { TMDBShow } from '../../types/tmdb';
import { getTMDBImageUrl } from '../../lib/utils';
import { GlassCard } from '../common/GlassCard';

interface ShowGridProps {
  shows: TMDBShow[];
  onSelectShow: (show: TMDBShow) => void;
  isLoading?: boolean;
}

export const ShowGrid: React.FC<ShowGridProps> = ({ shows, onSelectShow, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-[#091e14]/60 border border-emerald-900/60 animate-pulse h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {shows.map((show) => {
        const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : '';

        return (
          <GlassCard
            key={show.id}
            onClick={() => onSelectShow(show)}
            className="group cursor-pointer p-0 overflow-hidden hover:border-emerald-500/50 transition-all duration-300 active:scale-[0.98]"
          >
            {/* Poster Image */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#030c08]">
              <img
                src={getTMDBImageUrl(show.poster_path, 'w500')}
                alt={show.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#091e14] via-[#091e14]/20 to-transparent" />

              {/* Vote Score Pill */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-bold text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{show.vote_average ? show.vote_average.toFixed(1) : 'N/A'}</span>
              </div>
            </div>

            {/* Title & Info */}
            <div className="p-2.5">
              <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                {show.name}
              </h4>
              <p className="text-[11px] text-emerald-300/70 mt-0.5 flex items-center justify-between">
                <span>{year || 'TV'}</span>
                {show.number_of_seasons && (
                  <span>{show.number_of_seasons} {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}</span>
                )}
              </p>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
