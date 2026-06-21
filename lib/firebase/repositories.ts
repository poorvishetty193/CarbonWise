import { db } from './client';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { ActivityLog, LeaderboardEntry, UserProfile } from '../../types';

/**
 * Subscribes to the user's logged activities in the 'activities' collection.
 * This is used to display the activity log in real-time.
 * 
 * @param uid - The user's Firebase UID
 * @param limitCount - Maximum number of recent activities to fetch
 * @param onData - Callback with the updated list of activities
 * @param onError - Callback when a Firestore error occurs
 * @returns An unsubscribe function to detach the listener
 * @throws {Error} If the query fails to initialize
 */
export function subscribeToActivities(
  uid: string,
  limitCount: number,
  onData: (activities: ActivityLog[]) => void,
  onError: (error: unknown) => void
): () => void {
  const q = query(
    collection(db, 'activities'),
    where('uid', '==', uid),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const items: ActivityLog[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as ActivityLog);
    });
    items.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
    onData(items);
  }, onError);
}

/**
 * Subscribes to the top users in the 'users' collection for the leaderboard.
 * 
 * @param topN - The user's Firebase UID (Wait, topN is the limit count. Let's fix the JSDoc)
 * @param onData - Callback with the updated list of leaderboard entries
 * @param onError - Callback when a Firestore error occurs
 * @returns An unsubscribe function to detach the listener
 * @throws {Error} If the query fails to initialize
 */
export function subscribeToLeaderboard(
  topN: number,
  onData: (entries: LeaderboardEntry[]) => void,
  onError: (error: unknown) => void
): () => void {
  const q = query(
    collection(db, 'users'),
    orderBy('valueKg', 'desc'),
    limit(topN)
  );

  return onSnapshot(q, (snapshot) => {
    const items: LeaderboardEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        uid: docSnap.id,
        displayName: data.displayName || 'Anonymous',
        photoURL: data.photoURL ?? undefined,
        weeklyKgSaved: typeof data.totalKgSaved === 'number' ? data.totalKgSaved : 0,
        rank: 0,
      });
    });
    items.forEach((item, i) => { item.rank = i + 1; });
    onData(items);
  }, onError);
}

/**
 * Subscribes to a single user's profile document in the 'users' collection.
 * 
 * @param uid - The user's Firebase UID
 * @param onData - Callback with the updated user profile or null if not found
 * @param onError - Callback when a Firestore error occurs
 * @returns An unsubscribe function to detach the listener
 * @throws {Error} If the query fails to initialize
 */
export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError: (error: unknown) => void
): () => void {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onData(docSnap.data() as UserProfile);
    } else {
      onData(null);
    }
  }, onError);
}

/**
 * Subscribes to the weekly leaderboard for a given week.
 * 
 * @param weekId - The week identifier, e.g., '2026-W25'
 * @param onData - Callback with the updated list of leaderboard entries
 * @param onError - Callback when a Firestore error occurs
 * @returns An unsubscribe function to detach the listener
 * @throws {Error} If the query fails to initialize
 */
export function subscribeToWeeklyLeaderboard(
  weekId: string,
  onData: (entries: LeaderboardEntry[]) => void,
  onError: (error: unknown) => void
): () => void {
  const q = query(
    collection(db, 'leaderboard', weekId, 'entries'),
    orderBy('weeklyKgSaved', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const items: LeaderboardEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        uid: docSnap.id,
        displayName: data.displayName || 'Anonymous',
        photoURL: data.photoURL,
        weeklyKgSaved: data.weeklyKgSaved || 0,
        rank: 0,
      });
    });
    items.forEach((item, i) => { item.rank = i + 1; });
    onData(items);
  }, onError);
}