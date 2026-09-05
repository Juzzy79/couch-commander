import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  arrayUnion,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, TrackedShow, CheckIn, ShowStats } from '../types';

/**
 * Save user profile to Firestore
 */
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.userId);
    await setDoc(userRef, user, { merge: true });
  } catch (err) {
    console.warn('Could not save user to Firestore:', err);
  }
}

/**
 * Fetch user profile from Firestore
 */
export async function fetchUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Could not fetch user from Firestore:', err);
  }
  return null;
}

/**
 * Real-time listener for user's tracked shows
 */
export function subscribeToUserTrackedShows(
  userId: string,
  onUpdate: (shows: TrackedShow[]) => void
): () => void {
  try {
    const colRef = collection(db, 'users', userId, 'trackedShows');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const shows: TrackedShow[] = [];
        snapshot.forEach((docSnap) => {
          shows.push(docSnap.data() as TrackedShow);
        });
        if (shows.length > 0) {
          onUpdate(shows);
        }
      },
      (error) => {
        console.warn('Firestore tracked shows subscription notice:', error);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Save a single tracked show for the user
 */
export async function saveTrackedShowToFirestore(
  userId: string,
  show: TrackedShow
): Promise<void> {
  try {
    const showRef = doc(db, 'users', userId, 'trackedShows', String(show.tmdbShowId));
    await setDoc(showRef, show, { merge: true });
  } catch (err) {
    console.warn('Could not save tracked show to Firestore:', err);
  }
}

/**
 * Real-time listener for the global social check-in feed
 */
export function subscribeToLiveActivityFeed(
  onUpdate: (checkIns: CheckIn[]) => void
): () => void {
  try {
    const feedQuery = query(
      collection(db, 'checkins'),
      orderBy('timestamp', 'desc'),
      limit(60)
    );

    return onSnapshot(
      feedQuery,
      (snapshot) => {
        const checkIns: CheckIn[] = [];
        snapshot.forEach((docSnap) => {
          checkIns.push(docSnap.data() as CheckIn);
        });
        if (checkIns.length > 0) {
          onUpdate(checkIns);
        }
      },
      (error) => {
        console.warn('Firestore checkins subscription notice:', error);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Publish a check-in to Firestore
 */
export async function publishCheckInToFirestore(checkIn: CheckIn): Promise<void> {
  try {
    const checkInRef = doc(db, 'checkins', checkIn.id);
    await setDoc(checkInRef, checkIn);
  } catch (err) {
    console.warn('Could not publish check-in to Firestore:', err);
  }
}

/**
 * Save show leaderboard stats to Firestore
 */
export async function saveShowStatsToFirestore(
  showId: number,
  stats: ShowStats
): Promise<void> {
  try {
    const statsRef = doc(db, 'showStats', String(showId));
    await setDoc(statsRef, stats, { merge: true });
  } catch (err) {
    console.warn('Could not save showStats to Firestore:', err);
  }
}

/**
 * Real-time listener for a show's leaderboard stats
 */
export function subscribeToShowStats(
  showId: number,
  onUpdate: (stats: ShowStats) => void
): () => void {
  try {
    const statRef = doc(db, 'showStats', String(showId));
    return onSnapshot(
      statRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as ShowStats);
        }
      },
      (error) => {
        console.warn('Firestore show stats subscription notice:', error);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Create a mutual friendship between two users
 */
export async function createMutualFriendship(userAId: string, userBId: string): Promise<boolean> {
  if (!userAId || !userBId || userAId === userBId) return false;
  try {
    const friendshipId = [userAId, userBId].sort().join('_');
    const friendshipRef = doc(db, 'friendships', friendshipId);
    await setDoc(
      friendshipRef,
      {
        users: [userAId, userBId],
        status: 'accepted',
        createdAt: Date.now(),
      },
      { merge: true }
    );

    // Update userA's friends array if not guest
    if (userAId !== 'guest-user') {
      const userARef = doc(db, 'users', userAId);
      await updateDoc(userARef, {
        friends: arrayUnion(userBId),
      }).catch(async () => {
        await setDoc(userARef, { friends: [userBId] }, { merge: true });
      });
    }

    // Update userB's friends array if not guest
    if (userBId !== 'guest-user') {
      const userBRef = doc(db, 'users', userBId);
      await updateDoc(userBRef, {
        friends: arrayUnion(userAId),
      }).catch(async () => {
        await setDoc(userBRef, { friends: [userAId] }, { merge: true });
      });
    }

    return true;
  } catch (err) {
    console.warn('Could not create mutual friendship:', err);
    return false;
  }
}

/**
 * Real-time listener for user friendships
 */
export function subscribeToUserFriendships(
  userId: string,
  onUpdate: (friendIds: string[]) => void
): () => void {
  if (!userId || userId === 'guest-user') return () => {};
  try {
    const q = query(
      collection(db, 'friendships'),
      where('users', 'array-contains', userId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const friendIds: string[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const users = (data.users as string[]) || [];
          const other = users.find((u) => u !== userId);
          if (other && !friendIds.includes(other)) {
            friendIds.push(other);
          }
        });
        onUpdate(friendIds);
      },
      (err) => {
        console.warn('Friendship subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Fetch profiles for a list of user IDs
 */
export async function fetchMultipleUserProfiles(userIds: string[]): Promise<UserProfile[]> {
  if (!userIds || userIds.length === 0) return [];
  const profiles: UserProfile[] = [];
  try {
    for (const uid of userIds) {
      if (!uid || uid === 'guest-user') continue;
      const profile = await fetchUserProfileFromFirestore(uid);
      if (profile) {
        profiles.push(profile);
      } else {
        profiles.push({
          userId: uid,
          username: `user_${uid.slice(0, 6)}`,
          displayName: `Commander ${uid.slice(0, 4)}`,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
          dailyStreak: 0,
          lastCheckInDate: '',
          badges: [],
          friends: [],
          createdAt: Date.now(),
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching multiple user profiles:', err);
  }
  return profiles;
}

/**
 * Search users by username or display name
 */
export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  const term = searchTerm.trim().toLowerCase().replace('@', '');
  if (!term) return [];
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const results: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      if (
        data.username?.toLowerCase().includes(term) ||
        data.displayName?.toLowerCase().includes(term) ||
        data.userId.toLowerCase() === term
      ) {
        results.push(data);
      }
    });
    return results;
  } catch (err) {
    console.warn('Search users error:', err);
    return [];
  }
}

