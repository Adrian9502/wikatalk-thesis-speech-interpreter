import { GoogleGenerativeAI } from "@google/generative-ai";

// API KEY FROM ENV VARIABLES
const api_key = process.env.EXPO_PUBLIC_TRANSLATE_API_KEY;
if (!api_key) {
  throw new Error(
    "Missing EXPO_PUBLIC_TRANSLATE_API_KEY. Check your environment variables."
  );
}

const sys_instruct =
  "You are a professional translator specializing in Filipino languages. When asked to translate, always translate directly into the requested target language (never into English unless English is explicitly the target language). For Filipino languages like Tagalog, Cebuano, Hiligaynon, etc., provide authentic translations in those languages only. Never respond in English when another language is requested.";

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

    // More explicit prompt that emphasizes the target language
    const prompt = `Translate the following text DIRECTLY into ${targetLanguage} (not English): "${sourceText}"`;

    // For auto-detection, add more context
    const finalPrompt =
      sourceLanguage === "auto"
        ? `Translate this text DIRECTLY into ${targetLanguage} (not English). Do NOT include the detected language, explanations, or prefixes: "${sourceText}"`
        : prompt;

    const result = await model.generateContent(finalPrompt);
    console.log("Raw response:", result.response.text());

    // Clean up the response to remove any explanations
    let translation = result.response.text().trim();

    // Remove any prefixes like "In Tagalog:" or "Translation:"
    translation = translation
      .replace(
        /^(In|Into|Translated to|Translation to|Translation in|Translation into)\s+[^:]+:\s*/i,
        ""
      )
      .replace(/^Here('s| is) the [^:]+:\s*/i, "")
      .replace(/^Translation:\s*/i, "")
      .trim();

    return translation;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Translation failed");
  }
};
