import { useEffect, useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCopilot } from "react-native-copilot";
import { InteractionManager } from "react-native";

const TUTORIAL_STORAGE_KEY = "app_tutorial_completed";

export const useTutorial = (tutorialName: string = "homepage") => {
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { start, stop, copilotEvents, currentStep } = useCopilot();

  // Use refs to prevent unnecessary re-renders
  const tutorialInProgressRef = useRef<boolean>(false);
  const hasSeenTutorialRef = useRef<boolean>(true);
  const mountedRef = useRef<boolean>(true);
  const completionTimeoutRef = useRef<NodeJS.Timeout>();

  // Memoized tutorial status check
  const checkTutorialStatus = useCallback(async (): Promise<boolean> => {
    if (!mountedRef.current) return true;

    try {
      const tutorialData = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      const tutorials = tutorialData ? JSON.parse(tutorialData) : {};
      const hasSeen = tutorials[tutorialName] === true;

      if (mountedRef.current) {
        setHasSeenTutorial(hasSeen);
        hasSeenTutorialRef.current = hasSeen;
      }

      return hasSeen;
    } catch (error) {
      console.error(
        `[useTutorial] Error checking tutorial status for ${tutorialName}:`,
        error
      );

      if (mountedRef.current) {
        setHasSeenTutorial(true);
        hasSeenTutorialRef.current = true;
      }
      return true;
    }
  }, [tutorialName]);

  // Initialize tutorial status
  useEffect(() => {
    let cancelled = false;

    const initializeTutorialStatus = async () => {
      await checkTutorialStatus();

      if (!cancelled && mountedRef.current) {
        setIsLoading(false);
      }
    };

    initializeTutorialStatus();

    return () => {
      cancelled = true;
    };
  }, [checkTutorialStatus]);

  // Debounced mark tutorial as completed
  const markTutorialCompleted = useCallback(async () => {
    if (hasSeenTutorialRef.current || !mountedRef.current) return;

    // Clear any existing timeout
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
    }

    // Debounce completion to prevent multiple calls
    completionTimeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current || hasSeenTutorialRef.current) return;

      try {
        const tutorialData = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
        const tutorials = tutorialData ? JSON.parse(tutorialData) : {};

        if (tutorials[tutorialName] !== true) {
          tutorials[tutorialName] = true;
          await AsyncStorage.setItem(
            TUTORIAL_STORAGE_KEY,
            JSON.stringify(tutorials)
          );

          if (mountedRef.current) {
            setHasSeenTutorial(true);
            hasSeenTutorialRef.current = true;
            tutorialInProgressRef.current = false;
          }
        }
      } catch (error) {
        console.error(
          `[useTutorial] Error marking tutorial ${tutorialName} as completed:`,
          error
        );
      }
    }, 200); // 200ms debounce
  }, [tutorialName]);

  // Reset tutorial
  const resetTutorial = useCallback(async () => {
    try {
      const tutorialData = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      const tutorials = tutorialData ? JSON.parse(tutorialData) : {};
      tutorials[tutorialName] = false;

      await AsyncStorage.setItem(
        TUTORIAL_STORAGE_KEY,
        JSON.stringify(tutorials)
      );

      if (mountedRef.current) {
        setHasSeenTutorial(false);
        hasSeenTutorialRef.current = false;
        tutorialInProgressRef.current = false;
      }
    } catch (error) {
      console.error(
        `[useTutorial] Error resetting tutorial ${tutorialName}:`,
        error
      );
    }
  }, [tutorialName]);

  // Start tutorial with proper guards
  const startTutorial = useCallback(() => {
    if (
      !hasSeenTutorialRef.current &&
      !isLoading &&
      !tutorialInProgressRef.current &&
      mountedRef.current
    ) {
      tutorialInProgressRef.current = true;

      requestAnimationFrame(() => {
        if (mountedRef.current) {
          start();
        }
      });
    }
  }, [start, isLoading]);

  // Custom stop function that marks tutorial as completed
  const stopTutorial = useCallback(() => {
    if (tutorialInProgressRef.current) {
      tutorialInProgressRef.current = false;
      stop();
      markTutorialCompleted();
    }
  }, [stop, markTutorialCompleted]);

  // Monitor currentStep changes instead of using event listeners
  const previousStepRef = useRef(currentStep);
  useEffect(() => {
    const prevStep = previousStepRef.current;
    previousStepRef.current = currentStep;

    // If we had a step before and now we don't, tutorial completed
    if (prevStep && !currentStep && tutorialInProgressRef.current) {
      tutorialInProgressRef.current = false;
      markTutorialCompleted();
    }
  }, [currentStep, markTutorialCompleted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  return {
    hasSeenTutorial,
    isLoading,
    startTutorial,
    stopTutorial, // Use this instead of stop directly
    markTutorialCompleted,
    resetTutorial,
    start,
    stop,
    copilotEvents,
    currentStep,
  };
};
