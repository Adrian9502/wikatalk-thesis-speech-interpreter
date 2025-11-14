import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constants/languages";
import { LanguageOption } from "@/types/types";
import QuickPhrases from "@/components/translate/QuickPhrases";
import { BASE_COLORS } from "@/constants/colors";
import {
  useTranslateStore,
  debouncedTranslate,
} from "@/store/useTranslateStore";
import SourceTextArea from "@/components/translate/SourceTextArea";
import TargetTextArea from "@/components/translate/TargetTextArea";
import { Repeat } from "react-native-feather";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { globalSpeechManager } from "@/utils/globalSpeechManager";
import { useFocusEffect } from "@react-navigation/native";
import {
  FONT_SIZES,
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
} from "@/constants/fontSizes";
import { TutorialTarget } from "@/components/tutorial/TutorialTarget";
import { useTutorial } from "@/context/TutorialContext";
import { TRANSLATE_TUTORIAL } from "@/constants/tutorials";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check if it's a small screen (like Nexus 4)
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280;

const Translate = () => {
  // Tutorial hook
  const { startTutorial, shouldShowTutorial } = useTutorial();

  useFocusEffect(
    React.useCallback(() => {
      console.log("[Translate] Tab focused, stopping all speech");
      globalSpeechManager.stopAllSpeech();

      // ENHANCED: Check tutorial status asynchronously
      const checkAndStartTutorial = async () => {
        try {
          const shouldShow = await shouldShowTutorial(
            TRANSLATE_TUTORIAL.id,
            TRANSLATE_TUTORIAL.version
          );
          if (shouldShow) {
            const timer = setTimeout(() => {
              startTutorial(TRANSLATE_TUTORIAL);
            }, 500);

            return () => {
              clearTimeout(timer);
              console.log("[Translate] Tab losing focus");
              globalSpeechManager.stopAllSpeech();
            };
          }
        } catch (error) {
          console.error("[Translate] Error checking tutorial status:", error);
        }
      };

      checkAndStartTutorial();

      return () => {
        console.log("[Translate] Tab losing focus");
        globalSpeechManager.stopAllSpeech();
      };
    }, [startTutorial, shouldShowTutorial])
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
    handleSwapLanguages,
  } = useTranslateStore();

  // TranslateSection states
  const [isSourceFocus, setIsSourceFocus] = useState(false);
  const [isTargetFocus, setIsTargetFocus] = useState(false);
  const [swapButtonAnimation] = useState(new Animated.Value(1));

  // Clear source text when the component mounts
  useEffect(() => {
    clearSourceText();
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

  // Animate swap button
  const animateSwapButton = () => {
    Animated.sequence([
      Animated.timing(swapButtonAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(swapButtonAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSwap = () => {
    animateSwapButton();
    handleSwapLanguages();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 0 : isSmallScreen ? -60 : -100
        }
      >
        <SafeAreaView
          edges={["left", "right"]}
          style={[
            dynamicStyles.container,
            {
              paddingTop: insets.top,
              paddingHorizontal: isSmallScreen ? 12 : 16,
            },
          ]}
        >
          <View
            style={{
              flex: 1,
              paddingBottom: isSmallScreen ? 8 : 16,
            }}
          >
            <View style={{ flex: 1 }}>
              {/* Language Selection Area */}
              <TutorialTarget id="translate-language-selection">
                <View style={styles.languageSelectionContainer}>
                  <View style={styles.dropdownContainer}>
                    <Dropdown
                      style={[
                        styles.dropdown,
                        {
                          borderColor: BASE_COLORS.borderColor,
                          backgroundColor: BASE_COLORS.lightBlue,
                        },
                        isSourceFocus && { borderColor: BASE_COLORS.blue },
                      ]}
                      itemTextStyle={{
                        fontSize: FONT_SIZES.lg,
                        fontFamily: POPPINS_FONT.regular,
                        color: BASE_COLORS.darkText,
                      }}
                      placeholderStyle={[
                        styles.dropdownText,
                        { color: BASE_COLORS.placeholderText },
                      ]}
                      selectedTextStyle={[
                        styles.dropdownText,
                        { color: BASE_COLORS.blue, borderRadius: 8 },
                      ]}
                      data={DIALECTS}
                      maxHeight={isSmallScreen ? 200 : 250}
                      labelField="label"
                      valueField="value"
                      placeholder="From"
                      value={sourceLanguage}
                      onFocus={() => {
                        setIsSourceFocus(true);
                        setIsTargetFocus(false);
                        updateState({ openSource: true, openTarget: false });
                      }}
                      onBlur={() => setIsSourceFocus(false)}
                      onChange={(item) => {
                        updateState({ sourceLanguage: item.value });
                        setIsSourceFocus(false);
                      }}
                      renderRightIcon={() => (
                        <Ionicons
                          name={isSourceFocus ? "chevron-up" : "chevron-down"}
                          size={isSmallScreen ? 16 : 18}
                          color={BASE_COLORS.blue}
                        />
                      )}
                      activeColor={BASE_COLORS.lightBlue}
                      containerStyle={styles.dropdownList}
                    />
                  </View>

                  {/* Language swap button */}
                  <Animated.View
                    style={[
                      styles.swapButtonContainer,
                      { transform: [{ scale: swapButtonAnimation }] },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={handleSwap}
                      style={styles.swapButton}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.swapGradient}
                      >
                        <Repeat
                          width={isSmallScreen ? 18 : 20}
                          height={isSmallScreen ? 18 : 20}
                          strokeWidth={2}
                          color={BASE_COLORS.white}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  <View style={styles.dropdownContainer}>
                    <Dropdown
                      style={[
                        styles.dropdown,
                        {
                          borderColor: BASE_COLORS.borderColor,
                          backgroundColor: BASE_COLORS.lightPink,
                        },
                        isTargetFocus && { borderColor: BASE_COLORS.orange },
                      ]}
                      itemTextStyle={{
                        fontSize: FONT_SIZES.lg,
                        fontFamily: POPPINS_FONT.regular,
                        color: BASE_COLORS.darkText,
                      }}
                      placeholderStyle={[
                        styles.dropdownText,
                        { color: BASE_COLORS.placeholderText },
                      ]}
                      selectedTextStyle={[
                        styles.dropdownText,
                        { color: BASE_COLORS.orange, borderRadius: 8 },
                      ]}
                      data={DIALECTS}
                      maxHeight={isSmallScreen ? 200 : 250}
                      labelField="label"
                      valueField="value"
                      placeholder="To"
                      value={targetLanguage}
                      onFocus={() => {
                        setIsTargetFocus(true);
                        setIsSourceFocus(false);
                        updateState({ openTarget: true, openSource: false });
                      }}
                      onBlur={() => setIsTargetFocus(false)}
                      onChange={(item) => {
                        updateState({ targetLanguage: item.value });
                        setIsTargetFocus(false);
                      }}
                      renderRightIcon={() => (
                        <Ionicons
                          name={isTargetFocus ? "chevron-up" : "chevron-down"}
                          size={isSmallScreen ? 16 : 18}
                          color={BASE_COLORS.orange}
                        />
                      )}
                      activeColor={BASE_COLORS.lightPink}
                      containerStyle={styles.dropdownList}
                    />
                  </View>
                </View>
              </TutorialTarget>

              {/* Quick Phrases */}
              <TutorialTarget id="translate-quick-phrases">
                <View style={styles.quickPhrasesContainer}>
                  <QuickPhrases
                    sourceLanguage={sourceLanguage as LanguageOption}
                    onSelectPhrase={(text) => updateState({ sourceText: text })}
                  />
                </View>
              </TutorialTarget>

              {/* Translation Area Container - FIXED: Remove flex styling from TutorialTarget, use wrapper */}
              <View style={styles.translationContainer}>
                {/* Source Text Area */}
                <View style={styles.textAreaWrapper}>
                  <TutorialTarget id="translate-source-area">
                    <SourceTextArea />
                  </TutorialTarget>
                </View>

                {/* Target Text Area */}
                <View style={styles.textAreaWrapper}>
                  <TutorialTarget id="translate-target-area">
                    <TargetTextArea />
                  </TutorialTarget>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  languageSelectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: isSmallScreen ? 12 : 16,
    zIndex: 1000,
    paddingHorizontal: isSmallScreen ? 2 : 0,
  },
  dropdownContainer: {
    width: isSmallScreen ? "41%" : "42%",
    zIndex: 2000,
  },
  dropdown: {
    borderRadius: isSmallScreen ? 18 : 20,
    borderWidth: 1,
    height: isSmallScreen ? 37 : 41,
    borderColor: BASE_COLORS.borderColor,
    paddingHorizontal: isSmallScreen ? 10 : 12,
  },
  dropdownList: {
    borderRadius: isSmallScreen ? 18 : 20,
    borderWidth: 1,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
    borderColor: BASE_COLORS.borderColor,
  },
  dropdownText: {
    fontSize: COMPONENT_FONT_SIZES.translation.language,
    fontFamily: POPPINS_FONT.regular,
  },
  swapButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  swapButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  swapGradient: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: isSmallScreen ? 18 : 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quickPhrasesContainer: {
    marginBottom: isSmallScreen ? 12 : 16,
    borderRadius: isSmallScreen ? 18 : 20,
    padding: isSmallScreen ? 8 : 10,
    overflow: "hidden",
    backgroundColor: "#e7edfd",
  },
  translationContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  // FIXED: New wrapper that provides the proper flex behavior
  textAreaWrapper: {
    flex: 1,
    // Ensure minimum height for tutorial highlighting
    minHeight: 150,
  },
});

export default Translate;
