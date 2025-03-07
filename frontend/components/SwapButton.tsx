import React from "react";
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SwapButtonProps {
  onPress: () => void;
  iconSize?: number;
  colors?: [string, string, ...string[]];
  borderStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
}

const SwapButton: React.FC<SwapButtonProps> = ({
  onPress,
  iconSize = 32,
  colors = ["#0038A8", "#CE1126"],
  borderStyle = {},
  iconColor = "#FFF",
}) => {
  return (
    <TouchableOpacity
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        transform: [{ translateX: 32 }, { translateY: -32 }],
        position: "absolute",
        top: "50%",
        right: "50%",
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.9)", // border-white/90
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff", // Optional if needed
        ...(borderStyle ? StyleSheet.flatten(borderStyle) : {}),
      }}
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
          color={iconColor}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default SwapButton;
