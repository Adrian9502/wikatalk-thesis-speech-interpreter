import React from "react";
import { View, Text, Image } from "react-native";
import { rewardStyles } from "@/styles/games/rewards.styles";

interface BalanceCardProps {
  balance: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  return (
    <View style={rewardStyles.balanceContainer}>
      <View style={rewardStyles.balanceCard}>
        <Image
          source={require("@/assets/images/coin.png")}
          style={{ width: 20, height: 20, marginRight: 8 }}
        />
        <View>
          <Text style={rewardStyles.balanceLabel}>Your Balance</Text>
          <Text style={rewardStyles.balanceValue}>{balance} coins</Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(BalanceCard);
