import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useGameStore from "@/store/games/useGameStore";
import useProgressStore from "@/store/games/useProgressStore";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import useCoinsStore from "@/store/games/useCoinsStore";
import { convertQuizToLevels } from "@/utils/games/convertQuizToLevels";
import { LevelData, QuizQuestions } from "@/types/gameTypes";

interface FilteredLevels {
  all: LevelData[];
  completed: LevelData[];
  current: LevelData[];
  easy: LevelData[];
  medium: LevelData[];
  hard: LevelData[];
}

interface CompletedLevelDetails {
  question: string;
  answer: string;
  timeSpent: number;
  completedDate: string;
  isCorrect: boolean;
  totalAttempts: number;
  correctAttempts: number;
}

interface SplashState {
  isLoadingComplete: boolean;
  splashShown: boolean;
  gameDataPreloaded: boolean;
  progressDataPrecomputed: boolean;
  levelsPrecomputed: boolean;
  levelDetailsPrecomputed: boolean;

  // Store precomputed levels for each game mode with filters
  precomputedLevels: {
    [gameMode: string]: {
      levels: LevelData[];
      completionPercentage: number;
      lastUpdated: number;
      filteredLevels: FilteredLevels;
    };
  };

  // Store precomputed level details for completed levels
  precomputedLevelDetails: {
    [levelId: string]: CompletedLevelDetails;
  };

  // Cache individual progress entries
  individualProgressCache: {
    [quizId: string]: any;
  };

  // ADD: Missing enhancedProgress property
  enhancedProgress: {
    [gameMode: string]: any;
  };

  markLoadingComplete: () => void;
  markSplashShown: () => void;
  markGameDataPreloaded: () => void;
  markProgressDataPrecomputed: () => void;
  markLevelsPrecomputed: () => void;
  markLevelDetailsPrecomputed: () => void;
  preloadGameData: () => Promise<boolean>;
  precomputeAllProgressData: () => Promise<boolean>;
  precomputeAllLevels: () => Promise<boolean>;
  precomputeAllLevelDetails: () => Promise<boolean>;
  getLevelsForMode: (gameMode: string) => {
    levels: LevelData[];
    completionPercentage: number;
    filteredLevels: FilteredLevels;
  } | null;
  getFilteredLevels: (
    gameMode: string,
    filter: keyof FilteredLevels
  ) => LevelData[];
  getLevelDetails: (levelId: string | number) => CompletedLevelDetails | null;
  getIndividualProgress: (quizId: string) => any | null;
  setIndividualProgress: (quizId: string, progress: any) => void;
  clearIndividualProgress: (quizId: string) => void;
  precomputeIndividualProgress: () => Promise<boolean>;
  precomputeSpecificGameMode: (
    gameMode: string,
    levels?: LevelData[],
    progressData?: any[]
  ) => Promise<void>;
  reset: () => void;
}

// Helper function to precompute all filters for a set of levels
const precomputeFilters = (levels: LevelData[]): FilteredLevels => {
  console.log(`[SplashStore] Precomputing filters for ${levels.length} levels`);

  const startTime = Date.now();

  const filteredLevels: FilteredLevels = {
    all: levels, // All levels (no filtering needed)
    completed: levels.filter((level) => level.status === "completed"),
    current: levels.filter((level) => level.status === "current"),
    easy: levels.filter(
      (level) =>
        level.difficulty === "Easy" || level.difficultyCategory === "easy"
    ),
    medium: levels.filter(
      (level) =>
        level.difficulty === "Medium" || level.difficultyCategory === "medium"
    ),
    hard: levels.filter(
      (level) =>
        level.difficulty === "Hard" || level.difficultyCategory === "hard"
    ),
  };

  const duration = Date.now() - startTime;
  console.log(`[SplashStore] Filters precomputed in ${duration}ms:`, {
    all: filteredLevels.all.length,
    completed: filteredLevels.completed.length,
    current: filteredLevels.current.length,
    easy: filteredLevels.easy.length,
    medium: filteredLevels.medium.length,
    hard: filteredLevels.hard.length,
  });

  return filteredLevels;
};

// Helper function to extract question and answer (updated)
const extractQuestionAndAnswerFromData = (
  levelData: any,
  progressData: any
) => {
  let question = "Question not available";
  let answer = "Answer not available";

  try {
    // Extract question
    if (levelData.question) {
      question = levelData.question;
    } else if (levelData.sentence) {
      question = levelData.sentence;
    } else if (levelData.prompt) {
      question = levelData.prompt;
    } else if (levelData.title) {
      question = levelData.title;
    }

    // UPDATED: Extract answer based on mode using unified options
    if (levelData.answer) {
      // Direct answer (fillBlanks, identification)
      answer = levelData.answer;
    } else if (levelData.options && Array.isArray(levelData.options)) {
      // UPDATED: Handle both multipleChoice and identification using options
      const mode = levelData.mode;

      if (mode === "multipleChoice") {
        // Multiple choice mode - find correct option
        const correctOption = levelData.options.find(
          (opt: any) => opt.isCorrect
        );
        if (correctOption) {
          answer =
            correctOption.text || correctOption.label || correctOption.value;
        }
      } else if (mode === "identification") {
        // Identification mode - find option that matches the answer
        const correctOption = levelData.options.find(
          (opt: any) =>
            opt.text === levelData.answer || opt.id === levelData.answer
        );
        if (correctOption) {
          answer = correctOption.text;
        }
      }
    }

    // Use progress data if available
    if (
      progressData &&
      progressData.attempts &&
      progressData.attempts.length > 0
    ) {
      const lastCorrectAttempt = progressData.attempts
        .slice()
        .reverse()
        .find((attempt: any) => attempt.isCorrect);

      if (lastCorrectAttempt && lastCorrectAttempt.userAnswer) {
        answer = lastCorrectAttempt.userAnswer;
      }
    }

    // Final fallbacks
    if (question === "Question not available") {
      question =
        levelData.title || levelData.description || `Level ${levelData.id}`;
    }

    if (answer === "Answer not available") {
      if (levelData.answer) {
        answer = levelData.answer;
      } else {
        answer = "Completed successfully";
      }
    }
  } catch (err) {
    console.error("[SplashStore] Error extracting Q&A:", err);
    question =
      levelData.title || levelData.description || `Level ${levelData.id}`;
    answer = "Completed successfully";
  }

  return { question, answer };
};

export const useSplashStore = create<SplashState>((set, get) => ({
  isLoadingComplete: false,
  splashShown: false,
  gameDataPreloaded: false,
  progressDataPrecomputed: false,
  levelsPrecomputed: false,
  levelDetailsPrecomputed: false,
  precomputedLevels: {},
  precomputedLevelDetails: {},
  individualProgressCache: {},
  enhancedProgress: {},
  markLoadingComplete: () => set({ isLoadingComplete: true }),
  markSplashShown: () => set({ splashShown: true }),
  markGameDataPreloaded: () => set({ gameDataPreloaded: true }),
  markProgressDataPrecomputed: () => set({ progressDataPrecomputed: true }),
  markLevelsPrecomputed: () => set({ levelsPrecomputed: true }),
  markLevelDetailsPrecomputed: () => set({ levelDetailsPrecomputed: true }),

  reset: () =>
    set({
      isLoadingComplete: false,
      splashShown: false,
      gameDataPreloaded: false,
      progressDataPrecomputed: false,
      levelsPrecomputed: false,
      levelDetailsPrecomputed: false,
      precomputedLevels: {},
      precomputedLevelDetails: {},
      individualProgressCache: {},
    }),

  // ADD: Missing individual progress cache methods
  getIndividualProgress: (quizId: string) => {
    const { individualProgressCache } = get();
    const formattedId = quizId.replace(/^n-/, "");
    return individualProgressCache[formattedId] || null;
  },

  setIndividualProgress: (quizId: string, progress: any) => {
    const formattedId = quizId.replace(/^n-/, "");

    console.log(
      `[SplashStore] Updating individual cache for ${formattedId}:`,
      progress
    );

    set((state) => ({
      individualProgressCache: {
        ...state.individualProgressCache,
        [formattedId]: progress,
      },
    }));
  },

  // NEW: Add a method to clear individual progress cache entry
  clearIndividualProgress: (quizId: string) => {
    const formattedId = quizId.replace(/^n-/, "");

    console.log(`[SplashStore] Clearing individual cache for ${formattedId}`);

    set((state) => {
      const newCache = { ...state.individualProgressCache };
      delete newCache[formattedId];
      return {
        individualProgressCache: newCache,
      };
    });
  },

  precomputeIndividualProgress: async () => {
    try {
      console.log("[SplashStore] Precomputing individual progress cache");
      const progressStore = useProgressStore.getState();
      const globalProgress = progressStore.progress;

      if (!Array.isArray(globalProgress)) {
        console.warn(
          "[SplashStore] No global progress available for individual caching"
        );
        return false;
      }

      const individualCache: { [quizId: string]: any } = {};

      // Convert global progress array to individual cache
      globalProgress.forEach((entry) => {
        if (entry && entry.quizId) {
          const cleanId = String(entry.quizId).replace(/^n-/, "");
          individualCache[cleanId] = entry;
        }
      });

      set({ individualProgressCache: individualCache });

      console.log(
        `[SplashStore] ✅ Individual progress cached for ${
          Object.keys(individualCache).length
        } entries`
      );
      return true;
    } catch (error) {
      console.error(
        "[SplashStore] Error precomputing individual progress:",
        error
      );
      return false;
    }
  },

  // NEW: Precompute all level details for completed levels
  precomputeAllLevelDetails: async () => {
    try {
      console.log(
        "[SplashStore] Starting comprehensive level details precomputation"
      );
      const gameStore = useGameStore.getState();
      const progressStore = useProgressStore.getState();

      const { questions } = gameStore;
      const globalProgress = progressStore.progress;

      if (!questions || !globalProgress) {
        console.warn(
          "[SplashStore] Missing data for level details precomputation"
        );
        return false;
      }

      const precomputedLevelDetails: {
        [levelId: string]: CompletedLevelDetails;
      } = {};

      // Process ALL progress entries (not just completed ones)
      const allProgress = Array.isArray(globalProgress) ? globalProgress : [];

      console.log(
        `[SplashStore] Processing ${allProgress.length} progress entries`
      );

      for (const progressEntry of allProgress) {
        try {
          const levelId = String(progressEntry.quizId).replace(/^n-/, "");

          // Find the question data
          let questionData = null;
          let gameMode = null;

          // Search through all game modes and difficulties
          for (const [mode, difficulties] of Object.entries(questions)) {
            if (!difficulties || typeof difficulties !== "object") continue;

            for (const [difficulty, questionList] of Object.entries(
              difficulties
            )) {
              if (!Array.isArray(questionList)) continue;

              const found = questionList.find(
                (q: any) => String(q.id || q.questionId) === levelId
              );

              if (found) {
                questionData = found;
                gameMode = mode;
                break;
              }
            }

            if (questionData) break;
          }

          if (!questionData) {
            console.warn(
              `[SplashStore] No question data found for level ${levelId}`
            );
            continue;
          }

          // Extract question and answer
          const { question, answer } = extractQuestionAndAnswerFromData(
            questionData,
            progressEntry
          );

          // Calculate stats
          const attempts = progressEntry.attempts || [];
          const totalAttempts = Math.max(attempts.length, 1); // At least 1 attempt
          const correctAttempts = attempts.filter(
            (a: any) => a.isCorrect
          ).length;

          // Format date
          const lastAttempt = attempts[attempts.length - 1];
          const completedDate = new Date(
            lastAttempt?.attemptDate ||
              progressEntry.lastAttemptDate ||
              new Date()
          );
          const formattedDate = completedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          // Store the details for ANY level with progress (not just completed)
          precomputedLevelDetails[levelId] = {
            question,
            answer,
            timeSpent: progressEntry.totalTimeSpent || 0,
            completedDate: formattedDate,
            isCorrect: progressEntry.completed || correctAttempts > 0,
            totalAttempts,
            correctAttempts: Math.max(
              correctAttempts,
              progressEntry.completed ? 1 : 0
            ),
          };

          console.log(
            `[SplashStore] Precomputed details for level ${levelId}: ${
              progressEntry.completed ? "COMPLETED" : "IN_PROGRESS"
            }`
          );
        } catch (error) {
          console.error(
            `[SplashStore] Error processing level ${progressEntry.quizId}:`,
            error
          );
        }
      }

      // Update store
      set({ precomputedLevelDetails, levelDetailsPrecomputed: true });

      console.log(
        `[SplashStore] ✅ Level details precomputed for ${
          Object.keys(precomputedLevelDetails).length
        } levels`
      );
      return true;
    } catch (error) {
      console.error(
        "[SplashStore] Error in level details precomputation:",
        error
      );
      return false;
    }
  },

  // NEW: Get precomputed level details
  getLevelDetails: (levelId: string | number): CompletedLevelDetails | null => {
    const { precomputedLevelDetails } = get();
    const stringId = String(levelId).replace(/^n-/, "");
    return precomputedLevelDetails[stringId] || null;
  },

  // Enhanced function to precompute all levels with filters
  precomputeAllLevels: async () => {
    try {
      console.log("[SplashStore] Starting levels precomputation with filters");
      const gameStore = useGameStore.getState();
      const progressStore = useProgressStore.getState();

      const { questions } = gameStore;
      const globalProgress = progressStore.progress;

      if (!questions || !globalProgress) {
        console.warn(
          "[SplashStore] Missing questions or progress data for levels precomputation"
        );
        return false;
      }

      const modes = ["multipleChoice", "identification", "fillBlanks"];
      const precomputedLevels: any = {};

      for (const mode of modes) {
        try {
          console.log(
            `[SplashStore] Precomputing levels and filters for ${mode}`
          );
          const startTime = Date.now();

          const progressArray = Array.isArray(globalProgress)
            ? globalProgress
            : [];
          const levels = convertQuizToLevels(
            mode,
            questions as QuizQuestions,
            progressArray
          );

          const completedCount = levels.filter(
            (level) => level.status === "completed"
          ).length;
          const completionPercentage =
            levels.length > 0
              ? Math.round((completedCount / levels.length) * 100)
              : 0;

          const filteredLevels = precomputeFilters(levels);

          precomputedLevels[mode] = {
            levels,
            completionPercentage,
            lastUpdated: Date.now(),
            filteredLevels,
          };

          const duration = Date.now() - startTime;
          console.log(
            `[SplashStore] Levels and filters for ${mode} precomputed in ${duration}ms (${levels.length} levels, ${completionPercentage}% complete)`
          );
        } catch (error) {
          console.error(
            `[SplashStore] Error precomputing levels for ${mode}:`,
            error
          );
        }
      }

      set({ precomputedLevels, levelsPrecomputed: true });

      console.log(
        "[SplashStore] ✅ All levels and filters precomputation complete"
      );
      return true;
    } catch (error) {
      console.error("[SplashStore] Error in levels precomputation:", error);
      return false;
    }
  },

  // Enhanced function to get levels for a specific mode
  getLevelsForMode: (gameMode: string) => {
    const { precomputedLevels } = get();
    return precomputedLevels[gameMode] || null;
  },

  // NEW: Function to get filtered levels instantly
  getFilteredLevels: (
    gameMode: string,
    filter: keyof FilteredLevels
  ): LevelData[] => {
    const { precomputedLevels } = get();
    const modeData = precomputedLevels[gameMode];

    if (!modeData || !modeData.filteredLevels) {
      console.warn(
        `[SplashStore] No precomputed filters found for ${gameMode}`
      );
      return [];
    }

    return modeData.filteredLevels[filter] || [];
  },

  // Enhanced function to precompute ALL progress data during splash
  precomputeAllProgressData: async () => {
    try {
      console.log("[SplashStore] Starting FULL progress data precomputation");
      const progressStore = useProgressStore.getState();

      // 1. Ensure we have fresh progress data
      const progressData = await progressStore.fetchProgress(true);
      if (!progressData) {
        console.warn(
          "[SplashStore] No progress data available for precomputation"
        );
        return false;
      }

      console.log(
        "[SplashStore] Progress data fetched, starting enhanced calculations"
      );

      // 2. Precompute enhanced progress for ALL game modes in parallel
      const modes = ["multipleChoice", "identification", "fillBlanks"];

      const enhancedPromises = modes.map(async (mode) => {
        try {
          console.log(
            `[SplashStore] Precomputing enhanced progress for ${mode}`
          );
          const startTime = Date.now();

          // Force calculation (don't use cache)
          const result = await progressStore.getEnhancedGameProgress(mode);

          const duration = Date.now() - startTime;
          console.log(
            `[SplashStore] Enhanced progress for ${mode} computed in ${duration}ms`
          );

          return { mode, result, success: true };
        } catch (error) {
          console.error(
            `[SplashStore] Failed to compute enhanced progress for ${mode}:`,
            error
          );
          return { mode, result: null, success: false };
        }
      });

      // Wait for all enhanced progress calculations
      const results = await Promise.allSettled(enhancedPromises);

      // Log results
      let successCount = 0;
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
          successCount++;
          console.log(
            `[SplashStore] ✅ Enhanced progress precomputed for ${modes[index]}`
          );
        } else {
          console.warn(
            `[SplashStore] ❌ Failed to precompute enhanced progress for ${modes[index]}`
          );
        }
      });

      // Mark as complete if at least one succeeded
      const allSuccessful = successCount === modes.length;
      set({ progressDataPrecomputed: allSuccessful });

      console.log(
        `[SplashStore] Progress precomputation complete: ${successCount}/${modes.length} successful`
      );
      return allSuccessful;
    } catch (error) {
      console.error("[SplashStore] Error precomputing progress data:", error);
      return false;
    }
  },

  // Updated main preload function
  preloadGameData: async () => {
    try {
      console.log("[SplashStore] Starting comprehensive game data preloading");

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.log("[SplashStore] No auth token found, skipping preloading");
        return false;
      }

      // Phase 1: Load core data first
      console.log("[SplashStore] Phase 1: Loading core game data");
      const corePromises = [];
      const gameStore = useGameStore.getState();
      const progressStore = useProgressStore.getState();
      const coinsStore = useCoinsStore.getState();

      corePromises.push(gameStore.ensureQuestionsLoaded());
      corePromises.push(progressStore.fetchProgress(true));
      corePromises.push(coinsStore.prefetchRewardsData());

      await Promise.all(corePromises);
      console.log("[SplashStore] Phase 1 complete: Core data loaded");

      // Phase 2: Precompute individual progress cache
      console.log(
        "[SplashStore] Phase 2: Precomputing individual progress cache"
      );
      const individualProgressSuccess =
        await get().precomputeIndividualProgress();

      // Phase 3: Precompute ALL progress data
      console.log("[SplashStore] Phase 3: Precomputing all progress data");
      const progressPrecomputeSuccess = await get().precomputeAllProgressData();

      // Phase 4: Precompute ALL levels with filters
      console.log(
        "[SplashStore] Phase 4: Precomputing all levels with filters"
      );
      const levelsPrecomputeSuccess = await get().precomputeAllLevels();

      // Phase 5: Precompute level details for completed levels
      console.log("[SplashStore] Phase 5: Precomputing level details");
      const levelDetailsPrecomputeSuccess =
        await get().precomputeAllLevelDetails();

      if (individualProgressSuccess) {
        console.log("[SplashStore] Individual progress cached successfully");
      } else {
        console.warn("[SplashStore] Individual progress caching failed");
      }

      // Phase 6: Load other data in background (don't wait)
      console.log("[SplashStore] Phase 6: Loading background data");
      const backgroundPromises = [];
      const pronunciationStore = usePronunciationStore.getState();

      backgroundPromises.push(pronunciationStore.fetchPronunciations());
      backgroundPromises.push(coinsStore.fetchCoinsBalance());
      backgroundPromises.push(coinsStore.checkDailyReward());

      // Don't wait for background data
      Promise.allSettled(backgroundPromises).then(() => {
        console.log("[SplashStore] Phase 6 complete: Background data loaded");
      });

      set({ gameDataPreloaded: true });
      console.log(
        "[SplashStore] ✅ Comprehensive game data preloading complete"
      );
      return true;
    } catch (error) {
      console.error("[SplashStore] Error in comprehensive preloading:", error);
      return false;
    }
  },

  // Add this method to the SplashStore
  precomputeSpecificGameMode: async (
    gameMode: string,
    levels?: LevelData[],
    progressData?: any[]
  ) => {
    const state = get();

    // Add debouncing to prevent duplicate processing
    let precomputeTimeout: NodeJS.Timeout | null = null;

    // In the precomputeSpecificGameMode function:
    // ADDED: Debounce to prevent duplicate calls
    if (precomputeTimeout) {
      clearTimeout(precomputeTimeout);
    }

    precomputeTimeout = setTimeout(async () => {
      try {
        if (__DEV__) {
          console.log(
            `[SplashStore] Precomputing specific game mode: ${gameMode}`
          );
        }

        const startTime = Date.now();
        const filteredLevels = precomputeFilters(levels);

        const completedCount = levels.filter(
          (level) => level.status === "completed"
        ).length;
        const completionPercentage =
          levels.length > 0
            ? Math.round((completedCount / levels.length) * 100)
            : 0;

        set((state) => ({
          precomputedLevels: {
            ...state.precomputedLevels,
            [gameMode]: {
              levels,
              completionPercentage,
              lastUpdated: Date.now(),
              filteredLevels,
            },
          },
        }));

        const duration = Date.now() - startTime;

        // REDUCED: Only log summary
        if (__DEV__) {
          console.log(
            `[SplashStore] ✅ ${gameMode} precomputed: ${levels.length} levels (${duration}ms)`
          );
        }

        return true;
      } catch (error) {
        console.error(`[SplashStore] Error precomputing ${gameMode}:`, error);
        return false;
      }
    }, 100); // 100ms debounce
  },
}));

// Helper functions
export const isGameDataPreloaded = (): boolean => {
  return useSplashStore.getState().gameDataPreloaded;
};

export const isProgressDataPrecomputed = (): boolean => {
  return useSplashStore.getState().progressDataPrecomputed;
};

export const isLevelsPrecomputed = (): boolean => {
  return useSplashStore.getState().levelsPrecomputed;
};

export const isLevelDetailsPrecomputed = (): boolean => {
  return useSplashStore.getState().levelDetailsPrecomputed;
};

export const isAllDataReady = (): boolean => {
  const state = useSplashStore.getState();
  return (
    state.gameDataPreloaded &&
    state.progressDataPrecomputed &&
    state.levelsPrecomputed
  );
};

export const getLevelsForGameMode = (gameMode: string) => {
  return useSplashStore.getState().getLevelsForMode(gameMode);
};

// NEW: Helper function to get filtered levels instantly
export const getFilteredLevelsForGameMode = (
  gameMode: string,
  filter: keyof FilteredLevels
): LevelData[] => {
  return useSplashStore.getState().getFilteredLevels(gameMode, filter);
};

// NEW: Helper function to get level details
export const getLevelDetailsForLevel = (
  levelId: string | number
): CompletedLevelDetails | null => {
  return useSplashStore.getState().getLevelDetails(levelId);
};

// NEW: Helper function to get individual progress
export const getIndividualProgressFromCache = (quizId: string | number) => {
  return useSplashStore.getState().getIndividualProgress(String(quizId));
};

// NEW: Helper function to clear individual progress cache
export const clearIndividualProgressFromCache = (quizId: string | number) => {
  return useSplashStore.getState().clearIndividualProgress(String(quizId));
};
