import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useRef } from "react";
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
import { saveTranslationHistory } from "@/utils/saveTranslationHistory";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Speech = () => {
  // Theme store
  const { activeTheme } = useThemeStore();
  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  // Get safe area insets
  const insets = useSafeAreaInsets();
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
    clearText,
    clearTranslationError,
  } = useLanguageStore();

  // Custom hooks
  const { recording, startRecording, stopRecording } = useRecording();
  const { loading, translateAudio, speakText } = useRecordingTranslation();

  // track which user is recording
  const [recordingUser, setRecordingUser] = useState<number | null>(null);
  // Track which section is being edited (top=false, bottom=true)
  const [isBottomActive, setIsBottomActive] = useState(false);
  // Track content position
  const contentPosition = useRef(new Animated.Value(0)).current;

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
    // Clear any previous error when starting a new recording
    clearTranslationError();
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
            await saveTranslationHistory({
              type: "Speech",
              fromLanguage: sourceLang,
              toLanguage: targetLang,
              originalText: result.transcribedText,
              translatedText: result.translatedText,
            });
          }
        }
      }
    } else {
      setRecordingUser(userNum); // Set which user is recording
      startRecording();
    }
  };

  // Listen for text input focus to track which section is active
  const handleTextAreaFocus = (position: "top" | "bottom") => {
    setIsBottomActive(position === "bottom");
  };

  // Track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // If bottom section is active, animate content up
        if (isBottomActive) {
          Animated.timing(contentPosition, {
            toValue: -200, // Move content up by 200 units when keyboard shows
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        // Animate content back to original position
        Animated.timing(contentPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [isBottomActive]);

  // clear text on component mount
  useEffect(() => {
    clearText("top");
    clearText("bottom");
    clearTranslationError(); // Clear any errors on component mount
  }, []);

  // Calculate keyboard offset based on platform and tab bar height
  const keyboardOffset =
    Platform.OS === "ios"
      ? 90 + insets.bottom // For iOS include the bottom inset
      : 0; // Android doesn't need this offset with height behavior

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[dynamicStyles.container]}
    >
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={keyboardOffset}
          enabled={true}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              { transform: [{ translateY: contentPosition }] },
            ]}
          >
            {/* Top section */}
            <LanguageSection
              position="top"
              handlePress={handleMicPress}
              recording={!!recording && recordingUser === 2}
              userId={2}
              onTextAreaFocus={handleTextAreaFocus}
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
              onTextAreaFocus={handleTextAreaFocus}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
  keyboardAvoidingView: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
  },
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
