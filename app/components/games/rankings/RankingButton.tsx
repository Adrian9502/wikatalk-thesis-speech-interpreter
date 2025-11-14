import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { BASE_COLORS, ICON_COLORS } from "@/constants/colors";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constants/fontSizes";
import { Ionicons } from "@expo/vector-icons";

interface RankingButtonProps {
  onRankingsPress: () => void;
}

const RankingButton: React.FC<RankingButtonProps> = ({ onRankingsPress }) => {
  return (
    <TouchableOpacity
      style={styles.rankingsButton}
      onPress={onRankingsPress}
      activeOpacity={0.7}
    >
      <Ionicons name="trophy" size={14} color={ICON_COLORS.brightYellow} />
      <Text style={styles.rankingsButtonText}>Rankings</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rankingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },
  rankingsButtonText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
});

export default RankingButton;
