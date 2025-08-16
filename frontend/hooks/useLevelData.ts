import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { convertQuizToLevels } from "@/utils/games/convertQuizToLevels";
import { LevelData } from "@/types/gameTypes";
import useGameStore from "@/store/games/useGameStore";
import useProgressStore from "@/store/games/useProgressStore";
import { useSplashStore } from "@/store/useSplashStore";

export const useLevelData = (gameMode: string) => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [showLevels, setShowLevels] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Add ref to track the last known update timestamp
  const lastUpdateRef = useRef<number>(0);

  // CRITICAL FIX: Add debouncing refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const { questions, fetchQuestionsByMode } = useGameStore();
  const splashStore = useSplashStore();

  // Get progress store state directly (this will trigger re-renders when it changes)
  const progressLastUpdated = useProgressStore((state) => state.lastUpdated);

  const safeGameMode = useMemo(() => {
    return typeof gameMode === "string" ? gameMode : String(gameMode);
  }, [gameMode]);

  // CRITICAL FIX: Always get fresh progress data
  const getFreshProgressData = useCallback(async () => {
    const progressStore = useProgressStore.getState();

    // Always fetch fresh progress data to ensure we have the latest
    console.log(
      `[useLevelData] Fetching fresh progress data for ${safeGameMode}`
    );
    await progressStore.fetchProgress(true); // Force fresh fetch

    const freshProgress = progressStore.progress;
    console.log(`[useLevelData] Fresh progress fetched:`, {
      progressType: Array.isArray(freshProgress)
        ? "array"
        : typeof freshProgress,
      progressLength: Array.isArray(freshProgress)
        ? freshProgress.length
        : "not array",
      sampleEntries: Array.isArray(freshProgress)
        ? freshProgress.slice(0, 3)
        : "not array",
    });

    return Array.isArray(freshProgress) ? freshProgress : [];
  }, [safeGameMode]);

  const loadLevels = useCallback(async () => {
    if (!safeGameMode) return;

    // CRITICAL FIX: Prevent multiple concurrent refreshes
    if (isRefreshingRef.current) {
      console.log(
        `[useLevelData] Already refreshing ${safeGameMode}, skipping`
      );
      return;
    }

    try {
      isRefreshingRef.current = true;
      setIsLoading(true);
      setError(null);

      console.log(`[useLevelData] Loading levels for ${safeGameMode}`);

      // Check if we have recent precomputed data
      const precomputedData = splashStore.precomputedLevels[safeGameMode];
      const dataAge = precomputedData?.lastUpdated
        ? Date.now() - precomputedData.lastUpdated
        : Infinity;

      // IMPROVED: Use precomputed data if it's less than 15 seconds old (reduced from 30)
      if (precomputedData && dataAge < 15000) {
        console.log(
          `[useLevelData] Using fresh precomputed levels for ${safeGameMode} (${dataAge}ms old)`
        );
        setLevels(precomputedData.levels);
        setCompletionPercentage(precomputedData.completionPercentage || 0);
        setShowLevels(true);
        setIsLoading(false);
        return;
      } else if (precomputedData && dataAge < 120000) {
        // IMPROVED: Reduced from 5 minutes to 2 minutes
        console.log(
          `[useLevelData] Using acceptable precomputed data for ${safeGameMode} (${dataAge}ms old)`
        );

        // Show existing data immediately
        setLevels(precomputedData.levels);
        setCompletionPercentage(precomputedData.completionPercentage || 0);
        setShowLevels(true);
        setIsLoading(false);

        // Skip background refresh if data is less than 1 minute old
        if (dataAge > 60000) {
          setTimeout(async () => {
            try {
              console.log(
                `[useLevelData] Background refresh for ${safeGameMode}`
              );

              // Ensure we have questions
              if (!questions[safeGameMode]) {
                await fetchQuestionsByMode(safeGameMode);
              }

              // CRITICAL FIX: Get fresh progress data
              const progressArray = await getFreshProgressData();
              console.log(
                `[useLevelData] Using ${progressArray.length} progress entries for background refresh`
              );

              // Convert to levels with fresh progress data
              const currentLevels = await convertQuizToLevels(
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
              console.error(`[useLevelData] Background refresh error:`, error);
            }
          }, 1000); // Increased delay
        }

        return;
      }

      // ENHANCED: Only compute on demand when necessary
      console.log(
        `[useLevelData] Computing levels on demand for ${safeGameMode}`
      );

      // Ensure we have questions
      if (!questions[safeGameMode]) {
        console.log(`[useLevelData] Fetching questions for ${safeGameMode}`);
        await fetchQuestionsByMode(safeGameMode);
      }

      console.log(`[useLevelData] Fetching progress data`);

      // CRITICAL FIX: Always get fresh progress data
      const progressArray = await getFreshProgressData();

      if (progressArray.length === 0) {
        console.warn(
          `[useLevelData] No progress data available for ${safeGameMode}`
        );
      } else {
        console.log(
          `[useLevelData] Using ${progressArray.length} progress entries for level conversion`
        );
      }

      // Convert to levels with fresh progress data
      const currentLevels = await convertQuizToLevels(
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

      // REDUCED: Only log final results
      if (__DEV__) {
        console.log(
          `[useLevelData] ${safeGameMode}: ${currentLevels.length} levels loaded (${percentage}% complete)`
        );
      }

      // ENHANCED: Update precomputed data in background with longer delay
      setTimeout(async () => {
        await splashStore.precomputeSpecificGameMode(
          safeGameMode,
          currentLevels,
          progressArray
        );
      }, 500); // Increased delay
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[useLevelData] Error loading levels:`, err);
      setError(errorMessage);
      setIsLoading(false);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [
    safeGameMode,
    questions,
    fetchQuestionsByMode,
    splashStore,
    getFreshProgressData,
  ]);

  // Enhanced getFilteredLevels function that uses precomputed filters when available
  const getFilteredLevels = useCallback(
    (filter: string) => {
      const precomputedData = splashStore.precomputedLevels[safeGameMode];

      if (
        precomputedData?.filteredLevels?.[
          filter as keyof typeof precomputedData.filteredLevels
        ]
      ) {
        return precomputedData.filteredLevels[
          filter as keyof typeof precomputedData.filteredLevels
        ];
      }

      // Fallback filtering
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
    [levels, splashStore, safeGameMode]
  );

  const handleRetry = useCallback(() => {
    setError(null);
    loadLevels();
  }, [loadLevels]);

  // Load levels when gameMode changes
  useEffect(() => {
    loadLevels();
  }, [safeGameMode]);

  // CRITICAL FIX: Add debouncing to progress updates
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Check if progress was actually updated (not just initial load)
    if (progressLastUpdated && progressLastUpdated !== lastUpdateRef.current) {
      console.log(
        `[useLevelData] Progress store updated (${progressLastUpdated}), debouncing refresh for ${safeGameMode}`
      );

      // Update the reference
      lastUpdateRef.current = progressLastUpdated;

      // CRITICAL FIX: Faster debounce for immediate UI updates
      debounceTimeoutRef.current = setTimeout(() => {
        console.log(
          `[useLevelData] Debounced refresh executing for ${safeGameMode}`
        );

        // Only reload if not already refreshing
        if (!isRefreshingRef.current) {
          loadLevels();
        } else {
          console.log(
            `[useLevelData] Skipping debounced refresh - already in progress`
          );
        }
      }, 200); // REDUCED: From 500ms to 200ms for faster UI updates
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [progressLastUpdated, safeGameMode, loadLevels]);

  return {
    levels,
    showLevels,
    isLoading,
    error,
    completionPercentage,
    handleRetry,
    getFilteredLevels,
  };
};
