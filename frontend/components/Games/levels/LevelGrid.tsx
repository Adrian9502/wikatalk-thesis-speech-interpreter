import React, { useCallback } from "react";
import { View, FlatList } from "react-native";
import { LevelData } from "@/types/gameTypes";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import LevelCard from "@/components/games/levels/LevelCard";

interface LevelGridProps {
  levels: LevelData[];
  onSelectLevel: (level: LevelData) => void;
  difficultyColors: { [key: string]: readonly [string, string] };
}

const LevelGrid: React.FC<LevelGridProps> = ({
  levels,
  onSelectLevel,
  difficultyColors,
}) => {
  // Stable keyExtractor
  const keyExtractor = useCallback((item: LevelData) => `level-${item.id}`, []);

  // Memoized renderItem with stable comparison
  const renderItem = useCallback(
    ({ item: level, index }: { item: LevelData; index: number }) => {
      const levelDifficulty =
        typeof level.difficulty === "string" ? level.difficulty : "Easy";

      const colorsArray =
        difficultyColors[levelDifficulty as keyof typeof difficultyColors] ||
        difficultyColors.Easy;

      const isEvenIndex = index % 2 === 0;

      const itemStyle = {
        flex: 1,
        marginRight: isEvenIndex ? 8 : 0,
        marginLeft: isEvenIndex ? 0 : 8,
      };

      const safeGradientColors: readonly [string, string] = [
        colorsArray[0] || "#4CAF50",
        colorsArray[1] || "#2E7D32",
      ];

      return (
        <View style={itemStyle}>
          <LevelCard
            level={level}
            onSelect={onSelectLevel}
            gradientColors={safeGradientColors}
            accessible={true}
            accessibilityLabel={`Level ${level.number}: ${level.title}`}
            accessibilityHint={
              level.status === "locked"
                ? "This level is locked"
                : "Tap to view level details"
            }
            index={index}
          />
        </View>
      );
    },
    [difficultyColors, onSelectLevel]
  );

  return (
    <View style={[styles.levelGridContainer]}>
      <FlatList
        data={levels}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.gridScrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      {/* <FlashList
        data={levels}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.gridScrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        estimatedItemSize={280}
        onViewableItemsChanged={({ viewableItems }) => {
          console.log(
            "Viewable:",
            viewableItems.map((v) => v.index)
          );
        }}
        overrideItemLayout={({ index }) => ({
          length: 250,
          offset: Math.floor(index / 2) * 250, // if numColumns = 2
        })}
      /> */}
    </View>
  );
};

export default React.memo(LevelGrid);
