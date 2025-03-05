import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import TranslateBottom from "@/components/translate/TranslateBottom";
import TranslateTop from "@/components/translate/TranslateTop";
import { useTranslation } from "@/hooks/useTranslation";

const Translate = () => {
  const {
    state,
    updateState,
    handleSpeech,
    debouncedTranslate,
    handleSwapLanguages,
    copyToClipboard,
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
      <ImageBackground
        source={require("@/assets/images/ph-flag-2.jpg")}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(0, 56, 168, 0.9)",
            "rgba(0, 0, 0, 0.7)",
            "rgba(206, 17, 38, 0.9)",
          ]}
          className="flex-1"
        >
          <SafeAreaView className="flex-1">
            <StatusBar style="light" />

            <View className="flex-1 relative mx-4 my-6 gap-4">
              <TranslateTop
                sourceLanguage={state.sourceLanguage}
                sourceText={state.sourceText}
                openSource={state.openSource}
                copiedSource={state.copiedSource}
                isSpeaking={state.isSpeaking}
                updateState={updateState}
                handleSourceSpeech={() =>
                  handleSpeech(state.sourceText, state.sourceLanguage)
                }
                copyToClipboard={copyToClipboard}
              />

              {/* Language swap button */}
              <TouchableOpacity
                className="w-16 h-16 rounded-full transform translate-x-8 -translate-y-8 absolute top-1/2 right-1/2 z-10 shadow-xl border-2 border-white/90 items-center justify-center"
                onPress={handleSwapLanguages}
              >
                <LinearGradient
                  colors={["#0038A8", "#CE1126"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="swap-vertical"
                    size={32}
                    color="#FFF"
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TranslateBottom
                targetLanguage={state.targetLanguage}
                translatedText={state.translatedText}
                openTarget={state.openTarget}
                copiedTarget={state.copiedTarget}
                isTranslating={state.isTranslating}
                error={state.error}
                isSpeaking={state.isSpeaking}
                updateState={updateState}
                handleTranslatedSpeech={() =>
                  handleSpeech(state.translatedText, state.targetLanguage)
                }
                copyToClipboard={copyToClipboard}
              />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};
export default Translate;
