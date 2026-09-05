import { create } from 'zustand';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';
import { getTodayDateString } from '../lib/utils';
import {
  saveUserProfileToFirestore,
  fetchUserProfileFromFirestore,
} from '../lib/firestoreService';

interface AuthState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authError: string | null;

  openAuthModal: () => void;
  closeAuthModal: () => void;
  clearAuthError: () => void;
  initializeAuthListener: () => () => void;

  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;

  updateUser: (updates: Partial<UserProfile>) => void;
  incrementStreak: () => void;
  unlockBadgeForUser: (badgeId: string) => boolean;
  clearUserData: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let initialUser: UserProfile | null = null;
  let isGuest = false;

  try {
    const saved = localStorage.getItem('couch_commander_user');
    if (saved) {
      initialUser = JSON.parse(saved);
      isGuest = initialUser?.userId === 'guest-user';
    }
  } catch {
    initialUser = null;
  }

  return {
    user: initialUser,
    firebaseUser: null,
    isAuthenticated: !!initialUser,
    isGuest: isGuest,
    isLoading: false,
    isAuthModalOpen: false,
    authError: null,

    openAuthModal: () => set({ isAuthModalOpen: true, authError: null }),
    closeAuthModal: () => set({ isAuthModalOpen: false, authError: null }),
    clearAuthError: () => set({ authError: null }),

    initializeAuthListener: () => {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          set({ isLoading: true });
          const remoteProfile = await fetchUserProfileFromFirestore(fbUser.uid);
          
          // Clean initial profile for new users
          const userProfile: UserProfile = remoteProfile || {
            userId: fbUser.uid,
            username: (fbUser.displayName || fbUser.email?.split('@')[0] || 'watcher')
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '_'),
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Couch Commander',
            avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
            bio: 'Tracking my favorite TV shows 📺',
            dailyStreak: 0,
            lastCheckInDate: '',
            badges: [],
            friends: [],
            createdAt: Date.now(),
          };

          if (!remoteProfile) {
            await saveUserProfileToFirestore(userProfile);
          }

          set({
            user: userProfile,
            firebaseUser: fbUser,
            isAuthenticated: true,
            isGuest: false,
            isLoading: false,
            isAuthModalOpen: false,
          });

          localStorage.setItem('couch_commander_user', JSON.stringify(userProfile));
        } else {
          // If logged out from Firebase and not explicitly guest
          const currentUser = get().user;
          if (currentUser && !get().isGuest) {
            set({ user: null, isAuthenticated: false, isGuest: false });
            localStorage.removeItem('couch_commander_user');
            localStorage.removeItem('couch_commander_tracked');
          }
        }
      });

      return unsubscribe;
    },

    signInWithGoogle: async () => {
      set({ isLoading: true, authError: null });
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;

        const remoteProfile = await fetchUserProfileFromFirestore(fbUser.uid);
        const userProfile: UserProfile = remoteProfile || {
          userId: fbUser.uid,
          username: (fbUser.displayName || fbUser.email?.split('@')[0] || 'watcher')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_'),
          displayName: fbUser.displayName || 'Couch Commander',
          avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          bio: 'Tracking TV & earning Couch Commander crowns 👑',
          dailyStreak: 0,
          lastCheckInDate: '',
          badges: [],
          friends: [],
          createdAt: Date.now(),
        };

        if (!remoteProfile) {
          await saveUserProfileToFirestore(userProfile);
        }

        set({
          user: userProfile,
          firebaseUser: fbUser,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
          isAuthModalOpen: false,
        });

        localStorage.setItem('couch_commander_user', JSON.stringify(userProfile));
      } catch (err: any) {
        console.error('Google Sign In Error:', err);
        set({
          isLoading: false,
          authError: err?.message || 'Google sign-in failed. Please ensure Google Provider is enabled.',
        });
      }
    },

    signInWithEmail: async (email, pass) => {
      set({ isLoading: true, authError: null });
      try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        const fbUser = result.user;

        const remoteProfile = await fetchUserProfileFromFirestore(fbUser.uid);
        const userProfile: UserProfile = remoteProfile || {
          userId: fbUser.uid,
          username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
          displayName: fbUser.displayName || email.split('@')[0],
          avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          bio: 'Tracking TV & earning Couch Commander crowns 👑',
          dailyStreak: 0,
          lastCheckInDate: '',
          badges: [],
          friends: [],
          createdAt: Date.now(),
        };

        set({
          user: userProfile,
          firebaseUser: fbUser,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
          isAuthModalOpen: false,
        });

        localStorage.setItem('couch_commander_user', JSON.stringify(userProfile));
      } catch (err: any) {
        set({
          isLoading: false,
          authError: err?.message || 'Invalid email or password.',
        });
      }
    },

    signUpWithEmail: async (email, pass, displayName) => {
      set({ isLoading: true, authError: null });
      try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        const fbUser = result.user;

        const userProfile: UserProfile = {
          userId: fbUser.uid,
          username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
          displayName: displayName.trim() || email.split('@')[0],
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          bio: 'Tracking TV & earning Couch Commander crowns 👑',
          dailyStreak: 0,
          lastCheckInDate: '',
          badges: [],
          friends: [],
          createdAt: Date.now(),
        };

        await saveUserProfileToFirestore(userProfile);

        set({
          user: userProfile,
          firebaseUser: fbUser,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
          isAuthModalOpen: false,
        });

        localStorage.setItem('couch_commander_user', JSON.stringify(userProfile));
      } catch (err: any) {
        set({
          isLoading: false,
          authError: err?.message || 'Failed to create account.',
        });
      }
    },

    loginAsGuest: () => {
      const guestProfile: UserProfile = {
        userId: 'guest-user',
        username: 'guest_watcher',
        displayName: 'Guest Commander',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
        bio: 'Exploring Couch Commander in guest mode',
        dailyStreak: 0,
        lastCheckInDate: '',
        badges: [],
        friends: [],
        createdAt: Date.now(),
      };

      set({
        user: guestProfile,
        firebaseUser: null,
        isAuthenticated: true,
        isGuest: true,
        isAuthModalOpen: false,
      });
      localStorage.setItem('couch_commander_user', JSON.stringify(guestProfile));
    },

    logout: async () => {
      try {
        await firebaseSignOut(auth);
      } catch {
        // ignore
      }
      set({
        user: null,
        firebaseUser: null,
        isAuthenticated: false,
        isGuest: false,
      });
      localStorage.removeItem('couch_commander_user');
      localStorage.removeItem('couch_commander_tracked');
    },

    clearUserData: () => {
      const current = get().user;
      if (!current) return;
      const cleanProfile: UserProfile = {
        ...current,
        dailyStreak: 0,
        lastCheckInDate: '',
        badges: [],
      };
      set({ user: cleanProfile });
      localStorage.setItem('couch_commander_user', JSON.stringify(cleanProfile));
      localStorage.removeItem('couch_commander_tracked');
      saveUserProfileToFirestore(cleanProfile);
    },

    updateUser: (updates) => {
      const current = get().user;
      if (!current) return;
      const updated = { ...current, ...updates };
      set({ user: updated });
      localStorage.setItem('couch_commander_user', JSON.stringify(updated));
      saveUserProfileToFirestore(updated);
    },

    incrementStreak: () => {
      const user = get().user;
      if (!user) return;

      const today = getTodayDateString();
      if (user.lastCheckInDate === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      let newStreak = (user.dailyStreak || 0);
      if (user.lastCheckInDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      const updated = {
        ...user,
        dailyStreak: newStreak,
        lastCheckInDate: today,
      };

      set({ user: updated });
      localStorage.setItem('couch_commander_user', JSON.stringify(updated));
      saveUserProfileToFirestore(updated);
    },

    unlockBadgeForUser: (badgeId: string): boolean => {
      const user = get().user;
      if (!user) return false;
      const currentBadges = user.badges || [];
      if (currentBadges.includes(badgeId)) return false;

      const updatedBadges = [...currentBadges, badgeId];
      const updated = { ...user, badges: updatedBadges };
      set({ user: updated });
      localStorage.setItem('couch_commander_user', JSON.stringify(updated));
      saveUserProfileToFirestore(updated);
      return true;
    },
  };
});
