import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import TranslateSection from "@/components/translate/TranslateSection";
import {
  useTranslateStore,
  debouncedTranslate,
} from "@/store/useTranslateStore";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { globalSpeechManager } from "@/utils/globalSpeechManager";
import { useFocusEffect } from "@react-navigation/native";

const Translate = () => {
  // stop ongoing speech
  useFocusEffect(
    React.useCallback(() => {
      console.log("[Translate] Tab focused, stopping all speech");
      globalSpeechManager.stopAllSpeech();

      return () => {
        console.log("[Translate] Tab losing focus");
        globalSpeechManager.stopAllSpeech();
      };
    }, [])
  );
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
  const insets = useSafeAreaInsets();
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
        <SafeAreaView
          edges={["left", "right"]}
          style={[dynamicStyles.container, { paddingTop: insets.top }]}
        >
          <View style={{ flex: 1 }}>
            <TranslateSection />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Translate;
