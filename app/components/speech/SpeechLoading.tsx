import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import DotsLoader from "@/components/DotLoader";
import useThemeStore from "@/store/useThemeStore";
import { Modal } from "react-native";
import { BASE_COLORS } from "@/constants/colors";
import { FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface SpeechLoadingProps {
  onCancel?: () => void;
}

const SpeechLoading: React.FC<SpeechLoadingProps> = ({ onCancel }) => {
  const { activeTheme } = useThemeStore();

  // Animation references
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  // Get screen dimensions
  const { height, width } = Dimensions.get("window");

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <Animated.View
        style={[styles.overlay, { width, height, opacity: fadeInAnim }]}
        pointerEvents="auto"
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: activeTheme.backgroundColor,
              transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          {/* Compact main content */}
          <Text style={styles.loadingText}>Translating your speech...</Text>

          {/* DotsLoader */}
          <View style={styles.loaderContainer}>
            <DotsLoader />
          </View>

          {/* Compact cancel button */}
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
    </Modal>
  );
};

export default SpeechLoading;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    minWidth: 200,
    maxWidth: 280,
  },
  loadingText: {
    fontFamily: POPPINS_FONT.regular, // UPDATED: Use font constant
    color: BASE_COLORS.white,
    textAlign: "center",
    fontSize: FONT_SIZES.md, // UPDATED: Use font sizing system
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  loaderContainer: {
    marginBottom: 16,
  },
  cancelButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.xs, // UPDATED: Use font sizing system
    fontFamily: POPPINS_FONT.medium, // UPDATED: Use font constant
    color: "white",
  },
});
