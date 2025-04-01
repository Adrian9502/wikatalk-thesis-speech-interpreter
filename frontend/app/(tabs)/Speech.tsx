import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LANGUAGE_INFO } from "@/constant/languages";
import SwapButton from "@/components/Speech/SwapButton";
import { useRecordingTranslation } from "@/hooks/useRecordingTranslation";
import { useRecording } from "@/hooks/useRecording";
import LanguageSection from "@/components/Speech/LanguageSection";
import LanguageInfoModal from "@/components/Speech/LanguageInfoModal";
import SpeechLoading from "@/components/Speech/SpeechLoading";
import useLanguageStore from "@/store/useLanguageStore";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import axios from "axios"; // Add this import

const Speech = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  // Zustand store
  const {
    language1,
    language2,
    activeUser,
    showLanguageInfo,
    activeLanguageInfo,
    swapLanguages,
    setActiveUser,
    setBothTexts,
    toggleLanguageInfo,
  } = useLanguageStore();

  // Custom hooks
  const { recording, startRecording, stopRecording } = useRecording();
  const { loading, translateAudio, speakText } = useRecordingTranslation();

  // track which user is recording
  const [recordingUser, setRecordingUser] = useState<number | null>(null);

  // Handle text field updates based on user
  const handleTextfield = (translatedText: string, transcribedText: string) => {
    if (activeUser === 1) {
      setBothTexts(translatedText, transcribedText);
    } else {
      setBothTexts(transcribedText, translatedText);
    }
  };

  // New function to save translation to history
  const saveToHistory = async (
    fromLang: string,
    toLang: string,
    originalText: string,
    translatedText: string
  ) => {
    try {
      const BACKEND_URL =
        process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";
      await axios.post(`${BACKEND_URL}/api/translations`, {
        type: "Speech",
        fromLanguage: fromLang,
        toLanguage: toLang,
        originalText,
        translatedText,
      });
      console.log("Translation saved to history");
    } catch (error) {
      console.error("Failed to save translation history:", error);
    }
  };

  // Handle microphone press
  const handleMicPress = async (userNum: number) => {
    setActiveUser(userNum);

    if (recording) {
      setRecordingUser(null); // Clear recording user when stopping
      const uri = await stopRecording();
      if (uri) {
        const sourceLang = userNum === 1 ? language1 : language2;
        const targetLang = userNum === 1 ? language2 : language1;

        const result = await translateAudio(uri, sourceLang, targetLang);
        if (result) {
          handleTextfield(result.translatedText, result.transcribedText);
          speakText(result.translatedText);

          // Save to history - only if we have actual text
          if (result.transcribedText && result.translatedText) {
            await saveToHistory(
              sourceLang,
              targetLang,
              result.transcribedText,
              result.translatedText
            );
          }
        }
      }
    } else {
      setRecordingUser(userNum); // Set which user is recording
      startRecording();
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[dynamicStyles.container]}
    >
      <StatusBar style="light" />

      <View style={{ flex: 1 }}>
        {/* Top section */}
        <LanguageSection
          position="top"
          handlePress={handleMicPress}
          recording={!!recording && recordingUser === 2}
          userId={2}
        />

        {/* Middle Section - Exchange icon */}
        <View style={styles.middleSection}>
          <SwapButton
            onPress={swapLanguages}
            borderStyle={styles.swapButtonBorder}
          />
        </View>

        {/* Bottom section */}
        <LanguageSection
          position="bottom"
          handlePress={handleMicPress}
          recording={!!recording && recordingUser === 1}
          userId={1}
        />
      </View>

      {/* Language Information Modal */}
      {showLanguageInfo &&
        activeLanguageInfo &&
        LANGUAGE_INFO[activeLanguageInfo] && (
          <LanguageInfoModal
            visible={showLanguageInfo}
            languageName={activeLanguageInfo}
            onClose={() => {
              toggleLanguageInfo(false);
            }}
          />
        )}

      {/* Loading Indicator */}
      {loading && <SpeechLoading />}
    </SafeAreaView>
  );
};

export default Speech;

const styles = StyleSheet.create({
  middleSection: {
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(90deg)",
    marginVertical: 8,
    zIndex: 10,
  },
  swapButtonBorder: {
    borderWidth: 1,
  },
});
