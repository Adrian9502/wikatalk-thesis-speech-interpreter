import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constant/languages";
import { LanguageOption } from "@/types/types";
import QuickPhrases from "@/components/translate/QuickPhrases";
import { BASE_COLORS } from "@/constant/colors";
import { useTranslateStore } from "@/store/useTranslateStore";
import SourceTextArea from "@/components/translate/SourceTextArea";
import TargetTextArea from "@/components/translate/TargetTextArea";
import { Repeat } from "react-native-feather";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check if it's a small screen (like Nexus 4)
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280;

const TranslateSection = () => {
  const { sourceLanguage, targetLanguage, updateState, handleSwapLanguages } =
    useTranslateStore();

  const [isSourceFocus, setIsSourceFocus] = useState(false);
  const [isTargetFocus, setIsTargetFocus] = useState(false);
  const [swapButtonAnimation] = useState(new Animated.Value(1));

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

  const responsiveStyles = getResponsiveStyles();

  return (
    <View style={{ flex: 1 }}>
      {/* Language Selection Area */}
      <View style={responsiveStyles.languageSelectionContainer}>
        <View style={responsiveStyles.dropdownContainer}>
          <Dropdown
            style={[
              responsiveStyles.dropdown,
              {
                borderColor: BASE_COLORS.borderColor,
                backgroundColor: BASE_COLORS.lightBlue,
              },
              isSourceFocus && { borderColor: BASE_COLORS.blue },
            ]}
            placeholderStyle={[
              responsiveStyles.dropdownText,
              { color: BASE_COLORS.placeholderText },
            ]}
            selectedTextStyle={[
              responsiveStyles.dropdownText,
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
            containerStyle={responsiveStyles.dropdownList}
          />
        </View>

        {/* Language swap button */}
        <Animated.View
          style={[
            responsiveStyles.swapButtonContainer,
            { transform: [{ scale: swapButtonAnimation }] },
          ]}
        >
          <TouchableOpacity
            onPress={handleSwap}
            style={responsiveStyles.swapButton}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={responsiveStyles.swapGradient}
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

        <View style={responsiveStyles.dropdownContainer}>
          <Dropdown
            style={[
              responsiveStyles.dropdown,
              {
                borderColor: BASE_COLORS.borderColor,
                backgroundColor: BASE_COLORS.lightPink,
              },
              isTargetFocus && { borderColor: BASE_COLORS.orange },
            ]}
            placeholderStyle={[
              responsiveStyles.dropdownText,
              { color: BASE_COLORS.placeholderText },
            ]}
            selectedTextStyle={[
              responsiveStyles.dropdownText,
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
            containerStyle={responsiveStyles.dropdownList}
          />
        </View>
      </View>

      {/* Quick Phrases */}
      <View style={responsiveStyles.quickPhrasesContainer}>
        <QuickPhrases
          sourceLanguage={sourceLanguage as LanguageOption}
          onSelectPhrase={(text) => updateState({ sourceText: text })}
        />
      </View>

      {/* Translation Area Container */}
      <View style={responsiveStyles.translationContainer}>
        {/* Source Text Area */}
        <SourceTextArea />

        {/* Target Text Area */}
        <TargetTextArea />
      </View>
    </View>
  );
};

const getResponsiveStyles = () => {
  return StyleSheet.create({
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
      height: isSmallScreen ? 42 : 46,
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
      borderColor: BASE_COLORS.borderColor,
    },
    dropdownText: {
      fontSize: isSmallScreen ? 13 : 14,
      fontFamily: "Poppins-Regular",
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
  });
};

export default TranslateSection;
