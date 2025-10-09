import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { tutorialService, TutorialData } from "@/services/api/tutorialService";
import { useAuthStore } from "@/store/useAuthStore"; // NEW: Import auth store

export interface TutorialStep {
  id: string;
  text: string;
  tagalogText: string;
  target?: string;
  order: number;
  placement?: "top" | "bottom" | "center";
  skipable?: boolean;
  navigationAction?: {
    type: "navigate_tab";
    tabName: string;
    startTutorial?: string;
  };
}

export interface TutorialConfig {
  id: string;
  name: string;
  steps: TutorialStep[];
  autoStart?: boolean;
  version?: number;
}

interface TutorialContextType {
  // Existing tutorial state
  isActive: boolean;
  currentTutorial: TutorialConfig | null;
  currentStep: TutorialStep | null;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;

  // Language state
  isTagalog: boolean;
  toggleLanguage: () => void;

  // Tutorial controls
  startTutorial: (config: TutorialConfig, forceStart?: boolean) => void; // CHANGED: Add forceStart parameter
  stopTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  isTutorialCompleted: (tutorialId: string) => boolean;

  // Server-based tutorial management
  shouldShowTutorial: (
    tutorialId: string,
    version?: number
  ) => Promise<boolean>;
  markTutorialCompleted: (
    tutorialId: string,
    version?: number
  ) => Promise<void>;
  getTutorialStatus: () => Promise<TutorialData>;
  resetAllTutorials: () => Promise<void>;

  // Skip all tutorials (local only)
  skipAllTutorials: () => void;
  areAllTutorialsSkipped: () => boolean;

  // Navigation handler
  setNavigationHandler: (
    handler: (tabName: string, tutorialId?: string) => void
  ) => void;

  // Target registration
  registerTarget: (id: string, measurement: any) => void;
  getTargetMeasurement: (id: string) => any;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Existing state
  const [isActive, setIsActive] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState<TutorialConfig | null>(
    null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Server-synced tutorial status
  const [serverTutorialStatus, setServerTutorialStatus] =
    useState<TutorialData | null>(null);

  // Local fallback for completed tutorials (backwards compatibility)
  const [localCompletedTutorials, setLocalCompletedTutorials] = useState<
    Set<string>
  >(new Set());

  // State to track if all tutorials are skipped (local session only)
  const [allTutorialsSkipped, setAllTutorialsSkipped] = useState(false);

  // NEW: Track current user to detect user changes
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Language state
  const [isTagalog, setIsTagalog] = useState(false);

  // Target measurements storage
  const targetMeasurements = useRef<Record<string, any>>({});
  const navigationHandlerRef = useRef<
    ((tabName: string, tutorialId?: string) => void) | null
  >(null);

  // NEW: Get current user from auth store
  const { userData } = useAuthStore();
  const userId = userData?.id || userData?._id || userData?.email;

  // Computed values
  const currentStep = currentTutorial?.steps[currentStepIndex] || null;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentTutorial
    ? currentStepIndex === currentTutorial.steps.length - 1
    : false;

  // NEW: Load tutorial status from server on mount or user change
  useEffect(() => {
    const loadTutorialStatus = async () => {
      // Only load if we have a user AND they are verified
      if (!userId) {
        console.log(
          "[TutorialContext] No user ID, skipping tutorial status load"
        );
        return;
      }

      // NEW: Check if user is verified before loading tutorial status
      const { userData } = useAuthStore.getState();
      const isUserVerified = userData?.isVerified;

      if (!isUserVerified) {
        console.log(
          "[TutorialContext] User not verified yet, skipping tutorial status load"
        );
        return;
      }

      // Check if user changed
      const userChanged = currentUserId !== userId;
      if (userChanged) {
        console.log(
          `[TutorialContext] User changed from ${currentUserId} to ${userId}`
        );

        // Reset all local state for new user
        setServerTutorialStatus(null);
        setLocalCompletedTutorials(new Set());
        setAllTutorialsSkipped(false);
        setCurrentUserId(userId);

        // Stop any active tutorial
        if (isActive) {
          setIsActive(false);
          setCurrentTutorial(null);
          setCurrentStepIndex(0);
          setIsTagalog(false);
          targetMeasurements.current = {};
        }
      }

      try {
        console.log(
          "[TutorialContext] Loading tutorial status for verified user:",
          userId
        );
        const status = await tutorialService.getTutorialStatus();
        setServerTutorialStatus(status);
        console.log(
          "[TutorialContext] Loaded tutorial status from server:",
          status
        );
      } catch (error) {
        console.error(
          "[TutorialContext] Failed to load tutorial status:",
          error
        );
        // Continue with local fallback
      }
    };

    loadTutorialStatus();
  }, [userId, currentUserId, isActive]); // Keep existing dependencies

  // Language toggle function
  const toggleLanguage = useCallback(() => {
    setIsTagalog((prev) => !prev);
    console.log(
      `[TutorialContext] Language toggled to: ${
        !isTagalog ? "Tagalog" : "English"
      }`
    );
  }, [isTagalog]);

  // Set navigation handler
  const setNavigationHandler = useCallback(
    (handler: (tabName: string, tutorialId?: string) => void) => {
      navigationHandlerRef.current = handler;
      console.log("[TutorialContext] Navigation handler registered");
    },
    []
  );

  // Check if tutorial should be shown (server-based)
  const shouldShowTutorial = useCallback(
    async (tutorialId: string, version: number = 1): Promise<boolean> => {
      // Check local skip first
      if (allTutorialsSkipped) {
        console.log("[TutorialContext] All tutorials skipped locally");
        return false;
      }

      // Check if we have a user
      if (!userId) {
        console.log("[TutorialContext] No user ID, not showing tutorial");
        return false;
      }

      try {
        // Convert tutorial ID format (e.g., "home_tutorial" -> "home")
        const tutorialName = tutorialId.replace("_tutorial", "");
        const shouldShow = await tutorialService.shouldShowTutorial(
          tutorialName,
          version
        );
        console.log(
          `[TutorialContext] Server says should show ${tutorialName}:`,
          shouldShow
        );
        return shouldShow;
      } catch (error) {
        console.error(
          "[TutorialContext] Error checking tutorial status:",
          error
        );
        // Fallback to local check
        const localResult = !localCompletedTutorials.has(tutorialId);
        console.log(
          `[TutorialContext] Fallback local check for ${tutorialId}:`,
          localResult
        );
        return localResult;
      }
    },
    [allTutorialsSkipped, localCompletedTutorials, userId]
  );

  // Mark tutorial as completed (server-based)
  const markTutorialCompleted = useCallback(
    async (tutorialId: string, version: number = 1): Promise<void> => {
      if (!userId) {
        console.log("[TutorialContext] No user ID, skipping server update");
        return;
      }

      try {
        // Convert tutorial ID format
        const tutorialName = tutorialId.replace("_tutorial", "");
        const updatedStatus = await tutorialService.completeTutorial(
          tutorialName,
          version
        );
        setServerTutorialStatus(updatedStatus);
        console.log(
          "[TutorialContext] Tutorial marked as completed on server:",
          tutorialName
        );
      } catch (error) {
        console.error(
          "[TutorialContext] Error marking tutorial completed:",
          error
        );
        // Fallback to local storage
        setLocalCompletedTutorials((prev) => new Set(prev).add(tutorialId));
      }
    },
    [userId]
  );

  // Get tutorial status
  const getTutorialStatus = useCallback(async (): Promise<TutorialData> => {
    if (!userId) {
      throw new Error("No user logged in");
    }

    try {
      const status = await tutorialService.getTutorialStatus();
      setServerTutorialStatus(status);
      return status;
    } catch (error) {
      console.error("[TutorialContext] Error getting tutorial status:", error);
      throw error;
    }
  }, [userId]);

  // Reset all tutorials
  const resetAllTutorials = useCallback(async (): Promise<void> => {
    if (!userId) {
      throw new Error("No user logged in");
    }

    try {
      const status = await tutorialService.resetTutorials();
      setServerTutorialStatus(status);
      setLocalCompletedTutorials(new Set());
      setAllTutorialsSkipped(false);
      console.log("[TutorialContext] All tutorials reset on server");
    } catch (error) {
      console.error("[TutorialContext] Error resetting tutorials:", error);
      throw error;
    }
  }, [userId]);

  // ENHANCED: Skip all tutorials with server persistence
  const skipAllTutorials = useCallback(async () => {
    console.log("[TutorialContext] Skipping ALL tutorials (permanent)");

    // Set local session flag immediately
    setAllTutorialsSkipped(true);

    // Stop current tutorial
    setIsActive(false);
    setCurrentTutorial(null);
    setCurrentStepIndex(0);
    setIsTagalog(false);
    targetMeasurements.current = {};

    // ENHANCED: Also mark all tutorials as completed on server
    if (userId) {
      try {
        const allTutorialIds = [
          "home_tutorial",
          "speech_tutorial",
          "translate_tutorial",
          "scan_tutorial",
          "games_tutorial",
          "pronounce_tutorial",
        ];

        // Mark each tutorial as completed on server
        for (const tutorialId of allTutorialIds) {
          const tutorialName = tutorialId.replace("_tutorial", "");
          try {
            await tutorialService.completeTutorial(tutorialName, 1);
            console.log(
              `[TutorialContext] Marked ${tutorialName} as completed on server`
            );
          } catch (error) {
            console.error(
              `[TutorialContext] Failed to mark ${tutorialName} as completed:`,
              error
            );
            // Continue with other tutorials even if one fails
          }
        }

        // Update local server status
        const updatedStatus = await tutorialService.getTutorialStatus();
        setServerTutorialStatus(updatedStatus);

        console.log(
          "[TutorialContext] All tutorials permanently skipped and saved to server"
        );
      } catch (error) {
        console.error(
          "[TutorialContext] Error saving skip all to server:",
          error
        );
        // Fallback to local storage
        const allTutorialIds = [
          "home_tutorial",
          "speech_tutorial",
          "translate_tutorial",
          "scan_tutorial",
          "games_tutorial",
          "pronounce_tutorial",
        ];
        setLocalCompletedTutorials(new Set(allTutorialIds));
      }
    }

    console.log("[TutorialContext] All tutorials skipped permanently");
  }, [userId, markTutorialCompleted]);

  // Check if all tutorials are skipped (local session)
  const areAllTutorialsSkipped = useCallback(() => {
    return allTutorialsSkipped;
  }, [allTutorialsSkipped]);

  // ENHANCED: Tutorial start check with server integration and user validation
  const startTutorial = useCallback(
    async (config: TutorialConfig, forceStart: boolean = false) => {
      // NEW: If forceStart is true, bypass ALL checks including local skip
      if (forceStart) {
        console.log(
          `[TutorialContext] Force starting tutorial: ${config.name}`
        );
        setCurrentTutorial(config);
        setCurrentStepIndex(0);
        setIsActive(true);
        setIsTagalog(false);
        targetMeasurements.current = {};
        return;
      }

      // Check if we have a user
      if (!userId) {
        console.log(
          "[TutorialContext] No user ID, not starting tutorial:",
          config.name
        );
        return;
      }

      // ONLY check local skip for normal tutorial starts (not force starts)
      if (allTutorialsSkipped) {
        console.log(
          "[TutorialContext] All tutorials skipped locally, not starting:",
          config.name
        );
        return;
      }

      // Check if tutorial should be shown based on server status
      try {
        const shouldShow = await shouldShowTutorial(
          config.id,
          config.version || 1
        );
        if (!shouldShow) {
          console.log(
            "[TutorialContext] Tutorial already completed on server, not starting:",
            config.name
          );
          return;
        }
      } catch (error) {
        console.error(
          "[TutorialContext] Error checking if should show tutorial:",
          error
        );
        // Continue with starting tutorial if check fails
      }

      console.log(
        `[TutorialContext] Starting tutorial: ${config.name} for user: ${userId}`
      );
      setCurrentTutorial(config);
      setCurrentStepIndex(0);
      setIsActive(true);
      setIsTagalog(false);
      targetMeasurements.current = {};
    },
    [allTutorialsSkipped, shouldShowTutorial, userId]
  );

  // ENHANCED: Stop tutorial function with server integration
  const stopTutorial = useCallback(async () => {
    console.log("[TutorialContext] Stopping tutorial");

    if (currentTutorial && userId) {
      // Mark as completed on server
      try {
        await markTutorialCompleted(
          currentTutorial.id,
          currentTutorial.version || 1
        );
      } catch (error) {
        console.error(
          "[TutorialContext] Failed to mark tutorial completed on server:",
          error
        );
        // Still mark locally as fallback
        setLocalCompletedTutorials((prev) =>
          new Set(prev).add(currentTutorial.id)
        );
      }
    }

    setIsActive(false);
    setCurrentTutorial(null);
    setCurrentStepIndex(0);
    setIsTagalog(false);
    // ENHANCED: Clear all target measurements to prevent memory leaks
    targetMeasurements.current = {};
    measurementRegistrationRef.current.clear();
  }, [currentTutorial, markTutorialCompleted, userId]);

  // Next step with navigation support
  const nextStep = useCallback(() => {
    if (
      currentTutorial &&
      currentStepIndex < currentTutorial.steps.length - 1
    ) {
      const nextIndex = currentStepIndex + 1;
      console.log(
        `[TutorialContext] Next step: ${nextIndex + 1}/${
          currentTutorial.steps.length
        }`
      );
      setCurrentStepIndex(nextIndex);
    } else if (currentTutorial && isLastStep && currentStep) {
      // Handle last step - check for navigation action
      const navigationAction = currentStep.navigationAction;

      if (
        navigationAction &&
        navigationAction.type === "navigate_tab" &&
        navigationHandlerRef.current // FIXED: Add null check
      ) {
        console.log(
          `[TutorialContext] Executing navigation action to: ${navigationAction.tabName}`
        );

        // ENHANCED: Mark tutorial as completed before navigation to prevent state issues
        if (userId) {
          markTutorialCompleted(
            currentTutorial.id,
            currentTutorial.version || 1
          ).catch((error) => {
            console.error(
              "[TutorialContext] Failed to mark tutorial completed during navigation:",
              error
            );
          });
        }

        // ENHANCED: Add delay before stopping tutorial to ensure completion is saved
        setTimeout(() => {
          // Stop current tutorial
          setIsActive(false);
          setCurrentTutorial(null);
          setCurrentStepIndex(0);
          setIsTagalog(false);
          targetMeasurements.current = {};

          // ENHANCED: Navigate with error handling and null check
          try {
            if (navigationHandlerRef.current) {
              // FIXED: Additional null check
              navigationHandlerRef.current(
                navigationAction.tabName,
                navigationAction.startTutorial
              );
            }
          } catch (error) {
            console.error("[TutorialContext] Navigation error:", error);
            // Fallback: just stop tutorial without navigation
            stopTutorial();
          }
        }, 100);
      } else {
        // No navigation action, just stop tutorial normally
        stopTutorial();
      }
    }
  }, [
    currentTutorial,
    currentStepIndex,
    isLastStep,
    currentStep,
    stopTutorial,
    markTutorialCompleted,
    userId,
  ]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      console.log(
        `[TutorialContext] Previous step: ${prevIndex + 1}/${
          currentTutorial?.steps.length
        }`
      );
      setCurrentStepIndex(prevIndex);
    }
  }, [currentStepIndex, currentTutorial?.steps.length]);

  // ENHANCED: Check completion with server integration
  const isTutorialCompleted = useCallback(
    (tutorialId: string) => {
      // Check local skip first
      if (allTutorialsSkipped) {
        return true;
      }

      // Check server status if available
      if (serverTutorialStatus) {
        const tutorialName = tutorialId.replace(
          "_tutorial",
          ""
        ) as keyof TutorialData;
        const serverResult =
          serverTutorialStatus[tutorialName]?.hasSeen || false;
        console.log(
          `[TutorialContext] Server status for ${tutorialName}:`,
          serverResult
        );
        return serverResult;
      }

      // Fallback to local check
      const localResult = localCompletedTutorials.has(tutorialId);
      console.log(
        `[TutorialContext] Local status for ${tutorialId}:`,
        localResult
      );
      return localResult;
    },
    [allTutorialsSkipped, serverTutorialStatus, localCompletedTutorials]
  );

  // Add a ref to track measurement registration to prevent duplicates
  const measurementRegistrationRef = useRef<Set<string>>(new Set());

  // Target measurement functions
  const registerTarget = useCallback((id: string, measurement: any) => {
    // ENHANCED: Prevent duplicate registrations for the same target
    const measurementKey = `${id}-${measurement.x}-${measurement.y}-${measurement.width}-${measurement.height}`;

    if (measurementRegistrationRef.current.has(measurementKey)) {
      return; // Skip duplicate measurement
    }

    measurementRegistrationRef.current.add(measurementKey);

    console.log(`[TutorialContext] Registering target ${id}:`, measurement);
    targetMeasurements.current[id] = measurement;

    // Clean up old measurements for this target
    setTimeout(() => {
      measurementRegistrationRef.current.delete(measurementKey);
    }, 1000);
  }, []);

  const getTargetMeasurement = useCallback((id: string) => {
    const measurement = targetMeasurements.current[id];
    // REDUCED: Only log when actually retrieving a measurement
    if (measurement) {
      console.log(
        `[TutorialContext] Getting measurement for ${id}:`,
        measurement
      );
    }
    return measurement;
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        // Existing values
        isActive,
        currentTutorial,
        currentStep,
        currentStepIndex,
        isFirstStep,
        isLastStep,

        // Language values
        isTagalog,
        toggleLanguage,

        // Tutorial controls
        startTutorial,
        stopTutorial,
        nextStep,
        previousStep,
        isTutorialCompleted,

        // Server-based tutorial management
        shouldShowTutorial,
        markTutorialCompleted,
        getTutorialStatus,
        resetAllTutorials,

        // Local session skip functionality
        skipAllTutorials,
        areAllTutorialsSkipped,

        // Navigation handler
        setNavigationHandler,

        // Target registration
        registerTarget,
        getTargetMeasurement,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};
