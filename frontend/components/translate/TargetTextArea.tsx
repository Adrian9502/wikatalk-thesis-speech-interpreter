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
import DotsLoader from "@/components/DotLoader";

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

  return (
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
            onPress={handleTranslatedSpeech}
            disabled={!translatedText || isTranslating}
          >
            <Ionicons
              name={isTargetSpeaking ? "volume-high" : "volume-medium-outline"}
              size={22}
              color={
                isTargetSpeaking ? BASE_COLORS.success : BASE_COLORS.orange
              }
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
              color={copiedTarget ? BASE_COLORS.success : BASE_COLORS.orange}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Text Output Area */}
      <View style={styles.textAreaWrapper}>
        <ScrollView
          style={[styles.textArea, { borderColor: BASE_COLORS.borderColor }]}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { flex: isTranslating ? 1 : 0 },
          ]}
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
              textAlignVertical="top"
            />
          )}
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
    maxHeight: "100%",
  },
  scrollContent: {
    overflow: "hidden",
    paddingBottom: 20,
  },
  textField: {
    fontFamily: "Poppins-Regular",
    fontSize: 17,
    fontWeight: "400",
    lineHeight: 24,
    textAlignVertical: "top",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  errorText: {
    color: BASE_COLORS.orange,
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins-Regular",
  },
});

export default TargetTextArea;
