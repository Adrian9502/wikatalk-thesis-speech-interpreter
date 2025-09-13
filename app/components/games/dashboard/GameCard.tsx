import React, { useEffect, useMemo } from "react";
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
import { useFormattedStats } from "@/utils/gameStatsUtils";
import { BASE_COLORS } from "@/constant/colors";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constant/fontSizes";

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
  const formattedStats = useFormattedStats(game.id);

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

  // play button colors
  const getPlayButtonColor = (gameId: string) => {
    switch (gameId) {
      case "multipleChoice":
        return "#19c48bff";
      case "identification":
        return "#58bdf0e0";
      case "fillBlanks":
        return "#f57171de";
      default:
        return BASE_COLORS.success;
    }
  };

  const staticStyles = useMemo(
    () => ({
      playBtn: [
        styles.playBtn,
        { backgroundColor: getPlayButtonColor(game.id) },
      ],
    }),
    [game.id]
  );

  return (
    <View style={styles.gameCard}>
      <LinearGradient
        colors={getGameModeGradient(game.id)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gameCardGradient}
      >
        {/* Decorative elements */}
        <View style={styles.gameDecoShape1} />
        <View style={styles.gameDecoShape2} />

        {/* Difficulty badge */}
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{game.difficulty}</Text>
        </View>

        {/* header with icon and title */}
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

        {/* centralized stats */}
        <View style={styles.gameStatsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formattedStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formattedStats.percentage}</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        {/* view progress and play button */}
        <View style={styles.gameActionsRow}>
          <TouchableOpacity
            style={styles.progressBtn}
            onPress={memoizedHandlers.handleProgressPress}
            activeOpacity={0.7}
          >
            <TrendingUp width={13} height={13} color={BASE_COLORS.white} />
            <Text style={styles.progressBtnText}>View Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={staticStyles.playBtn}
            onPress={memoizedHandlers.handleGamePress}
            activeOpacity={0.8}
          >
            <Play width={16} height={16} color={BASE_COLORS.white} />
            <Text style={styles.playBtnText}>Play</Text>
          </TouchableOpacity>
        </View>

        {/* circle decoration */}
        <View style={styles.gameDecoShape1} />
        <View style={styles.gameDecoShape2} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gameCard: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  gameCardGradient: {
    padding: 20,
    position: "relative",
    overflow: "hidden",
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
    width: 40,
    height: 40,
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
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.8)",
  },
  gameActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  progressBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBtnText: {
    fontSize: COMPONENT_FONT_SIZES.button.small,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  playBtnText: {
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  difficultyBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gameStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.bold,
    color: BASE_COLORS.white,
  },
  statLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
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
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
});

export default GameCard;
