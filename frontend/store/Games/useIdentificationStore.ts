import { create } from "zustand";

// Define sentence structure
interface Sentence {
  id: number;
  sentence: string;
  targetWord: string;
  translation: string;
  choices?: string[];
  description?: string;
  title?: string;
  dialect?: string;
}

// Define word item structure
interface WordItem {
  display: string;
  clean: string;
  isPunctuation: boolean;
}

// Define the store state interface
interface IdentificationState {
  // Game state
  currentSentenceIndex: number;
  score: number;
  selectedWord: number | null;
  gameStatus: "playing" | "completed";
  showTranslation: boolean;
  feedback: "correct" | "incorrect" | null;
  timerRunning: boolean;
  timeElapsed: number;
  sentences: Sentence[];
  words: WordItem[];
  levelId: number;
  
  // Actions
  setSentences: (sentences: Sentence[]) => void;
  setSelectedWord: (index: number | null) => void;
  setGameStatus: (status: "playing" | "completed") => void;
  setTimerRunning: (isRunning: boolean) => void;
  setTimeElapsed: (time: number) => void;
  updateTimeElapsed: (time: number) => void;
  toggleTranslation: () => void;
  
  // Complex actions
  initialize: (levelData: any, levelId: number) => void;
  startGame: () => void;
  handleWordSelect: (word: WordItem, index: number) => void;
  handleRestart: () => void;
  resetTimer: () => void;
  createSentencesFromData: (data: any) => Sentence[];
  processWords: (sentence: Sentence) => WordItem[];
}

const useIdentificationStore = create<IdentificationState>((set, get) => ({
  // Initial state
  currentSentenceIndex: 0,
  score: 0,
  selectedWord: null,
  gameStatus: "playing",
  showTranslation: false,
  feedback: null,
  timerRunning: false,
  timeElapsed: 0,
  sentences: [],
  words: [],
  levelId: 1,
  
  // Basic actions
  setSentences: (sentences) => set({ sentences }),
  setSelectedWord: (index) => set({ selectedWord: index }),
  setGameStatus: (status) => set({ gameStatus: status }),
  setTimerRunning: (isRunning) => set({ timerRunning: isRunning }),
  setTimeElapsed: (time) => set({ timeElapsed: time }),
  updateTimeElapsed: (time) => set({ timeElapsed: time }),
  toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),
  
  // Reset timer
  resetTimer: () => set({ timeElapsed: 0, timerRunning: false }),
  
  // Process words from a sentence
  processWords: (sentence) => {
    if (!sentence) return [];

    if (sentence.choices && sentence.choices.length > 0) {
      // Filter out duplicate choices
      const uniqueChoices = [...new Set(sentence.choices)];

      return uniqueChoices.map((choice) => ({
        display: choice,
        clean: choice,
        isPunctuation: false,
      }));
    } else {
      // Fall back to splitting sentence
      return sentence.sentence.split(/\s+/).map((word) => {
        const cleanWord = word.replace(/[.,!?;:]/g, "");
        return {
          display: word,
          clean: cleanWord,
          isPunctuation: Boolean(word.match(/[.,!?;:]/)),
        };
      });
    }
  },
  
  // Create sentences from level data
  createSentencesFromData: (data) => {
    // Create a sentence object in the format the component expects
    return [
      {
        id: data.id,
        sentence: data.sentence,
        targetWord: data.targetWord,
        translation: data.translation,
        choices: data.choices || [],
        description: data.description || "",
        title: data.title || "",
        dialect: data.dialect || "",
      },
    ];
  },
  
  // Initialize game
  initialize: (levelData, levelId) => {
    const sentences = get().createSentencesFromData(levelData);
    const words = get().processWords(sentences[0]);
    
    set({
      sentences,
      words,
      levelId,
      currentSentenceIndex: 0,
      score: 0,
      selectedWord: null,
      gameStatus: "playing",
      showTranslation: false,
      feedback: null,
      timeElapsed: 0,
      timerRunning: false,
    });
    
    console.log(`Identification initialized for level ${levelId} with ${sentences.length} sentences`);
  },
  
  // Start game
  startGame: () => {
    set({ timerRunning: true });
    console.log("Identification game started");
  },
  
  // Handle word selection
  handleWordSelect: (word, index) => {
    const { selectedWord, sentences, currentSentenceIndex } = get();
    
    if (selectedWord !== null || word.isPunctuation) return;
    
    const currentSentence = sentences[currentSentenceIndex];
    const isCorrect = word.clean.toLowerCase() === currentSentence.targetWord.toLowerCase();
    
    // Stop the timer when checking answer
    set({ 
      selectedWord: index, 
      feedback: isCorrect ? "correct" : "incorrect",
      timerRunning: false 
    });
    
    if (isCorrect) {
      set((state) => ({ score: state.score + 1 }));
    }
    
    // Move to next or complete after delay
    setTimeout(() => {
      const { currentSentenceIndex, sentences } = get();
      if (currentSentenceIndex < sentences.length - 1) {
        set((state) => ({ 
          currentSentenceIndex: state.currentSentenceIndex + 1,
          selectedWord: null,
          feedback: null,
          showTranslation: false,
        }));
      } else {
        set({ gameStatus: "completed" });
      }
    }, 2000);
  },
  
  // Restart game
  handleRestart: () => {
    const { sentences } = get();
    
    set({
      currentSentenceIndex: 0,
      score: 0,
      selectedWord: null,
      feedback: null,
      showTranslation: false,
      gameStatus: "playing",
      timerRunning: true,
      timeElapsed: 0,
      words: get().processWords(sentences[0]),
    });
  },
}));

export default useIdentificationStore;