import { create } from "zustand";
import { Keyboard } from "react-native";

// Define the exercise type
interface Exercise {
  id: number;
  sentence: string;
  answer: string;
  translation: string;
  hint: string;
  title?: string;
  dialect?: string;
}

// Define the quiz questions structure
interface QuizQuestions {
  fillBlanks: {
    easy: Exercise[];
    medium: Exercise[];
    hard: Exercise[];
    [key: string]: Exercise[];
  };
  [key: string]: {
    [key: string]: any[];
  };
}

// Define the store state interface
interface FillInTheBlankState {
  // Game state
  currentExerciseIndex: number;
  userAnswer: string;
  score: number;
  gameStatus: "playing" | "completed";
  showHint: boolean;
  showTranslation: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  attemptsLeft: number;
  timerRunning: boolean;
  timeElapsed: number;
  exercises: Exercise[];
  levelId: number;
  
  // Actions
  setExercises: (exercises: Exercise[]) => void;
  setUserAnswer: (answer: string) => void;
  setGameStatus: (status: "playing" | "completed") => void;
  setTimerRunning: (isRunning: boolean) => void;
  setTimeElapsed: (time: number) => void;
  updateTimeElapsed: (time: number) => void;
  toggleHint: () => void;
  toggleTranslation: () => void;
  
  // Complex actions
  initialize: (levelData: any, levelId: number, difficulty?: string) => void;
  startGame: () => void;
  checkAnswer: () => void;
  moveToNext: () => void;
  handleRestart: () => void;
  resetTimer: () => void;
  formatSentence: () => string;
  getExercises: (levelData: any, difficulty?: string) => Exercise[];
}

const useFillInTheBlankStore = create<FillInTheBlankState>((set, get) => ({
  // Initial state
  currentExerciseIndex: 0,
  userAnswer: "",
  score: 0,
  gameStatus: "playing",
  showHint: false,
  showTranslation: false,
  showFeedback: false,
  isCorrect: false,
  attemptsLeft: 2,
  timerRunning: false,
  timeElapsed: 0,
  exercises: [],
  levelId: 1,
  
  // Basic actions
  setExercises: (exercises) => set({ exercises }),
  setUserAnswer: (answer) => set({ userAnswer: answer }),
  setGameStatus: (status) => set({ gameStatus: status }),
  setTimerRunning: (isRunning) => set({ timerRunning: isRunning }),
  setTimeElapsed: (time) => set({ timeElapsed: time }),
  updateTimeElapsed: (time) => set({ timeElapsed: time }),
  
  // Toggle actions
  toggleHint: () => set((state) => ({ showHint: !state.showHint })),
  toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),
  
  // Reset timer
  resetTimer: () => set({ timeElapsed: 0, timerRunning: false }),
  
  // Format sentence with blank
  formatSentence: () => {
    const { exercises, currentExerciseIndex } = get();
    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) return "";
    return currentExercise.sentence.replace("___", "______");
  },
  
  // Get exercises based on level data and difficulty
  getExercises: (levelData, difficulty = "easy") => {
    if (levelData) {
      // If specific level data is provided, use it
      return [
        {
          id: levelData.id,
          sentence: levelData.sentence,
          answer: levelData.answer,
          translation: levelData.translation,
          hint: levelData.hint,
          title: levelData.title,
          dialect: levelData.dialect,
        },
      ];
    }
    
    // Otherwise use the quiz questions data based on difficulty
    const difficultyKey = difficulty?.toLowerCase() || "easy";
    
    // This would need to be imported, but for demo we're just describing
    // You'll need to import quizQuestions at the top of the file
    const quizData = { fillBlanks: { easy: [], medium: [], hard: [] } } as QuizQuestions; 
    
    // Get questions from the appropriate difficulty section
    const difficultyQuestions = quizData.fillBlanks[difficultyKey] || [];
    
    // Format them to match the expected structure - including title and dialect
    return difficultyQuestions.map((question: Exercise) => ({
      id: question.id,
      sentence: question.sentence,
      answer: question.answer,
      translation: question.translation,
      hint: question.hint,
      title: question.title,
      dialect: question.dialect,
    }));
  },
  
  // Initialize game
  initialize: (levelData, levelId, difficulty = "easy") => {
    const exercises = get().getExercises(levelData, difficulty);
    
    set({
      exercises,
      levelId,
      currentExerciseIndex: 0,
      userAnswer: "",
      score: 0,
      gameStatus: "playing",
      showHint: false,
      showTranslation: false,
      showFeedback: false,
      isCorrect: false,
      attemptsLeft: 2,
      timeElapsed: 0,
      timerRunning: false,
    });
    
    console.log(`FillInTheBlank initialized for level ${levelId} with ${exercises.length} exercises`);
  },
  
  // Start game
  startGame: () => {
    set({ timerRunning: true });
    console.log("Fill in the Blank game started");
  },
  
  // Check answer
  checkAnswer: () => {
    Keyboard.dismiss();
    
    const { exercises, currentExerciseIndex, userAnswer, attemptsLeft } = get();
    const currentExercise = exercises[currentExerciseIndex];
    
    if (!currentExercise) return;
    
    // Simple normalization for comparison
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentExercise.answer.toLowerCase();
    
    const correct = normalizedUserAnswer === normalizedCorrectAnswer;
    
    // Stop the timer when checking answer
    set({ 
      showFeedback: true, 
      isCorrect: correct,
      timerRunning: false 
    });
    
    if (correct) {
      set((state) => ({ score: state.score + 1 }));
      
      // Move to next exercise after delay
      setTimeout(() => {
        const { currentExerciseIndex, exercises } = get();
        if (currentExerciseIndex < exercises.length - 1) {
          get().moveToNext();
        } else {
          set({ gameStatus: "completed" });
        }
      }, 1500);
    } else {
      // Decrease attempts
      const newAttemptsLeft = attemptsLeft - 1;
      set({ attemptsLeft: newAttemptsLeft });
      
      // If no attempts left, show correct answer and move on after delay
      if (newAttemptsLeft <= 0) {
        setTimeout(() => {
          const { currentExerciseIndex, exercises } = get();
          if (currentExerciseIndex < exercises.length - 1) {
            get().moveToNext();
          } else {
            set({ gameStatus: "completed" });
          }
        }, 2500);
      } else {
        // Hide feedback after a delay to allow another attempt
        setTimeout(() => {
          set({ showFeedback: false });
        }, 1500);
      }
    }
  },
  
  // Move to next exercise
  moveToNext: () => {
    set((state) => ({
      currentExerciseIndex: state.currentExerciseIndex + 1,
      userAnswer: "",
      showFeedback: false,
      showHint: false,
      showTranslation: false,
      attemptsLeft: 2,
      timerRunning: true, // Resume timer for the next question
    }));
  },
  
  // Restart game
  handleRestart: () => {
    set({
      currentExerciseIndex: 0,
      userAnswer: "",
      score: 0,
      showFeedback: false,
      showHint: false,
      showTranslation: false,
      attemptsLeft: 2,
      gameStatus: "playing",
      timerRunning: true,
      timeElapsed: 0,
    });
  },
}));

export default useFillInTheBlankStore;