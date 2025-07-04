import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { Target } from "react-native-feather";
import { SectionHeader } from "@/components/games/common/AnimatedSection";
import GameCard from "./GameCard";
import gameOptions from "@/utils/games/gameOptions";
import { GameOption } from "@/types/gameTypes";

interface GamesListProps {
  onGamePress: (gameId: string, gameTitle: string) => void;
  onProgressPress: (gameId: string, gameTitle: string) => void;
}

const GamesList = React.memo(
  ({ onGamePress, onProgressPress }: GamesListProps) => {
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
});

GamesList.displayName = "GamesList";
export default GamesList;
