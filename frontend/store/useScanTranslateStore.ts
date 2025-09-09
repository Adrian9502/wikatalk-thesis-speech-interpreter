import { create } from "zustand";
import { translateText } from "@/lib/translationService";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";
import { saveTranslationHistory } from "@/utils/saveTranslationHistory";

// Define types for the store
type PhilippineLanguage =
  | "Tagalog"
  | "Cebuano"
  | "Hiligaynon"
  | "Ilocano"
  | "Bicol"
  | "Waray"
  | "Pangasinan"
  | "Maguindanao"
  | "Kapampangan"
  | "Bisaya";

// Language code mapping
const LANGUAGE_CODES: Record<PhilippineLanguage, string> = {
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

// Define the store state interface
interface ScanTranslateState {
  targetLanguage: PhilippineLanguage;
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
  isSourceSpeaking: boolean; // Separate state for source text speaking
  isTargetSpeaking: boolean; // Separate state for translated text speaking
  copiedSource: boolean;
  copiedTarget: boolean;
  error: Error | null;
  debounceTimeout: NodeJS.Timeout | null;

  // Methods
  updateState: (newState: Partial<ScanTranslateState>) => void;
  translateDetectedText: (text: string, immediate?: boolean) => Promise<void>;
  resetSpeechStates: () => void;
  debouncedTranslateText: (text: string) => void;
  clearText: () => void;
  copyToClipboard: (
    text: string,
    key: "copiedSource" | "copiedTarget"
  ) => Promise<void>;
  handleSourceSpeech: (text: string) => Promise<void>; // Method for source text
  handleTargetSpeech: (text: string) => Promise<void>; // Method for translated text
  stopSpeech: () => Promise<void>;
}

export const useScanTranslateStore = create<ScanTranslateState>((set, get) => ({
  // Initial state
  targetLanguage: "Cebuano",
  sourceText: "",
  translatedText: "",
  isTranslating: false,
  isSourceSpeaking: false,
  isTargetSpeaking: false,
  copiedSource: false,
  copiedTarget: false,
  error: null,
  debounceTimeout: null,

  // Update state
  updateState: (newState) => set(newState),

  // Translate detected text
  translateDetectedText: async (text) => {
    if (!text?.trim()) {
      set({ sourceText: text, translatedText: "", isTranslating: false });
      return;
    }

    set({ sourceText: text, isTranslating: true, error: null });

    try {
      const translatedText = await translateText(
        text,
        "Auto",
        get().targetLanguage
      );
      set({ translatedText, isTranslating: false });

      // Save to history
      await saveTranslationHistory({
        type: "Scan",
        fromLanguage: "Auto Detect", // For auto-detected language
        toLanguage: get().targetLanguage,
        originalText: text,
        translatedText,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Translation failed"),
        isTranslating: false,
      });
    }
  },

  // reset speech states
  resetSpeechStates: () => {
    console.log("[ScanTranslateStore] Resetting speech states");
    set({
      isSourceSpeaking: false,
      isTargetSpeaking: false,
    });
  },

  // Debounced translation - called from UI
  debouncedTranslateText: (text) => {
    // Clear any existing timeout
    const currentTimeout = get().debounceTimeout;
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }

    // Update source text immediately but don't translate yet
    set({ sourceText: text });

    // Set a new timeout for translation
    const timeout = setTimeout(() => {
      get().translateDetectedText(text, true);
    }, 1000); // 1 second delay

    // Store the timeout ID
    set({ debounceTimeout: timeout });
  },

  // Clear text
  clearText: () => {
    const currentTimeout = get().debounceTimeout;
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }
    set({ sourceText: "", translatedText: "", debounceTimeout: null });
  },

  // Copy to clipboard
  copyToClipboard: async (text, key) => {
    if (!text) return;

    try {
      await Clipboard.setStringAsync(text);
      set({ [key]: true } as Pick<ScanTranslateState, typeof key>);

      // Reset copy indicator after 2 seconds
      setTimeout(
        () => set({ [key]: false } as Pick<ScanTranslateState, typeof key>),
        2000
      );
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  },

  // Text-to-speech for source text
  handleSourceSpeech: async (text) => {
    if (!text) return;

    const { isSourceSpeaking, stopSpeech } = get();

    if (isSourceSpeaking) {
      await stopSpeech();
      return;
    }

    // Stop any ongoing speech first
    await stopSpeech();

    set({ isSourceSpeaking: true });

    Speech.speak(text, {
      language: "fil", // Auto detect language for source text
      onDone: () => set({ isSourceSpeaking: false }),
      onError: () => set({ isSourceSpeaking: false }),
    });
  },

  // Text-to-speech for translated text
  handleTargetSpeech: async (text) => {
    if (!text) return;

    const { isTargetSpeaking, stopSpeech, targetLanguage } = get();

    if (isTargetSpeaking) {
      await stopSpeech();
      return;
    }

    // Stop any ongoing speech first
    await stopSpeech();

    set({ isTargetSpeaking: true });

    const languageCode = LANGUAGE_CODES[targetLanguage] || "fil";

    Speech.speak(text, {
      language: languageCode,
      onDone: () => set({ isTargetSpeaking: false }),
      onError: () => set({ isTargetSpeaking: false }),
    });
  },

  // Stop speech
  stopSpeech: async () => {
    if (await Speech.isSpeakingAsync()) {
      await Speech.stop();
      set({ isSourceSpeaking: false, isTargetSpeaking: false });
    }
  },
}));
