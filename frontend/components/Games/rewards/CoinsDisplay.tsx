import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import useCoinsStore from "@/store/games/useCoinsStore";

interface CoinsDisplayProps {
  onPress?: () => void;
}

const CoinsDisplay: React.FC<CoinsDisplayProps> = ({ onPress }) => {
  const { coins, isLoading, isDailyRewardAvailable } = useCoinsStore();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.coinIconContainer}>
        {isDailyRewardAvailable && <View style={styles.notificationBadge} />}
        <Image
          source={require("@/assets/images/coin.png")}
          style={styles.coinImage}
        />
      </View>
      <Text style={styles.coinsText}>
        {isLoading ? (
          <ActivityIndicator size={"small"} color={"white"} />
        ) : (
          coins
        )}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  coinIconContainer: {
    position: "relative",
    marginRight: 8,
  },
  coinImage: {
    width: 15,
    height: 15,
  },
  coinsText: {
    marginTop: 2,
    color: BASE_COLORS.white,
    fontFamily: "Poppins-Medium",
    fontSize: 13,
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    left: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TITLE_COLORS.customRed,
  },
});
export default CoinsDisplay;
