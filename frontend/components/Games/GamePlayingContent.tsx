import React, { useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, Animated } from "react-native";

interface GamePlayingContentProps {
  timerRunning: boolean;
  difficulty: string;
  children: React.ReactNode;
  isStarted?: boolean;
  gameStatus?: "idle" | "ready" | "playing" | "completed";
  initialTime?: number;
  gameMode?: string;
  levelString?: string;
  actualTitle?: string;
}

const GamePlayingContent: React.FC<GamePlayingContentProps> = React.memo(
  ({ timerRunning, children, initialTime = 0, gameStatus = "idle" }) => {
    const timerStartedRef = React.useRef(false);

    // Custom animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    const animationStartedRef = useRef(false);
    const isMountedRef = useRef(true);

    // Optimized timer logging - only log state changes
    React.useEffect(() => {
      if (timerRunning && !timerStartedRef.current) {
        console.log(
          `[GamePlayingContent] Timer started with initialTime: ${initialTime}`
        );
        timerStartedRef.current = true;
      } else if (!timerRunning && timerStartedRef.current) {
        console.log(`[GamePlayingContent] Timer stopped`);
        timerStartedRef.current = false;
      }
    }, [timerRunning, initialTime]);

    const startAnimation = useCallback(() => {
      if (animationStartedRef.current || !isMountedRef.current) {
        console.log(
          `[GamePlayingContent] Animation already started or component unmounted`
        );
        return;
      }

      console.log(`[GamePlayingContent] Starting entrance animation`);
      animationStartedRef.current = true;

      // Reset animation values
      fadeAnim.setValue(0);
      translateY.setValue(30);

      // Start animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start((finished) => {
        if (finished && isMountedRef.current) {
          console.log(`[GamePlayingContent] Animation completed`);
        }
      });
    }, [fadeAnim, translateY]);

    useEffect(() => {
      // Reset animation flag when component mounts or game restarts
      if (gameStatus === "idle" || gameStatus === "ready") {
        console.log(
          `[GamePlayingContent] Game status: ${gameStatus}, resetting animation flag`
        );
        animationStartedRef.current = false;

        // Reset values immediately for idle/ready states
        fadeAnim.setValue(0);
        translateY.setValue(30);
      } else if (gameStatus === "playing" && !animationStartedRef.current) {
        console.log(
          `[GamePlayingContent] Game status changed to playing, starting animation`
        );
        // Small delay to ensure the component is fully rendered
        const animationTimer = setTimeout(() => {
          if (isMountedRef.current) {
            startAnimation();
          }
        }, 50);

        return () => clearTimeout(animationTimer);
      }
    }, [gameStatus, startAnimation, fadeAnim, translateY]);

    // Cleanup on unmount
    useEffect(() => {
      isMountedRef.current = true;

      return () => {
        console.log(
          `[GamePlayingContent] Component unmounting, stopping animations`
        );
        isMountedRef.current = false;
        animationStartedRef.current = false;

        // Stop any running animations
        fadeAnim.stopAnimation();
        translateY.stopAnimation();
      };
    }, [fadeAnim, translateY]);

    return (
      <View style={styles.container}>
        {/* Simplified decorative elements */}
        <View style={[styles.floatingElement, styles.element1]} />
        <View style={[styles.floatingElement, styles.element2]} />

        <Animated.View
          style={[
            styles.contentArea,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  floatingElement: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 50,
    zIndex: 1,
  },
  element1: {
    width: 80,
    height: 80,
    top: "65%",
    right: -20,
  },
  element2: {
    width: 60,
    height: 60,
    top: "35%",
    left: -15,
  },
  contentArea: {
    flex: 1,
    paddingBottom: 40,
    zIndex: 2,
  },
});

export default GamePlayingContent;
