import React, { useRef, useEffect } from "react";
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SwapButtonProps {
  onPress: () => void;
  iconSize?: number;
  colors?: [string, string, ...string[]];
  borderStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
  isActive?: boolean;
}

const SwapButton: React.FC<SwapButtonProps> = ({
  onPress,
  iconSize = 24,
  colors = ["#4A6FFF", "#9C4AFF"],
  borderStyle = {},
  iconColor = "#FFFFFF",
  isActive = false,
}) => {
  // Animation for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Rotate animation when component is mounted
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: isActive ? 1 : 0,
          duration: isActive ? 2000 : 0,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [isActive]);

  // Handle button press animation
  const handlePress = () => {
    // Scale down
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      // Scale back up
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Execute the provided onPress function
    onPress();
  };

  // Interpolate rotation value
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.buttonWrapper,
        {
          transform: [
            { translateX: 28 },
            { translateY: -28 },
            { scale: scaleAnim },
            { rotate: spin },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.buttonContainer,
          borderStyle ? StyleSheet.flatten(borderStyle) : {},
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <MaterialCommunityIcons
            name="swap-vertical"
            size={iconSize}
            color={iconColor}
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    position: "absolute",
    top: "50%",
    right: "50%",
    zIndex: 10,
  },
  buttonContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradientContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SwapButton;
