// Speech.tsx
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { LANGUAGE_INFO } from "@/constant/languages";
import SwapButton from "@/components/home/SwapButton";
import { useRecordingTranslation } from "@/hooks/useRecordingTranslation";
import { useRecording } from "@/hooks/useRecording";
import LanguageSection from "@/components/home/LanguageSection";
import LanguageInfoModal from "@/components/home/LanguageInfoModal";
import Loading from "@/components/home/Loading";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import WikaTalkLogo from "@/components/WikaTalkLogo";
import useLanguageStore from "@/store/useLanguageStore";
import { globalStyles } from "@/styles/globalStyles";
const Speech = () => {
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

  // Handle text field updates based on user
  const handleTextfield = (translatedText: string, transcribedText: string) => {
    if (activeUser === 1) {
      setBothTexts(translatedText, transcribedText);
    } else {
      setBothTexts(transcribedText, translatedText);
    }
  };

  // Handle microphone press
  const handleMicPress = async (userNum: number) => {
    setActiveUser(userNum);

    if (recording) {
      const uri = await stopRecording();
      if (uri) {
        const sourceLang = userNum === 1 ? language1 : language2;
        const targetLang = userNum === 1 ? language2 : language1;

        const result = await translateAudio(uri, sourceLang, targetLang);
        if (result) {
          handleTextfield(result.translatedText, result.transcribedText);
          speakText(result.translatedText);
        }
      }
    } else {
      startRecording();
    }
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar style="light" />

      <SafeAreaView
        style={styles.safeAreaView}
        edges={["top", "left", "right"]}
      >
        {/* WikaSpeak */}
        <WikaTalkLogo title={"Speak"} />

        {/* Top section */}
        <LanguageSection
          position="top"
          handlePress={handleMicPress}
          recording={!!recording}
          userId={2}
        />

        {/* Middle Section - Exchange icon */}
        <View style={styles.middleSection}>
          <SwapButton
            onPress={swapLanguages}
            colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
            borderStyle={styles.swapButtonBorder}
            iconColor={BASE_COLORS.white}
          />
        </View>

        {/* Bottom section */}
        <LanguageSection
          position="bottom"
          handlePress={handleMicPress}
          recording={!!recording}
          userId={1}
        />

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
        {loading && <Loading />}
      </SafeAreaView>
    </View>
  );
};

export default Speech;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  middleSection: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 8,
    zIndex: 10,
  },
  swapButtonBorder: {
    borderWidth: 1,
  },
});
