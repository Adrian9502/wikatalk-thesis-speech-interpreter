import React, { useEffect } from "react";
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS } from "@/constant/colors";
import { useTranslateStore } from "@/store/useTranslateStore";
import { useAuthStore } from "@/store/useAuthStore";

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
            onPress={handleSourceSpeech}
            disabled={!sourceText}
          >
            <Ionicons
              name={isSourceSpeaking ? "volume-high" : "volume-medium-outline"}
              size={22}
              color={isSourceSpeaking ? BASE_COLORS.success : BASE_COLORS.blue}
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
            onPress={clearSourceText}
            disabled={!sourceText}
          >
            <Ionicons name="trash-outline" size={22} color={BASE_COLORS.blue} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Text Input Area */}
      <View style={styles.textAreaWrapper}>
        <ScrollView
          style={[styles.textArea, { borderColor: BASE_COLORS.borderColor }]}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: sourceText ? 120 : 50 }, // Add dynamic minimum height
          ]}
        >
          <TextInput
            placeholder="Enter text to translate..."
            value={sourceText}
            onChangeText={(text) => updateState({ sourceText: text })}
            multiline
            style={[
              styles.textField,
              {
                color: BASE_COLORS.darkText,
                minHeight: sourceText ? 100 : 40, // Add minimum height based on content
              },
            ]}
            placeholderTextColor={BASE_COLORS.placeholderText}
            textAlignVertical="top"
          />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textSectionContainer: {
    height: "49%",
    borderRadius: 20,
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
    fontSize: 18,
    fontFamily: "Poppins-Regular",
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
    borderRadius: 20,
    marginLeft: 8,
  },
  textAreaWrapper: {
    flex: 1,
    marginVertical: 8,
  },
  textArea: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flex: 1,
  },
  scrollContent: {
    overflow: "hidden",
    paddingBottom: 20,
    flexGrow: 1,
  },
  textField: {
    fontFamily: "Poppins-Regular",
    fontSize: 17,
    flex: 1,
    lineHeight: 24,
    textAlignVertical: "top",
  },
});

export default SourceTextArea;
