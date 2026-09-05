import React, { useState } from 'react';
import { Search, UserPlus, Check, X, Share2, Copy, Users, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { searchUsers, createMutualFriendship } from '../../lib/firestoreService';
import { triggerHaptic } from '../../lib/haptics';
import { UserProfile } from '../../types';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded?: () => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose, onFriendAdded }) => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    triggerHaptic('light');

    const users = await searchUsers(query.trim());
    // Filter out oneself
    setResults(users.filter((u) => u.userId !== user.userId));
    setIsSearching(false);
  };

  const handleAddFriend = async (targetUser: UserProfile) => {
    triggerHaptic('medium');
    const success = await createMutualFriendship(user.userId, targetUser.userId);
    if (success) {
      setAddedIds((prev) => [...prev, targetUser.userId]);
      const currentFriends = user.friends || [];
      if (!currentFriends.includes(targetUser.userId)) {
        updateUser({ friends: [...currentFriends, targetUser.userId] });
      }
      triggerHaptic('success');
      if (onFriendAdded) onFriendAdded();
    }
  };

  const inviteUrl = `${window.location.origin}?invite=${encodeURIComponent(user.userId)}&name=${encodeURIComponent(user.displayName)}`;

  const handleCopyLink = async () => {
    triggerHaptic('light');
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    triggerHaptic('medium');
    const shareData = {
      title: `${user.displayName}'s Couch Commander Invite`,
      text: `📺 Connect with me on Couch Commander to track TV and see what we are watching! Tap here:`,
      url: inviteUrl,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // ignore
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#071d13] border-t sm:border border-emerald-500/40 p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Find & Add Friends</h3>
              <p className="text-[10px] text-emerald-400/80">Connect accounts to share viewing streaks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-emerald-950/60 text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invite Link Card */}
        <div className="my-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-2">
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Your Personal Invite Link</div>
            <div className="text-xs font-mono text-emerald-200/70 truncate">{inviteUrl}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-[#0e2a1d] hover:bg-[#153e2a] border border-emerald-700 text-emerald-300 text-xs font-bold"
              title="Copy Link"
            >
              {copiedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleNativeShare}
              className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mb-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username (e.g. justin_atwell) or name..."
              className="w-full pl-9 pr-20 py-2.5 rounded-2xl bg-[#04110b] border border-emerald-700 text-xs text-white placeholder:text-emerald-700 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-xs transition-all"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-[140px] pr-1">
          {isSearching ? (
            <div className="py-8 text-center text-xs text-emerald-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching commanders...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((res) => {
              const isAlreadyFriend = (user.friends || []).includes(res.userId) || addedIds.includes(res.userId);
              return (
                <div
                  key={res.userId}
                  className="p-3 rounded-2xl bg-[#0a2317] border border-emerald-900/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={res.avatarUrl}
                      alt={res.displayName}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-black text-white truncate">{res.displayName}</h4>
                      <p className="text-[10px] font-mono text-emerald-400 truncate">@{res.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddFriend(res)}
                    disabled={isAlreadyFriend}
                    className={`shrink-0 py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      isAlreadyFriend
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md shadow-emerald-500/20 active:scale-95'
                    }`}
                  >
                    {isAlreadyFriend ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Friend</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : query ? (
            <div className="py-8 text-center">
              <p className="text-xs text-emerald-400/80">No commanders found for "{query}".</p>
              <p className="text-[10px] text-emerald-600 mt-1">
                Tip: Share your personal invite link above directly to connect in 1 tap!
              </p>
            </div>
          ) : (
            <div className="py-6 text-center text-[11px] text-emerald-600">
              Type a username or share your invite link to build your Friends Circle.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
