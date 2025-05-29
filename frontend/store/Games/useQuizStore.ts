import { create } from "zustand";
import axios from "axios";
import { Keyboard } from "react-native";

// Define the API URL using environment variable
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Define allowed game modes and difficulties for type safety
type GameMode = "multipleChoice" | "identification" | "fillBlanks";
type Difficulty = "easy" | "medium" | "hard";
type GameStatus = "idle" | "playing" | "completed";

// Question interfaces
interface QuestionBase {
  id: number;
  level: string;
  difficulty: Difficulty;
  mode: GameMode;
  title: string;
  description?: string;
  question: string;
  translation?: string;
  dialect?: string;
}

interface MultipleChoiceQuestion extends QuestionBase {
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface IdentificationQuestion extends QuestionBase {
  targetWord: string;
  choices?: string[];
  sentence: string;
}

interface FillInTheBlankQuestion extends QuestionBase {
  targetWord: string;
  hint?: string;
  sentence: string;
  answer: string;
}

type QuestionType =
  | MultipleChoiceQuestion
  | IdentificationQuestion
  | FillInTheBlankQuestion;

// Define questions structure
interface QuizQuestions {
  multipleChoice: { [key in Difficulty]: MultipleChoiceQuestion[] };
  identification: { [key in Difficulty]: IdentificationQuestion[] };
  fillBlanks: { [key in Difficulty]: FillInTheBlankQuestion[] };
  [key: string]: { [key: string]: any[] };
}

// Common game state interface
interface CommonGameState {
  gameStatus: GameStatus;
  score: number;
  timerRunning: boolean;
  timeElapsed: number;
  levelId: number;
  currentMode: GameMode | null;
}

// Mode-specific state interfaces
interface MultipleChoiceState {
  currentQuestion: MultipleChoiceQuestion | null;
  selectedOption: string | null;
}

interface FillInTheBlankState {
  exercises: any[];
  currentExerciseIndex: number;
  userAnswer: string;
  showHint: boolean;
  showTranslation: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  attemptsLeft: number;
}

interface IdentificationState {
  sentences: any[];
  currentSentenceIndex: number;
  words: any[];
  selectedWord: number | null;
  showTranslation: boolean;
  feedback: string | null;
}

// Unified store state interface
interface QuizState {
  // Data fetching state
  questions: QuizQuestions;
  isLoading: boolean;
  error: string | null;
  lastFetched: number;

  // Common game state
  gameState: CommonGameState;

  // Mode-specific states
  multipleChoiceState: MultipleChoiceState;
  fillInTheBlankState: FillInTheBlankState;
  identificationState: IdentificationState;

  // Data fetching actions
  fetchQuestions: () => Promise<void>;
  fetchQuestionsByMode: (mode: string) => Promise<void>;
  fetchQuestionsByLevelAndMode: (
    level: number,
    mode: string
  ) => Promise<QuestionType | null>;
  getLevelData: (gameMode: string, levelId: number, difficulty?: string) => any;
  clearQuestions: () => void;
  testConnection: () => Promise<boolean>;

  // Common game actions
  setGameStatus: (status: GameStatus) => void;
  setScore: (score: number) => void;
  setTimerRunning: (isRunning: boolean) => void;
  setTimeElapsed: (time: number) => void;
  updateTimeElapsed: (time: number) => void;
  resetTimer: () => void;

  // Game initialization and control
  initialize: (
    levelData: any,
    levelId: number,
    gameMode: GameMode,
    difficulty?: string
  ) => void;
  startGame: () => void;
  handleRestart: () => void;

  // Multiple Choice actions
  handleOptionSelect: (optionId: string) => void;

  // Fill in the Blank actions
  setUserAnswer: (answer: string) => void;
  toggleHint: () => void;
  toggleTranslation: () => void;
  checkAnswer: () => void;
  moveToNext: () => void;
  formatSentence: () => string;

  // Identification actions
  handleWordSelect: (wordIndex: number) => void;
  toggleIdentificationTranslation: () => void;
}

const ensureProperFormat = (question: any): QuestionType => {
  // Ensure the question object has all needed properties
  return {
    ...question,
    difficulty: question.difficulty?.toLowerCase() || "easy",
    translation: question.translation || "",
    description: question.description || "",
    dialect: question.dialect || "",
  } as QuestionType;
};

const useQuizStore = create<QuizState>((set, get) => ({
  // Initial data state
  questions: {
    multipleChoice: { easy: [], medium: [], hard: [] },
    identification: { easy: [], medium: [], hard: [] },
    fillBlanks: { easy: [], medium: [], hard: [] },
  },
  isLoading: false,
  error: null,
  lastFetched: 0,

  // Initial common game state
  gameState: {
    gameStatus: "idle",
    score: 0,
    timerRunning: false,
    timeElapsed: 0,
    levelId: 1,
    currentMode: null,
  },

  // Initial multiple choice state
  multipleChoiceState: {
    currentQuestion: null,
    selectedOption: null,
  },

  // Initial fill in the blank state
  fillInTheBlankState: {
    exercises: [],
    currentExerciseIndex: 0,
    userAnswer: "",
    showHint: false,
    showTranslation: false,
    showFeedback: false,
    isCorrect: false,
    attemptsLeft: 2,
  },

  // Initial identification state
  identificationState: {
    sentences: [],
    currentSentenceIndex: 0,
    words: [],
    selectedWord: null,
    showTranslation: false,
    feedback: null,
  },

  // Data fetching actions (keep your existing implementations)
  fetchQuestions: async () => {
    // Only fetch if data is older than 5 minutes (300000 ms)
    const now = Date.now();
    if (
      now - get().lastFetched < 300000 &&
      Object.values(get().questions).some((mode) =>
        Object.values(mode).some((diff) => diff.length > 0)
      )
    ) {
      return; // Use cached data
    }

    try {
      set({ isLoading: true, error: null });
      // Fix the API endpoint to match server registration
      const response = await axios.get(`${API_URL}/api/quiz`);

      if (response.status === 200) {
        const questionsData = response.data;

        // Organize by mode and difficulty
        const organizedQuestions = {
          multipleChoice: { easy: [], medium: [], hard: [] },
          identification: { easy: [], medium: [], hard: [] },
          fillBlanks: { easy: [], medium: [], hard: [] },
        } as QuizQuestions;

        questionsData.forEach((q: QuestionType) => {
          const mode = q.mode;
          const difficulty = (q.difficulty?.toLowerCase() ||
            "easy") as Difficulty;

          if (
            organizedQuestions[mode] &&
            organizedQuestions[mode][difficulty]
          ) {
            organizedQuestions[mode][difficulty].push(q as any);
          }
        });

        set({
          questions: organizedQuestions,
          isLoading: false,
          lastFetched: now,
        });
      }
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      set({
        error: "Failed to fetch quiz questions. Please try again later.",
        isLoading: false,
      });
    }
  },

  // Test connection to the backend
  testConnection: async () => {
    try {
      console.log("Testing connection to backend...");
      const response = await axios.get(`${API_URL}/api/test`);
      console.log("Backend connection successful:", response.data);
      return true;
    } catch (error) {
      console.error("Backend connection failed:", error);
      return false;
    }
  },

  // Fetch questions for a specific game mode
  fetchQuestionsByMode: async (mode: string) => {
    // CRITICAL FIX: Check if we already have data for this mode to avoid unnecessary refetching
    const modeQuestions = get().questions[mode as GameMode];
    if (Object.values(modeQuestions).some((diff) => diff.length > 0)) {
      console.log(
        `Using cached data for ${mode}, already loaded ${
          Object.values(modeQuestions).flat().length
        } questions`
      );
      return; // Use cached data
    }

    let retries = 3;
    let success = false;

    set({ isLoading: true, error: null });

    try {
      console.log(`Fetching ${mode} questions...`);
      const response = await axios.get(`${API_URL}/api/quiz/mode/${mode}`, {
        timeout: 10000,
      });

      if (response.status === 200) {
        const questionsData = response.data;
        console.log(`Got ${questionsData.length} questions for ${mode}`);

        // Process and format the data
        const organized = {
          easy: [] as any[],
          medium: [] as any[],
          hard: [] as any[],
        };

        questionsData.forEach((q: QuestionType) => {
          // Format the question to ensure proper types
          const formattedQuestion = ensureProperFormat(q);

          const difficulty = (formattedQuestion.difficulty?.toLowerCase() ||
            "easy") as Difficulty;
          if (organized[difficulty]) {
            organized[difficulty].push(formattedQuestion);
          }
        });

        set((state) => ({
          questions: {
            ...state.questions,
            [mode as GameMode]: organized,
          },
          isLoading: false,
          lastFetched: Date.now(),
        }));

        return;
      }
    } catch (error) {
      console.error(`Error fetching ${mode} questions:`, error);
      set({
        error: `Failed to fetch ${mode} questions.`,
        isLoading: false,
      });
    }
  },

  // Fetch a specific question by level and mode
  fetchQuestionsByLevelAndMode: async (level: number, mode: string) => {
    try {
      set({ isLoading: true, error: null });
      // Fix the API endpoint to match server registration
      const response = await axios.get(
        `${API_URL}/api/quiz/level/${level}/mode/${mode}`
      );

      if (response.status === 200 && response.data) {
        set({ isLoading: false });
        return response.data as QuestionType;
      } else {
        set({ isLoading: false });
        return null;
      }
    } catch (error) {
      console.error(`Error fetching level ${level} for ${mode}:`, error);
      set({
        error: `Failed to fetch level ${level}. Please try again later.`,
        isLoading: false,
      });
      return null;
    }
  },

  // Get level data for game components - similar to the current logic in Questions.tsx
  getLevelData: (gameMode: string, levelId: number, difficulty = "easy") => {
    const modeQuestions = get().questions[gameMode as GameMode];
    if (!modeQuestions) return null;

    // Try to find in the specified difficulty
    if (modeQuestions[difficulty as Difficulty]) {
      const levelData = modeQuestions[difficulty as Difficulty].find(
        (q: QuestionType) => q.id === levelId
      );
      if (levelData) return levelData;
    }

    // Try to find in any difficulty
    const difficulties = Object.keys(modeQuestions) as Difficulty[];
    for (const diff of difficulties) {
      const levelData = modeQuestions[diff].find(
        (q: QuestionType) => q.id === levelId
      );
      if (levelData) {
        return {
          levelData,
          foundDifficulty: diff,
        };
      }
    }

    // If still not found, return the first level of the current difficulty as fallback
    if (
      modeQuestions[difficulty as Difficulty] &&
      modeQuestions[difficulty as Difficulty].length > 0
    ) {
      return modeQuestions[difficulty as Difficulty][0];
    }

    return null;
  },

  // Clear all questions data
  clearQuestions: () => {
    set({
      questions: {
        multipleChoice: { easy: [], medium: [], hard: [] },
        identification: { easy: [], medium: [], hard: [] },
        fillBlanks: { easy: [], medium: [], hard: [] },
      },
      lastFetched: 0,
    });
  },

  // Common game actions
  setGameStatus: (status) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: status,
      },
    })),

  setScore: (score) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        score,
      },
    })),

  setTimerRunning: (isRunning) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        timerRunning: isRunning,
      },
    })),

  setTimeElapsed: (time) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        timeElapsed: time,
      },
    })),

  updateTimeElapsed: (time) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        timeElapsed: time,
      },
    })),

  resetTimer: () =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        timeElapsed: 0,
        timerRunning: false,
      },
    })),

  // Game initialization
  initialize: (levelData, levelId, gameMode, difficulty = "easy") => {
    console.log(
      `Initializing ${gameMode} game with level ${levelId} data:`,
      levelData
    );

    // Common initialization - explicitly set gameStatus to "idle"
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: "idle",
        score: 0,
        timerRunning: false,
        timeElapsed: 0,
        levelId,
        currentMode: gameMode,
      },
    }));

    // Mode-specific initialization
    if (gameMode === "multipleChoice") {
      set({
        multipleChoiceState: {
          currentQuestion: levelData,
          selectedOption: null,
        },
      });
      console.log("MultipleChoice state initialized:", levelData);
    } else if (gameMode === "fillBlanks") {
      // Process level data into exercises format
      const exercise = {
        id: levelData.id || 0,
        sentence: levelData.sentence || levelData.question || "",
        answer: levelData.answer || levelData.targetWord || "",
        translation: levelData.translation || "",
        hint: levelData.hint || "",
        title: levelData.title || `Level ${levelId}`,
        dialect: levelData.dialect || "",
      };

      set({
        fillInTheBlankState: {
          exercises: [exercise],
          currentExerciseIndex: 0,
          userAnswer: "",
          showHint: false,
          showTranslation: false,
          showFeedback: false,
          isCorrect: false,
          attemptsLeft: 2,
        },
      });
    }
    // In the initialize function, replace the identification section:
    else if (gameMode === "identification") {
      console.log("Initializing identification game with data:", levelData);

      // Process level data for identification
      const sentence = {
        id: levelData.id || 0,
        sentence: levelData.sentence || levelData.question || "",
        targetWord: levelData.targetWord || "",
        translation: levelData.translation || "",
        title: levelData.title || `Level ${levelId}`,
        dialect: levelData.dialect || "",
      };

      // FIXED: Directly check if choices exists and use it
      let words = [];

      // Check if choices exists and is an array
      if (
        levelData.choices &&
        Array.isArray(levelData.choices) &&
        levelData.choices.length > 0
      ) {
        console.log(
          "Found choices array with",
          levelData.choices.length,
          "items"
        );
        words = levelData.choices.map((choice) => ({
          id: choice.id || String(Math.random()),
          original: choice.text || "",
          clean: choice.text || "",
          text: choice.text || "",
        }));
      }
      // Fallback to options if choices doesn't exist
      else if (
        levelData.options &&
        Array.isArray(levelData.options) &&
        levelData.options.length > 0
      ) {
        console.log("Using options array instead of choices");
        words = levelData.options.map((option) => ({
          id: option.id || String(Math.random()),
          original: option.text || "",
          clean: option.text || "",
          text: option.text || "",
        }));
      }

      console.log("Processed words for identification:", words);

      set({
        identificationState: {
          sentences: [sentence],
          currentSentenceIndex: 0,
          words,
          selectedWord: null,
          showTranslation: false,
          feedback: null,
        },
      });
    }

    console.log(
      `Initialized ${gameMode} level ${levelId} with data:`,
      levelData
    );
  },

  // Start game
  startGame: () =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: "playing",
        timerRunning: true,
      },
    })),

  // Restart game
  handleRestart: () => {
    const { currentMode } = get().gameState;

    // Reset common state
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: "playing",
        score: 0,
        timerRunning: true,
        timeElapsed: 0,
      },
    }));

    // Reset mode-specific state
    if (currentMode === "multipleChoice") {
      set({
        multipleChoiceState: {
          ...get().multipleChoiceState,
          selectedOption: null,
        },
      });
    } else if (currentMode === "fillBlanks") {
      set({
        fillInTheBlankState: {
          ...get().fillInTheBlankState,
          currentExerciseIndex: 0,
          userAnswer: "",
          showHint: false,
          showTranslation: false,
          showFeedback: false,
          isCorrect: false,
          attemptsLeft: 2,
        },
      });
    } else if (currentMode === "identification") {
      set({
        identificationState: {
          ...get().identificationState,
          selectedWord: null,
          showTranslation: false,
          feedback: null,
        },
      });
    }
  },

  // MULTIPLE CHOICE ACTIONS
  handleOptionSelect: (optionId: string) => {
    const { multipleChoiceState, gameState } = get();
    const { selectedOption, currentQuestion } = multipleChoiceState;

    // If already selected, don't do anything
    if (selectedOption) return;

    console.log("Processing option selection:", optionId);

    // First update the selected option and stop the timer
    set({
      gameState: {
        ...gameState,
        timerRunning: false,
      },
      multipleChoiceState: {
        ...multipleChoiceState,
        selectedOption: optionId,
      },
    });

    // Find the selected option
    const selectedOptionObj = currentQuestion?.options.find(
      (option) => option.id === optionId
    );

    // Update the score in a separate update to avoid race conditions
    if (selectedOptionObj?.isCorrect) {
      console.log("Correct answer selected!");
      // Important: Use state parameter to ensure we're working with the latest state
      set((state) => ({
        gameState: {
          ...state.gameState,
          score: 1, // Set to 1 for correct
        },
      }));
    } else {
      console.log("Incorrect answer selected!");
      set((state) => ({
        gameState: {
          ...state.gameState,
          score: 0, // Set to 0 for incorrect
        },
      }));
    }

    // Move to completed state after delay using state parameter for latest state
    setTimeout(() => {
      set((state) => ({
        gameState: {
          ...state.gameState,
          gameStatus: "completed",
        },
      }));
    }, 1500);
  },

  // FILL IN THE BLANK ACTIONS
  setUserAnswer: (answer: string) =>
    set((state) => ({
      fillInTheBlankState: {
        ...state.fillInTheBlankState,
        userAnswer: answer,
      },
    })),

  toggleHint: () =>
    set((state) => ({
      fillInTheBlankState: {
        ...state.fillInTheBlankState,
        showHint: !state.fillInTheBlankState.showHint,
      },
    })),

  toggleTranslation: () =>
    set((state) => ({
      fillInTheBlankState: {
        ...state.fillInTheBlankState,
        showTranslation: !state.fillInTheBlankState.showTranslation,
      },
    })),

  formatSentence: () => {
    const { fillInTheBlankState } = get();
    const { exercises, currentExerciseIndex } = fillInTheBlankState;
    const currentExercise = exercises[currentExerciseIndex];

    if (!currentExercise || !currentExercise.sentence) return "";

    // Make sure targetWord/answer exists before trying to replace it
    const targetWord =
      currentExercise.targetWord || currentExercise.answer || "";

    if (!targetWord) return currentExercise.sentence;

    // Replace the target word with underscores of equal length
    return currentExercise.sentence.replace(
      new RegExp(targetWord, "gi"),
      "_".repeat(targetWord.length)
    );
  },

  checkAnswer: () => {
    Keyboard.dismiss();

    const { fillInTheBlankState, gameState } = get();
    const { exercises, currentExerciseIndex, userAnswer, attemptsLeft } =
      fillInTheBlankState;
    const currentExercise = exercises[currentExerciseIndex];

    if (!currentExercise) return;

    // Don't allow checking if feedback is already shown or no attempts left
    if (fillInTheBlankState.showFeedback || attemptsLeft <= 0) return;

    // Simple normalization for comparison
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = (
      currentExercise.answer ||
      currentExercise.targetWord ||
      ""
    ).toLowerCase();

    const correct = normalizedUserAnswer === normalizedCorrectAnswer;

    console.log("Checking answer:", {
      userAnswer: normalizedUserAnswer,
      correctAnswer: normalizedCorrectAnswer,
      isCorrect: correct,
      currentAttempts: attemptsLeft,
    });

    // Always decrease attempts when checking (regardless of correctness)
    const newAttemptsLeft = Math.max(0, attemptsLeft - 1);

    // Stop the timer and show feedback immediately
    set((state) => ({
      gameState: {
        ...state.gameState,
        timerRunning: false,
      },
      fillInTheBlankState: {
        ...state.fillInTheBlankState,
        showFeedback: true,
        isCorrect: correct,
        attemptsLeft: newAttemptsLeft,
      },
    }));

    if (correct) {
      // Update score for correct answer
      set((state) => ({
        gameState: {
          ...state.gameState,
          score: state.gameState.score + 1,
        },
      }));

      // Move to completed state after showing feedback
      setTimeout(() => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            gameStatus: "completed",
          },
        }));
      }, 2000); // Increased delay to show feedback longer
    } else {
      // For incorrect answers
      if (newAttemptsLeft <= 0) {
        // No attempts left - move to completed after showing feedback
        setTimeout(() => {
          set((state) => ({
            gameState: {
              ...state.gameState,
              gameStatus: "completed",
            },
          }));
        }, 2500);
      } else {
        // Still have attempts - hide feedback after delay to allow retry
        setTimeout(() => {
          set((state) => ({
            fillInTheBlankState: {
              ...state.fillInTheBlankState,
              showFeedback: false,
              userAnswer: "",
            },
            gameState: {
              ...state.gameState,
              timerRunning: true, // Resume timer for next attempt
            },
          }));
        }, 2000);
      }
    }
  },

  moveToNext: () => {
    const { fillInTheBlankState, gameState } = get();

    set({
      fillInTheBlankState: {
        ...fillInTheBlankState,
        currentExerciseIndex: fillInTheBlankState.currentExerciseIndex + 1,
        userAnswer: "",
        showFeedback: false,
        showHint: false,
        showTranslation: false,
        attemptsLeft: 2,
      },
      gameState: {
        ...gameState,
        timerRunning: true,
      },
    });
  },

  handleWordSelect: (wordIndex: number) => {
    const { identificationState, gameState } = get();
    const { sentences, currentSentenceIndex, words } = identificationState;
    const currentSentence = sentences[currentSentenceIndex];

    if (!currentSentence || wordIndex >= words.length) return;

    console.log("Word selected:", wordIndex, words[wordIndex]);

    // Stop the timer
    set((state) => ({
      gameState: {
        ...state.gameState,
        timerRunning: false,
      },
    }));

    // Check if selected word matches target word
    const selectedWord = words[wordIndex];
    const isCorrect =
      selectedWord?.clean?.toLowerCase() ===
      currentSentence.targetWord?.toLowerCase();

    console.log(
      "Selected word:",
      selectedWord?.clean,
      "Target word:",
      currentSentence.targetWord
    );
    console.log("Is correct?", isCorrect);

    // Update feedback and selected word index
    set((state) => ({
      identificationState: {
        ...state.identificationState,
        selectedWord: wordIndex,
        feedback: isCorrect ? "correct" : "incorrect",
      },
    }));

    // Update score if correct in a separate update to avoid race conditions
    if (isCorrect) {
      set((state) => ({
        gameState: {
          ...state.gameState,
          score: 1, // Set to 1 for correct
        },
      }));
    } else {
      set((state) => ({
        gameState: {
          ...state.gameState,
          score: 0, // Set to 0 for incorrect
        },
      }));
    }

    // FIXED: This was referring to gameStatus instead of gameState
    setTimeout(() => {
      set((state) => ({
        gameState: {
          // FIXED: Was incorrectly referencing gameStatus
          ...state.gameState,
          gameStatus: "completed",
        },
      }));
    }, 1500);
  },

  toggleIdentificationTranslation: () => {
    set((state) => ({
      identificationState: {
        ...state.identificationState,
        showTranslation: !state.identificationState.showTranslation,
      },
    }));
  },
}));

export default useQuizStore;
