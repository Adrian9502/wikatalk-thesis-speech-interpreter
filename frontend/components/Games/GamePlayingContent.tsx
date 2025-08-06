import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

interface GamePlayingContentProps {
  timerRunning: boolean;
  difficulty: string;
  focusArea?: string;
  children: React.ReactNode;
  isStarted?: boolean;
  gameStatus?: "idle" | "ready" | "playing" | "completed";
  initialTime?: number;
  gameMode?: string;
  levelString?: string;
  actualTitle?: string;
}

const GamePlayingContent: React.FC<GamePlayingContentProps> = React.memo(
  ({ timerRunning, children, initialTime = 0 }) => {
    const timerStartedRef = React.useRef(false);

    // Custom animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

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

    // Custom animation effect
    useEffect(() => {
      // Reset animation values
      fadeAnim.setValue(0);
      translateY.setValue(30);

      // Start animation immediately
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
      ]).start();
    }, []);

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
