import { create } from "zustand";
import { getToken } from "@/lib/authTokenManager";
import { RankingData, RankingType } from "@/types/rankingTypes";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface RankingsState {
  // Cache for rankings data
  rankingsCache: Record<
    string,
    {
      data: RankingData;
      timestamp: number;
    }
  >;

  // Loading states per category
  loadingStates: Record<string, boolean>;

  // Error states per category
  errorStates: Record<string, string | null>;

  // Actions
  getRankings: (
    type: RankingType,
    gameMode?: string,
    limit?: number
  ) => Promise<RankingData | null>;
  clearCache: () => void;
  getCachedRankings: (
    type: RankingType,
    gameMode?: string
  ) => RankingData | null;
}

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (type: RankingType, gameMode?: string) => {
  return gameMode ? `${type}_${gameMode}` : type;
};

export const useRankingsStore = create<RankingsState>((set, get) => ({
  rankingsCache: {},
  loadingStates: {},
  errorStates: {},

  getRankings: async (
    type: RankingType,
    gameMode?: string,
    limit: number = 50
  ) => {
    const cacheKey = getCacheKey(type, gameMode);

    try {
      // Set loading state
      set((state) => ({
        loadingStates: { ...state.loadingStates, [cacheKey]: true },
        errorStates: { ...state.errorStates, [cacheKey]: null },
      }));

      // Check cache first
      const cached = get().getCachedRankings(type, gameMode);
      if (cached) {
        console.log(`[RankingsStore] Using cached data for ${cacheKey}`);
        set((state) => ({
          loadingStates: { ...state.loadingStates, [cacheKey]: false },
        }));
        return cached;
      }

      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      console.log(
        `[RankingsStore] Fetching ${type} rankings${
          gameMode ? ` for ${gameMode}` : ""
        }`
      );

      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
      });

      if (gameMode) {
        params.append("gameMode", gameMode);
      }

      const response = await fetch(
        `${API_URL}/api/rankings?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch rankings");
      }

      const rankingsData = result.data;

      // Cache the data
      set((state) => ({
        rankingsCache: {
          ...state.rankingsCache,
          [cacheKey]: {
            data: rankingsData,
            timestamp: Date.now(),
          },
        },
        loadingStates: { ...state.loadingStates, [cacheKey]: false },
      }));

      console.log(
        `[RankingsStore] Successfully fetched ${rankingsData.rankings.length} rankings for ${cacheKey}`
      );
      return rankingsData;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch rankings";
      console.error(
        `[RankingsStore] Error fetching ${cacheKey}:`,
        errorMessage
      );

      set((state) => ({
        loadingStates: { ...state.loadingStates, [cacheKey]: false },
        errorStates: { ...state.errorStates, [cacheKey]: errorMessage },
      }));

      return null;
    }
  },

  getCachedRankings: (type: RankingType, gameMode?: string) => {
    const cacheKey = getCacheKey(type, gameMode);
    const cached = get().rankingsCache[cacheKey];

    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.data;
    }

    return null;
  },

  clearCache: () => {
    set({
      rankingsCache: {},
      loadingStates: {},
      errorStates: {},
    });
  },
}));

export default useRankingsStore;
