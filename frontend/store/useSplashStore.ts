import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useGameStore from "@/store/games/useGameStore";
import useProgressStore from "@/store/games/useProgressStore";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import useCoinsStore from "@/store/games/useCoinsStore";

interface SplashState {
  isLoadingComplete: boolean;
  splashShown: boolean;
  gameDataPreloaded: boolean;
  progressDataPrecomputed: boolean; // Add this new flag
  markLoadingComplete: () => void;
  markSplashShown: () => void;
  markGameDataPreloaded: () => void;
  markProgressDataPrecomputed: () => void; // Add this new action
  preloadGameData: () => Promise<boolean>;
  precomputeAllProgressData: () => Promise<boolean>; // Add this new function
  reset: () => void;
}

export const useSplashStore = create<SplashState>((set, get) => ({
  isLoadingComplete: false,
  splashShown: false,
  gameDataPreloaded: false,
  progressDataPrecomputed: false, // Initialize new flag
  markLoadingComplete: () => set({ isLoadingComplete: true }),
  markSplashShown: () => set({ splashShown: true }),
  markGameDataPreloaded: () => set({ gameDataPreloaded: true }),
  markProgressDataPrecomputed: () => set({ progressDataPrecomputed: true }), // New action
  reset: () =>
    set({
      isLoadingComplete: false,
      splashShown: false,
      gameDataPreloaded: false,
      progressDataPrecomputed: false, // Reset new flag
    }),

  // Enhanced function to precompute ALL progress data during splash
  precomputeAllProgressData: async () => {
    try {
      console.log("[SplashStore] Starting FULL progress data precomputation");
      const progressStore = useProgressStore.getState();

      // 1. Ensure we have fresh progress data
      const progressData = await progressStore.fetchProgress(true);
      if (!progressData) {
        console.warn("[SplashStore] No progress data available for precomputation");
        return false;
      }

      console.log("[SplashStore] Progress data fetched, starting enhanced calculations");

      // 2. Precompute enhanced progress for ALL game modes in parallel
      const modes = ['multipleChoice', 'identification', 'fillBlanks'];
      
      const enhancedPromises = modes.map(async (mode) => {
        try {
          console.log(`[SplashStore] Precomputing enhanced progress for ${mode}`);
          const startTime = Date.now();
          
          // Force calculation (don't use cache)
          const result = await progressStore.getEnhancedGameProgress(mode);
          
          const duration = Date.now() - startTime;
          console.log(`[SplashStore] Enhanced progress for ${mode} computed in ${duration}ms`);
          
          return { mode, result, success: true };
        } catch (error) {
          console.error(`[SplashStore] Failed to compute enhanced progress for ${mode}:`, error);
          return { mode, result: null, success: false };
        }
      });

      // Wait for all enhanced progress calculations
      const results = await Promise.allSettled(enhancedPromises);
      
      // Log results
      let successCount = 0;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
          console.log(`[SplashStore] ✅ Enhanced progress precomputed for ${modes[index]}`);
        } else {
          console.warn(`[SplashStore] ❌ Failed to precompute enhanced progress for ${modes[index]}`);
        }
      });

      // Mark as complete if at least one succeeded
      const allSuccessful = successCount === modes.length;
      set({ progressDataPrecomputed: allSuccessful });
      
      console.log(`[SplashStore] Progress precomputation complete: ${successCount}/${modes.length} successful`);
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

      corePromises.push(gameStore.ensureQuestionsLoaded());
      corePromises.push(progressStore.fetchProgress(true));

      await Promise.all(corePromises);
      console.log("[SplashStore] Phase 1 complete: Core data loaded");

      // Phase 2: Precompute ALL progress data
      console.log("[SplashStore] Phase 2: Precomputing all progress data");
      const progressPrecomputeSuccess = await get().precomputeAllProgressData();
      
      if (progressPrecomputeSuccess) {
        console.log("[SplashStore] Phase 2 complete: All progress data precomputed");
      } else {
        console.warn("[SplashStore] Phase 2 partial: Some progress data failed to precompute");
      }

      // Phase 3: Load other data in background (don't wait)
      console.log("[SplashStore] Phase 3: Loading background data");
      const backgroundPromises = [];
      const pronunciationStore = usePronunciationStore.getState();
      const coinsStore = useCoinsStore.getState();
      
      backgroundPromises.push(pronunciationStore.fetchPronunciations());
      backgroundPromises.push(coinsStore.fetchCoinsBalance());
      backgroundPromises.push(coinsStore.checkDailyReward());

      // Don't wait for background data
      Promise.allSettled(backgroundPromises).then(() => {
        console.log("[SplashStore] Phase 3 complete: Background data loaded");
      });

      set({ gameDataPreloaded: true });
      console.log("[SplashStore] ✅ Comprehensive game data preloading complete");
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

export const isAllDataReady = (): boolean => {
  const state = useSplashStore.getState();
  return state.gameDataPreloaded && state.progressDataPrecomputed;
};
