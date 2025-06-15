import React from "react";
import { View, Text, Image } from "react-native";
import { Check, X } from "react-native-feather";
import { rewardStyles } from "@/styles/games/rewards.styles";
import { RewardDay } from "@/hooks/useRewards";
interface RewardDayItemProps {
  item: RewardDay;
}

const RewardDayItem: React.FC<RewardDayItemProps> = ({ item }) => {
  return (
    <View
      style={[
        rewardStyles.dayCard,
        item.status === "today" && rewardStyles.todayDayCard,
        item.status === "claimed" && rewardStyles.claimedDayCard,
        item.status === "missed" && rewardStyles.missedDayCard,
      ]}
    >
      <Text style={rewardStyles.dayLabel}>Day {item.day}</Text>

      {item.status === "claimed" ? (
        <View style={rewardStyles.checkMark}>
          <Check width={10} height={10} color="#FFF" />
        </View>
      ) : item.status === "today" ? (
        <View style={rewardStyles.todayIndicator}>
          <Image
            source={require("@/assets/images/coin.png")}
            style={{ width: 24, height: 24 }}
          />
        </View>
      ) : item.status === "missed" ? (
        <View style={rewardStyles.missedIndicator}>
          <X width={10} height={10} color="#FFF" />
        </View>
      ) : (
        <View style={rewardStyles.upcomingIndicator}>
          <Image
            source={require("@/assets/images/coin.png")}
            style={{ width: 24, height: 24 }}
          />
        </View>
      )}

      <Text style={rewardStyles.dayReward}>{item.reward}</Text>
    </View>
  );
};

export default React.memo(RewardDayItem);
