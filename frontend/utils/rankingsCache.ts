import { RankingData } from "@/types/rankingTypes";
import { registerRankingsCacheClear } from "./dataManager";
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
  // Get the clear function from useRankings hook without importing
  const clearFunction = getClearRankingsCacheFunction();
  if (clearFunction) {
    clearFunction();
  }
  rankingsPreloaded = false;
};

// Store the clear function reference to avoid circular dependency
let clearRankingsCacheFunction: (() => void) | null = null;

export const setClearRankingsCacheFunction = (clearFunction: () => void) => {
  clearRankingsCacheFunction = clearFunction;
};

const getClearRankingsCacheFunction = () => clearRankingsCacheFunction;

// Register this module with the data manager
// Import asynchronously to avoid circular dependency
setTimeout(() => {
  registerRankingsCacheClear(clearRankingsCache);
}, 0);
