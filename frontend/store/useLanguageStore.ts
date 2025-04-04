import { create } from "zustand";
import * as Clipboard from "expo-clipboard";

// Constants
export const INITIAL_TEXT =
  "Tap the microphone icon to begin recording. Tap again to stop.";

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
};

const useLanguageStore = create<LanguageStore>((set) => ({
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

  // Actions
  setLanguage1: (lang) => set({ language1: lang }),
  setLanguage2: (lang) => set({ language2: lang }),
  setUpperText: (text) => set({ upperTextfield: text }),
  setBottomText: (text) => set({ bottomTextfield: text }),
  setBothTexts: (upper, bottom) =>
    set({ upperTextfield: upper, bottomTextfield: bottom }),
  setActiveUser: (userId) => set({ activeUser: userId }),
  toggleLanguageInfo: (isVisible) => set({ showLanguageInfo: isVisible }),
  setActiveLanguageInfo: (language) => set({ activeLanguageInfo: language }),

  toggleTopDropdown: (isOpen) =>
    set((state) => ({
      openTopDropdown: isOpen,
      // Close bottom dropdown when top opens
      openBottomDropdown: isOpen ? false : state.openBottomDropdown,
    })),

  toggleBottomDropdown: (isOpen) =>
    set((state) => ({
      openBottomDropdown: isOpen,
      // Close top dropdown when bottom opens
      openTopDropdown: isOpen ? false : state.openTopDropdown,
    })),

  clearText: (section) =>
    set((state) => {
      if (section === "top") {
        return { upperTextfield: "" };
      } else {
        return { bottomTextfield: "" };
      }
    }),

  swapLanguages: () =>
    set((state) => ({
      language1: state.language2,
      language2: state.language1,
      upperTextfield: state.bottomTextfield,
      bottomTextfield: state.upperTextfield,
    })),

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
}));

export default useLanguageStore;
