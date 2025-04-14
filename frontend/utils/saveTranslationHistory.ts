import createAuthenticatedApi from "@/lib/api";
import { getToken } from "@/lib/authTokenManager";

export interface TranslationHistoryItem {
  type: "Speech" | "Translate" | "Scan";
  fromLanguage: string;
  toLanguage: string;
  originalText: string;
  translatedText: string;
}

export const saveTranslationHistory = async (
  item: TranslationHistoryItem
): Promise<boolean> => {
  try {
    const api = createAuthenticatedApi();

    // Debug logging
    console.log("Saving translation with token:", getToken());

    const response = await api.post("/api/translations", item);

    console.log(`${item.type} translation saved to history:`, response.data);
    return true;
  } catch (error: any) {
    console.error(
      `Failed to save ${item.type} translation history:`,
      error.response?.status,
      error.response?.data || error.message
    );
    return false;
  }
};
