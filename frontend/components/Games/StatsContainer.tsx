import React from "react";
import { View, StyleSheet, Text } from "react-native";
import * as Animatable from "react-native-animatable";
import Timer from "@/components/games/Timer";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";
import { Clock } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { formatTime } from "@/utils/gameUtils";
import { calculateResetCost } from "@/utils/resetCostUtils";

interface StatsContainerProps {
  difficulty: string;
  focusArea?: string;
  showTimer?: boolean;
  timerRunning?: boolean;
  initialTime?: number;
  isStarted?: boolean;
  animationDelay?: number;
  variant?: "playing" | "completed";
  finalTime?: number; // Add this new prop for completed state
}

const StatsContainer: React.FC<StatsContainerProps> = ({
  difficulty,
  focusArea = "Vocabulary",
  showTimer = false,
  timerRunning = false,
  initialTime = 0,
  isStarted = true,
  animationDelay = 100,
  variant = "playing",
  finalTime, // Add this parameter
}) => {
  // Calculate reset cost for completed state
  const resetCost = React.useMemo(() => {
    if (variant === "completed" && finalTime) {
      return calculateResetCost(finalTime);
    }
    return 50; // Default
  }, [variant, finalTime]);

  return (
    <Animatable.View
      animation="slideInDown"
      duration={800}
      delay={animationDelay}
      style={[
        styles.statsContainer,
        variant === "completed" && styles.completedStatsContainer,
      ]}
    >
      {/* Timer Section - Show in both variants but different behavior */}
      {showTimer && (
        <Animatable.View
          animation="fadeInLeft"
          duration={600}
          delay={animationDelay + 100}
          style={styles.timerSection}
        >
          {variant === "playing" && isStarted ? (
            // Live timer for playing state
            <Timer
              isRunning={timerRunning}
              initialTime={initialTime}
              key={`timer-${initialTime}`}
            />
          ) : (
            // Static time display for completed state
            <View style={styles.staticTimerContainer}>
              <Clock width={16} height={16} color={BASE_COLORS.white} />
              <Text style={styles.staticTimerText}>
                {formatTime(finalTime || 0)}
              </Text>
              {/* NEW: Show reset cost indicator for completed state */}
              {variant === "completed" && (
                <View style={styles.resetCostIndicator}>
                  <Text style={styles.resetCostText}>Reset: {resetCost}🪙</Text>
                </View>
              )}
            </View>
          )}
        </Animatable.View>
      )}

      {/* Badges Section */}
      <Animatable.View
        animation="fadeInRight"
        duration={600}
        delay={animationDelay + (showTimer ? 200 : 100)}
        style={[
          styles.badgesSection,
          variant === "completed" && styles.completedBadgesSection,
        ]}
      >
        <DifficultyBadge difficulty={difficulty} />
        <FocusAreaBadge focusArea={focusArea} />
      </Animatable.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completedStatsContainer: {
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timerSection: {
    borderWidth: 1,
    borderRadius: 16,
    minWidth: 110,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  staticTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  staticTimerText: {
    color: BASE_COLORS.white,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    marginLeft: 6,
  },
  badgesSection: {
    flexDirection: "row",
    gap: 12,
  },
  completedBadgesSection: {
    // Remove justifyContent: center to allow timer to show
  },
  resetCostIndicator: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    borderRadius: 8,
  },
  resetCostText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#FFC107",
  },
});

export default StatsContainer;
