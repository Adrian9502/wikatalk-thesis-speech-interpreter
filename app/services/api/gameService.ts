import { authApi, api } from "./baseApi";
import { LevelData } from "@/types/gameTypes";

export interface QuizQuestion {
  _id: string;
  question: string;
  difficulty: string;
  mode: string;
  options?: string[];
  correctAnswer: string;
  level?: string;
  title?: string;
  description?: string;
  translation?: string;
  dialect?: string;
  focusArea?: string;
  choices?: string[];
  answer?: string;
  hint?: string;
  sentence?: string;
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

// Interface for quiz questions response
export interface QuizQuestionsResponse {
  success: boolean;
  data: QuizQuestion[];
  message?: string;
}

// Interface for user progress update
export interface UserProgressUpdateRequest {
  timeSpent: number;
  completed: boolean; // FIX: Ensure this is always boolean
}

export interface UserProgressUpdateResponse {
  success: boolean;
  progress: any;
  message?: string;
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

  // Test backend connection
  testConnection: async () => {
    const response = await api.get("/api/test");
    return response.data;
  },

  // Fetch questions by mode (returns array directly like the original API call)
  getQuestionsByMode: async (mode: string) => {
    const response = await api.get<QuizQuestion[]>(`/api/quiz/mode/${mode}`);
    return response.data;
  },

  // Fetch all quiz questions (returns array directly like the original API call)
  getAllQuestions: async () => {
    const response = await api.get<QuizQuestion[]>("/api/quiz");
    return response.data;
  },

  // NEW: Fetch question by specific level and mode
  getQuestionByLevelAndMode: async (level: number, mode: string) => {
    const response = await api.get<QuizQuestion>(
      `/api/quiz/level/${level}/mode/${mode}`
    );
    return response.data;
  },

  // Update user progress for a specific level
  updateUserProgress: async (
    levelId: string | number,
    data: UserProgressUpdateRequest
  ) => {
    const response = await authApi.post<UserProgressUpdateResponse>(
      `/api/userprogress/${levelId}`,
      data
    );
    return response.data;
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
