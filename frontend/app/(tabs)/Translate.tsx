import React, { useEffect } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WikaTalkLogo from "@/components/WikaTalkLogo";
import TranslateSection from "@/components/Translate/TranslateSection";
import { TITLE_COLORS } from "@/constant/colors";
import { globalStyles } from "@/styles/globalStyles";
import {
  useTranslateStore,
  debouncedTranslate,
} from "@/store/useTranslateStore";

const Translate = () => {
  const {
    sourceText,
    sourceLanguage,
    targetLanguage,
    stopSpeech,
    updateState,
  } = useTranslateStore();

  // Stop speech when changing languages
  useEffect(() => {
    stopSpeech();
  }, [sourceLanguage, targetLanguage, stopSpeech]);

  // Trigger translation when inputs change
  useEffect(() => {
    if (sourceText.trim()) {
      debouncedTranslate();
    } else {
      updateState({ translatedText: "" });
    }

    return () => {
      debouncedTranslate.cancel();
    };
  }, [sourceText, sourceLanguage, targetLanguage, updateState]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
    >
      <SafeAreaView style={globalStyles.container}>
        <WikaTalkLogo title="Translate" />
        <TranslateSection />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Translate;
