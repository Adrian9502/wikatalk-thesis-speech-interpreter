// translationService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// API KEY FROM ENV VARIABLES
const api_key = process.env.EXPO_PUBLIC_TRANSLATE_API_KEY;
if (!api_key) {
  throw new Error(
    "Missing EXPO_PUBLIC_TRANSLATE_API_KEY. Check your environment variables."
  );
}
const sys_instruct =
  "You are a translator. Translate the phrases only. If you cannot provide a translation for that phrase. Just put a invisible space.";

const genAI = new GoogleGenerativeAI(api_key);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: sys_instruct,
});

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

    const prompt = `"Translate the phrase from ${sourceLanguage} to ${targetLanguage}: ${sourceText}"`;

    const result = await model.generateContent(prompt);
    console.log("Raw response:", result.response.text());

    return result.response.text().replace(prompt, "").trim();
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Translation failed");
  }
};
