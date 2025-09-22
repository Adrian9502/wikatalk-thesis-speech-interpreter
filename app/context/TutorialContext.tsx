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
  tagalogText: string; // Now required for all steps
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
  // Existing tutorial state
  isActive: boolean;
  currentTutorial: TutorialConfig | null;
  currentStep: TutorialStep | null;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;

  // NEW: Language state
  isTagalog: boolean;
  toggleLanguage: () => void;

  // Tutorial controls
  startTutorial: (config: TutorialConfig) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  isTutorialCompleted: (tutorialId: string) => boolean;

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

  // NEW: Language state
  const [isTagalog, setIsTagalog] = useState(false);

  // Target measurements storage
  const targetMeasurements = useRef<Record<string, any>>({});

  // Computed values
  const currentStep = currentTutorial?.steps[currentStepIndex] || null;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentTutorial
    ? currentStepIndex === currentTutorial.steps.length - 1
    : false;

  // NEW: Language toggle function
  const toggleLanguage = useCallback(() => {
    setIsTagalog((prev) => !prev);
    console.log(
      `[TutorialContext] Language toggled to: ${
        !isTagalog ? "Tagalog" : "English"
      }`
    );
  }, [isTagalog]);

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
    setIsTagalog(false); // Reset language when stopping
    targetMeasurements.current = {};
  }, [currentTutorial]);

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
    }
  }, [currentTutorial, currentStepIndex]);

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

        // NEW: Language values
        isTagalog,
        toggleLanguage,

        // Tutorial controls
        startTutorial,
        stopTutorial,
        nextStep,
        previousStep,
        isTutorialCompleted,

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
