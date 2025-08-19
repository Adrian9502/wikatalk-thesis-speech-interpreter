import React, { useCallback, useState, useMemo, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Target, Zap } from "react-native-feather";
import { SectionHeader } from "@/components/games/common/SectionHeader";
import GameCard from "./GameCard";
import gameOptions from "@/utils/games/gameOptions";
import { GameOption } from "@/types/gameTypes";
import { BASE_COLORS, iconColors } from "@/constant/colors";
import RankingButton from "../rankings/RankingButton";

interface GamesListProps {
  onGamePress: (gameId: string, gameTitle: string) => void;
  onProgressPress: (gameId: string, gameTitle: string) => void;
  onRankingsPress?: () => void;
}

// SIMPLE: Global flag to track if animations have played ONCE per app session
let HAS_ANIMATED_ONCE = false;

const GamesList = React.memo(
  ({ onGamePress, onProgressPress, onRankingsPress }: GamesListProps) => {
    // Simple animation state - only animate if never animated before
    const [shouldAnimate] = useState(!HAS_ANIMATED_ONCE);

    // Simple animated values
    const fadeAnim = useState(
      () => new Animated.Value(shouldAnimate ? 0 : 1)
    )[0];
    const slideAnim = useState(
      () => new Animated.Value(shouldAnimate ? 30 : 0)
    )[0];

    // SIMPLE: Force consistent ordering
    const sortedGameOptions = useMemo(() => {
      const gameOrder = ["multipleChoice", "identification", "fillBlanks"];
      return [...gameOptions].sort((a, b) => {
        const aIndex = gameOrder.indexOf(a.id);
        const bIndex = gameOrder.indexOf(b.id);
        return aIndex - bIndex;
      });
    }, []);

    // SIMPLE: One animation for the entire container
    useEffect(() => {
      if (!shouldAnimate) return;

      // Simple slide-up + fade animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        // Mark as animated globally
        HAS_ANIMATED_ONCE = true;
        console.log("[GamesList] Simple animation completed");
      });
    }, [shouldAnimate, fadeAnim, slideAnim]);

    // Simple render function - no complex animations
    const renderGameCard = useCallback(
      (item: GameOption, index: number) => {
        return (
          <View key={`game-card-${item.id}`} style={styles.gameCardWrapper}>
            <GameCard
              game={item}
              onGamePress={() => onGamePress(item.id, item.title)}
              onProgressPress={() => onProgressPress(item.id, item.title)}
            />
          </View>
        );
      },
      [onGamePress, onProgressPress]
    );

    return (
      <Animated.View
        style={[
          styles.gamesSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SectionHeader
          icon={<Target width={20} height={20} color="#4CAF50" />}
          title="Game Modes"
          subtitle="Master different skills through interactive challenges"
        />

        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <Zap width={18} height={18} color={iconColors.brightYellow} />
            <Text style={styles.sectionTitle}>Game Modes</Text>
          </View>

          {onRankingsPress && (
            <RankingButton onRankingsPress={onRankingsPress} />
          )}
        </View>

        <View style={styles.gamesGrid}>
          {sortedGameOptions.map((item, index) => renderGameCard(item, index))}
        </View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  gamesSection: {
    marginBottom: 8,
  },
  gamesGrid: {
    width: "100%",
  },
  gameCardWrapper: {
    marginBottom: 26,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
});

GamesList.displayName = "GamesList";
export default GamesList;
