import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";

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
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  focusAreaText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
});

export default FocusAreaBadge;
