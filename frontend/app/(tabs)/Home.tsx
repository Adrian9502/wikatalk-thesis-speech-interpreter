import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LANGUAGE_INFO } from "@/constant/languages";
import getLanguageBackground from "@/utils/getLanguageBackground";
import SwapButton from "@/components/SwapButton";
import { useRecordingTranslation } from "@/hooks/useRecordingTranslation";
import { useRecording } from "@/hooks/useRecording";
import LanguageSection from "@/components/home/LanguageSection";
import LanguageInfoModal from "@/components/home/LanguageInfoModal";
import Loading from "@/components/home/Loading";
import { TITLE_COLORS } from "@/theme/colors";
import WikaTalkLogo from "@/components/WikaTalkLogo";
const Home = () => {
  // Constants
  const initialText =
    "Tap the microphone icon to begin recording. Tap again to stop.";

  // Custom hooks
  const { recording, startRecording, stopRecording } = useRecording();
  const { loading, translateAudio, speakText } = useRecordingTranslation();

  // Language states
  const [language1, setLanguage1] = useState<string>("Tagalog");
  const [language2, setLanguage2] = useState<string>("Cebuano");

  // Text states
  const [upperTextfield, setUpperTextfield] = useState<string>(initialText);
  const [bottomTextfield, setBottomTextfield] = useState<string>(initialText);

  // UI states
  const [user, setUser] = useState<number>(1);
  const [showLanguageInfo, setShowLanguageInfo] = useState<boolean>(false);
  const [activeLanguageInfo, setActiveLanguageInfo] = useState<string>("");
  const [openTopDropdown, setOpenTopDropdown] = useState<boolean>(false);
  const [openBottomDropdown, setOpenBottomDropdown] = useState<boolean>(false);
  const [infoSection, setInfoSection] = useState<"top" | "bottom" | null>(null);

  // Close other dropdown when one opens
  useEffect(() => {
    if (openTopDropdown) setOpenBottomDropdown(false);
  }, [openTopDropdown]);

  useEffect(() => {
    if (openBottomDropdown) setOpenTopDropdown(false);
  }, [openBottomDropdown]);

  // Handle text field updates based on user
  const handleTextfield = (translatedText: string, transcribedText: string) => {
    if (user === 1) {
      setUpperTextfield(translatedText);
      setBottomTextfield(transcribedText);
    } else {
      setUpperTextfield(transcribedText);
      setBottomTextfield(translatedText);
    }
  };

  // Handle microphone press
  const handlePress = async (userNum: number) => {
    setUser(userNum);

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

  // UI helper functions
  const closeDropdowns = () => {
    setOpenTopDropdown(false);
    setOpenBottomDropdown(false);
    setShowLanguageInfo(false);
  };

  const showInfo = (language: string, section: "top" | "bottom") => {
    setActiveLanguageInfo(language);
    setInfoSection(section);
    setShowLanguageInfo(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  const clearText = (section: "top" | "bottom") => {
    section === "top" ? setUpperTextfield("") : setBottomTextfield("");
  };

  const handleSwapLanguage = () => {
    setLanguage1(language2);
    setLanguage2(language1);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView
        style={styles.safeAreaView}
        edges={["top", "left", "right"]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeDropdowns}
          style={styles.mainContainer}
        >
          <WikaTalkLogo title={"Speak"} />

          {/* Top section  */}
          <LanguageSection
            position="top"
            language={language2}
            setLanguage={setLanguage2}
            textField={upperTextfield}
            dropdownOpen={openTopDropdown}
            setDropdownOpen={setOpenTopDropdown}
            closeOtherDropdown={() => setOpenBottomDropdown(false)}
            getLanguageBackground={getLanguageBackground}
            showInfo={showInfo}
            copyToClipboard={copyToClipboard}
            clearText={clearText}
            handlePress={handlePress}
            recording={recording}
            userId={2}
          />

          {/* Middle Section - Exchange icon  */}
          <View style={styles.middleSection}>
            {/* Switch icon */}
            <SwapButton
              onPress={handleSwapLanguage}
              colors={["#0a0f28", "#0a0f28"]}
              borderStyle={styles.swapButtonBorder}
              iconColor={"#FFD700"}
            />
          </View>

          {/* Bottom section */}
          <LanguageSection
            position="bottom"
            language={language1}
            setLanguage={setLanguage1}
            textField={bottomTextfield}
            dropdownOpen={openBottomDropdown}
            setDropdownOpen={setOpenBottomDropdown}
            closeOtherDropdown={() => setOpenTopDropdown(false)}
            getLanguageBackground={getLanguageBackground}
            showInfo={showInfo}
            copyToClipboard={copyToClipboard}
            clearText={clearText}
            handlePress={handlePress}
            recording={recording}
            userId={1}
          />
        </TouchableOpacity>

        {/* Language Information Modal */}
        {showLanguageInfo &&
          activeLanguageInfo &&
          LANGUAGE_INFO[activeLanguageInfo] && (
            <LanguageInfoModal
              visible={showLanguageInfo}
              languageName={activeLanguageInfo}
              onClose={() => {
                setShowLanguageInfo(false);
                setInfoSection(null);
              }}
            />
          )}

        {/* Loading Indicator */}
        {loading && <Loading />}
      </SafeAreaView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TITLE_COLORS.customNavyBlue,
  },
  safeAreaView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  middleSection: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 8,
    zIndex: 10,
  },
  swapButtonBorder: {
    borderWidth: 2,
    borderColor: "#F6F6F6",
  },
});
