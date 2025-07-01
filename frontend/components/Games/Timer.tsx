import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import useGameStore from "@/store/games/useGameStore";

interface TimerProps {
  isRunning: boolean;
  initialTime?: number;
}

const Timer: React.FC<TimerProps> = ({ isRunning, initialTime = 0 }) => {
  // Local state for display formatting only
  const [displayTime, setDisplayTime] = useState("00:00.00");

  // Use refs to avoid re-renders
  const timeRef = useRef(initialTime);
  const lastUpdateTimeRef = useRef(Date.now());
  const isRunningRef = useRef(isRunning);
  const animFrameIdRef = useRef<number | null>(null);
  const storeTimeRef = useRef(0);

  // Get store actions but don't subscribe to updates
  const updateTimeElapsed = useGameStore.getState().updateTimeElapsed;

  // Format time helper function
  const formatAndDisplayTime = (time: number) => {
    try {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      const centiseconds = Math.round((time % 1) * 100);

      setDisplayTime(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`
      );
    } catch (error) {
      console.error("Timer formatting error:", error);
      setDisplayTime("00:00.00");
    }
  };

  // Initialize on mount with initialTime
  useEffect(() => {
    timeRef.current = initialTime || 0;
    storeTimeRef.current = initialTime || 0;
    formatAndDisplayTime(initialTime || 0);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        updateTimeElapsed(timeRef.current);
      }
    };
  }, []);

  // Handle running state changes
  useEffect(() => {
    isRunningRef.current = isRunning;

    if (isRunning) {
      lastUpdateTimeRef.current = Date.now();

      if (!animFrameIdRef.current) {
        const updateTimer = () => {
          if (!isRunningRef.current) return;

          const now = Date.now();
          const elapsed = (now - lastUpdateTimeRef.current) / 1000;
          timeRef.current += elapsed;
          lastUpdateTimeRef.current = now;

          formatAndDisplayTime(timeRef.current);

          // Only update store every 1 second to avoid excessive updates
          if (Math.floor(timeRef.current) > Math.floor(storeTimeRef.current)) {
            updateTimeElapsed(timeRef.current);
            storeTimeRef.current = timeRef.current;
          }

          animFrameIdRef.current = requestAnimationFrame(updateTimer);
        };

        animFrameIdRef.current = requestAnimationFrame(updateTimer);
      }
    } else if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
      updateTimeElapsed(timeRef.current);
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isRunning]);

  return (
    <View style={styles.timerContainer}>
      <Clock width={16} height={16} color={BASE_COLORS.white} />
      <Text style={styles.timerText}>{displayTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: BASE_COLORS.white,
    fontFamily: "Poppins-Medium",
    width: 80,
  },
});

export default React.memo(Timer);
