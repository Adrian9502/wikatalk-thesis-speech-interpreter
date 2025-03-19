import { create } from "zustand";
import { debounce } from "lodash";
import * as Speech from "expo-speech";
import { translateText } from "@/lib/translationService";
import * as Clipboard from "expo-clipboard";

// Language code map interface
interface LanguageCodeMap {
  [key: string]: string;
}

interface TranslateState {
  // State properties
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
  translateDetectedText: (text: string) => Promise<void>; // function for OCR
  handleSwapLanguages: () => void;
  copyToClipboard: (text: string, key: "copiedSource" | "copiedTarget") => void;
  handleSourceSpeech: () => Promise<void>;
  handleTranslatedSpeech: () => Promise<void>;
  clearSourceText: () => void;
  stopSpeech: () => Promise<void>;
  getLanguageCodeForSpeech: (language: string) => string;
}

export const useTranslateStore = create<TranslateState>((set, get) => ({
  // Initial state
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

  // Helper function
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

  // Update state
  updateState: (newState) => set((state) => ({ ...state, ...newState })),

  // Standard translate function
  translate: async () => {
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

  // New function for OCR text translation without specifying source language
  translateDetectedText: async (text: string) => {
    const { targetLanguage } = get();

    if (!text.trim()) {
      set({ sourceText: "", translatedText: "", isTranslating: false });
      return;
    }

    set({
      sourceText: text,
      isTranslating: true,
      error: null,
    });

    try {
      const result = await translateText(
        text,
        "auto", // Always use auto-detection for OCR
        targetLanguage
      );
      set({ translatedText: result, isTranslating: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Translation failed"),
        isTranslating: false,
        translatedText: "",
      });
    }
  },

  handleSwapLanguages: () => {
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
    if (!text) return;
    try {
      await Clipboard.setStringAsync(text);
      set({ [key]: true });
      // Reset after 2 seconds
      setTimeout(() => {
        set({ [key]: false });
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  },

  stopSpeech: async () => {
    const isSpeakingNow = await Speech.isSpeakingAsync();
    if (isSpeakingNow) {
      await Speech.stop();
      set({ isSpeaking: false });
    }
  },

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
        language:
          sourceLanguage === "auto"
            ? "en"
            : getLanguageCodeForSpeech(sourceLanguage),
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
        language: getLanguageCodeForSpeech(targetLanguage),
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

// Create debounced translateDetectedText function
export const debouncedTranslateDetectedText = debounce(
  (text: string) => useTranslateStore.getState().translateDetectedText(text),
  500
);
