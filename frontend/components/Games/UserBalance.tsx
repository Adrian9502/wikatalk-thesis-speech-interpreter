import React from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";
import useCoinsStore from "@/store/games/useCoinsStore";

interface UserBalanceProps {
  onPress?: () => void;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const UserBalance: React.FC<UserBalanceProps> = ({}) => {
  const { coins, isLoading } = useCoinsStore();
  return (
    <View style={styles.balanceContainer}>
      {/* Coin Icon */}
      <Image
        source={require("@/assets/images/coin.png")}
        style={styles.coinIcon}
      />
      {/* Balance Content */}
      <View style={styles.balanceContent}>
        <Text style={styles.balanceText}>
          {isLoading ? (
            <ActivityIndicator size={"small"} color={BASE_COLORS.white} />
          ) : (
            coins
          )}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base container styles
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    gap: 6,
  },

  // Content layout
  balanceContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Coin icon styles
  coinIcon: {
    width: 15,
    height: 15,
  },

  // Base text styles
  balanceText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: ICON_COLORS.brightYellow,
    textAlign: "center",
  },
});

export default React.memo(UserBalance);
