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
        time = Math.max(0, time);
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const centiseconds = Math.floor((time % 1) * 100);

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
          if (!isRunning) return; // Exit early if no longer running

          const now = Date.now();
          const deltaTime = (now - lastUpdateTimeRef.current) / 1000;

          // Add delta time to current time
          timeRef.current += deltaTime;
          lastUpdateTimeRef.current = now;

          // Format and display
          formatAndDisplayTime(timeRef.current);

          // FIXED: Update store less frequently to reduce re-renders
          if (Math.abs(timeRef.current - storeTimeRef.current) >= 0.2) {
            updateTimeElapsed(timeRef.current);
            storeTimeRef.current = timeRef.current;
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
        // Update store with final time
        updateTimeElapsed(timeRef.current);
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
  },
  timerText: {
    color: BASE_COLORS.white,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    marginLeft: 6,
  },
});

export default Timer;
