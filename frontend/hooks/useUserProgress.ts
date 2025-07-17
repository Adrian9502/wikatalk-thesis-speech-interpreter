import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { getToken } from "@/lib/authTokenManager";
import { UserProgress } from "@/types/userProgress";
import { useSplashStore } from "@/store/useSplashStore";
import useProgressStore from "@/store/games/useProgressStore";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const useUserProgress = (quizId: string | number | "global") => {
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ADD: Track current user to detect account changes
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Use refs to prevent unnecessary API calls and preserve state
  const hasInitializedRef = useRef(false);
  const lastQuizIdRef = useRef<string | number | "global" | null>(null);
  const progressCacheRef = useRef<{ [key: string]: any }>({});

  // Format the ID for API
  const formatQuizId = useCallback((id: string | number): string => {
    if (id === "global") return "global";

    const numericId =
      typeof id === "string" ? id.replace(/^n-/, "") : String(id);
    return `n-${numericId}`;
  }, []);

  // Create default progress object
  const createDefaultProgress = useCallback(
    (id: string | number): UserProgress => {
      return {
        userId: "",
        quizId: String(id),
        exercisesCompleted: 0,
        totalExercises: 1,
        completed: false,
        totalTimeSpent: 0,
        attempts: [],
      };
    },
    []
  );

  // ENHANCED: Check if we can use precomputed data from splash store
  const tryUsePrecomputedData = useCallback(() => {
    if (quizId === "global") {
      const progressStore = useProgressStore.getState();
      if (progressStore.progress) {
        console.log("[useUserProgress] Using precomputed global progress");
        setProgress(progressStore.progress);
        return true;
      }
    }
    return false;
  }, [quizId]);

  // ENHANCED: Stable fetch function with caching and precomputed data check
  const fetchProgress = useCallback(
    async (forceRefresh: boolean = false) => {
      const formattedId = formatQuizId(quizId);
      const cacheKey = formattedId;

      // NEW: Get current user ID (adjust path to your auth store) - FIX: Handle undefined
      const authStore = useAuthStore.getState();
      const newUserId =
        authStore.userData?.id || authStore.userData?.email || null;

      // NEW: Clear cache if user changed
      if (currentUserId !== null && currentUserId !== newUserId) {
        console.log(
          `[useUserProgress] User changed from ${currentUserId} to ${newUserId}, clearing cache`
        );
        progressCacheRef.current = {}; // Clear entire cache
        setCurrentUserId(newUserId); // This is now safe since newUserId is string | null
      } else if (currentUserId === null) {
        setCurrentUserId(newUserId); // This is now safe since newUserId is string | null
      }

      // Check cache only if not force refreshing AND user hasn't changed
      if (
        !forceRefresh &&
        progressCacheRef.current[cacheKey] &&
        currentUserId === newUserId
      ) {
        console.log(`[useUserProgress] Using cached data for ${formattedId}`);
        setProgress(progressCacheRef.current[cacheKey]);
        setIsLoading(false);
        return progressCacheRef.current[cacheKey];
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          console.log("[useUserProgress] No auth token available");
          const defaultResult =
            quizId === "global" ? [] : createDefaultProgress(quizId);
          setProgress(defaultResult);
          progressCacheRef.current[cacheKey] = defaultResult;
          return defaultResult;
        }

        // Handle global progress fetch
        if (quizId === "global") {
          console.log(
            `[useUserProgress] Fetching all progress (force: ${forceRefresh})`
          );

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
            console.log(
              `[useUserProgress] Successfully fetched global progress: ${response.data.progressEntries.length} entries`
            );
            const progressData = response.data.progressEntries;

            setProgress(progressData);
            progressCacheRef.current[cacheKey] = progressData;
            lastQuizIdRef.current = quizId;
            hasInitializedRef.current = true;

            return progressData;
          }

          const emptyResult: UserProgress[] = [];
          setProgress(emptyResult);
          progressCacheRef.current[cacheKey] = emptyResult;
          return emptyResult;
        }

        // Normal case - specific quiz ID
        const formattedId = formatQuizId(quizId);
        console.log(
          `[useUserProgress] Fetching progress for: ${formattedId} (force: ${forceRefresh})`
        );

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

          // FIXED: Handle null progress from backend
          const progressData = response.data.progress;

          if (progressData) {
            setProgress(progressData);
            progressCacheRef.current[cacheKey] = progressData;
            lastQuizIdRef.current = quizId;
            hasInitializedRef.current = true;
            return progressData;
          } else {
            // No progress found, create default
            console.log(
              `[useUserProgress] No progress found, creating default`
            );
            const defaultResult = createDefaultProgress(quizId);
            setProgress(defaultResult);
            progressCacheRef.current[cacheKey] = defaultResult;
            return defaultResult;
          }
        }

        const defaultResult = createDefaultProgress(quizId);
        setProgress(defaultResult);
        progressCacheRef.current[cacheKey] = defaultResult;
        return defaultResult;
      } catch (err: any) {
        console.error(`[useUserProgress] Error:`, err.message);
        setError(err.message);

        const defaultResult =
          quizId === "global" ? [] : createDefaultProgress(quizId);
        setProgress(defaultResult);
        progressCacheRef.current[cacheKey] = defaultResult;
        return defaultResult;
      } finally {
        setIsLoading(false);
      }
    },
    [
      quizId,
      formatQuizId,
      createDefaultProgress,
      tryUsePrecomputedData,
      currentUserId,
    ]
  );

  // ENHANCED: Update progress function with better error handling
  const updateProgress = useCallback(
    async (timeSpent: number, completed?: boolean, isCorrect?: boolean) => {
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
          const updatedProgress = response.data.progress;

          // Update current progress
          setProgress(updatedProgress);

          // Update cache for current quiz
          const currentCacheKey = String(quizId);
          progressCacheRef.current[currentCacheKey] = updatedProgress;

          // CRITICAL: Clear ALL cache entries to force fresh data on next access
          console.log(
            `[useUserProgress] Clearing all cache entries to force refresh`
          );
          progressCacheRef.current = {
            [currentCacheKey]: updatedProgress, // Keep only the current one
          };

          // If this was a completion, invalidate precomputed data
          if (completed && isCorrect) {
            console.log(
              `[useUserProgress] Level completed! Invalidating precomputed data...`
            );

            // Invalidate splash store precomputed levels AND filters
            const splashStore = useSplashStore.getState();
            splashStore.reset(); // This will force recomputation on next access

            console.log(
              `[useUserProgress] All precomputed data invalidated - levels and filters will be recomputed`
            );
          }

          return updatedProgress;
        }

        return null;
      } catch (err: any) {
        console.error(`[useUserProgress] Update error:`, err.message);
        setError(err.message);

        // FIXED: Better error recovery - try to fetch fresh data
        try {
          console.log(
            `[useUserProgress] Attempting to fetch fresh data after error`
          );
          const freshData = await fetchProgress(true); // Force refresh on error
          if (freshData) {
            console.log(
              `[useUserProgress] Successfully recovered with fresh data`
            );
            return freshData;
          }
        } catch (fetchErr) {
          console.error(
            "[useUserProgress] Failed to fetch fresh data:",
            fetchErr
          );
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [quizId, formatQuizId, fetchProgress]
  );

  // Initialize only once per quizId change
  useEffect(() => {
    if (quizId && lastQuizIdRef.current !== quizId) {
      hasInitializedRef.current = false; // Reset for new quizId
      fetchProgress(false); // Don't force refresh on first load
    }
  }, [quizId, fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    fetchProgress,
    updateProgress,
  };
};
