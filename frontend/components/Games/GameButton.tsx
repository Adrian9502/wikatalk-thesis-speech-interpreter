import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";

interface GameButtonProps {
  // Content props
  title: string;
  subtitle?: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;

  // Style props
  variant?: "primary" | "secondary" | "gameMode";
  colors: readonly [string, string, ...string[]];

  // Behavior props
  onPress: () => void;
  activeOpacity?: number;
  disabled?: boolean;

  // Animation props
  animation?: string;
  delay?: number;
  duration?: number;

  // Layout props
  flex?: number;
  style?: any;
}

const GameButton: React.FC<GameButtonProps> = ({
  title,
  subtitle,
  iconName,
  iconSize = 19,
  iconColor = BASE_COLORS.white,
  variant = "secondary",
  colors,
  onPress,
  activeOpacity = 0.8,
  disabled = false,
  animation,
  delay = 0,
  duration = 600,
  flex,
  style,
}) => {
  const ButtonContent = () => (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary" && styles.primaryButton,
        variant === "secondary" && styles.secondaryButton,
        variant === "gameMode" && styles.gameModeButton,
        flex && { flex },
        style,
      ]}
      onPress={onPress}
      activeOpacity={activeOpacity}
      disabled={disabled}
    >
      <LinearGradient
        colors={colors}
        style={[
          styles.gradient,
          variant === "primary" && styles.primaryGradient,
          variant === "secondary" && styles.secondaryGradient,
          variant === "gameMode" && styles.gameModeGradient,
        ]}
      >
        {variant === "primary" && (
          <View style={styles.primaryContent}>
            {iconName && (
              <View style={styles.primaryIconContainer}>
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={24}
                  color={iconColor}
                />
              </View>
            )}
            <View style={styles.primaryTextContainer}>
              <Text style={styles.primaryTitle}>{title}</Text>
              {subtitle && (
                <Text style={styles.primarySubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
            <MaterialCommunityIcons
              name="arrow-right"
              size={24}
              color={BASE_COLORS.white}
            />

            {/* Primary button decorations */}
            <View style={styles.primaryDecoration1} />
            <View style={styles.primaryDecoration2} />
          </View>
        )}

        {variant === "secondary" && (
          <View style={styles.secondaryContent}>
            {iconName && (
              <View style={styles.secondaryIconContainer}>
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={iconSize}
                  color={iconColor}
                />
              </View>
            )}
            <Text style={styles.secondaryText}>{title}</Text>
          </View>
        )}

        {variant === "gameMode" && (
          <View style={styles.gameModeContent}>
            {iconName && (
              <View style={styles.gameModeIconContainer}>
                <Text style={styles.gameModeIcon}>{iconName}</Text>
              </View>
            )}
            <View style={styles.gameModeTextContainer}>
              <Text style={styles.gameModeTitle}>{title}</Text>
              {subtitle && (
                <Text style={styles.gameModeDescription}>{subtitle}</Text>
              )}
            </View>
            <MaterialCommunityIcons
              name="arrow-right"
              size={16}
              color={BASE_COLORS.white}
            />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  // Wrap with animation if provided
  if (animation) {
    return (
      <Animatable.View
        animation={animation}
        duration={duration}
        delay={delay}
        style={variant === "gameMode" ? styles.gameModeWrapper : undefined}
      >
        <ButtonContent />
      </Animatable.View>
    );
  }

  return <ButtonContent />;
};

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryButton: {
    // Primary specific styles
  },
  secondaryButton: {
    flex: 1,
  },
  gameModeButton: {
    // Game mode specific styles
  },

  // Gradient styles
  gradient: {
    position: "relative",
    overflow: "hidden",
  },
  primaryGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gameModeGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  // Primary button content
  primaryContent: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  primaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  primaryTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  primaryTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 2,
  },
  primarySubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
  },
  primaryDecoration1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  primaryDecoration2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  // Secondary button content
  secondaryContent: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  secondaryIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  secondaryText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
  },

  // Game mode button content
  gameModeWrapper: {
    marginBottom: 12,
  },
  gameModeContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  gameModeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  gameModeIcon: {
    fontSize: 18,
  },
  gameModeTextContainer: {
    flex: 1,
  },
  gameModeTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 2,
  },
  gameModeDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
  },
});

export default GameButton;
