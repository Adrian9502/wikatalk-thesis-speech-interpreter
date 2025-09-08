import { create } from "zustand";
import { getToken } from "@/lib/authTokenManager";
import useCoinsStore from "./useCoinsStore";
import { hintService } from "@/services/api/hintService";

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
  4: 20, //  Fourth hint cost for identification
  5: 25, // Fifth hint cost for fill in the blanks
};

//  Game mode specific max hints
const MAX_HINTS_PER_GAME_MODE = {
  multipleChoice: 2,
  identification: 4,
  fillBlanks: 5,
};

const DEFAULT_MAX_HINTS = 3;

const useHintStore = create<HintState>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  questionHints: new Map(),
  currentQuestionHints: [],
  hintsUsedCount: 0,

  // Get max hints for game mode
  getMaxHints: (gameMode: string) => {
    return (
      MAX_HINTS_PER_GAME_MODE[
        gameMode as keyof typeof MAX_HINTS_PER_GAME_MODE
      ] || DEFAULT_MAX_HINTS
    );
  },

  // Get hint cost with game mode support
  getHintCost: (hintsUsed: number, gameMode: string) => {
    const maxHints = get().getMaxHints(gameMode);
    const nextHint = hintsUsed + 1;

    if (nextHint > maxHints) {
      return null; // No more hints available for this game mode
    }

    return HINT_COSTS[nextHint as keyof typeof HINT_COSTS] || null;
  },

  //  Check if hint can be used with game mode support
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

      const data = await hintService.purchaseHint({
        questionId,
        gameMode,
        currentHintsUsed: hintsUsedCount,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to purchase hint");
      }

      let optionToDisable;

      if (gameMode === "fillBlanks") {
        const availableLetters = options.filter(
          (option) => !currentQuestionHints.includes(option.id)
        );

        if (availableLetters.length === 0) {
          throw new Error("No more letters can be revealed");
        }

        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        optionToDisable = availableLetters[randomIndex];
      } else {
        const incorrectOptions = options.filter((option) => {
          const isIncorrect =
            option.isCorrect === false || option.isCorrect === undefined;
          const notAlreadyHinted = !currentQuestionHints.includes(option.id);
          return isIncorrect && notAlreadyHinted;
        });

        if (incorrectOptions.length === 0) {
          throw new Error("No more incorrect options can be disabled");
        }

        const randomIndex = Math.floor(Math.random() * incorrectOptions.length);
        optionToDisable = incorrectOptions[randomIndex];

        if (optionToDisable.isCorrect === true) {
          throw new Error("System error: Cannot disable correct answer");
        }
      }

      // Update hint state
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

      // NEW: Update coins store with remaining coins from backend response
      if (data.remainingCoins !== undefined) {
        console.log(`[HintStore] Updating coins to ${data.remainingCoins}`);
        useCoinsStore.setState({ coins: data.remainingCoins });
      }

      const action =
        gameMode === "fillBlanks" ? "Revealed letter" : "Disabled option";
      console.log(
        `[HintStore] Hint purchased for ${gameMode} question ${questionId}. ${action}: ${optionToDisable.id}. Hints used: ${updatedHints.length}/${maxHints}`
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
