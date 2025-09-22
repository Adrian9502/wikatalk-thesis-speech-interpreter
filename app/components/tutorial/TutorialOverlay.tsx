import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import { useTutorial } from "@/context/TutorialContext";
import CustomTooltip from "@/components/CustomTooltip";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const TutorialOverlay: React.FC = () => {
  const { isActive, currentStep, getTargetMeasurement } = useTutorial();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [targetMeasurement, setTargetMeasurement] = useState<any>(null);

  useEffect(() => {
    if (isActive) {
      console.log(
        "[TutorialOverlay] Tutorial is active, current step:",
        currentStep
      );

      // Fade in the overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start pulsing animation for highlight
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Get target measurement if current step has a target
      if (currentStep?.target) {
        console.log(
          "[TutorialOverlay] Looking for target:",
          currentStep.target
        );

        const checkForMeasurement = () => {
          const measurement = getTargetMeasurement(currentStep.target);
          console.log("[TutorialOverlay] Got measurement:", measurement);

          if (measurement && measurement.width > 0 && measurement.height > 0) {
            setTargetMeasurement(measurement);
          } else {
            // Retry after a short delay
            setTimeout(checkForMeasurement, 100);
          }
        };

        checkForMeasurement();
      } else {
        console.log("[TutorialOverlay] No target for current step");
        setTargetMeasurement(null);
      }

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Fade out the overlay
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, currentStep, fadeAnim, pulseAnim, getTargetMeasurement]);

  if (!isActive || !currentStep) {
    return null;
  }

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetMeasurement) {
      return {
        top: SCREEN_HEIGHT / 2 - 100,
        left: 20,
        right: 20,
      };
    }

    const { x, y, width, height } = targetMeasurement;
    const placement = currentStep.placement || "bottom";

    switch (placement) {
      case "top":
        return {
          bottom: SCREEN_HEIGHT - y + 10,
          left: Math.max(20, Math.min(x - 100, SCREEN_WIDTH - 290)),
        };
      case "bottom":
        return {
          top: y + height + 10,
          left: Math.max(20, Math.min(x - 100, SCREEN_WIDTH - 290)),
        };
      case "center":
      default:
        return {
          top: SCREEN_HEIGHT / 2 - 100,
          left: 20,
          right: 20,
        };
    }
  };

  // Create overlay with hole punch effect using multiple views
  const createOverlayWithHole = () => {
    if (!targetMeasurement) {
      console.log(
        "[TutorialOverlay] No target measurement, showing full overlay"
      );
      return <View style={styles.darkOverlay} />;
    }

    const { x, y, width, height } = targetMeasurement;
    const padding = 8;

    console.log("[TutorialOverlay] Creating hole at:", { x, y, width, height });

    // Ensure coordinates are valid
    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      console.log(
        "[TutorialOverlay] Invalid coordinates, showing full overlay"
      );
      return <View style={styles.darkOverlay} />;
    }

    return (
      <>
        {/* Top overlay */}
        {y - padding > 0 && (
          <View
            style={[
              styles.overlaySection,
              {
                top: 0,
                left: 0,
                width: SCREEN_WIDTH,
                height: Math.max(0, y - padding),
              },
            ]}
          />
        )}

        {/* Left overlay */}
        {x - padding > 0 && (
          <View
            style={[
              styles.overlaySection,
              {
                top: Math.max(0, y - padding),
                left: 0,
                width: Math.max(0, x - padding),
                height: height + padding * 2,
              },
            ]}
          />
        )}

        {/* Right overlay */}
        {x + width + padding < SCREEN_WIDTH && (
          <View
            style={[
              styles.overlaySection,
              {
                top: Math.max(0, y - padding),
                left: x + width + padding,
                width: Math.max(0, SCREEN_WIDTH - (x + width + padding)),
                height: height + padding * 2,
              },
            ]}
          />
        )}

        {/* Bottom overlay */}
        {y + height + padding < SCREEN_HEIGHT && (
          <View
            style={[
              styles.overlaySection,
              {
                top: y + height + padding,
                left: 0,
                width: SCREEN_WIDTH,
                height: Math.max(0, SCREEN_HEIGHT - (y + height + padding)),
              },
            ]}
          />
        )}
      </>
    );
  };

  // Create animated highlight border with glow effect
  const createHighlightBorder = () => {
    if (!targetMeasurement) return null;

    const { x, y, width, height } = targetMeasurement;
    const padding = 8;

    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      return null;
    }

    return (
      <Animated.View
        style={[
          styles.highlightContainer,
          {
            left: Math.max(0, x - padding),
            top: Math.max(0, y - padding),
            width: width + padding * 2,
            height: height + padding * 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Multiple glow layers for better effect */}
        {/* <View style={[styles.glowLayer, styles.glow1]} /> */}
        {/* <View style={[styles.glowLayer, styles.glow2]} /> */}
        {/* <View style={[styles.glowLayer, styles.glow3]} /> */}

        {/* Main highlight border */}
        <View style={styles.highlightBorder} />
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={isActive}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Debug info (remove in production) */}
        {/* <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Target: {currentStep?.target || "none"}
          </Text>
          <Text style={styles.debugText}>
            Measurement:{" "}
            {targetMeasurement
              ? `${Math.round(targetMeasurement.x)},${Math.round(
                  targetMeasurement.y
                )} ${Math.round(targetMeasurement.width)}x${Math.round(
                  targetMeasurement.height
                )}`
              : "none"}
          </Text>
        </View> */}

        {/* Dark overlay sections with hole */}
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={StyleSheet.absoluteFillObject}>
            {createOverlayWithHole()}
          </View>
        </TouchableWithoutFeedback>

        {/* Animated highlight border with glow */}
        {createHighlightBorder()}

        {/* Tooltip */}
        <View style={[styles.tooltipContainer, getTooltipPosition()]}>
          <CustomTooltip
            labels={{
              skip: "Skip",
              previous: "Previous",
              next: "Next",
              finish: "Finish",
            }}
          />
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  overlaySection: {
    position: "absolute",

    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  highlightContainer: {
    position: "absolute",
    borderRadius: 20,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  highlightBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#3B6FE5",
    backgroundColor: "transparent",
  },
  tooltipContainer: {
    position: "absolute",
    zIndex: 1000,
  },
  // Debug styles (remove in production)
  // debugInfo: {
  //   position: "absolute",
  //   top: 50,
  //   left: 20,
  //   backgroundColor: "rgba(0, 0, 0, 0.8)",
  //   padding: 10,
  //   borderRadius: 5,
  //   zIndex: 999,
  // },
  // debugText: {
  //   color: "white",
  //   fontSize: 12,
  //   fontFamily: "monospace",
  // },
});
