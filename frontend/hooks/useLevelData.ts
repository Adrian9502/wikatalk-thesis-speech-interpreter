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

  // CRITICAL: Add debouncing refs to prevent multiple operations
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const lastDataTimestamp = useRef<number>(0);

  const { questions, fetchQuestionsByMode } = useGameStore();
  const splashStore = useSplashStore();

  // Get progress store state directly
  const progressLastUpdated = useProgressStore((state) => state.lastUpdated);

  const safeGameMode = useMemo(() => {
    return typeof gameMode === "string" ? gameMode : String(gameMode);
  }, [gameMode]);

  // OPTIMIZED: Use splash store data first, avoid redundant operations
  const loadLevels = useCallback(async () => {
    // PREVENT multiple concurrent operations
    if (isRefreshingRef.current) {
      console.log(`[useLevelData] Already loading ${safeGameMode}, skipping`);
      return;
    }

    try {
      isRefreshingRef.current = true;
      setIsLoading(true);
      setError(null);

      console.log(`[useLevelData] Loading levels for ${safeGameMode}`);

      // PRIORITY 1: Check if we have fresh precomputed data from splash store
      const precomputedData = splashStore.precomputedLevels[safeGameMode];
      const dataAge = precomputedData?.lastUpdated
        ? Date.now() - precomputedData.lastUpdated
        : Infinity;

      // Use precomputed data if it's less than 30 seconds old
      if (precomputedData && dataAge < 30000) {
        console.log(
          `[useLevelData] Using fresh precomputed levels for ${safeGameMode} (${dataAge}ms old)`
        );

        setLevels(precomputedData.levels);
        setCompletionPercentage(precomputedData.completionPercentage);
        setShowLevels(true);
        setIsLoading(false);
        lastDataTimestamp.current = Date.now();
        return;
      }

      // PRIORITY 2: If data is stale, check if we need to refresh progress first
      console.log(
        `[useLevelData] Computing levels on demand for ${safeGameMode}`
      );

      // Ensure we have questions
      if (!questions[safeGameMode]) {
        console.log(`[useLevelData] Fetching questions for ${safeGameMode}`);
        await fetchQuestionsByMode(safeGameMode);
      }

      // CRITICAL: Only fetch progress if significantly stale (> 2 minutes)
      const progressStore = useProgressStore.getState();
      const progressAge = progressStore.lastUpdated
        ? Date.now() - progressStore.lastUpdated
        : Infinity;

      let currentProgress = progressStore.progress;

      if (progressAge > 120000) {
        // Only if > 2 minutes old
        console.log(
          `[useLevelData] Progress is stale (${progressAge}ms), refreshing`
        );
        currentProgress = await progressStore.fetchProgress(true);
      } else {
        console.log(
          `[useLevelData] Using cached progress (${progressAge}ms old)`
        );
        currentProgress = progressStore.progress;
      }

      // Convert to levels ONCE
      const progressArray = Array.isArray(currentProgress)
        ? currentProgress
        : [];
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

      // Update state
      setLevels(currentLevels);
      setCompletionPercentage(percentage);
      setShowLevels(true);
      lastDataTimestamp.current = Date.now();

      console.log(
        `[useLevelData] ${safeGameMode}: ${currentLevels.length} levels loaded (${percentage}% complete)`
      );

      // BACKGROUND: Update splash store cache (non-blocking)
      setTimeout(async () => {
        try {
          await splashStore.precomputeSpecificGameMode(
            safeGameMode,
            currentLevels,
            progressArray
          );
        } catch (err) {
          console.warn(`[useLevelData] Background cache update failed:`, err);
        }
      }, 100); // Small delay to not block UI
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[useLevelData] Error loading levels:`, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [safeGameMode, questions, fetchQuestionsByMode, splashStore]);

  // OPTIMIZED: Enhanced getFilteredLevels that uses precomputed filters
  const getFilteredLevels = useCallback(
    (filter: string) => {
      const precomputedData = splashStore.precomputedLevels[safeGameMode];

      // Use precomputed filters if available
      if (
        precomputedData?.filteredLevels?.[
          filter as keyof typeof precomputedData.filteredLevels
        ]
      ) {
        const startTime = Date.now();
        const filtered =
          precomputedData.filteredLevels[
            filter as keyof typeof precomputedData.filteredLevels
          ];
        const duration = Date.now() - startTime;

        console.log(
          `[useLevelData] Filter applied in ${duration}ms - ${filtered.length} levels`
        );
        return filtered;
      }

      // Fallback to manual filtering if no precomputed data
      console.log(`[useLevelData] Using manual filter for ${filter}`);
      const startTime = Date.now();

      let filtered = levels;
      switch (filter) {
        case "completed":
          filtered = levels.filter((level) => level.status === "completed");
          break;
        case "current":
          filtered = levels.filter((level) => level.status === "current");
          break;
        case "easy":
          filtered = levels.filter(
            (level) =>
              level.difficulty === "Easy" || level.difficultyCategory === "easy"
          );
          break;
        case "medium":
          filtered = levels.filter(
            (level) =>
              level.difficulty === "Medium" ||
              level.difficultyCategory === "medium"
          );
          break;
        case "hard":
          filtered = levels.filter(
            (level) =>
              level.difficulty === "Hard" || level.difficultyCategory === "hard"
          );
          break;
        default:
          filtered = levels;
      }

      const duration = Date.now() - startTime;
      console.log(
        `[useLevelData] Manual filter applied in ${duration}ms - ${filtered.length} levels`
      );
      return filtered;
    },
    [levels, splashStore.precomputedLevels, safeGameMode]
  );

  const handleRetry = useCallback(() => {
    setError(null);
    isRefreshingRef.current = false; // Reset flag
    loadLevels();
  }, [loadLevels]);

  // Initial load
  useEffect(() => {
    loadLevels();
  }, [safeGameMode]); // Only depend on gameMode, not progressLastUpdated

  // SIMPLIFIED: Only refresh on significant progress updates with debouncing
  useEffect(() => {
    // Skip if no previous data or if we just loaded
    const timeSinceLastLoad = Date.now() - lastDataTimestamp.current;
    if (timeSinceLastLoad < 5000) {
      // Skip if we loaded data less than 5 seconds ago
      console.log(
        `[useLevelData] Skipping refresh - data is fresh (${timeSinceLastLoad}ms)`
      );
      return;
    }

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce with longer delay
    debounceTimeoutRef.current = setTimeout(() => {
      if (!isRefreshingRef.current) {
        console.log(
          `[useLevelData] Debounced refresh executing for ${safeGameMode}`
        );
        loadLevels();
      }
    }, 500); // Increased debounce time

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
