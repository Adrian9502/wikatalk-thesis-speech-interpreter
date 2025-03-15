import { create } from "zustand";
import { debounce } from "lodash";
import * as Speech from "expo-speech";
import { translateText } from "@/lib/translationService";
import * as Clipboard from "expo-clipboard";

// Add this interface
interface LanguageCodeMap {
  [key: string]: string;
}

interface TranslateState {
  // State properties remain the same
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  openSource: boolean;
  openTarget: boolean;
  copiedSource: boolean;
  copiedTarget: boolean;
  isSpeaking: boolean;
  isTranslating: boolean;
  error: string | Error | null;

  // Actions
  updateState: (newState: Partial<TranslateState>) => void;
  translate: () => Promise<void>;
  handleSwapLanguages: () => void;
  copyToClipboard: (text: string, key: "copiedSource" | "copiedTarget") => void;
  handleSourceSpeech: () => Promise<void>;
  handleTranslatedSpeech: () => Promise<void>;
  clearSourceText: () => void;
  stopSpeech: () => Promise<void>;
  getLanguageCodeForSpeech: (language: string) => string;
}

export const useTranslateStore = create<TranslateState>((set, get) => ({
  // Initial state remains the same
  sourceLanguage: "Tagalog",
  targetLanguage: "Cebuano",
  sourceText: "",
  translatedText: "",
  openSource: false,
  openTarget: false,
  copiedSource: false,
  copiedTarget: false,
  isSpeaking: false,
  isTranslating: false,
  error: null,

  // Add this helper function
  getLanguageCodeForSpeech: (language: string): string => {
    const languageMap: LanguageCodeMap = {
      Tagalog: "fil",
      Cebuano: "fil",
      Hiligaynon: "fil",
      Ilocano: "fil",
      Bicol: "fil",
      Waray: "fil",
      Pangasinan: "fil",
      Maguindanao: "fil",
      Kapampangan: "fil",
      Bisaya: "fil",
    };

    return languageMap[language] || "fil";
  },

  // Other actions remain unchanged
  updateState: (newState) => set((state) => ({ ...state, ...newState })),

  translate: async () => {
    // Unchanged
    const { sourceLanguage, targetLanguage, sourceText } = get();

    if (!sourceText.trim()) {
      set({ translatedText: "", isTranslating: false });
      return;
    }

    set({ isTranslating: true, error: null });

    try {
      const result = await translateText(
        sourceText,
        sourceLanguage,
        targetLanguage
      );
      set({ translatedText: result, isTranslating: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Translation failed"),
        isTranslating: false,
      });
    }
  },

  handleSwapLanguages: () => {
    // Unchanged
    const { sourceLanguage, targetLanguage, sourceText, translatedText } =
      get();
    set({
      sourceLanguage: targetLanguage,
      targetLanguage: sourceLanguage,
      sourceText: translatedText,
      translatedText: sourceText,
    });
    get().stopSpeech();
  },

  copyToClipboard: async (text, key) => {
    // Unchanged
    if (!text) return;
    try {
      await Clipboard.setStringAsync(text);
      // Reset after 2 seconds
      setTimeout(() => {
        set({ [key]: false });
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  },

  stopSpeech: async () => {
    // Unchanged
    const isSpeakingNow = await Speech.isSpeakingAsync();
    if (isSpeakingNow) {
      await Speech.stop();
      set({ isSpeaking: false });
    }
  },

  // Update the speech functions to use the language code mapping
  handleSourceSpeech: async () => {
    const { sourceText, sourceLanguage, isSpeaking, getLanguageCodeForSpeech } =
      get();

    if (isSpeaking) {
      await get().stopSpeech();
      return;
    }

    if (sourceText) {
      set({ isSpeaking: true });
      Speech.speak(sourceText, {
        language: getLanguageCodeForSpeech(sourceLanguage), // Use the mapped code
        onDone: () => set({ isSpeaking: false }),
        onError: () => set({ isSpeaking: false }),
      });
    }
  },

  handleTranslatedSpeech: async () => {
    const {
      translatedText,
      targetLanguage,
      isSpeaking,
      getLanguageCodeForSpeech,
    } = get();

    if (isSpeaking) {
      await get().stopSpeech();
      return;
    }

    if (translatedText) {
      set({ isSpeaking: true });
      Speech.speak(translatedText, {
        language: getLanguageCodeForSpeech(targetLanguage), // Use the mapped code
        onDone: () => set({ isSpeaking: false }),
        onError: () => set({ isSpeaking: false }),
      });
    }
  },

  clearSourceText: () => set({ sourceText: "", translatedText: "" }),
}));

// Create debounced translate function
export const debouncedTranslate = debounce(
  () => useTranslateStore.getState().translate(),
  500
);
