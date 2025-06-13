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
  fetchCoinsBalance: () => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;

  // Daily rewards actions
  checkDailyReward: () => Promise<boolean>;
  claimDailyReward: () => Promise<number | null>;
  fetchRewardsHistory: () => Promise<void>;

  // Modal actions
  showDailyRewardsModal: () => void;
  hideDailyRewardsModal: () => void;

  // Add reset function
  resetState: () => void;
}

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
  fetchCoinsBalance: async () => {
    try {
      set({ isLoading: true, error: null });

      // Get token from authTokenManager instead of AsyncStorage directly
      const token = getToken();

      if (!token) {
        console.log("No token available for fetchCoinsBalance");
        set({ isLoading: false, error: "Authentication required" });
        return;
      }

      // Ensure isDailyRewardAvailable is reset when fetching balance
      set({ isDailyRewardAvailable: false });

      try {
        const response = await axios.get(`${API_URL}/api/rewards/coins`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const coins = response.data.coins;
          await AsyncStorage.setItem("user_coins", coins.toString());
          set({ coins, isLoading: false });
        }
      } catch (error: any) {
        console.error(
          "API Error fetching coins:",
          error.response?.status,
          error.response?.data
        );
        set({ isLoading: false, error: "Failed to fetch coins balance" });
      }
    } catch (error) {
      console.error("Error in fetchCoinsBalance:", error);
      set({ isLoading: false, error: "Failed to fetch coins balance" });
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
  checkDailyReward: async () => {
    try {
      // Get token from authTokenManager
      const token = getToken();
      if (!token) {
        console.log("No token available for daily reward check");
        return false;
      }

      const today = new Date().toISOString().split("T")[0];

      // Force a fresh check if user has just logged in
      // Clear any cached state about previous reward status
      set({ lastCheckedDate: null });

      const response = await axios.get(`${API_URL}/api/rewards/daily/check`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.available) {
        set({
          isDailyRewardAvailable: true,
          lastCheckedDate: today,
        });
        return true;
      } else {
        set({
          isDailyRewardAvailable: false,
          lastCheckedDate: today,
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
  fetchRewardsHistory: async () => {
    try {
      set({ isLoading: true, error: null });

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
          isLoading: false,
        });
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
}));

export default useCoinsStore;
