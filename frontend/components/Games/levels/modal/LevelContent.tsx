import React from "react";
import { View, Text } from "react-native";
import { getGameModeName } from "@/utils/games/renderFocusIcon";

interface LevelContentProps {
  levelData: any;
  gameMode: string;
  styles: any;
}

const LevelContent: React.FC<LevelContentProps> = ({
  levelData,
  gameMode,
  styles,
}) => {
  const getHowToPlayText = () => {
    switch (gameMode) {
      case "multipleChoice":
        return "Select the correct answer from the options provided. The timer will continue from where you left off. Be quick but accurate!";
      case "identification":
        return "Identify the correct word in the sentence. Tap on it to select. The timer continues from your last attempt. Read carefully!";
      default:
        return "Fill in the blank with the correct word. Type your answer and tap Check. Your timer continues from where you left off. Choose wisely!";
    }
  };

  return (
    <>
      {/* Level description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.levelDescription}>{levelData.description}</Text>
      </View>

      {/* Game mode info */}
      <View style={styles.gameModeContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Game Mode:</Text>
          <Text style={styles.infoValue}>{getGameModeName(gameMode)}</Text>
        </View>
      </View>

      {/* How to play */}
      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>How to Play:</Text>
        <Text style={styles.rulesText}>{getHowToPlayText()}</Text>
      </View>
    </>
  );
};

export default React.memo(LevelContent);
