import { useState, useCallback } from "react";
import axios from "axios";
import * as Speech from "expo-speech";
import useLanguageStore, {
  USER_FRIENDLY_MESSAGES,
} from "@/store/useLanguageStore";

interface TranslationResult {
  translatedText: string;
  transcribedText: string;
}

interface TranslationState {
  loading: boolean;
  error: Error | null;
  wasCancelled: boolean;
}

export const useRecordingTranslation = () => {
  const [state, setState] = useState<TranslationState>({
    loading: false,
    error: null,
    wasCancelled: false,
  });

  const { showTranslationError } = useLanguageStore();

  const translateAudio = useCallback(
    async (
      uri: string | undefined,
      srcLang: string,
      tgtLang: string,
      signal?: AbortSignal,
      duration?: number
    ): Promise<TranslationResult | null> => {
      const FILEUPLOAD_URL =
        process.env.EXPO_PUBLIC_NLP_TRANSLATE_AUDIO_API_URL;

      if (!FILEUPLOAD_URL || !uri) {
        const error = new Error("No file upload URL or recording URI found");
        setState({ loading: false, error, wasCancelled: false });
        showTranslationError();
        return null;
      }

      // Duration validation with user-friendly messages
      if (duration !== undefined) {
        if (duration < 2.0) {
          console.log(
            `[useRecordingTranslation] Audio too short: ${duration}s`
          );

          const error = new Error(USER_FRIENDLY_MESSAGES.RECORDING_TOO_SHORT);
          setState({ loading: false, error, wasCancelled: false });

          // NEW: Use the enhanced method to set user-friendly messages
          const { setUserFriendlyMessage } = useLanguageStore.getState();
          setUserFriendlyMessage(USER_FRIENDLY_MESSAGES.RECORDING_TOO_SHORT);

          return null;
        }

        if (duration > 30.0) {
          console.log(`[useRecordingTranslation] Audio too long: ${duration}s`);

          const error = new Error(USER_FRIENDLY_MESSAGES.RECORDING_TOO_LONG);
          setState({ loading: false, error, wasCancelled: false });

          const { setUserFriendlyMessage } = useLanguageStore.getState();
          setUserFriendlyMessage(USER_FRIENDLY_MESSAGES.RECORDING_TOO_LONG);

          return null;
        }
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
          signal,
        });

        // Check if request was cancelled after successful response
        if (signal?.aborted) {
          setState({ loading: false, error: null, wasCancelled: true });
          return null;
        }

        setState({ loading: false, error: null, wasCancelled: false });

        const translatedText = response?.data["translated_text"] || "";
        const transcribedText = response?.data["transcribed_text"] || "";

        // Check if we got meaningful results
        if (!transcribedText.trim() && !translatedText.trim()) {
          console.log(
            "[useRecordingTranslation] Empty response - likely silent audio"
          );

          const error = new Error(USER_FRIENDLY_MESSAGES.NO_SPEECH_DETECTED);
          setState({ loading: false, error, wasCancelled: false });

          const { setUserFriendlyMessage } = useLanguageStore.getState();
          setUserFriendlyMessage(USER_FRIENDLY_MESSAGES.NO_SPEECH_DETECTED);

          return null;
        }

        return {
          translatedText: response?.data["translated_text"] || "",
          transcribedText: response?.data["transcribed_text"] || "",
        };
      } catch (error: any) {
        // Enhanced cancellation detection
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

        // UPDATED: Enhanced error handling with user-friendly messages
        let userFriendlyMessage = USER_FRIENDLY_MESSAGES.GENERIC_ERROR;

        if (error.response?.status === 500) {
          if (duration && duration < 2) {
            userFriendlyMessage = USER_FRIENDLY_MESSAGES.RECORDING_TOO_SHORT;
          } else {
            userFriendlyMessage = USER_FRIENDLY_MESSAGES.SERVER_ERROR;
          }
        } else if (error.response?.status === 422) {
          userFriendlyMessage = USER_FRIENDLY_MESSAGES.INVALID_AUDIO;
        } else if (
          error.code === "ECONNABORTED" ||
          error.message.includes("timeout")
        ) {
          userFriendlyMessage = USER_FRIENDLY_MESSAGES.TIMEOUT_ERROR;
        }

        console.log("Error translating record: ", error);

        const friendlyError = new Error(userFriendlyMessage);
        setState({
          loading: false,
          error: friendlyError,
          wasCancelled: false,
        });

        // NEW: Use the enhanced method to set user-friendly messages
        const { setUserFriendlyMessage } = useLanguageStore.getState();
        setUserFriendlyMessage(userFriendlyMessage);

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
      }
    },
    []
  );

  return {
    loading: state.loading,
    error: state.error,
    wasCancelled: state.wasCancelled,
    translateAudio,
    speakText,
  };
};
