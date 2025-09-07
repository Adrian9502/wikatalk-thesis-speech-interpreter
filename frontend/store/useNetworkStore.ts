import { create } from "zustand";
import * as Network from "expo-network";

export type NetworkStatus = "online" | "offline" | "slow";

interface NetworkState {
  status: NetworkStatus;
  isConnected: boolean;
  lastChecked: Date | null;
  isChecking: boolean;
  setStatus: (status: NetworkStatus) => void;
  setConnected: (connected: boolean) => void;
  setChecking: (checking: boolean) => void;
  checkNetworkStatus: () => Promise<void>;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  status: "online",
  isConnected: true,
  lastChecked: null,
  isChecking: false,

  setStatus: (status) => set({ status, lastChecked: new Date() }),
  setConnected: (isConnected) => set({ isConnected }),
  setChecking: (isChecking) => set({ isChecking }),

  checkNetworkStatus: async () => {
    const state = get();
    if (state.isChecking) return;

    set({ isChecking: true });

    try {
      const networkState = await Network.getNetworkStateAsync();
      const connected = networkState.isConnected ?? false;

      set({ isConnected: connected });

      if (!connected) {
        set({ status: "offline", lastChecked: new Date(), isChecking: false });
        return;
      }

      // Test connection speed
      const startTime = Date.now();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          cache: "no-cache",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (response.ok) {
          const status = duration > 2000 ? "slow" : "online";
          set({ status, lastChecked: new Date(), isChecking: false });
        } else {
          set({ status: "slow", lastChecked: new Date(), isChecking: false });
        }
      } catch (error) {
        set({ status: "slow", lastChecked: new Date(), isChecking: false });
      }
    } catch (error) {
      console.error("Network check error:", error);
      set({
        status: "offline",
        isConnected: false,
        lastChecked: new Date(),
        isChecking: false,
      });
    }
  },
}));
