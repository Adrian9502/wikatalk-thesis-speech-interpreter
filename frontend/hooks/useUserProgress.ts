import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { getToken } from "@/lib/authTokenManager";
import { UserProgress } from "@/types/userProgress";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const useUserProgress = (quizId: string | number | "global") => {
  const [progress, setProgress] = useState<UserProgress | UserProgress[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent unnecessary API calls and preserve state
  const hasInitializedRef = useRef(false);
  const lastQuizIdRef = useRef<string | number | "global" | null>(null);
  const progressCacheRef = useRef<{ [key: string]: any }>({});

  // Format the ID for API
  const formatQuizId = useCallback((id: string | number): string => {
    if (id === "global") return "global";

    const numericId = typeof id === "string" ? id.replace(/^n-/, "") : String(id);
    return `n-${numericId}`;
  }, []);

  // Create default progress object
  const createDefaultProgress = useCallback((id: string | number): UserProgress => {
    return {
      userId: "",
      quizId: String(id),
      exercisesCompleted: 0,
      totalExercises: 1,
      completed: false,
      totalTimeSpent: 0,
      attempts: [],
    };
  }, []);

  // ENHANCED: Stable fetch function with caching
  const fetchProgress = useCallback(async (forceRefresh: boolean = false) => {
    const cacheKey = String(quizId);
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && progressCacheRef.current[cacheKey] && lastQuizIdRef.current === quizId) {
      console.log(`[useUserProgress] Using cached data for ${cacheKey}`);
      setProgress(progressCacheRef.current[cacheKey]);
      return progressCacheRef.current[cacheKey];
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        console.log("[useUserProgress] No auth token available");
        const defaultResult = quizId === "global" ? [] : createDefaultProgress(quizId);
        setProgress(defaultResult);
        progressCacheRef.current[cacheKey] = defaultResult;
        return defaultResult;
      }

      // Handle global progress fetch
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
          console.log(`[useUserProgress] Successfully fetched global progress: ${response.data.progressEntries.length} entries`);
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
      console.log(`[useUserProgress] Fetching progress for: ${formattedId}`);

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
        
        setProgress(progressData);
        progressCacheRef.current[cacheKey] = progressData;
        lastQuizIdRef.current = quizId;
        hasInitializedRef.current = true;
        
        return progressData;
      }

      const defaultResult = createDefaultProgress(quizId);
      setProgress(defaultResult);
      progressCacheRef.current[cacheKey] = defaultResult;
      return defaultResult;
    } catch (err: any) {
      console.error(`[useUserProgress] Error:`, err.message);
      setError(err.message);

      const defaultResult = quizId === "global" ? [] : createDefaultProgress(quizId);
      setProgress(defaultResult);
      progressCacheRef.current[cacheKey] = defaultResult;
      return defaultResult;
    } finally {
      setIsLoading(false);
    }
  }, [quizId, formatQuizId, createDefaultProgress]);

  // ENHANCED: Update progress function with cache invalidation
  const updateProgress = useCallback(async (
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
      console.log(`[useUserProgress] Updating progress for: ${formattedId}, time: ${timeSpent}, completed: ${completed}, isCorrect: ${isCorrect}`);

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
        
        // CRITICAL FIX: Invalidate global cache to force refresh
        delete progressCacheRef.current["global"];
        
        // If this was a completion, trigger a global progress refresh
        if (completed && isCorrect) {
          console.log(`[useUserProgress] Level completed! Refreshing global progress cache`);
          setTimeout(() => {
            // Force refresh global progress after a short delay
            if (progressCacheRef.current["global"]) {
              delete progressCacheRef.current["global"];
            }
          }, 100);
        }
        
        return updatedProgress;
      }

      return null;
    } catch (err: any) {
      console.error(`[useUserProgress] Update error:`, err.message);
      setError(err.message);

      try {
        return await fetchProgress(true); // Force refresh on error
      } catch (fetchErr) {
        console.error("[useUserProgress] Failed to create fallback progress");
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  }, [quizId, formatQuizId, fetchProgress]);

  // ENHANCED: Force refresh function for external use
  const refreshProgress = useCallback(async () => {
    console.log(`[useUserProgress] Force refreshing progress for ${quizId}`);
    return await fetchProgress(true);
  }, [fetchProgress, quizId]);

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
    refreshProgress, // Add this new function
  };
};