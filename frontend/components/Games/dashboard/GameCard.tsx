import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp, Play } from "react-native-feather";
import useProgressStore from "@/store/games/useProgressStore";
import { getGameModeGradient } from "@/utils/gameUtils";
import { BASE_COLORS } from "@/constant/colors";

interface GameCardProps {
  game: any;
  onGamePress: () => void;
  onProgressPress: () => void;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  onGamePress,
  onProgressPress,
}) => {
  const { getGameModeProgress, lastUpdated } = useProgressStore();

  // NEW: Track animation state and progress loading
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(() => {
    // Initial progress data for animation
    const initialProgress = getGameModeProgress(game.id);
    console.log(`[GameCard] Initial progress for ${game.id}:`, initialProgress);
    return initialProgress;
  });

  // NEW: Handle progress updates after animation
  useEffect(() => {
    // Only update progress if animation has been played
    if (animationPlayed) {
      console.log(
        `[GameCard] Animation completed, checking for progress updates for ${game.id}`
      );

      setIsLoadingProgress(true);

      // Small delay to show loading state
      setTimeout(() => {
        const freshProgress = getGameModeProgress(game.id);
        console.log(`[GameCard] Fresh progress for ${game.id}:`, freshProgress);

        // Only update if there's actually a change
        if (
          freshProgress.completed !== currentProgress.completed ||
          freshProgress.total !== currentProgress.total
        ) {
          console.log(`[GameCard] Updating progress for ${game.id}:`, {
            from: currentProgress,
            to: freshProgress,
          });
          setCurrentProgress(freshProgress);
        }

        setIsLoadingProgress(false);
      }, 300); // Brief loading state
    }
  }, [lastUpdated, animationPlayed, game.id]);

  // NEW: Mark animation as played after mount (simulate your existing animation logic)
  useEffect(() => {
    // Simulate the animation duration you have elsewhere in your app
    const animationTimer = setTimeout(() => {
      console.log(`[GameCard] Animation completed for ${game.id}`);
      setAnimationPlayed(true);
    }, 1200); // Adjust this to match your actual animation duration

    return () => clearTimeout(animationTimer);
  }, [game.id]);

  useEffect(() => {
    // Silent preload - keep existing functionality
    const timer = setTimeout(async () => {
      try {
        await useProgressStore.getState().getEnhancedGameProgress(game.id);
      } catch (error) {
        // Silent failure
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [game.id]);

  const memoizedHandlers = useMemo(
    () => ({
      handleProgressPress: () => {
        if (Platform.OS === "ios" && "Haptics" in window) {
          // @ts-ignore
          Haptics?.selectionAsync?.();
        }
        onProgressPress();
      },
      handleGamePress: () => {
        onGamePress();
      },
    }),
    [onGamePress, onProgressPress]
  );

  const staticStyles = useMemo(
    () => ({
      playBtn: [styles.playBtn, { backgroundColor: game.color }],
    }),
    [game.color]
  );

  const completionPercentage = useMemo(() => {
    return currentProgress.total > 0
      ? Math.round((currentProgress.completed / currentProgress.total) * 100)
      : 0;
  }, [currentProgress.completed, currentProgress.total]);

  const gradientColors = useMemo(() => {
    return getGameModeGradient(
      game.id,
      game.gradientColors as [string, string]
    );
  }, [game.id, game.gradientColors]);

  return (
    <View style={styles.gameCard}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gameCardGradient}
      >
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{game.difficulty}</Text>
        </View>

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

        {/* DYNAMIC PROGRESS DATA - UPDATES AFTER ANIMATION */}
        <View style={styles.gameStatsRow}>
          <View style={styles.statItem}>
            {isLoadingProgress ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.statValue}>{currentProgress.completed}</Text>
            )}
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            {isLoadingProgress ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.statValue}>{completionPercentage}%</Text>
            )}
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        <View style={styles.gameActionsRow}>
          <TouchableOpacity
            style={styles.progressBtn}
            onPress={memoizedHandlers.handleProgressPress}
            activeOpacity={0.7}
          >
            <TrendingUp width={14} height={14} color="#fff" />
            <Text style={styles.progressBtnText}>View Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={staticStyles.playBtn}
            onPress={memoizedHandlers.handleGamePress}
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
};

const styles = StyleSheet.create({
  gameCard: {
    borderRadius: 20,
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
    borderRadius: 50,
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
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 12,
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
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBtnText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#fff",
  },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  playBtnText: {
    fontSize: 13,
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
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gameStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
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
export default React.memo(GameCard);
