import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { rewardStyles } from "@/styles/games/rewards.styles";

interface ClaimButtonProps {
  isAvailable: boolean;
  claimedToday: boolean;
  onClaim: () => void;
}

const ClaimButton: React.FC<ClaimButtonProps> = ({
  isAvailable,
  claimedToday,
  onClaim,
}) => {
  if (isAvailable && !claimedToday) {
    return (
      <TouchableOpacity style={rewardStyles.claimButton} onPress={onClaim}>
        <Text style={rewardStyles.claimButtonText}>CLAIM REWARD</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={rewardStyles.alreadyClaimedButton}>
      <Text style={rewardStyles.alreadyClaimedText}>REWARD CLAIMED</Text>
    </View>
  );
};

export default React.memo(ClaimButton);
