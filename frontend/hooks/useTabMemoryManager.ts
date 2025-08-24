import { useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { tabPreloader } from "@/utils/tabPreloader";

interface UseTabMemoryManagerProps {
  currentTab: string;
  previousTab?: string;
}

export const useTabMemoryManager = ({
  currentTab,
  previousTab,
}: UseTabMemoryManagerProps) => {
  const appState = useRef(AppState.currentState);
  const backgroundTimer = useRef<NodeJS.Timeout>();
  const memoryPressureRef = useRef(false);

  // Handle app state changes for memory management
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App came to foreground - refresh current tab if needed
        console.log(
          "[TabMemoryManager] App became active, refreshing current tab"
        );
        tabPreloader.preloadTab(currentTab);
      } else if (nextAppState === "background") {
        // App went to background - cleanup after delay
        backgroundTimer.current = setTimeout(() => {
          console.log(
            "[TabMemoryManager] App in background, performing cleanup"
          );
          if (previousTab) {
            tabPreloader.cleanupTab(previousTab);
          }
        }, 30000); // 30 seconds delay
      }

      appState.current = nextAppState;
    },
    [currentTab, previousTab]
  );

  // Memory pressure handling
  const handleMemoryPressure = useCallback(() => {
    console.warn(
      "[TabMemoryManager] Memory pressure detected, performing cleanup"
    );
    memoryPressureRef.current = true;

    // Cleanup all tabs except current
    const allTabs = [
      "Speech",
      "Translate",
      "Scan",
      "Games",
      "Pronounce",
      "Settings",
    ];
    allTabs.forEach((tab) => {
      if (tab !== currentTab) {
        tabPreloader.cleanupTab(tab);
      }
    });

    // Reset memory pressure flag after cleanup
    setTimeout(() => {
      memoryPressureRef.current = false;
    }, 5000);
  }, [currentTab]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
      if (backgroundTimer.current) {
        clearTimeout(backgroundTimer.current);
      }
    };
  }, [handleAppStateChange]);

  // Cleanup method for components
  const cleanup = useCallback(() => {
    if (backgroundTimer.current) {
      clearTimeout(backgroundTimer.current);
    }
  }, []);

  return {
    memoryPressure: memoryPressureRef.current,
    cleanup,
    handleMemoryPressure,
  };
};
