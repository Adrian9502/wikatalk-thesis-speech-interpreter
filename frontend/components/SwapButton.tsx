import React from "react";
import { TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SwapButtonProps {
  onPress: () => void;
  iconSize?: number;
  colors?: [string, string, ...string[]];
}

const SwapButton: React.FC<SwapButtonProps> = ({
  onPress,
  iconSize = 32,
  colors = ["#0038A8", "#CE1126"],
}) => {
  return (
    <TouchableOpacity
      className="w-16 h-16 rounded-full transform translate-x-8 -translate-y-8 absolute top-1/2 right-1/2 z-10 shadow-xl border-2 border-white/90 items-center justify-center"
      onPress={onPress}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name="swap-vertical"
          size={iconSize}
          color="#FFF"
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default SwapButton;
