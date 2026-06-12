import { useState, useEffect } from 'react';
import { api } from '@/utils/axios.config';

type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  isYou?: boolean;
};

type UseLeaderboardReturn = {
  topEntries: LeaderboardEntry[];
  selfEntry: LeaderboardEntry | null;
  isSelfInTopFive: boolean;
  loading: boolean;
  error: string | null;
};

export function useLeaderboard(courseId: string): UseLeaderboardReturn {
  const [topEntries, setTopEntries] = useState<LeaderboardEntry[]>([]);
  const [selfEntry, setSelfEntry] = useState<LeaderboardEntry | null>(null);
  const [isSelfInTopFive, setIsSelfInTopFive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `/leaderboard/student/data?limit=5`
        );

        const data = res.data;

        if (!data.success) throw new Error('Leaderboard fetch unsuccessful');

        const currentLearnerId = data.currentLearner?.learnerId;

        const mapped: LeaderboardEntry[] = (data.leaderboard ?? []).map(
          (item: { rank: number; name: string; totalPoints: number; learnerId: number }) => ({
            rank: item.rank,
            name: item.name,
            points: item.totalPoints,
            isYou: item.learnerId === currentLearnerId,
          })
        );

        const self: LeaderboardEntry | null = data.currentLearner
          ? {
              rank: data.currentLearner.rank,
              name: data.currentLearner.name,
              points: data.currentLearner.totalPoints,
              isYou: true,
            }
          : null;

        const selfInTop = mapped.some((e) => e.isYou);

        setTopEntries(mapped);
        setSelfEntry(self);
        setIsSelfInTopFive(selfInTop);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [courseId]);

  return { topEntries, selfEntry, isSelfInTopFive, loading, error };
}