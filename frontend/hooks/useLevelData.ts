import { useState, useEffect, useCallback, useRef } from "react";
import useGameStore from "@/store/games/useGameStore";
import { LevelData, QuizQuestions } from "@/types/gameTypes";
import { convertQuizToLevels } from "@/utils/games/convertQuizToLevels";
import { useUserProgress } from "@/hooks/useUserProgress";

export const useLevelData = (gameMode: string | string[] | undefined) => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [showLevels, setShowLevels] = useState(false);

  const { fetchQuestionsByMode, questions, isLoading, error } = useGameStore();
  const { progress: globalProgress } = useUserProgress("global");

  // PERFORMANCE FIX: More efficient refs
  const hasInitializedRef = useRef(false);
  const lastGameModeRef = useRef<string | undefined>();
  const lastProgressHashRef = useRef<string>("");
  const levelsRef = useRef<LevelData[]>([]);
  const isProcessingRef = useRef(false);

  // PERFORMANCE FIX: Optimized progress hash
  const getProgressHash = useCallback((progress: any[]): string => {
    if (!Array.isArray(progress)) return "";
    return progress
      .map((p) => `${p.quizId}-${p.completed}-${p.totalTimeSpent}`)
      .sort()
      .join("|");
  }, []);

  // PERFORMANCE FIX: Debounced fetch function
  const fetchData = useCallback(async () => {
    if (!gameMode || hasInitializedRef.current) return;

    const safeGameMode =
      typeof gameMode === "string" ? gameMode : String(gameMode);

    if (lastGameModeRef.current === safeGameMode) return;

    try {
      console.log(`[useLevelData] Fetching data for ${safeGameMode}`);
      lastGameModeRef.current = safeGameMode;
      hasInitializedRef.current = true;

      await fetchQuestionsByMode(safeGameMode);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }, [gameMode, fetchQuestionsByMode]);

  // Initialize data fetch only once
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Separate effect to handle showLevels state
  useEffect(() => {
    if (levels.length > 0 && !showLevels) {
      const timer = setTimeout(() => setShowLevels(true), 100);
      return () => clearTimeout(timer);
    }
  }, [levels.length, showLevels]);

  useEffect(() => {
    if (!gameMode || !questions || isProcessingRef.current) return;
    const progressArray = Array.isArray(globalProgress) ? globalProgress : [];
    const currentProgressHash = getProgressHash(progressArray); // Only process if there are actual changes
    const hasProgressChanged =
      currentProgressHash !== lastProgressHashRef.current;
    const hasNoLevels = levelsRef.current.length === 0;
    if (hasNoLevels || hasProgressChanged) {
      isProcessingRef.current = true;
      try {
        const safeGameMode =
          typeof gameMode === "string" ? gameMode : String(gameMode);
        console.log(
          `[useLevelData] Processing levels for ${safeGameMode} (hash changed: ${hasProgressChanged})`
        );
        const currentLevels = convertQuizToLevels(
          safeGameMode,
          questions as QuizQuestions,
          progressArray
        );
        // PERFORMANCE FIX: More efficient comparison
        const statusChanges = currentLevels.filter((newLevel, index) => {
          const oldLevel = levelsRef.current[index];
          return !oldLevel || oldLevel.status !== newLevel.status;
        });
        if (statusChanges.length > 0 || hasNoLevels) {
          console.log(
            `[useLevelData] ${statusChanges.length} level status changes detected`
          );
          setLevels(currentLevels);
          levelsRef.current = currentLevels;
          lastProgressHashRef.current = currentProgressHash;
          // Show levels immediately for first load, no delay
          if (currentLevels.length > 0 && hasNoLevels) {
            setShowLevels(true);
          }
        } else {
          console.log(`[useLevelData] No level status changes detected`);
        }
      } catch (error) {
        console.error("Error converting levels:", error);
        setLevels([]);
        setShowLevels(false);
      } finally {
        isProcessingRef.current = false;
      }
    }
  }, [gameMode, questions, globalProgress, getProgressHash]);

  const completionPercentage =
    levels.length > 0
      ? (levels.filter((l) => l.status === "completed").length /
          levels.length) *
        100
      : 0;

  const handleRetry = useCallback(async () => {
    if (gameMode) {
      try {
        hasInitializedRef.current = false;
        lastGameModeRef.current = undefined;

        await fetchQuestionsByMode(
          typeof gameMode === "string" ? gameMode : String(gameMode)
        );
      } catch (error) {
        console.error("Error retrying fetch:", error);
      }
    }
  }, [gameMode, fetchQuestionsByMode]);

  return {
    levels,
    showLevels,
    isLoading,
    error,
    completionPercentage,
    handleRetry,
  };
};
