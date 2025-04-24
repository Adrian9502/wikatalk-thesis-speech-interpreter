import axios from "axios";

// Get the API URL from environment variables
const TRANSLATE_TEXT_URL = process.env.EXPO_PUBLIC_NLP_TRANSLATE_TEXT_API_URL;

if (!TRANSLATE_TEXT_URL) {
  throw new Error(
    "Missing EXPO_PUBLIC_NLP_TRANSLATE_TEXT_API_URL. Check your environment variables."
  );
}

export const translateText = async (
  sourceText: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  if (!sourceText.trim()) return "";

  if (sourceLanguage === targetLanguage) return sourceText;

  try {
    console.log(
      `Translating from ${sourceLanguage} to ${targetLanguage}: "${sourceText}"`
    );

    // Send the text as a query parameter as specified in the API docs
    const response = await axios.post(
      `${TRANSLATE_TEXT_URL}?text=${encodeURIComponent(sourceText)}`,
      {
        srcLang: sourceLanguage === "auto" ? "detect" : sourceLanguage,
        tgtLang: targetLanguage,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Extract the translation
    const translatedText =
      typeof response?.data === "string"
        ? response.data
        : response?.data?.translated_text || "";

    console.log("Translation success:", translatedText);
    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);

    // Add more detailed error logging
    if (axios.isAxiosError(error)) {
      console.error("Request details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: TRANSLATE_TEXT_URL,
      });
    }
    throw new Error("Translation failed");
  }
};
