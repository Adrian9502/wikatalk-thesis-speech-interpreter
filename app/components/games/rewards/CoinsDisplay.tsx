import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { BASE_COLORS, TITLE_COLORS } from "@/constants/colors";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constants/fontSizes";
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  coinIconContainer: {
    position: "relative",
  },
  coinImage: {
    width: 15,
    height: 15,
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
    borderWidth: 0.5,
    borderColor: "white",
    zIndex: 1,
  },
  coinsText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.semiBold,
    marginTop: 2,
    color: BASE_COLORS.white,
  },
});

export default CoinsDisplay;
