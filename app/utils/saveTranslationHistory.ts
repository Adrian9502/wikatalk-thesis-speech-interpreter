import createAuthenticatedApi from "@/lib/api";

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

    await api.post("/api/translations", item);

    console.log(`${item.type} translation saved to history:`);
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
