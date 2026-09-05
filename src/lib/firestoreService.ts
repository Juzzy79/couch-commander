import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
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
