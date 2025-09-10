import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface LevelTitleHeaderProps {
  levelString?: string;
  actualTitle?: string;
  animationDelay?: number;
}

const LevelTitleHeader: React.FC<LevelTitleHeaderProps> = ({
  levelString,
  actualTitle,
  animationDelay = 0,
}) => {
  // Format the level display text
  const levelDisplayText = React.useMemo(() => {
    if (levelString && actualTitle) {
      return `${levelString} - ${actualTitle}`;
    } else if (levelString) {
      return levelString;
    } else if (actualTitle) {
      return actualTitle;
    }
    return null;
  }, [levelString, actualTitle]);

  if (!levelDisplayText) return null;

  return (
    <Animatable.View
      animation="fadeIn"
      duration={600}
      delay={animationDelay}
      style={styles.levelSection}
    >
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>{levelDisplayText}</Text>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  levelSection: {
    marginBottom: 16,
  },
  levelContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  levelText: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textAlign: "center",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default LevelTitleHeader;
