import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { RefreshCw } from "react-native-feather";
import { iconColors } from "@/constant/colors";

interface ResetButtonProps {
  // Core functionality
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;

  // Cost and display
  cost: number;
  showCostLabel?: boolean;
  costLabel?: string;

  // Styling variants
  variant?: "compact" | "expanded";
  size?: "small" | "medium";

  // Custom styles
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  costStyle?: TextStyle;

  // Conditional rendering
  showOnlyWhen?: boolean;
}

const ResetButton: React.FC<ResetButtonProps> = ({
  onPress,
  disabled = false,
  isLoading = false,
  cost,
  showCostLabel = true,
  costLabel = "Reset",
  variant = "expanded",
  size = "small",
  buttonStyle,
  textStyle,
  costStyle,
  showOnlyWhen = true,
}) => {
  // Don't render if condition is not met
  if (!showOnlyWhen) {
    return null;
  }

  // Get styles based on variant and size
  const getButtonStyles = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.baseButton];

    if (variant === "compact") {
      baseStyle.push(styles.compactButton);
    } else {
      baseStyle.push(styles.expandedButton);
    }

    if (size === "medium") {
      baseStyle.push(styles.mediumButton);
    }

    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }

    if (buttonStyle) {
      baseStyle.push(buttonStyle);
    }

    return baseStyle;
  };

  const getIconSize = () => {
    return size === "medium" ? 14 : 12;
  };

  const getTextStyles = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.baseText];

    if (size === "medium") {
      baseStyle.push(styles.mediumText);
    }

    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  const getCostStyles = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.baseCost];

    if (size === "medium") {
      baseStyle.push(styles.mediumCost);
    }

    if (costStyle) {
      baseStyle.push(costStyle);
    }

    return baseStyle;
  };

  if (variant === "compact") {
    // Compact version for StatsContainer
    return (
      <TouchableOpacity
        style={getButtonStyles()}
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <RefreshCw
            width={getIconSize()}
            height={getIconSize()}
            color="#fff"
          />
        )}
        <Text style={getTextStyles()}>🪙 {cost}</Text>
      </TouchableOpacity>
    );
  }

  // Expanded version for LevelInfoModal
  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <RefreshCw width={getIconSize()} height={getIconSize()} color="#fff" />
      )}
      <View style={styles.contentContainer}>
        {showCostLabel && <Text style={getTextStyles()}>{costLabel}</Text>}
        <Image
          source={require("@/assets/images/coin.png")}
          style={[
            styles.coinImage,
            size === "medium" && styles.mediumCoinImage,
          ]}
        />
        <Text style={getCostStyles()}>{cost}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base styles
  baseButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(245, 47, 47, 0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    gap: 4,
  } as ViewStyle,

  // Variant styles
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  } as ViewStyle,

  expandedButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "center",
  } as ViewStyle,

  // Size styles
  mediumButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  } as ViewStyle,

  // State styles
  disabledButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    opacity: 0.6,
  } as ViewStyle,

  // Content container for expanded variant
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  } as ViewStyle,

  // Text styles
  baseText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#fff",
  } as TextStyle,

  mediumText: {
    fontSize: 13,
  } as TextStyle,

  // Cost styles
  baseCost: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: iconColors.brightYellow,
  } as TextStyle,

  mediumCost: {
    fontSize: 13,
  } as TextStyle,

  coinImage: {
    width: 15,
    height: 15,
  } as ImageStyle,

  mediumCoinImage: {
    width: 16,
    height: 16,
  } as ImageStyle,
});

export default ResetButton;
