import { useState, useEffect, useCallback } from "react";
import { getToken } from "@/lib/authTokenManager";
import { LevelData } from "@/types/gameTypes";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface CompletedLevelDetails {
  question: string;
  answer: string;
  timeSpent: number;
  completedDate: string;
  isCorrect: boolean;
  totalAttempts: number; // Add this field
  correctAttempts: number; // Add this field for extra insight
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

  const fetchLevelDetails = useCallback(async () => {
    if (!level || !shouldFetch) {
      console.log('[useLevelDetails] Skipping fetch - level:', !!level, 'shouldFetch:', shouldFetch);
      return;
    }

    console.log('[useLevelDetails] Starting fetch for level:', level.id);
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const formattedId = `n-${level.id}`;
      console.log('[useLevelDetails] Fetching progress for ID:', formattedId);

      const response = await axios({
        method: "get",
        url: `${API_URL}/api/userprogress/${formattedId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      console.log('[useLevelDetails] API Response:', response.data);

      if (response.data.success) {
        const progressData = response.data.progress;
        console.log('[useLevelDetails] Progress data:', progressData);

        // ENHANCED: Calculate attempts statistics
        const attempts = progressData.attempts || [];
        const totalAttempts = attempts.length;
        const correctAttempts = attempts.filter((attempt: any) => attempt.isCorrect).length;

        console.log('[useLevelDetails] Attempts analysis:', {
          total: totalAttempts,
          correct: correctAttempts,
          attempts: attempts
        });

        // Find the last successful attempt
        const lastCorrectAttempt = attempts
          .slice()
          .reverse()
          .find((a: any) => a.isCorrect) || attempts[attempts.length - 1];

        console.log('[useLevelDetails] Last correct attempt:', lastCorrectAttempt);

        // Format date
        const completedDate = new Date(
          lastCorrectAttempt?.attemptDate || progressData.lastAttemptDate || new Date()
        );
        const formattedDate = completedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // ENHANCED: Better question and answer extraction
        let question = "Question not available";
        let answer = "Answer not available";

        // Try multiple sources for question data
        if (level.questionData) {
          console.log('[useLevelDetails] Level questionData:', level.questionData);
          
          // For multiple choice questions
          if (level.questionData.question) {
            question = level.questionData.question;
          } else if (level.questionData.sentence) {
            question = level.questionData.sentence;
          }

          // For answers
          if (level.questionData.options && Array.isArray(level.questionData.options)) {
            const correctOption = level.questionData.options.find((o: any) => o.isCorrect);
            if (correctOption) {
              answer = correctOption.text;
            }
          } else if (level.questionData.answer) {
            answer = level.questionData.answer;
          }
        } else {
          console.log('[useLevelDetails] No questionData found, using level info');
          question = level.title || level.description || "Question not available";
          answer = "Completed successfully";
        }

        // ENHANCED: Create details object with attempts data
        const levelDetails: CompletedLevelDetails = {
          question,
          answer,
          timeSpent: progressData.totalTimeSpent || 0,
          completedDate: formattedDate,
          isCorrect: true,
          totalAttempts, // Include total attempts
          correctAttempts, // Include correct attempts
        };

        console.log('[useLevelDetails] Final details with attempts:', levelDetails);
        setDetails(levelDetails);
      } else {
        throw new Error(response.data.message || "Failed to fetch progress data");
      }
    } catch (err: any) {
      console.error("[useLevelDetails] Error fetching level details:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load level details";
      setError(errorMessage);

      // ENHANCED: Fallback details with default attempts
      if (level) {
        const fallbackDetails: CompletedLevelDetails = {
          question: level.title || level.description || "Question not available",
          answer: "Completed successfully",
          timeSpent: 0,
          completedDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          isCorrect: true,
          totalAttempts: 1, // Default fallback
          correctAttempts: 1, // Default fallback
        };
        console.log('[useLevelDetails] Using fallback details with attempts:', fallbackDetails);
        setDetails(fallbackDetails);
      }
    } finally {
      setIsLoading(false);
    }
  }, [level, shouldFetch]);

  // Fetch when dependencies change
  useEffect(() => {
    if (shouldFetch && level) {
      console.log('[useLevelDetails] Effect triggered - fetching details');
      fetchLevelDetails();
    } else if (!shouldFetch) {
      console.log('[useLevelDetails] Effect triggered - clearing details');
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
