import React, { useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TranslateSection from "@/components/translate/TranslateSection";
import {
  useTranslateStore,
  debouncedTranslate,
} from "@/store/useTranslateStore";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";

const Translate = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  const {
    sourceText,
    sourceLanguage,
    targetLanguage,
    stopSpeech,
    updateState,
    clearSourceText,
  } = useTranslateStore();

  // NEW: Simple animation refs - only fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationStartedRef = useRef(false);

  // Clear source text when the component mounts
  useEffect(() => {
    clearSourceText(); // You were missing the parentheses here
  }, []);

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

  // Handle dismissing the keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
      >
        <SafeAreaView style={dynamicStyles.container}>
          {/* NEW: Simple fade animation wrapper - no other changes */}
          <Animated.View
            style={[
              { flex: 1 },
              {
                opacity: fadeAnim, // Only add fade animation
              },
            ]}
          >
            <TranslateSection />
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Translate;
