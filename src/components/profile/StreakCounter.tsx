import React from 'react';
import { Flame, Zap, Calendar, Sparkles } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useAuthStore } from '../../store/useAuthStore';
import { useCheckInStore } from '../../store/useCheckInStore';

export const StreakCounter: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const feed = useCheckInStore((state) => state.feed);

  const userCheckIns12h = feed.filter(
    (c) =>
      user &&
      c.userId === user.userId &&
      Date.now() - c.timestamp < 1000 * 60 * 60 * 12
  ).length;

  const isBingeActive = userCheckIns12h >= 3;

  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      {/* Daily Viewing Streak */}
      <GlassCard
        glow={true}
        glowColor="forest"
        className="p-3.5 bg-gradient-to-br from-[#0d3322] via-[#091e14] to-[#05130d] border-emerald-500/40"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Flame className="w-5 h-5 fill-emerald-500 text-emerald-400 animate-bounce" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
            Active
          </span>
        </div>

        <div className="text-2xl font-black text-white">
          {user?.dailyStreak || 1} <span className="text-sm font-bold text-emerald-400">Days</span>
        </div>
        <p className="text-[10px] text-emerald-300/80 mt-0.5 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-emerald-600" />
          <span>Daily Viewing Streak</span>
        </p>
      </GlassCard>

      {/* Binge Frenzy Tracker */}
      <GlassCard
        glow={isBingeActive}
        glowColor="violet"
        className={`p-3.5 bg-gradient-to-br transition-all ${
          isBingeActive
            ? 'from-purple-950/40 via-[#091e14] to-[#05130d] border-purple-500/40'
            : 'from-[#091e14] to-[#05130d] border-emerald-900/60'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div
            className={`p-2 rounded-xl ${
              isBingeActive ? 'bg-purple-500/20 text-purple-400' : 'bg-[#0e2a1d] text-emerald-400'
            }`}
          >
            <Zap className={`w-5 h-5 ${isBingeActive ? 'fill-purple-400' : ''}`} />
          </div>
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
              isBingeActive
                ? 'text-purple-300 bg-purple-500/10 border-purple-500/30'
                : 'text-emerald-500 bg-[#0e2a1d]/60 border-emerald-900/60'
            }`}
          >
            {isBingeActive ? 'Binge Mode 🔥' : '12h Window'}
          </span>
        </div>

        <div className="text-2xl font-black text-white">
          {userCheckIns12h} <span className="text-sm font-bold text-teal-400">/ 3 Eps</span>
        </div>
        <p className="text-[10px] text-emerald-300/80 mt-0.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Binge Streak Status</span>
        </p>
      </GlassCard>
    </div>
  );
};
