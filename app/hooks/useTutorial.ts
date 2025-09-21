import { useEffect, useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCopilot } from "react-native-copilot";
import { InteractionManager } from "react-native";

const TUTORIAL_STORAGE_KEY = "app_tutorial_completed";

export const useTutorial = (tutorialName: string = "homepage") => {
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { start, stop, copilotEvents } = useCopilot();

  // Use refs to prevent re-renders from affecting the tutorial
  const tutorialInProgressRef = useRef<boolean>(false);
  const hasSeenTutorialRef = useRef<boolean>(true);
  const eventListenersRef = useRef<any[]>([]);

  // Optimized tutorial status check
  const checkTutorialStatus = useCallback(async () => {
    try {
      const tutorialData = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      const tutorials = tutorialData ? JSON.parse(tutorialData) : {};
      const hasSeen = tutorials[tutorialName] === true;

      setHasSeenTutorial(hasSeen);
      hasSeenTutorialRef.current = hasSeen;
      console.log(`[useTutorial] Tutorial ${tutorialName} status:`, hasSeen);

      return hasSeen;
    } catch (error) {
      console.error("Error checking tutorial status:", error);
      setHasSeenTutorial(true);
      hasSeenTutorialRef.current = true;
      return true;
    }
  }, [tutorialName]);

  // Check tutorial status on mount
  useEffect(() => {
    const initializeTutorialStatus = async () => {
      await checkTutorialStatus();
      setIsLoading(false);
    };

    initializeTutorialStatus();
  }, [checkTutorialStatus]);

  // Optimized mark tutorial as completed
  const markTutorialCompleted = useCallback(async () => {
    if (hasSeenTutorialRef.current) return; // Already completed

    try {
      console.log(
        `[useTutorial] Marking tutorial ${tutorialName} as completed`
      );

      // Use InteractionManager for better performance
      InteractionManager.runAfterInteractions(async () => {
        const tutorialData = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
        const tutorials = tutorialData ? JSON.parse(tutorialData) : {};
        tutorials[tutorialName] = true;

        await AsyncStorage.setItem(
          TUTORIAL_STORAGE_KEY,
          JSON.stringify(tutorials)
        );

        setHasSeenTutorial(true);
        hasSeenTutorialRef.current = true;
        tutorialInProgressRef.current = false;
      });
    } catch (error) {
      console.error("Error marking tutorial as completed:", error);
    }
  }, [tutorialName]);

  // Reset tutorial status
  const resetTutorial = useCallback(async () => {
    try {
      console.log(`[useTutorial] Resetting tutorial ${tutorialName}`);
      const tutorialData = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      const tutorials = tutorialData ? JSON.parse(tutorialData) : {};
      tutorials[tutorialName] = false;

      await AsyncStorage.setItem(
        TUTORIAL_STORAGE_KEY,
        JSON.stringify(tutorials)
      );

      setHasSeenTutorial(false);
      hasSeenTutorialRef.current = false;
      tutorialInProgressRef.current = false;
    } catch (error) {
      console.error("Error resetting tutorial:", error);
    }
  }, [tutorialName]);

  // Optimized start tutorial function
  const startTutorial = useCallback(() => {
    console.log(
      `[useTutorial] startTutorial called - hasSeenTutorial: ${hasSeenTutorialRef.current}, isLoading: ${isLoading}, inProgress: ${tutorialInProgressRef.current}`
    );

    if (
      !hasSeenTutorialRef.current &&
      !isLoading &&
      !tutorialInProgressRef.current
    ) {
      console.log(`[useTutorial] Starting tutorial ${tutorialName}`);
      tutorialInProgressRef.current = true;

      // Use InteractionManager for smoother tutorial start
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          start();
        });
      });
    } else {
      console.log(`[useTutorial] Skipping tutorial start - conditions not met`);
    }
  }, [start, isLoading, tutorialName]);

  // Optimized event listeners setup
  useEffect(() => {
    if (!copilotEvents) return;

    const setupEventListeners = () => {
      try {
        // Clean up previous listeners
        eventListenersRef.current.forEach((listener) => {
          if (typeof listener === "function") {
            listener();
          }
        });
        eventListenersRef.current = [];

        // Handle tutorial stop (user closes or completes)
        const stopListener = copilotEvents.on("stop", () => {
          console.log(`[useTutorial] Tutorial stopped`);
          tutorialInProgressRef.current = false;
          markTutorialCompleted();
        });

        // Handle step changes to detect completion
        const stepChangeListener = copilotEvents.on(
          "stepChange",
          (step: any) => {
            console.log(`[useTutorial] Step changed:`, step);

            // If step is null/undefined, tutorial is complete
            if (!step) {
              console.log(`[useTutorial] Tutorial completed via stepChange`);
              tutorialInProgressRef.current = false;
              markTutorialCompleted();
            }
          }
        );

        // Store listeners for cleanup
        eventListenersRef.current = [stopListener, stepChangeListener];
      } catch (error) {
        console.warn("Error setting up copilot event listeners:", error);
      }
    };

    // Setup listeners after interactions complete
    InteractionManager.runAfterInteractions(() => {
      setupEventListeners();
    });

    return () => {
      // Cleanup listeners
      eventListenersRef.current.forEach((listener) => {
        try {
          if (typeof listener === "function") {
            listener();
          }
        } catch (error) {
          console.warn("Error cleaning up event listener:", error);
        }
      });
      eventListenersRef.current = [];
    };
  }, [copilotEvents, markTutorialCompleted]);

  return {
    hasSeenTutorial,
    isLoading,
    startTutorial,
    markTutorialCompleted,
    resetTutorial,
    start,
    stop,
    copilotEvents,
  };
};
