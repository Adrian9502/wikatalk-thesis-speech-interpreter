import React, { useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "@/hooks/useTranslation";
import WikaTalkLogo from "@/components/WikaTalkLogo";
import TranslateSection from "@/components/translate/TranslateSection";
import { TITLE_COLORS } from "@/constant/colors";

const Translate = () => {
  const {
    state,
    updateState,
    debouncedTranslate,
    handleSwapLanguages,
    copyToClipboard,
    handleSourceSpeech,
    handleTranslatedSpeech,
  } = useTranslation();

  // Stop speech when changing languages
  useEffect(() => {
    const stopSpeech = async (): Promise<void> => {
      const isSpeakingNow = await Speech.isSpeakingAsync();
      if (isSpeakingNow) {
        await Speech.stop();
        updateState({ isSpeaking: false });
      }
    };

    stopSpeech();
  }, [state.sourceLanguage, state.targetLanguage]);

  // Trigger translation when inputs change
  useEffect(() => {
    if (state.sourceText.trim()) {
      debouncedTranslate();
    } else {
      updateState({ translatedText: "" });
    }

    return () => {
      debouncedTranslate.cancel();
    };
  }, [
    state.sourceText,
    state.sourceLanguage,
    state.targetLanguage,
    debouncedTranslate,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
    >
      <SafeAreaView style={styles.container}>
        <WikaTalkLogo title="Translate" />

        <TranslateSection
          sourceLanguage={state.sourceLanguage}
          targetLanguage={state.targetLanguage}
          sourceText={state.sourceText}
          translatedText={state.translatedText}
          openSource={state.openSource}
          openTarget={state.openTarget}
          copiedSource={state.copiedSource}
          copiedTarget={state.copiedTarget}
          isSpeaking={state.isSpeaking}
          isTranslating={state.isTranslating}
          error={state.error}
          updateState={updateState}
          handleSourceSpeech={handleSourceSpeech}
          handleTranslatedSpeech={handleTranslatedSpeech}
          copyToClipboard={copyToClipboard}
          handleSwapLanguages={handleSwapLanguages}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: TITLE_COLORS.customNavyBlue,
  },
});

export default Translate;
