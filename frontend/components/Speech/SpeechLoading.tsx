import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { X } from "react-native-feather";
import DotsLoader from "@/components/DotLoader";
import useThemeStore from "@/store/useThemeStore";

interface SpeechLoadingProps {
  onCancel?: () => void;
}

const SpeechLoading: React.FC<SpeechLoadingProps> = ({ onCancel }) => {
  const { activeTheme } = useThemeStore();

  // Animation references
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  // Get screen dimensions to ensure full coverage
  const { height, width } = Dimensions.get("window");

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Continuous rotation animation for accent elements
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[styles.overlay, { width, height, opacity: fadeInAnim }]}
      pointerEvents="auto"
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: activeTheme.backgroundColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Main content area with improved spacing */}
        <Animated.Text style={[styles.loadingText]}>
          Translating your speech...
        </Animated.Text>

        {/* Dots loader with improved positioning */}
        <View style={styles.loaderContainer}>
          <DotsLoader />
        </View>
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
};

export default SpeechLoading;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  container: {
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    maxHeight: 250,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  // Text styles
  loadingText: {
    fontFamily: "Poppins-Medium",
    color: "#ffffff",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  // Loader container
  loaderContainer: {
    marginBottom: 20,
  },
  // Enhanced cancel button
  cancelButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 7,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cancelButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "white",
  },
});
