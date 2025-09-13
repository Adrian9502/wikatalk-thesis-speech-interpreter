import { BASE_COLORS } from "@/constant/colors";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { X } from "react-native-feather";

type CloseButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  color?: string;
  size?: number;
  hasBackground?: boolean;
  isResetting?: boolean;
};

const CloseButton: React.FC<CloseButtonProps> = ({
  onPress,
  color = BASE_COLORS.white,
  size = 20,
  hasBackground = true,
  isResetting = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.closeButton, hasBackground && styles.withBackground]}
      onPress={onPress}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      activeOpacity={0.7}
      disabled={isResetting}
    >
      <X width={size} height={size} color={color} />
    </TouchableOpacity>
  );
};

export default CloseButton;

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 8,
    borderRadius: 20,
    zIndex: 9999,
  },
  withBackground: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
