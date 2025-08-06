import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { X, Star, Info } from "react-native-feather";
import { getStarCount, formatDifficulty } from "@/utils/games/difficultyUtils";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";
import modalSharedStyles from "@/styles/games/modalSharedStyles";

interface LevelHeaderProps {
  levelData: any;
  difficulty: string;
  starCount: number;
  onClose: () => void;
  onShowCostInfo: () => void;
  isAnimating: boolean;
  styles: any;
}

const LevelHeader: React.FC<LevelHeaderProps> = ({
  levelData,
  difficulty,
  starCount,
  onClose,
  onShowCostInfo,
  isAnimating,
  styles,
}) => {
  return (
    <>
      {/* Close button */}
      <TouchableOpacity
        onPress={onClose}
        style={modalSharedStyles.closeButton}
        disabled={isAnimating}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X width={20} height={20} color="#fff" />
      </TouchableOpacity>

      {/* Level header */}
      <View style={modalSharedStyles.levelHeader}>
        <View style={modalSharedStyles.levelNumberContainer}>
          <Text style={modalSharedStyles.levelNumber}>
            {levelData.levelString ||
              levelData.level ||
              `Level ${levelData.id}`}
          </Text>
        </View>
        <Text style={modalSharedStyles.levelTitle}>{levelData.title}</Text>
      </View>

      {/* Badges with difficulty stars and focus area */}
      <View style={modalSharedStyles.badgesContainer}>
        <View style={modalSharedStyles.difficultyBadge}>
          <View style={modalSharedStyles.starContainer}>
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Star
                  key={index}
                  width={16}
                  height={16}
                  fill={index < starCount ? "#FFC107" : "transparent"}
                  stroke={
                    index < starCount ? "#FFC107" : "rgba(255, 255, 255, 0.4)"
                  }
                />
              ))}
          </View>
          <Text style={modalSharedStyles.difficultyText}>
            {formatDifficulty(difficulty)}
          </Text>
        </View>
        <FocusAreaBadge focusArea={levelData.focusArea} />
        <TouchableOpacity style={styles.infoButton} onPress={onShowCostInfo}>
          <Info width={16} height={16} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default React.memo(LevelHeader);
