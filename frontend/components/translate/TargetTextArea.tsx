import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS } from "@/constant/colors";
import { useTranslateStore } from "@/store/useTranslateStore";
import DotsLoader from "@/components/DotLoader";
import { textAreaStyles } from "@/styles/translate/textArea.styles";
import ConfidenceModal from "@/components/ConfidenceModal";

const TargetTextArea = () => {
  const {
    targetLanguage,
    translatedText,
    copiedTarget,
    isTargetSpeaking,
    isTranslating,
    error,
    handleTranslatedSpeech,
    copyToClipboard,
  } = useTranslateStore();
  const [confidenceModalVisible, setConfidenceModalVisible] = useState(false);
  const handleShowConfidence = () => {
    setConfidenceModalVisible(true);
  };
  // Handler to prevent editing for non-editable fields
  const handleChangeText = (newText: string) => {
    // For non-editable, do nothing - text won't change
  };

  // Prevent keyboard from showing for non-editable fields
  const handleFocus = (e: any) => {
    e.target.blur();
  };

  return (
    <View style={textAreaStyles.textSectionContainer}>
      <LinearGradient
        colors={[BASE_COLORS.lightPink, BASE_COLORS.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={textAreaStyles.gradientBackground}
      />

      {/* Header Controls */}
      <View style={textAreaStyles.sectionHeader}>
        <Text
          style={[textAreaStyles.sectionTitle, { color: BASE_COLORS.orange }]}
        >
          {targetLanguage}
        </Text>

        <View style={textAreaStyles.controls}>
          <TouchableOpacity
            style={[
              textAreaStyles.controlButton,
              isTargetSpeaking && textAreaStyles.controlButtonActive,
            ]}
            onPress={handleTranslatedSpeech}
            disabled={!translatedText || isTranslating}
          >
            <Ionicons
              name={isTargetSpeaking ? "volume-high" : "volume-medium-outline"}
              size={20}
              color={
                isTargetSpeaking ? BASE_COLORS.success : BASE_COLORS.orange
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={textAreaStyles.controlButton}
            onPress={handleShowConfidence}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={BASE_COLORS.orange}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={textAreaStyles.controlButton}
            onPress={() => copyToClipboard(translatedText, "copiedTarget")}
            disabled={!translatedText || isTranslating}
          >
            <Ionicons
              name={copiedTarget ? "checkmark-circle" : "copy-outline"}
              size={20}
              color={copiedTarget ? BASE_COLORS.success : BASE_COLORS.orange}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Text Output Area */}
      <View style={textAreaStyles.textAreaWrapper}>
        {isTranslating ? (
          <View style={textAreaStyles.loadingContainer}>
            <DotsLoader />
          </View>
        ) : error ? (
          <View style={textAreaStyles.errorContainer}>
            <Text
              style={[textAreaStyles.errorText, { color: BASE_COLORS.orange }]}
            >
              {typeof error === "string"
                ? error
                : error.toString() || "An unknown error occurred"}
            </Text>
          </View>
        ) : (
          <TextInput
            value={translatedText || "Translation will appear here..."}
            onChangeText={handleChangeText}
            multiline={true}
            editable={true} // Always true for scrolling to work
            style={[
              textAreaStyles.textArea,
              textAreaStyles.textField,
              { borderColor: BASE_COLORS.borderColor },
              !translatedText ? { color: BASE_COLORS.placeholderText } : {},
            ]}
            placeholder={undefined}
            placeholderTextColor={BASE_COLORS.placeholderText}
            textAlignVertical="top"
            scrollEnabled={true}
            // These props help make it "fake" non-editable
            selectTextOnFocus={false}
            showSoftInputOnFocus={false} // Don't show keyboard
            onFocus={handleFocus}
            caretHidden={true} // Hide cursor for non-editable
            contextMenuHidden={true} // Hide context menu for non-editable
            selection={{ start: 0, end: 0 }} // Prevent selection for non-editable
            // Android specific
            importantForAutofill="no"
            keyboardType={
              Platform.OS === "android" ? "visible-password" : "default"
            }
          />
        )}
      </View>
      <ConfidenceModal
        visible={confidenceModalVisible}
        language={targetLanguage}
        onClose={() => setConfidenceModalVisible(false)}
      />
    </View>
  );
};

export default TargetTextArea;
