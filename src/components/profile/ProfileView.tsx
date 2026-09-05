import React, { useState } from 'react';
import { Crown, Award, Users, Edit3, Check, Settings, LogIn, LogOut, UserPlus, Share2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { StreakCounter } from './StreakCounter';
import { StatsOverview } from './StatsOverview';
import { BadgeGrid } from '../badges/BadgeGrid';
import { GlassCard } from '../common/GlassCard';
import { triggerHaptic } from '../../lib/haptics';

export const ProfileView: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const openSettings = useSettingsStore((state) => state.openSettings);

  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [bioText, setBioText] = useState<string>(user?.bio || '');
  const [sharedToast, setSharedToast] = useState<boolean>(false);

  const handleSaveBio = () => {
    updateUser({ bio: bioText });
    setIsEditingBio(false);
  };

  const handleShareProfile = async () => {
    triggerHaptic('medium');
    const shareData = {
      title: `${user?.displayName}'s Couch Commander Profile`,
      text: `📺 Check out my TV watch stats and badges on Couch Commander! Add me @${user?.username}`,
      url: window.location.origin,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setSharedToast(true);
        setTimeout(() => setSharedToast(false), 2500);
      } catch {
        // ignore
      }
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">Join Couch Commander</h3>
        <p className="text-xs text-emerald-300/80 mb-4 max-w-xs mx-auto">
          Sign in to track your shows, build streaks, unlock collectible stickers, and claim #1 ranks.
        </p>
        <button
          onClick={openAuthModal}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-lg shadow-emerald-500/25"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const friendsList = user.friends || [];

  return (
    <div className="pb-32 pt-2">
      {/* Guest Mode Alert Banner */}
      {isGuest && (
        <div className="px-4 mb-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-[#06180f] border border-emerald-500/40 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-emerald-400">Guest Mode Active</h4>
              <p className="text-[10px] text-emerald-200/80">
                Sign in to save your personal watch history to the cloud.
              </p>
            </div>
            <button
              onClick={openAuthModal}
              className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-sm flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="px-4 mb-4">
        <GlassCard className="p-4 bg-gradient-to-b from-[#0d3322] to-[#05130d] border-emerald-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-xl shadow-emerald-500/20"
                />
                <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-amber-500 text-black shadow-md">
                  <Crown className="w-3.5 h-3.5 fill-black" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-white">
                    {user.displayName}
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-sm">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-emerald-300 font-mono">
                  @{user.username}
                </p>
                <p className="text-[10px] text-emerald-500/80 mt-0.5">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={openSettings}
                className="p-2 rounded-xl bg-[#0e2a1d] hover:bg-[#153e2a] border border-emerald-800 text-emerald-300 hover:text-white"
                title="Profile Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {!isGuest && (
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-xl bg-[#0e2a1d] hover:bg-rose-950/60 hover:text-rose-400 text-emerald-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bio section */}
          <div className="mt-3 pt-3 border-t border-emerald-900/60">
            {isEditingBio ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#05130d] border border-emerald-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Tell friends what you love watching..."
                />
                <button
                  onClick={handleSaveBio}
                  className="p-1.5 rounded-xl bg-emerald-500 text-black"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingBio(true)}
                className="group flex items-center justify-between text-xs text-emerald-200/90 cursor-pointer hover:text-white"
              >
                <p className="italic">{user.bio || 'Add a bio to your TV commander profile...'}</p>
                <Edit3 className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-400 transition-colors" />
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Streaks (Daily + Binge) */}
      <div className="px-4">
        <StreakCounter />
      </div>

      {/* Stats Overview Counters */}
      <div className="px-4">
        <StatsOverview />
      </div>

      {/* Commander Collectible Badges Showcase */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Commander Badges & Stickers ({(user.badges || []).length})
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400/70 font-medium">
            Tap unlocked sticker to inspect
          </span>
        </div>

        <BadgeGrid />
      </div>

      {/* Friends Circle Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Friends Circle ({friendsList.length})
            </h3>
          </div>

          <button
            onClick={handleShareProfile}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{sharedToast ? 'Link Copied!' : 'Invite Friends'}</span>
          </button>
        </div>

        {friendsList.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5">
            {friendsList.map((friendId) => (
              <div
                key={friendId}
                className="p-2.5 rounded-xl bg-[#091e14]/70 border border-emerald-900/60 text-center"
              >
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${friendId}`}
                  alt="Friend"
                  className="w-10 h-10 rounded-full mx-auto object-cover border border-emerald-700"
                />
                <h4 className="text-xs font-bold text-white mt-1.5 truncate">
                  {friendId}
                </h4>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#091e14]/50 border border-emerald-900/40 text-center">
            <UserPlus className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-emerald-200">No Friends Added Yet</h4>
            <p className="text-[11px] text-emerald-400/70 max-w-xs mx-auto mt-1 mb-3">
              Share your Commander invite link to connect with friends and compete for Couch Commander crowns.
            </p>
            <button
              onClick={handleShareProfile}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{sharedToast ? 'Invite Link Copied!' : 'Share Invite Link'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
