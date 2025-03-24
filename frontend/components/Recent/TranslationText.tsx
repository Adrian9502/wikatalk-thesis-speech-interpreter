import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";

interface TranslationTextProps {
  label: string;
  text: string;
  isOriginal: boolean;
}

const TranslationText: React.FC<TranslationTextProps> = ({
  label,
  text,
  isOriginal,
}) => (
  <View style={styles.textSection}>
    <View style={styles.textLabelContainer}>
      <Text style={styles.textLabel}>{label}</Text>
    </View>
    <ScrollView
      style={styles.textScrollView}
      contentContainerStyle={styles.textScrollContent}
    >
      <Text style={isOriginal ? styles.originalText : styles.translatedText}>
        {text}
      </Text>
    </ScrollView>
  </View>
);

export default TranslationText;

const styles = StyleSheet.create({
  textSection: {
    flex: 1,
    backgroundColor: TITLE_COLORS.customWhite,
    borderRadius: 8,
    padding: 12,
  },
  textLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  textLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.placeholderText,
    marginRight: 6,
  },
  textScrollView: {
    maxHeight: 100,
  },
  textScrollContent: {
    paddingRight: 8,
  },
  originalText: {
    color: BASE_COLORS.blue,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    lineHeight: 22,
  },
  translatedText: {
    color: BASE_COLORS.orange,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    lineHeight: 22,
  },
});
