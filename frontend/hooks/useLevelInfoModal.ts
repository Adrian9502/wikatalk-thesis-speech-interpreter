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
  const [hasFetchedFresh, setHasFetchedFresh] = useState(false);

  // Refs
  const fetchInProgressRef = useRef(false);
  const modalSessionRef = useRef<string | null>(null);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(300)).current;
  const progressOpacity = useRef(new Animated.Value(1)).current;
  const confirmationOpacity = useRef(new Animated.Value(0)).current;
  const confirmationScale = useRef(new Animated.Value(0.8)).current;
  const resetMessageOpacity = useRef(new Animated.Value(0)).current;
  const resetMessageScale = useRef(new Animated.Value(0.8)).current;

  // Hooks
  const {
    progress,
    isLoading: progressLoading,
    fetchProgress,
    resetTimer,
  } = useUserProgress(levelData?.questionId || levelData?.id);
  const { coins, fetchCoinsBalance } = useCoinsStore();

  // Prevent multiple fetches with session tracking
  useEffect(() => {
    if (visible && !fetchInProgressRef.current) {
      const sessionId = Date.now().toString();
      modalSessionRef.current = sessionId;

      console.log(`[LevelInfoModal] Modal opened (session: ${sessionId})`);
      fetchCoinsBalance(true);

      if (!hasFetchedFresh) {
        fetchInProgressRef.current = true;

        const fetchTimer = setTimeout(() => {
          if (modalSessionRef.current === sessionId) {
            console.log(
              `[LevelInfoModal] Fetching fresh progress data (session: ${sessionId})`
            );

            fetchProgress(true).finally(() => {
              if (modalSessionRef.current === sessionId) {
                setHasFetchedFresh(true);
                fetchInProgressRef.current = false;
              }
            });
          }
        }, 300);

        return () => {
          clearTimeout(fetchTimer);
          fetchInProgressRef.current = false;
        };
      }
    } else if (!visible) {
      console.log(`[LevelInfoModal] Modal closed, resetting state`);
      setHasFetchedFresh(false);
      fetchInProgressRef.current = false;
      modalSessionRef.current = null;
    }
  }, [visible, fetchCoinsBalance, fetchProgress, hasFetchedFresh]);

  // Progress info calculation
  const progressInfo = React.useMemo(() => {
    console.log("[LevelInfoModal] Calculating progress info");

    if (progressLoading || !hasFetchedFresh || fetchInProgressRef.current) {
      return {
        hasProgress: false,
        timeSpent: 0,
        attempts: 0,
        isCompleted: false,
        isLoading: true,
      };
    }

    if (!progress || Array.isArray(progress)) {
      console.log("[LevelInfoModal] No valid progress data");
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

    console.log("[LevelInfoModal] Progress info calculated:", {
      attempts,
      timeSpent: Number(timeSpent.toFixed(2)),
      isCompleted,
      hasProgress: timeSpent > 0 || attempts > 0,
    });

    return {
      hasProgress: timeSpent > 0 || attempts > 0,
      timeSpent: Number(timeSpent.toFixed(2)),
      attempts,
      isCompleted,
      isLoading: false,
    };
  }, [progress, progressLoading, hasFetchedFresh]);

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

  // Reset state when modal visibility changes
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

      // Start entrance animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(modalTranslateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    } else {
      resetAnimationValues();
    }
  }, [
    visible,
    resetAnimationValues,
    overlayOpacity,
    modalTranslateY,
    progressOpacity,
    confirmationOpacity,
    confirmationScale,
    resetMessageOpacity,
    resetMessageScale,
  ]);

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
