import React, { useState, useEffect } from 'react';
import { Users, Check, X, LogIn, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchUserProfileFromFirestore, createMutualFriendship } from '../../lib/firestoreService';
import { ConfettiBurst } from '../common/ConfettiBurst';
import { triggerHaptic } from '../../lib/haptics';
import { UserProfile } from '../../types';

export const FriendInviteModal: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inviter, setInviter] = useState<UserProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Check URL parameters for ?invite= or ?friend=
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get('invite') || params.get('friend');
    const inviteName = params.get('name');

    if (inviteId) {
      // Store in localStorage so it persists through auth redirects or reloads
      localStorage.setItem(
        'couch_commander_pending_invite',
        JSON.stringify({ id: inviteId, name: inviteName || 'A TV Friend' })
      );
      // Clean query string without reloading page
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if there is a pending invite in localStorage
    const saved = localStorage.getItem('couch_commander_pending_invite');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id) {
          // If current user is the inviter, discard
          if (user && user.userId === parsed.id) {
            localStorage.removeItem('couch_commander_pending_invite');
            return;
          }

          // If already friends, discard
          if (user && user.friends && user.friends.includes(parsed.id)) {
            localStorage.removeItem('couch_commander_pending_invite');
            return;
          }

          // Fetch inviter's profile details
          fetchUserProfileFromFirestore(parsed.id).then((profile) => {
            if (profile) {
              setInviter(profile);
            } else {
              setInviter({
                userId: parsed.id,
                username: 'commander_friend',
                displayName: parsed.name || 'Couch Commander Friend',
                avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${parsed.id}`,
                dailyStreak: 1,
                lastCheckInDate: '',
                badges: [],
                friends: [],
                createdAt: Date.now(),
              });
            }
            setIsOpen(true);
          });
        }
      } catch {
        localStorage.removeItem('couch_commander_pending_invite');
      }
    }
  }, [user]);

  const handleAcceptInvite = async () => {
    if (!inviter || !user) return;
    setIsConnecting(true);
    triggerHaptic('medium');

    const success = await createMutualFriendship(user.userId, inviter.userId);
    if (success) {
      // Add inviter to current user's friends list
      const currentFriends = user.friends || [];
      if (!currentFriends.includes(inviter.userId)) {
        updateUser({ friends: [...currentFriends, inviter.userId] });
      }
      setIsConnected(true);
      localStorage.removeItem('couch_commander_pending_invite');
      triggerHaptic('success');
      setTimeout(() => {
        setIsOpen(false);
      }, 2200);
    }
    setIsConnecting(false);
  };

  const handleDismiss = () => {
    localStorage.removeItem('couch_commander_pending_invite');
    setIsOpen(false);
  };

  if (!isOpen || !inviter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {isConnected && <ConfettiBurst trigger={true} />}

      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0c2f1f] via-[#061910] to-[#040f09] border border-emerald-500/40 p-6 shadow-2xl relative overflow-hidden text-center">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {isConnected ? (
          <div className="py-6 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
              <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">Friends Connected!</h3>
            <p className="text-xs text-emerald-300/80">
              You and <span className="font-bold text-emerald-300">{inviter.displayName}</span> are now in each other's Friends Circle!
            </p>
          </div>
        ) : (
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider text-emerald-400 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Friend Invitation</span>
            </div>

            {/* Inviter Avatar & Info */}
            <div className="relative mb-3">
              <img
                src={inviter.avatarUrl}
                alt={inviter.displayName}
                className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-emerald-400 shadow-xl shadow-emerald-500/20"
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 whitespace-nowrap">
                @{inviter.username}
              </div>
            </div>

            <h3 className="text-base font-black text-white mt-4 mb-1">
              Connect with {inviter.displayName}
            </h3>

            <p className="text-xs text-emerald-200/80 mb-5 leading-relaxed px-2">
              Join {inviter.displayName}'s Friends Circle on Couch Commander to compare watch stats, view live check-ins, and compete for show crowns!
            </p>

            {/* Actions depending on auth state */}
            {user ? (
              <div className="space-y-2.5">
                <button
                  onClick={handleAcceptInvite}
                  disabled={isConnecting}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>{isConnecting ? 'Connecting...' : 'Accept & Add to Friends'}</span>
                </button>

                {isGuest && (
                  <button
                    onClick={openAuthModal}
                    className="w-full py-2.5 px-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google to Save Permanently</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={openAuthModal}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Connect</span>
                </button>

                <p className="text-[10px] text-emerald-500">
                  Takes 5 seconds with Google or Email.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
