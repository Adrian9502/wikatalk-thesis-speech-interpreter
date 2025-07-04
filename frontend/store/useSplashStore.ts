import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useGameStore from "@/store/games/useGameStore";
import useProgressStore from "@/store/games/useProgressStore";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import useCoinsStore from "@/store/games/useCoinsStore";

interface SplashState {
  isLoadingComplete: false;
  splashShown: false;
  gameDataPreloaded: boolean;
  markLoadingComplete: () => void;
  markSplashShown: () => void;
  markGameDataPreloaded: () => void;
  preloadGameData: () => Promise<boolean>;
  reset: () => void;
}

export const useSplashStore = create<SplashState>((set, get) => ({
  isLoadingComplete: false,
  splashShown: false,
  gameDataPreloaded: false,
  markLoadingComplete: () => set({ isLoadingComplete: true }),
  markSplashShown: () => set({ splashShown: true }),
  markGameDataPreloaded: () => set({ gameDataPreloaded: true }),
  reset: () =>
    set({
      isLoadingComplete: false,
      splashShown: false,
      gameDataPreloaded: false,
    }),

  // New function to preload game data
  preloadGameData: async () => {
    try {
      console.log("[SplashStore] Starting game data preloading");

      // Get token first - if no token, don't try to load data
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.log(
          "[SplashStore] No auth token found, skipping game data preloading"
        );
        return false;
      }

      // Load data in parallel for efficiency
      const promises = [];

      // 1. Load game questions
      const gameStore = useGameStore.getState();
      promises.push(gameStore.ensureQuestionsLoaded());

      // 2. Load user progress data
      const progressStore = useProgressStore.getState();
      promises.push(progressStore.fetchProgress(true));

      // 3. Load pronunciation data and word of the day
      const pronunciationStore = usePronunciationStore.getState();
      promises.push(pronunciationStore.fetchPronunciations());

      // 4. Load coins balance
      const coinsStore = useCoinsStore.getState();
      promises.push(coinsStore.fetchCoinsBalance());
      promises.push(coinsStore.checkDailyReward());

      // Wait for all promises to resolve
      await Promise.all(promises);

      // Mark data as preloaded
      set({ gameDataPreloaded: true });
      console.log("[SplashStore] Game data preloading complete");
      return true;
    } catch (error) {
      console.error("[SplashStore] Error preloading game data:", error);
      return false;
    }
  },
}));

// Helper to check if game data is preloaded
export const isGameDataPreloaded = (): boolean => {
  return useSplashStore.getState().gameDataPreloaded;
};
