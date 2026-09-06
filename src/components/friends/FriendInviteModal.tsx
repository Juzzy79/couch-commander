import React, { useState, useEffect, useRef } from 'react';
import { Users, Check, X, LogIn, Sparkles, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchUserProfileFromFirestore, createMutualFriendship } from '../../lib/firestoreService';
import { ConfettiBurst } from '../common/ConfettiBurst';
import { triggerHaptic } from '../../lib/haptics';
import { UserProfile } from '../../types';

export const FriendInviteModal: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);
  const updateUser = useAuthStore((state) => state.updateUser);
  const authLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inviter, setInviter] = useState<UserProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [autoAcceptOnAuth, setAutoAcceptOnAuth] = useState<boolean>(false);
  const hasAutoAcceptedRef = useRef<boolean>(false);

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

    // Instantly add to local user friends for responsive feedback
    const currentFriends = user.friends || [];
    if (!currentFriends.includes(inviter.userId)) {
      updateUser({ friends: [...currentFriends, inviter.userId] });
    }

    setIsConnected(true);
    localStorage.removeItem('couch_commander_pending_invite');
    triggerHaptic('success');

    try {
      await createMutualFriendship(user.userId, inviter.userId);
    } catch (e) {
      console.warn('Could not sync mutual friendship in background:', e);
    }

    setTimeout(() => {
      setIsOpen(false);
    }, 2200);
    setIsConnecting(false);
  };

  // Auto-connect once user signs in if they initiated sign in from this invite
  useEffect(() => {
    if (
      user &&
      inviter &&
      isOpen &&
      !isConnected &&
      !isConnecting &&
      autoAcceptOnAuth &&
      !hasAutoAcceptedRef.current
    ) {
      hasAutoAcceptedRef.current = true;
      handleAcceptInvite();
    }
  }, [user, inviter, isOpen, autoAcceptOnAuth, isConnected, isConnecting]);

  const handleGoogleConnect = async () => {
    clearAuthError();
    setAutoAcceptOnAuth(true);
    triggerHaptic('medium');
    await signInWithGoogle();
  };

  const handleEmailConnect = () => {
    clearAuthError();
    setAutoAcceptOnAuth(true);
    triggerHaptic('light');
    openAuthModal();
  };

  const handleGuestConnect = () => {
    clearAuthError();
    setAutoAcceptOnAuth(true);
    triggerHaptic('light');
    loginAsGuest();
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  <span>{isConnecting ? 'Connecting...' : 'Accept & Add to Friends'}</span>
                </button>

                {isGuest && (
                  <button
                    onClick={handleGoogleConnect}
                    disabled={authLoading}
                    className="w-full py-2.5 px-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google to Save Permanently</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Error Banner if any */}
                {authError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-300 flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span className="flex-1 leading-tight">{authError}</span>
                  </div>
                )}

                {/* Primary: 1-Tap Google Sign In */}
                <button
                  onClick={handleGoogleConnect}
                  disabled={authLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm shadow-xl shadow-black/40 flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>{authLoading ? 'Signing in...' : 'Sign In with Google to Connect'}</span>
                </button>

                {/* Secondary: Email Sign In Modal */}
                <button
                  onClick={handleEmailConnect}
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Sign In with Email / Password</span>
                </button>

                {/* Tertiary: Guest connect */}
                <button
                  onClick={handleGuestConnect}
                  className="w-full py-1.5 text-[11px] text-emerald-400/80 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Or continue as Guest
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
