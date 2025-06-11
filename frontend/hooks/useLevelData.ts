import { useState, useEffect, useCallback } from "react";
import useQuizStore from "@/store/games/useQuizStore";
import { LevelData, QuizQuestions } from "@/types/gameTypes";
import { convertQuizToLevels } from "@/utils/games/convertQuizToLevels";

export const useLevelData = (gameMode: string | string[] | undefined) => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [showLevels, setShowLevels] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { fetchQuestionsByMode, questions, isLoading, error } = useQuizStore();

  // Fetch level data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (gameMode) {
        try {
          await fetchQuestionsByMode(
            typeof gameMode === "string" ? gameMode : String(gameMode)
          );
        } catch (error) {
          console.error("Error fetching questions:", error);
        }
      }
    };

    fetchData();
  }, [gameMode, fetchQuestionsByMode]);

  // Process questions when they change in the store
  useEffect(() => {
    if (gameMode && questions) {
      try {
        // Then ensure gameMode is always a string
        const safeGameMode =
          typeof gameMode === "string" ? gameMode : String(gameMode);

        // Convert the questions data safely - add type assertion to avoid 'never' issues
        const currentLevels = convertQuizToLevels(
          safeGameMode,
          questions as QuizQuestions
        );
        setLevels(currentLevels);

        // Show levels with a small delay to ensure smooth animation
        if (currentLevels.length > 0) {
          setTimeout(() => {
            setShowLevels(true);
          }, 100);
        }
      } catch (error) {
        console.error("Error converting levels:", error);
        setLevels([]);
        setShowLevels(false);
      }
    }
  }, [gameMode, questions]);

  const completionPercentage =
    levels.length > 0
      ? (levels.filter((l) => l.status === "completed").length /
          levels.length) *
        100
      : 0;

  // Level selection handler
  const handleLevelSelect = useCallback((level: LevelData) => {
    if (level.status === "locked") return;
    requestAnimationFrame(() => {
      setSelectedLevel(level);
      setShowModal(true);
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleRetry = useCallback(async () => {
    if (gameMode) {
      try {
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
    selectedLevel,
    showModal,
    handleLevelSelect,
    handleCloseModal,
    handleRetry,
  };
};
