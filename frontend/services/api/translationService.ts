import { authApi, api } from "./baseApi";

export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
  type: "Speech" | "Translate" | "Scan";
}

export interface TranslationResponse {
  success: boolean;
  translation: string;
  original: string;
  fromLanguage: string;
  toLanguage: string;
  _id?: string;
}

export interface HistoryItem {
  _id: string;
  original: string;
  translation: string;
  fromLanguage: string;
  toLanguage: string;
  type: string;
  createdAt: string;
}

export const translationService = {
  // Translate text
  translate: async (data: TranslationRequest) => {
    // This can work without authentication
    const response = await api.post<TranslationResponse>(
      "/api/translations",
      data
    );
    return response.data;
  },

  // Get translation history by type
  getHistory: async (type: string) => {
    const response = await authApi.get<{ history: HistoryItem[] }>(
      `/api/translations?type=${type}`
    );
    return response.data.history;
  },

  // Delete a translation from history
  deleteTranslation: async (id: string) => {
    const response = await authApi.delete(`/api/translations/${id}`);
    return response.data;
  },

  // Clear all history
  clearHistory: async () => {
    const response = await authApi.delete("/api/translations");
    return response.data;
  },
};
