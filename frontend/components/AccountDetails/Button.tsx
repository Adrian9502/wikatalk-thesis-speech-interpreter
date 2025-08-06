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
  height?: number;
}

const Button = ({
  title,
  onPress,
  color,
  textColor = "#FFFFFF",
  style,
  height = 48,
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
        { height },
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
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  text: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  disabled: {
    opacity: 0.7,
  },
});

export default Button;
