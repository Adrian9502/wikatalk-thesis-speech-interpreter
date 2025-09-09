import React from "react";
import { View, Text, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import { rewardStyles } from "@/styles/games/rewards.styles";

interface TodayRewardCardProps {
  rewardAmount: number;
  isAvailable: boolean;
  claimedToday: boolean;
}

const TodayRewardCard: React.FC<TodayRewardCardProps> = ({
  rewardAmount,
  isAvailable,
  claimedToday,
}) => {
  return (
    <Animatable.View
      animation="fadeInDown"
      delay={200}
      style={rewardStyles.todayCard}
    >
      <View style={rewardStyles.todayHeader}>
        <Text style={rewardStyles.todayLabel}>Today's Reward</Text>
        <View
          style={
            isAvailable && !claimedToday
              ? rewardStyles.availableBadge
              : rewardStyles.claimedBadge
          }
        >
          <Text style={rewardStyles.badgeText}>
            {isAvailable && !claimedToday ? "AVAILABLE" : "CLAIMED"}
          </Text>
        </View>
      </View>
      <View style={rewardStyles.rewardContainer}>
        <Image
          source={require("@/assets/images/coin.png")}
          style={{ width: 20, height: 20, marginRight: 8 }}
        />
        <Text style={rewardStyles.rewardAmount}>{rewardAmount} coins</Text>
      </View>
      <Text style={rewardStyles.claimText}>
        {isAvailable && !claimedToday
          ? "Claim your daily reward to earn coins!"
          : "You've claimed your reward for today."}
      </Text>
    </Animatable.View>
  );
};

export default React.memo(TodayRewardCard);
