import React, { useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import DotsLoader from "@/components/DotLoader";

const SpeechLoading: React.FC = () => {
  // Modern color palette with vibrant colors
  const colors: string[] = ["#FCD116", "#4785ff", "#ce1126", "#FCD116"];

  // Create animated values
  const barAnimation = React.useRef(new Animated.Value(0)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Text fade in
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Progress bar animation
    Animated.loop(
      Animated.timing(barAnimation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      })
    ).start();

    return () => {
      // Cleanup animations
      barAnimation.stopAnimation();
      textOpacity.stopAnimation();
    };
  }, []);

  // Interpolate bar width
  const barWidth = barAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["5%", "70%", "5%"],
  });

  // Interpolate bar color
  const barColor = barAnimation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: colors.concat(colors[0]),
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Animated.Text style={[styles.loadingText, { opacity: textOpacity }]}>
          Translating...
        </Animated.Text>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: barWidth,
                backgroundColor: barColor,
              },
            ]}
          />
        </View>
        <DotsLoader colors={colors} />
      </View>
    </View>
  );
};

export default SpeechLoading;

// Styles
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    backgroundColor: "#0a0f28",
    width: "80%",
    maxWidth: 350,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 999,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  loadingText: {
    fontFamily: "Poppins-Medium",
    color: "#ffffff",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 4,
  },
});
