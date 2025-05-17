import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import useMultipleChoiceStore from "@/store/Games/useMultipleChoiceStore";

interface TimerProps {
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({ isRunning }) => {
  // Get state and actions from the store
  const { timeElapsed, updateTimeElapsed } = useMultipleChoiceStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        updateTimeElapsed(timeElapsed + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeElapsed, updateTimeElapsed]);

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeElapsed / 60);
    const remainingSeconds = timeElapsed % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.timerContainer}>
      <Clock width={16} height={16} color={BASE_COLORS.white} />
      <Text style={styles.timerText}>{formatTime()}</Text>
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

export default Timer;
