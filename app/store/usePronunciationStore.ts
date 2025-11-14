import { create } from "zustand";
import * as Speech from "expo-speech";
import { debounce } from "lodash";
import { pronunciationService } from "@/services/api";

interface PronunciationDataItem {
  english: string;
  translations: {
    [language: string]: {
      translation: string;
      pronunciation: string;
    };
  };
}

interface PronunciationItem {
  english: string;
  translation: string;
  pronunciation: string;
}

interface PronunciationData {
  [language: string]: PronunciationItem[];
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

  // Cache management
  lastFetched: number;
  cacheExpiry: number;
  isDataCached: boolean;

  // Word of Day feature
  wordOfTheDay: {
    english: string;
    translation: string;
    pronunciation: string;
    language: string;
  } | null;
  isWordOfDayPlaying: boolean;

  // Actions
  fetchPronunciations: (forceRefresh?: boolean) => Promise<void>;
  setSearchTerm: (term: string) => void;
  getFilteredPronunciations: (
    language: string,
    page?: number,
    limit?: number
  ) => PronunciationItem[];
  getTotalCount: (language: string) => number;
  playAudio: (index: number, text: string) => Promise<void>;
  stopAudio: () => Promise<void>;
  getWordOfTheDay: () => void;
  playWordOfDay: () => void;
  clearCache: () => void;
  isCacheValid: () => boolean;
  clearSearch: () => void;
}

const transformPronunciationData = (
  data: PronunciationDataItem[]
): PronunciationData => {
  const transformed: PronunciationData = {};

  data.forEach((entry: PronunciationDataItem) => {
    Object.entries(entry.translations).forEach(
      ([language, translationData]: [
        string,
        { translation: string; pronunciation: string }
      ]) => {
        const capitalizedLanguage =
          language.charAt(0).toUpperCase() + language.slice(1);

        if (!transformed[capitalizedLanguage]) {
          transformed[capitalizedLanguage] = [];
        }

        const englishText = entry.english;
        const translationText = translationData.translation;

        const isDuplicate = transformed[capitalizedLanguage].some(
          (item: PronunciationItem) =>
            item.english === englishText && item.translation === translationText
        );

        if (!isDuplicate) {
          transformed[capitalizedLanguage].push({
            english: englishText,
            translation: translationText,
            pronunciation: translationData.pronunciation,
          });
        }
      }
    );
  });

  return transformed;
};

// FIXED: Create store without subscribeWithSelector first, then add it
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

  // Cache state
  lastFetched: 0,
  cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  isDataCached: false,

  isCacheValid: () => {
    const { lastFetched, cacheExpiry, isDataCached } = get();
    const now = Date.now();
    const isValid = isDataCached && now - lastFetched < cacheExpiry;
    return isValid;
  },

  clearCache: () => {
    console.log("[PronunciationStore] Clearing cache");
    set({
      pronunciationData: [],
      transformedData: {},
      lastFetched: 0,
      isDataCached: false,
      error: null,
    });
  },

  fetchPronunciations: async (forceRefresh = false) => {
    const { isCacheValid } = get();

    if (!forceRefresh && isCacheValid()) {
      console.log("[PronunciationStore] Using cached pronunciation data");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await pronunciationService.getAllPronunciations();

      set({
        pronunciationData: data,
        transformedData: transformPronunciationData(data),
        isLoading: false,
        lastFetched: Date.now(),
        isDataCached: true,
        error: null,
      });
    } catch (error: any) {
      console.error(
        "[PronunciationStore] Error fetching pronunciation data:",
        error
      );
      set({
        error: error?.message || "Failed to fetch pronunciation data",
        isLoading: false,
      });
    }
  },

  setSearchTerm: (term: string) => set({ searchTerm: term }),

  clearSearch: () => {
    console.log("[PronunciationStore] Clearing search");
    set({ searchTerm: "" });
  },

  getFilteredPronunciations: (language: string, page = 1, limit = 25) => {
    const { transformedData, searchTerm } = get();
    let languageData = transformedData[language] || [];

    if (languageData.length === 0) {
      const languageKey = Object.keys(transformedData).find(
        (key) => key.toLowerCase() === language.toLowerCase()
      );
      if (languageKey) {
        languageData = transformedData[languageKey] || [];
      }
    }

    const trimmedSearchTerm = searchTerm.trim();
    const filtered =
      trimmedSearchTerm.length === 0
        ? languageData
        : languageData.filter((item: PronunciationItem) => {
            const lowercaseSearchTerm = trimmedSearchTerm.toLowerCase();
            return (
              item.english.toLowerCase().includes(lowercaseSearchTerm) ||
              item.translation.toLowerCase().includes(lowercaseSearchTerm) ||
              item.pronunciation.toLowerCase().includes(lowercaseSearchTerm)
            );
          });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const result = filtered.slice(startIndex, endIndex);

    return result;
  },

  getTotalCount: (language: string) => {
    const { transformedData, searchTerm } = get();
    let languageData = transformedData[language] || [];

    if (languageData.length === 0) {
      const languageKey = Object.keys(transformedData).find(
        (key) => key.toLowerCase() === language.toLowerCase()
      );
      if (languageKey) {
        languageData = transformedData[languageKey] || [];
      }
    }

    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm.length === 0) return languageData.length;

    const filtered = languageData.filter((item: PronunciationItem) => {
      const lowercaseSearchTerm = trimmedSearchTerm.toLowerCase();
      return (
        item.english.toLowerCase().includes(lowercaseSearchTerm) ||
        item.translation.toLowerCase().includes(lowercaseSearchTerm) ||
        item.pronunciation.toLowerCase().includes(lowercaseSearchTerm)
      );
    });

    return filtered.length;
  },

  playAudio: async (index: number, text: string) => {
    // Stop any current audio first
    await get().stopAudio();

    // FIXED: Force state update immediately with object replacement
    set(() => ({
      currentPlayingIndex: index,
      isAudioLoading: true,
    }));

    // Force a second update to ensure React sees the change
    setTimeout(() => {
      set((state) => ({
        ...state,
        currentPlayingIndex: index,
        isAudioLoading: true,
      }));
    }, 0);

    Speech.speak(text, {
      language: "fil",
      rate: 0.35,
      onStart: () => {
        console.log(`[PronunciationStore] Audio started for index ${index}`);
        set(() => ({
          currentPlayingIndex: index,
          isAudioLoading: false,
        }));
      },
      onDone: () => {
        console.log(`[PronunciationStore] Audio completed for index ${index}`);
        set(() => ({
          currentPlayingIndex: null,
          isAudioLoading: false,
        }));
      },
      onError: (error) => {
        console.error(
          `[PronunciationStore] Audio error for index ${index}:`,
          error
        );
        set(() => ({
          currentPlayingIndex: null,
          isAudioLoading: false,
        }));
      },
    });
  },

  stopAudio: async () => {
    console.log("[PronunciationStore] Stopping audio");
    try {
      await Speech.stop();
      set(() => ({
        currentPlayingIndex: null,
        isAudioLoading: false,
      }));
    } catch (error) {
      console.error("[PronunciationStore] Error stopping audio:", error);
      // Still reset state even if stop fails
      set(() => ({
        currentPlayingIndex: null,
        isAudioLoading: false,
      }));
    }
  },

  getWordOfTheDay: async () => {
    try {
      set({ isLoading: true, error: null });

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

      const { transformedData } = get();
      const languages = Object.keys(transformedData);
      if (languages.length > 0) {
        const randomLanguage =
          languages[Math.floor(Math.random() * languages.length)];
        const wordsForLanguage = transformedData[randomLanguage];
        if (wordsForLanguage.length > 0) {
          const randomWord =
            wordsForLanguage[
              Math.floor(Math.random() * wordsForLanguage.length)
            ];
          set({
            wordOfTheDay: {
              english: randomWord.english,
              translation: randomWord.translation,
              pronunciation: randomWord.pronunciation,
              language: randomLanguage,
            },
            isLoading: false,
          });
        }
      } else {
        set({
          error: "Failed to get word of the day",
          isLoading: false,
        });
      }
    }
  },

  playWordOfDay: async () => {
    const { wordOfTheDay } = get();
    if (!wordOfTheDay) return;

    set({ isWordOfDayPlaying: true });
    try {
      await Speech.speak(wordOfTheDay.translation, {
        language: "fil",
        rate: 0.45,
        onDone: () => set({ isWordOfDayPlaying: false }),
        onError: () => set({ isWordOfDayPlaying: false }),
      });
    } catch (error) {
      set({ isWordOfDayPlaying: false });
    }
  },
}));

// ENHANCED: Much faster debounce for local search + instant empty search
export const debouncedSetSearchTerm = debounce((term: string) => {
  usePronunciationStore.getState().setSearchTerm(term);
}, 100); // REDUCED from 300ms to 100ms for much faster response
