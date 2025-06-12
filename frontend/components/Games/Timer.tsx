import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import useQuizStore from "@/store/games/useQuizStore";

interface TimerProps {
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({ isRunning }) => {
  // Local state for display formatting only
  const [displayTime, setDisplayTime] = useState("00:00");
  // Use ref to track current time without re-renders
  const timeRef = useRef(0);
  const updateTimeRef = useRef(null);
  const { gameState, updateTimeElapsed } = useQuizStore();
  const { timeElapsed } = gameState;

  // Initialize timer value only once on mount
  useEffect(() => {
    timeRef.current = timeElapsed;
    updateTimeRef.current = updateTimeElapsed;
  }, []);

  // Use requestAnimationFrame instead of setInterval for smoother updates
  useEffect(() => {
    let animFrameId: number;

    if (isRunning) {
      const startTime = Date.now();

      const updateTimer = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        timeRef.current = timeElapsed + elapsed;

        // Handle minutes properly, even if they exceed 60
        const totalMinutes = Math.floor(timeRef.current / 60);
        const seconds = Math.floor(timeRef.current % 60);
        const centiseconds = Math.round((timeRef.current % 1) * 100);

        const formattedTime = `${totalMinutes}:${seconds
          .toString()
          .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;

        setDisplayTime(formattedTime);
        animFrameId = requestAnimationFrame(updateTimer);
      };
      animFrameId = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        updateTimeRef.current(timeRef.current);
      }
    };
  }, [isRunning, timeElapsed]);

  // Update display when timeElapsed changes externally
  useEffect(() => {
    if (timeElapsed !== timeRef.current) {
      timeRef.current = timeElapsed;
      const minutes = Math.floor(timeElapsed / 60);
      const remainingSeconds = timeElapsed % 60;
      const formattedTime = `${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
      setDisplayTime(formattedTime);
    }
  }, [timeElapsed]);

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
    width: 57,
  },
});

export default React.memo(Timer);
