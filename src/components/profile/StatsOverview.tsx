import React from 'react';
import { Tv, Crown, Award, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useTrackerStore } from '../../store/useTrackerStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCheckInStore } from '../../store/useCheckInStore';

export const StatsOverview: React.FC = () => {
  const trackedShows = useTrackerStore((state) => state.trackedShows);
  const user = useAuthStore((state) => state.user);
  const showStats = useCheckInStore((state) => state.showStats);

  const totalWatchedEpisodes = trackedShows.reduce(
    (acc, s) => acc + (s.totalEpisodesWatched || 0),
    0
  );

  const commanderCrownsCount = Object.values(showStats).filter(
    (s) => user && s.couchCommander?.userId === user.userId
  ).length;

  const unlockedBadgesCount = user?.badges.length || 0;

  const stats = [
    {
      label: 'Shows Tracked',
      value: trackedShows.length,
      icon: Tv,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/30',
    },
    {
      label: 'Episodes Watched',
      value: totalWatchedEpisodes,
      icon: CheckCircle2,
      color: 'text-teal-400',
      bg: 'bg-teal-500/15 border-teal-500/30',
    },
    {
      label: 'Commander Crowns',
      value: commanderCrownsCount,
      icon: Crown,
      color: 'text-amber-400',
      bg: 'bg-amber-500/15 border-amber-500/30',
    },
    {
      label: 'Badges Collected',
      value: unlockedBadgesCount,
      icon: Award,
      color: 'text-purple-400',
      bg: 'bg-purple-500/15 border-purple-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
      {stats.map((item, i) => {
        const Icon = item.icon;
        return (
          <GlassCard key={i} className="p-3 bg-[#091e14]/70 border-emerald-900/60">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg border ${item.bg} ${item.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-emerald-300/70 font-bold uppercase tracking-wider truncate">
                {item.label}
              </span>
            </div>
            <div className="text-xl font-black text-white px-0.5">
              {item.value}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
