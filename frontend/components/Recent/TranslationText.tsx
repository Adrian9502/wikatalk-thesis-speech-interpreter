import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { BASE_COLORS } from "@/constant/colors";

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
    <View style={styles.textContainer}>
      <Text style={isOriginal ? styles.originalText : styles.translatedText}>
        {text}
      </Text>
    </View>
  </View>
);

export default TranslationText;

const styles = StyleSheet.create({
  textSection: {
    flex: 1,
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    padding: 12,
  },
  textLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  textLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
    marginRight: 6,
  },
  textContainer: {
    width: "100%",
  },
  originalText: {
    color: BASE_COLORS.blue,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    lineHeight: 22,
  },
  translatedText: {
    color: BASE_COLORS.orange,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    lineHeight: 22,
  },
});
