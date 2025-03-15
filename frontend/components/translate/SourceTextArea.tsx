import React from "react";
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

const SourceTextArea = () => {
  const {
    sourceLanguage,
    sourceText,
    copiedSource,
    isSpeaking,
    updateState,
    handleSourceSpeech,
    copyToClipboard,
    clearSourceText,
  } = useTranslateStore();

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
  );
};

const styles = StyleSheet.create({
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
});

export default SourceTextArea;
