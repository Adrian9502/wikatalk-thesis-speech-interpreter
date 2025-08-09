import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { Target, Zap } from "react-native-feather";
import { SectionHeader } from "@/components/games/common/AnimatedSection";
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

const GamesList = React.memo(
  ({ onGamePress, onProgressPress, onRankingsPress }: GamesListProps) => {
    // Render game card function
    const renderGameCard = useCallback(
      (item: GameOption, index: number) => {
        return (
          <Animatable.View
            key={item.id}
            animation="fadeInUp"
            delay={600 + index * 100}
            duration={800}
            style={styles.gameCardWrapper}
            useNativeDriver
          >
            <GameCard
              game={item}
              onGamePress={() => onGamePress(item.id, item.title)}
              onProgressPress={() => onProgressPress(item.id, item.title)}
            />
          </Animatable.View>
        );
      },
      [onGamePress, onProgressPress]
    );

    return (
      <Animatable.View
        animation="fadeInUp"
        duration={1000}
        delay={400}
        style={styles.gamesSection}
        useNativeDriver
      >
        <SectionHeader
          icon={<Target width={20} height={20} color="#4CAF50" />}
          title="Game Modes"
          subtitle="Master different skills through interactive challenges"
        />

        {/* Header with Rankings Button */}
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <Zap width={18} height={18} color={iconColors.brightYellow} />
            <Text style={styles.sectionTitle}>Game Modes</Text>
          </View>

          {/* Rankings Button */}
          {onRankingsPress && (
            <RankingButton onRankingsPress={onRankingsPress} />
          )}
        </View>

        {/* Game Cards */}
        <View style={styles.gamesGrid}>
          {gameOptions.map((item, index) => renderGameCard(item, index))}
        </View>
      </Animatable.View>
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
