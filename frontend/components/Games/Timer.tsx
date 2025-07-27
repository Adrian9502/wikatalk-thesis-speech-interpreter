import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import useGameStore from "@/store/games/useGameStore";

interface TimerProps {
  isRunning: boolean;
  initialTime?: number;
}

const Timer: React.FC<TimerProps> = React.memo(
  ({ isRunning, initialTime = 0 }) => {
    const [displayTime, setDisplayTime] = useState("00:00.00");
    const { updateTimeElapsed } = useGameStore();

    // Use refs to maintain state across renders
    const timeRef = useRef(initialTime);
    const storeTimeRef = useRef(initialTime);
    const animFrameIdRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef(Date.now());
    const lastInitialTimeRef = useRef(initialTime);

    // FIXED: Format time with proper precision
    const formatAndDisplayTime = useCallback((time: number) => {
      try {
        // FIXED: Maintain centiseconds precision
        const preciseTime = Math.round(time * 100) / 100;
        const minutes = Math.floor(preciseTime / 60);
        const seconds = Math.floor(preciseTime % 60);
        const centiseconds = Math.floor((preciseTime % 1) * 100);

        setDisplayTime(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`
        );
      } catch (error) {
        console.error("Timer formatting error:", error);
        setDisplayTime("00:00.00");
      }
    }, []);

    // FIXED: Handle initial time changes properly
    useEffect(() => {
      if (lastInitialTimeRef.current !== initialTime) {
        console.log(
          `[Timer] Initial time changed from ${lastInitialTimeRef.current} to ${initialTime}`
        );

        lastInitialTimeRef.current = initialTime;
        timeRef.current = initialTime;
        storeTimeRef.current = initialTime;
        formatAndDisplayTime(initialTime);

        // Update store immediately with new initial time
        updateTimeElapsed(initialTime);
      }
    }, [initialTime, formatAndDisplayTime, updateTimeElapsed]);

    // FIXED: Handle running state changes properly with better performance
    useEffect(() => {
      if (isRunning) {
        console.log(`[Timer] Starting timer from: ${timeRef.current}`);
        lastUpdateTimeRef.current = Date.now();

        const updateTimer = () => {
          if (!isRunning) return;

          const now = Date.now();
          const deltaTime = (now - lastUpdateTimeRef.current) / 1000;

          // FIXED: Add delta time with high precision
          timeRef.current += deltaTime;
          lastUpdateTimeRef.current = now;

          // Format and display with centiseconds
          formatAndDisplayTime(timeRef.current);

          // FIXED: Update store with precise time, less frequently to reduce re-renders
          if (Math.abs(timeRef.current - storeTimeRef.current) >= 0.01) {
            // Update every centisecond
            const preciseTime = Math.round(timeRef.current * 100) / 100;
            updateTimeElapsed(preciseTime);
            storeTimeRef.current = preciseTime;
          }

          if (isRunning) {
            animFrameIdRef.current = requestAnimationFrame(updateTimer);
          }
        };

        animFrameIdRef.current = requestAnimationFrame(updateTimer);
      } else {
        console.log(`[Timer] Stopping timer at: ${timeRef.current}`);
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
        // Update store with final precise time
        const finalPreciseTime = Math.round(timeRef.current * 100) / 100;
        updateTimeElapsed(finalPreciseTime);
      }

      return () => {
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      };
    }, [isRunning, formatAndDisplayTime, updateTimeElapsed]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          // Update store with final time
          updateTimeElapsed(timeRef.current);
        }
      };
    }, [updateTimeElapsed]);

    return (
      <View style={styles.timerContainer}>
        <Clock width={16} height={16} color={BASE_COLORS.white} />
        <Text style={styles.timerText}>{displayTime}</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    color: BASE_COLORS.white,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    marginLeft: 6,
  },
});

export default Timer;
