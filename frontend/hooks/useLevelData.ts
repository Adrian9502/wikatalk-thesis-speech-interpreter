import { useState, useEffect, useCallback } from "react";
import { LevelData } from "@/types/gameTypes";
import {
  useSplashStore,
  getLevelsForGameMode,
  isLevelsPrecomputed,
  getFilteredLevelsForGameMode,
} from "@/store/useSplashStore";
import useGameStore from "@/store/games/useGameStore";
import { convertQuizToLevels } from "@/utils/games/convertQuizToLevels";
import { useUserProgress } from "@/hooks/useUserProgress";

type FilterType = "all" | "completed" | "current" | "easy" | "medium" | "hard";

export const useLevelData = (gameMode: string | string[] | undefined) => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [showLevels, setShowLevels] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const {
    fetchQuestionsByMode,
    questions,
    isLoading: storeLoading,
    error: storeError,
  } = useGameStore();
  const { progress: globalProgress } = useUserProgress("global");

  const safeGameMode =
    typeof gameMode === "string" ? gameMode : String(gameMode);

  // Main effect to get levels data
  useEffect(() => {
    const loadLevels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, try to get precomputed levels from splash store
        if (isLevelsPrecomputed()) {
          console.log(
            `[useLevelData] Using precomputed levels for ${safeGameMode}`
          );

          const precomputedData = getLevelsForGameMode(safeGameMode);
          if (precomputedData) {
            setLevels(precomputedData.levels);
            setCompletionPercentage(precomputedData.completionPercentage);
            setShowLevels(true);
            setIsLoading(false);
            return;
          }
        }

        // Fallback: compute levels on demand (should rarely happen)
        console.log(
          `[useLevelData] Precomputed levels not available for ${safeGameMode}, computing on demand`
        );

        // Ensure we have questions
        if (!questions[safeGameMode]) {
          await fetchQuestionsByMode(safeGameMode);
        }

        // Convert to levels
        const progressArray = Array.isArray(globalProgress)
          ? globalProgress
          : [];
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
  }, [safeGameMode, questions, globalProgress, fetchQuestionsByMode]);

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
