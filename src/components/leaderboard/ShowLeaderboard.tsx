import React from 'react';
import { Crown, Medal, Award, Flame } from 'lucide-react';
import { ShowStats } from '../../types';
import { GlassCard } from '../common/GlassCard';

interface ShowLeaderboardProps {
  stats: ShowStats;
  showTitle: string;
}

export const ShowLeaderboard: React.FC<ShowLeaderboardProps> = ({ stats, showTitle }) => {
  const commander = stats.couchCommander;
  const contender = stats.remoteContender;
  const runner = stats.snackRunner;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Couch Commander Rankings
          </h4>
        </div>
        <span className="text-[10px] text-emerald-400/70 font-medium">30-Day Rolling</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {/* Rank 1: Couch Commander */}
        {commander ? (
          <GlassCard
            glow={true}
            glowColor="forest"
            className="p-3 border-emerald-500/50 bg-gradient-to-r from-[#0d3322] via-[#091e14] to-[#05130d]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shadow-amber-500/30">
                    <img
                      src={commander.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={commander.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-amber-500 text-black shadow">
                    <Crown className="w-3 h-3 fill-black" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-sm font-extrabold text-white">
                      {commander.userName}
                    </h5>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-sm">
                      #1 Commander
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80">
                    Top watcher of {showTitle}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-black text-emerald-400 flex items-center gap-0.5 justify-end">
                  <Flame className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                  <span>{commander.count}</span>
                </div>
                <span className="text-[10px] text-emerald-400/60 font-medium">check-ins</span>
              </div>
            </div>
          </GlassCard>
        ) : (
          <div className="p-3 text-center rounded-xl bg-[#091e14]/60 border border-emerald-900/60 text-xs text-emerald-400/70">
            No Couch Commander crowned yet. Be the first to check in!
          </div>
        )}

        {/* Rank 2 & 3 */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          {/* Rank 2 */}
          <div className="p-2.5 rounded-xl bg-[#091e14]/70 border border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#0e2a1d] text-emerald-300">
                <Medal className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] uppercase font-bold text-emerald-400/70">
                  #2 Contender
                </div>
                <div className="text-xs font-bold text-zinc-200 truncate max-w-[85px]">
                  {contender ? contender.userName : 'Open'}
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-300">
              {contender ? `${contender.count} eps` : '0'}
            </div>
          </div>

          {/* Rank 3 */}
          <div className="p-2.5 rounded-xl bg-[#091e14]/70 border border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#0e2a1d] text-amber-500">
                <Award className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] uppercase font-bold text-emerald-400/70">
                  #3 Snack Runner
                </div>
                <div className="text-xs font-bold text-zinc-200 truncate max-w-[85px]">
                  {runner ? runner.userName : 'Open'}
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-300">
              {runner ? `${runner.count} eps` : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
