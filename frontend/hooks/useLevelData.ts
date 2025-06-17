import { useState, useEffect, useCallback, useRef } from "react";
import useQuizStore from "@/store/games/useQuizStore";
import { LevelData, QuizQuestions } from "@/types/gameTypes";
import { convertQuizToLevels } from "@/utils/games/convertQuizToLevels";
import { useUserProgress } from "@/hooks/useUserProgress";

export const useLevelData = (gameMode: string | string[] | undefined) => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [showLevels, setShowLevels] = useState(false);

  const { fetchQuestionsByMode, questions, isLoading, error } = useQuizStore();
  const { progress: globalProgress, refreshProgress } = useUserProgress("global");
  
  // OPTIMIZED: Use refs to prevent unnecessary re-renders
  const hasInitializedRef = useRef(false);
  const lastGameModeRef = useRef<string | undefined>();
  const lastProgressHashRef = useRef<string>("");
  const levelsRef = useRef<LevelData[]>([]);

  // OPTIMIZED: Create a hash of progress to detect actual changes
  const getProgressHash = useCallback((progress: any[]): string => {
    if (!Array.isArray(progress)) return "";
    return progress
      .map(p => `${p.quizId}-${p.completed}-${p.lastAttemptDate}`)
      .sort()
      .join("|");
  }, []);

  // OPTIMIZED: Debounced fetch function
  const fetchData = useCallback(async () => {
    if (!gameMode || hasInitializedRef.current) return;
    
    const safeGameMode = typeof gameMode === "string" ? gameMode : String(gameMode);
    
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

  // OPTIMIZED: Process levels only when there are actual changes
  useEffect(() => {
    if (!gameMode || !questions) return;
    
    const progressArray = Array.isArray(globalProgress) ? globalProgress : [];
    const currentProgressHash = getProgressHash(progressArray);
    
    // Only process if there are actual changes
    const hasProgressChanged = currentProgressHash !== lastProgressHashRef.current;
    const hasNoLevels = levelsRef.current.length === 0;
    
    if (hasNoLevels || hasProgressChanged) {
      try {
        const safeGameMode = typeof gameMode === "string" ? gameMode : String(gameMode);
        
        console.log(`[useLevelData] Processing levels for ${safeGameMode} with ${progressArray.length} progress entries`);
        
        const currentLevels = convertQuizToLevels(
          safeGameMode,
          questions as QuizQuestions,
          progressArray
        );
        
        // OPTIMIZED: Only update if levels actually changed
        if (JSON.stringify(currentLevels) !== JSON.stringify(levelsRef.current)) {
          setLevels(currentLevels);
          levelsRef.current = currentLevels;
          lastProgressHashRef.current = currentProgressHash;

          // Show levels with a small delay
          if (currentLevels.length > 0) {
            setTimeout(() => setShowLevels(true), 100);
          }
        }
      } catch (error) {
        console.error("Error converting levels:", error);
        setLevels([]);
        setShowLevels(false);
      }
    }
  }, [gameMode, questions, globalProgress, getProgressHash]);

  // OPTIMIZED: Throttled refresh function
  const refreshLevels = useCallback(async () => {
    console.log(`[useLevelData] Manually refreshing levels`);
    try {
      await refreshProgress();
    } catch (error) {
      console.error("Error refreshing levels:", error);
    }
  }, [refreshProgress]);

  const completionPercentage = levels.length > 0
    ? (levels.filter((l) => l.status === "completed").length / levels.length) * 100
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
    refreshLevels,
  };
};