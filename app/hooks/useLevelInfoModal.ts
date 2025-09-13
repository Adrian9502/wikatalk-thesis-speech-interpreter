import React, { useState, useRef, useEffect, useCallback } from "react";
import { Animated } from "react-native";
import { useUserProgress } from "@/hooks/useUserProgress";
import useCoinsStore from "@/store/games/useCoinsStore";
import {
  calculateResetCost,
  getResetCostDescription,
  getTimeRangeForDisplay,
} from "@/utils/resetCostUtils";

export const useLevelInfoModal = (visible: boolean, levelData: any) => {
  // State
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{
    type: "success" | "error";
    title: string;
    description: string;
  } | null>(null);
  const [showCostInfoModal, setShowCostInfoModal] = useState(false);

  // Refs
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(300)).current;
  const progressOpacity = useRef(new Animated.Value(1)).current;
  const confirmationOpacity = useRef(new Animated.Value(0)).current;
  const confirmationScale = useRef(new Animated.Value(0.8)).current;
  const resetMessageOpacity = useRef(new Animated.Value(0)).current;
  const resetMessageScale = useRef(new Animated.Value(0.8)).current;

  // Add ref to prevent multiple effect runs
  const mountedRef = useRef(false);

  // Hooks - FIXED: Don't force refresh on initial load
  const {
    progress,
    isLoading: progressLoading,
    fetchProgress,
    resetTimer,
  } = useUserProgress(levelData?.questionId || levelData?.id);
  const { coins, fetchCoinsBalance } = useCoinsStore();

  // SIMPLIFIED: Only fetch fresh data when modal is first opened, not on every render
  useEffect(() => {
    if (visible && !mountedRef.current) {
      mountedRef.current = true;

      console.log(`[LevelInfoModal] Modal opened - fetching coins only`);

      // Fetch coins balance (lightweight operation)
      fetchCoinsBalance(false);

      // Only fetch progress in background if we don't have any cached data
      if (!progress) {
        console.log(
          `[LevelInfoModal] No cached progress, fetching in background`
        );
        setTimeout(() => {
          fetchProgress(false); // Don't force refresh
        }, 100);
      }
    } else if (!visible) {
      mountedRef.current = false;
      console.log(`[LevelInfoModal] Modal closed, resetting state`);
    }
  }, [visible, fetchCoinsBalance, fetchProgress, progress]);

  // SIMPLIFIED: Progress info calculation with better default handling
  const progressInfo = React.useMemo(() => {
    // Show default state immediately if loading or no data
    if (progressLoading) {
      return {
        hasProgress: false,
        timeSpent: 0,
        attempts: 0,
        isCompleted: false,
        isLoading: true,
      };
    }

    if (!progress || Array.isArray(progress)) {
      return {
        hasProgress: false,
        timeSpent: 0,
        attempts: 0,
        isCompleted: false,
        isLoading: false,
      };
    }

    const attempts = progress.attempts?.length || 0;
    const timeSpent = progress.totalTimeSpent || 0;
    const isCompleted = progress.completed || false;

    return {
      hasProgress: timeSpent > 0 || attempts > 0,
      timeSpent: Number(timeSpent.toFixed(2)),
      attempts,
      isCompleted,
      isLoading: false,
    };
  }, [progress, progressLoading]);

  // Calculate dynamic reset cost
  const resetCostInfo = React.useMemo(() => {
    if (!progressInfo.hasProgress || progressInfo.isLoading) {
      return {
        cost: 50,
        description: "Quick reset",
        timeRange: "0-30s",
        timeSpent: 0,
      };
    }

    const timeSpent = progressInfo.timeSpent;
    const cost = calculateResetCost(timeSpent);
    const description = getResetCostDescription(timeSpent);
    const timeRange = getTimeRangeForDisplay(timeSpent);

    return {
      cost,
      description,
      timeRange,
      timeSpent,
    };
  }, [
    progressInfo.hasProgress,
    progressInfo.isLoading,
    progressInfo.timeSpent,
  ]);

  // Animation management
  const resetAnimationValues = useCallback(() => {
    overlayOpacity.setValue(0);
    modalTranslateY.setValue(300);
    progressOpacity.setValue(1);
    confirmationOpacity.setValue(0);
    confirmationScale.setValue(0.8);
    resetMessageOpacity.setValue(0);
    resetMessageScale.setValue(0.8);
    setIsAnimating(false);
    setHasStarted(false);
    setShowResetConfirmation(false);
    setIsResetting(false);
    setResetMessage(null);
  }, [
    overlayOpacity,
    modalTranslateY,
    progressOpacity,
    confirmationOpacity,
    confirmationScale,
    resetMessageOpacity,
    resetMessageScale,
  ]);

  // OPTIMIZED: Start animation immediately when visible changes
  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      setHasStarted(false);
      progressOpacity.setValue(1);
      confirmationOpacity.setValue(0);
      confirmationScale.setValue(0.8);
      resetMessageOpacity.setValue(0);
      resetMessageScale.setValue(0.8);
      setShowResetConfirmation(false);
      setResetMessage(null);

      // OPTIMIZED: Start entrance animation immediately, don't wait for data
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 400, // Reduced duration for snappier feel
          useNativeDriver: true,
        }),
        Animated.spring(modalTranslateY, {
          toValue: 0,
          tension: 120, // Increased tension for snappier animation
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    } else {
      resetAnimationValues();
    }
  }, [visible, resetAnimationValues]);

  return {
    // State
    isAnimating,
    hasStarted,
    showResetConfirmation,
    isResetting,
    resetMessage,
    showCostInfoModal,
    progressInfo,
    resetCostInfo,
    coins,

    // Setters
    setIsAnimating,
    setHasStarted,
    setShowResetConfirmation,
    setIsResetting,
    setResetMessage,
    setShowCostInfoModal,

    // Animation values
    overlayOpacity,
    modalTranslateY,
    confirmationOpacity,
    confirmationScale,
    resetMessageOpacity,
    resetMessageScale,

    // Functions
    fetchProgress,
    fetchCoinsBalance,
    resetTimer,
  };
};
