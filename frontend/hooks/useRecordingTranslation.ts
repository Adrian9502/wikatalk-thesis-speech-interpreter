import { useState, useCallback } from "react";
import axios from "axios";
import * as Speech from "expo-speech";
import useLanguageStore from "@/store/useLanguageStore";

interface TranslationResult {
  translatedText: string;
  transcribedText: string;
}

interface TranslationState {
  loading: boolean;
  error: Error | null;
}

export const useRecordingTranslation = () => {
  const [state, setState] = useState<TranslationState>({
    loading: false,
    error: null,
  });

  // Get the showTranslationError function from the language store
  const { showTranslationError } = useLanguageStore();

  const translateAudio = useCallback(
    async (
      uri: string | undefined,
      srcLang: string,
      tgtLang: string
    ): Promise<TranslationResult | null> => {
      const FILEUPLOAD_URL = process.env.EXPO_PUBLIC_NGROK_FILEUPLOAD_URL;

      if (!FILEUPLOAD_URL || !uri) {
        const error = new Error("No file upload URL or recording URI found");
        setState({ loading: false, error });
        showTranslationError(); // Show error in text area
        return null;
      }

      const formData = new FormData();
      const filetype = uri.split(".").pop();
      const filename = uri.split("/").pop();

      setState({ loading: true, error: null });

      formData.append("file", {
        uri: uri,
        type: `audio/${filetype}`,
        name: filename || `audio.${filetype}`,
      } as any);
      formData.append("tgtLang", tgtLang);
      formData.append("srcLang", srcLang);

      try {
        const response = await axios.post(FILEUPLOAD_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setState({ loading: false, error: null });

        return {
          translatedText: response?.data["translated_text"] || "",
          transcribedText: response?.data["transcribed_text"] || "",
        };
      } catch (error) {
        console.log("Error translating record: ", error);
        setState({
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        showTranslationError(); // Show error in text area
        return null;
      }
    },
    [showTranslationError]
  );

  const speakText = useCallback(
    (text: string, language: string = "fil-PH"): void => {
      try {
        Speech.speak(text, { language, rate: 0.75 });
      } catch (error) {
        console.error("Error speaking text:", error);
        // Handle speech errors here if needed
      }
    },
    []
  );

  return {
    loading: state.loading,
    error: state.error,
    translateAudio,
    speakText,
  };
};
