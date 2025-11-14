import {
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  AppState,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useCallback } from "react";
import { LANGUAGE_INFO } from "@/constants/languages";
import SwapButton from "@/components/speech/SwapButton";
import { useRecordingTranslation } from "@/hooks/useRecordingTranslation";
import { useRecording } from "@/hooks/useRecording";
import LanguageSection from "@/components/speech/LanguageSection";
import LanguageInfoModal from "@/components/speech/LanguageInfoModal";
import SpeechLoading from "@/components/speech/SpeechLoading";
import useLanguageStore from "@/store/useLanguageStore";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { saveTranslationHistory } from "@/utils/saveTranslationHistory";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { globalSpeechManager } from "@/utils/globalSpeechManager";
import { useFocusEffect } from "@react-navigation/native";
import { Dimensions } from "react-native";
import { TutorialTarget } from "@/components/tutorial/TutorialTarget";
import { useTutorial } from "@/context/TutorialContext";
import { SPEECH_TUTORIAL } from "@/constants/tutorials";

const Speech = () => {
  // Tutorial hook - add shouldShowTutorial to destructuring
  const { startTutorial, shouldShowTutorial } = useTutorial();

  useFocusEffect(
    React.useCallback(() => {
      console.log("[Speech] Tab focused, stopping all speech");

      //  Defensive speech stopping
      const handleFocusCleanup = async () => {
        try {
          await globalSpeechManager.stopAllSpeech();
        } catch (error) {
          console.warn("[Speech] Non-critical speech stop error:", error);
        }
      };

      handleFocusCleanup();

      // Tutorial check logic...
      const checkAndStartTutorial = async () => {
        try {
          const shouldShow = await shouldShowTutorial(
            SPEECH_TUTORIAL.id,
            SPEECH_TUTORIAL.version
          );
          if (shouldShow) {
            const timer = setTimeout(() => {
              startTutorial(SPEECH_TUTORIAL);
            }, 500);
            return () => clearTimeout(timer);
          }
        } catch (error) {
          console.error("[Speech] Error checking tutorial status:", error);
        }
      };

      checkAndStartTutorial();

      return () => {
        console.log("[Speech] Tab losing focus");
        handleFocusCleanup();
      };
    }, [startTutorial, shouldShowTutorial])
  );

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
    stopSpeech,
  } = useLanguageStore();

  // Custom hooks
  const { recording, startRecording, stopRecording, recordingDuration } =
    useRecording();

  const { loading, wasCancelled, translateAudio } = useRecordingTranslation();

  // State for tracking current translation controller
  const [currentTranslationController, setCurrentTranslationController] =
    useState<AbortController | null>(null);

  // track which user is recording
  const [recordingUser, setRecordingUser] = useState<number | null>(null);
  // Track which section is being edited (top=false, bottom=true)
  const [isBottomActive, setIsBottomActive] = useState(false);

  // Handle text field updates based on user
  const handleTextfield = (translatedText: string, transcribedText: string) => {
    if (activeUser === 1) {
      setBothTexts(translatedText, transcribedText);
    } else {
      setBothTexts(transcribedText, translatedText);
    }
  };

  //  Handle microphone press with speech management
  const handleMicPress = async (userNum: number) => {
    //  Stop any ongoing speech when starting a new recording
    await stopSpeech();

    // Clear any previous messages when starting a new recording
    clearTranslationError();
    setActiveUser(userNum);

    if (recording) {
      setRecordingUser(null);
      const uri = await stopRecording();

      if (uri) {
        // Check duration after stopping and show user-friendly message
        if (recordingDuration < 2.0) {
          console.log(
            `[Speech] Recording too short: ${recordingDuration.toFixed(
              1
            )}s (minimum 2s required)`
          );

          //  Use the enhanced method to set user-friendly messages
          const { setUserFriendlyMessage } = useLanguageStore.getState();
          const message = `Recording too short (${recordingDuration.toFixed(
            1
          )}s). Please record for at least 2 seconds.`;
          setUserFriendlyMessage(message);

          return; // Don't proceed with translation
        }

        const sourceLang = userNum === 1 ? language1 : language2;
        const targetLang = userNum === 1 ? language2 : language1;

        // Create abort controller for this translation
        const controller = new AbortController();
        setCurrentTranslationController(controller);

        try {
          const result = await translateAudio(
            uri,
            sourceLang,
            targetLang,
            controller.signal,
            recordingDuration
          );

          // Check if the request was cancelled
          if (controller.signal.aborted || wasCancelled) {
            console.log("[Speech] Translation was cancelled by user");
            return;
          }

          if (result) {
            handleTextfield(result.translatedText, result.transcribedText);

            //  Auto-speech will be handled by the store automatically when setBothTexts is called
            console.log(
              "[Speech] Translation completed, auto-speech will be triggered by store"
            );

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
        } catch (error) {
          if (!controller.signal.aborted && !wasCancelled) {
            console.error("[Speech] Translation error:", error);
          } else {
            console.log(
              "[Speech] Translation cancelled by user - no error shown"
            );
          }
        } finally {
          setCurrentTranslationController(null);
        }
      }
    } else {
      setRecordingUser(userNum);
      startRecording();
    }
  };

  // Handle cancel translation
  const handleCancelTranslation = useCallback(() => {
    console.log("[Speech] User requested to cancel translation");

    if (currentTranslationController) {
      // Abort the current translation request
      currentTranslationController.abort();
      setCurrentTranslationController(null);
    }

    // Clear any error states - user cancelled intentionally
    clearTranslationError();

    console.log("[Speech] Translation cancelled by user request");
  }, [currentTranslationController, clearTranslationError]);

  // Listen for text input focus to track which section is active
  const handleTextAreaFocus = (position: "top" | "bottom") => {
    setIsBottomActive(position === "bottom");
  };

  // swap handler with callback to prevent re-renders
  const handleSwapLanguages = useCallback(() => {
    swapLanguages();
  }, [swapLanguages]);

  useEffect(() => {
    clearText("top");
    clearText("bottom");
    clearTranslationError();
  }, []);

  // Stop speech when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      console.log("[Speech] Component unmounting, stopping speech");
      stopSpeech();
    };
  }, [stopSpeech]);

  // Stop speech when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        console.log(
          `[Speech] App state changed to ${nextAppState}, stopping speech`
        );
        stopSpeech();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [stopSpeech]);

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[dynamicStyles.container, { paddingTop: insets.top }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          style={styles.contentContainer}
        >
          {/* Top section */}
          <TutorialTarget id="speech-top-section">
            <LanguageSection
              position="top"
              handlePress={handleMicPress}
              recording={!!recording && recordingUser === 2}
              userId={2}
              onTextAreaFocus={handleTextAreaFocus}
              recordingDuration={recordingDuration}
            />
          </TutorialTarget>

          {/* Middle Section - Exchange icon */}
          <View style={styles.middleSection}>
            <SwapButton
              onPress={handleSwapLanguages}
              borderStyle={styles.swapButtonBorder}
            />
          </View>

          {/* Bottom section */}
          <TutorialTarget id="speech-bottom-section">
            <LanguageSection
              position="bottom"
              handlePress={handleMicPress}
              recording={!!recording && recordingUser === 1}
              userId={1}
              onTextAreaFocus={handleTextAreaFocus}
              recordingDuration={recordingDuration}
            />
          </TutorialTarget>
        </ScrollView>
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

      {/* Loading Indicator with Cancel Button */}
      {loading && <SpeechLoading onCancel={handleCancelTranslation} />}
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
    marginVertical: Dimensions.get("window").height < 650 ? 4 : 8,
    zIndex: 10,
  },
  swapButtonBorder: {
    borderWidth: 1,
  },
});
