import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "@/lib/authTokenManager";
import { coinsService } from "@/services/api/coinsService";

// Define types
interface ClaimedDate {
  date: string;
  amount: number;
}

interface DailyRewardsHistory {
  userId: string;
  claimedDates: ClaimedDate[];
}

interface CoinsState {
  // Core state
  coins: number;
  isLoading: boolean;
  error: string | null;

  // Daily rewards
  dailyRewardsHistory: DailyRewardsHistory | null;
  isDailyRewardAvailable: boolean;
  lastCheckedDate: string | null;

  // Modal state
  isDailyRewardsModalVisible: boolean;

  // Actions
  fetchCoinsBalance: (forceRefresh?: boolean) => Promise<boolean | undefined>;
  addCoins: (amount: number) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;

  // Daily rewards actions
  checkDailyReward: (forceRefresh?: boolean) => Promise<boolean | null>;
  claimDailyReward: () => Promise<number | null>;
  fetchRewardsHistory: (forceRefresh?: boolean) => Promise<boolean | undefined>;

  // Modal actions
  showDailyRewardsModal: () => void;
  hideDailyRewardsModal: () => void;

  // Add reset function
  resetState: () => void;

  // Cache management
  lastCoinsChecked: number;
  lastRewardsChecked: number;
  lastRewardStatusChecked: number;

  // New preloading method
  prefetchRewardsData: () => Promise<boolean>;

  // Method to get data synchronously - just declare the signature here
  getRewardsDataSync: () => {
    dailyRewardsHistory: DailyRewardsHistory | null;
    isDailyRewardAvailable: boolean;
    coins: number;
  };
}

const REWARDS_CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

const useCoinsStore = create<CoinsState>((set, get) => ({
  // Initial state
  coins: 0,
  isLoading: false,
  error: null,
  dailyRewardsHistory: null,
  isDailyRewardAvailable: false,
  lastCheckedDate: null,
  isDailyRewardsModalVisible: false,

  // Reset function to clear state when user logs out
  resetState: () => {
    console.log("Resetting rewards state");

    // Clear all state related to rewards
    set({
      coins: 0,
      isLoading: false,
      error: null,
      dailyRewardsHistory: null,
      isDailyRewardAvailable: false,
      lastCheckedDate: null,
      isDailyRewardsModalVisible: false,
    });
  },

  // Fetch user's coin balance
  fetchCoinsBalance: async (forceRefresh: boolean = false) => {
    const { isLoading, lastCoinsChecked } = get();
    const now = Date.now();

    // Skip if already loading or recently fetched (unless forced)
    if (isLoading || (!forceRefresh && now - lastCoinsChecked < 30000)) {
      console.log("Skipping coins fetch - already loading or recently fetched");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const token = await getToken();
      if (!token) {
        console.log("No token found, cannot fetch coins");
        set({ isLoading: false, error: "Authentication required" });
        return false;
      }

      console.log("Fetching coins balance from server...");

      // NEW: Use centralized service instead of direct axios call
      const response = await coinsService.getCoinsBalance();

      if (response.success && typeof response.coins === "number") {
        const coins = response.coins;
        await AsyncStorage.setItem("user_coins", coins.toString());

        console.log("✅ Coins fetched successfully:", response.coins);

        set({
          coins: response.coins,
          isLoading: false,
          error: null,
          lastCoinsChecked: now,
        });

        return true;
      } else {
        console.error("Invalid coins response:", response);
        set({ isLoading: false, error: "Invalid response from server" });
        return false;
      }
    } catch (error: any) {
      console.error("Error fetching coins:", error);

      // NEW: Better error handling for centralized API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch coins";

      // Don't reset coins to 0 on error - keep existing value
      set({
        isLoading: false,
        error: errorMessage,
        // Keep existing coins value on error
      });

      return false;
    }
  },

  // Add coins to user's balance
  addCoins: async (amount: number) => {
    if (amount <= 0) return;

    try {
      set({ isLoading: true, error: null });

      // Optimistically update UI
      set((state) => ({ coins: state.coins + amount }));

      // NEW: Use centralized service instead of direct axios call
      const response = await coinsService.addCoins({ amount });

      if (response.success) {
        // Update local storage
        const updatedCoins = get().coins;
        await AsyncStorage.setItem("user_coins", updatedCoins.toString());
        set({ isLoading: false });
      } else {
        throw new Error(response.message || "Failed to add coins");
      }
    } catch (error: any) {
      console.error("Error adding coins:", error);

      // NEW: Better error handling for centralized API
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to add coins";

      // Revert optimistic update
      set((state) => ({
        coins: state.coins - amount,
        isLoading: false,
        error: errorMessage,
      }));
    }
  },

  // Deduct coins from user's balance
  deductCoins: async (amount: number) => {
    if (amount <= 0) return true;

    const currentCoins = get().coins;

    // Check if user has enough coins
    if (currentCoins < amount) {
      set({ error: "Not enough coins." });
      return false;
    }

    try {
      set({ isLoading: true, error: null });

      // Optimistically update UI
      set((state) => ({ coins: state.coins - amount }));

      // NEW: Use centralized service instead of direct axios call
      const response = await coinsService.deductCoins({ amount });

      if (response.success) {
        // Update local storage
        const updatedCoins = get().coins;
        await AsyncStorage.setItem("user_coins", updatedCoins.toString());
        set({ isLoading: false });
        return true;
      } else {
        throw new Error(response.message || "Failed to deduct coins");
      }
    } catch (error: any) {
      console.error("Error deducting coins:", error);

      // NEW: Better error handling for centralized API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to deduct coins";

      // Revert optimistic update
      set((state) => ({
        coins: state.coins + amount,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  },

  // Check if daily reward is available
  checkDailyReward: async (forceRefresh = false) => {
    const today = new Date().toISOString().split("T")[0];
    const { lastRewardStatusChecked, lastCheckedDate } = get();

    // If we already checked today and cache is fresh, use cached result
    if (
      !forceRefresh &&
      lastRewardStatusChecked > 0 &&
      Date.now() - lastRewardStatusChecked < REWARDS_CACHE_EXPIRY &&
      lastCheckedDate === today
    ) {
      console.log("[CoinsStore] Using cached daily reward status");
      return get().isDailyRewardAvailable;
    }

    try {
      // Only set loading if not in background
      if (forceRefresh) {
        set({ isLoading: true });
      }

      // Get token from authTokenManager
      const token = getToken();
      if (!token) {
        console.log("No token available for checkDailyReward");
        set({ isLoading: false, error: "Authentication required" });
        return null;
      }

      // NEW: Use centralized service instead of direct axios call
      const response = await coinsService.checkDailyReward();

      if (response.success) {
        if (response.available) {
          set({
            isDailyRewardAvailable: true,
            lastCheckedDate: today,
            lastRewardStatusChecked: Date.now(),
            isLoading: false,
          });
          return true;
        } else {
          set({
            isDailyRewardAvailable: false,
            lastCheckedDate: today,
            lastRewardStatusChecked: Date.now(),
            isLoading: false,
          });
          return false;
        }
      } else {
        throw new Error(response.message || "Failed to check daily reward");
      }
    } catch (error: any) {
      console.error("Error checking daily reward:", error);

      // NEW: Better error handling for centralized API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to check daily reward";
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  // Claim daily reward
  claimDailyReward: async () => {
    try {
      set({ isLoading: true, error: null });

      // Get token from centralized manager
      const token = getToken();
      if (!token) {
        console.log("No token available for claimDailyReward");
        set({ isLoading: false, error: "Authentication required" });
        return null;
      }

      // NEW: Use centralized service instead of direct axios call
      const response = await coinsService.claimDailyReward();

      if (response.success && response.claimed) {
        const amount = response.amount;

        // Update coins total
        set((state) => ({
          coins: state.coins + amount,
          isDailyRewardAvailable: false,
          lastCheckedDate: new Date().toISOString().split("T")[0],
          isLoading: false,
        }));

        return amount;
      } else {
        throw new Error(response.message || "Failed to claim daily reward");
      }
    } catch (error: any) {
      console.error("Error claiming daily reward:", error);

      // NEW: Better error handling for centralized API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to claim daily reward";
      set({ isLoading: false, error: errorMessage });
      return null;
    }
  },

  // Fetch rewards history
  fetchRewardsHistory: async (forceRefresh = false) => {
    const { lastRewardsChecked } = get();

    // Use cache if available and fresh
    if (
      !forceRefresh &&
      lastRewardsChecked > 0 &&
      Date.now() - lastRewardsChecked < REWARDS_CACHE_EXPIRY &&
      get().dailyRewardsHistory
    ) {
      console.log("[CoinsStore] Using cached rewards history");
      return true;
    }

    try {
      // Only set loading state if explicitly requested
      if (forceRefresh) {
        set({ isLoading: true, error: null });
      }

      // Get token from centralized manager
      const token = getToken();
      if (!token) {
        console.log("No token available for fetchRewardsHistory");
        set({ isLoading: false, error: "Authentication required" });
        return;
      }

      // Clear any previous history before fetching
      set({ dailyRewardsHistory: null });

      // NEW: Use centralized service instead of direct axios call
      const response = await coinsService.getRewardsHistory();

      if (response.success && response.history) {
        set({
          dailyRewardsHistory: response.history,
          lastRewardsChecked: Date.now(),
          isLoading: false,
          error: null,
        });

        console.log(
          "[CoinsStore] ✅ Rewards history fetched:",
          response.history.claimedDates?.length || 0,
          "days"
        );
        return true;
      } else {
        throw new Error(response.message || "Failed to fetch rewards history");
      }
    } catch (error: any) {
      console.error("Error fetching rewards history:", error);

      // NEW: Better error handling for centralized API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch rewards history";
      set({
        isLoading: false,
        error: errorMessage,
        dailyRewardsHistory: null,
      });
      return false;
    }
  },

  // Show daily rewards modal
  showDailyRewardsModal: () => {
    set({ isDailyRewardsModalVisible: true });
  },

  // Hide daily rewards modal
  hideDailyRewardsModal: () => {
    set({ isDailyRewardsModalVisible: false });
  },

  // Cache management
  lastCoinsChecked: 0,
  lastRewardsChecked: 0,
  lastRewardStatusChecked: 0,

  // Method to get data synchronously (for preloaded scenarios)
  getRewardsDataSync: () => {
    const state = get();
    return {
      dailyRewardsHistory: state.dailyRewardsHistory,
      isDailyRewardAvailable: state.isDailyRewardAvailable,
      coins: state.coins,
    };
  },

  // Add a comprehensive prefetch method for app startup
  prefetchRewardsData: async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log("[CoinsStore] No token available for prefetching");
        return false;
      }

      console.log("[CoinsStore] Prefetching rewards data during app startup");

      // Run all fetches in parallel for maximum speed
      const startTime = Date.now();
      const results = await Promise.allSettled([
        get().fetchCoinsBalance(),
        get().checkDailyReward(),
        get().fetchRewardsHistory(),
      ]);

      const success = results.every((r) => r.status === "fulfilled");
      console.log(
        `[CoinsStore] Prefetch completed in ${Date.now() - startTime}ms (${
          success ? "success" : "partial"
        })`
      );

      return success;
    } catch (error) {
      console.error("[CoinsStore] Error prefetching rewards data:", error);
      return false;
    }
  },
}));

export default useCoinsStore;
