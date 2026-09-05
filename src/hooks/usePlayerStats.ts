import { useState, useEffect } from 'react';
import { getPlayerStats, PlayerStats } from '../data/questionProgressStore';

/**
 * Hook to read real-time player statistics (stars, coins, completed artworks).
 * Automatically updates when question answers or artwork completion events occur.
 */
export function usePlayerStats(): PlayerStats {
  const [stats, setStats] = useState<PlayerStats>(() => getPlayerStats());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getPlayerStats());
    };

    window.addEventListener('museum_question_progress_updated', handleUpdate);
    window.addEventListener('museum_player_stats_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('museum_question_progress_updated', handleUpdate);
      window.removeEventListener('museum_player_stats_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return stats;
}
