import { create } from "zustand";
import { getToken } from "@/lib/authTokenManager";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface HintState {
  // State
  isLoading: boolean;
  error: string | null;

  // Hint tracking per question
  questionHints: Map<string, string[]>; // questionId -> disabled option IDs
  currentQuestionHints: string[]; // Current question's disabled options
  hintsUsedCount: number; // Current question hint count

  // Actions
  purchaseHint: (
    questionId: string,
    gameMode: string,
    options: any[]
  ) => Promise<boolean>;
  getHintCost: (hintsUsed: number) => number | null;
  resetQuestionHints: () => void;
  setCurrentQuestion: (questionId: string) => void;
  canUseHint: (hintsUsed: number) => boolean;

  // Utility
  resetStore: () => void;
}

const HINT_COSTS = {
  1: 5,
  2: 10,
  3: 15,
};

const MAX_HINTS = 3;

const useHintStore = create<HintState>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  questionHints: new Map(),
  currentQuestionHints: [],
  hintsUsedCount: 0,

  // Get hint cost
  getHintCost: (hintsUsed: number) => {
    const nextHint = hintsUsed + 1;
    return HINT_COSTS[nextHint as keyof typeof HINT_COSTS] || null;
  },

  // Check if hint can be used
  canUseHint: (hintsUsed: number) => {
    return hintsUsed < MAX_HINTS;
  },

  // Set current question and load existing hints
  setCurrentQuestion: (questionId: string) => {
    const { questionHints } = get();
    const existingHints = questionHints.get(questionId) || [];

    set({
      currentQuestionHints: existingHints,
      hintsUsedCount: existingHints.length,
    });
  },

  // Reset hints for current question
  resetQuestionHints: () => {
    set({
      currentQuestionHints: [],
      hintsUsedCount: 0,
    });
  },

  // Purchase hint
  purchaseHint: async (
    questionId: string,
    gameMode: string,
    options: any[]
  ) => {
    try {
      set({ isLoading: true, error: null });

      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const { currentQuestionHints, hintsUsedCount } = get();

      // API call to purchase hint
      const response = await fetch(`${API_URL}/api/hints/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId,
          gameMode,
          currentHintsUsed: hintsUsedCount,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to purchase hint");
      }

      // Select random incorrect option to disable
      const incorrectOptions = options.filter((option) => !option.isCorrect);
      const availableOptions = incorrectOptions.filter(
        (option) => !currentQuestionHints.includes(option.id)
      );

      if (availableOptions.length === 0) {
        throw new Error("No more options can be disabled");
      }

      // Randomly select an incorrect option to disable
      const randomIndex = Math.floor(Math.random() * availableOptions.length);
      const optionToDisable = availableOptions[randomIndex];

      // Update state
      const updatedHints = [...currentQuestionHints, optionToDisable.id];
      const { questionHints } = get();
      const newQuestionHints = new Map(questionHints);
      newQuestionHints.set(questionId, updatedHints);

      set({
        isLoading: false,
        currentQuestionHints: updatedHints,
        hintsUsedCount: updatedHints.length,
        questionHints: newQuestionHints,
      });

      console.log(
        `[HintStore] Hint purchased for question ${questionId}. Disabled option: ${optionToDisable.id}`
      );
      return true;
    } catch (error) {
      console.error("Error purchasing hint:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to purchase hint",
      });
      return false;
    }
  },

  // Reset store
  resetStore: () => {
    set({
      isLoading: false,
      error: null,
      questionHints: new Map(),
      currentQuestionHints: [],
      hintsUsedCount: 0,
    });
  },
}));

export default useHintStore;
