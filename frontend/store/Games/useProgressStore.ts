import { create } from "zustand";
import axios from "axios";
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

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
        if (level.recentAttempts && level.recentAttempts.length > 0) {
          const enrichedAttempts = level.recentAttempts.map((attempt) => ({
            ...attempt,
            levelId: level.levelId,
            levelTitle: level.title,
            difficulty: difficulty.difficulty,
          }));
          allAttempts.push(...enrichedAttempts);
        }
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
      recentAttempts, // Add the sorted recent attempts here
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

    // Clear the Map cache
    enhancedProgressCache.clear();

    set({
      progress: null,
      globalProgress: null,
      isLoading: false,
      error: null,
      lastFetched: 0,
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
      enhancedProgress: {},
      lastUpdated: Date.now(),
      currentUserId: null,
    });
  },

  // Fetch user progress (global or specific)
  fetchProgress: async (forceRefresh = false): Promise<any[] | null> => {
    const currentTime = Date.now();
    const { lastFetched, currentUserId } = get();

    // NEW: Check for user changes using dataManager
    const newUserId = getCurrentUserId();
    const userChanged = hasUserChanged(newUserId);

    if (userChanged) {
      console.log(`[ProgressStore] User changed, forcing refresh`);
      forceRefresh = true;
      setCurrentUserId(newUserId);
      set({ currentUserId: newUserId });
    } else if (currentUserId === null) {
      setCurrentUserId(newUserId);
      set({ currentUserId: newUserId });
    }

    // Use cached data if available and not forcing refresh
    if (
      !forceRefresh &&
      lastFetched > 0 &&
      currentTime - lastFetched < CACHE_EXPIRY &&
      !userChanged
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
          globalProgress: progressData, // ADD THIS LINE
          isLoading: false,
          error: null,
          lastFetched: currentTime,
          lastUpdated: Date.now(),
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
            // IMPORTANT: Clear ALL enhancedProgress cache to force reload everywhere
            enhancedProgress: {},
          });

          // Clear the Map cache as well
          enhancedProgressCache.clear();
        } else {
          // ADDED: Even for non-completed updates, clear the specific gameMode cache
          // This ensures non-completion updates (like attempts) still refresh
          const gameMode = detectGameModeFromQuizId(quizId);
          if (gameMode) {
            set((state) => ({
              enhancedProgress: {
                ...state.enhancedProgress,
                [gameMode]: null,
              },
            }));
          }
        }

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
    try {
      const { enhancedProgress, lastUpdated } = get();

      // Check store cache first (fastest)
      if (enhancedProgress[gameMode]) {
        return enhancedProgress[gameMode];
      }

      // No cache, so load data
      const progress = get().progress;
      if (!progress) return null;

      const enhancedData = await calculateEnhancedProgress(gameMode, progress);

      // Update store
      if (enhancedData) {
        set((state) => ({
          enhancedProgress: {
            ...state.enhancedProgress,
            [gameMode]: enhancedData,
          },
        }));
      }

      return enhancedData;
    } catch (error) {
      console.error("Error calculating enhanced progress:", error);
      return null;
    }
  },

  // Add a separate API for direct data access without state updates
  getEnhancedProgressDataSync: (gameMode: string) => {
    // Access existing cache directly
    const enhancedData = useProgressStore.getState().enhancedProgress[gameMode];
    if (enhancedData) return enhancedData;

    // No data available, return null
    return null;
  },

  // Clear cached data
  clearCache: () => {
    // Clear the Map cache as well
    enhancedProgressCache.clear();

    set({
      progress: null,
      globalProgress: null, // ADD THIS LINE
      lastFetched: 0,
      enhancedProgress: {},
    });
  },

  // Timestamp for last update
  lastUpdated: Date.now(),
  currentUserId: null,
}));

export default useProgressStore;
