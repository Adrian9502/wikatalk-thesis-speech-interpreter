import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

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
  startTutorial: (config: TutorialConfig) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  isTutorialCompleted: (tutorialId: string) => boolean;

  // NEW: Skip all tutorials
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
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(
    new Set()
  );

  // NEW: State to track if all tutorials are skipped
  const [allTutorialsSkipped, setAllTutorialsSkipped] = useState(false);

  // Language state
  const [isTagalog, setIsTagalog] = useState(false);

  // Target measurements storage
  const targetMeasurements = useRef<Record<string, any>>({});
  const navigationHandlerRef = useRef<
    ((tabName: string, tutorialId?: string) => void) | null
  >(null);

  // Computed values
  const currentStep = currentTutorial?.steps[currentStepIndex] || null;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentTutorial
    ? currentStepIndex === currentTutorial.steps.length - 1
    : false;

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

  // NEW: Skip all tutorials function
  const skipAllTutorials = useCallback(() => {
    console.log("[TutorialContext] Skipping ALL tutorials");

    // Mark all known tutorials as completed
    const allTutorialIds = [
      "home_tutorial",
      "speech_tutorial",
      "translate_tutorial",
      "scan_tutorial",
      "games_tutorial",
      "pronounce_tutorial",
    ];

    setCompletedTutorials(new Set(allTutorialIds));
    setAllTutorialsSkipped(true);

    // Stop current tutorial
    setIsActive(false);
    setCurrentTutorial(null);
    setCurrentStepIndex(0);
    setIsTagalog(false);
    targetMeasurements.current = {};

    console.log("[TutorialContext] All tutorials marked as completed");
  }, []);

  // NEW: Check if all tutorials are skipped
  const areAllTutorialsSkipped = useCallback(() => {
    return allTutorialsSkipped;
  }, [allTutorialsSkipped]);

  // ENHANCED: Tutorial start check
  const startTutorial = useCallback(
    (config: TutorialConfig) => {
      // Don't start if all tutorials are skipped
      if (allTutorialsSkipped) {
        console.log(
          "[TutorialContext] All tutorials skipped, not starting:",
          config.name
        );
        return;
      }

      console.log(`[TutorialContext] Starting tutorial: ${config.name}`);
      setCurrentTutorial(config);
      setCurrentStepIndex(0);
      setIsActive(true);
      setIsTagalog(false);
      targetMeasurements.current = {};
    },
    [allTutorialsSkipped]
  );

  // ENHANCED: Stop tutorial function
  const stopTutorial = useCallback(() => {
    console.log("[TutorialContext] Stopping tutorial");
    if (currentTutorial) {
      setCompletedTutorials((prev) => new Set(prev).add(currentTutorial.id));
    }
    setIsActive(false);
    setCurrentTutorial(null);
    setCurrentStepIndex(0);
    setIsTagalog(false);
    targetMeasurements.current = {};
  }, [currentTutorial]);

  // ENHANCED: Next step with navigation support
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
        navigationHandlerRef.current
      ) {
        console.log(
          `[TutorialContext] Executing navigation action to: ${navigationAction.tabName}`
        );

        // Mark current tutorial as completed
        setCompletedTutorials((prev) => new Set(prev).add(currentTutorial.id));

        // Stop current tutorial
        setIsActive(false);
        setCurrentTutorial(null);
        setCurrentStepIndex(0);
        setIsTagalog(false);
        targetMeasurements.current = {};

        // Navigate to next tab and start its tutorial
        navigationHandlerRef.current(
          navigationAction.tabName,
          navigationAction.startTutorial
        );
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

  // ENHANCED: Check completion including skip all
  const isTutorialCompleted = useCallback(
    (tutorialId: string) => {
      return allTutorialsSkipped || completedTutorials.has(tutorialId);
    },
    [completedTutorials, allTutorialsSkipped]
  );

  // Target measurement functions
  const registerTarget = useCallback((id: string, measurement: any) => {
    console.log(`[TutorialContext] Registering target ${id}:`, measurement);
    targetMeasurements.current[id] = measurement;
  }, []);

  const getTargetMeasurement = useCallback((id: string) => {
    const measurement = targetMeasurements.current[id];
    console.log(
      `[TutorialContext] Getting measurement for ${id}:`,
      measurement
    );
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

        // NEW: Skip all functionality
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
