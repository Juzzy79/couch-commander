import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Sparkles } from 'lucide-react';
import { useCheckInStore } from '../../store/useCheckInStore';
import { triggerHaptic } from '../../lib/haptics';

export const CheckInFAB: React.FC = () => {
  const isBottomSheetOpen = useCheckInStore((state) => state.isBottomSheetOpen);
  const isQuickSelectorOpen = useCheckInStore((state) => state.isQuickSelectorOpen);
  const openQuickSelector = useCheckInStore((state) => state.openQuickSelector);

  const isVisible = !isBottomSheetOpen && !isQuickSelectorOpen;

  const handleClick = () => {
    triggerHaptic('medium');
    openQuickSelector();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-[68px] left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
        >
          <button
            onClick={handleClick}
            className="group relative flex items-center gap-2.5 py-2.5 px-5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs tracking-wide shadow-[0_4px_24px_rgba(16,185,129,0.5)] border border-emerald-300/40 active:scale-95 transition-all duration-200"
          >
            {/* Ambient pulsing ring */}
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-40 blur-sm group-hover:opacity-75 transition duration-300 animate-pulse pointer-events-none" />

            <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-black/15 text-black">
              <Tv className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            <span className="relative uppercase font-extrabold tracking-wider text-[11px] drop-shadow-sm">
              Check into a show
            </span>

            <Sparkles className="relative w-3.5 h-3.5 text-black/80 group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
