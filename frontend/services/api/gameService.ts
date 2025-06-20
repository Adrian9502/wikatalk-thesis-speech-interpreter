import { authApi } from "./baseApi";
import { LevelData } from "@/types/gameTypes";

export interface QuizQuestion {
  _id: string;
  question: string;
  difficulty: string;
  mode: string;
  options?: string[];
  correctAnswer: string;
}

export interface GameLevelsResponse {
  success: boolean;
  levels: LevelData[];
}

export interface DailyRewardResponse {
  success: boolean;
  coins: number;
  isAvailable: boolean;
  nextRewardTime?: string;
}

export const gameService = {
  // Get levels by game mode
  getLevelsByMode: async (gameMode: string) => {
    const response = await authApi.get<GameLevelsResponse>(
      `/api/quiz/levels/${gameMode}`
    );
    return response.data;
  },

  // Get level details
  getLevelById: async (levelId: string, gameMode: string) => {
    const response = await authApi.get<{ level: LevelData }>(
      `/api/quiz/level/${levelId}?mode=${gameMode}`
    );
    return response.data.level;
  },

  // Get quiz questions
  getQuestions: async (mode: string, difficulty: string) => {
    const response = await authApi.get<{ questions: QuizQuestion[] }>(
      `/api/quiz/mode/${mode}?difficulty=${difficulty}`
    );
    return response.data.questions;
  },

  // Check for daily reward
  checkDailyReward: async () => {
    const response = await authApi.get<DailyRewardResponse>(
      "/api/rewards/daily"
    );
    return response.data;
  },

  // Claim daily reward
  claimDailyReward: async () => {
    const response = await authApi.post<DailyRewardResponse>(
      "/api/rewards/claim"
    );
    return response.data;
  },

  // Get coins balance
  getCoinsBalance: async () => {
    const response = await authApi.get<{ success: boolean; balance: number }>(
      "/api/rewards/balance"
    );
    return response.data;
  },

  // Get word of the day
  getWordOfTheDay: async () => {
    const response = await authApi.get("/api/quiz/word-of-the-day");
    return response.data;
  },
};
