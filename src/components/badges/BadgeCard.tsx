import React from 'react';
import {
  Radio,
  Flame,
  Moon,
  Sparkles,
  Trophy,
  Crown,
  Armchair,
  CheckCircle2,
  Rocket,
  ShieldAlert,
  Zap,
  Medal,
  Award,
  Lock,
} from 'lucide-react';
import { BadgeDefinition } from '../../types';
import { GlassCard } from '../common/GlassCard';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Radio,
  Flame,
  Moon,
  Sparkles,
  Trophy,
  Crown,
  Armchair,
  CheckCircle2,
  Rocket,
  ShieldAlert,
  Zap,
  Medal,
};

interface BadgeCardProps {
  badge: BadgeDefinition;
  isUnlocked?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  isUnlocked = false,
  onClick,
  size = 'md',
}) => {
  const IconComponent = ICON_MAP[badge.icon] || Award;

  const sizeClasses = {
    sm: 'w-20 h-24 p-2',
    md: 'w-full aspect-[4/5] p-3.5',
    lg: 'w-36 h-44 p-4',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer select-none transition-transform duration-300 active:scale-95 ${
        !isUnlocked ? 'opacity-50 grayscale hover:grayscale-0' : ''
      }`}
    >
      <GlassCard
        className={`flex flex-col items-center justify-between text-center ${
          sizeClasses[size]
        } ${
          isUnlocked
            ? 'border-purple-500/30 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]'
            : 'border-zinc-800/60 bg-zinc-950/60'
        }`}
      >
        {/* GetGlue Holographic Badge Sticker */}
        <div className="relative mt-1">
          <div
            className={`flex items-center justify-center rounded-2xl p-3 bg-gradient-to-br ${badge.gradient} shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105`}
          >
            <IconComponent className={`${iconSizes[size]} text-white drop-shadow-md`} />
          </div>

          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-[2px]">
              <Lock className="w-4 h-4 text-zinc-300" />
            </div>
          )}
        </div>

        {/* Badge Title & Rarity */}
        <div className="w-full mt-2">
          <h4 className="text-xs font-bold text-zinc-100 truncate px-0.5">
            {badge.title}
          </h4>
          <span
            className={`inline-block mt-0.5 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-md ${
              badge.rarity === 'legendary'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : badge.rarity === 'epic'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : badge.rarity === 'rare'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {badge.rarity}
          </span>
        </div>
      </GlassCard>
    </div>
  );
};
