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
  target?: string; // Element identifier
  order: number;
  placement?: "top" | "bottom" | "center";
  skipable?: boolean;
}

export interface TutorialConfig {
  id: string;
  name: string;
  steps: TutorialStep[];
  autoStart?: boolean;
}

interface TutorialContextType {
  // Current tutorial state
  currentTutorial: TutorialConfig | null;
  currentStepIndex: number;
  isActive: boolean;

  // Tutorial controls
  startTutorial: (config: TutorialConfig) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (index: number) => void;

  // Step helpers
  currentStep: TutorialStep | null;
  isFirstStep: boolean;
  isLastStep: boolean;

  // Target element registration
  registerTarget: (id: string, measurement: any) => void;
  getTargetMeasurement: (id: string) => any;

  // Tutorial completion tracking
  markTutorialCompleted: (tutorialId: string) => void;
  isTutorialCompleted: (tutorialId: string) => boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTutorial, setCurrentTutorial] = useState<TutorialConfig | null>(
    null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(
    new Set()
  );

  // Store target element measurements
  const targetMeasurements = useRef<Map<string, any>>(new Map());

  const startTutorial = useCallback(
    (config: TutorialConfig) => {
      // Don't start if already completed (unless forced)
      if (completedTutorials.has(config.id)) {
        console.log(
          `[TutorialContext] Tutorial ${config.id} already completed`
        );
        return;
      }

      console.log(`[TutorialContext] Starting tutorial: ${config.name}`);
      setCurrentTutorial(config);
      setCurrentStepIndex(0);
      setIsActive(true);
      // Clear any previous measurements
      targetMeasurements.current.clear();
    },
    [completedTutorials]
  );

  const stopTutorial = useCallback(() => {
    console.log("[TutorialContext] Stopping tutorial");
    if (currentTutorial) {
      markTutorialCompleted(currentTutorial.id);
    }
    setCurrentTutorial(null);
    setCurrentStepIndex(0);
    setIsActive(false);
    targetMeasurements.current.clear();
  }, [currentTutorial]);

  const nextStep = useCallback(() => {
    if (!currentTutorial) return;

    console.log(
      `[TutorialContext] Next step: ${currentStepIndex + 1}/${
        currentTutorial.steps.length
      }`
    );

    if (currentStepIndex < currentTutorial.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      stopTutorial();
    }
  }, [currentTutorial, currentStepIndex, stopTutorial]);

  const previousStep = useCallback(() => {
    console.log(`[TutorialContext] Previous step: ${currentStepIndex - 1}`);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback(
    (index: number) => {
      if (!currentTutorial) return;

      console.log(`[TutorialContext] Go to step: ${index}`);
      if (index >= 0 && index < currentTutorial.steps.length) {
        setCurrentStepIndex(index);
      }
    },
    [currentTutorial]
  );

  const registerTarget = useCallback((id: string, measurement: any) => {
    console.log(`[TutorialContext] Registering target ${id}:`, measurement);
    targetMeasurements.current.set(id, measurement);
  }, []);

  const getTargetMeasurement = useCallback((id: string) => {
    const measurement = targetMeasurements.current.get(id);
    console.log(
      `[TutorialContext] Getting measurement for ${id}:`,
      measurement
    );
    return measurement;
  }, []);

  const markTutorialCompleted = useCallback((tutorialId: string) => {
    console.log(
      `[TutorialContext] Marking tutorial ${tutorialId} as completed`
    );
    setCompletedTutorials((prev) => new Set([...prev, tutorialId]));
    // TODO: Persist to AsyncStorage
  }, []);

  const isTutorialCompleted = useCallback(
    (tutorialId: string) => {
      const completed = completedTutorials.has(tutorialId);
      console.log(
        `[TutorialContext] Tutorial ${tutorialId} completed:`,
        completed
      );
      return completed;
    },
    [completedTutorials]
  );

  // Computed values
  const currentStep = currentTutorial
    ? currentTutorial.steps[currentStepIndex]
    : null;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentTutorial
    ? currentStepIndex === currentTutorial.steps.length - 1
    : false;

  const value: TutorialContextType = {
    currentTutorial,
    currentStepIndex,
    isActive,
    startTutorial,
    stopTutorial,
    nextStep,
    previousStep,
    goToStep,
    currentStep,
    isFirstStep,
    isLastStep,
    registerTarget,
    getTargetMeasurement,
    markTutorialCompleted,
    isTutorialCompleted,
  };

  return (
    <TutorialContext.Provider value={value}>
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
