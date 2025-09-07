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

export const progressService = {
  // Get all progress for user
  getAllProgress: async () => {
    const response = await authApi.get<{
      success: boolean;
      progress: ProgressData[];
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

  // NEW: Get level details for specific level (what useLevelDetails needs)
  getLevelDetails: async (levelId: string | number) => {
    const formattedId = `n-${levelId}`;
    const response = await authApi.get<LevelDetailsResponse>(
      `/api/userprogress/${formattedId}`
    );
    return response.data;
  },

  // Update progress
  updateProgress: async (data: ProgressUpdateData) => {
    const response = await authApi.post<{
      success: boolean;
      progress: ProgressData;
    }>("/api/userprogress/update", data);
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
