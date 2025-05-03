import { create } from "zustand";
import axios from "axios";
import * as Speech from "expo-speech";
import { DIALECTS } from "@/constant/languages";
import { debounce } from "lodash";

// Define the API URL
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

  // Actions
  fetchPronunciations: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  // Fix this line to add the missing parameters with their default values
  getFilteredPronunciations: (
    language: string,
    page?: number,
    limit?: number
  ) => PronunciationItem[];
  playAudio: (index: number, text: string) => Promise<void>;
  stopAudio: () => Promise<void>;
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

  // Actions
  fetchPronunciations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/pronunciations`);
      const data = response.data;

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

  // Update the getFilteredPronunciations method
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
      : languageData; // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit; // Return paginated results
    return filtered.slice(startIndex, endIndex);
  },

  // Add a method to get the total count (useful for pagination)
  getTotalCount: (language: string) => {
    const { transformedData, searchTerm } = get();
    const languageData = transformedData[language] || [];

    // Count after filtering
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
    // Stop any already playing audio
    await get().stopAudio();

    set({ isAudioLoading: true, currentPlayingIndex: index });

    Speech.speak(text, {
      language: "fil", // Filipino language code
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
}));

// Helper function to transform the API data into the format needed by the UI
const transformPronunciationData = (
  data: PronunciationDataItem[]
): PronunciationData => {
  const result: PronunciationData = {};

  // Initialize empty arrays for each dialect
  DIALECTS.forEach((dialect) => {
    result[dialect.value] = [];
  });

  // Track entries we've already added to each dialect to prevent duplicates
  const addedEntries: Record<string, Set<string>> = {};
  DIALECTS.forEach((dialect) => {
    addedEntries[dialect.value] = new Set();
  });

  // Process each phrase
  data.forEach((item) => {
    // For each language, create a pronunciation item
    Object.entries(item.translations).forEach(([language, translationData]) => {
      const dialectKey = language.charAt(0).toUpperCase() + language.slice(1);

      // Special handling for all dialects
      if (language === "bisaya") {
        // Add to Bisaya category if it exists and not already added
        if (result["Bisaya"] && !addedEntries["Bisaya"].has(item.english)) {
          result["Bisaya"].push({
            english: item.english,
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
          });
          addedEntries["Bisaya"].add(item.english);
        }

        // Also add to Cebuano since they're the same (if not already added)
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
        // Add Tagalog data to Filipino category if not already added
        if (result["Filipino"] && !addedEntries["Filipino"].has(item.english)) {
          result["Filipino"].push({
            english: item.english,
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
          });
          addedEntries["Filipino"].add(item.english);
        }

        // Also add to a Tagalog category if it exists and not already added
        if (result["Tagalog"] && !addedEntries["Tagalog"].has(item.english)) {
          result["Tagalog"].push({
            english: item.english,
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
          });
          addedEntries["Tagalog"].add(item.english);
        }
      } else {
        // Add the phrase to the appropriate language array if not already added
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
  300 // 300ms debounce time
);
