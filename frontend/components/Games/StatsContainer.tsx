import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import Timer from "@/components/games/Timer";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";

import { calculateRewardCoins } from "@/utils/rewardCalculationUtils";

// Interface for reward info
interface RewardInfo {
  coins: number;
  label: string;
  difficulty: string;
  timeSpent: number;
  tier?: any;
}

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
  // Real-time reward preview state
  const [rewardPreview, setRewardPreview] = useState<RewardInfo | null>(null);
  const gameTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate real-time reward preview
  const updateRewardPreview = useCallback(() => {
    if (variant === "playing" && timerRunning && gameTimeRef.current > 0) {
      try {
        const reward = calculateRewardCoins(
          difficulty,
          gameTimeRef.current,
          true
        );
        if (reward.coins > 0) {
          setRewardPreview({
            coins: reward.coins,
            label: reward.label,
            difficulty,
            timeSpent: gameTimeRef.current,
            tier: reward.tier,
          });
        }
      } catch (error) {
        console.error(
          "[StatsContainer] Error calculating reward preview:",
          error
        );
      }
    } else {
      setRewardPreview(null);
    }
  }, [variant, timerRunning, difficulty]);

  // Timer to update current time and reward preview
  useEffect(() => {
    if (variant === "playing" && timerRunning) {
      const startTime = Date.now();
      const baseTime = initialTime || 0;

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const totalTime = baseTime + elapsed;
        gameTimeRef.current = totalTime;

        updateRewardPreview();
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRewardPreview(null);
    }
  }, [variant, timerRunning, initialTime, updateRewardPreview]);

  // Clear reward preview when timer stops
  useEffect(() => {
    if (!timerRunning) {
      setRewardPreview(null);
    }
  }, [timerRunning]);

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
      {/* Timer Section - Always show when showTimer is true */}
      {showTimer && (
        <Animatable.View
          animation="fadeIn"
          duration={400}
          delay={animationDelay + 50}
        >
          {variant === "playing" && isStarted && (
            <View style={styles.timeAndRewardContainer}>
              <View style={styles.timeContainer}>
                <Timer
                  isRunning={timerRunning}
                  initialTime={initialTime}
                  key={`timer-${initialTime}`}
                />
              </View>
              {rewardPreview && rewardPreview.coins > 0 && (
                <Animatable.View
                  animation="fadeIn"
                  duration={300}
                  style={styles.rewardDisplay}
                >
                  <Image
                    source={require("@/assets/images/coin.png")}
                    style={styles.rewardCoin}
                  />
                  <Text style={styles.rewardText}>+{rewardPreview.coins}</Text>
                </Animatable.View>
              )}
            </View>
          )}
        </Animatable.View>
      )}

      {/* Badges Section - Only show when game is playing */}
      {variant === "playing" && (
        <>
          <Animatable.View
            animation="fadeInRight"
            duration={600}
            delay={animationDelay + (showTimer ? 100 : 50)}
            style={styles.badgesSection}
          >
            <DifficultyBadge difficulty={difficulty} />
          </Animatable.View>
        </>
      )}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  timeAndRewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  completedStatsContainer: {
    justifyContent: "space-between",
  },

  staticTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    width: 100,
    borderRadius: 20,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  staticTimerText: {
    color: BASE_COLORS.white,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    marginLeft: 6,
  },
  rewardDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    gap: 4,
    minWidth: 50,
  },
  rewardCoin: {
    width: 16,
    height: 16,
  },
  rewardText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: ICON_COLORS.brightYellow,
  },
  badgesSection: {
    flexDirection: "row",
    gap: 6,
  },
});

export default StatsContainer;
