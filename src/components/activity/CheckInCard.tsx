import React, { useState } from 'react';
import { Heart, Share2, Eye, EyeOff, Crown } from 'lucide-react';
import { CheckIn } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { getTMDBImageUrl, formatTimeAgo } from '../../lib/utils';
import { useCheckInStore } from '../../store/useCheckInStore';
import { useAuthStore } from '../../store/useAuthStore';

interface CheckInCardProps {
  checkIn: CheckIn;
  onOpenShareModal: (checkIn: CheckIn) => void;
  onSelectShow?: (showId: number) => void;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({
  checkIn,
  onOpenShareModal,
  onSelectShow,
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(!checkIn.isSpoiler);
  const toggleLikeCheckIn = useCheckInStore((state) => state.toggleLikeCheckIn);
  const showStats = useCheckInStore((state) => state.showStats[checkIn.tmdbShowId]);
  const currentUserId = useAuthStore((state) => state.user?.userId);

  const hasLiked = currentUserId && checkIn.likedBy?.includes(currentUserId);
  const isCommander = showStats?.couchCommander?.userId === checkIn.userId;

  return (
    <GlassCard className="p-4 mb-4 hover:border-zinc-700/80 transition-all">
      {/* Author & Timestamp Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={checkIn.userAvatar}
              alt={checkIn.userName}
              className="w-10 h-10 rounded-full object-cover border border-zinc-700"
            />
            {isCommander && (
              <div
                title="Couch Commander of this show"
                className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-black shadow-md shadow-amber-500/50"
              >
                <Crown className="w-3 h-3 fill-black" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white">
                {checkIn.userName}
              </h4>
              {isCommander && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  👑 Commander
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">
              {formatTimeAgo(checkIn.timestamp)}
            </p>
          </div>
        </div>
      </div>

      {/* Show & Episode Details Pill */}
      <div
        onClick={() => onSelectShow && onSelectShow(checkIn.tmdbShowId)}
        className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 mb-3 cursor-pointer hover:border-amber-500/40 transition-colors group"
      >
        <img
          src={getTMDBImageUrl(checkIn.posterPath, 'w200')}
          alt={checkIn.showTitle}
          className="w-10 h-14 rounded-lg object-cover border border-zinc-700/60 group-hover:scale-105 transition-transform"
        />

        <div className="min-w-0 flex-1">
          <h5 className="text-xs font-extrabold text-white group-hover:text-amber-400 transition-colors truncate">
            {checkIn.showTitle}
          </h5>
          <div className="text-[11px] font-bold text-amber-300/90 mt-0.5">
            Season {checkIn.seasonNumber}, Episode {checkIn.episodeNumber}
          </div>
          <p className="text-[10px] text-zinc-400 truncate">
            "{checkIn.episodeTitle}"
          </p>
        </div>
      </div>

      {/* Comment / Reaction with Spoiler Blur */}
      {checkIn.comment && (
        <div className="relative mb-3">
          {checkIn.isSpoiler && !isRevealed ? (
            <div
              onClick={() => setIsRevealed(true)}
              className="relative p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-center cursor-pointer group hover:bg-rose-950/30 transition-all"
            >
              <div className="filter blur-md select-none text-xs text-zinc-400 pointer-events-none">
                {checkIn.comment}
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-rose-300 text-xs font-bold bg-zinc-950/60 rounded-xl backdrop-blur-sm">
                <Eye className="w-4 h-4 text-rose-400" />
                <span>Spoiler Alert • Tap to Reveal</span>
              </div>
            </div>
          ) : (
            <div className="relative p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed">
              <p>{checkIn.comment}</p>
              {checkIn.isSpoiler && (
                <button
                  onClick={() => setIsRevealed(false)}
                  className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300"
                  title="Hide spoiler"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Actions (Like & Share) */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-xs">
        <button
          onClick={() => toggleLikeCheckIn(checkIn.id)}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
            hasLiked
              ? 'text-rose-400 bg-rose-500/10'
              : 'text-zinc-400 hover:text-rose-400'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              hasLiked ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
          <span className="font-bold">{checkIn.likesCount || 0}</span>
        </button>

        <button
          onClick={() => onOpenShareModal(checkIn)}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="font-semibold text-[11px]">Share</span>
        </button>
      </div>
    </GlassCard>
  );
};
