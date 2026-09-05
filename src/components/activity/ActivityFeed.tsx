import { useState } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { CheckIn } from '../../types';
import { TMDBShow } from '../../types/tmdb';
import { useCheckInStore } from '../../store/useCheckInStore';
import { fetchShowDetails } from '../../lib/tmdb';
import { CheckInCard } from './CheckInCard';
import { ShareCardModal } from './ShareCardModal';
import { ShowDetailModal } from '../search/ShowDetailModal';

export const ActivityFeed: React.FC = () => {
  const feed = useCheckInStore((state) => state.feed);
  const [selectedShareCheckIn, setSelectedShareCheckIn] = useState<CheckIn | null>(null);
  const [selectedShow, setSelectedShow] = useState<TMDBShow | null>(null);

  const handleSelectShow = async (showId: number) => {
    const show = await fetchShowDetails(showId);
    if (show) {
      setSelectedShow(show);
    }
  };

  return (
    <div className="pb-32 pt-2">
      {/* Feed Filters & Controls */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Activity Feed
            </h2>
            <p className="text-[10px] text-emerald-300/80">
              Live TV check-ins & reactions
            </p>
          </div>
        </div>

        {feed.length > 0 && (
          <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
            {feed.length} check-ins
          </span>
        )}
      </div>

      {/* Feed List */}
      <div className="px-4">
        {feed.length > 0 ? (
          feed.map((item) => (
            <CheckInCard
              key={item.id}
              checkIn={item}
              onOpenShareModal={setSelectedShareCheckIn}
              onSelectShow={handleSelectShow}
            />
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-[#091e14]/50 border border-emerald-900/40 text-center">
            <MessageSquare className="w-10 h-10 mx-auto text-emerald-700/80 mb-3" />
            <h3 className="text-sm font-bold text-emerald-200">No Check-Ins Yet</h3>
            <p className="text-xs text-emerald-400/70 max-w-xs mx-auto mt-1 mb-4">
              Your social feed is clean! When you or your friends check into an episode, your live reactions and stickers will stream here.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedShareCheckIn && (
        <ShareCardModal
          checkIn={selectedShareCheckIn}
          onClose={() => setSelectedShareCheckIn(null)}
        />
      )}

      {selectedShow && (
        <ShowDetailModal
          show={selectedShow}
          onClose={() => setSelectedShow(null)}
        />
      )}
    </div>
  );
};
