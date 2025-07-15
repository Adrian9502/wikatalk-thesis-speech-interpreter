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

interface SplashState {
  isLoadingComplete: boolean;
  splashShown: boolean;
  gameDataPreloaded: boolean;
  progressDataPrecomputed: boolean;
  levelsPrecomputed: boolean;

  // Store precomputed levels for each game mode with filters
  precomputedLevels: {
    [gameMode: string]: {
      levels: LevelData[];
      completionPercentage: number;
      lastUpdated: number;
      // Add precomputed filters
      filteredLevels: FilteredLevels;
    };
  };

  markLoadingComplete: () => void;
  markSplashShown: () => void;
  markGameDataPreloaded: () => void;
  markProgressDataPrecomputed: () => void;
  markLevelsPrecomputed: () => void;
  preloadGameData: () => Promise<boolean>;
  precomputeAllProgressData: () => Promise<boolean>;
  precomputeAllLevels: () => Promise<boolean>;
  getLevelsForMode: (
    gameMode: string
  ) => {
    levels: LevelData[];
    completionPercentage: number;
    filteredLevels: FilteredLevels;
  } | null;
  getFilteredLevels: (
    gameMode: string,
    filter: keyof FilteredLevels
  ) => LevelData[];
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

export const useSplashStore = create<SplashState>((set, get) => ({
  isLoadingComplete: false,
  splashShown: false,
  gameDataPreloaded: false,
  progressDataPrecomputed: false,
  levelsPrecomputed: false,
  precomputedLevels: {},

  markLoadingComplete: () => set({ isLoadingComplete: true }),
  markSplashShown: () => set({ splashShown: true }),
  markGameDataPreloaded: () => set({ gameDataPreloaded: true }),
  markProgressDataPrecomputed: () => set({ progressDataPrecomputed: true }),
  markLevelsPrecomputed: () => set({ levelsPrecomputed: true }),

  reset: () =>
    set({
      isLoadingComplete: false,
      splashShown: false,
      gameDataPreloaded: false,
      progressDataPrecomputed: false,
      levelsPrecomputed: false,
      precomputedLevels: {},
    }),

  // Enhanced function to precompute all levels with filters
  precomputeAllLevels: async () => {
    try {
      console.log("[SplashStore] Starting levels precomputation with filters");
      const gameStore = useGameStore.getState();
      const progressStore = useProgressStore.getState();

      // Ensure we have questions and progress data
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

          // Convert quiz data to levels
          const progressArray = Array.isArray(globalProgress)
            ? globalProgress
            : [];
          const levels = convertQuizToLevels(
            mode,
            questions as QuizQuestions,
            progressArray
          );

          // Calculate completion percentage
          const completedCount = levels.filter(
            (level) => level.status === "completed"
          ).length;
          const completionPercentage =
            levels.length > 0
              ? Math.round((completedCount / levels.length) * 100)
              : 0;

          // Precompute all filters for this mode
          const filteredLevels = precomputeFilters(levels);

          precomputedLevels[mode] = {
            levels,
            completionPercentage,
            lastUpdated: Date.now(),
            filteredLevels, // Add precomputed filters
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

      // Update store with precomputed levels
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

      // Wait for all core data to load
      await Promise.all(corePromises);
      console.log("[SplashStore] Phase 1 complete: Core data loaded");

      // Phase 2: Precompute ALL progress data
      console.log("[SplashStore] Phase 2: Precomputing all progress data");
      const progressPrecomputeSuccess = await get().precomputeAllProgressData();

      if (progressPrecomputeSuccess) {
        console.log(
          "[SplashStore] Phase 2 complete: All progress data precomputed"
        );
      } else {
        console.warn(
          "[SplashStore] Phase 2 partial: Some progress data failed to precompute"
        );
      }

      // Phase 3: Precompute ALL levels with filters
      console.log(
        "[SplashStore] Phase 3: Precomputing all levels with filters"
      );
      const levelsPrecomputeSuccess = await get().precomputeAllLevels();

      if (levelsPrecomputeSuccess) {
        console.log(
          "[SplashStore] Phase 3 complete: All levels and filters precomputed"
        );
      } else {
        console.warn(
          "[SplashStore] Phase 3 partial: Some levels failed to precompute"
        );
      }

      // Phase 4: Load other data in background (don't wait)
      console.log("[SplashStore] Phase 4: Loading background data");
      const backgroundPromises = [];
      const pronunciationStore = usePronunciationStore.getState();

      backgroundPromises.push(pronunciationStore.fetchPronunciations());
      backgroundPromises.push(coinsStore.fetchCoinsBalance());
      backgroundPromises.push(coinsStore.checkDailyReward());

      // Don't wait for background data
      Promise.allSettled(backgroundPromises).then(() => {
        console.log("[SplashStore] Phase 4 complete: Background data loaded");
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
