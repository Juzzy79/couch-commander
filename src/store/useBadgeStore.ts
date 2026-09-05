import { create } from 'zustand';
import { BadgeDefinition } from '../types';
import { ALL_BADGES } from '../data/badgesData';
import { useAuthStore } from './useAuthStore';
import { triggerHaptic } from '../lib/haptics';

interface BadgeState {
  badges: BadgeDefinition[];
  recentlyUnlockedBadge: BadgeDefinition | null;
  isUnlockModalOpen: boolean;
  openUnlockModal: (badge: BadgeDefinition) => void;
  closeUnlockModal: () => void;
  checkAndAwardBadges: (params: {
    totalCheckIns: number;
    showCheckInsIn12h: number;
    checkInTime?: Date;
    isSeriesFinale?: boolean;
    isRank1?: boolean;
    isRank2?: boolean;
    isSpoilerMarked?: boolean;
  }) => BadgeDefinition[];
}

export const useBadgeStore = create<BadgeState>((set) => ({
  badges: ALL_BADGES,
  recentlyUnlockedBadge: null,
  isUnlockModalOpen: false,

  openUnlockModal: (badge) => {
    triggerHaptic('badge');
    set({ recentlyUnlockedBadge: badge, isUnlockModalOpen: true });
  },

  closeUnlockModal: () => {
    set({ isUnlockModalOpen: false, recentlyUnlockedBadge: null });
  },

  checkAndAwardBadges: (params) => {
    const authStore = useAuthStore.getState();
    const user = authStore.user;
    if (!user) return [];

    const unlocked: BadgeDefinition[] = [];
    const checkInDate = params.checkInTime || new Date();
    const hours = checkInDate.getHours();

    const tryAward = (badgeId: string) => {
      const badge = ALL_BADGES.find((b) => b.id === badgeId);
      if (badge && !user.badges.includes(badgeId)) {
        const didUnlock = authStore.unlockBadgeForUser(badgeId);
        if (didUnlock) {
          unlocked.push(badge);
        }
      }
    };

    // 1. First Check-in
    if (params.totalCheckIns >= 1) {
      tryAward('first_checkin');
    }

    // 2. Binge Streak (3+ in 12h)
    if (params.showCheckInsIn12h >= 3) {
      tryAward('binge_streak');
    }

    // 3. Midnight Watcher (12 AM - 4 AM)
    if (hours >= 0 && hours < 4) {
      tryAward('midnight_watcher');
    }

    // 4. Century Club (100 episodes)
    if (params.totalCheckIns >= 100) {
      tryAward('century_club');
    }

    // 5. Binge Master (500 episodes)
    if (params.totalCheckIns >= 500) {
      tryAward('binge_master');
    }

    // 6. Couch Commander Rank 1
    if (params.isRank1) {
      tryAward('couch_commander_title');
    }

    // 7. Remote Contender Rank 2
    if (params.isRank2) {
      tryAward('remote_contender');
    }

    // 8. Series Finale
    if (params.isSeriesFinale) {
      tryAward('series_finisher');
    }

    // 9. Spoiler Protection
    if (params.isSpoilerMarked) {
      tryAward('spoiler_shield');
    }

    // 10. 7-day streak
    if (user.dailyStreak >= 7) {
      tryAward('streak_7_days');
    }

    if (unlocked.length > 0) {
      // Trigger modal for the first one
      set({ recentlyUnlockedBadge: unlocked[0], isUnlockModalOpen: true });
      triggerHaptic('badge');
    }

    return unlocked;
  },
}));
