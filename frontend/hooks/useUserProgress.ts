import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { getToken } from "@/lib/authTokenManager";
import { UserProgress } from "@/types/userProgress";
import { useSplashStore } from "@/store/useSplashStore";
import useProgressStore from "@/store/games/useProgressStore";
import { getCurrentUserId, hasUserChanged } from "@/utils/dataManager";
import { getIndividualProgressFromCache } from "@/store/useSplashStore";
import { calculateResetCost } from "@/utils/resetCostUtils";

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

  // NEW: Add refs to track fetch state
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const abortControllerRef = useRef<AbortController | null>(null);

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

  // ENHANCED: Try cached data first before setting loading state
  const tryUseCachedProgress = useCallback(() => {
    if (quizId === "global") {
      const progressStore = useProgressStore.getState();
      if (progressStore.progress) {
        console.log("[useUserProgress] Using cached global progress");
        setProgress(progressStore.progress);
        setIsLoading(false);
        return true;
      }
    } else {
      // Check individual cache first
      const cachedProgress = getIndividualProgressFromCache(quizId);
      if (cachedProgress) {
        console.log(
          `[useUserProgress] Using cached individual progress for ${quizId}`
        );
        setProgress(cachedProgress);
        setIsLoading(false);

        // Cache it locally too
        const formattedId = formatQuizId(quizId);
        progressCacheRef.current[formattedId] = cachedProgress;
        return true;
      }
    }
    return false;
  }, [quizId, formatQuizId]);

  // ENHANCED: Immediate cache check on mount
  useEffect(() => {
    if (quizId && lastQuizIdRef.current !== quizId) {
      hasInitializedRef.current = false;

      // NEW: Try cache IMMEDIATELY and set loading to false if found
      const foundCache = tryUseCachedProgress();

      if (!foundCache) {
        // Only set loading to true if we don't have cache
        setIsLoading(true);
        fetchProgress(false);
      }
    }
  }, [quizId, tryUseCachedProgress]);

  // ENHANCED: Stable fetch function with better force refresh handling
  const fetchProgress = useCallback(
    async (forceRefresh: boolean = false) => {
      // Prevent multiple concurrent fetches
      if (isFetchingRef.current && !forceRefresh) {
        console.log(`[useUserProgress] Fetch already in progress, skipping`);
        return progress;
      }

      // CRITICAL: Always clear cache on force refresh
      if (forceRefresh) {
        console.log(`[useUserProgress] Force refresh - clearing ALL caches`);
        progressCacheRef.current = {};

        // Also clear splash store cache for this specific item
        const splashStore = useSplashStore.getState();
        if (quizId !== "global" && splashStore.clearIndividualProgress) {
          splashStore.clearIndividualProgress(String(quizId));
        }
      }

      // Debounce rapid calls (unless force refresh)
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTimeRef.current < 500) {
        console.log(`[useUserProgress] Debouncing fetch call`);
        return progress;
      }

      lastFetchTimeRef.current = now;
      isFetchingRef.current = true;

      const formattedId = formatQuizId(quizId);
      const cacheKey = formattedId;

      // NEW: Get current user ID using dataManager
      const newUserId = getCurrentUserId();

      // Clear cache if user changed
      if (hasUserChanged(newUserId)) {
        console.log(`[useUserProgress] User changed, clearing cache`);
        progressCacheRef.current = {};
        setCurrentUserId(newUserId);
      } else if (currentUserId === null) {
        setCurrentUserId(newUserId);
      }

      // ENHANCED: Skip cache check if force refresh
      if (!forceRefresh && currentUserId === newUserId) {
        // 1. Check local cache first
        if (progressCacheRef.current[cacheKey]) {
          console.log(
            `[useUserProgress] Using local cached data for ${formattedId}`
          );
          setProgress(progressCacheRef.current[cacheKey]);
          setIsLoading(false);
          isFetchingRef.current = false;
          return progressCacheRef.current[cacheKey];
        }

        // 2. Check splash store cache
        if (tryUseCachedProgress()) {
          isFetchingRef.current = false;
          return progress;
        }
      }

      // Only set loading to true when we actually need to fetch
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
        isFetchingRef.current = false;
      }
    },
    [
      quizId,
      formatQuizId,
      createDefaultProgress,
      tryUseCachedProgress,
      currentUserId,
      progress,
    ]
  );

  const updateProgress = useCallback(
    async (
      timeSpent: number,
      isCorrect: boolean,
      completed: boolean,
      difficulty: string
    ) => {
      if (!quizId || quizId === "global") {
        console.warn(
          "[useUserProgress] No valid quizId provided for updateProgress"
        );
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const formattedQuizId = formatQuizId(quizId);

        console.log(`[useUserProgress] Updating progress:`, {
          quizId: formattedQuizId,
          timeSpent,
          completed,
          isCorrect,
          difficulty: difficulty || "easy",
        });

        const response = await axios.post(
          `${API_URL}/api/userprogress/${formattedQuizId}`,
          {
            timeSpent: Number(timeSpent.toFixed(2)),
            completed,
            isCorrect,
            difficulty: difficulty || "easy", // NEW: Include difficulty in request
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        if (response.data?.success) {
          console.log(`[useUserProgress] Progress updated successfully`);

          // NEW: Log reward information if present
          if (response.data.reward) {
            console.log(
              `[useUserProgress] Reward earned:`,
              response.data.reward
            );
          }

          const updatedProgress = response.data.progress;

          // Update current progress
          setProgress(updatedProgress);

          // CRITICAL: Clear ALL cache entries to force fresh data on next access
          console.log(
            `[useUserProgress] Clearing all cache entries to force refresh`
          );
          progressCacheRef.current = {}; // Clear entire local cache

          // NEW: Also invalidate the splash store individual cache for this specific quiz
          const splashStore = useSplashStore.getState();
          if (splashStore.setIndividualProgress) {
            splashStore.setIndividualProgress(formattedQuizId, updatedProgress);
          }

          // FIXED: Force refresh of global progress in progress store
          if (completed && isCorrect) {
            console.log(
              `[useUserProgress] Level completed! Invalidating ALL caches including global progress...`
            );

            // Clear progress store cache
            const progressStore = useProgressStore.getState();
            progressStore.clearCache();

            // CRITICAL: Wait for cache clear, then fetch fresh data
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Force fresh fetch
            const freshProgress = await progressStore.fetchProgress(true);
            console.log(
              `[useUserProgress] Fresh progress fetched after completion:`,
              {
                type: Array.isArray(freshProgress)
                  ? "array"
                  : typeof freshProgress,
                length: Array.isArray(freshProgress)
                  ? freshProgress.length
                  : "not array",
              }
            );

            // FIXED: Update individual cache with the correct variable name
            if (splashStore.setIndividualProgress && updatedProgress) {
              console.log(
                `[useUserProgress] Updating individual cache with completed level data`
              );
              splashStore.setIndividualProgress(
                String(quizId),
                updatedProgress
              );
            }

            console.log(
              "[useUserProgress] All caches invalidated - levels and filters will be recomputed"
            );
          }

          return {
            ...response.data,
            success: true,
          };
        }

        throw new Error(response.data?.message || "Failed to update progress");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to update progress";
        console.error(
          `[useUserProgress] Error updating progress:`,
          errorMessage
        );
        setError(errorMessage);

        // FIXED: Better error recovery - try to fetch fresh data
        try {
          console.log(
            `[useUserProgress] Attempting to fetch fresh data after error`
          );
          const freshData = await fetchProgress(true); // Force refresh on error
          if (freshData) {
            return freshData;
          }
        } catch (fetchErr) {
          console.error(
            "[useUserProgress] Failed to fetch fresh data:",
            fetchErr
          );
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [quizId, formatQuizId, fetchProgress]
  );

  // resetTimer function that also clears caches
  const resetTimer = useCallback(
    async (
      quizId: string | number
    ): Promise<{
      success: boolean;
      message?: string;
      coinsDeducted?: number;
      remainingCoins?: number;
      costBreakdown?: {
        originalTimeSpent: number;
        costReason: string;
        timeRange: string;
      };
    }> => {
      try {
        setIsLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          setIsLoading(false);
          return { success: false, message: "Authentication required" };
        }

        const formattedId = formatQuizId(quizId);
        console.log(`[useUserProgress] Resetting timer for: ${formattedId}`);

        const response = await axios({
          method: "post",
          url: `${API_URL}/api/userprogress/${formattedId}/reset-timer`,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });

        if (response.data.success) {
          console.log(`[useUserProgress] Timer reset successfully`);

          // CRITICAL: Create reset progress with 0 time
          const resetProgress = {
            ...progress,
            totalTimeSpent: 0,
            lastAttemptTime: 0,
            attempts: [],
          };

          // CRITICAL: Update local state immediately
          setProgress(resetProgress);

          // CRITICAL: Clear ALL cache entries everywhere
          console.log(
            `[useUserProgress] Clearing ALL caches after timer reset`
          );

          // 1. Clear local cache
          progressCacheRef.current = {};

          // 2. Clear individual progress cache
          const splashStore = useSplashStore.getState();
          if (splashStore.setIndividualProgress) {
            console.log(
              `[useUserProgress] Updating splash store with reset progress`
            );
            splashStore.setIndividualProgress(String(quizId), resetProgress);
          }

          // 3. Force clear splash store completely to trigger recomputation
          splashStore.reset();

          // 4. Clear progress store cache
          const progressStore = useProgressStore.getState();
          progressStore.clearCache();

          // 5. Force refresh global progress
          await progressStore.fetchProgress(true);

          console.log(`[useUserProgress] All caches cleared and refreshed`);

          return {
            success: true,
            message: response.data.message,
            coinsDeducted: response.data.coinsDeducted,
            remainingCoins: response.data.remainingCoins,
            costBreakdown: response.data.costBreakdown,
          };
        }

        return {
          success: false,
          message: response.data.message || "Failed to reset timer",
        };
      } catch (err: any) {
        console.error(`[useUserProgress] Reset timer error:`, err.message);
        setError(err.message);

        return {
          success: false,
          message: err.response?.data?.message || "Failed to reset timer",
          costBreakdown: err.response?.data?.costBreakdown,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [progress, formatQuizId]
  );

  // Clear progress function
  const clearProgress = useCallback(() => {
    console.log(`[useUserProgress] Clearing progress state`);
    setProgress(null);
    setError(null);
    setIsLoading(false);
    progressCacheRef.current = {};
    hasInitializedRef.current = false;
    lastQuizIdRef.current = null;
  }, []);

  return {
    progress,
    isLoading,
    error,
    fetchProgress,
    updateProgress, // This now supports difficulty parameter
    resetTimer,
    clearProgress,
  };
};
