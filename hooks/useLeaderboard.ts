import { useState, useEffect } from 'react';
import { db } from '../lib/firebase/client';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LeaderboardEntry } from '../types';

export function useLeaderboard(): {
  entries: LeaderboardEntry[];
  loading: boolean;
} {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('totalKgSaved', 'desc')
    );

    const unsubscribe = onSnapshot(
  q,
  (snapshot) => {
    console.log("Users found:", snapshot.size);

    const items: LeaderboardEntry[] = [];

    snapshot.forEach((doc) => {
      console.log(doc.id, doc.data());

      const data = doc.data();

      items.push({
        uid: doc.id,
        displayName: data.displayName || 'Anonymous',
        weeklyKgSaved: data.totalKgSaved || 0,
      } as LeaderboardEntry);
    });

    setEntries(items);
    setLoading(false);
  },
      (error) => {
        console.error('Error fetching leaderboard', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { entries, loading };
}