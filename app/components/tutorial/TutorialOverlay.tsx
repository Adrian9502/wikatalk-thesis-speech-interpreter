import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Text,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTutorial } from "@/context/TutorialContext";
import CustomTooltip from "@/components/CustomTooltip";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const TutorialOverlay: React.FC = () => {
  const { isActive, currentStep, getTargetMeasurement } = useTutorial();
  const insets = useSafeAreaInsets();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [targetMeasurement, setTargetMeasurement] = useState<any>(null);
  const [measurementAttempts, setMeasurementAttempts] = useState(0);
  const maxMeasurementAttempts = 5; // REDUCED: Lower max attempts

  // Calculate the actual status bar height
  const getStatusBarHeight = () => {
    if (Platform.OS === "ios") {
      return insets.top;
    } else {
      return StatusBar.currentHeight || insets.top || 0;
    }
  };

  const statusBarHeight = getStatusBarHeight();

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

      // ENHANCED: Better measurement handling with controlled retries
      if (currentStep?.target) {
        console.log(
          "[TutorialOverlay] Looking for target:",
          currentStep.target
        );

        let timeoutId: NodeJS.Timeout | null = null;

        const checkForMeasurement = () => {
          // Prevent excessive retries
          if (measurementAttempts >= maxMeasurementAttempts) {
            console.log(
              `[TutorialOverlay] Max measurement attempts reached for ${currentStep.target}, using center placement`
            );
            setTargetMeasurement(null);
            return;
          }

          // FIXED: Add null check for currentStep.target
          if (!currentStep?.target) {
            console.log(
              "[TutorialOverlay] No target specified, using center placement"
            );
            setTargetMeasurement(null);
            return;
          }

          const measurement = getTargetMeasurement(currentStep.target);

          if (measurement && measurement.width > 0 && measurement.height > 0) {
            // FIXED: Adjust measurement to account for status bar
            const adjustedMeasurement = {
              ...measurement,
              y: measurement.y + statusBarHeight,
            };
            console.log(
              "[TutorialOverlay] Got valid measurement:",
              adjustedMeasurement
            );
            setTargetMeasurement(adjustedMeasurement);
            setMeasurementAttempts(0); // Reset attempts on success
          } else {
            // ENHANCED: Only retry with progressive delays
            const nextAttempt = measurementAttempts + 1;
            if (nextAttempt < maxMeasurementAttempts) {
              setMeasurementAttempts(nextAttempt);
              const delay = Math.min(300 * nextAttempt, 1500); // Progressive delay with max
              timeoutId = setTimeout(checkForMeasurement, delay);
            } else {
              console.log(
                `[TutorialOverlay] Could not get valid measurement for ${currentStep.target} after ${maxMeasurementAttempts} attempts, using center placement`
              );
              setTargetMeasurement(null);
            }
          }
        };

        // Reset attempts when target changes
        setMeasurementAttempts(0);
        // Start checking after a brief delay to allow components to mount
        timeoutId = setTimeout(checkForMeasurement, 200);

        return () => {
          pulseAnimation.stop();
          setMeasurementAttempts(0);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      } else {
        console.log("[TutorialOverlay] No target for current step");
        setTargetMeasurement(null);
        setMeasurementAttempts(0);
      }

      return () => {
        pulseAnimation.stop();
        setMeasurementAttempts(0);
      };
    } else {
      // Fade out the overlay
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setMeasurementAttempts(0);
      setTargetMeasurement(null);
    }
  }, [
    isActive,
    currentStep,
    fadeAnim,
    pulseAnim,
    getTargetMeasurement,
    statusBarHeight,
  ]);

  if (!isActive || !currentStep) {
    return null;
  }

  // Calculate tooltip position with status bar adjustment
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
    const tooltipHeight = 180;
    const padding = 20;

    switch (placement) {
      case "top":
        const topPosition = y - tooltipHeight - padding;
        if (topPosition < 50) {
          return {
            top: y + height + padding,
            left: Math.max(20, Math.min(x - 100, SCREEN_WIDTH - 290)),
          };
        }
        return {
          top: topPosition,
          left: Math.max(20, Math.min(x - 100, SCREEN_WIDTH - 290)),
        };
      case "bottom":
        return {
          top: y + height + padding,
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
      return <View style={styles.darkOverlay} />;
    }

    const { x, y, width, height } = targetMeasurement;
    const padding = 16;

    // Ensure coordinates are valid
    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
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
    const padding = 16;

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
        <View style={styles.highlightBorder} />
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={isActive}
      transparent
      animationType="none"
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={StyleSheet.absoluteFillObject}>
            {createOverlayWithHole()}
          </View>
        </TouchableWithoutFeedback>

        {createHighlightBorder()}

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
    borderRadius: 24,
  },
  highlightBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#3B6FE5",
    backgroundColor: "transparent",
  },
  tooltipContainer: {
    position: "absolute",
    zIndex: 1000,
  },
});
