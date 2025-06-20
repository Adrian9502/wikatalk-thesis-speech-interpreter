import React, { useCallback, useMemo } from "react";
import { View, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { BASE_COLORS } from "@/constant/colors";
import { LevelData } from "@/types/gameTypes";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import LevelCard from "@/components/games/levels/LevelCard";
import { getStarCount, formatDifficulty } from "@/utils/games/difficultyUtils";

interface LevelGridProps {
  levels: LevelData[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelectLevel: (level: LevelData) => void;
  difficultyColors: { [key: string]: readonly [string, string] };
}

const LevelGrid: React.FC<LevelGridProps> = ({
  levels,
  isRefreshing,
  onRefresh,
  onSelectLevel,
  difficultyColors,
}) => {
  // Stable keyExtractor
  const keyExtractor = useCallback((item: LevelData) => `level-${item.id}`, []);

  // Memoized level status hash for stable comparison
  const levelStatusHash = useMemo(() => {
    return levels.map((l) => `${l.id}-${l.status}`).join(",");
  }, [levels]);

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
          />
        </View>
      );
    },
    [difficultyColors, onSelectLevel]
  );

  return (
    <FlashList
      data={levels}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={2}
      contentContainerStyle={styles.gridScrollContent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      extraData={levelStatusHash}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
          tintColor={BASE_COLORS.blue}
        />
      }
      estimatedItemSize={180}
    />
  );
};

export default LevelGrid;
