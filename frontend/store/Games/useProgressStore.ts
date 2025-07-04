import { create } from "zustand";
import axios from "axios";
import { getToken } from "@/lib/authTokenManager";
import {
  GameModeProgress,
  EnhancedGameModeProgress,
} from "@/types/gameProgressTypes";
import useGameStore from "@/store/games/useGameStore";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Cache management
const progressCache: { [key: string]: any } = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
let lastGlobalFetchTime = 0;

interface ProgressState {
  // Core state
  progress: any[] | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number;

  // Game progress metrics
  totalCompletedCount: number;
  totalQuizCount: number;
  gameProgress: {
    multipleChoice: GameModeProgress;
    identification: GameModeProgress;
    fillBlanks: GameModeProgress;
    [key: string]: GameModeProgress;
  };

  // Enhanced progress data for modals
  enhancedProgress: {
    [gameMode: string]: EnhancedGameModeProgress | null;
  };

  // Modal state management
  progressModal: {
    visible: boolean;
    gameMode: string;
    gameTitle: string;
  };

  // Actions
  fetchProgress: (forceRefresh?: boolean) => Promise<any[] | null>;
  updateProgress: (
    quizId: string | number,
    timeSpent: number,
    completed?: boolean,
    isCorrect?: boolean
  ) => Promise<any | null>;
  getGameModeProgress: (gameMode: string) => GameModeProgress;
  getEnhancedGameProgress: (
    gameMode: string
  ) => Promise<EnhancedGameModeProgress | null>;
  clearCache: () => void;
  formatQuizId: (id: string | number) => string;

  // Modal actions
  openProgressModal: (gameMode: string, gameTitle: string) => Promise<void>;
  closeProgressModal: () => void;

  // Timestamp for last update
  lastUpdated: number;
}

// Helper function to detect game mode from quiz ID
const detectGameModeFromQuizId = (quizId: string | number): string | null => {
  const { questions } = useGameStore.getState();

  let numericId: number;
  if (typeof quizId === "string") {
    const cleanId = quizId.replace(/^n-/, "");
    numericId = parseInt(cleanId, 10);
  } else {
    numericId = quizId;
  }

  for (const [mode, difficulties] of Object.entries(questions)) {
    if (!difficulties || typeof difficulties !== "object") continue;

    for (const [difficulty, questionList] of Object.entries(difficulties)) {
      if (!Array.isArray(questionList)) continue;

      const found = questionList.some((q: any) => {
        const qId = q.id || q.questionId;
        return qId === numericId;
      });

      if (found) {
        return mode;
      }
    }
  }

  return null;
};

// Count total quizzes for all game modes
const getTotalQuizCount = (): number => {
  const { questions } = useGameStore.getState();
  let totalCount = 0;

  Object.entries(questions).forEach(([gameMode, difficulties]) => {
    if (difficulties && typeof difficulties === "object") {
      Object.entries(difficulties).forEach(([difficulty, questionList]) => {
        if (Array.isArray(questionList)) {
          totalCount += questionList.length;
        }
      });
    }
  });

  return totalCount;
};

// Count quizzes for a specific game mode
const getQuizCountByMode = (mode: string): number => {
  const { questions } = useGameStore.getState();
  const modeQuestions = questions[mode];

  if (!modeQuestions || typeof modeQuestions !== "object") {
    return 0;
  }

  let modeCount = 0;
  Object.values(modeQuestions).forEach((questionList) => {
    if (Array.isArray(questionList)) {
      modeCount += questionList.length;
    }
  });

  return modeCount;
};

// Calculate game mode progress
const calculateGameProgress = (globalProgress: any[] | null) => {
  if (!Array.isArray(globalProgress)) {
    // Default values if no progress data
    return {
      multipleChoice: {
        completed: 0,
        total: getQuizCountByMode("multipleChoice"),
      },
      identification: {
        completed: 0,
        total: getQuizCountByMode("identification"),
      },
      fillBlanks: { completed: 0, total: getQuizCountByMode("fillBlanks") },
    };
  }

  // Group progress by game mode
  const progressByMode: { [key: string]: any[] } = {
    multipleChoice: [],
    identification: [],
    fillBlanks: [],
  };

  globalProgress.forEach((entry) => {
    const mode = detectGameModeFromQuizId(entry.quizId);
    if (mode && progressByMode[mode]) {
      progressByMode[mode].push(entry);
    }
  });

  // Calculate completed count for each mode
  return {
    multipleChoice: {
      completed: progressByMode.multipleChoice.filter((e) => e.completed)
        .length,
      total: getQuizCountByMode("multipleChoice"),
    },
    identification: {
      completed: progressByMode.identification.filter((e) => e.completed)
        .length,
      total: getQuizCountByMode("identification"),
    },
    fillBlanks: {
      completed: progressByMode.fillBlanks.filter((e) => e.completed).length,
      total: getQuizCountByMode("fillBlanks"),
    },
  };
};

const useProgressStore = create<ProgressState>((set, get) => ({
  // Initial state
  progress: null,
  isLoading: false,
  error: null,
  lastFetched: 0,

  // Initial game progress metrics
  totalCompletedCount: 0,
  totalQuizCount: getTotalQuizCount(),
  gameProgress: {
    multipleChoice: {
      completed: 0,
      total: getQuizCountByMode("multipleChoice"),
    },
    identification: {
      completed: 0,
      total: getQuizCountByMode("identification"),
    },
    fillBlanks: { completed: 0, total: getQuizCountByMode("fillBlanks") },
  },

  // Enhanced progress data storage
  enhancedProgress: {},

  // Modal state
  progressModal: {
    visible: false,
    gameMode: "",
    gameTitle: "",
  },

  // Format quiz ID for API
  formatQuizId: (id: string | number): string => {
    if (id === "global") return "global";
    const numericId =
      typeof id === "string" ? id.replace(/^n-/, "") : String(id);
    return `n-${numericId}`;
  },

  // Fetch user progress (global or specific)
  fetchProgress: async (forceRefresh = false): Promise<any[] | null> => {
    const currentTime = Date.now();
    const { lastFetched } = get();

    // Use cached data if available and not forcing refresh
    if (
      !forceRefresh &&
      lastFetched > 0 &&
      currentTime - lastFetched < CACHE_EXPIRY
    ) {
      return get().progress;
    }

    try {
      set({ isLoading: true, error: null });

      const token = getToken();
      if (!token) {
        set({ isLoading: false, error: "Authentication required" });
        return null;
      }

      const response = await axios({
        method: "get",
        url: `${API_URL}/api/userprogress`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (response.data.success) {
        const progressData = response.data.progressEntries;

        // Calculate derived data
        const gameProgress = calculateGameProgress(progressData);
        const totalCompletedCount = Object.values(gameProgress).reduce(
          (sum, mode) => sum + mode.completed,
          0
        );

        // Update state with all calculated data
        set({
          progress: progressData,
          isLoading: false,
          error: null,
          lastFetched: currentTime,
          lastUpdated: Date.now(), // Add this line
          totalCompletedCount,
          totalQuizCount: getTotalQuizCount(),
          gameProgress,
        });

        return progressData;
      } else {
        set({
          isLoading: false,
          error: response.data.message || "Failed to fetch progress",
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch progress",
      });
      return null;
    }
  },

  // Update progress for a specific quiz
  updateProgress: async (
    quizId: string | number,
    timeSpent: number,
    completed = false,
    isCorrect = false
  ): Promise<any | null> => {
    try {
      set({ isLoading: true, error: null });

      const token = getToken();
      if (!token) {
        set({ isLoading: false, error: "Authentication required" });
        return null;
      }

      const formattedId = get().formatQuizId(quizId);
      console.log(
        `[useProgressStore] Updating progress for: ${formattedId}, completed: ${completed}, isCorrect: ${isCorrect}`
      );

      const response = await axios({
        method: "post",
        url: `${API_URL}/api/userprogress/${formattedId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { timeSpent, completed, isCorrect },
        timeout: 10000,
      });

      if (response.data.success) {
        console.log(`[useProgressStore] Progress update successful!`);

        // If an item was completed, refresh global progress data immediately
        if (completed) {
          console.log(
            `[useProgressStore] Level completed - refreshing ALL progress data`
          );
          await get().fetchProgress(true);

          // Force UI update by updating timestamp
          set({
            lastUpdated: Date.now(),
            // Also explicitly clear any cached enhanced progress to force reload
            enhancedProgress: {},
          });

          console.log(
            `[useProgressStore] Progress refresh complete, lastUpdated: ${new Date().toISOString()}`
          );
        }

        set({ isLoading: false, error: null });
        return response.data.progress;
      } else {
        set({
          isLoading: false,
          error: response.data.message || "Failed to update progress",
        });
        return null;
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to update progress",
      });
      return null;
    }
  },

  // Get progress for a specific game mode
  getGameModeProgress: (gameMode: string): GameModeProgress => {
    const { gameProgress } = get();
    return gameProgress[gameMode] || { completed: 0, total: 0 };
  },

  // Get enhanced progress data for a game mode
  getEnhancedGameProgress: async (
    gameMode: string
  ): Promise<EnhancedGameModeProgress | null> => {
    // Check if we already have the enhanced progress calculated
    const { enhancedProgress } = get();
    if (enhancedProgress[gameMode] && !get().isLoading) {
      return enhancedProgress[gameMode];
    }

    // Ensure we have the latest progress data
    set({ isLoading: true });
    const progress = await get().fetchProgress();

    if (!progress) {
      set({ isLoading: false });
      return null;
    }

    // Calculate enhanced progress (implementation details in original file)
    // This is a placeholder for the actual implementation
    const enhancedData = calculateEnhancedProgress(gameMode, progress);

    // Update state with the new enhanced progress
    set((state) => ({
      isLoading: false,
      enhancedProgress: {
        ...state.enhancedProgress,
        [gameMode]: enhancedData,
      },
    }));

    return enhancedData;
  },

  // Modal management functions
  openProgressModal: async (gameMode: string, gameTitle: string) => {
    try {
      set({ isLoading: true });

      // Ensure questions are loaded
      const { ensureQuestionsLoaded } = useGameStore.getState();
      await ensureQuestionsLoaded();

      // Load enhanced progress data for this game mode
      await get().getEnhancedGameProgress(gameMode);

      // Show the modal
      set({
        progressModal: {
          visible: true,
          gameMode,
          gameTitle,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error("Error opening progress modal:", error);
      // Show modal anyway even if there's an error
      set({
        progressModal: {
          visible: true,
          gameMode,
          gameTitle,
        },
        isLoading: false,
      });
    }
  },

  closeProgressModal: () => {
    set({
      progressModal: {
        visible: false,
        gameMode: "",
        gameTitle: "",
      },
    });
  },

  // Clear cached data
  clearCache: () => {
    set({
      progress: null,
      lastFetched: 0,
      enhancedProgress: {},
    });
  },

  // Timestamp for last update
  lastUpdated: Date.now(),
}));

// Replace the placeholder implementation with this proper one
function calculateEnhancedProgress(
  gameMode: string,
  progress: any[]
): EnhancedGameModeProgress | null {
  try {
    const { questions } = useGameStore.getState();

    // Early exit if we don't have the required data
    if (!Array.isArray(progress) || !questions[gameMode]) {
      console.log(`[useProgressStore] No data for ${gameMode} calculation`);
      return null;
    }

    // Get all questions for this game mode
    const modeQuestions = questions[gameMode];
    const difficulties: ("easy" | "medium" | "hard")[] = [
      "easy",
      "medium",
      "hard",
    ];

    // Expected counts by difficulty
    const getQuizCountByDifficulty = (
      mode: string,
      difficulty: string
    ): number => {
      const diffQuestions = questions[mode]?.[difficulty];
      return Array.isArray(diffQuestions) ? diffQuestions.length : 0;
    };

    const expectedCounts = {
      easy: getQuizCountByDifficulty(gameMode, "easy"),
      medium: getQuizCountByDifficulty(gameMode, "medium"),
      hard: getQuizCountByDifficulty(gameMode, "hard"),
    };

    // Calculate progress for each difficulty
    const difficultyBreakdown: DifficultyProgress[] = difficulties.map(
      (difficulty) => {
        const difficultyQuestions = modeQuestions[difficulty] || [];
        const totalLevels = Math.max(
          difficultyQuestions.length,
          expectedCounts[difficulty]
        );

        // Find progress entries for this difficulty
        const difficultyProgress = progress.filter((entry) => {
          // Find the question that matches this progress entry
          const question = difficultyQuestions.find(
            (q) =>
              String(q.id) === String(entry.quizId) ||
              String(q.questionId) === String(entry.quizId)
          );
          return !!question;
        });

        // Calculate level-by-level progress
        const levels: LevelProgress[] = difficultyQuestions.map((question) => {
          const questionId = String(question.id || question.questionId);
          const levelProgress = difficultyProgress.find(
            (p) => String(p.quizId) === questionId
          );

          const attempts = levelProgress?.attempts || [];
          const totalAttempts = attempts.length;
          const correctAttempts = attempts.filter(
            (a: any) => a.isCorrect
          ).length;
          const totalTimeSpent = levelProgress?.totalTimeSpent || 0;
          const bestTime =
            attempts.length > 0
              ? Math.min(
                  ...attempts
                    .map((a: any) => a.timeSpent || 0)
                    .filter((t) => t > 0)
                )
              : 0;

          // Extract level number and create better title
          const levelString = question.level || `Level ${questionId}`;
          const levelTitle = question.title || "Untitled";
          const displayTitle = `${levelString}: ${levelTitle}`;

          return {
            levelId: questionId,
            title: displayTitle,
            isCompleted: levelProgress?.completed || false,
            totalAttempts,
            correctAttempts,
            totalTimeSpent,
            lastAttemptDate: levelProgress?.lastAttemptDate,
            recentAttempts: attempts.slice(0, 3),
          };
        });

        // Add placeholder levels for missing questions
        const missingCount = Math.max(
          0,
          expectedCounts[difficulty] - difficultyQuestions.length
        );

        for (let i = 0; i < missingCount; i++) {
          const levelNumber = difficultyQuestions.length + i + 1;
          levels.push({
            levelId: `placeholder_${difficulty}_${levelNumber}`,
            title: `Level ${levelNumber}: Coming Soon`,
            isCompleted: false,
            totalAttempts: 0,
            correctAttempts: 0,
            totalTimeSpent: 0,
            lastAttemptDate: null,
            recentAttempts: [],
          });
        }

        // Calculate difficulty statistics
        const completedLevels = levels.filter((l) => l.isCompleted).length;
        const totalAttempts = levels.reduce(
          (sum, l) => sum + l.totalAttempts,
          0
        );
        const correctAttempts = levels.reduce(
          (sum, l) => sum + l.correctAttempts,
          0
        );
        const totalTimeSpent = levels.reduce(
          (sum, l) => sum + l.totalTimeSpent,
          0
        );
        const completionRate =
          totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
        const averageScore =
          totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

        const allTimes = levels
          .flatMap((l) => l.recentAttempts.map((a: any) => a.timeSpent || 0))
          .filter((t) => t > 0);
        const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;
        const worstTime = allTimes.length > 0 ? Math.max(...allTimes) : 0;

        return {
          difficulty,
          totalLevels,
          completedLevels,
          totalAttempts,
          correctAttempts,
          totalTimeSpent,
          completionRate,
          averageScore,
          bestTime,
          worstTime,
          levels,
        };
      }
    );

    // Calculate overall statistics
    const totalLevels = difficultyBreakdown.reduce(
      (sum, d) => sum + d.totalLevels,
      0
    );
    const completedLevels = difficultyBreakdown.reduce(
      (sum, d) => sum + d.completedLevels,
      0
    );
    const totalAttempts = difficultyBreakdown.reduce(
      (sum, d) => sum + d.totalAttempts,
      0
    );
    const correctAttempts = difficultyBreakdown.reduce(
      (sum, d) => sum + d.correctAttempts,
      0
    );
    const totalTimeSpent = difficultyBreakdown.reduce(
      (sum, d) => sum + d.totalTimeSpent,
      0
    );
    const overallCompletionRate =
      totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
    const overallAverageScore =
      totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    const allTimes = difficultyBreakdown
      .flatMap((d) =>
        d.levels.flatMap((l) =>
          l.recentAttempts.map((a: any) => a.timeSpent || 0)
        )
      )
      .filter((t) => t > 0);

    const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;
    const worstTime = allTimes.length > 0 ? Math.max(...allTimes) : 0;

    // Collect recent attempts from all difficulties
    const recentAttempts = difficultyBreakdown
      .flatMap((d) =>
        d.levels.flatMap((l) =>
          l.recentAttempts.map((a) => ({
            ...a,
            levelId: l.levelId,
            levelTitle: l.title,
            difficulty: d.difficulty,
          }))
        )
      )
      .sort(
        (a, b) =>
          new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime()
      )
      .slice(0, 10);

    return {
      totalLevels,
      completedLevels,
      totalTimeSpent,
      totalAttempts,
      correctAttempts,
      overallCompletionRate,
      overallAverageScore,
      bestTime,
      worstTime,
      difficultyBreakdown,
      recentAttempts,
    };
  } catch (error) {
    console.error(
      `[useProgressStore] Error calculating enhanced progress:`,
      error
    );
    return null;
  }
}

export default useProgressStore;
