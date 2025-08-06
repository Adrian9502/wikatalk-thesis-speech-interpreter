import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface GameButtonProps {
  variant: "primary" | "secondary" | "gameMode";
  title: string;
  subtitle?: string;
  iconName?: string;
  iconSize?: number;
  colors: readonly [string, string];
  onPress: () => void;
  flex?: number;
  animation?: string;
  delay?: number;
  disabled?: boolean;
  isLoading?: boolean;
}

const GameButton: React.FC<GameButtonProps> = ({
  variant,
  title,
  subtitle,
  iconName,
  iconSize = 18,
  colors,
  onPress,
  flex,
  animation,
  delay,
  disabled = false,
  isLoading = false,
}) => {
  // NEW: Add internal disabled state that doesn't affect styling
  const [internalDisabled, setInternalDisabled] = React.useState(false);

  // NEW: Enable interactions after animation completes
  React.useEffect(() => {
    if (animation && delay !== undefined) {
      setInternalDisabled(true);

      const timer = setTimeout(() => {
        setInternalDisabled(false);
      }, delay + 600); // Animation duration + delay

      return () => clearTimeout(timer);
    }
  }, [animation, delay]);

  // Determine if button should be functionally disabled
  const isFunctionallyDisabled = disabled || isLoading || internalDisabled;

  // FIXED: Make sure onPress is completely blocked when loading
  const handlePress = () => {
    if (isFunctionallyDisabled) {
      console.log("[GameButton] Button press blocked - disabled or loading");
      return;
    }
    onPress();
  };

  // Only apply visual disabled styles for explicit disabled prop or loading
  const shouldShowDisabledStyle = disabled || isLoading;

  const buttonStyle: ViewStyle[] = [
    styles.baseButton,
    variant === "primary" && styles.primaryButton,
    variant === "secondary" && styles.secondaryButton,
    variant === "gameMode" && styles.gameModeButton,
    shouldShowDisabledStyle && styles.disabledButton, // Only visual disabled when explicitly disabled
    ...(flex ? [{ flex }] : []),
  ].filter(Boolean) as ViewStyle[];

  const gradientColors: readonly [string, string] = shouldShowDisabledStyle
    ? (["#4a4a4a", "#2a2a2a"] as const)
    : colors;

  const getIconContainerStyle = () => {
    switch (variant) {
      case "primary":
        return [
          styles.iconContainer,
          styles.primaryIconContainer,
          shouldShowDisabledStyle && styles.disabledIconContainer,
        ];
      case "secondary":
        return [
          styles.iconContainer,
          styles.secondaryIconContainer,
          shouldShowDisabledStyle && styles.disabledIconContainer,
        ];
      case "gameMode":
        return [
          styles.iconContainer,
          styles.gameModeIconContainer,
          shouldShowDisabledStyle && styles.disabledIconContainer,
        ];
      default:
        return [
          styles.iconContainer,
          shouldShowDisabledStyle && styles.disabledIconContainer,
        ];
    }
  };

  const getTextStyles = () => {
    const baseTitle = [
      styles.title,
      shouldShowDisabledStyle && styles.disabledTitle,
    ];
    const baseSubtitle = [
      styles.subtitle,
      shouldShowDisabledStyle && styles.disabledSubtitle,
    ];

    switch (variant) {
      case "primary":
        return {
          title: [...baseTitle, styles.primaryTitle],
          subtitle: [...baseSubtitle, styles.primarySubtitle],
        };
      case "secondary":
        return {
          title: [...baseTitle, styles.secondaryTitle],
          subtitle: [...baseSubtitle, styles.secondarySubtitle],
        };
      case "gameMode":
        return {
          title: [...baseTitle, styles.gameModeTitle],
          subtitle: [...baseSubtitle, styles.gameModeSubtitle],
        };
      default:
        return { title: baseTitle, subtitle: baseSubtitle };
    }
  };

  const textStyles = getTextStyles();

  const content = (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      activeOpacity={isFunctionallyDisabled ? 1 : 0.85} // No visual feedback when disabled
      disabled={isFunctionallyDisabled}
      accessible={true}
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ""}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isFunctionallyDisabled }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          variant === "primary" && styles.primaryGradient,
          variant === "secondary" && styles.secondaryGradient,
          variant === "gameMode" && styles.gameModeGradient,
        ]}
      >
        {/* Subtle overlay for depth */}
        <View
          style={[
            styles.overlay,
            shouldShowDisabledStyle && styles.disabledOverlay,
          ]}
        />

        <View
          style={[
            styles.content,
            variant === "primary" && styles.primaryContent,
            variant === "secondary" && styles.secondaryContent,
            variant === "gameMode" && styles.gameModeContent,
          ]}
        >
          {/* Show loading or icon */}
          {isLoading ? (
            <View style={getIconContainerStyle()}>
              <ActivityIndicator
                size="small"
                color="rgba(255, 255, 255, 0.7)"
              />
            </View>
          ) : (
            iconName && (
              <View style={getIconContainerStyle()}>
                <MaterialCommunityIcons
                  name={iconName}
                  size={variant === "primary" ? iconSize + 4 : iconSize}
                  color={
                    shouldShowDisabledStyle
                      ? "rgba(255, 255, 255, 0.4)"
                      : BASE_COLORS.white
                  }
                />
              </View>
            )
          )}

          <View
            style={[
              styles.textContainer,
              !iconName && !isLoading && styles.textContainerNoIcon,
              variant === "secondary" && styles.secondaryTextContainer,
            ]}
          >
            <Text style={textStyles.title} numberOfLines={1}>
              {isLoading && title === "Retry" ? "Processing..." : title}
            </Text>

            {subtitle && !isLoading && (
              <Text style={textStyles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Arrow indicator for primary buttons (hide when loading) */}
          {variant === "primary" && !shouldShowDisabledStyle && !isLoading && (
            <View style={styles.arrowIndicator}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="rgba(255, 255, 255, 0.8)"
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (animation) {
    return (
      <Animatable.View
        animation={animation}
        duration={600}
        delay={delay || 0}
        useNativeDriver={true}
      >
        {content}
      </Animatable.View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },

  disabledButton: {
    shadowOpacity: 0.08,
    elevation: 3,
  },

  primaryButton: {
    marginBottom: 8,
    minHeight: 70,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },

  secondaryButton: {
    minHeight: 50,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 8,
  },

  gameModeButton: {
    marginBottom: 10,
    minHeight: 65,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    elevation: 12,
  },

  gradient: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  primaryGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  secondaryGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  gameModeGradient: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },

  disabledOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 1,
  },

  primaryContent: {
    gap: 16,
  },

  secondaryContent: {
    gap: 8,
  },

  gameModeContent: {
    gap: 14,
  },

  iconContainer: {
    borderWidth: 1.5,
    borderRadius: 25,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  primaryIconContainer: {
    padding: 10,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  secondaryIconContainer: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },

  gameModeIconContainer: {
    padding: 9,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },

  disabledIconContainer: {
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  textContainer: {
    flex: 1,
  },

  textContainerNoIcon: {
    alignItems: "center",
  },

  secondaryTextContainer: {
    flex: 0,
    alignItems: "center",
  },

  title: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    letterSpacing: 0.3,
  },

  disabledTitle: {
    opacity: 0.5,
    color: "rgba(255, 255, 255, 0.6)",
  },

  primaryTitle: {
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    letterSpacing: 0.5,
  },

  secondaryTitle: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },

  gameModeTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    letterSpacing: 0.4,
  },

  subtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
    letterSpacing: 0.2,
  },

  disabledSubtitle: {
    opacity: 0.4,
    color: "rgba(255, 255, 255, 0.4)",
  },

  primarySubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 3,
  },

  secondarySubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
  },

  gameModeSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },

  arrowIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
});

export default GameButton;
