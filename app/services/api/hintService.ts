import { authApi } from "./baseApi";

export interface HintCostResponse {
  success: boolean;
  hintNumber: number;
  cost: number;
  maxHints: number;
  gameMode: string;
  message?: string;
}

export interface HintPricingResponse {
  success: boolean;
  gameMode: string;
  maxHints: number;
  pricing: Array<{
    hintNumber: number;
    cost: number;
    description: string;
  }>;
  message?: string;
}

export interface PurchaseHintRequest {
  questionId: string;
  gameMode: string;
  currentHintsUsed: number;
}

export interface PurchaseHintResponse {
  success: boolean;
  message?: string;
  hintCost: number;
  remainingCoins: number;
  hintsUsed: number;
  maxHints: number;
  hintsRemaining: number;
  nextHintCost: number | null;
}

export interface HintStatusResponse {
  success: boolean;
  coins: number;
  hintUsage: {
    daily: number;
    total: number;
  };
  maxHints: number;
  gameMode: string;
  message?: string;
}

export const hintService = {
  // Get hint cost for specific hint number and game mode
  getHintCost: async (hintNumber: number, gameMode: string) => {
    const response = await authApi.get<HintCostResponse>(
      `/api/hints/cost/${hintNumber}/${gameMode}`
    );
    return response.data;
  },

  // Get all hint pricing for a specific game mode
  getHintPricing: async (gameMode: string) => {
    const response = await authApi.get<HintPricingResponse>(
      `/api/hints/pricing/${gameMode}`
    );
    return response.data;
  },

  // Purchase a hint for current question
  purchaseHint: async (data: PurchaseHintRequest) => {
    const response = await authApi.post<PurchaseHintResponse>(
      "/api/hints/purchase",
      data
    );
    return response.data;
  },

  // Get user's hint usage status for specific game mode
  getHintStatus: async (gameMode: string) => {
    const response = await authApi.get<HintStatusResponse>(
      `/api/hints/status/${gameMode}`
    );
    return response.data;
  },

  // Test hints API connection
  testHintsApi: async () => {
    const response = await authApi.get("/api/hints/test");
    return response.data;
  },
};
