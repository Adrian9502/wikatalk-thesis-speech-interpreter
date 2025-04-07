import { create } from "zustand";
import * as Clipboard from "expo-clipboard";
import { debounce } from "lodash";
import { translateText } from "@/lib/translationService";
import * as Speech from "expo-speech";
import { saveTranslationHistory } from "@/utils/saveTranslationHistory";

// Constants
export const INITIAL_TEXT =
  "Tap the microphone icon to begin recording. Tap again to stop.";
export const ERROR_TEXT = "Translation failed. Please try again.";

type LanguageStore = {
  // State
  language1: string;
  language2: string;
  upperTextfield: string;
  bottomTextfield: string;
  activeUser: number;
  showLanguageInfo: boolean;
  activeLanguageInfo: string;
  openTopDropdown: boolean;
  openBottomDropdown: boolean;
  isTranslating: boolean;
  isTopSpeaking: boolean;
  isBottomSpeaking: boolean;
  translationError: boolean;

  // Actions
  setLanguage1: (lang: string) => void;
  setLanguage2: (lang: string) => void;
  setUpperText: (text: string) => void;
  setBottomText: (text: string) => void;
  setBothTexts: (upper: string, bottom: string) => void;
  setActiveUser: (userId: number) => void;
  toggleLanguageInfo: (isVisible: boolean) => void;
  setActiveLanguageInfo: (language: string) => void;
  toggleTopDropdown: (isOpen: boolean) => void;
  toggleBottomDropdown: (isOpen: boolean) => void;
  clearText: (section: "top" | "bottom") => void;
  swapLanguages: () => void;
  copyToClipboard: (text: string) => Promise<void>;
  showLanguageDetails: (language: string) => void;
  translateEditedText: (
    text: string,
    position: "top" | "bottom"
  ) => Promise<void>;
  debouncedTranslate: (text: string, position: "top" | "bottom") => void;
  speakText: (text: string, language: string) => Promise<void>;
  stopSpeech: () => Promise<void>;
  setTranslationError: (hasError: boolean) => void;
  showTranslationError: () => void;
  clearTranslationError: () => void;
};

const useLanguageStore = create<LanguageStore>((set, get) => ({
  // Initial state
  language1: "Tagalog",
  language2: "Cebuano",
  upperTextfield: INITIAL_TEXT,
  bottomTextfield: INITIAL_TEXT,
  activeUser: 1,
  showLanguageInfo: false,
  activeLanguageInfo: "",
  openTopDropdown: false,
  openBottomDropdown: false,
  isTranslating: false,
  isTopSpeaking: false,
  isBottomSpeaking: false,
  translationError: false,

  // Actions
  setLanguage1: (lang) => set({ language1: lang }),
  setLanguage2: (lang) => set({ language2: lang }),

  setUpperText: (text) => {
    // Don't update text if there's an error
    if (get().translationError) return;
    set({ upperTextfield: text });
  },

  setBottomText: (text) => {
    // Don't update text if there's an error
    if (get().translationError) return;
    set({ bottomTextfield: text });
  },

  setBothTexts: (upper, bottom) => {
    // Don't update text if there's an error
    if (get().translationError) return;
    set({ upperTextfield: upper, bottomTextfield: bottom });
  },

  setActiveUser: (userId) => set({ activeUser: userId }),

  toggleLanguageInfo: (isVisible) => set({ showLanguageInfo: isVisible }),

  setActiveLanguageInfo: (language) => set({ activeLanguageInfo: language }),

  toggleTopDropdown: (isOpen) =>
    set((state) => ({
      openTopDropdown: isOpen,
      openBottomDropdown: isOpen ? false : state.openBottomDropdown,
    })),

  toggleBottomDropdown: (isOpen) =>
    set((state) => ({
      openBottomDropdown: isOpen,
      openTopDropdown: isOpen ? false : state.openTopDropdown,
    })),

  clearText: (section) => {
    // Clear error state when clearing text
    set({ translationError: false });

    if (section === "top") {
      set({ upperTextfield: "" });
    } else {
      set({ bottomTextfield: "" });
    }
  },

  swapLanguages: () => {
    // Don't swap if there's an error
    if (get().translationError) return;

    set((state) => ({
      language1: state.language2,
      language2: state.language1,
      upperTextfield: state.bottomTextfield,
      bottomTextfield: state.upperTextfield,
    }));
  },

  copyToClipboard: async (text) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  },

  showLanguageDetails: (language) =>
    set({
      activeLanguageInfo: language,
      showLanguageInfo: true,
    }),

  // Error management
  setTranslationError: (hasError) => set({ translationError: hasError }),

  showTranslationError: () => {
    set({
      translationError: true,
      isTranslating: false,
    });
  },

  clearTranslationError: () => {
    set({
      translationError: false,
      // Reset text fields to empty when clearing error
      upperTextfield: "",
      bottomTextfield: "",
    });
  },

  // Stop any ongoing speech
  stopSpeech: async () => {
    if (await Speech.isSpeakingAsync()) {
      await Speech.stop();
      set({ isTopSpeaking: false, isBottomSpeaking: false });
    }
    return Promise.resolve();
  },

  // Speak text with TTS
  speakText: async (text, positionOrLanguage) => {
    if (!text || text === INITIAL_TEXT || text === ERROR_TEXT)
      return Promise.resolve();

    // Stop any ongoing speech first
    await get().stopSpeech();

    // Determine if this is a position or a language
    let isTop;
    if (positionOrLanguage === "top" || positionOrLanguage === "bottom") {
      isTop = positionOrLanguage === "top";
    } else {
      isTop = positionOrLanguage === get().language2;
    }

    set({
      isTopSpeaking: isTop,
      isBottomSpeaking: !isTop,
    });

    return new Promise((resolve) => {
      Speech.speak(text, {
        language: "fil", // Default Filipino language code
        rate: 0.75,
        onDone: () => {
          set({ isTopSpeaking: false, isBottomSpeaking: false });
          resolve();
        },
        onError: () => {
          set({ isTopSpeaking: false, isBottomSpeaking: false });
          resolve();
        },
      });
    });
  },

  // Translation function for edited text
  translateEditedText: async (text, position) => {
    if (!text || text === INITIAL_TEXT || text === ERROR_TEXT) return;

    const srcLang = position === "top" ? get().language2 : get().language1;
    const tgtLang = position === "top" ? get().language1 : get().language2;

    set({ isTranslating: true, translationError: false });

    try {
      const translatedText = await translateText(text, srcLang, tgtLang);

      if (position === "top") {
        set({ bottomTextfield: translatedText });
        // Auto-speak bottom text when editing top text
        await get().speakText(translatedText, get().language1);
      } else {
        set({ upperTextfield: translatedText });
        // Auto-speak top text when editing bottom text
        await get().speakText(translatedText, get().language2);
      }

      // Save the edited translation to history
      await saveTranslationHistory({
        type: "Speech",
        fromLanguage: srcLang,
        toLanguage: tgtLang,
        originalText: text,
        translatedText: translatedText,
      });
    } catch (error) {
      console.error("Translation error:", error);
      get().showTranslationError();
    } finally {
      set({ isTranslating: false });
    }
  },

  // Debounced version to limit API calls
  debouncedTranslate: debounce((text, position) => {
    get().translateEditedText(text, position);
  }, 2000),
}));

export default useLanguageStore;
