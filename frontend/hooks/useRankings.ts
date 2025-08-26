import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getToken } from "@/lib/authTokenManager";
import { RankingData, RankingUser } from "@/types/rankingTypes";
import {
  isRankingsDataPreloaded,
  getPreloadedRankings,
} from "@/store/useSplashStore";
import { setClearRankingsCacheFunction } from "@/utils/rankingsCache";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Simple in-memory cache for fallback
const rankingsCache = new Map<
  string,
  { data: RankingData; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface UseRankingsResult {
  data: RankingData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useRankings = (
  category: string,
  enabled: boolean = true
): UseRankingsResult => {
  const [data, setData] = useState<RankingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchingRef = useRef(false);
  const hasCheckedPreloaded = useRef(false);
  const currentCategoryRef = useRef<string>(category); // Track current category

  // ENHANCED: Update category ref when category changes
  useEffect(() => {
    currentCategoryRef.current = category;
  }, [category]);

  const fetchRankings = async (skipCache = false) => {
    if (!enabled || fetchingRef.current) return;

    // ENHANCED: Check if this request is for the current category
    const requestCategory = category;

    // PRIORITY 1: Check preloaded data first (from splash screen)
    if (!skipCache && isRankingsDataPreloaded()) {
      const preloadedData = getPreloadedRankings(requestCategory);
      if (preloadedData) {
        // Only set data if still the current category
        if (requestCategory === currentCategoryRef.current) {
          console.log(
            `[useRankings] Using preloaded data for ${requestCategory}`
          );
          setData(preloadedData);
        }
        return;
      }
    }

    // PRIORITY 2: Check hook's own cache
    if (!skipCache) {
      const cached = rankingsCache.get(requestCategory);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Only set data if still the current category
        if (requestCategory === currentCategoryRef.current) {
          console.log(
            `[useRankings] Using hook cached data for ${requestCategory}`
          );
          setData(cached.data);
        }
        return;
      }
    }

    // PRIORITY 3: Fetch fresh data from API
    try {
      fetchingRef.current = true;

      // Only set loading if this is still the current category
      if (requestCategory === currentCategoryRef.current) {
        setIsLoading(true);
        setError(null);
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Build query parameters
      const params = new URLSearchParams({
        type: requestCategory,
        limit: "50",
      });
      if (requestCategory.includes("_")) {
        const [type, gameMode] = requestCategory.split("_");
        params.set("type", type);
        params.append("gameMode", gameMode);
      }

      console.log(`[useRankings] Fetching fresh data for ${requestCategory}`);

      const response = await axios.get(
        `${API_URL}/api/rankings?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
          signal: abortControllerRef.current.signal,
        }
      );

      // ENHANCED: Only process response if still the current category
      if (
        requestCategory === currentCategoryRef.current &&
        response.data?.data
      ) {
        const rankingData = response.data.data;

        // Cache the result in hook's own cache
        rankingsCache.set(requestCategory, {
          data: rankingData,
          timestamp: Date.now(),
        });

        setData(rankingData);
        console.log(
          `[useRankings] Fetched and cached ${requestCategory} rankings`
        );
      } else if (requestCategory !== currentCategoryRef.current) {
        console.log(
          `[useRankings] Discarding response for ${requestCategory} (current: ${currentCategoryRef.current})`
        );
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      // ENHANCED: Better error handling for canceled requests
      if (
        err.name === "AbortError" ||
        err.name === "CanceledError" ||
        err.code === "ERR_CANCELED"
      ) {
        console.log(
          `[useRankings] Request for ${requestCategory} was canceled (expected behavior)`
        );
        return; // Don't set error state for canceled requests
      }

      // Only set error if this is still the current category
      if (requestCategory === currentCategoryRef.current) {
        console.error(`[useRankings] Error fetching ${requestCategory}:`, err);
        setError(err.message || "Failed to fetch rankings");
      }
    } finally {
      // Only update loading state if still the current category and not aborted
      if (
        requestCategory === currentCategoryRef.current &&
        abortControllerRef.current &&
        !abortControllerRef.current.signal.aborted
      ) {
        setIsLoading(false);
        fetchingRef.current = false;
      } else {
        fetchingRef.current = false;
      }
    }
  };

  // ENHANCED: Reset data when category changes to prevent showing stale data
  useEffect(() => {
    if (!enabled) return;

    // Clear previous data immediately when category changes
    setData(null);
    setError(null);

    // Reset preload check for new category
    hasCheckedPreloaded.current = false;

    // First, immediately check if we have preloaded data
    if (isRankingsDataPreloaded()) {
      const preloadedData = getPreloadedRankings(category);
      if (preloadedData) {
        console.log(`[useRankings] Found preloaded data for ${category}`);
        setData(preloadedData);
        hasCheckedPreloaded.current = true;
        return;
      }
    }

    // If no preloaded data, fetch normally
    fetchRankings();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      fetchingRef.current = false;
    };
  }, [category, enabled]);

  const refresh = () => {
    hasCheckedPreloaded.current = false; // Reset preload check on manual refresh
    fetchRankings(true);
  };

  return { data, isLoading, error, refresh };
};

// Utility to clear cache
export const clearRankingsCache = () => {
  rankingsCache.clear();
};

// Register the clear function to avoid circular dependency
setClearRankingsCacheFunction(clearRankingsCache);
