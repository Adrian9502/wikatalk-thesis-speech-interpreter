import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp, Play } from "react-native-feather";
import useProgressStore from "@/store/games/useProgressStore";
import { getGameModeGradient } from "@/utils/gameUtils";

interface GameCardProps {
  game: any;
  onGamePress: () => void;
  onProgressPress: () => void;
}

const GameCard = React.memo(
  ({ game, onGamePress, onProgressPress }: GameCardProps) => {
    const { getGameModeProgress, lastUpdated } = useProgressStore();

    // Get progress data for this game mode
    const progress = getGameModeProgress(game.id);

    // Log when progress updates for this specific game card
    useEffect(() => {
      console.log(
        `[GameCard] ${game.id} progress updated:`,
        { completed: progress.completed, total: progress.total },
        `at ${new Date(lastUpdated).toISOString()}`
      );
    }, [progress.completed, progress.total, game.id, lastUpdated]);

    // Calculate completion percentage
    const completionPercentage =
      progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : 0;

    // Update the preload effect in GameCard
    useEffect(() => {
      let isMounted = true;

      // This should only run on mount and when game.id changes
      const preloadData = async () => {
        try {
          if (!isMounted) return;

          // FIXED: Don't update lastUpdated here
          // Only clear this specific game's enhanced progress
          useProgressStore.setState((state) => ({
            enhancedProgress: {
              ...state.enhancedProgress,
              [game.id]: null,
            },
          }));

          // Still preload data
          await useProgressStore.getState().getEnhancedGameProgress(game.id);
          console.log(`[GameCard] Preloaded data for ${game.id}`);
        } catch (error) {
          // Ignore errors
        }
      };

      preloadData();

      return () => {
        isMounted = false;
      };
    }, [game.id]); // FIXED: Remove lastUpdated from dependencies

    // Ultra-fast progress press handler with haptic feedback
    const handleProgressPress = useCallback(() => {
      // Native feedback immediately (if available)
      if (Platform && Platform.OS === "ios" && "Haptics" in window) {
        // @ts-ignore - Expo's haptics might be available
        Haptics?.selectionAsync?.();
      }

      // Call immediately without any async operations
      onProgressPress();
    }, [onProgressPress]);

    // Get the consistent gradient colors from the same source as GameProgressModal
    const getCardGradientColors = () => {
      // Get gradient from shared utility or fallback to game-specific ones
      return getGameModeGradient(
        game.id,
        game.gradientColors as [string, string]
      );
    };

    const gradientColors = getCardGradientColors();

    return (
      <View style={styles.gameCard}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gameCardGradient}
        >
          {/* Difficulty Badge */}
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{game.difficulty}</Text>
          </View>

          {/* Game Header */}
          <View style={styles.gameHeader}>
            <View style={styles.gameIconContainer}>
              <View style={styles.gameIconBg}>{game.icon}</View>
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle} numberOfLines={1}>
                {game.title}
              </Text>
              <Text style={styles.gameDescription} numberOfLines={1}>
                {game.description}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.gameStatsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completionPercentage}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.gameActionsRow}>
            <TouchableOpacity
              style={styles.progressBtn}
              onPress={handleProgressPress}
              activeOpacity={0.7} // Better touch feedback
              delayPressIn={0} // Immediate response
            >
              <TrendingUp width={14} height={14} color="#fff" />
              <Text style={styles.progressBtnText}>View Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: game.color }]}
              onPress={onGamePress}
            >
              <Play width={14} height={14} color="#fff" />
              <Text style={styles.playBtnText}>PLAY</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gameDecoShape1} />
          <View style={styles.gameDecoShape2} />
        </LinearGradient>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  gameCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  gameCardGradient: {
    padding: 20,
    position: "relative",
    minHeight: 160,
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  gameIconContainer: {
    marginRight: 12,
  },
  gameIconBg: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 16,
  },
  gameActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBtnLoading: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBtnText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  playBtnText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  difficultyBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gameStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#FFF",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },
  gameDecoShape1: {
    position: "absolute",
    top: -15,
    right: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  gameDecoShape2: {
    position: "absolute",
    bottom: -10,
    left: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

GameCard.displayName = "GameCard";
export default GameCard;
