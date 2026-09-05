import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Share2, Copy, Check } from 'lucide-react';
import { CheckIn } from '../../types';
import { getTMDBImageUrl } from '../../lib/utils';
import { shareCheckIn } from '../../lib/share';
import { triggerHaptic } from '../../lib/haptics';

interface ShareCardModalProps {
  checkIn: CheckIn | null;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ checkIn, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!checkIn) return null;

  const handleShare = async () => {
    triggerHaptic('medium');
    const success = await shareCheckIn(checkIn);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 mb-4 text-center">
            Share Check-In
          </h3>

          {/* Holographic GetGlue Style Card Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-amber-500/40 p-4 shadow-xl mb-5">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase">
                <Crown className="w-3 h-3 fill-black" />
                <span>Couch Commander Check-In</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">tvtag / PWA</span>
            </div>

            {/* Poster & Show Info */}
            <div className="flex gap-3 items-center mb-3">
              <img
                src={getTMDBImageUrl(checkIn.posterPath, 'w200')}
                alt={checkIn.showTitle}
                className="w-16 h-24 rounded-xl object-cover border border-zinc-700 shadow-md flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-base font-extrabold text-white truncate">
                  {checkIn.showTitle}
                </h4>
                <p className="text-xs text-amber-300 font-bold">
                  Season {checkIn.seasonNumber} • Episode {checkIn.episodeNumber}
                </p>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  "{checkIn.episodeTitle}"
                </p>
              </div>
            </div>

            {/* User Reaction Quote */}
            {checkIn.comment && (
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 italic">
                "{checkIn.comment}"
              </div>
            )}

            {/* User Footer */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-800/80">
              <img
                src={checkIn.userAvatar}
                alt={checkIn.userName}
                className="w-6 h-6 rounded-full object-cover border border-amber-400"
              />
              <span className="text-xs font-bold text-zinc-300">{checkIn.userName}</span>
            </div>
          </div>

          {/* Share Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Link!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Sheet</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
