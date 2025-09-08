import { BASE_COLORS } from "@/constant/colors";
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isLoading?: boolean;
  disabled?: boolean;
}

const Button = ({
  title,
  onPress,
  color,
  textColor = BASE_COLORS.white,
  style,
  textStyle,
  isLoading = false,
  disabled = false,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: color },
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <ActivityIndicator
            style={{ marginRight: 8 }}
            size="small"
            color={textColor}
          />
          <Text style={[styles.text, { color: textColor }, textStyle]}>
            {title}
          </Text>
        </>
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
  },
  text: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
  disabled: {
    opacity: 0.7,
  },
});

export default Button;
