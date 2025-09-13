import { authApi } from "./baseApi";
import { RankingData } from "@/types/rankingTypes";

export interface RankingResponse {
  success: boolean;
  data: RankingData;
  message?: string;
}

export const rankingService = {
  // Get rankings with optional game mode filtering
  getRankings: async (type: string, limit: number = 50, gameMode?: string) => {
    // Build query parameters
    const params = new URLSearchParams({
      type,
      limit: limit.toString(),
    });

    // Handle game mode for composite categories
    if (type.includes("_")) {
      const [baseType, mode] = type.split("_");
      params.set("type", baseType);
      params.append("gameMode", mode);
    } else if (gameMode) {
      params.append("gameMode", gameMode);
    }

    console.log(
      `[RankingService] Fetching rankings: ${type} (limit: ${limit})`
    );

    const response = await authApi.get<RankingResponse>(
      `/api/rankings?${params.toString()}`
    );
    return response.data;
  },

  // Get specific ranking category
  getRankingsByCategory: async (category: string, limit: number = 50) => {
    return rankingService.getRankings(category, limit);
  },

  // Test rankings API connection
  testRankingsApi: async () => {
    const response = await authApi.get("/api/rankings/test");
    return response.data;
  },
};
