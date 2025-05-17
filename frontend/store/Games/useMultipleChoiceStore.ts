import { create } from "zustand";

interface MultipleChoiceState {
  // Game state
  score: number;
  selectedOption: string | null;
  gameStatus: "playing" | "completed";
  timerRunning: boolean;
  timeElapsed: number;
  currentQuestion: any;
  levelId: number;
  progress: number;

  // Actions
  setScore: (score: number) => void;
  setSelectedOption: (optionId: string | null) => void;
  setGameStatus: (status: "playing" | "completed") => void;
  setTimerRunning: (isRunning: boolean) => void;
  setTimeElapsed: (time: number) => void;
  updateTimeElapsed: (time: number) => void;
  setCurrentQuestion: (question: any) => void;
  setLevelId: (id: number) => void;

  // Complex actions
  handleOptionSelect: (optionId: string) => void;
  reset: () => void;
  initialize: (levelData: any, levelId: number) => void;
  startGame: () => void;
  handleRestart: () => void;
}

const useMultipleChoiceStore = create<MultipleChoiceState>((set, get) => ({
  // Initial state
  score: 0,
  selectedOption: null,
  gameStatus: "playing",
  timerRunning: false,
  timeElapsed: 0,
  currentQuestion: null,
  levelId: 1,
  progress: 100,

  // Basic actions
  setScore: (score) => set({ score }),
  setSelectedOption: (optionId) => set({ selectedOption: optionId }),
  setGameStatus: (status) => set({ gameStatus: status }),
  setTimerRunning: (isRunning) => set({ timerRunning: isRunning }),
  setTimeElapsed: (time) => set({ timeElapsed: time }),
  updateTimeElapsed: (time) => set({ timeElapsed: time }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setLevelId: (id) => set({ levelId: id }),

  handleOptionSelect: (optionId) => {
    const { selectedOption, currentQuestion, score } = get();
    if (selectedOption) return;

    // Stop the timer when an answer is selected
    set({ timerRunning: false, selectedOption: optionId });

    const selectedOptionObj = currentQuestion.options.find(
      (option) => option.id === optionId
    );

    if (selectedOptionObj?.isCorrect) {
      set({ score: score + 1 });
    }

    // Move to completed state after delay
    setTimeout(() => {
      set({ gameStatus: "completed" });
    }, 1500);
  },

  reset: () => {
    set({
      score: 0,
      selectedOption: null,
      gameStatus: "playing",
      timerRunning: false,
      timeElapsed: 0,
    });
  },

  initialize: (levelData, levelId) => {
    set({
      currentQuestion: levelData,
      levelId,
      score: 0,
      selectedOption: null,
      gameStatus: "playing",
      timerRunning: false,
      timeElapsed: 0,
    });
  },

  startGame: () => {
    set({ timerRunning: true });
  },

  handleRestart: () => {
    const currentLevelData = get().currentQuestion;
    const currentLevelId = get().levelId;

    set({
      score: 0,
      selectedOption: null,
      gameStatus: "playing",
      timerRunning: true,
      timeElapsed: 0,
    });
  },
}));

export default useMultipleChoiceStore;
