import { useState, useEffect, useCallback } from "react";
import { RankingData, RankingType } from "@/types/rankingTypes";
import { useRankingsStore } from "@/store/games/useRankingsStore";

interface UseRankingsReturn {
  data: RankingData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRankings = (
  type: RankingType,
  gameMode?: string,
  limit: number = 50
): UseRankingsReturn => {
  const [data, setData] = useState<RankingData | null>(null);

  const { getRankings, loadingStates, errorStates, getCachedRankings } =
    useRankingsStore();

  const cacheKey = gameMode ? `${type}_${gameMode}` : type;
  const isLoading = loadingStates[cacheKey] || false;
  const error = errorStates[cacheKey] || null;

  const fetchRankings = useCallback(async () => {
    console.log(
      `[useRankings] Fetching rankings for ${type}${
        gameMode ? ` (${gameMode})` : ""
      }`
    );

    const result = await getRankings(type, gameMode, limit);
    if (result) {
      setData(result);
    }
  }, [type, gameMode, limit, getRankings]);

  // Check for cached data first
  useEffect(() => {
    const cached = getCachedRankings(type, gameMode);
    if (cached) {
      setData(cached);
    } else {
      fetchRankings();
    }
  }, [type, gameMode, limit, fetchRankings, getCachedRankings]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRankings,
  };
};

// Hook for fetching multiple ranking categories
export const useMultipleRankings = (
  categories: Array<{ type: RankingType; gameMode?: string }>
) => {
  const [data, setData] = useState<Record<string, RankingData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRankings } = useRankingsStore();

  const fetchAllRankings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const promises = categories.map(async ({ type, gameMode }) => {
        const result = await getRankings(type, gameMode, 10); // Fewer items for overview
        return {
          key: gameMode ? `${type}_${gameMode}` : type,
          data: result,
        };
      });

      const results = await Promise.all(promises);

      const rankingsData = results.reduce((acc, { key, data }) => {
        if (data) {
          acc[key] = data;
        }
        return acc;
      }, {} as Record<string, RankingData>);

      setData(rankingsData);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch rankings";
      console.error("[useMultipleRankings] Error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [categories, getRankings]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchAllRankings();
    }
  }, [fetchAllRankings]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAllRankings,
  };
};
