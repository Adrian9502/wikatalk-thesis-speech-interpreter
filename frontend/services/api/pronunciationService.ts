import { authApi } from "./baseApi";

export interface PronunciationData {
  _id: string;
  english: string;
  translation: string;
  language: string;
  audioUrl: string;
  tags: string[];
  category: string;
}

export interface WordOfTheDayResponse {
  success: boolean;
  word: PronunciationData;
}

export const pronunciationService = {
  // Get all pronunciations
  getAllPronunciations: async () => {
    const response = await authApi.get<{ pronunciations: PronunciationData[] }>(
      "/api/pronunciations"
    );
    return response.data.pronunciations;
  },

  // Get pronunciations by language
  getByLanguage: async (language: string) => {
    const response = await authApi.get<{ pronunciations: PronunciationData[] }>(
      `/api/pronunciations/language/${language}`
    );
    return response.data.pronunciations;
  },

  // Get pronunciations by category
  getByCategory: async (category: string) => {
    const response = await authApi.get<{ pronunciations: PronunciationData[] }>(
      `/api/pronunciations/category/${category}`
    );
    return response.data.pronunciations;
  },

  // Get word of the day
  getWordOfTheDay: async () => {
    const response = await authApi.get<WordOfTheDayResponse>(
      "/api/pronunciations/word-of-day"
    );
    return response.data;
  },
};
