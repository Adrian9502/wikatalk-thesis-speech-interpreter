import { RankingData } from "@/types/rankingTypes";

// Simple in-memory cache for compatibility with existing code
let rankingsPreloaded: boolean = false;

export const setRankingsPreloaded = (value: boolean) => {
  rankingsPreloaded = value;
};

export const isRankingsPreloaded = (): boolean => {
  return rankingsPreloaded;
};

export const isRankingsCacheFresh = (
  category: string,
  maxAge = 300000 // 5 minutes default
): boolean => {
  // This is now handled by the useRankings hook
  return false;
};

export const getRankingsCache = (category: string): RankingData[] | null => {
  // This is now handled by the useRankings hook
  return null;
};

export const setRankingsCache = (
  category: string,
  data: RankingData[],
  timestamp = Date.now()
) => {
  // This is now handled by the useRankings hook
};

export const clearRankingsCache = () => {
  // Import and use the hook's clear function
  const { clearRankingsCache } = require("@/hooks/useRankings");
  clearRankingsCache();
  rankingsPreloaded = false;
};

// Register this module with the data manager
import { registerRankingsCache } from "@/utils/dataManager";
registerRankingsCache({
  clearCache: clearRankingsCache,
});
