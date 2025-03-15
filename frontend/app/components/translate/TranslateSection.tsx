import React, { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/app/constant/languages";
import { LanguageOption } from "@/app/types/types";
import QuickPhrases from "@/app/components/translate/QuickPhrases";
import { BASE_COLORS } from "@/app/constant/colors";
import DotsLoader from "@/app/components/DotLoader";
interface TranslateSectionProps {
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  openSource: boolean;
  openTarget: boolean;
  copiedSource: boolean;
  copiedTarget: boolean;
  isSpeaking: boolean;
  isTranslating: boolean;
  error: string | Error;
  updateState: (state: any) => void;
  handleSourceSpeech: () => void;
  handleTranslatedSpeech: () => void;
  copyToClipboard: (text: string, key: "copiedSource" | "copiedTarget") => void;
  handleSwapLanguages: () => void;
}

const TranslateSection: React.FC<TranslateSectionProps> = ({
  sourceLanguage,
  targetLanguage,
  sourceText,
  translatedText,
  copiedSource,
  copiedTarget,
  isSpeaking,
  isTranslating,
  error,
  updateState,
  handleSourceSpeech,
  handleTranslatedSpeech,
  copyToClipboard,
  handleSwapLanguages,
}) => {
  const [isSourceFocus, setIsSourceFocus] = useState(false);
  const [isTargetFocus, setIsTargetFocus] = useState(false);
  const [swapButtonAnimation] = useState(new Animated.Value(1));

  // Clear input
  const handleClearSourceText = () => {
    updateState({ sourceText: "" });
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
    <>
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
              <Ionicons
                name="swap-horizontal"
                size={20}
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
        <View style={styles.textSectionContainer}>
          <LinearGradient
            colors={[BASE_COLORS.lightBlue, BASE_COLORS.white]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />

          {/* Header Controls */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: BASE_COLORS.blue }]}>
              {sourceLanguage}
            </Text>

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleSourceSpeech()}
                disabled={!sourceText}
              >
                <Ionicons
                  name={isSpeaking ? "volume-high" : "volume-medium-outline"}
                  size={22}
                  color={isSpeaking ? BASE_COLORS.success : BASE_COLORS.blue}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => copyToClipboard(sourceText, "copiedSource")}
                disabled={!sourceText}
              >
                <Ionicons
                  name={copiedSource ? "checkmark-circle" : "copy-outline"}
                  size={22}
                  color={copiedSource ? BASE_COLORS.success : BASE_COLORS.blue}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleClearSourceText}
                disabled={!sourceText}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={BASE_COLORS.blue}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Text Input Area */}
          <View style={styles.textAreaWrapper}>
            <ScrollView
              style={[
                styles.textArea,
                { borderColor: BASE_COLORS.borderColor },
              ]}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <TextInput
                placeholder="Enter text to translate..."
                value={sourceText}
                onChangeText={(text) => updateState({ sourceText: text })}
                multiline
                style={[styles.textField, { color: BASE_COLORS.darkText }]}
                placeholderTextColor={BASE_COLORS.placeholderText}
                textAlignVertical="top"
              />
            </ScrollView>
          </View>
        </View>

        {/* Target Text Area */}
        <View style={styles.textSectionContainer}>
          <LinearGradient
            colors={[BASE_COLORS.lightPink, BASE_COLORS.white]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />

          {/* Header Controls */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: BASE_COLORS.orange }]}>
              {targetLanguage}
            </Text>

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleTranslatedSpeech()}
                disabled={!translatedText || isTranslating}
              >
                <Ionicons
                  name={isSpeaking ? "volume-high" : "volume-medium-outline"}
                  size={22}
                  color={isSpeaking ? BASE_COLORS.success : BASE_COLORS.orange}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => copyToClipboard(translatedText, "copiedTarget")}
                disabled={!translatedText || isTranslating}
              >
                <Ionicons
                  name={copiedTarget ? "checkmark-circle" : "copy-outline"}
                  size={22}
                  color={
                    copiedTarget ? BASE_COLORS.success : BASE_COLORS.orange
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Text Output Area */}
          <View style={styles.textAreaWrapper}>
            <ScrollView
              style={[
                styles.textArea,
                { borderColor: BASE_COLORS.borderColor },
              ]}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {isTranslating ? (
                <View style={styles.loadingContainer}>
                  <DotsLoader />
                </View>
              ) : error ? (
                <Text style={styles.errorText}>
                  {typeof error === "string"
                    ? error
                    : error.toString() || "An unknown error occurred"}
                </Text>
              ) : (
                <TextInput
                  value={translatedText}
                  multiline={true}
                  editable={false}
                  style={[styles.textField, { color: BASE_COLORS.darkText }]}
                  placeholder="Translation will appear here..."
                  placeholderTextColor={BASE_COLORS.placeholderText}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </>
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
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    paddingHorizontal: 12,
  },
  dropdownList: {
    borderRadius: 12,
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
    fontWeight: "500",
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
    borderRadius: 12,
    padding: 10,
    overflow: "hidden",
    backgroundColor: BASE_COLORS.lightBlue,
  },
  translationContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  textSectionContainer: {
    height: "49%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    position: "relative",
    padding: 20,
    marginBottom: 10,
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    zIndex: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginLeft: 8,
  },
  textAreaWrapper: {
    flex: 1,
    marginVertical: 8,
  },
  textArea: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  textField: {
    fontFamily: "Poppins-Regular",
    fontSize: 17,
    fontWeight: "400",
    flex: 1,
    lineHeight: 24,
    textAlignVertical: "top",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: BASE_COLORS.darkText,
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  errorText: {
    color: BASE_COLORS.orange,
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins-Regular",
  },
});

export default TranslateSection;
