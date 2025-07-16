import React, { useCallback, useMemo } from "react";
import { View, FlatList } from "react-native";
import { LevelData } from "@/types/gameTypes";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import LevelCard from "@/components/games/levels/LevelCard";

interface LevelGridProps {
  levels: LevelData[];
  onSelectLevel: (level: LevelData) => void;
  difficultyColors: { [key: string]: readonly [string, string] };
  // Animation props
  shouldAnimateCards?: boolean;
  animationKey?: string;
}

const LevelGrid: React.FC<LevelGridProps> = ({
  levels,
  onSelectLevel,
  difficultyColors,
  shouldAnimateCards = false,
  animationKey = "",
}) => {
  // Stable keyExtractor
  const keyExtractor = useCallback((item: LevelData) => `level-${item.id}`, []);

  // Memoize default gradient colors to prevent recreation
  const defaultGradientColors = useMemo(
    () => difficultyColors.Easy || (["#4CAF50", "#2E7D32"] as const),
    [difficultyColors.Easy]
  );

  // Optimized renderItem with animation support
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

      // Calculate staggered animation delay
      const animationDelay = shouldAnimateCards ? index * 50 : 0;

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
            shouldAnimate={shouldAnimateCards}
            animationDelay={animationDelay}
          />
        </View>
      );
    },
    [difficultyColors, onSelectLevel, defaultGradientColors, shouldAnimateCards]
  );

  const flatListProps = useMemo(
    () => ({
      numColumns: 2,
      contentContainerStyle: styles.gridScrollContent,
      showsVerticalScrollIndicator: false,
      removeClippedSubviews: false, // Disable during animations
      initialNumToRender: shouldAnimateCards ? 6 : 8,
      maxToRenderPerBatch: shouldAnimateCards ? 4 : 6,
      windowSize: 4,
      updateCellsBatchingPeriod: 100,
    }),
    [styles.gridScrollContent, shouldAnimateCards]
  );

  return (
    <View style={[styles.levelGridContainer]}>
      <FlatList
        key={animationKey}
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

  return (
    !levelsChanged &&
    prevProps.onSelectLevel === nextProps.onSelectLevel &&
    prevProps.shouldAnimateCards === nextProps.shouldAnimateCards &&
    prevProps.animationKey === nextProps.animationKey
  );
});
