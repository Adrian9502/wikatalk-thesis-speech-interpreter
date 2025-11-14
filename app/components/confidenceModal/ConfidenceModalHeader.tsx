import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CloseButton from "../games/buttons/CloseButton";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface ConfidenceModalHeaderProps {
  backgroundColor: string;
  onClose: () => void;
}

const ConfidenceModalHeader: React.FC<ConfidenceModalHeaderProps> = ({
  backgroundColor,
  onClose,
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <Text style={styles.headerTitle}>Translation Accuracy</Text>
      <CloseButton onPress={onClose} size={15} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    position: "relative",
  },
  headerTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
});

export default ConfidenceModalHeader;
