import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface FocusAreaBadgeProps {
  focusArea?: string;
}

const FocusAreaBadge: React.FC<FocusAreaBadgeProps> = ({
  focusArea = "Vocabulary",
}) => {
  return (
    <View style={styles.focusAreaBadge}>
      {renderFocusIcon(focusArea)}
      <Text style={styles.focusAreaText}>
        {focusArea.charAt(0).toUpperCase() + focusArea.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  focusAreaBadge: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  focusAreaText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
});

export default FocusAreaBadge;
