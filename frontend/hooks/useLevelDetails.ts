import { useState, useEffect, useCallback } from "react";
import { getToken } from "@/lib/authTokenManager";
import { LevelData } from "@/types/gameTypes";
import {
  getLevelDetailsForLevel,
  isLevelDetailsPrecomputed,
} from "@/store/useSplashStore";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
      console.log("[useLevelDetails] Progress data:", progressData);

      try {
        if (levelData.questionData) {
          console.log(
            "[useLevelDetails] Using questionData:",
            levelData.questionData
          );

          // Extract question
          if (levelData.questionData.question) {
            question = levelData.questionData.question;
          } else if (levelData.questionData.sentence) {
            question = levelData.questionData.sentence;
          } else if (levelData.questionData.prompt) {
            question = levelData.questionData.prompt;
          }

          // UPDATED: Extract answer - unified options handling
          if (levelData.questionData.answer) {
            // For fillBlanks and identification modes - direct answer
            answer = levelData.questionData.answer;
            console.log("[useLevelDetails] Found direct answer:", answer);
          } else if (
            levelData.questionData.options &&
            Array.isArray(levelData.questionData.options)
          ) {
            // UPDATED: Handle both multipleChoice and identification using options
            const mode = levelData.questionData.mode;

            if (mode === "multipleChoice") {
              // For multipleChoice - find the option marked as correct
              const correctOption = levelData.questionData.options.find(
                (opt: any) => opt.isCorrect
              );
              if (correctOption) {
                answer = correctOption.text;
                console.log("[useLevelDetails] Found correct option:", answer);
              }
            } else if (mode === "identification") {
              // For identification - find the option that matches the answer
              const correctOption = levelData.questionData.options.find(
                (opt: any) =>
                  opt.text === levelData.questionData.answer ||
                  opt.id === levelData.questionData.answer
              );
              if (correctOption) {
                answer = correctOption.text;
                console.log(
                  "[useLevelDetails] Found correct identification option:",
                  answer
                );
              }
            }
          }
        }

        // Priority 2: Use progress data if available
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
            console.log(
              "[useLevelDetails] Found user answer from progress:",
              answer
            );
          }
        }

        // Priority 3: Use level basic info as fallback for question
        if (question === "Question not available") {
          question =
            levelData.title ||
            levelData.description ||
            `Level ${levelData.number || levelData.id}`;
        }

        // Priority 4: Enhanced answer fallback
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

        console.log("[useLevelDetails] Final Q&A:", { question, answer });
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
      console.log(
        "[useLevelDetails] Skipping fetch - level:",
        !!level,
        "shouldFetch:",
        shouldFetch
      );
      return;
    }

    // NEW: Check if we have precomputed data first
    if (isLevelDetailsPrecomputed()) {
      console.log(
        "[useLevelDetails] Checking precomputed data for level:",
        level.id
      );
      const precomputedDetails = getLevelDetailsForLevel(level.id);

      if (precomputedDetails) {
        console.log(
          "[useLevelDetails] Using precomputed details:",
          precomputedDetails
        );
        setDetails(precomputedDetails);
        setIsLoading(false);
        setError(null);
        return;
      }
    }

    console.log("[useLevelDetails] Starting fetch for level:", level.id);
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const formattedId = `n-${level.id}`;
      console.log("[useLevelDetails] Fetching progress for ID:", formattedId);

      const response = await axios({
        method: "get",
        url: `${API_URL}/api/userprogress/${formattedId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      console.log("[useLevelDetails] API Response:", response.data);

      if (response.data.success) {
        const progressData = response.data.progress;
        console.log("[useLevelDetails] Progress data:", progressData);

        const attempts = progressData.attempts || [];
        const totalAttempts = attempts.length;
        const correctAttempts = attempts.filter(
          (attempt: any) => attempt.isCorrect
        ).length;

        console.log("[useLevelDetails] Attempts analysis:", {
          total: totalAttempts,
          correct: correctAttempts,
          attempts: attempts,
        });

        const lastCorrectAttempt =
          attempts
            .slice()
            .reverse()
            .find((a: any) => a.isCorrect) || attempts[attempts.length - 1];

        console.log(
          "[useLevelDetails] Last correct attempt:",
          lastCorrectAttempt
        );

        const completedDate = new Date(
          lastCorrectAttempt?.attemptDate ||
            progressData.lastAttemptDate ||
            new Date()
        );
        const formattedDate = completedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
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

        console.log("[useLevelDetails] Final details:", levelDetails);
        setDetails(levelDetails);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch progress data"
        );
      }
    } catch (err: any) {
      console.error("[useLevelDetails] Error fetching level details:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load level details";
      setError(errorMessage);

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

        console.log(
          "[useLevelDetails] Using enhanced fallback details:",
          fallbackDetails
        );
        setDetails(fallbackDetails);
      }
    } finally {
      setIsLoading(false);
    }
  }, [level, shouldFetch, extractQuestionAndAnswer]);

  useEffect(() => {
    if (shouldFetch && level) {
      console.log("[useLevelDetails] Effect triggered - fetching details");
      fetchLevelDetails();
    } else if (!shouldFetch) {
      console.log("[useLevelDetails] Effect triggered - clearing details");
      setDetails(null);
      setError(null);
    }
  }, [fetchLevelDetails, shouldFetch, level?.id]);

  return {
    details,
    isLoading,
    error,
    refetch: fetchLevelDetails,
  };
};
