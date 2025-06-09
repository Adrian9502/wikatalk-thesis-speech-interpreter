import { create } from "zustand";
import axios from "axios";
import { Keyboard } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  focusArea?: "vocabulary" | "grammar" | "pronunciation";
}

interface MultipleChoiceQuestion extends QuestionBase {
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface IdentificationQuestion extends QuestionBase {
  answer: string;
  choices?: string[];
  sentence: string;
}

interface FillInTheBlankQuestion extends QuestionBase {
  answer: string;
  hint?: string;
  sentence: string;
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
  clearCache?: () => void;
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

// Cache helpers
const CACHE_KEY_PREFIX = "quiz_data_";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const cacheData = async (key: string, data: any) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      `${CACHE_KEY_PREFIX}${key}`,
      JSON.stringify(cacheItem)
    );
  } catch (error) {
    console.log("Cache save error:", error);
  }
};

const getCachedData = async (key: string) => {
  try {
    const cachedItem = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (cachedItem) {
      const { data, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.log("Cache retrieval error:", error);
    return null;
  }
};

const ensureProperFormat = (question: any): QuestionType => {
  // Ensure the question object has all needed properties
  return {
    ...question,
    difficulty: question.difficulty?.toLowerCase() || "easy",
    translation: question.translation || "",
    description: question.description || "",
    dialect: question.dialect || "",
    focusArea: question.focusArea || "vocabulary",
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

  // Clear cache
  clearCache: async () => {
    console.log("Clearing quiz data cache...");
    try {
      // Get all keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();

      // Filter only quiz data cache keys
      const quizCacheKeys = keys.filter((key) =>
        key.startsWith(CACHE_KEY_PREFIX)
      );

      if (quizCacheKeys.length > 0) {
        // Remove all quiz cache keys
        await AsyncStorage.multiRemove(quizCacheKeys);
        console.log(
          `Successfully cleared ${quizCacheKeys.length} cache items:`,
          quizCacheKeys
        );
      } else {
        console.log("No quiz cache found to clear");
      }

      // Also reset the lastFetched timestamp to force a fresh fetch
      set({ lastFetched: 0 });

      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
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
    // Try to get from memory first (fastest)
    const modeQuestions = get().questions[mode as GameMode];
    if (Object.values(modeQuestions).some((diff) => diff.length > 0)) {
      console.log(`Using in-memory data for ${mode}`);
      return;
    }

    // Try to get from AsyncStorage cache next
    const cacheKey = `${CACHE_KEY_PREFIX}${mode}`;
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        if (
          parsedData.timestamp &&
          Date.now() - parsedData.timestamp < CACHE_EXPIRY
        ) {
          console.log(`Using cached data for ${mode}`);
          set((state) => ({
            questions: {
              ...state.questions,
              [mode as GameMode]: parsedData.data,
            },
            isLoading: false,
            lastFetched: parsedData.timestamp,
          }));
          return;
        }
      }
    } catch (error) {
      console.log("Cache error, falling back to API:", error);
    }

    // If not in cache, fetch from API
    set({ isLoading: true, error: null });
    try {
      console.log(`Fetching ${mode} questions from API...`);
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

        // Save to cache in the background
        cacheData(mode, organized);
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
      `Initializing ${gameMode} level ${levelId} with data:`,
      levelData
    );

    if (!levelData) {
      console.error("Missing levelData in initialize");
      set({ error: "Missing level data" });
      return;
    }

    // Common initialization - set game mode and levelId
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: "idle",
        currentMode: gameMode as GameMode,
        levelId,
        score: 0,
        timeElapsed: 0,
        timerRunning: false,
      },
      error: null, // Clear any previous errors
    }));

    // Mode-specific initialization
    if (gameMode === "identification") {
      try {
        console.log("Initializing identification with levelData:", levelData);

        // Create sentence object with level field
        const sentence = {
          id: levelData?.id || 0,
          level: levelData?.level || `Level ${levelId}`, // Ensure level is set
          sentence: levelData?.sentence || levelData?.question || "",
          answer: levelData?.answer || levelData?.targetWord || "",
          translation: levelData?.translation || "",
          title: levelData?.title || `Level ${levelId}`,
          dialect: levelData?.dialect || "",
          focusArea: levelData?.focusArea || "vocabulary",
        };

        let words = [];

        // Check if choices exists and is an array with items
        if (
          levelData?.choices &&
          Array.isArray(levelData.choices) &&
          levelData.choices.length > 0
        ) {
          console.log("Using choices array:", levelData.choices);
          words = levelData.choices.map((choice, index) => {
            // Handle both string and object choices
            const textValue =
              typeof choice === "string"
                ? choice
                : choice && typeof choice.text === "string"
                ? choice.text
                : String(choice);

            return {
              id: index.toString(),
              text: textValue,
              clean: textValue.replace(/[.,!?;:'"()\[\]{}]/g, ""),
            };
          });
        }
        // Fallback: use options array if available
        else if (
          levelData?.options &&
          Array.isArray(levelData.options) &&
          levelData.options.length > 0
        ) {
          console.log("Using options array as fallback:", levelData.options);
          words = levelData.options.map((option, index) => {
            const textValue =
              typeof option === "string"
                ? option
                : option && typeof option.text === "string"
                ? option.text
                : String(option);

            return {
              id: index.toString(),
              text: textValue,
              clean: textValue.replace(/[.,!?;:'"()\[\]{}]/g, ""),
            };
          });
        }
        // Final fallback: split sentence into words
        else if (sentence.sentence) {
          console.log("Fallback: splitting sentence into words");
          const sentenceWords = sentence.sentence
            .split(/\s+/)
            .filter((word) => word.length > 0);
          words = sentenceWords.map((word, index) => ({
            id: index.toString(),
            text: word,
            clean: word.replace(/[.,!?;:'"()\[\]{}]/g, ""),
          }));
        }

        console.log("Processed words for identification:", words);

        if (words.length === 0) {
          throw new Error("No words available for identification game");
        }

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

        console.log("Identification state initialized successfully");
      } catch (error) {
        console.error("Error initializing identification mode:", error);
        set({
          error: "Failed to initialize identification game: " + error.message,
        });
      }
    }

    // For fillBlanks mode
    else if (gameMode === "fillBlanks") {
      try {
        console.log("Initializing fillBlanks with levelData:", levelData);

        // Create exercise object with level field
        const exercise = {
          id: levelData?.id || 0,
          level: levelData?.level || `Level ${levelId}`, // Ensure level is set
          sentence: String(levelData?.sentence || levelData?.question || ""),
          answer: String(levelData?.answer || levelData?.targetWord || ""),
          translation: String(levelData?.translation || ""),
          hint: String(levelData?.hint || ""),
          title: String(levelData?.title || `Level ${levelId}`),
          dialect: String(levelData?.dialect || ""),
          focusArea: String(levelData?.focusArea || "vocabulary"),
        };

        console.log("Created fillBlanks exercise:", exercise);

        if (!exercise.sentence || !exercise.answer) {
          throw new Error(
            "Missing sentence or answer for fill in the blank game"
          );
        }

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

        console.log("FillInTheBlank state initialized successfully");
      } catch (error) {
        console.error("Error initializing fillBlanks mode:", error);
        set({
          error:
            "Failed to initialize fill in the blank game: " + error.message,
        });
      }
    }

    // For multipleChoice mode
    else if (gameMode === "multipleChoice") {
      try {
        console.log("Initializing multipleChoice with levelData:", levelData);

        // Ensure focusArea and level are included
        const questionWithFocusArea = {
          ...levelData,
          focusArea: levelData.focusArea || "vocabulary",
          level: levelData.level || `Level ${levelId}`, // Ensure level is properly set
        };

        if (
          !questionWithFocusArea.options ||
          !Array.isArray(questionWithFocusArea.options) ||
          questionWithFocusArea.options.length === 0
        ) {
          throw new Error("No options available for multiple choice game");
        }

        set({
          multipleChoiceState: {
            currentQuestion: questionWithFocusArea,
            selectedOption: null,
          },
        });

        console.log("MultipleChoice state initialized successfully");
      } catch (error) {
        console.error("Error initializing multipleChoice mode:", error);
        set({
          error: "Failed to initialize multiple choice game: " + error.message,
        });
      }
    }
  },

  // Start game
  startGame: () => {
    console.log("Starting game...");
    console.log("Before update - Game state:", get().gameState);

    // Direct state update
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: "playing",
        timerRunning: true,
      },
    }));

    // Immediately log the new state
    console.log("After update - Game state:", get().gameState);
  },

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

    // Move to completed state after delay
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

  // Update formatSentence method
  formatSentence: () => {
    const { fillInTheBlankState } = get();
    const { exercises, currentExerciseIndex } = fillInTheBlankState;
    const currentExercise = exercises[currentExerciseIndex];

    if (!currentExercise || !currentExercise.sentence) return "";

    // Make sure answer exists before trying to replace it
    const answer = currentExercise.answer || "";

    if (!answer) return currentExercise.sentence;

    // Replace the answer with underscores of equal length
    return currentExercise.sentence.replace(
      new RegExp(answer, "gi"),
      "_".repeat(answer.length)
    );
  },

  // Update checkAnswer method
  checkAnswer: () => {
    const { Keyboard } = require("react-native");
    Keyboard.dismiss();

    const { fillInTheBlankState, gameState } = get();
    const { exercises, currentExerciseIndex, userAnswer, attemptsLeft } =
      fillInTheBlankState;
    const currentExercise = exercises[currentExerciseIndex];

    if (!currentExercise) return;

    // Simple normalization for comparison
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = (
      currentExercise.answer || ""
    ).toLowerCase();

    const correct = normalizedUserAnswer === normalizedCorrectAnswer;
    console.log("Checking answer, isCorrect:", correct);

    // Always decrease attempts when checking
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

      // Move to completed state with proper structure - FIXED!
      setTimeout(() => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            gameStatus: "completed",
          },
        }));
      }, 3000);
    } else {
      if (newAttemptsLeft <= 0) {
        setTimeout(() => {
          set((state) => ({
            gameState: {
              ...state.gameState,
              gameStatus: "completed",
            },
          }));
        }, 2500);
      } else {
        // Still have attempts - hide feedback after delay to allow retry - FIXED!
        setTimeout(() => {
          set((state) => ({
            fillInTheBlankState: {
              ...state.fillInTheBlankState,
              showFeedback: false,
              userAnswer: "", // Clear the input for retry
            },
            gameState: {
              // FIXED: was incorrectly "gameStatus"
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

    // If a word is already selected, don't do anything
    if (identificationState.selectedWord !== null) return;

    const selectedWord = words[wordIndex];
    // Use answer field with fallback to targetWord for backward compatibility
    const isCorrect =
      selectedWord?.clean?.toLowerCase() ===
      (currentSentence?.answer || currentSentence?.targetWord)?.toLowerCase();

    // Update selection, feedback and timer in one batch to avoid flicker
    set({
      gameState: {
        ...gameState,
        timerRunning: false,
        // Set score directly in the first update to avoid race conditions
        score: isCorrect ? 1 : 0,
      },
      identificationState: {
        ...identificationState,
        selectedWord: wordIndex,
        feedback: isCorrect ? "correct" : "incorrect",
      },
    });

    // Move to completed state after delay
    setTimeout(() => {
      set((state) => ({
        gameState: {
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
