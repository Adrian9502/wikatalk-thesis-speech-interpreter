import React, { useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS } from "@/constant/colors";
import { useTranslateStore } from "@/store/useTranslateStore";
import { useAuthStore } from "@/store/useAuthStore";
import { textAreaStyles } from "@/styles/translate/textArea.styles";

const SourceTextArea = () => {
  const {
    sourceLanguage,
    sourceText,
    copiedSource,
    isSourceSpeaking,
    updateState,
    handleSourceSpeech,
    copyToClipboard,
    clearSourceText,
  } = useTranslateStore();

  const { userToken } = useAuthStore();

  // Reset text area when the component mounts or when user changes
  useEffect(() => {
    // Clear any existing text to ensure no text persists between users
    clearSourceText();
  }, [userToken]);

  return (
    <View style={textAreaStyles.textSectionContainer}>
      <LinearGradient
        colors={[BASE_COLORS.lightBlue, BASE_COLORS.white]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={textAreaStyles.gradientBackground}
      />

      {/* Header Controls */}
      <View style={textAreaStyles.sectionHeader}>
        <Text
          style={[textAreaStyles.sectionTitle, { color: BASE_COLORS.blue }]}
        >
          {sourceLanguage}
        </Text>

        <View style={textAreaStyles.controls}>
          <TouchableOpacity
            style={textAreaStyles.controlButton}
            onPress={handleSourceSpeech}
            disabled={!sourceText}
          >
            <Ionicons
              name={isSourceSpeaking ? "volume-high" : "volume-medium-outline"}
              size={20}
              color={isSourceSpeaking ? BASE_COLORS.success : BASE_COLORS.blue}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={textAreaStyles.controlButton}
            onPress={() => copyToClipboard(sourceText, "copiedSource")}
            disabled={!sourceText}
          >
            <Ionicons
              name={copiedSource ? "checkmark-circle" : "copy-outline"}
              size={20}
              color={copiedSource ? BASE_COLORS.success : BASE_COLORS.blue}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={textAreaStyles.controlButton}
            onPress={clearSourceText}
            disabled={!sourceText}
          >
            <Ionicons name="trash-outline" size={20} color={BASE_COLORS.blue} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Text Input Area */}
      <View style={textAreaStyles.textAreaWrapper}>
        <TextInput
          placeholder="Enter text to translate..."
          value={sourceText}
          onChangeText={(text) => updateState({ sourceText: text })}
          multiline
          style={[
            textAreaStyles.textArea,
            textAreaStyles.textField,
            { borderColor: BASE_COLORS.borderColor },
          ]}
          placeholderTextColor={BASE_COLORS.placeholderText}
          textAlignVertical="top"
          scrollEnabled={true}
        />
      </View>
    </View>
  );
};

export default SourceTextArea;
