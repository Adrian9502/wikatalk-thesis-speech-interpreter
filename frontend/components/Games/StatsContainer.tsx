import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import Timer from "@/components/games/Timer";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import UserBalance from "@/components/games/UserBalance";

interface StatsContainerProps {
  difficulty: string;
  showTimer?: boolean;
  timerRunning?: boolean;
  initialTime?: number;
  isStarted?: boolean;
  animationDelay?: number;
  variant?: "playing" | "completed";
}

const StatsContainer: React.FC<StatsContainerProps> = ({
  difficulty,
  showTimer = false,
  timerRunning = false,
  initialTime = 0,
  isStarted = true,
  animationDelay = 100,
  variant = "playing",
}) => {
  return (
    <Animatable.View
      animation="fadeIn"
      duration={600}
      delay={animationDelay}
      style={[
        styles.statsContainer,
        variant === "completed" && styles.completedStatsContainer,
      ]}
    >
      {/* Left Section - Timer */}
      {showTimer && (
        <Animatable.View
          animation="fadeIn"
          duration={400}
          delay={animationDelay + 50}
          style={styles.timerSection}
        >
          {variant === "playing" && isStarted && (
            <View style={styles.timeContainer}>
              <Timer
                isRunning={timerRunning}
                initialTime={initialTime}
                key={`timer-${initialTime}`}
              />
            </View>
          )}

          {variant === "playing" && (
            <Animatable.View
              animation="fadeIn"
              duration={400}
              delay={animationDelay + (showTimer ? 100 : 50)}
              style={styles.centerSection}
            >
              <DifficultyBadge difficulty={difficulty} />
            </Animatable.View>
          )}
        </Animatable.View>
      )}

      {/*  Center Section - Difficulty Badge */}

      {/* Right Section - User Balance */}
      {variant === "playing" && (
        <Animatable.View
          animation="fadeIn"
          duration={400}
          delay={animationDelay + (showTimer ? 150 : 100)}
          style={styles.balanceSection}
        >
          <UserBalance size="small" />
        </Animatable.View>
      )}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4, // Add padding for better spacing
  },
  completedStatsContainer: {
    justifyContent: "center",
  },

  // NEW: Section styles for better layout control
  timerSection: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
  },
  balanceSection: {
    flex: 1,
    alignItems: "flex-end",
  },

  // Timer container (simplified)
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "rgba(255, 255, 255, 0.12)",
    minWidth: 100,
  },
});

export default StatsContainer;
