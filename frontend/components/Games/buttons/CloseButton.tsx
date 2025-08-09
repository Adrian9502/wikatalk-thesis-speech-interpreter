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
};

const CloseButton: React.FC<CloseButtonProps> = ({ onPress, color }) => {
  return (
    <TouchableOpacity
      style={styles.closeButton}
      onPress={onPress}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      activeOpacity={0.7}
    >
      <X width={20} height={20} color={color ?? "#fff"} />
    </TouchableOpacity>
  );
};

export default CloseButton;

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
  },
});
