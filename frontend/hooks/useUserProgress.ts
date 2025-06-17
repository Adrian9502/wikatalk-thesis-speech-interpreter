import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getToken } from "@/lib/authTokenManager";
import { UserProgress } from "@/types/userProgress";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const useUserProgress = (quizId: string | number | "global") => {
  const [progress, setProgress] = useState<
    UserProgress | UserProgress[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Format the ID for API
  const formatQuizId = (id: string | number): string => {
    if (id === "global") return "global";

    // Make sure we're using the raw numeric ID
    const numericId =
      typeof id === "string"
        ? id.replace(/^n-/, "") // Remove prefix if already there
        : String(id); // Convert to string if not

    // Add prefix for API
    return `n-${numericId}`;
  };

  // Create default progress object
  const createDefaultProgress = (id: string | number): UserProgress => {
    return {
      userId: "",
      quizId: String(id),
      exercisesCompleted: 0,
      totalExercises: 1,
      completed: false,
      totalTimeSpent: 0,
      attempts: [],
    };
  };

  // Fetch progress
  const fetchProgress = async () => {
    try {
      setIsLoading(true);

      const token = getToken();
      if (!token) {
        console.log("[useUserProgress] No auth token available");
        setIsLoading(false);
        return quizId === "global" ? [] : createDefaultProgress(quizId);
      }

      // Handle global progress fetch (all user's progress)
      if (quizId === "global") {
        console.log(`[useUserProgress] Fetching all progress`);

        const response = await axios({
          method: "get",
          url: `${API_URL}/api/userprogress`,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });

        if (response.data.success) {
          console.log(`[useUserProgress] Successfully fetched global progress`);
          setProgress(response.data.progressEntries);
          return response.data.progressEntries;
        }

        return [];
      }

      // Normal case - specific quiz ID
      const formattedId = formatQuizId(quizId);
      console.log(`[useUserProgress] Fetching progress for: ${formattedId}`);

      // Enhanced axios call with timeout and retry
      const response = await axios({
        method: "get",
        url: `${API_URL}/api/userprogress/${formattedId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (response.data.success) {
        console.log(`[useUserProgress] Successfully fetched progress`);
        setProgress(response.data.progress);
        return response.data.progress;
      }

      return createDefaultProgress(quizId);
    } catch (err: any) {
      console.error(`[useUserProgress] Error:`, err.message);

      // Return default progress
      const defaultProgress =
        quizId === "global" ? [] : createDefaultProgress(quizId);
      setProgress(defaultProgress);
      return defaultProgress;
    } finally {
      setIsLoading(false);
    }
  };

  // Update progress
  const updateProgress = async (
    timeSpent: number,
    completed?: boolean,
    isCorrect?: boolean
  ) => {
    try {
      setIsLoading(true);

      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return null;
      }

      const formattedId = formatQuizId(quizId);
      console.log(
        `[useUserProgress] Updating progress for: ${formattedId}, time: ${timeSpent}, completed: ${completed}, isCorrect: ${isCorrect}`
      );

      // Enhanced axios call with isCorrect
      const response = await axios({
        method: "post",
        url: `${API_URL}/api/userprogress/${formattedId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { timeSpent, completed, isCorrect },
        timeout: 10000,
      });

      if (response.data.success) {
        console.log(`[useUserProgress] Successfully updated progress`);
        setProgress(response.data.progress);
        return response.data.progress;
      }

      return null;
    } catch (err: any) {
      console.error(`[useUserProgress] Update error:`, err.message);

      // If server error, try to create new progress
      try {
        return await fetchProgress();
      } catch (fetchErr) {
        console.error("[useUserProgress] Failed to create fallback progress");
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch progress on init
  useEffect(() => {
    if (quizId && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchProgress();
    }
  }, [quizId]);

  return {
    progress,
    isLoading,
    error,
    fetchProgress,
    updateProgress,
  };
};
