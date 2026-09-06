import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tv, ShieldAlert, Sparkles, Send, Check } from 'lucide-react';
import { useCheckInStore } from '../../store/useCheckInStore';
import { triggerHaptic } from '../../lib/haptics';

export const CheckInBottomSheet: React.FC = () => {
  const isBottomSheetOpen = useCheckInStore((state) => state.isBottomSheetOpen);
  const activeTarget = useCheckInStore((state) => state.activeTarget);
  const closeCheckInModal = useCheckInStore((state) => state.closeCheckInModal);
  const submitCheckIn = useCheckInStore((state) => state.submitCheckIn);

  const [comment, setComment] = useState<string>('');
  const [isSpoiler, setIsSpoiler] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isBottomSheetOpen || !activeTarget) return null;

  const charCount = comment.length;
  const maxChars = 140;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitCheckIn(comment, isSpoiler);
      setComment('');
      setIsSpoiler(false);
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{ zIndex: 9999 }}
        className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 backdrop-blur-md"
      >
        {/* Backdrop dismiss */}
        <div
          onClick={closeCheckInModal}
          className="absolute inset-0 bg-transparent"
        />

        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 200 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80) {
              triggerHaptic('light');
              closeCheckInModal();
            }
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-t-3xl bg-[#05130d] border-t border-x border-emerald-900/80 p-5 shadow-2xl flex flex-col z-10"
        >
          {/* Swipe indicator bar */}
          <div className="w-12 h-1.5 rounded-full bg-emerald-800/60 mx-auto mb-4 -mt-1 cursor-grab active:cursor-grabbing" />

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Live Check-In</span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                {activeTarget.showTitle}
              </h3>
              <p className="text-xs text-emerald-300/80 font-medium flex items-center gap-1 mt-0.5">
                <Tv className="w-3.5 h-3.5 text-emerald-500" />
                <span>Season {activeTarget.seasonNumber}, Episode {activeTarget.episodeNumber}</span>
                <span className="text-emerald-700">•</span>
                <span className="text-emerald-300 font-semibold truncate max-w-[180px]">
                  "{activeTarget.episodeTitle}"
                </span>
              </p>
            </div>

            <button
              onClick={closeCheckInModal}
              className="p-2 rounded-full bg-[#091e14] border border-emerald-900/70 text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Comment Input */}
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setComment(e.target.value);
                  }
                }}
                rows={3}
                placeholder="What's your quick reaction? (Optional, 140 chars max)"
                className="w-full p-3.5 rounded-2xl bg-[#091e14]/90 border border-emerald-900/80 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none shadow-inner"
              />
              <div className="absolute bottom-2.5 right-3 text-[10px] font-bold text-emerald-600">
                <span className={charCount > 120 ? 'text-amber-400' : ''}>
                  {charCount}
                </span>
                /{maxChars}
              </div>
            </div>

            {/* Spoiler Guard Toggle */}
            <div
              onClick={() => {
                triggerHaptic('light');
                setIsSpoiler(!isSpoiler);
              }}
              className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                isSpoiler
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : 'bg-[#091e14]/60 border-emerald-900/60 text-emerald-300/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-xl ${
                    isSpoiler ? 'bg-rose-500 text-white' : 'bg-[#0e2a1d] text-emerald-400'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Contains Spoilers</h4>
                  <p className="text-[10px] text-zinc-400">
                    Blur reaction in the feed until tapped
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isSpoiler
                    ? 'bg-rose-500 border-rose-400 text-white'
                    : 'border-emerald-800 bg-[#0e2a1d]'
                }`}
              >
                {isSpoiler && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Check-In Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-xl shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Logging Check-In...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 fill-black" />
                  <span>Log Check-In & Claim Title</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
