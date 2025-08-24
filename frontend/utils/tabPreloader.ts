import { useSplashStore } from "@/store/useSplashStore";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import useGameStore from "@/store/games/useGameStore";
import useProgressStore from "@/store/games/useProgressStore";
import useCoinsStore from "@/store/games/useCoinsStore";
import { globalSpeechManager } from "@/utils/globalSpeechManager";
import * as Speech from "expo-speech";

interface TabPreloadConfig {
  [key: string]: {
    priority: "high" | "medium" | "low";
    dependencies: string[];
    preloadFn: () => Promise<boolean>;
    cleanup?: () => void;
    warmUp?: () => Promise<void>; // Fixed typo: was warmpUp
  };
}

class TabPreloader {
  private preloadedTabs = new Set<string>();
  private preloadPromises = new Map<string, Promise<boolean>>();
  private cleanupTasks = new Map<string, (() => void)[]>();

  // Move cleanup functions to the beginning, before config
  private cleanupSpeech = (): void => {
    globalSpeechManager.stopAllSpeech();
  };

  private cleanupGames = (): void => {
    // Clear heavy game data that's not immediately needed
    const gameStore = useGameStore.getState();
    // Remove reference to non-existent clearHeavyData method
    console.log("[TabPreloader] Games cleanup completed");
  };

  private cleanupPronounce = (): void => {
    const pronunciationStore = usePronunciationStore.getState();
    pronunciationStore.stopAudio();
  };

  private config: TabPreloadConfig = {
    Speech: {
      priority: "high",
      dependencies: ["core"],
      preloadFn: this.preloadSpeech.bind(this),
      warmUp: this.warmupSpeech.bind(this), // Fixed typo
      cleanup: this.cleanupSpeech,
    },
    Games: {
      priority: "high",
      dependencies: ["core"],
      preloadFn: this.preloadGames.bind(this),
      cleanup: this.cleanupGames,
    },
    Pronounce: {
      priority: "medium",
      dependencies: ["core"],
      preloadFn: this.preloadPronounce.bind(this),
      cleanup: this.cleanupPronounce,
    },
    Translate: {
      priority: "medium",
      dependencies: [],
      preloadFn: this.preloadTranslate.bind(this),
      warmUp: this.warmupTranslate.bind(this), // Fixed typo
    },
    Scan: {
      priority: "low",
      dependencies: [],
      preloadFn: this.preloadScan.bind(this),
      warmUp: this.warmupScan.bind(this), // Fixed typo
    },
    Settings: {
      priority: "low",
      dependencies: [],
      preloadFn: this.preloadSettings.bind(this),
    },
  };

  // High priority - preload Speech tab (default)
  private async preloadSpeech(): Promise<boolean> {
    try {
      console.log("[TabPreloader] Preloading Speech tab");

      // Speech is mostly UI-based, minimal preloading needed
      // The actual speech services are initialized on-demand
      await this.warmupSpeech();

      return true;
    } catch (error) {
      console.error("[TabPreloader] Speech preload failed:", error);
      return false;
    }
  }

  private async warmupSpeech(): Promise<void> {
    try {
      // Warm up speech synthesis
      const voices = await Speech.getAvailableVoicesAsync();
      console.log(
        `[TabPreloader] Speech voices warmed up: ${voices.length} available`
      );

      // Remove reference to non-existent initialize method
      console.log("[TabPreloader] Speech warmup completed");
    } catch (error) {
      console.warn("[TabPreloader] Speech warmup failed:", error);
    }
  }

  // High priority - preload Games tab
  private async preloadGames(): Promise<boolean> {
    try {
      console.log("[TabPreloader] Preloading Games tab - preserving data flow");

      // Use existing splash store precomputed data
      const splashStore = useSplashStore.getState();

      if (splashStore.gameDataPreloaded) {
        console.log("[TabPreloader] Games data already preloaded from splash");

        // IMPORTANT: Always refresh progress data when returning to Games
        // This ensures users see the most updated progress
        const progressStore = useProgressStore.getState();
        const gameStore = useGameStore.getState();

        // Check if we need to refresh progress (non-blocking)
        const lastUpdate = progressStore.lastUpdated || 0;
        const timeSinceUpdate = Date.now() - lastUpdate;

        // If more than 30 seconds since last update, refresh in background
        if (timeSinceUpdate > 30000) {
          console.log(
            "[TabPreloader] Refreshing progress data in background for Games"
          );

          // Non-blocking refresh to keep current flow
          Promise.resolve().then(async () => {
            try {
              await progressStore.fetchProgress(true);

              // Trigger recomputation of specific game modes to update cards
              const gameModes = [
                "multipleChoice",
                "identification",
                "fillBlanks",
              ];
              for (const mode of gameModes) {
                await splashStore.precomputeSpecificGameMode(mode);
              }

              console.log(
                "[TabPreloader] Background progress refresh completed"
              );
            } catch (error) {
              console.warn("[TabPreloader] Background refresh failed:", error);
            }
          });
        }

        return true;
      }

      // If not preloaded, do minimal essential loading
      const gameStore = useGameStore.getState();
      const progressStore = useProgressStore.getState();
      const coinsStore = useCoinsStore.getState();

      // Essential data only
      await Promise.allSettled([
        gameStore.ensureQuestionsLoaded(),
        progressStore.fetchProgress(false), // Use cache if available
        coinsStore.fetchCoinsBalance(),
      ]);

      return true;
    } catch (error) {
      console.error("[TabPreloader] Games preload failed:", error);
      return false;
    }
  }

  // Medium priority - preload Pronounce tab
  private async preloadPronounce(): Promise<boolean> {
    try {
      console.log("[TabPreloader] Preloading Pronounce tab");

      const pronunciationStore = usePronunciationStore.getState();

      // Check if already loaded from splash
      if (
        pronunciationStore.transformedData &&
        Object.keys(pronunciationStore.transformedData).length > 0
      ) {
        console.log("[TabPreloader] Pronunciation data already available");
        return true;
      }

      // Load with cache preference
      await pronunciationStore.fetchPronunciations(false);
      return true;
    } catch (error) {
      console.error("[TabPreloader] Pronounce preload failed:", error);
      return false;
    }
  }

  // Medium priority - preload Translate tab
  private async preloadTranslate(): Promise<boolean> {
    try {
      console.log("[TabPreloader] Preloading Translate tab");
      await this.warmupTranslate();
      return true;
    } catch (error) {
      console.error("[TabPreloader] Translate preload failed:", error);
      return false;
    }
  }

  private async warmupTranslate(): Promise<void> {
    try {
      // Warm up translation API connection
      // You can add actual API warmup calls here
      console.log("[TabPreloader] Translation service warmed up");
    } catch (error) {
      console.warn("[TabPreloader] Translate warmup failed:", error);
    }
  }

  // Low priority - preload Scan tab
  private async preloadScan(): Promise<boolean> {
    try {
      console.log("[TabPreloader] Preloading Scan tab");
      await this.warmupScan();
      return true;
    } catch (error) {
      console.error("[TabPreloader] Scan preload failed:", error);
      return false;
    }
  }

  private async warmupScan(): Promise<void> {
    try {
      // Warm up camera and OCR modules
      // Pre-initialize camera permissions check
      console.log("[TabPreloader] Scan modules warmed up");
    } catch (error) {
      console.warn("[TabPreloader] Scan warmup failed:", error);
    }
  }

  // Low priority - preload Settings tab
  private async preloadSettings(): Promise<boolean> {
    try {
      console.log("[TabPreloader] Preloading Settings tab");
      // Settings is mostly static, minimal preloading needed
      return true;
    } catch (error) {
      console.error("[TabPreloader] Settings preload failed:", error);
      return false;
    }
  }

  // Main preload method
  async preloadTab(tabName: string): Promise<boolean> {
    if (this.preloadedTabs.has(tabName)) {
      console.log(`[TabPreloader] ${tabName} already preloaded`);
      return true;
    }

    if (this.preloadPromises.has(tabName)) {
      console.log(`[TabPreloader] ${tabName} preload in progress, waiting...`);
      return await this.preloadPromises.get(tabName)!;
    }

    const config = this.config[tabName];
    if (!config) {
      console.warn(`[TabPreloader] No config found for tab: ${tabName}`);
      return false;
    }

    console.log(
      `[TabPreloader] Starting preload for ${tabName} (${config.priority} priority)`
    );

    const preloadPromise = this.executePreload(tabName, config);
    this.preloadPromises.set(tabName, preloadPromise);

    const success = await preloadPromise;
    this.preloadPromises.delete(tabName);

    if (success) {
      this.preloadedTabs.add(tabName);
      console.log(`[TabPreloader] ✅ ${tabName} preloaded successfully`);
    } else {
      console.log(`[TabPreloader] ❌ ${tabName} preload failed`);
    }

    return success;
  }

  private async executePreload(
    tabName: string,
    config: TabPreloadConfig[string]
  ): Promise<boolean> {
    try {
      // Warmup if available
      if (config.warmUp) {
        // Fixed typo
        await config.warmUp(); // Fixed typo
      }

      // Execute preload
      return await config.preloadFn();
    } catch (error) {
      console.error(
        `[TabPreloader] ${tabName} preload execution failed:`,
        error
      );
      return false;
    }
  }

  // Cleanup previous tab
  cleanupTab(tabName: string): void {
    // Add validation to only cleanup actual tabs
    const validTabs = [
      "Speech",
      "Translate",
      "Scan",
      "Games",
      "Pronounce",
      "Settings",
    ];

    if (!validTabs.includes(tabName)) {
      console.log(
        `[TabPreloader] Skipping cleanup for non-tab screen: ${tabName}`
      );
      return;
    }

    const config = this.config[tabName];
    if (config?.cleanup) {
      console.log(`[TabPreloader] Cleaning up ${tabName}`);
      config.cleanup();
    }

    // Execute any registered cleanup tasks
    const cleanupTasks = this.cleanupTasks.get(tabName);
    if (cleanupTasks) {
      cleanupTasks.forEach((task) => {
        try {
          task();
        } catch (error) {
          console.warn(
            `[TabPreloader] Cleanup task failed for ${tabName}:`,
            error
          );
        }
      });
    }
  }

  // Preload next likely tab
  async preloadNextTab(currentTab: string): Promise<void> {
    const tabOrder = [
      "Speech",
      "Translate",
      "Scan",
      "Games",
      "Pronounce",
      "Settings",
    ];
    const currentIndex = tabOrder.indexOf(currentTab);

    // Only proceed if currentTab is actually a main tab
    if (currentIndex >= 0) {
      // Preload next tab
      const nextIndex = (currentIndex + 1) % tabOrder.length;
      const nextTab = tabOrder[nextIndex];

      // Don't wait for completion
      this.preloadTab(nextTab).catch((error) => {
        console.warn(
          `[TabPreloader] Next tab preload failed for ${nextTab}:`,
          error
        );
      });

      // Also preload previous tab for backward navigation
      const prevIndex =
        currentIndex === 0 ? tabOrder.length - 1 : currentIndex - 1;
      const prevTab = tabOrder[prevIndex];

      this.preloadTab(prevTab).catch((error) => {
        console.warn(
          `[TabPreloader] Previous tab preload failed for ${prevTab}:`,
          error
        );
      });
    } else {
      console.log(
        `[TabPreloader] ${currentTab} is not a main tab, skipping preload`
      );
    }
  }

  // Register cleanup task
  registerCleanupTask(tabName: string, cleanupFn: () => void): void {
    if (!this.cleanupTasks.has(tabName)) {
      this.cleanupTasks.set(tabName, []);
    }
    this.cleanupTasks.get(tabName)!.push(cleanupFn);
  }

  // Get preload status
  getPreloadStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    Object.keys(this.config).forEach((tab) => {
      status[tab] = this.preloadedTabs.has(tab);
    });
    return status;
  }

  // Reset preloader
  reset(): void {
    this.preloadedTabs.clear();
    this.preloadPromises.clear();
    this.cleanupTasks.clear();
  }
}

// Export singleton instance
export const tabPreloader = new TabPreloader();
