import AsyncStorage from "@react-native-async-storage/async-storage";

// Define interfaces for the stores to avoid importing them
interface SplashStoreActions {
  reset: () => void;
  preloadGameData: () => Promise<boolean>;
}

interface ProgressStoreActions {
  clearAllAccountData: () => void;
}

interface GameStoreActions {
  clearAllAccountData: () => void;
}

interface CoinsStoreActions {
  resetState: () => void;
}

// Store references that will be set at runtime
let splashStoreRef: SplashStoreActions | null = null;
let progressStoreRef: ProgressStoreActions | null = null;
let gameStoreRef: GameStoreActions | null = null;
let coinsStoreRef: CoinsStoreActions | null = null;

// Functions to register store references
export const registerSplashStore = (store: SplashStoreActions) => {
  splashStoreRef = store;
};

export const registerProgressStore = (store: ProgressStoreActions) => {
  progressStoreRef = store;
};

export const registerGameStore = (store: GameStoreActions) => {
  gameStoreRef = store;
};

export const registerCoinsStore = (store: CoinsStoreActions) => {
  coinsStoreRef = store;
};

// Data management functions
export const clearAllAccountData = async () => {
  console.log("[DataManager] Clearing all account-specific data");

  try {
    // 1. Clear splash store precomputed data
    if (splashStoreRef) {
      splashStoreRef.reset();
    } else {
      console.warn("[DataManager] SplashStore not registered");
    }

    // 2. Clear progress store data
    if (progressStoreRef) {
      progressStoreRef.clearAllAccountData();
    } else {
      console.warn("[DataManager] ProgressStore not registered");
    }

    // 3. Clear game store data
    if (gameStoreRef) {
      gameStoreRef.clearAllAccountData();
    } else {
      console.warn("[DataManager] GameStore not registered");
    }

    // 4. Clear coins store data
    if (coinsStoreRef) {
      coinsStoreRef.resetState();
    } else {
      console.warn("[DataManager] CoinsStore not registered");
    }

    console.log("[DataManager] All account data cleared successfully");
  } catch (error) {
    console.error("[DataManager] Error clearing account data:", error);
  }
};

export const refreshAccountData = async () => {
  console.log("[DataManager] Refreshing account data");

  try {
    // Clear old data first
    await clearAllAccountData();

    // Give a small delay to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Trigger data precomputation for the new account
    if (splashStoreRef) {
      console.log("[DataManager] Starting data precomputation for new account");
      await splashStoreRef.preloadGameData();
    } else {
      console.warn("[DataManager] SplashStore not available for preloading");
    }

    console.log("[DataManager] Account data refreshed successfully");
  } catch (error) {
    console.error("[DataManager] Error refreshing account data:", error);
  }
};

// User ID management for progress tracking
let currentUserId: string | null = null;

export const setCurrentUserId = (userId: string | null) => {
  if (currentUserId !== userId) {
    console.log(
      `[DataManager] User changed from ${currentUserId} to ${userId}`
    );
    currentUserId = userId;
  }
};

export const getCurrentUserId = (): string | null => {
  return currentUserId;
};

export const hasUserChanged = (newUserId: string | null): boolean => {
  return currentUserId !== null && currentUserId !== newUserId;
};
