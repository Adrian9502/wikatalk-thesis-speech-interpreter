import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constant/languages";
import { LanguageOption } from "@/types/types";
import QuickPhrases from "@/components/Translate/QuickPhrases";
import { BASE_COLORS } from "@/constant/colors";
import { useTranslateStore } from "@/store/useTranslateStore";
import SourceTextArea from "@/components/Translate/SourceTextArea";
import TargetTextArea from "@/components/Translate/TargetTextArea";
import { Repeat } from "react-native-feather";

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

  return (
    <View style={{ paddingBottom: 16, flex: 1 }}>
      {/* Language Selection Area */}
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
            placeholderStyle={[
              styles.dropdownText,
              { color: BASE_COLORS.placeholderText },
            ]}
            selectedTextStyle={[
              styles.dropdownText,
              { color: BASE_COLORS.blue, borderRadius: 8 },
            ]}
            data={DIALECTS}
            maxHeight={250}
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
                size={18}
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
                width={20}
                height={20}
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
            placeholderStyle={[
              styles.dropdownText,
              { color: BASE_COLORS.placeholderText },
            ]}
            selectedTextStyle={[
              styles.dropdownText,
              { color: BASE_COLORS.orange, borderRadius: 8 },
            ]}
            data={DIALECTS}
            maxHeight={250}
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
                size={18}
                color={BASE_COLORS.orange}
              />
            )}
            activeColor={BASE_COLORS.lightPink}
            containerStyle={styles.dropdownList}
          />
        </View>
      </View>

      {/* Quick Phrases */}
      <View style={styles.quickPhrasesContainer}>
        <QuickPhrases
          sourceLanguage={sourceLanguage as LanguageOption}
          onSelectPhrase={(text) => updateState({ sourceText: text })}
        />
      </View>

      {/* Translation Area Container */}
      <View style={styles.translationContainer}>
        {/* Source Text Area */}
        <SourceTextArea />

        {/* Target Text Area */}
        <TargetTextArea />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  languageSelectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdownContainer: {
    width: "42%",
    zIndex: 2000,
  },
  dropdown: {
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    paddingHorizontal: 12,
  },
  dropdownList: {
    borderRadius: 8,
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
    fontSize: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quickPhrasesContainer: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 10,
    overflow: "hidden",
    backgroundColor: "#e7edfd",
  },
  translationContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
});

export default TranslateSection;
