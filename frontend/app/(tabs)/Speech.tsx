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
import React, { useEffect, useState, useRef, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { LANGUAGE_INFO } from "@/constant/languages";
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
  const { loading, wasCancelled, translateAudio, speakText } =
    useRecordingTranslation();

  // NEW: State for tracking current translation controller
  const [currentTranslationController, setCurrentTranslationController] =
    useState<AbortController | null>(null);

  // track which user is recording
  const [recordingUser, setRecordingUser] = useState<number | null>(null);
  // Track which section is being edited (top=false, bottom=true)
  const [isBottomActive, setIsBottomActive] = useState(false);
  // Track content position
  const contentPosition = useRef(new Animated.Value(0)).current;

  // NEW: Simple animation refs - only fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationStartedRef = useRef(false);

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
      setRecordingUser(null);
      const uri = await stopRecording();
      if (uri) {
        const sourceLang = userNum === 1 ? language1 : language2;
        const targetLang = userNum === 1 ? language2 : language1;

        // NEW: Create abort controller for this translation
        const controller = new AbortController();
        setCurrentTranslationController(controller);

        try {
          const result = await translateAudio(
            uri,
            sourceLang,
            targetLang,
            controller.signal
          );

          // Check if the request was cancelled
          if (controller.signal.aborted || wasCancelled) {
            console.log("[Speech] Translation was cancelled by user");
            return; // Don't show error for user-initiated cancellation
          }

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
        } catch (error) {
          // Only show error if not cancelled by user
          if (!controller.signal.aborted && !wasCancelled) {
            console.error("[Speech] Translation error:", error);
            // Error will be handled by the hook's showTranslationError
          } else {
            console.log(
              "[Speech] Translation cancelled by user - no error shown"
            );
          }
        } finally {
          // Clear the controller
          setCurrentTranslationController(null);
        }
      }
    } else {
      setRecordingUser(userNum);
      startRecording();
    }
  };

  // NEW: Handle cancel translation
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

  // NEW: Optimized swap handler with callback to prevent re-renders
  const handleSwapLanguages = useCallback(() => {
    swapLanguages();
  }, [swapLanguages]);

  // NEW: Simple fade-in animation on component mount
  useEffect(() => {
    if (!animationStartedRef.current) {
      animationStartedRef.current = true;

      // Simple fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim]);

  // Track keyboard visibility - UNCHANGED
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

  // clear text on component mount - UNCHANGED
  useEffect(() => {
    clearText("top");
    clearText("bottom");
    clearTranslationError(); // Clear any errors on component mount
  }, []);

  // Calculate keyboard offset based on platform and tab bar height - UNCHANGED
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
          {/* NEW: Simple fade animation wrapper - no other changes */}
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim, // Only add fade animation
                transform: [{ translateY: contentPosition }], // Keep existing keyboard animation
              },
            ]}
          >
            {/* Top section - UNCHANGED */}
            <LanguageSection
              position="top"
              handlePress={handleMicPress}
              recording={!!recording && recordingUser === 2}
              userId={2}
              onTextAreaFocus={handleTextAreaFocus}
            />

            {/* Middle Section - Exchange icon - UNCHANGED except for callback */}
            <View style={styles.middleSection}>
              <SwapButton
                onPress={handleSwapLanguages}
                borderStyle={styles.swapButtonBorder}
              />
            </View>

            {/* Bottom section - UNCHANGED */}
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

      {/* Language Information Modal - UNCHANGED */}
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

      {/* UPDATED: Loading Indicator with Cancel Button */}
      {loading && <SpeechLoading onCancel={handleCancelTranslation} />}
    </SafeAreaView>
  );
};

export default Speech;

// Styles - COMPLETELY UNCHANGED
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
