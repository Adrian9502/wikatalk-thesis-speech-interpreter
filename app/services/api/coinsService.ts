import { authApi } from "./baseApi";

export interface CoinsResponse {
  success: boolean;
  coins: number;
  message?: string;
}

export interface DailyRewardResponse {
  success: boolean;
  available: boolean;
  message?: string;
}

export interface ClaimRewardResponse {
  success: boolean;
  claimed: boolean;
  amount: number;
  message?: string;
}

export interface DailyRewardsHistory {
  userId: string;
  claimedDates: Array<{
    date: string;
    amount: number;
  }>;
}

export interface RewardsHistoryResponse {
  success: boolean;
  history: DailyRewardsHistory;
  message?: string;
}

export interface AddCoinsRequest {
  amount: number;
}

export interface DeductCoinsRequest {
  amount: number;
}

export interface CoinsUpdateResponse {
  success: boolean;
  coins: number;
  message?: string;
}

export const coinsService = {
  // Get user's coin balance
  getCoinsBalance: async () => {
    const response = await authApi.get<CoinsResponse>("/api/rewards/coins");
    return response.data;
  },

  // Add coins to user's balance
  addCoins: async (data: AddCoinsRequest) => {
    const response = await authApi.post<CoinsUpdateResponse>(
      "/api/user/coins/add",
      data
    );
    return response.data;
  },

  // Deduct coins from user's balance
  deductCoins: async (data: DeductCoinsRequest) => {
    const response = await authApi.post<CoinsUpdateResponse>(
      "/api/user/coins/deduct",
      data
    );
    return response.data;
  },

  // Check if daily reward is available
  checkDailyReward: async () => {
    const response = await authApi.get<DailyRewardResponse>(
      "/api/rewards/daily/check"
    );
    return response.data;
  },

  // Claim daily reward
  claimDailyReward: async () => {
    const response = await authApi.post<ClaimRewardResponse>(
      "/api/rewards/daily/claim",
      {}
    );
    return response.data;
  },

  // Get daily rewards history
  getRewardsHistory: async () => {
    const response = await authApi.get<RewardsHistoryResponse>(
      "/api/rewards/daily/history"
    );
    return response.data;
  },

  // Test coins API connection
  testCoinsApi: async () => {
    const response = await authApi.get("/api/rewards/test");
    return response.data;
  },
};
