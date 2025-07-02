import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { Target } from "react-native-feather";
import { SectionHeader } from "@/components/games/common/AnimatedSection";
import GameCard from "./GameCard";
import gameOptions from "@/utils/games/gameOptions";
import { GameOption, GameModeProgress } from "@/types/gameTypes";

interface GamesListProps {
  getGameModeProgress: (gameMode: string) => GameModeProgress;
  onGamePress: (gameId: string, gameTitle: string) => void;
  onProgressPress: (gameId: string, gameTitle: string) => void;
}

const GamesList = React.memo(
  ({ getGameModeProgress, onGamePress, onProgressPress }: GamesListProps) => {
    // Render game card function
    const renderGameCard = useCallback(
      (item: GameOption, index: number) => {
        const progress = getGameModeProgress(item.id);
        const completionPercentage =
          progress.total > 0
            ? Math.round((progress.completed / progress.total) * 100)
            : 0;

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
              progress={progress}
              completionPercentage={completionPercentage}
              onGamePress={() => onGamePress(item.id, item.title)}
              onProgressPress={() => onProgressPress(item.id, item.title)}
            />
          </Animatable.View>
        );
      },
      [getGameModeProgress, onGamePress, onProgressPress]
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

        <View style={styles.gamesGrid}>
          {gameOptions.map((item, index) => renderGameCard(item, index))}
        </View>
      </Animatable.View>
    );
  }
);

const styles = StyleSheet.create({
  gamesSection: {
    marginBottom: 40,
  },
  gamesGrid: {
    width: "100%",
  },
  gameCardWrapper: {
    marginBottom: 16,
  },
});

GamesList.displayName = "GamesList";
export default GamesList;
