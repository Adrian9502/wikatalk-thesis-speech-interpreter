import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";

type RankingButtonProps = {
  onRankingsPress?: (event: GestureResponderEvent) => void;
};

const RankingButton: React.FC<RankingButtonProps> = ({ onRankingsPress }) => {
  return (
    <TouchableOpacity
      style={styles.rankingsButton}
      onPress={onRankingsPress}
      activeOpacity={0.8}
    >
      <Ionicons name="trophy" size={15} color={ICON_COLORS.brightYellow} />
      <Text style={styles.rankingsButtonText}>Rankings</Text>
    </TouchableOpacity>
  );
};

export default RankingButton;

const styles = StyleSheet.create({
  rankingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },
  rankingsButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
  },
});
