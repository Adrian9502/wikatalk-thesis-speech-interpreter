import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import useQuizStore from "@/store/Games/useQuizStore";

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

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        // Update the ref value
        timeRef.current += 1;

        // Format time for display
        const minutes = Math.floor(timeRef.current / 60);
        const remainingSeconds = timeRef.current % 60;
        const formattedTime = `${minutes
          .toString()
          .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

        // Update display
        setDisplayTime(formattedTime);

        // Only update store every 3 seconds to reduce renders
        if (timeRef.current % 3 === 0) {
          updateTimeRef.current(timeRef.current);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        // Ensure final time is saved to store when unmounting
        updateTimeRef.current(timeRef.current);
      }
    };
  }, [isRunning]);

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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginLeft: 6,
  },
});

export default React.memo(Timer);
