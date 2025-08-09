import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { iconColors } from "@/constant/colors";

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
      <Ionicons name="trophy" size={18} color={iconColors.brightYellow} />
      <Text style={styles.rankingsButtonText}>Rankings</Text>
    </TouchableOpacity>
  );
};

export default RankingButton;

const styles = StyleSheet.create({
  rankingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 8,
  },
  rankingsButtonText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#FFf",
  },
});
