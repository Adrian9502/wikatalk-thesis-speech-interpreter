import { create } from "zustand";
import { getToken } from "@/lib/authTokenManager";
import {
  GameModeProgress,
  EnhancedGameModeProgress,
} from "@/types/gameProgressTypes";
import useGameStore from "@/store/games/useGameStore";
import {
  getCurrentUserId,
  hasUserChanged,
  setCurrentUserId,
} from "@/utils/dataManager";
// NEW: Import the centralized service instead of hardcoded API
import { progressService } from "@/services/api/progressService";

// Cache management
const CACHE_EXPIRY = 5 * 60 * 1000;

interface ProgressState {
  // Core state
  progress: any[] | null;
  globalProgress: any[] | null;
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
  clearAllAccountData: () => void;
  refreshQuizCounts: () => void;
  // Timestamp for last update
  lastUpdated: number;

  // NEW: Add user tracking
  currentUserId: string | null;
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

// Count total quizzes for all game modes - FIXED VERSION
const getTotalQuizCount = (): number => {
  const { questions } = useGameStore.getState();

  // Add validation to ensure questions exist
  if (!questions || typeof questions !== "object") {
    console.warn("[getTotalQuizCount] Questions store is not ready");
    return 0;
  }

  let totalCount = 0;

  Object.entries(questions).forEach(([gameMode, difficulties]) => {
    if (difficulties && typeof difficulties === "object") {
      Object.entries(difficulties).forEach(([difficulty, questionList]) => {
        if (Array.isArray(questionList)) {
          totalCount += questionList.length;
          console.log(
            `[getTotalQuizCount] ${gameMode}.${difficulty}: ${questionList.length} questions`
          );
        }
      });
    }
  });

  console.log(`[getTotalQuizCount] Total quiz count: ${totalCount}`);
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
      fillBlanks: {
        completed: 0,
        total: getQuizCountByMode("fillBlanks"),
      },
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

// Add memoization to prevent recalculation
const enhancedProgressCache = new Map<string, EnhancedGameModeProgress>();

// Add this helper for chunked processing
const processInChunks = <T, R>(
  items: T[],
  processor: (item: T) => R,
  chunkSize: number = 10
): Promise<R[]> => {
  return new Promise((resolve) => {
    const results: R[] = [];
    let currentIndex = 0;

    const processChunk = () => {
      const endIndex = Math.min(currentIndex + chunkSize, items.length);

      for (let i = currentIndex; i < endIndex; i++) {
        results.push(processor(items[i]));
      }

      currentIndex = endIndex;

      if (currentIndex < items.length) {
        // Use setTimeout to yield control back to the UI thread
        setTimeout(processChunk, 0);
      } else {
        resolve(results);
      }
    };

    processChunk();
  });
};

// Replace the calculateEnhancedProgress function with this fixed version:

// Add proper types for the interface
interface DifficultyStats {
  completedLevels: number;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeSpent: number;
}

interface LevelProgress {
  levelId: string;
  title: string;
  isCompleted: boolean;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeSpent: number;
  lastAttemptDate: string | null;
  recentAttempts: any[];
}

interface DifficultyProgress {
  difficulty: string;
  totalLevels: number;
  completedLevels: number;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeSpent: number;
  completionRate: number;
  averageScore: number;
  bestTime: number;
  worstTime: number;
  levels: LevelProgress[];
}

// Optimized calculateEnhancedProgress function with proper types
async function calculateEnhancedProgress(
  gameMode: string,
  progress: any[]
): Promise<EnhancedGameModeProgress | null> {
  try {
    const { questions } = useGameStore.getState();

    if (!Array.isArray(progress) || !questions[gameMode]) {
      return null;
    }

    // Create progress map for O(1) lookups
    const progressMap = new Map(
      progress.map((entry) => [String(entry.quizId), entry])
    );

    const modeQuestions = questions[gameMode];
    const difficulties: ("easy" | "medium" | "hard")[] = [
      "easy",
      "medium",
      "hard",
    ]; // Fix readonly issue

    // Pre-calculate question counts
    const questionCounts = difficulties.reduce((acc, diff) => {
      acc[diff] = Array.isArray(modeQuestions[diff])
        ? modeQuestions[diff].length
        : 0;
      return acc;
    }, {} as Record<string, number>);

    // Process difficulties in chunks to avoid blocking - fix typing
    const difficultyBreakdown = await processInChunks<
      "easy" | "medium" | "hard",
      DifficultyProgress
    >(
      difficulties,
      (difficulty: "easy" | "medium" | "hard"): DifficultyProgress => {
        const difficultyQuestions = modeQuestions[difficulty] || [];
        const totalLevels = Math.max(
          difficultyQuestions.length,
          questionCounts[difficulty]
        );

        // Process levels efficiently
        const levels: LevelProgress[] = difficultyQuestions.map(
          (question: any) => {
            const questionId = String(question.id || question.questionId);
            const levelProgress = progressMap.get(questionId);

            if (!levelProgress) {
              return {
                levelId: questionId,
                title: `${question.level || `Level ${questionId}`}: ${
                  question.title || "Untitled"
                }`,
                isCompleted: false,
                totalAttempts: 0,
                correctAttempts: 0,
                totalTimeSpent: 0,
                lastAttemptDate: null,
                recentAttempts: [],
              };
            }

            const attempts = levelProgress.attempts || [];
            return {
              levelId: questionId,
              title: `${question.level || `Level ${questionId}`}: ${
                question.title || "Untitled"
              }`,
              isCompleted: levelProgress.completed || false,
              totalAttempts: attempts.length,
              correctAttempts: attempts.filter((a: any) => a.isCorrect).length,
              totalTimeSpent: levelProgress.totalTimeSpent || 0,
              lastAttemptDate: levelProgress.lastAttemptDate,
              recentAttempts: attempts.slice(0, 3),
            };
          }
        );

        // Calculate stats efficiently - fix typing
        const stats: DifficultyStats = levels.reduce(
          (acc: DifficultyStats, level: LevelProgress) => {
            if (level.isCompleted) acc.completedLevels++;
            acc.totalAttempts += level.totalAttempts;
            acc.correctAttempts += level.correctAttempts;
            acc.totalTimeSpent += level.totalTimeSpent;
            return acc;
          },
          {
            completedLevels: 0,
            totalAttempts: 0,
            correctAttempts: 0,
            totalTimeSpent: 0,
          }
        );

        return {
          difficulty,
          totalLevels,
          ...stats,
          completionRate:
            totalLevels > 0 ? (stats.completedLevels / totalLevels) * 100 : 0,
          averageScore:
            stats.totalAttempts > 0
              ? (stats.correctAttempts / stats.totalAttempts) * 100
              : 0,
          bestTime: 0,
          worstTime: 0,
          levels,
        };
      },
      2 // Process 2 difficulties at a time
    );

    // Calculate overall stats - fix typing
    interface OverallStats {
      totalLevels: number;
      completedLevels: number;
      totalAttempts: number;
      correctAttempts: number;
      totalTimeSpent: number;
    }

    const overallStats: OverallStats = difficultyBreakdown.reduce(
      (acc: OverallStats, diff: DifficultyProgress) => {
        acc.totalLevels += diff.totalLevels;
        acc.completedLevels += diff.completedLevels;
        acc.totalAttempts += diff.totalAttempts;
        acc.correctAttempts += diff.correctAttempts;
        acc.totalTimeSpent += diff.totalTimeSpent;
        return acc;
      },
      {
        totalLevels: 0,
        completedLevels: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        totalTimeSpent: 0,
      }
    );

    // Add this code to collect recent attempts from all difficulties
    const allAttempts: any[] = [];

    // Collect recent attempts from all levels across all difficulties
    difficultyBreakdown.forEach((difficulty) => {
      difficulty.levels.forEach((level) => {
        level.recentAttempts.forEach((attempt) => {
          allAttempts.push({
            ...attempt,
            levelId: level.levelId,
            levelTitle: level.title,
          });
        });
      });
    });

    // Sort by most recent first
    const recentAttempts = allAttempts
      .sort(
        (a, b) =>
          new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime()
      )
      .slice(0, 10); // Keep only the 10 most recent attempts

    return {
      ...overallStats,
      overallCompletionRate:
        overallStats.totalLevels > 0
          ? (overallStats.completedLevels / overallStats.totalLevels) * 100
          : 0,
      overallAverageScore:
        overallStats.totalAttempts > 0
          ? (overallStats.correctAttempts / overallStats.totalAttempts) * 100
          : 0,
      bestTime: 0,
      worstTime: 0,
      difficultyBreakdown,
      recentAttempts,
    };
  } catch (error) {
    console.error(`Error calculating enhanced progress:`, error);
    return null;
  }
}

const useProgressStore = create<ProgressState>((set, get) => ({
  // Initial state
  progress: null,
  globalProgress: null,
  isLoading: false,
  error: null,
  lastFetched: 0,

  // FIXED: Better initial game progress metrics
  totalCompletedCount: 0,
  totalQuizCount: 0, // Start with 0, will be updated when questions load
  gameProgress: {
    multipleChoice: {
      completed: 0,
      total: 0, // Will be updated
    },
    identification: {
      completed: 0,
      total: 0, // Will be updated
    },
    fillBlanks: {
      completed: 0,
      total: 0, // Will be updated
    },
  },

  // Enhanced progress data storage
  enhancedProgress: {},

  // Format quiz ID for API
  formatQuizId: (id: string | number): string => {
    if (id === "global") return "global";
    const numericId =
      typeof id === "string" ? id.replace(/^n-/, "") : String(id);
    return `n-${numericId}`;
  },

  // NEW: Clear all account-specific data
  clearAllAccountData: () => {
    console.log("[ProgressStore] Clearing all account-specific data");
    set({
      progress: null,
      globalProgress: null,
      isLoading: false,
      error: null,
      lastFetched: 0,
      totalCompletedCount: 0,
      totalQuizCount: 0,
      gameProgress: {
        multipleChoice: { completed: 0, total: 0 },
        identification: { completed: 0, total: 0 },
        fillBlanks: { completed: 0, total: 0 },
      },
      enhancedProgress: {},
      lastUpdated: 0,
      currentUserId: null,
    });
  },

  refreshQuizCounts: () => {
    const newTotalCount = getTotalQuizCount();

    console.log(
      `[ProgressStore] Refreshing quiz counts - Total: ${newTotalCount}`
    );

    set((state) => ({
      totalQuizCount: newTotalCount,
      gameProgress: {
        multipleChoice: {
          ...state.gameProgress.multipleChoice,
          total: getQuizCountByMode("multipleChoice"),
        },
        identification: {
          ...state.gameProgress.identification,
          total: getQuizCountByMode("identification"),
        },
        fillBlanks: {
          ...state.gameProgress.fillBlanks,
          total: getQuizCountByMode("fillBlanks"),
        },
      },
    }));
  },

  // Enhanced fetchProgress method
  fetchProgress: async (forceRefresh = false): Promise<any[] | null> => {
    const currentTime = Date.now();
    const { lastFetched, currentUserId, progress } = get();

    // Check for user changes
    const newUserId = getCurrentUserId();
    const userChanged = hasUserChanged(newUserId);

    if (userChanged) {
      console.log(`[ProgressStore] User changed, forcing refresh`);
      forceRefresh = true;
      setCurrentUserId(newUserId);
      set({ currentUserId: newUserId });
    }

    // Check cache validity
    if (
      !forceRefresh &&
      progress &&
      Array.isArray(progress) &&
      currentTime - lastFetched < CACHE_EXPIRY
    ) {
      console.log("[ProgressStore] Using cached progress data");
      return progress;
    }

    console.log(
      `[ProgressStore] Fetching fresh progress data (force: ${forceRefresh})`
    );

    try {
      set({ isLoading: true, error: null });

      const token = getToken();
      if (!token) {
        console.log("[ProgressStore] No token found");
        set({ isLoading: false });
        return [];
      }

      // NEW: Use centralized service instead of direct axios call
      const response = await progressService.getAllProgressForStore();

      if (response.success) {
        const progressData = response.progressEntries;
        console.log(
          `[ProgressStore] Fresh progress fetched: ${progressData.length} entries`
        );

        // Calculate game progress
        const gameProgress = calculateGameProgress(progressData);
        const totalCompleted = progressData.filter(
          (p: any) => p.completed
        ).length;

        // FIXED: Ensure quiz counts are up to date
        const currentTotalQuizCount = getTotalQuizCount();

        set({
          progress: progressData,
          globalProgress: progressData,
          gameProgress,
          totalCompletedCount: totalCompleted,
          totalQuizCount: currentTotalQuizCount,
          lastFetched: currentTime,
          lastUpdated: currentTime,
          isLoading: false,
          error: null,
        });

        return progressData;
      } else {
        throw new Error(response.message || "Failed to fetch progress");
      }
    } catch (error) {
      console.error("Error fetching progress:", error);

      // FIXED: Still refresh quiz counts on error
      get().refreshQuizCounts();

      // NEW: Better error handling for centralized API
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch progress";

      set({
        isLoading: false,
        error: errorMessage,
      });
      return progress || [];
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

      // NEW: Use centralized service instead of direct axios call
      const response = await progressService.updateProgressForStore(
        formattedId,
        {
          timeSpent,
          completed,
          isCorrect,
        }
      );

      if (response.success) {
        console.log(`[useProgressStore] Progress update successful!`);

        // Always update timestamp for ANY progress update
        set({
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
        });

        // If an item was completed, refresh global progress data immediately
        if (completed) {
          console.log(
            `[useProgressStore] Level completed - refreshing ALL progress data`
          );
          await get().fetchProgress(true);

          // Force UI update by updating timestamp and clearing caches
          set({
            lastUpdated: Date.now(),
          });

          console.log(
            `[useProgressStore] Global progress refreshed after completion`
          );
        }

        return response.data || response;
      } else {
        throw new Error(response.message || "Failed to update progress");
      }
    } catch (error: any) {
      console.error("Error updating progress:", error);

      // NEW: Better error handling for centralized API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update progress";

      set({
        isLoading: false,
        error: errorMessage,
      });
      return null;
    }
  },

  getGameModeProgress: (gameMode: string): GameModeProgress => {
    const { gameProgress } = get();
    return (
      gameProgress[gameMode] || {
        completed: 0,
        total: getQuizCountByMode(gameMode),
      }
    );
  },

  getEnhancedGameProgress: async (
    gameMode: string
  ): Promise<EnhancedGameModeProgress | null> => {
    const cacheKey = `enhanced_${gameMode}`;
    const { enhancedProgress } = get();

    // Check if we have cached data
    if (enhancedProgress[gameMode]) {
      console.log(
        `[ProgressStore] Using cached enhanced progress for ${gameMode}`
      );
      return enhancedProgress[gameMode];
    }

    try {
      // Ensure we have global progress data
      const { globalProgress } = get();
      let progressData = globalProgress;

      if (!progressData || !Array.isArray(progressData)) {
        console.log(
          `[ProgressStore] No progress data, fetching for ${gameMode}`
        );
        progressData = await get().fetchProgress();
      }

      if (!progressData || !Array.isArray(progressData)) {
        console.log(`[ProgressStore] Still no progress data for ${gameMode}`);
        return null;
      }

      console.log(
        `[ProgressStore] Calculating enhanced progress for ${gameMode}`
      );
      const enhancedData = await calculateEnhancedProgress(
        gameMode,
        progressData
      );

      // Cache the result
      set((state) => ({
        enhancedProgress: {
          ...state.enhancedProgress,
          [gameMode]: enhancedData,
        },
      }));

      return enhancedData;
    } catch (error) {
      console.error(
        `[ProgressStore] Error getting enhanced progress for ${gameMode}:`,
        error
      );
      return null;
    }
  },

  getEnhancedProgressDataSync: (gameMode: string) => {
    const { enhancedProgress } = get();
    return enhancedProgress[gameMode] || null;
  },

  clearCache: () => {
    console.log("[ProgressStore] Clearing all cached data");
    set({
      lastFetched: 0,
      enhancedProgress: {},
      lastUpdated: Date.now(),
    });
  },

  lastUpdated: Date.now(),
  currentUserId: null,
}));

// Add debouncing to ProgressStats updates

let progressStatsTimeout: NodeJS.Timeout | null = null;

const updateProgressStats = (stats: any) => {
  if (progressStatsTimeout) {
    clearTimeout(progressStatsTimeout);
  }

  progressStatsTimeout = setTimeout(() => {
    console.log("[ProgressStats] Progress updated:", stats);
    // Your existing progress stats logic
    progressStatsTimeout = null;
  }, 500); // 500ms debounce
};

export default useProgressStore;
