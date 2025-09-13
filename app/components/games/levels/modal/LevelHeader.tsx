import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Star, Info } from "react-native-feather";
import { formatDifficulty } from "@/utils/games/difficultyUtils";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";
import modalSharedStyles from "@/styles/games/modalSharedStyles";
import CloseButton from "../../buttons/CloseButton";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";

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
  styles,
}) => {
  return (
    <>
      <CloseButton size={17} onPress={onClose} />
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
                  width={13}
                  height={13}
                  fill={
                    index < starCount ? ICON_COLORS.brightYellow : "transparent"
                  }
                  stroke={
                    index < starCount
                      ? ICON_COLORS.brightYellow
                      : "rgba(255, 255, 255, 0.4)"
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
          <Info width={15} height={15} color={BASE_COLORS.white} />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default React.memo(LevelHeader);
