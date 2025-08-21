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
  getHintCost: (hintsUsed: number, gameMode: string) => number | null;
  resetQuestionHints: () => void;
  setCurrentQuestion: (questionId: string) => void;
  canUseHint: (hintsUsed: number, gameMode: string) => boolean;
  getMaxHints: (gameMode: string) => number;

  // Utility
  resetStore: () => void;
}

const HINT_COSTS = {
  1: 5,
  2: 10,
  3: 15,
  4: 20, // NEW: Fourth hint cost for identification
};

// NEW: Game mode specific max hints
const MAX_HINTS_PER_GAME_MODE = {
  multipleChoice: 2,
  identification: 4,
  fillBlanks: 3,
};

const DEFAULT_MAX_HINTS = 3;

const useHintStore = create<HintState>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  questionHints: new Map(),
  currentQuestionHints: [],
  hintsUsedCount: 0,

  // NEW: Get max hints for game mode
  getMaxHints: (gameMode: string) => {
    return (
      MAX_HINTS_PER_GAME_MODE[
        gameMode as keyof typeof MAX_HINTS_PER_GAME_MODE
      ] || DEFAULT_MAX_HINTS
    );
  },

  // UPDATED: Get hint cost with game mode support
  getHintCost: (hintsUsed: number, gameMode: string) => {
    const maxHints = get().getMaxHints(gameMode);
    const nextHint = hintsUsed + 1;

    if (nextHint > maxHints) {
      return null; // No more hints available for this game mode
    }

    return HINT_COSTS[nextHint as keyof typeof HINT_COSTS] || null;
  },

  // UPDATED: Check if hint can be used with game mode support
  canUseHint: (hintsUsed: number, gameMode: string) => {
    const maxHints = get().getMaxHints(gameMode);
    return hintsUsed < maxHints;
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

      const { currentQuestionHints, hintsUsedCount, getMaxHints } = get();
      const maxHints = getMaxHints(gameMode);

      // Check if max hints reached for this game mode
      if (hintsUsedCount >= maxHints) {
        throw new Error(
          `Maximum hints reached for ${gameMode} (${maxHints} max)`
        );
      }

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

      // FIXED: Better filtering to ensure only incorrect options are targeted
      const incorrectOptions = options.filter((option) => {
        // Explicitly check that isCorrect is false (not just falsy)
        const isIncorrect =
          option.isCorrect === false || option.isCorrect === undefined;
        const notAlreadyHinted = !currentQuestionHints.includes(option.id);

        console.log(
          `[HintStore] Option ${option.id}: isCorrect=${option.isCorrect}, isIncorrect=${isIncorrect}, notHinted=${notAlreadyHinted}`
        );

        return isIncorrect && notAlreadyHinted;
      });

      // ADDITIONAL: Log all options for debugging
      console.log(
        `[HintStore] All options:`,
        options.map((opt) => ({
          id: opt.id,
          text: opt.text?.substring(0, 20) + "...",
          isCorrect: opt.isCorrect,
        }))
      );

      console.log(
        `[HintStore] Incorrect options available:`,
        incorrectOptions.map((opt) => ({
          id: opt.id,
          text: opt.text?.substring(0, 20) + "...",
          isCorrect: opt.isCorrect,
        }))
      );

      if (incorrectOptions.length === 0) {
        throw new Error("No more incorrect options can be disabled");
      }

      // Randomly select an incorrect option to disable
      const randomIndex = Math.floor(Math.random() * incorrectOptions.length);
      const optionToDisable = incorrectOptions[randomIndex];

      // ADDITIONAL: Verify the option we're disabling is incorrect
      if (optionToDisable.isCorrect === true) {
        console.error(
          `[HintStore] ERROR: Attempting to disable correct answer! Option:`,
          optionToDisable
        );
        throw new Error("System error: Cannot disable correct answer");
      }

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
        `[HintStore] Hint purchased for ${gameMode} question ${questionId}. Disabled INCORRECT option: ${optionToDisable.id} (isCorrect: ${optionToDisable.isCorrect}). Hints used: ${updatedHints.length}/${maxHints}`
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
