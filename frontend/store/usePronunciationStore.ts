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

type TransformedPronunciationData = PronunciationData;

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
): TransformedPronunciationData => {
  const transformed: TransformedPronunciationData = {};

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

        // CRITICAL FIX: Check for duplicates before adding
        const englishText = entry.english;
        const translationText = translationData.translation;

        // Check if this combination already exists
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

  console.log(
    "[PronunciationStore] Data transformation complete (after deduplication):"
  );
  Object.entries(transformed).forEach(
    ([lang, items]: [string, PronunciationItem[]]) => {
      console.log(`  ${lang}: ${items.length} items`);
    }
  );

  return transformed;
};

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

  // Check if cache is valid
  isCacheValid: () => {
    const { lastFetched, cacheExpiry, isDataCached } = get();
    const now = Date.now();
    const isValid = isDataCached && now - lastFetched < cacheExpiry;

    console.log("[PronunciationStore] Cache validity check:", {
      isDataCached,
      lastFetched: new Date(lastFetched).toISOString(),
      timeSinceLastFetch: `${((now - lastFetched) / 1000 / 60).toFixed(
        1
      )} minutes`,
      isValid,
    });

    return isValid;
  },

  // Clear cache
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

  // Fetch pronunciations with caching
  fetchPronunciations: async (forceRefresh = false) => {
    const { isCacheValid } = get();

    // Check cache validity first unless forced refresh
    if (!forceRefresh && isCacheValid()) {
      console.log("[PronunciationStore] Using cached pronunciation data");
      return;
    }

    console.log(
      forceRefresh
        ? "[PronunciationStore] Force refreshing pronunciation data"
        : "[PronunciationStore] Fetching fresh pronunciation data"
    );

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

      console.log(
        "[PronunciationStore] ✅ Pronunciation data fetched and cached successfully"
      );
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

  setSearchTerm: (term) => set({ searchTerm: term }),

  // NEW: Clear search method
  clearSearch: () => {
    console.log("[PronunciationStore] Clearing search");
    set({ searchTerm: "" });
  },

  // FIXED: Better language key lookup
  getFilteredPronunciations: (language: string, page = 1, limit = 25) => {
    const { transformedData, searchTerm } = get();

    // Try exact match first, then fallback to case-insensitive search
    let languageData = transformedData[language] || [];

    if (languageData.length === 0) {
      // Try case-insensitive lookup
      const languageKey = Object.keys(transformedData).find(
        (key) => key.toLowerCase() === language.toLowerCase()
      );
      if (languageKey) {
        languageData = transformedData[languageKey] || [];
      }
    }

    console.log("[PronunciationStore] Language data found:", {
      language,
      dataLength: languageData.length,
    });

    // ENHANCED: Stricter search like Help & FAQ
    const trimmedSearchTerm = searchTerm.trim();
    const filtered =
      trimmedSearchTerm.length === 0
        ? languageData // Return all data if no search term
        : languageData.filter((item) => {
            const lowercaseSearchTerm = trimmedSearchTerm.toLowerCase();

            // STRICTER MATCHING: More precise search
            const englishMatch = item.english
              .toLowerCase()
              .includes(lowercaseSearchTerm);
            const translationMatch = item.translation
              .toLowerCase()
              .includes(lowercaseSearchTerm);
            const pronunciationMatch = item.pronunciation
              .toLowerCase()
              .includes(lowercaseSearchTerm);

            // ENHANCED: Also check for word boundaries for stricter matching
            const englishWordMatch = item.english
              .toLowerCase()
              .split(" ")
              .some((word) => word.startsWith(lowercaseSearchTerm));
            const translationWordMatch = item.translation
              .toLowerCase()
              .split(" ")
              .some((word) => word.startsWith(lowercaseSearchTerm));

            // Return true if any match is found
            return (
              englishMatch ||
              translationMatch ||
              pronunciationMatch ||
              englishWordMatch ||
              translationWordMatch
            );
          });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const result = filtered.slice(startIndex, endIndex);

    return result;
  },

  // ENHANCED: Better total count logic
  getTotalCount: (language: string) => {
    const { transformedData, searchTerm } = get();

    // Try exact match first, then fallback to case-insensitive search
    let languageData = transformedData[language] || [];

    if (languageData.length === 0) {
      const languageKey = Object.keys(transformedData).find(
        (key) => key.toLowerCase() === language.toLowerCase()
      );
      if (languageKey) {
        languageData = transformedData[languageKey] || [];
      }
    }

    // FIXED: Better search term handling for count
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm.length === 0) return languageData.length;

    const filtered = languageData.filter((item) => {
      const lowercaseSearchTerm = trimmedSearchTerm.toLowerCase();
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
  console.log("[debouncedSetSearchTerm] Setting search term:", `"${term}"`);
  usePronunciationStore.getState().setSearchTerm(term);
}, 100); // REDUCED from 300ms to 100ms for much faster response
