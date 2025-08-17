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
  wasCancelled: boolean; // NEW: Track if user cancelled
}

export const useRecordingTranslation = () => {
  const [state, setState] = useState<TranslationState>({
    loading: false,
    error: null,
    wasCancelled: false, // NEW: Initialize cancelled state
  });

  const { showTranslationError } = useLanguageStore();

  const translateAudio = useCallback(
    async (
      uri: string | undefined,
      srcLang: string,
      tgtLang: string,
      signal?: AbortSignal // NEW: Add AbortSignal parameter
    ): Promise<TranslationResult | null> => {
      const FILEUPLOAD_URL =
        process.env.EXPO_PUBLIC_NLP_TRANSLATE_AUDIO_API_URL;

      if (!FILEUPLOAD_URL || !uri) {
        const error = new Error("No file upload URL or recording URI found");
        setState({ loading: false, error, wasCancelled: false });
        showTranslationError(); // Show error in text area
        return null;
      }

      const formData = new FormData();
      const filetype = uri.split(".").pop();
      const filename = uri.split("/").pop();

      setState({ loading: true, error: null, wasCancelled: false });

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
          signal, // NEW: Pass the abort signal to axios
        });

        // Check if request was cancelled after successful response
        if (signal?.aborted) {
          setState({ loading: false, error: null, wasCancelled: true });
          return null;
        }

        setState({ loading: false, error: null, wasCancelled: false });

        return {
          translatedText: response?.data["translated_text"] || "",
          transcribedText: response?.data["transcribed_text"] || "",
        };
      } catch (error: any) {
        // NEW: Enhanced cancellation detection
        const isCancelled =
          signal?.aborted ||
          error.name === "CancelledError" ||
          error.code === "ERR_CANCELED" ||
          axios.isCancel(error);

        if (isCancelled) {
          console.log(
            "[useRecordingTranslation] Translation was cancelled by user"
          );
          setState({ loading: false, error: null, wasCancelled: true });
          return null;
        }

        console.log("Error translating record: ", error);
        setState({
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
          wasCancelled: false,
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
    wasCancelled: state.wasCancelled, // NEW: Expose cancelled state
    translateAudio,
    speakText,
  };
};
