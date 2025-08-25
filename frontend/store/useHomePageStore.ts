import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface HomePageState {
  showHomePage: boolean;

  // Actions
  setShowHomePage: (show: boolean) => void;
  shouldShowHomePage: () => boolean;
  resetHomePagePreferences: () => void;
}

const useHomePageStore = create<HomePageState>()(
  persist(
    (set, get) => ({
      showHomePage: true,

      setShowHomePage: (show: boolean) => {
        set({ showHomePage: show });
      },

      shouldShowHomePage: () => {
        const { showHomePage } = get();
        return showHomePage; // Show every time if enabled
      },

      resetHomePagePreferences: () => {
        set({ showHomePage: true });
      },
    }),
    {
      name: "homepage-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useHomePageStore;
