import React, { useCallback, useMemo } from "react";
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

  // Memoize default gradient colors to prevent recreation
  const defaultGradientColors = useMemo(
    () => difficultyColors.Easy || (["#4CAF50", "#2E7D32"] as const),
    [difficultyColors.Easy]
  );

  // Optimized renderItem with better memoization
  const renderItem = useCallback(
    ({ item: level, index }: { item: LevelData; index: number }) => {
      const levelDifficulty =
        typeof level.difficulty === "string" ? level.difficulty : "Easy";

      const colorsArray =
        difficultyColors[levelDifficulty as keyof typeof difficultyColors] ||
        defaultGradientColors;

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
    [difficultyColors, onSelectLevel, defaultGradientColors]
  );

  // Memoize FlatList props for better performance
  const flatListProps = useMemo(
    () => ({
      numColumns: 2,
      contentContainerStyle: styles.gridScrollContent,
      showsVerticalScrollIndicator: false,
      removeClippedSubviews: true, // Changed to true for better performance
      initialNumToRender: 8, // Reduced for faster initial render
      maxToRenderPerBatch: 6, // Reduced batch size
      windowSize: 4, // Reduced window size
      updateCellsBatchingPeriod: 100, // Add batching for smoother scrolling
      // Add getItemLayout for known item heights (if you know card height)
      // getItemLayout: (data, index) => ({
      //   length: ITEM_HEIGHT,
      //   offset: ITEM_HEIGHT * index,
      //   index,
      // }),
    }),
    [styles.gridScrollContent]
  );

  return (
    <View style={[styles.levelGridContainer]}>
      <FlatList
        data={levels}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        {...flatListProps}
      />
    </View>
  );
};

// Enhanced memo comparison
export default React.memo(LevelGrid, (prevProps, nextProps) => {
  // Quick length check first
  if (prevProps.levels.length !== nextProps.levels.length) {
    return false;
  }

  // Check if the levels array actually changed (not just recreated)
  const levelsChanged = prevProps.levels.some((prevLevel, index) => {
    const nextLevel = nextProps.levels[index];
    return (
      prevLevel.id !== nextLevel.id ||
      prevLevel.status !== nextLevel.status ||
      prevLevel.title !== nextLevel.title ||
      prevLevel.difficulty !== nextLevel.difficulty
    );
  });

  return !levelsChanged && prevProps.onSelectLevel === nextProps.onSelectLevel;
});
