import { authApi } from "./baseApi";

export interface PronunciationDataItem {
  english: string;
  translations: {
    [language: string]: {
      translation: string;
      pronunciation: string;
    };
  };
}

export interface WordOfTheDayResponse {
  success: boolean;
  word: PronunciationDataItem;
}

export const pronunciationService = {
  getAllPronunciations: async (): Promise<PronunciationDataItem[]> => {
    const response = await authApi.get<PronunciationDataItem[]>(
      "/api/pronunciations"
    );
    return response.data;
  },

  // Get word of the day
  getWordOfTheDay: async () => {
    const response = await authApi.get<WordOfTheDayResponse>(
      "/api/pronunciations/word-of-day"
    );
    return response.data;
  },
};
