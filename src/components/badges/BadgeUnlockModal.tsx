import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Share2 } from 'lucide-react';
import { useBadgeStore } from '../../store/useBadgeStore';
import { BadgeCard } from './BadgeCard';
import { ConfettiBurst } from '../common/ConfettiBurst';

export const BadgeUnlockModal: React.FC = () => {
  const isUnlockModalOpen = useBadgeStore((state) => state.isUnlockModalOpen);
  const badge = useBadgeStore((state) => state.recentlyUnlockedBadge);
  const closeUnlockModal = useBadgeStore((state) => state.closeUnlockModal);

  if (!isUnlockModalOpen || !badge) return null;

  const handleShareBadge = () => {
    if (navigator.share) {
      navigator.share({
        title: `I unlocked the "${badge.title}" badge on Couch Commander!`,
        text: `🏅 Just unlocked the "${badge.title}" badge (${badge.description}) on Couch Commander!`,
        url: window.location.origin,
      }).catch(() => {});
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <ConfettiBurst trigger={true} />

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-zinc-900 border border-amber-500/50 p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.3)]"
        >
          {/* Close button */}
          <button
            onClick={closeUnlockModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Glowing Header */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Badge Unlocked!</span>
          </div>

          {/* Badge Display */}
          <div className="flex justify-center my-3">
            <div className="scale-125 transition-transform">
              <BadgeCard badge={badge} isUnlocked={true} size="lg" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white mt-5">
            {badge.title}
          </h3>
          <p className="text-sm text-zinc-300 mt-2 px-2 leading-relaxed">
            {badge.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleShareBadge}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-semibold transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4 text-violet-400" />
              <span>Share</span>
            </button>

            <button
              onClick={closeUnlockModal}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-sm font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              Collect
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
