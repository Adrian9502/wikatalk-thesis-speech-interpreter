import { useState, useEffect, useCallback } from "react";
import { LevelData } from "@/types/gameTypes";
import {
  useSplashStore,
  isLevelsPrecomputed,
  getFilteredLevelsForGameMode,
} from "@/store/useSplashStore";
import useGameStore from "@/store/games/useGameStore";
import { convertQuizToLevels } from "@/utils/games/convertQuizToLevels";
import {
  getCurrentUserId,
  hasUserChanged,
  setCurrentUserId,
} from "@/utils/dataManager";
import useProgressStore from "@/store/games/useProgressStore";

type FilterType = "all" | "completed" | "current" | "easy" | "medium" | "hard";

export const useLevelData = (gameMode: string | string[] | undefined) => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [showLevels, setShowLevels] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // NEW: Track current user to detect account changes
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  const {
    fetchQuestionsByMode,
    questions,
    isLoading: storeLoading,
    error: storeError,
  } = useGameStore();

  const safeGameMode =
    typeof gameMode === "string" ? gameMode : String(gameMode);

  // ENHANCED: Main effect to get levels data with better precomputed data usage
  useEffect(() => {
    const loadLevels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check for user changes
        const currentUserId = getCurrentUserId();
        const userChanged = hasUserChanged(currentUserId);

        if (userChanged) {
          console.log(`[useLevelData] User changed, forcing refresh`);
          useSplashStore.getState().reset();
          setCurrentUserId(currentUserId);
        }
        setLastUserId(currentUserId);

        // ENHANCED: Try precomputed data first with better validation
        const splashStore = useSplashStore.getState();
        const precomputedData = splashStore.precomputedLevels[safeGameMode];

        if (
          precomputedData?.levels &&
          precomputedData.levels.length > 0 &&
          !userChanged
        ) {
          // RELAXED: Accept data that's up to 10 minutes old to prevent blocking
          const dataAge = Date.now() - (precomputedData.lastUpdated || 0);
          const isDataFresh = dataAge < 600000; // 10 minutes instead of 5

          if (isDataFresh) {
            console.log(
              `[useLevelData] Using fresh precomputed levels for ${safeGameMode} (${dataAge}ms old)`
            );
            setLevels(precomputedData.levels);
            setCompletionPercentage(precomputedData.completionPercentage || 0);
            setShowLevels(true);
            setIsLoading(false);
            return;
          } else {
            console.log(
              `[useLevelData] Precomputed data is old (${dataAge}ms old), but using it anyway to prevent blocking`
            );
            // CHANGED: Use stale data anyway, but refresh in background
            setLevels(precomputedData.levels);
            setCompletionPercentage(precomputedData.completionPercentage || 0);
            setShowLevels(true);
            setIsLoading(false);

            // Background refresh
            setTimeout(async () => {
              try {
                console.log(
                  `[useLevelData] Background refresh for ${safeGameMode}`
                );
                if (!questions[safeGameMode]) {
                  await fetchQuestionsByMode(safeGameMode);
                }

                const progressStore = useProgressStore.getState();
                await progressStore.fetchProgress(false);
                const progressArray: any[] = progressStore.progress || [];

                const currentLevels = convertQuizToLevels(
                  safeGameMode,
                  questions,
                  progressArray
                );
                const completedCount = currentLevels.filter(
                  (level) => level.status === "completed"
                ).length;
                const percentage =
                  currentLevels.length > 0
                    ? Math.round((completedCount / currentLevels.length) * 100)
                    : 0;

                // Update with fresh data
                setLevels(currentLevels);
                setCompletionPercentage(percentage);

                // Update precomputed data
                await splashStore.precomputeSpecificGameMode(
                  safeGameMode,
                  currentLevels,
                  progressArray
                );

                console.log(
                  `[useLevelData] Background refresh completed for ${safeGameMode}`
                );
              } catch (error) {
                console.error(
                  `[useLevelData] Background refresh error:`,
                  error
                );
              }
            }, 500);

            return;
          }
        }

        // ENHANCED: Only compute on demand when necessary
        console.log(
          `[useLevelData] Computing levels on demand for ${safeGameMode}`
        );

        // Ensure we have questions
        if (!questions[safeGameMode]) {
          console.log(`[useLevelData] Fetching questions for ${safeGameMode}`);
          try {
            await fetchQuestionsByMode(safeGameMode);
          } catch (error) {
            console.error(`[useLevelData] Error fetching questions:`, error);
            setError("Failed to load questions");
            setIsLoading(false);
            return;
          }
        }

        // Get fresh progress data efficiently
        const progressStore = useProgressStore.getState();
        let progressArray: any[] = []; // FIXED: Explicit type annotation

        if (progressStore.progress && Array.isArray(progressStore.progress)) {
          progressArray = progressStore.progress;
        } else {
          // Only fetch if we don't have any progress data
          console.log(`[useLevelData] Fetching progress data`);
          try {
            await progressStore.fetchProgress(false);
            progressArray = progressStore.progress || [];
          } catch (error) {
            console.error(`[useLevelData] Error fetching progress:`, error);
            // Continue with empty progress array
            progressArray = [];
          }
        }

        console.log(
          `[useLevelData] Using ${progressArray.length} progress entries for level conversion`
        );

        // Convert to levels with fresh progress data
        const currentLevels = convertQuizToLevels(
          safeGameMode,
          questions,
          progressArray
        );

        // Calculate completion percentage
        const completedCount = currentLevels.filter(
          (level) => level.status === "completed"
        ).length;
        const percentage =
          currentLevels.length > 0
            ? Math.round((completedCount / currentLevels.length) * 100)
            : 0;

        setLevels(currentLevels);
        setCompletionPercentage(percentage);
        setShowLevels(true);
        setIsLoading(false);

        // ENHANCED: Update precomputed data in background
        setTimeout(async () => {
          await splashStore.precomputeSpecificGameMode(
            safeGameMode,
            currentLevels,
            progressArray
          );
        }, 100);
      } catch (err) {
        console.error(
          `[useLevelData] Error loading levels for ${safeGameMode}:`,
          err
        );
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      }
    };

    if (safeGameMode) {
      loadLevels();
    }
  }, [
    safeGameMode,
    questions,
    fetchQuestionsByMode,
    lastUserId,
    // REMOVED: globalProgress dependency to prevent unnecessary reloads
  ]);

  const handleRetry = useCallback(async () => {
    if (safeGameMode) {
      setError(null);
      setIsLoading(true);

      try {
        await fetchQuestionsByMode(safeGameMode);
        // The useEffect will trigger again and reload the levels
      } catch (error) {
        console.error("Error retrying fetch:", error);
        setError(error instanceof Error ? error.message : String(error));
        setIsLoading(false);
      }
    }
  }, [safeGameMode, fetchQuestionsByMode]);

  // NEW: Function to get filtered levels instantly
  const getFilteredLevels = useCallback(
    (filter: FilterType): LevelData[] => {
      if (isLevelsPrecomputed()) {
        // Use precomputed filters for instant response
        return getFilteredLevelsForGameMode(safeGameMode, filter);
      }

      // Fallback to real-time filtering (should rarely happen)
      console.warn(`[useLevelData] Using fallback filtering for ${filter}`);
      return levels.filter((level) => {
        switch (filter) {
          case "all":
            return true;
          case "completed":
            return level.status === "completed";
          case "current":
            return level.status === "current";
          case "easy":
            return (
              level.difficulty === "Easy" || level.difficultyCategory === "easy"
            );
          case "medium":
            return (
              level.difficulty === "Medium" ||
              level.difficultyCategory === "medium"
            );
          case "hard":
            return (
              level.difficulty === "Hard" || level.difficultyCategory === "hard"
            );
          default:
            return true;
        }
      });
    },
    [safeGameMode, levels]
  );

  return {
    levels,
    showLevels,
    isLoading: isLoading || storeLoading,
    error: error || storeError,
    completionPercentage,
    handleRetry,
    getFilteredLevels,
  };
};
