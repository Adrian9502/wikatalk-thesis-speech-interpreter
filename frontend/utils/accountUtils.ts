import { useSplashStore } from "@/store/useSplashStore";
import useProgressStore from "@/store/games/useProgressStore";
import useGameStore from "@/store/games/useGameStore";

export const clearAllAccountData = async () => {
  console.log("[AccountUtils] Clearing all account-specific data");

  try {
    // 1. Clear splash store precomputed data
    useSplashStore.getState().reset();

    // 2. Clear progress store data
    useProgressStore.getState().clearAllAccountData();

    // 3. Clear game store data
    useGameStore.getState().clearAllAccountData();

    console.log("[AccountUtils] All account data cleared successfully");
  } catch (error) {
    console.error("[AccountUtils] Error clearing account data:", error);
  }
};

export const refreshAccountData = async () => {
  console.log("[AccountUtils] Refreshing account data");

  try {
    // Clear old data first
    await clearAllAccountData();

    // Give a small delay to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // NEW: Trigger data precomputation for the new account
    const splashStore = useSplashStore.getState();
    console.log("[AccountUtils] Starting data precomputation for new account");

    // This will precompute all data for the new account
    await splashStore.preloadGameData();

    console.log("[AccountUtils] Account data refreshed successfully");
  } catch (error) {
    console.error("[AccountUtils] Error refreshing account data:", error);
  }
};
