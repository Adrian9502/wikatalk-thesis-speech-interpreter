import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SplashState {
  isLoadingComplete: boolean;
  splashShown: boolean;
  markLoadingComplete: () => void;
  markSplashShown: () => void;
  reset: () => void;
}

export const useSplashStore = create<SplashState>((set) => ({
  isLoadingComplete: false,
  splashShown: false,
  markLoadingComplete: () => set({ isLoadingComplete: true }),
  markSplashShown: () => set({ splashShown: true }),
  reset: () => set({ isLoadingComplete: false, splashShown: false }),
}));

// This helper function can be used to determine if the splash needs to be shown
export const shouldShowSplash = async (): Promise<boolean> => {
  const { isLoadingComplete, splashShown } = useSplashStore.getState();

  // If already loaded or splash already shown, don't show again
  if (isLoadingComplete || splashShown) {
    return false;
  }

  // Mark splash as shown so it doesn't repeat
  useSplashStore.getState().markSplashShown();
  return true;
};
