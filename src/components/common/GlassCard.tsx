import React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: 'forest' | 'gold' | 'violet' | 'cyan';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = false,
  glowColor = 'forest',
  ...props
}) => {
  const glowStyles = {
    forest: 'border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]',
    gold: 'border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]',
    violet: 'border-purple-500/40 shadow-[0_0_25px_rgba(139,92,246,0.2)]',
    cyan: 'border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.2)]',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-[#091e14]/80 backdrop-blur-xl border border-emerald-900/40 transition-all duration-300 shadow-lg shadow-black/40',
        glow && glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
