import { useState, useCallback } from "react";
import { translateText } from "@/lib/translationService";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";
import debounce from "lodash/debounce";
import { Alert } from "react-native";
import { LanguageOption } from "@/types/types";

interface LanguageCodeMap {
  [key: string]: string;
}

export const useTranslation = (
  initialSourceLanguage: LanguageOption = "Tagalog",
  initialTargetLanguage: LanguageOption = "Cebuano"
) => {
  const [state, setState] = useState<{
    sourceText: string;
    translatedText: string;
    sourceLanguage: LanguageOption;
    targetLanguage: LanguageOption;
    isTranslating: boolean;
    error: string;
    copiedSource: boolean;
    copiedTarget: boolean;
    isSpeaking: boolean;
    openSource: boolean;
    openTarget: boolean;
  }>({
    sourceText: "",
    translatedText: "",
    sourceLanguage: initialSourceLanguage,
    targetLanguage: initialTargetLanguage,
    isTranslating: false,
    error: "",
    copiedSource: false,
    copiedTarget: false,
    isSpeaking: false,
    openSource: false,
    openTarget: false,
  });

  const updateState = useCallback((newState: any) => {
    setState((prev) => ({
      ...prev,
      ...newState,
    }));
  }, []);

  const handleTranslation = useCallback(async () => {
    if (!state.sourceText.trim()) {
      updateState({ translatedText: "", error: "" });
      return;
    }

    updateState({ isTranslating: true, error: "" });

    try {
      const translated = await translateText(
        state.sourceText,
        state.sourceLanguage,
        state.targetLanguage
      );
      updateState({ translatedText: translated });
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : "Translation failed",
      });
    } finally {
      updateState({ isTranslating: false });
    }
  }, [state.sourceText, state.sourceLanguage, state.targetLanguage]);

  const debouncedTranslate = useCallback(
    debounce(() => {
      if (state.sourceText.trim()) {
        handleTranslation();
      }
    }, 1000),
    [state.sourceText, state.sourceLanguage, state.targetLanguage]
  );

  // Handle language swap
  const handleSwapLanguages = (): void => {
    updateState({
      sourceLanguage: state.targetLanguage,
      targetLanguage: state.sourceLanguage,
      sourceText: state.translatedText,
      translatedText: state.sourceText,
    });
  };

  // Handle copy to clipboard
  const copyToClipboard = async (
    text: string,
    key: "copiedSource" | "copiedTarget"
  ) => {
    if (!text) return; // Prevent copying empty text

    try {
      Clipboard.setString(text);
      updateState({ [key]: true }); // Update copied state dynamically

      // Reset copied state after 2 seconds
      setTimeout(() => updateState({ [key]: false }), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  // Handle source speech
  const handleSourceSpeech = useCallback((): void => {
    handleSpeech(state.sourceText, state.sourceLanguage);
  }, [state.sourceText, state.sourceLanguage]);

  //  Handle translated speech
  const handleTranslatedSpeech = useCallback((): void => {
    handleSpeech(state.translatedText, state.targetLanguage);
  }, [state.translatedText, state.targetLanguage]);

  // Map language codes for Speech
  const getLanguageCodeForSpeech = (language: LanguageOption): string => {
    const languageMap: LanguageCodeMap = {
      Tagalog: "fil",
      Cebuano: "fil",
      Hiligaynon: "fil",
      Ilocano: "fil",
      Bicol: "fil",
      Waray: "fil",
      Pangasinan: "fil",
      Maguindanao: "fil",
      Kapampangan: "fil",
      Bisaya: "fil",
    };

    return languageMap[language] || "fil";
  };

  const handleSpeech = async (
    text: string,
    language: LanguageOption
  ): Promise<void> => {
    if (!text.trim()) return;

    try {
      const isSpeakingNow = await Speech.isSpeakingAsync();
      if (isSpeakingNow) {
        await Speech.stop();
        updateState({ isSpeaking: false }); // ✅ Use updateState
      }

      updateState({ isSpeaking: true }); // ✅ Use updateState
      const langCode = getLanguageCodeForSpeech(language);

      await Speech.speak(text, {
        language: langCode,
        rate: 0.8,
        pitch: 1.0,
        onDone: () => updateState({ isSpeaking: false }), // ✅ Use updateState
        onError: (error: Error) => {
          console.error("Speech error:", error);
          updateState({ isSpeaking: false }); // ✅ Use updateState
          Alert.alert(
            "Speech Error",
            "Unable to speak the text. Please try again."
          );
        },
      });
    } catch (error) {
      console.error("Speech error:", error);
      updateState({ isSpeaking: false }); // ✅ Use updateState
      Alert.alert("Error", "Failed to speak the text. Please try again.");
    }
  };

  // Add other methods like copyToClipboard, handleSpeech, etc.

  return {
    state,
    updateState,
    handleSpeech,
    handleTranslation,
    debouncedTranslate,
    handleSwapLanguages,
    copyToClipboard,
    handleSourceSpeech,
    handleTranslatedSpeech,
  };
};
