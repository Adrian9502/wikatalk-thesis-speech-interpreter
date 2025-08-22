import { create } from "zustand";
import * as Clipboard from "expo-clipboard";
import { debounce } from "lodash";
import { translateText } from "@/lib/translationService";
import * as Speech from "expo-speech";
import { saveTranslationHistory } from "@/utils/saveTranslationHistory";
import { AppState } from "react-native";

// Constants
export const INITIAL_TEXT =
  "Tap the microphone icon to begin recording. Tap again to stop.";
export const ERROR_TEXT = "Translation failed. Please try again.";

// NEW: Add user-friendly message constants
export const USER_FRIENDLY_MESSAGES = {
  RECORDING_TOO_SHORT:
    "Recording too short. Please record for at least 2 seconds.",
  RECORDING_TOO_LONG: "Recording too long. Please keep it under 30 seconds.",
  NO_SPEECH_DETECTED: "No speech detected. Please speak clearly and try again.",
  SERVER_ERROR:
    "Server could not process the audio. Please speak clearly and try again.",
  INVALID_AUDIO: "Invalid audio format. Please try recording again.",
  TIMEOUT_ERROR:
    "Request timed out. Please check your connection and try again.",
  GENERIC_ERROR: "Translation failed. Please try again.",
};

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
  autoSpeechEnabled: boolean;

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
  translateOnLanguageChange: (
    text: string,
    position: "top" | "bottom",
    prevLang: string,
    newLang: string
  ) => Promise<void>;
  // NEW: Add the enhanced language change handler
  handleLanguageChange: (
    newLang: string,
    position: "top" | "bottom",
    prevLang: string
  ) => Promise<void>;
  debouncedTranslate: (text: string, position: "top" | "bottom") => void;
  speakText: (
    text: string,
    position: "top" | "bottom",
    autoTriggered?: boolean
  ) => Promise<void>;
  stopSpeech: () => Promise<void>;
  setTranslationError: (hasError: boolean) => void;
  showTranslationError: () => void;
  setUserFriendlyMessage: (lang: string) => void;
  clearTranslationError: () => void;
  setAutoSpeechEnabled: (enabled: boolean) => void;
};

const useLanguageStore = create<LanguageStore>((set, get) => {
  // NEW: App state change handler
  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === "background" || nextAppState === "inactive") {
      console.log(
        `[useLanguageStore] App state changed to ${nextAppState}, stopping speech`
      );
      get().stopSpeech();
    }
  };

  // NEW: Set up app state listener
  AppState.addEventListener("change", handleAppStateChange);

  return {
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
    autoSpeechEnabled: true,

    // Actions
    setLanguage1: (lang) => set({ language1: lang }),
    setLanguage2: (lang) => set({ language2: lang }),

    setUpperText: (text) => {
      // NEW: Stop speech if text is being cleared or changed significantly
      const currentState = get();
      if (currentState.isTopSpeaking && text !== currentState.upperTextfield) {
        console.log("[useLanguageStore] Upper text changed, stopping speech");
        get().stopSpeech();
      }

      set({
        upperTextfield: text,
        translationError: false,
      });
    },

    setBottomText: (text) => {
      // NEW: Stop speech if text is being cleared or changed significantly
      const currentState = get();
      if (
        currentState.isBottomSpeaking &&
        text !== currentState.bottomTextfield
      ) {
        console.log("[useLanguageStore] Bottom text changed, stopping speech");
        get().stopSpeech();
      }

      set({
        bottomTextfield: text,
        translationError: false,
      });
    },

    setBothTexts: (upper, bottom) => {
      // NEW: Stop any ongoing speech when both texts are set
      const currentState = get();
      if (currentState.isTopSpeaking || currentState.isBottomSpeaking) {
        console.log("[useLanguageStore] Both texts changed, stopping speech");
        get().stopSpeech();
      }

      set({
        upperTextfield: upper,
        bottomTextfield: bottom,
        translationError: false,
      });

      // NEW: Auto-speak the translated text based on active user
      if (
        get().autoSpeechEnabled &&
        upper &&
        bottom &&
        upper !== INITIAL_TEXT &&
        bottom !== INITIAL_TEXT
      ) {
        const { activeUser } = get();

        // If activeUser is 1 (bottom section was used), speak the top section (upper)
        // If activeUser is 2 (top section was used), speak the bottom section (bottom)
        if (activeUser === 1) {
          console.log(
            "[useLanguageStore] Auto-speaking translated text (top section)"
          );
          setTimeout(() => {
            get().speakText(upper, "top", true);
          }, 500);
        } else if (activeUser === 2) {
          console.log(
            "[useLanguageStore] Auto-speaking translated text (bottom section)"
          );
          setTimeout(() => {
            get().speakText(bottom, "bottom", true);
          }, 500);
        }
      }
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
      // NEW: Stop speech when clearing text
      const currentState = get();
      if (
        (section === "top" && currentState.isTopSpeaking) ||
        (section === "bottom" && currentState.isBottomSpeaking)
      ) {
        console.log(
          `[useLanguageStore] Clearing ${section} text, stopping speech`
        );
        get().stopSpeech();
      }

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

      // NEW: Stop speech before swapping
      get().stopSpeech();

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
        upperTextfield: INITIAL_TEXT,
        bottomTextfield: INITIAL_TEXT,
        isTranslating: false,
      });
    },

    setAutoSpeechEnabled: (enabled) => set({ autoSpeechEnabled: enabled }),

    // ENHANCED: Stop speech with better cleanup
    stopSpeech: async () => {
      try {
        if (await Speech.isSpeakingAsync()) {
          console.log("[useLanguageStore] Stopping ongoing speech");
          await Speech.stop();
        }
        set({ isTopSpeaking: false, isBottomSpeaking: false });
      } catch (error) {
        console.error("[useLanguageStore] Error stopping speech:", error);
        // Still update state even if stop fails
        set({ isTopSpeaking: false, isBottomSpeaking: false });
      }
      return Promise.resolve();
    },

    // ENHANCED: Speak text with better section management
    speakText: async (text, position, autoTriggered = false) => {
      if (!text || text === INITIAL_TEXT || text === ERROR_TEXT)
        return Promise.resolve();

      console.log(
        `[useLanguageStore] speakText called - position: ${position}, autoTriggered: ${autoTriggered}, text: "${text.substring(
          0,
          50
        )}..."`
      );

      // NEW: Always stop any ongoing speech first
      await get().stopSpeech();

      // Determine which section is speaking
      const isTop = position === "top";

      // NEW: Set speaking state BEFORE starting speech
      set({
        isTopSpeaking: isTop,
        isBottomSpeaking: !isTop,
      });

      return new Promise((resolve) => {
        Speech.speak(text, {
          language: "fil", // Default Filipino language code
          rate: 0.75,
          onDone: () => {
            console.log(`[useLanguageStore] Speech completed for ${position}`);
            set({ isTopSpeaking: false, isBottomSpeaking: false });
            resolve();
          },
          onError: (error) => {
            console.error(`[useLanguageStore] Speech error:`, error);
            set({ isTopSpeaking: false, isBottomSpeaking: false });
            resolve();
          },
          onStopped: () => {
            console.log(`[useLanguageStore] Speech stopped for ${position}`);
            set({ isTopSpeaking: false, isBottomSpeaking: false });
            resolve();
          },
        });
      });
    },

    // ENHANCED: Translation function with better auto-speech management
    translateEditedText: async (text, position) => {
      if (!text || text === INITIAL_TEXT || text === ERROR_TEXT) return;

      const srcLang = position === "top" ? get().language2 : get().language1;
      const tgtLang = position === "top" ? get().language1 : get().language2;

      set({ isTranslating: true, translationError: false });

      try {
        const translatedText = await translateText(text, srcLang, tgtLang);

        if (position === "top") {
          set({ bottomTextfield: translatedText });

          // NEW: Auto-speak translated text if enabled
          if (get().autoSpeechEnabled) {
            console.log(
              "[useLanguageStore] Auto-speaking translated text (bottom)"
            );
            setTimeout(() => {
              get().speakText(translatedText, "bottom", true);
            }, 500);
          }
        } else {
          set({ upperTextfield: translatedText });

          // NEW: Auto-speak translated text if enabled
          if (get().autoSpeechEnabled) {
            console.log(
              "[useLanguageStore] Auto-speaking translated text (top)"
            );
            setTimeout(() => {
              get().speakText(translatedText, "top", true);
            }, 500);
          }
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

    translateOnLanguageChange: async (text, position, prevLang, newLang) => {
      // Don't translate if text is empty or placeholder
      if (!text || text === INITIAL_TEXT || text === ERROR_TEXT) return;

      // Determine target language based on position
      const tgtLang = position === "top" ? get().language1 : get().language2;

      set({ isTranslating: true, translationError: false });

      try {
        // Translate the text from previous language to the new language
        const translatedText = await translateText(text, prevLang, newLang);

        // Update the appropriate text field
        if (position === "top") {
          set({ upperTextfield: translatedText });

          // NEW: Auto-speak translated text if enabled
          if (get().autoSpeechEnabled) {
            console.log(
              "[useLanguageStore] Auto-speaking translated text after language change (top)"
            );
            setTimeout(() => {
              get().speakText(translatedText, "top", true);
            }, 500);
          }
        } else {
          set({ bottomTextfield: translatedText });

          // NEW: Auto-speak translated text if enabled
          if (get().autoSpeechEnabled) {
            console.log(
              "[useLanguageStore] Auto-speaking translated text after language change (bottom)"
            );
            setTimeout(() => {
              get().speakText(translatedText, "bottom", true);
            }, 500);
          }
        }

        // Save this translation to history
        await saveTranslationHistory({
          type: "Speech",
          fromLanguage: prevLang,
          toLanguage: newLang,
          originalText: text,
          translatedText: translatedText,
        });
      } catch (error) {
        console.error("Translation error after language change:", error);
        get().showTranslationError();
      } finally {
        set({ isTranslating: false });
      }
    },

    // Debounced version to limit API calls
    debouncedTranslate: debounce((text, position) => {
      get().translateEditedText(text, position);
    }, 2000),

    setUserFriendlyMessage: (message: string) => {
      // NEW: Stop speech when setting error messages
      get().stopSpeech();

      set({
        upperTextfield: message,
        bottomTextfield: message,
        translationError: false,
        isTranslating: false,
      });
    },

    // Method to check if current text is a user-friendly message
    isUserFriendlyMessage: (text: string): boolean => {
      return Object.values(USER_FRIENDLY_MESSAGES).some(
        (message) => text.includes(message) || message.includes(text)
      );
    },

    // NEW: Enhanced function to handle language changes with bidirectional translation
    handleLanguageChange: async (
      newLang: string,
      position: "top" | "bottom",
      prevLang: string
    ) => {
      const { upperTextfield, bottomTextfield } = get();

      // Update the language first
      if (position === "top") {
        set({ language2: newLang });
      } else {
        set({ language1: newLang });
      }

      // Get current text fields
      const topText = upperTextfield;
      const bottomText = bottomTextfield;

      // Only proceed if the section being changed has actual content
      const textToTranslate = position === "top" ? topText : bottomText;

      if (textToTranslate && textToTranslate !== INITIAL_TEXT) {
        set({ isTranslating: true, translationError: false });

        try {
          // Translate only the text from the section where language was changed
          const translatedText = await translateText(
            textToTranslate,
            prevLang,
            newLang
          );

          // Update only the section where the language was changed
          if (position === "top") {
            set({ upperTextfield: translatedText });
          } else {
            set({ bottomTextfield: translatedText });
          }

          // Auto-speak only the section that was changed
          if (get().autoSpeechEnabled) {
            setTimeout(() => {
              console.log(
                `[useLanguageStore] Auto-speaking after ${position} language change`
              );
              get().speakText(translatedText, position, true);
            }, 500);
          }

          // Save to history
          await saveTranslationHistory({
            type: "Speech",
            fromLanguage: prevLang,
            toLanguage: newLang,
            originalText: textToTranslate,
            translatedText: translatedText,
          });
        } catch (error) {
          console.error("Language change translation error:", error);
          get().showTranslationError();
        } finally {
          set({ isTranslating: false });
        }
      }
    },
  };
});

export default useLanguageStore;
