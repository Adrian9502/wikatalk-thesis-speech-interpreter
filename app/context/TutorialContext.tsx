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
  // NEW: Navigation action for step completion
  navigationAction?: {
    type: "navigate_tab";
    tabName: string;
    startTutorial?: string; // Tutorial ID to start in the new tab
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

  // NEW: Navigation handler
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

  // Language state
  const [isTagalog, setIsTagalog] = useState(false);

  // Target measurements storage
  const targetMeasurements = useRef<Record<string, any>>({});

  // NEW: Navigation handler ref
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

  // NEW: Set navigation handler
  const setNavigationHandler = useCallback(
    (handler: (tabName: string, tutorialId?: string) => void) => {
      navigationHandlerRef.current = handler;
      console.log("[TutorialContext] Navigation handler registered");
    },
    []
  );

  // Tutorial controls
  const startTutorial = useCallback((config: TutorialConfig) => {
    console.log(`[TutorialContext] Starting tutorial: ${config.name}`);
    setCurrentTutorial(config);
    setCurrentStepIndex(0);
    setIsActive(true);
    // Reset language to English when starting new tutorial
    setIsTagalog(false);
    // Clear previous target measurements
    targetMeasurements.current = {};
  }, []);

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

  const isTutorialCompleted = useCallback(
    (tutorialId: string) => {
      return completedTutorials.has(tutorialId);
    },
    [completedTutorials]
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

        // NEW: Navigation handler
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
