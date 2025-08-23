import { create } from "zustand";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "@/lib/authTokenManager";

// Define the API URL using environment variable
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
      const response = await axios.get(`${API_URL}/api/rewards/coins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      if (response.data && typeof response.data.coins === "number") {
        const coins = response.data.coins;
        await AsyncStorage.setItem("user_coins", coins.toString());

        console.log("✅ Coins fetched successfully:", response.data.coins);

        set({
          coins: response.data.coins,
          isLoading: false,
          error: null,
          lastCoinsChecked: now,
        });

        return true;
      } else {
        console.error("Invalid coins response:", response.data);
        set({ isLoading: false, error: "Invalid response from server" });
        return false;
      }
    } catch (error: any) {
      console.error("Error fetching coins:", error);

      // Don't reset coins to 0 on error - keep existing value
      set({
        isLoading: false,
        error: error.message || "Failed to fetch coins",
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

      // Update on the server
      await axios.post(
        `${API_URL}/api/user/coins/add`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          },
        }
      );

      // Update local storage
      const updatedCoins = get().coins;
      await AsyncStorage.setItem("user_coins", updatedCoins.toString());
      set({ isLoading: false });
    } catch (error) {
      console.error("Error adding coins:", error);

      // Revert optimistic update
      set((state) => ({
        coins: state.coins - amount,
        isLoading: false,
        error: "Failed to add coins.",
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

      // Update on the server
      await axios.post(
        `${API_URL}/api/user/coins/deduct`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          },
        }
      );

      // Update local storage
      const updatedCoins = get().coins;
      await AsyncStorage.setItem("user_coins", updatedCoins.toString());
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error("Error deducting coins:", error);

      // Revert optimistic update
      set((state) => ({
        coins: state.coins + amount,
        isLoading: false,
        error: "Failed to deduct coins.",
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
        console.log("No token available for claimDailyReward");
        set({ isLoading: false, error: "Authentication required" });
        return null;
      }

      const response = await axios.get(`${API_URL}/api/rewards/daily/check`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.available) {
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
    } catch (error) {
      console.error("Error checking daily reward:", error);
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

      const response = await axios.post(
        `${API_URL}/api/rewards/daily/claim`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.claimed) {
        const amount = response.data.amount;

        // Update coins total
        set((state) => ({
          coins: state.coins + amount,
          isDailyRewardAvailable: false,
          lastCheckedDate: new Date().toISOString().split("T")[0],
          isLoading: false,
        }));

        return amount;
      }

      return null;
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      set({ isLoading: false, error: "Failed to claim daily reward" });
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

      const response = await axios.get(`${API_URL}/api/rewards/daily/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        set({
          dailyRewardsHistory: response.data,
          lastRewardsChecked: Date.now(),
          isLoading: false,
        });
        return true;
      }
    } catch (error) {
      console.error("Error fetching rewards history:", error);
      set({ isLoading: false, error: "Failed to fetch rewards history" });
    }
  },

  // Modal actions
  showDailyRewardsModal: () => {
    set({ isDailyRewardsModalVisible: true });
  },

  hideDailyRewardsModal: () => {
    set({ isDailyRewardsModalVisible: false });
  },

  // New properties for cache management
  lastCoinsChecked: 0,
  lastRewardsChecked: 0,
  lastRewardStatusChecked: 0,

  // Implement the method here
  getRewardsDataSync: () => {
    return {
      dailyRewardsHistory: get().dailyRewardsHistory,
      isDailyRewardAvailable: get().isDailyRewardAvailable,
      coins: get().coins,
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
