import { useState, useEffect, useCallback } from "react";
import { LevelData } from "@/types/gameTypes";
import {
  getLevelDetailsForLevel,
  isLevelDetailsPrecomputed,
} from "@/store/useSplashStore";
// NEW: Import the centralized service instead of using direct axios
import { progressService } from "@/services/api/progressService";

interface CompletedLevelDetails {
  question: string;
  answer: string;
  timeSpent: number;
  completedDate: string;
  isCorrect: boolean;
  totalAttempts: number;
  correctAttempts: number;
}

interface UseLevelDetailsReturn {
  details: CompletedLevelDetails | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLevelDetails = (
  level: LevelData | null,
  shouldFetch: boolean = false
): UseLevelDetailsReturn => {
  const [details, setDetails] = useState<CompletedLevelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced function to extract question and answer from level data
  const extractQuestionAndAnswer = useCallback(
    (levelData: LevelData, progressData: any) => {
      let question = "Question not available";
      let answer = "Answer not available";

      console.log("[useLevelDetails] Extracting Q&A from level:", levelData);

      try {
        if (levelData.questionData) {
          // Extract question
          if (levelData.questionData.question) {
            question = levelData.questionData.question;
          } else if (levelData.questionData.sentence) {
            question = levelData.questionData.sentence;
          } else if (levelData.questionData.prompt) {
            question = levelData.questionData.prompt;
          }

          // Extract answer - unified options handling
          if (levelData.questionData.answer) {
            answer = levelData.questionData.answer;
          } else if (
            levelData.questionData.options &&
            Array.isArray(levelData.questionData.options)
          ) {
            const mode = levelData.questionData.mode;

            if (mode === "multipleChoice") {
              const correctOption = levelData.questionData.options.find(
                (opt: any) => opt.isCorrect
              );
              if (correctOption) {
                answer = correctOption.text;
              }
            } else if (mode === "identification") {
              const correctOption = levelData.questionData.options.find(
                (opt: any) =>
                  opt.text === levelData.questionData.answer ||
                  opt.id === levelData.questionData.answer
              );
              if (correctOption) {
                answer = correctOption.text;
              }
            }
          }
        }

        // Use progress data if available
        if (
          progressData &&
          progressData.attempts &&
          progressData.attempts.length > 0
        ) {
          const lastCorrectAttempt = progressData.attempts
            .slice()
            .reverse()
            .find((attempt: any) => attempt.isCorrect);

          if (lastCorrectAttempt && lastCorrectAttempt.userAnswer) {
            answer = lastCorrectAttempt.userAnswer;
          }
        }

        // Fallbacks
        if (question === "Question not available") {
          question =
            levelData.title ||
            levelData.description ||
            `Level ${levelData.number || levelData.id}`;
        }

        if (answer === "Answer not available") {
          if (levelData.questionData) {
            const mode = levelData.questionData.mode;
            if (mode === "identification" && levelData.questionData.answer) {
              answer = levelData.questionData.answer;
            } else if (mode === "fillBlanks" && levelData.questionData.answer) {
              answer = levelData.questionData.answer;
            } else {
              answer = "Completed successfully";
            }
          } else {
            answer = "Completed successfully";
          }
        }
      } catch (err) {
        console.error("[useLevelDetails] Error extracting Q&A:", err);
        question =
          levelData.title ||
          levelData.description ||
          `Level ${levelData.number || levelData.id}`;
        answer = "Completed successfully";
      }

      return { question, answer };
    },
    []
  );

  const fetchLevelDetails = useCallback(async () => {
    if (!level || !shouldFetch) {
      return;
    }

    // PRIORITY 1: Check precomputed data FIRST and return immediately
    if (isLevelDetailsPrecomputed()) {
      console.log(
        "[useLevelDetails] Checking precomputed data for level:",
        level.id
      );
      const precomputedDetails = getLevelDetailsForLevel(level.id);

      if (precomputedDetails) {
        console.log(
          "[useLevelDetails] Using precomputed details - NO FETCH NEEDED"
        );
        setDetails(precomputedDetails);
        setIsLoading(false);
        setError(null);
        return; // EARLY RETURN - no fetch needed
      }
    }

    // PRIORITY 2: Only fetch if no precomputed data
    console.log("[useLevelDetails] No precomputed data - starting API fetch");
    setIsLoading(true);
    setError(null);

    try {
      // NEW: Use centralized service instead of direct axios call
      const response = await progressService.getLevelDetails(level.id);

      if (response.success) {
        const progressData = response.progress;
        const attempts = progressData.attempts || [];
        const totalAttempts = attempts.length;
        const correctAttempts = attempts.filter(
          (attempt: any) => attempt.isCorrect
        ).length;

        const lastCorrectAttempt =
          attempts
            .slice()
            .reverse()
            .find((a: any) => a.isCorrect) || attempts[attempts.length - 1];

        const completedDate = new Date(
          lastCorrectAttempt?.attemptDate ||
            progressData.lastAttemptDate ||
            new Date()
        );
        const formattedDate = completedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        const { question, answer } = extractQuestionAndAnswer(
          level,
          progressData
        );

        const levelDetails: CompletedLevelDetails = {
          question,
          answer,
          timeSpent: progressData.totalTimeSpent || 0,
          completedDate: formattedDate,
          isCorrect: true,
          totalAttempts,
          correctAttempts,
        };

        setDetails(levelDetails);
      } else {
        throw new Error(response.message || "Failed to fetch progress data");
      }
    } catch (err: any) {
      console.error("[useLevelDetails] Error fetching level details:", err);

      // NEW: Better error handling for centralized API
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load level details";
      setError(errorMessage);

      // Create fallback details
      if (level) {
        const { question, answer } = extractQuestionAndAnswer(level, null);
        const fallbackDetails: CompletedLevelDetails = {
          question,
          answer,
          timeSpent: 0,
          completedDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          isCorrect: true,
          totalAttempts: 1,
          correctAttempts: 1,
        };
        setDetails(fallbackDetails);
      }
    } finally {
      setIsLoading(false);
    }
  }, [level, shouldFetch, extractQuestionAndAnswer]);

  // OPTIMIZED: Effect that checks precomputed data synchronously first
  useEffect(() => {
    if (!shouldFetch || !level) {
      setDetails(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // IMMEDIATE CHECK: Try precomputed data first (synchronous)
    if (isLevelDetailsPrecomputed()) {
      const precomputedDetails = getLevelDetailsForLevel(level.id);
      if (precomputedDetails) {
        console.log(
          "[useLevelDetails] Immediate precomputed data found - no loading state"
        );
        setDetails(precomputedDetails);
        setIsLoading(false);
        setError(null);
        return; // Don't call fetchLevelDetails
      }
    }

    // FALLBACK: If no precomputed data, then fetch
    console.log("[useLevelDetails] No immediate data - will fetch");
    fetchLevelDetails();
  }, [level?.id, shouldFetch, fetchLevelDetails]);

  return {
    details,
    isLoading,
    error,
    refetch: fetchLevelDetails,
  };
};
