import { create } from "zustand";
import axios from "axios";
import * as Speech from "expo-speech";
import { DIALECTS } from "@/constant/languages";
import { debounce } from "lodash";
import { pronunciationService } from "@/services/api";
// Define the types
interface TranslationEntry {
  translation: string;
  pronunciation: string;
}

interface Translations {
  [language: string]: TranslationEntry;
}

interface PronunciationDataItem {
  english: string;
  translations: Translations;
}

interface PronunciationItem {
  english: string;
  translation: string;
  pronunciation: string;
}

interface PronunciationData {
  [key: string]: PronunciationItem[];
}

interface PronunciationState {
  // State
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  pronunciationData: PronunciationDataItem[];
  transformedData: PronunciationData;
  currentPlayingIndex: number | null;
  isAudioLoading: boolean;

  // New properties for Word of Day feature
  wordOfTheDay: {
    english: string;
    translation: string;
    pronunciation: string;
    language: string;
  } | null;
  isWordOfDayPlaying: boolean;

  // Actions
  fetchPronunciations: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  getFilteredPronunciations: (
    language: string,
    page?: number,
    limit?: number
  ) => PronunciationItem[];
  playAudio: (index: number, text: string) => Promise<void>;
  stopAudio: () => Promise<void>;

  // New actions for Word of Day feature
  getWordOfTheDay: () => void;
  playWordOfDayAudio: () => Promise<void>;
}

export const usePronunciationStore = create<PronunciationState>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  searchTerm: "",
  pronunciationData: [],
  transformedData: {},
  currentPlayingIndex: null,
  isAudioLoading: false,
  wordOfTheDay: null,
  isWordOfDayPlaying: false,

  // Actions
  fetchPronunciations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await pronunciationService.getAllPronunciations();

      set({
        pronunciationData: data,
        transformedData: transformPronunciationData(data),
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Error fetching pronunciation data:", error);
      set({
        error: error?.message || "Failed to fetch pronunciation data",
        isLoading: false,
      });
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  getFilteredPronunciations: (language: string, page = 1, limit = 25) => {
    const { transformedData, searchTerm } = get();
    const languageData = transformedData[language] || [];
    const filtered = searchTerm.trim()
      ? languageData.filter((item) => {
          const lowercaseSearchTerm = searchTerm.toLowerCase();
          return (
            item.english.toLowerCase().includes(lowercaseSearchTerm) ||
            item.translation.toLowerCase().includes(lowercaseSearchTerm) ||
            item.pronunciation.toLowerCase().includes(lowercaseSearchTerm)
          );
        })
      : languageData;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filtered.slice(startIndex, endIndex);
  },

  getTotalCount: (language: string) => {
    const { transformedData, searchTerm } = get();
    const languageData = transformedData[language] || [];

    if (!searchTerm.trim()) return languageData.length;

    const filtered = languageData.filter((item) => {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      return (
        item.english.toLowerCase().includes(lowercaseSearchTerm) ||
        item.translation.toLowerCase().includes(lowercaseSearchTerm) ||
        item.pronunciation.toLowerCase().includes(lowercaseSearchTerm)
      );
    });

    return filtered.length;
  },

  playAudio: async (index, text) => {
    await get().stopAudio();

    set({ isAudioLoading: true, currentPlayingIndex: index });

    Speech.speak(text, {
      language: "fil",
      rate: 0.45,
      onStart: () => {
        set({ isAudioLoading: false });
      },
      onDone: () => {
        set({ currentPlayingIndex: null });
      },
      onError: () => {
        set({ isAudioLoading: false, currentPlayingIndex: null });
      },
    });
  },

  stopAudio: async () => {
    await Speech.stop();
    set({ currentPlayingIndex: null });
  },

  getWordOfTheDay: async () => {
    try {
      set({ isLoading: true, error: null });

      // Get word from API
      const response = await pronunciationService.getWordOfTheDay();

      if (response.success) {
        set({
          wordOfTheDay: {
            english: response.word.english,
            translation: response.word.translation,
            pronunciation: response.word.pronunciation,
            language: response.word.language,
          },
          isLoading: false,
        });
      } else {
        throw new Error("Failed to get word of the day");
      }
    } catch (error: any) {
      console.error("Error getting word of the day:", error);

      // Fallback to local generation if API fails
      const { pronunciationData } = get();
      if (pronunciationData.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * pronunciationData.length
        );
        const randomWord = pronunciationData[randomIndex];
        const languages = Object.keys(randomWord.translations);
        const randomLanguage =
          languages[Math.floor(Math.random() * languages.length)];
        const translationData = randomWord.translations[randomLanguage];
        const formattedLanguage =
          randomLanguage.charAt(0).toUpperCase() + randomLanguage.slice(1);

        set({
          wordOfTheDay: {
            english: randomWord.english,
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
            language: formattedLanguage,
          },
          isLoading: false,
          error: "Using local fallback: " + (error?.message || "Unknown error"),
        });
      } else {
        set({
          error: error?.message || "Failed to get word of the day",
          isLoading: false,
        });
      }
    }
  },

  playWordOfDayAudio: async () => {
    const { wordOfTheDay } = get();
    if (!wordOfTheDay) return;

    await get().stopAudio();

    set({ isWordOfDayPlaying: true, isAudioLoading: true });

    Speech.speak(wordOfTheDay.translation, {
      language: "fil",
      rate: 0.45,
      onStart: () => {
        set({ isAudioLoading: false });
      },
      onDone: () => {
        set({ isWordOfDayPlaying: false });
      },
      onError: () => {
        set({ isAudioLoading: false, isWordOfDayPlaying: false });
      },
    });
  },
}));

const transformPronunciationData = (
  data: PronunciationDataItem[]
): PronunciationData => {
  const result: PronunciationData = {};

  DIALECTS.forEach((dialect) => {
    result[dialect.value] = [];
  });

  const addedEntries: Record<string, Set<string>> = {};
  DIALECTS.forEach((dialect) => {
    addedEntries[dialect.value] = new Set();
  });

  data.forEach((item) => {
    Object.entries(item.translations).forEach(([language, translationData]) => {
      const dialectKey = language.charAt(0).toUpperCase() + language.slice(1);

      if (language === "bisaya") {
        if (result["Bisaya"] && !addedEntries["Bisaya"].has(item.english)) {
          result["Bisaya"].push({
            english: item.english,
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
          });
          addedEntries["Bisaya"].add(item.english);
        }

        if (result["Cebuano"] && !addedEntries["Cebuano"].has(item.english)) {
          result["Cebuano"].push({
            english: item.english,
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
          });
          addedEntries["Cebuano"].add(item.english);
        }
      } else if (
        language === "cebuano" &&
        result["Cebuano"] &&
        !addedEntries["Cebuano"].has(item.english)
      ) {
        result["Cebuano"].push({
          english: item.english,
          translation: translationData.translation,
          pronunciation: translationData.pronunciation,
        });
        addedEntries["Cebuano"].add(item.english);
      } else if (language === "tagalog") {
        if (result["Filipino"] && !addedEntries["Filipino"].has(item.english)) {
          result["Filipino"].push({
            english: item.english,
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
          });
          addedEntries["Filipino"].add(item.english);
        }

        if (result["Tagalog"] && !addedEntries["Tagalog"].has(item.english)) {
          result["Tagalog"].push({
            english: item.english,
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
          });
          addedEntries["Tagalog"].add(item.english);
        }
      } else {
        const standardKey = dialectKey;

        if (
          result[standardKey] &&
          !addedEntries[standardKey].has(item.english)
        ) {
          result[standardKey].push({
            english: item.english,
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
          });
          addedEntries[standardKey].add(item.english);
        }
      }
    });
  });

  return result;
};

export const debouncedSetSearchTerm = debounce(
  (term: string) => usePronunciationStore.getState().setSearchTerm(term),
  300
);
