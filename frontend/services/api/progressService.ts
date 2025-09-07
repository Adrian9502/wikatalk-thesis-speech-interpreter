import { authApi } from "./baseApi";

export interface ProgressData {
  userId: string;
  quizId: string;
  completed: boolean;
  exercisesCompleted: number;
  totalExercises: number;
  totalTimeSpent: number;
  lastAttemptDate: Date;
  attempts: Array<{
    attemptDate: Date;
    isCorrect: boolean;
    attemptNumber: number;
    cumulativeTime: number;
  }>;
}

export interface ProgressUpdateData {
  quizId: string;
  completed?: boolean;
  exerciseId?: string;
  isCorrect?: boolean;
  timeSpent?: number;
  attemptNumber?: number;
  difficulty?: string; // Add difficulty support
}

export interface ProgressStatsResponse {
  success: boolean;
  stats: {
    totalCompleted: number;
    totalAttempted: number;
    totalTimeSpent: number;
    averageScore: number;
  };
}

export interface LevelDetailsResponse {
  success: boolean;
  progress: ProgressData;
  message?: string;
}

// Interface for progress update response
export interface ProgressUpdateResponse {
  success: boolean;
  progress: ProgressData;
  message?: string;
  reward?: {
    coins: number;
    label: string;
    difficulty: string;
    timeSpent: number;
  };
}

// Interface for timer reset response
export interface TimerResetResponse {
  success: boolean;
  message?: string;
  coinsDeducted?: number;
  remainingCoins?: number;
  costBreakdown?: {
    originalTimeSpent: number;
    costReason: string;
    timeRange: string;
  };
}

export const progressService = {
  // Get all progress for user
  getAllProgress: async () => {
    const response = await authApi.get<{
      success: boolean;
      progressEntries: ProgressData[];
    }>("/api/userprogress");
    return response.data;
  },

  // Get progress for specific quiz
  getQuizProgress: async (quizId: string) => {
    const response = await authApi.get<{
      success: boolean;
      progress: ProgressData;
    }>(`/api/userprogress/${quizId}`);
    return response.data;
  },

  // Get level details for specific level
  getLevelDetails: async (levelId: string | number) => {
    const formattedId = `n-${levelId}`;
    const response = await authApi.get<LevelDetailsResponse>(
      `/api/userprogress/${formattedId}`
    );
    return response.data;
  },

  // Update progress for specific quiz
  updateQuizProgress: async (
    quizId: string,
    data: {
      timeSpent: number;
      completed: boolean;
      isCorrect: boolean;
      difficulty?: string;
    }
  ) => {
    const response = await authApi.post<ProgressUpdateResponse>(
      `/api/userprogress/${quizId}`,
      data
    );
    return response.data;
  },

  // Update progress (generic)
  updateProgress: async (data: ProgressUpdateData) => {
    const response = await authApi.post<{
      success: boolean;
      progress: ProgressData;
    }>("/api/userprogress/update", data);
    return response.data;
  },

  // Reset timer for specific quiz
  resetQuizTimer: async (quizId: string) => {
    const response = await authApi.post<TimerResetResponse>(
      `/api/userprogress/${quizId}/reset-timer`
    );
    return response.data;
  },

  // Get user progress statistics
  getUserStats: async () => {
    const response = await authApi.get<ProgressStatsResponse>(
      "/api/userprogress/stats"
    );
    return response.data;
  },

  // Test route to check if progress API is working
  testProgressApi: async () => {
    const response = await authApi.get("/api/userprogress/test");
    return response.data;
  },
};
